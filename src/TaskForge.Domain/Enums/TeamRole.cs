namespace TaskForge.Domain.Enums;

/// <summary>
/// Team member role enumeration.
/// WHY: Defines roles within a team for project-level authorization.
/// Different from application roles (Admin/Manager/Member).
/// </summary>
public enum TeamRole
{
    /// <summary>
    /// Regular team member - can view and work on tasks
    /// </summary>
    Member = 0,
    
    /// <summary>
    /// Team lead - can manage team members and project settings
    /// </summary>
    Lead = 1,
    
    /// <summary>
    /// Observer - read-only access to the project
    /// </summary>
    Observer = 2
}
