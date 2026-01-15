using Microsoft.AspNetCore.Identity;

namespace TaskForge.Domain.Entities;

/// <summary>
/// Application user entity extending ASP.NET Core Identity.
/// WHY: Extends IdentityUser to add custom properties while leveraging 
/// built-in authentication/authorization features.
/// </summary>
public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    
    public string LastName { get; set; } = string.Empty;
    
    public string FullName => $"{FirstName} {LastName}";
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public string? RefreshToken { get; set; }
    
    public DateTime? RefreshTokenExpiryTime { get; set; }
    
    /// <summary>
    /// Soft delete support for users.
    /// WHY: Users may need to be deactivated but historical data should be preserved.
    /// </summary>
    public bool IsDeleted { get; set; }
    
    public DateTime? DeletedAt { get; set; }
}
