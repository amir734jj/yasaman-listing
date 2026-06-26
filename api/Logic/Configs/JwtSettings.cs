namespace Logic.Configs;

public class JwtSettings
{
    public string Issuer { get; set; } = "yasaman-listing";
    public string Audience { get; set; } = "yasaman-listing";
    public string Key { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 1440;
}
