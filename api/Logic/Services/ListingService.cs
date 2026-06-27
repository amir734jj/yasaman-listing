using System.Linq.Expressions;
using EfCoreRepository.Extensions;
using EfCoreRepository.Interfaces;
using EfCoreRepository.Models;
using Logic.Dtos.Common;
using Logic.Dtos.Listing;
using Logic.Dtos.Storage;
using Logic.Interfaces;
using Microsoft.EntityFrameworkCore;
using Models.Entities;
using Models.Enums;

namespace Logic.Services;

public class ListingService : IListingService
{
    private const int MaxMediaPerListing = 10;

    // Media is served through the FileController proxy (api/files/{key}); the client never
    // receives a raw bucket URL, and the URL is derived from the stored object key.
    private const string MediaPathPrefix = "/api/files";

    private readonly IEfRepository _repository;
    private readonly IStorageService _storage;

    public ListingService(IEfRepository repository, IStorageService storage)
    {
        _repository = repository;
        _storage = storage;
    }

    private IBasicCrud<Listing> Listings() => _repository.For<Listing>();

    private IBasicCrud<ListingMedia> Media() => _repository.For<ListingMedia>();

    public async Task<PagedResult<ListingDto>> SearchAsync(ListingSearchRequest request, CancellationToken cancellationToken = default)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize is < 1 or > 100 ? 20 : request.PageSize;

        var filters = new List<Expression<Func<Listing, bool>>>();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            filters.Add(x =>
                x.Name.ToLower().Contains(term) ||
                x.Description.ToLower().Contains(term) ||
                x.Location.ToLower().Contains(term));
        }

        if (request.Status.HasValue)
        {
            var status = request.Status.Value;
            filters.Add(x => x.Status == status);
        }
        else
        {
            filters.Add(x => x.Status != ListingStatus.Unavailable);
        }

        var ordering = request.SortBy switch
        {
            ListingSortBy.PriceAsc => Ordering<Listing>.Asc(x => x.Price),
            ListingSortBy.PriceDesc => Ordering<Listing>.Desc(x => x.Price),
            _ => Ordering<Listing>.Desc(x => x.CreatedAt)
        };

        var filterArray = filters.ToArray();

        var total = await Listings().Count(filterArray);

        var items = (await Listings()
            .NoTracking()
            .GetAll(
                filterExprs: filterArray,
                orderBy: ordering,
                project: ToDto,
                skip: (page - 1) * pageSize,
                maxResults: pageSize))
            .ToList();

        return new PagedResult<ListingDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ListingDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var matches = await Listings()
            .NoTracking()
            .GetAll(filterExprs: [x => x.Id == id], project: ToDto);
        return matches.FirstOrDefault();
    }

    public async Task<ListingDto> CreateAsync(Guid ownerId, CreateListingRequest request, CancellationToken cancellationToken = default)
    {
        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Location = request.Location,
            Price = request.Price,
            Tags = request.Tags ?? new(),
            Status = ListingStatus.Available,
            OwnerId = ownerId,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        var saved = await Listings().Save(listing);
        return (await GetByIdAsync(saved.Id, cancellationToken))!;
    }

    public async Task<ListingDto?> UpdateAsync(Guid id, Guid userId, bool isAdmin, UpdateListingRequest request, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(id);
        if (listing is null) return null;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        await Listings().Update(id, x =>
        {
            x.Name = request.Name;
            x.Description = request.Description;
            x.Location = request.Location;
            x.Price = request.Price;
            x.Tags = request.Tags ?? new();
            x.UpdatedAt = DateTimeOffset.UtcNow;
        });

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<ListingDto?> MarkSoldAsync(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(id);
        if (listing is null) return null;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        await Listings().Update(id, x =>
        {
            x.Status = ListingStatus.Sold;
            x.SoldAt = DateTimeOffset.UtcNow;
            x.UpdatedAt = DateTimeOffset.UtcNow;
        });

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<ListingDto?> MarkAvailableAsync(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(id);
        if (listing is null) return null;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        await Listings().Update(id, x =>
        {
            x.Status = ListingStatus.Available;
            x.SoldAt = null;
            x.UpdatedAt = DateTimeOffset.UtcNow;
        });

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<ListingDto?> MarkUnavailableAsync(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(id);
        if (listing is null) return null;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        await Listings().Update(id, x =>
        {
            x.Status = ListingStatus.Unavailable;
            x.SoldAt = null;
            x.UpdatedAt = DateTimeOffset.UtcNow;
        });

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(id);
        if (listing is null) return false;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        foreach (var media in listing.Media)
        {
            await _storage.DeleteAsync(media.StorageKey, cancellationToken);
        }

        await Listings().Delete(id);
        return true;
    }

    public async Task<ListingMediaDto?> AddMediaAsync(Guid id, Guid userId, bool isAdmin, UploadFileRequest file, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(id);
        if (listing is null) return null;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        if (listing.Media.Count >= MaxMediaPerListing)
        {
            throw new InvalidOperationException($"A listing can have at most {MaxMediaPerListing} media files.");
        }

        var type = file.ContentType.StartsWith("video", StringComparison.OrdinalIgnoreCase)
            ? MediaType.Video
            : MediaType.Image;

        var uploaded = await _storage.UploadAsync(file, $"listings/{id}", cancellationToken);

        var media = new ListingMedia
        {
            Id = Guid.NewGuid(),
            ListingId = id,
            Type = type,
            StorageKey = uploaded.StorageKey,
            Order = listing.Media.Count,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var saved = await Media().Save(media);

        return new ListingMediaDto
        {
            Id = saved.Id,
            Type = saved.Type,
            Url = MediaPathPrefix + "/" + saved.StorageKey,
            Order = saved.Order
        };
    }

    public async Task<bool> RemoveMediaAsync(Guid listingId, Guid mediaId, Guid userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(listingId);
        if (listing is null) return false;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        var media = await Media().Get(mediaId);
        if (media is null || media.ListingId != listingId) return false;

        await _storage.DeleteAsync(media.StorageKey, cancellationToken);
        await Media().Delete(mediaId);
        return true;
    }

    private static void EnsureOwnerOrAdmin(Listing listing, Guid userId, bool isAdmin)
    {
        if (!isAdmin && listing.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("You do not have permission to modify this listing.");
        }
    }

    // EF-translatable projection: builds the DTO directly in SQL, selecting only the needed
    // columns (and the ordered media) instead of materializing entities and mapping in memory.
    private static readonly Expression<Func<Listing, ListingDto>> ToDto = listing => new ListingDto
    {
        Id = listing.Id,
        Name = listing.Name,
        Description = listing.Description,
        Location = listing.Location,
        Price = listing.Price,
        Tags = listing.Tags,
        Status = listing.Status,
        SoldAt = listing.SoldAt,
        CreatedAt = listing.CreatedAt,
        OwnerId = listing.OwnerId,
        OwnerName = listing.Owner.DisplayName ?? listing.Owner.Email,
        Media = listing.Media
            .OrderBy(m => m.Order)
            .Select(m => new ListingMediaDto
            {
                Id = m.Id,
                Type = m.Type,
                Url = MediaPathPrefix + "/" + m.StorageKey,
                Order = m.Order
            }).ToList()
    };
}
