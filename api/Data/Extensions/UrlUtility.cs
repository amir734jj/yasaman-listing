namespace Data.Extensions;

/// <summary>
/// Parses a database URL (e.g. <c>postgres://user:pass@host:5432/dbname?application_name=app</c>)
/// into its component parts.
/// </summary>
public static class UrlUtility
{
    public static IReadOnlyDictionary<string, string> UrlToResource(string url)
    {
        var uri = new Uri(url);
        var userInfo = uri.UserInfo.Split(':', 2);

        var table = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["Host"] = uri.Host,
            ["Port"] = (uri.Port > 0 ? uri.Port : 5432).ToString(),
            ["Username"] = Uri.UnescapeDataString(userInfo.ElementAtOrDefault(0) ?? string.Empty),
            ["Password"] = Uri.UnescapeDataString(userInfo.ElementAtOrDefault(1) ?? string.Empty),
            ["Database"] = uri.AbsolutePath.TrimStart('/'),
            ["ApplicationName"] = "yasaman-listing"
        };

        foreach (var pair in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var kv = pair.Split('=', 2);
            var key = Uri.UnescapeDataString(kv[0]);
            var value = kv.Length > 1 ? Uri.UnescapeDataString(kv[1]) : string.Empty;

            if (key.Equals("application_name", StringComparison.OrdinalIgnoreCase))
            {
                table["ApplicationName"] = value;
            }
            else
            {
                table[key] = value;
            }
        }

        return table;
    }
}
