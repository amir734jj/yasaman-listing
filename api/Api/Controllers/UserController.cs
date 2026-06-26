using Api.Extensions;
using Logic.Dtos.User;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Constants;

namespace Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = Roles.Admin)]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _userService.GetAllAsync(cancellationToken));
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult<UserDto>> Activate(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userService.SetEnabledAsync(id, true, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<ActionResult<UserDto>> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        if (id == User.GetUserId())
        {
            return BadRequest(new { message = "You cannot deactivate your own account." });
        }

        var user = await _userService.SetEnabledAsync(id, false, cancellationToken);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        if (id == User.GetUserId())
        {
            return BadRequest(new { message = "You cannot delete your own account." });
        }

        var deleted = await _userService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
