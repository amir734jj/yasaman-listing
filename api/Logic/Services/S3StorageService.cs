using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Logic.Configs;
using Logic.Dtos.Storage;
using Logic.Interfaces;
using Microsoft.Extensions.Logging;

namespace Logic.Services;

public class S3StorageService : IStorageService
{
    private readonly IAmazonS3 _client;
    private readonly S3Settings _settings;
    private readonly ILogger<S3StorageService> _logger;

    public S3StorageService(IAmazonS3 client, S3Settings settings, ILogger<S3StorageService> logger)
    {
        _client = client;
        _settings = settings;
        _logger = logger;
    }

    public async Task<UploadedFile> UploadAsync(UploadFileRequest request, string keyPrefix, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(request.FileName);
        var key = $"{keyPrefix.Trim('/')}/{Guid.NewGuid():N}{extension}";

        // TransferUtility streams the (forward-only, unknown-length) upload to the bucket using a
        // multipart upload, so memory stays bounded by the part size instead of the whole file.
        using var transfer = new TransferUtility(_client);
        var upload = new TransferUtilityUploadRequest
        {
            BucketName = _settings.BucketName,
            Key = key,
            InputStream = request.Content,
            ContentType = request.ContentType,
            AutoCloseStream = false
        };

        await transfer.UploadAsync(upload, cancellationToken);

        return new UploadedFile
        {
            StorageKey = key
        };
    }

    public async Task<StorageObject?> GetAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _client.GetObjectAsync(new GetObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = storageKey
            }, cancellationToken);

            return new StorageObject
            {
                Content = response.ResponseStream,
                ContentType = response.Headers.ContentType ?? "application/octet-stream"
            };
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        try
        {
            await _client.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = storageKey
            }, cancellationToken);
        }
        catch (AmazonS3Exception ex)
        {
            _logger.LogError(ex, "Failed deleting S3 object {Key}", storageKey);
        }
    }
}
