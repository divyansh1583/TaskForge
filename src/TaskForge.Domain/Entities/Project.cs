using TaskForge.Domain.Common;
using TaskForge.Domain.Enums;

namespace TaskForge.Domain.Entities;

/// <summary>
/// Project entity representing a work project in the system.
/// WHY: Core aggregate root that owns Teams and Tasks, providing
/// the main organizational unit for work management.
/// </summary>
public class Project : BaseEntity, IAggregateRoot
{
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public ProjectStatus Status { get; set; } = ProjectStatus.Active;
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    /// <summary>
    /// The user who owns/created this project.
    /// WHY: Establishes ownership for authorization - managers can only
    /// manage their own projects.
    /// </summary>
    public string OwnerId { get; set; } = string.Empty;
    
    public ApplicationUser Owner { get; set; } = null!;
    
    /// <summary>
    /// Each project has exactly one team.
    /// WHY: Simplifies team management while allowing multiple members per project.
    /// </summary>
    public Team? Team { get; set; }
    
    public Guid? TeamId { get; set; }
}
