using Data.Extensions;
using Npgsql;

namespace Data.Utilities;

/// <summary>
/// Converts a database URL (e.g. <c>postgres://user:pass@host:5432/dbname</c>) into an Npgsql
/// connection string. Same approach used across the other services in this repo.
/// </summary>
public static class ConnectionStringUtility
{
    public static string ConnectionStringUrlToPgResource(string connectionStringUrl, Action<NpgsqlConnectionStringBuilder>? action = null)
    {
        var table = UrlUtility.UrlToResource(connectionStringUrl);

        if (!table.ContainKeys("Host", "Username", "Password", "Database", "ApplicationName")) return string.Empty;

        if (!int.TryParse(table["Port"], out var port) || port <= 0) port = 5432;

        var connectionStringBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = table["Host"],
            Username = table["Username"],
            Password = table["Password"],
            Database = table["Database"],
            ApplicationName = table["ApplicationName"],
            SslMode = SslMode.Prefer,
            Pooling = true,
            // Hard limit
            MaxPoolSize = 5,
            Port = port,
            CommandTimeout = 0,
            Timeout = (int)TimeSpan.FromMinutes(1).TotalSeconds
        };

        (action ?? (_ => { }))(connectionStringBuilder);

        return connectionStringBuilder.ToString();
    }
}
