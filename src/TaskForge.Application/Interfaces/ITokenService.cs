using System.Security.Claims;

namespace TaskForge.Application.Interfaces;

/// <summary>
/// Interface for JWT token operations.
/// WHY: Separates token generation/validation concerns, making it testable
/// and allowing easy swap of token generation strategies.
/// </summary>
public interface ITokenService
{
    string GenerateAccessToken(IEnumerable<Claim> claims);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    int GetAccessTokenExpirationMinutes();
}
