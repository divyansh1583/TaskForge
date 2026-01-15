namespace TaskForge.Application.DTOs.Auth;

/// <summary>
/// DTO for user information returned in responses.
/// WHY: Exposes only necessary user properties, hiding sensitive data
/// like password hashes and security stamps.
/// </summary>
public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
