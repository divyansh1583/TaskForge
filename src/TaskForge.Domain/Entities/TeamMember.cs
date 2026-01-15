using TaskForge.Domain.Common;
using TaskForge.Domain.Enums;

namespace TaskForge.Domain.Entities;

/// <summary>
/// TeamMember entity representing a user's membership in a team.
/// WHY: Join entity for many-to-many relationship between Teams and Users,
/// with additional role information for team-level authorization.
/// </summary>
public class TeamMember : BaseEntity
{
    public Guid TeamId { get; set; }
    
    public Team Team { get; set; } = null!;
    
    public string UserId { get; set; } = string.Empty;
    
    public ApplicationUser User { get; set; } = null!;
    
    /// <summary>
    /// Role within the team (different from application roles).
    /// WHY: Allows fine-grained permissions within a project/team context.
    /// </summary>
    public TeamRole Role { get; set; } = TeamRole.Member;
    
    public DateTime JoinedAt { get; set; }
}
