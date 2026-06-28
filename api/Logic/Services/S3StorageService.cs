using Amazon.S3;
using Amazon.S3.Model;
using Logic.Configs;
using Logic.Constants;
using Logic.Dtos.Storage;
using Logic.Interfaces;
using Microsoft.Extensions.Logging;

namespace Logic.Services;

public class S3StorageService(IAmazonS3 client, S3Settings settings, ILogger<S3StorageService> logger)
    : IStorageService
{
    public async Task<Guid> UploadAsync(UploadFileRequest request, CancellationToken cancellationToken = default)
    {
        var fileId = Guid.NewGuid();
        var key = KeyFor(fileId);

        // AWS SDK v4 signs uploads with the chunked STREAMING-AWS4-HMAC-SHA256-PAYLOAD signature
        // by default, which most S3-compatible providers don't implement. Disabling payload
        // signing (UNSIGNED-PAYLOAD) avoids it; the SDK only allows this over HTTPS.
        var isHttps = string.IsNullOrEmpty(settings.ServiceUrl)
            || settings.ServiceUrl.StartsWith("https", StringComparison.OrdinalIgnoreCase);

        // PutObject needs a known Content-Length, so spool a forward-only stream to a temp file
        // (streamed to disk, not held in memory, auto-deleted on close).
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
            var put = new PutObjectRequest
            {
                BucketName = settings.BucketName,
                Key = key,
                InputStream = content,
                ContentType = request.ContentType,
                DisablePayloadSigning = isHttps,
                AutoCloseStream = false
            };

            foreach (var (metaKey, metaValue) in request.Metadata)
            {
                put.Metadata.Add(metaKey, metaValue);
            }

            await client.PutObjectAsync(put, cancellationToken);
        }
        finally
        {
            if (spooled is not null)
            {
                await spooled.DisposeAsync();
            }
        }

        return fileId;
    }

    public async Task<StorageObject?> GetAsync(Guid fileId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await client.GetObjectAsync(new GetObjectRequest
            {
                BucketName = settings.BucketName,
                Key = KeyFor(fileId)
            }, cancellationToken);

            var originalName = response.Metadata[MediaMetadataKeys.OriginalFilename];

            return new StorageObject
            {
                Content = response.ResponseStream,
                ContentType = response.Headers.ContentType
                    ?? response.Metadata[MediaMetadataKeys.ContentType]
                    ?? "application/octet-stream",
                FileName = string.IsNullOrEmpty(originalName) ? null : Uri.UnescapeDataString(originalName)
            };
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task<string?> GetContentTypeAsync(Guid fileId, CancellationToken cancellationToken = default)
    {
        try
        {
            var meta = await client.GetObjectMetadataAsync(new GetObjectMetadataRequest
            {
                BucketName = settings.BucketName,
                Key = KeyFor(fileId)
            }, cancellationToken);

            return meta.Headers.ContentType ?? meta.Metadata[MediaMetadataKeys.ContentType];
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    public async Task DeleteAsync(Guid fileId, CancellationToken cancellationToken = default)
    {
        try
        {
            await client.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = settings.BucketName,
                Key = KeyFor(fileId)
            }, cancellationToken);
        }
        catch (AmazonS3Exception ex)
        {
            logger.LogError(ex, "Failed deleting S3 object {FileId}", fileId);
        }
    }

    private static string KeyFor(Guid fileId) => $"media/{fileId:N}";
}
