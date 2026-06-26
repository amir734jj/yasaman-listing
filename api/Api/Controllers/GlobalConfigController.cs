using Logic.Dtos.GlobalConfig;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Constants;

namespace Api.Controllers;

[ApiController]
[Route("api/global-config")]
[Authorize(Roles = Roles.Admin)]
public class GlobalConfigController : ControllerBase
{
    private readonly IGlobalConfigService _globalConfigService;

    public GlobalConfigController(IGlobalConfigService globalConfigService)
    {
        _globalConfigService = globalConfigService;
    }

    [HttpGet]
    public async Task<ActionResult<GlobalConfigModel>> Get()
    {
        return Ok(await _globalConfigService.GetAllAsync());
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<Dictionary<string, object>>> GetPublic()
    {
        return Ok(await _globalConfigService.GetPublicAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Update([FromBody] GlobalConfigModel config)
    {
        await _globalConfigService.UpdateAsync(config);
        return Ok(new { message = "Global config updated." });
    }
}
