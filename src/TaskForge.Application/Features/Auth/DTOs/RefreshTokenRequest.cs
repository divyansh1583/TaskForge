namespace TaskForge.Application.Features.Auth.DTOs;

/// <summary>
/// DTO for refresh token request.
/// </summary>
public class RefreshTokenRequest
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
