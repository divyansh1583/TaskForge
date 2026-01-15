using System.ComponentModel.DataAnnotations;

namespace TaskForge.Application.DTOs.Auth;

/// <summary>
/// DTO for user login request.
/// </summary>
public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
