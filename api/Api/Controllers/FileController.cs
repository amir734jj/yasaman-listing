using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

/// <summary>
/// Proxies listing media from the (private) object store. Each file is addressed by its id; the
/// object's mime type (and other info) is stored as S3 metadata and reconstructed on the response.
/// </summary>
[ApiController]
[Route("api/files")]
public class FileController : ControllerBase
{
    private readonly IStorageService _storage;

    public FileController(IStorageService storage)
    {
        _storage = storage;
    }

    [HttpGet("{fileId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get(Guid fileId, CancellationToken cancellationToken)
    {
        var file = await _storage.GetAsync(fileId, cancellationToken);
        if (file is null)
        {
            return NotFound();
        }

        if (!string.IsNullOrEmpty(file.FileName))
        {
            Response.Headers.ContentDisposition = $"inline; filename=\"{Uri.EscapeDataString(file.FileName)}\"";
        }

        return File(file.Content, file.ContentType);
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
