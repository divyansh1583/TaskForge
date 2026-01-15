using System.ComponentModel.DataAnnotations;

namespace TaskForge.Application.Features.Auth.DTOs;

/// <summary>
/// DTO for user registration request.
/// WHY: DTOs separate API contracts from domain entities, allowing 
/// independent evolution and preventing over-posting attacks.
/// </summary>
public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;
}
