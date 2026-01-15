namespace TaskForge.Application.Interfaces;

/// <summary>
/// Interface for accessing current user information.
/// WHY: Provides a clean way to access current user context throughout
/// the application without directly depending on HttpContext.
/// </summary>
public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    IEnumerable<string> Roles { get; }
    bool IsInRole(string role);
}
