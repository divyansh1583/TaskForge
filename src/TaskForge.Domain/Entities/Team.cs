using TaskForge.Domain.Common;

namespace TaskForge.Domain.Entities;

/// <summary>
/// Team entity representing a group of users working on a project.
/// WHY: Enables grouping users for a project with defined roles,
/// supporting team-based authorization and collaboration.
/// </summary>
public class Team : BaseEntity, IAggregateRoot
{
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    /// <summary>
    /// The project this team belongs to.
    /// WHY: One-to-one relationship ensures each project has a dedicated team.
    /// </summary>
    public Project Project { get; set; } = null!;
    
    public Guid ProjectId { get; set; }
    
    /// <summary>
    /// Members of this team.
    /// WHY: Many-to-many relationship via TeamMember allows users
    /// to be in multiple teams with different roles.
    /// </summary>
    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
}
