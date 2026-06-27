using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace Api.Controllers;

/// <summary>
/// Proxies listing media from the (private) object store. Each file is addressed by its id; the
/// object's mime type (and other info) is stored as S3 metadata and reconstructed on the response.
/// </summary>
[ApiController]
[Route("api/files")]
public class FileController : ControllerBase
{
    private const int ThumbnailMaxSize = 400;

    private readonly IStorageService _storage;

    public FileController(IStorageService storage)
    {
        _storage = storage;
    }

    [HttpGet("{fileId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get(Guid fileId, [FromQuery] bool thumb, CancellationToken cancellationToken)
    {
        var file = await _storage.GetAsync(fileId, cancellationToken);
        if (file is null)
        {
            return NotFound();
        }

        if (thumb && file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
            && !file.ContentType.Contains("svg", StringComparison.OrdinalIgnoreCase)
            && !file.ContentType.Contains("gif", StringComparison.OrdinalIgnoreCase))
        {
            var thumbnail = await TryCreateThumbnailAsync(file.Content, cancellationToken);
            if (thumbnail is not null)
            {
                Response.Headers.CacheControl = "public, max-age=86400";
                return File(thumbnail, "image/jpeg");
            }

            // Decoding failed; fall back to the original file fetched fresh.
            file = await _storage.GetAsync(fileId, cancellationToken);
            if (file is null)
            {
                return NotFound();
            }
        }

        if (!string.IsNullOrEmpty(file.FileName))
        {
            Response.Headers.ContentDisposition = $"inline; filename=\"{Uri.EscapeDataString(file.FileName)}\"";
        }

        return File(file.Content, file.ContentType);
    }

    private static async Task<byte[]?> TryCreateThumbnailAsync(Stream content, CancellationToken cancellationToken)
    {
        try
        {
            using var image = await Image.LoadAsync(content, cancellationToken);
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Mode = ResizeMode.Max,
                Size = new Size(ThumbnailMaxSize, ThumbnailMaxSize),
            }));

            using var output = new MemoryStream();
            await image.SaveAsJpegAsync(output, new JpegEncoder { Quality = 70 }, cancellationToken);
            return output.ToArray();
        }
        catch
        {
            return null;
        }
    }

    [HttpHead("{fileId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Head(Guid fileId, CancellationToken cancellationToken)
    {
        var contentType = await _storage.GetContentTypeAsync(fileId, cancellationToken);
        if (contentType is null)
        {
            return NotFound();
        }

        Response.ContentType = contentType;
        return Ok();
    }
}
