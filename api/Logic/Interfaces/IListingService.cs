using Logic.Dtos.Common;
using Logic.Dtos.Listing;
using Logic.Dtos.Storage;

namespace Logic.Interfaces;

public interface IListingService
{
    Task<PagedResult<ListingDto>> SearchAsync(ListingSearchRequest request, CancellationToken cancellationToken = default);

    Task<ListingDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ListingDto> CreateAsync(Guid ownerId, CreateListingRequest request, CancellationToken cancellationToken = default);

    Task<ListingDto?> UpdateAsync(Guid id, Guid userId, bool isAdmin, UpdateListingRequest request, CancellationToken cancellationToken = default);

    Task<ListingDto?> MarkSoldAsync(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default);

    Task<ListingDto?> MarkAvailableAsync(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default);

    Task<ListingDto?> MarkUnavailableAsync(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default);

    Task<Guid?> AddMediaAsync(Guid id, Guid userId, bool isAdmin, UploadFileRequest file, CancellationToken cancellationToken = default);

    Task<bool> RemoveMediaAsync(Guid listingId, Guid fileId, Guid userId, bool isAdmin, CancellationToken cancellationToken = default);

    Task<bool> ReorderMediaAsync(Guid listingId, IReadOnlyList<Guid> orderedFileIds, Guid userId, bool isAdmin, CancellationToken cancellationToken = default);
}
