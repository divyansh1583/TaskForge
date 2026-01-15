using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Auth;

namespace TaskForge.Application.Interfaces;

/// <summary>
/// Interface for authentication service.
/// WHY: Abstracts authentication implementation, allowing the Application layer
/// to depend on abstractions rather than concrete implementations (DIP).
/// </summary>
public interface IAuthService
{
    Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<Result<AuthResponse>> LoginAsync(LoginRequest request);
    Task<Result<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request);
    Task<Result<bool>> RevokeTokenAsync(string userId);
    Task<Result<UserDto>> GetCurrentUserAsync(string userId);
}
