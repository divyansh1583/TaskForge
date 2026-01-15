using TaskForge.Domain.Enums;

namespace TaskForge.Application.DTOs.Teams;

/// <summary>
/// DTO for team information.
/// </summary>
public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public List<TeamMemberDto> Members { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for team member information.
/// </summary>
public class TeamMemberDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public TeamRole Role { get; set; }
    public string RoleName => Role.ToString();
    public DateTime JoinedAt { get; set; }
}

/// <summary>
/// DTO for adding a member to a team.
/// </summary>
public class AddTeamMemberRequest
{
    public string UserId { get; set; } = string.Empty;
    public TeamRole? Role { get; set; }
}

/// <summary>
/// DTO for updating a team member's role.
/// </summary>
public class UpdateTeamMemberRequest
{
    public TeamRole Role { get; set; }
}

/// <summary>
/// DTO for updating team details.
/// </summary>
public class UpdateTeamRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
}
