using Api.Extensions;
using Serilog.Core;
using Serilog.Events;

namespace Api.Logging;

/// <summary>
/// Serilog enricher that adds the current authenticated user's username (and id) to every log event.
/// </summary>
public class UsernameEnricher(IHttpContextAccessor httpContextAccessor) : ILogEventEnricher
{
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity is not { IsAuthenticated: true })
        {
            return;
        }

        var username = user.GetUsername();
        if (!string.IsNullOrEmpty(username))
        {
            logEvent.AddOrUpdateProperty(propertyFactory.CreateProperty("User", username));
        }

        var userId = user.GetUserId();
        if (userId != Guid.Empty)
        {
            logEvent.AddOrUpdateProperty(propertyFactory.CreateProperty("UserId", userId));
        }
    }
}
