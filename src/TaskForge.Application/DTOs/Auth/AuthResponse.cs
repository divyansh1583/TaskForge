namespace TaskForge.Application.DTOs.Auth;

/// <summary>
/// DTO for authentication response containing tokens.
/// WHY: Returns both access token (short-lived) and refresh token (long-lived)
/// for secure, stateless authentication with token renewal capability.
/// </summary>
public class AuthResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiration { get; set; }
    public UserDto User { get; set; } = null!;
}
