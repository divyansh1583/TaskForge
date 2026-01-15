namespace TaskForge.Infrastructure.Authentication;

/// <summary>
/// JWT configuration settings.
/// WHY: Strongly-typed configuration is safer and more maintainable than
/// accessing configuration values directly with magic strings.
/// </summary>
public class JwtSettings
{
    public const string SectionName = "JwtSettings";
    
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; set; } = 15;
    public int RefreshTokenExpirationDays { get; set; } = 7;
}
