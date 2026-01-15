using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Auth;
using TaskForge.Application.Interfaces;
using TaskForge.Domain.Entities;

namespace TaskForge.Infrastructure.Authentication;

/// <summary>
/// Implementation of authentication service using ASP.NET Core Identity.
/// WHY: Leverages battle-tested Identity framework while providing a clean
/// interface for the application layer.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly JwtSettings _jwtSettings;
    private readonly IDateTimeService _dateTimeService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        IOptions<JwtSettings> jwtSettings,
        IDateTimeService dateTimeService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _jwtSettings = jwtSettings.Value;
        _dateTimeService = dateTimeService;
    }

    public async Task<Result<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result<AuthResponse>.Failure("A user with this email already exists.", ResultErrorType.Validation);
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailConfirmed = true, // In production, implement email confirmation
            IsActive = true,
            CreatedAt = _dateTimeService.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return Result<AuthResponse>.Failure(
                result.Errors.Select(e => e.Description).ToList(), ResultErrorType.Validation);
        }

        // Assign default role (Member)
        await _userManager.AddToRoleAsync(user, Domain.Constants.Roles.Member);

        // Generate tokens
        return await GenerateAuthResponseAsync(user);
    }

    public async Task<Result<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            return Result<AuthResponse>.Failure("Invalid email or password.", ResultErrorType.Unauthorized);
        }

        if (!user.IsActive)
        {
            return Result<AuthResponse>.Failure("This account has been deactivated.", ResultErrorType.Forbidden);
        }

        if (user.IsDeleted)
        {
            return Result<AuthResponse>.Failure("Invalid email or password.", ResultErrorType.Unauthorized);
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);

        if (result.IsLockedOut)
        {
            return Result<AuthResponse>.Failure("Account is locked. Please try again later.", ResultErrorType.Forbidden);
        }

        if (!result.Succeeded)
        {
            return Result<AuthResponse>.Failure("Invalid email or password.", ResultErrorType.Unauthorized);
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<Result<AuthResponse>> RefreshTokenAsync(RefreshTokenRequest request)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken);

        if (principal == null)
        {
            return Result<AuthResponse>.Failure("Invalid access token.", ResultErrorType.Unauthorized);
        }

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Result<AuthResponse>.Failure("Invalid access token.", ResultErrorType.Unauthorized);
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null || user.IsDeleted || !user.IsActive)
        {
            return Result<AuthResponse>.Failure("User not found or inactive.", ResultErrorType.Unauthorized);
        }

        if (user.RefreshToken != request.RefreshToken)
        {
            return Result<AuthResponse>.Failure("Invalid refresh token.", ResultErrorType.Unauthorized);
        }

        if (user.RefreshTokenExpiryTime <= _dateTimeService.UtcNow)
        {
            return Result<AuthResponse>.Failure("Refresh token has expired.", ResultErrorType.Unauthorized);
        }

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<Result<bool>> RevokeTokenAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return Result<bool>.Failure("User not found.", ResultErrorType.NotFound);
        }

        user.RefreshToken = null;
        user.RefreshTokenExpiryTime = null;

        await _userManager.UpdateAsync(user);

        return Result<bool>.Success(true);
    }

    public async Task<Result<UserDto>> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null || user.IsDeleted)
        {
            return Result<UserDto>.Failure("User not found.", ResultErrorType.NotFound);
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Result<UserDto>.Success(MapToUserDto(user, roles.ToList()));
    }

    private async Task<Result<AuthResponse>> GenerateAuthResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var claims = GenerateClaims(user, roles);

        var accessToken = _tokenService.GenerateAccessToken(claims);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Store refresh token in database
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = _dateTimeService.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays);
        await _userManager.UpdateAsync(user);

        var response = new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiration = _dateTimeService.UtcNow.AddMinutes(_tokenService.GetAccessTokenExpirationMinutes()),
            User = MapToUserDto(user, roles.ToList())
        };

        return Result<AuthResponse>.Success(response);
    }

    private static List<Claim> GenerateClaims(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
            new("firstName", user.FirstName),
            new("lastName", user.LastName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        return claims;
    }

    private static UserDto MapToUserDto(ApplicationUser user, List<string> roles)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Roles = roles,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}

// Extension for JwtRegisteredClaimNames
file static class JwtRegisteredClaimNames
{
    public const string Jti = "jti";
}
