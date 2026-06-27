using System.Linq.Expressions;
using EfCoreRepository.Extensions;
using EfCoreRepository.Interfaces;
using EfCoreRepository.Models;
using Logic.Constants;
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

    private readonly IEfRepository _repository;
    private readonly IStorageService _storage;

    public ListingService(IEfRepository repository, IStorageService storage)
    {
        _repository = repository;
        _storage = storage;
    }

    private IBasicCrud<Listing> Listings() => _repository.For<Listing>();

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

        if (request.OwnerId.HasValue)
        {
            var ownerId = request.OwnerId.Value;
            filters.Add(x => x.OwnerId == ownerId);
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

        foreach (var fileId in listing.MediaFileIds)
        {
            await _storage.DeleteAsync(fileId, cancellationToken);
        }

        await Listings().Delete(id);
        return true;
    }

    public async Task<Guid?> AddMediaAsync(Guid id, Guid userId, bool isAdmin, UploadFileRequest file, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(id);
        if (listing is null) return null;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        if (listing.MediaFileIds.Count >= MaxMediaPerListing)
        {
            throw new InvalidOperationException($"A listing can have at most {MaxMediaPerListing} media files.");
        }

        // Attach listing info and the file's MIME type as object metadata. Free-text values are
        // URL-encoded so non-ASCII (e.g. Farsi) names are valid S3 metadata.
        file.Metadata[MediaMetadataKeys.ListingId] = id.ToString();
        file.Metadata[MediaMetadataKeys.ListingName] = Uri.EscapeDataString(listing.Name);
        file.Metadata[MediaMetadataKeys.OwnerId] = listing.OwnerId.ToString();
        file.Metadata[MediaMetadataKeys.UploadedBy] = userId.ToString();
        file.Metadata[MediaMetadataKeys.UploadedAt] = DateTimeOffset.UtcNow.ToString("o");
        file.Metadata[MediaMetadataKeys.ContentType] = file.ContentType;
        file.Metadata[MediaMetadataKeys.OriginalFilename] = Uri.EscapeDataString(file.FileName);

        var fileId = await _storage.UploadAsync(file, cancellationToken);

        await Listings().Update(id, x =>
        {
            x.MediaFileIds = [.. x.MediaFileIds, fileId];
            x.UpdatedAt = DateTimeOffset.UtcNow;
        });

        return fileId;
    }

    public async Task<bool> RemoveMediaAsync(Guid listingId, Guid fileId, Guid userId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var listing = await Listings().Get(listingId);
        if (listing is null) return false;
        EnsureOwnerOrAdmin(listing, userId, isAdmin);

        if (!listing.MediaFileIds.Contains(fileId)) return false;

        await _storage.DeleteAsync(fileId, cancellationToken);

        await Listings().Update(listingId, x =>
        {
            x.MediaFileIds = x.MediaFileIds.Where(f => f != fileId).ToList();
            x.UpdatedAt = DateTimeOffset.UtcNow;
        });

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
        Media = listing.MediaFileIds
    };
}
