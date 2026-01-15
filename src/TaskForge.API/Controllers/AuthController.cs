using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskForge.Application.Features.Auth.DTOs;
using TaskForge.Application.Interfaces;

namespace TaskForge.API.Controllers;

/// <summary>
/// Authentication controller handling user registration, login, and token management.
/// </summary>
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IValidator<RefreshTokenRequest> _refreshTokenValidator;

    public AuthController(
        IAuthService authService,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator,
        IValidator<RefreshTokenRequest> refreshTokenValidator)
    {
        _authService = authService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
        _refreshTokenValidator = refreshTokenValidator;
    }

    /// <summary>
    /// Register a new user account.
    /// </summary>
    /// <param name="request">Registration details</param>
    /// <returns>Authentication response with tokens</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var validationResult = await _registerValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ErrorResponse
            {
                Type = "ValidationError",
                Title = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest,
                Errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
            });
        }

        var result = await _authService.RegisterAsync(request);

        if (!result.Succeeded)
        {
            return BadRequest(new ErrorResponse
            {
                Type = "RegistrationError",
                Title = "Registration failed.",
                Status = StatusCodes.Status400BadRequest,
                Errors = new Dictionary<string, string[]>
                {
                    { "General", result.Errors.ToArray() }
                }
            });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Authenticate user and return tokens.
    /// </summary>
    /// <param name="request">Login credentials</param>
    /// <returns>Authentication response with tokens</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var validationResult = await _loginValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ErrorResponse
            {
                Type = "ValidationError",
                Title = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest,
                Errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
            });
        }

        var result = await _authService.LoginAsync(request);

        if (!result.Succeeded)
        {
            return Unauthorized(new ErrorResponse
            {
                Type = "AuthenticationError",
                Title = result.Errors.FirstOrDefault() ?? "Authentication failed.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Refresh access token using refresh token.
    /// </summary>
    /// <param name="request">Current tokens</param>
    /// <returns>New authentication response with tokens</returns>
    [HttpPost("refresh-token")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var validationResult = await _refreshTokenValidator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new ErrorResponse
            {
                Type = "ValidationError",
                Title = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest,
                Errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
            });
        }

        var result = await _authService.RefreshTokenAsync(request);

        if (!result.Succeeded)
        {
            return Unauthorized(new ErrorResponse
            {
                Type = "TokenError",
                Title = result.Errors.FirstOrDefault() ?? "Token refresh failed.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// Revoke refresh token (logout).
    /// </summary>
    /// <returns>Success message</returns>
    [HttpPost("revoke-token")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RevokeToken()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var result = await _authService.RevokeTokenAsync(userId);

        if (!result.Succeeded)
        {
            return BadRequest(new ErrorResponse
            {
                Type = "TokenError",
                Title = result.Errors.FirstOrDefault() ?? "Token revocation failed.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        return Ok(new { message = result.Message });
    }

    /// <summary>
    /// Get current authenticated user information.
    /// </summary>
    /// <returns>Current user details</returns>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var result = await _authService.GetCurrentUserAsync(userId);

        if (!result.Succeeded)
        {
            return NotFound(new ErrorResponse
            {
                Type = "NotFound",
                Title = result.Errors.FirstOrDefault() ?? "User not found.",
                Status = StatusCodes.Status404NotFound
            });
        }

        return Ok(result.Data);
    }
}

/// <summary>
/// Error response class for consistent API error format.
/// </summary>
public class ErrorResponse
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Status { get; set; }
    public string? Detail { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }
}
