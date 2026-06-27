using Amazon.S3;
using Amazon.S3.Model;
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

        // S3-compatible providers reject the chunked STREAMING-AWS4-HMAC-SHA256-PAYLOAD signature
        // used for forward-only streams. Spool the upload to a temp file (streamed to disk, not
        // held in memory, auto-deleted on close) so the SDK gets a seekable stream and signs the
        // payload normally.
        Stream content = request.Content;
        FileStream? spooled = null;
        if (!content.CanSeek)
        {
            spooled = new FileStream(
                Path.GetTempFileName(),
                FileMode.Create, FileAccess.ReadWrite, FileShare.None,
                bufferSize: 81920,
                FileOptions.Asynchronous | FileOptions.DeleteOnClose);

            await content.CopyToAsync(spooled, cancellationToken);
            await spooled.FlushAsync(cancellationToken);
            spooled.Position = 0;
            content = spooled;
        }

        try
        {
            await _client.PutObjectAsync(new PutObjectRequest
            {
                BucketName = _settings.BucketName,
                Key = key,
                InputStream = content,
                ContentType = request.ContentType,
                AutoCloseStream = false
            }, cancellationToken);
        }
        finally
        {
            if (spooled is not null)
            {
                await spooled.DisposeAsync();
            }
        }

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
