using TaskForge.Application.Common.Models;
using TaskForge.Application.Features.Auth.DTOs;

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
    Task<Result> RevokeTokenAsync(string userId);
    Task<Result<UserDto>> GetCurrentUserAsync(string userId);
}
