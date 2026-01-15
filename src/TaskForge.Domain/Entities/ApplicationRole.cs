using Microsoft.AspNetCore.Identity;

namespace TaskForge.Domain.Entities;

/// <summary>
/// Application role entity extending ASP.NET Core Identity roles.
/// WHY: Allows adding custom properties to roles while maintaining 
/// Identity framework compatibility.
/// </summary>
public class ApplicationRole : IdentityRole
{
    public string? Description { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public ApplicationRole() : base()
    {
    }
    
    public ApplicationRole(string roleName) : base(roleName)
    {
    }
    
    public ApplicationRole(string roleName, string description) : base(roleName)
    {
        Description = description;
    }
}
