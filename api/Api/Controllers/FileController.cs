using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

/// <summary>
/// Proxies listing media from the (private) object store so clients never receive raw bucket URLs.
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

    [HttpGet("{**key}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get(string key, CancellationToken cancellationToken)
    {
        var file = await _storage.GetAsync(key, cancellationToken);
        if (file is null)
        {
            return NotFound();
        }

        return File(file.Content, file.ContentType);
    }
}
