using Logic.Dtos.Storage;

namespace Logic.Interfaces;

public interface IStorageService
{
    Task<Guid> UploadAsync(UploadFileRequest request, CancellationToken cancellationToken = default);

    Task<StorageObject?> GetAsync(Guid fileId, CancellationToken cancellationToken = default);

    Task<string?> GetContentTypeAsync(Guid fileId, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid fileId, CancellationToken cancellationToken = default);
}
