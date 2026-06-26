using System.Reflection;
using Logic.Attributes;

namespace Logic.Dtos.GlobalConfig;

/// <summary>
/// Strongly-typed view over the <c>GlobalConfig</c> key/value rows. Each property is mapped to a
/// storage key via <see cref="GlobalConfigColAttribute"/>; read-only properties are computed.
/// </summary>
public class GlobalConfigModel
{
    [GlobalConfigCol(Name = "SITE_NAME", Public = true)]
    public string SiteName { get; set; } = string.Empty;

    [GlobalConfigCol(Name = "CONTACT_EMAIL", Public = true)]
    public string ContactEmail { get; set; } = string.Empty;

    [GlobalConfigCol(Name = "LISTING_EXPIRY_DAYS")]
    public int ListingExpiryDays { get; set; }

    [GlobalConfigCol(Name = "MAX_MEDIA_PER_LISTING")]
    public int MaxMediaPerListing { get; set; }

    [GlobalConfigCol(Name = "BUILD_DATE", Public = true, ReadOnly = true)]
    public string BuildDate => GetAssemblyBuild();

    private static string GetAssemblyBuild()
    {
        var buildDate = Assembly
            .GetExecutingAssembly()
            .GetCustomAttributes<AssemblyMetadataAttribute>()
            .Where(a => a.Key == "BuildDate")
            .Select(a => a.Value)
            .FirstOrDefault();

        return buildDate ?? DateTimeOffset.UtcNow.ToString("o");
    }
}
