using Logic.Dtos.GlobalConfig;
using Logic.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.Constants;

namespace Api.Controllers;

[ApiController]
[Route("api/global-config")]
[Authorize(Roles = Roles.Admin)]
public class GlobalConfigController(IGlobalConfigService globalConfigService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<GlobalConfigModel>> Get()
    {
        return Ok(await globalConfigService.GetAllAsync());
    }

    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<Dictionary<string, object>>> GetPublic()
    {
        return Ok(await globalConfigService.GetPublicAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Update([FromBody] GlobalConfigModel config)
    {
        await globalConfigService.UpdateAsync(config);
        return Ok(new { message = "Global config updated." });
    }
}
