using Api.Extensions;
using Api.Filters;
using Api.Streaming;
using Logic.Dtos.Common;
using Logic.Dtos.Listing;
using Logic.Dtos.Storage;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;
using Models.Enums;

namespace Api.Controllers;

[ApiController]
[Route("api/listings")]
public class ListingController(IListingService listingService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<ListingDto>>> Search(
        [FromQuery] string? search,
        [FromQuery] ListingStatus? status,
        [FromQuery] Guid? ownerId,
        [FromQuery] ListingSortBy sortBy = ListingSortBy.MostRecent,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var request = new ListingSearchRequest
        {
            Search = search,
            Status = status,
            OwnerId = ownerId,
            SortBy = sortBy,
            Page = page,
            PageSize = pageSize
        };
        return Ok(await listingService.SearchAsync(request, cancellationToken));
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ListingDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var listing = await listingService.GetByIdAsync(id, cancellationToken);
        return listing is null ? NotFound() : Ok(listing);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ListingDto>> Create([FromBody] CreateListingRequest request, CancellationToken cancellationToken)
    {
        var listing = await listingService.CreateAsync(User.GetUserId(), request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = listing.Id }, listing);
    }

    [HttpPut("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ListingDto>> Update(Guid id, [FromBody] UpdateListingRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var listing = await listingService.UpdateAsync(id, User.GetUserId(), User.IsAdmin(), request, cancellationToken);
            return listing is null ? NotFound() : Ok(listing);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost("{id:guid}/sold")]
    [Authorize]
    public async Task<ActionResult<ListingDto>> MarkSold(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var listing = await listingService.MarkSoldAsync(id, User.GetUserId(), User.IsAdmin(), cancellationToken);
            return listing is null ? NotFound() : Ok(listing);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("{id:guid}/available")]
    [Authorize]
    public async Task<ActionResult<ListingDto>> MarkAvailable(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var listing = await listingService.MarkAvailableAsync(id, User.GetUserId(), User.IsAdmin(), cancellationToken);
            return listing is null ? NotFound() : Ok(listing);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("{id:guid}/unavailable")]
    [Authorize]
    public async Task<ActionResult<ListingDto>> MarkUnavailable(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var listing = await listingService.MarkUnavailableAsync(id, User.GetUserId(), User.IsAdmin(), cancellationToken);
            return listing is null ? NotFound() : Ok(listing);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await listingService.DeleteAsync(id, User.GetUserId(), User.IsAdmin(), cancellationToken);
            return deleted ? NoContent() : NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    private const long MaxImageBytes = 10 * 1024 * 1024;   // 10 MB
    private const long MaxVideoBytes = 50 * 1024 * 1024;   // 50 MB

    [HttpPost("{id:guid}/media")]
    [Authorize]
    [RequestSizeLimit(MaxVideoBytes)]
    [DisableFormValueModelBinding]
    public async Task<IActionResult> AddMedia(Guid id, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(Request.ContentType)
            || !Request.ContentType.Contains("multipart/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = "A multipart/form-data request with a file is required." });
        }

        var boundary = HeaderUtilities.RemoveQuotes(MediaTypeHeaderValue.Parse(Request.ContentType).Boundary).Value;
        if (string.IsNullOrEmpty(boundary))
        {
            return BadRequest(new { message = "Missing multipart boundary." });
        }

        var reader = new MultipartReader(boundary, Request.Body);
        var section = await reader.ReadNextSectionAsync(cancellationToken);

        while (section is not null)
        {
            if (ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var disposition)
                && disposition.DispositionType.Equals("form-data")
                && !string.IsNullOrEmpty(disposition.FileName.Value))
            {
                var contentType = section.ContentType ?? string.Empty;
                var isImage = contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
                var isVideo = contentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase);
                if (!isImage && !isVideo)
                {
                    return BadRequest(new { message = "Only image and video files are allowed." });
                }

                var maxBytes = isVideo ? MaxVideoBytes : MaxImageBytes;

                try
                {
                    // Wrap the raw multipart section so it streams directly to storage, enforcing the
                    // size cap as bytes flow through instead of buffering the whole file first.
                    await using var limited = new LimitedStream(section.Body, maxBytes);
                    var upload = new UploadFileRequest
                    {
                        Content = limited,
                        FileName = disposition.FileName.Value,
                        ContentType = contentType
                    };
                    var fileId = await listingService.AddMediaAsync(id, User.GetUserId(), User.IsAdmin(), upload, cancellationToken);
                    return fileId is null
                        ? NotFound()
                        : Ok(new { id = fileId, url = $"/api/files/{fileId}" });
                }
                catch (UnauthorizedAccessException)
                {
                    return Forbid();
                }
                catch (InvalidOperationException ex)
                {
                    return BadRequest(new { message = ex.Message });
                }
            }

            section = await reader.ReadNextSectionAsync(cancellationToken);
        }

        return BadRequest(new { message = "A non-empty file is required." });
    }

    [HttpDelete("{id:guid}/media/{fileId:guid}")]
    [Authorize]
    public async Task<IActionResult> RemoveMedia(Guid id, Guid fileId, CancellationToken cancellationToken)
    {
        try
        {
            var removed = await listingService.RemoveMediaAsync(id, fileId, User.GetUserId(), User.IsAdmin(), cancellationToken);
            return removed ? NoContent() : NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}/media/order")]
    [Authorize]
    public async Task<IActionResult> ReorderMedia(Guid id, [FromBody] ReorderMediaRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var reordered = await listingService.ReorderMediaAsync(id, request.MediaIds, User.GetUserId(), User.IsAdmin(), cancellationToken);
            return reordered ? NoContent() : NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
