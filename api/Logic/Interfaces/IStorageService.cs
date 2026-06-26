using Logic.Dtos.Storage;

namespace Logic.Interfaces;

public interface IStorageService
{
    Task<UploadedFile> UploadAsync(UploadFileRequest request, string keyPrefix, CancellationToken cancellationToken = default);

    Task<StorageObject?> GetAsync(string storageKey, CancellationToken cancellationToken = default);

    Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default);
}
