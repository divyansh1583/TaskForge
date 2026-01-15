namespace TaskForge.Application.DTOs.Auth;

/// <summary>
/// DTO for refresh token request.
/// </summary>
public class RefreshTokenRequest
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
