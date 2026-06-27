using System.Security.Claims;
using Models.Constants;

namespace Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(value, out var id) ? id : Guid.Empty;
    }

    public static bool IsAdmin(this ClaimsPrincipal principal) => principal.IsInRole(Roles.Admin);

    public static string? GetUsername(this ClaimsPrincipal principal) =>
        principal.FindFirstValue(ClaimTypes.Email) ?? principal.Identity?.Name;
}
