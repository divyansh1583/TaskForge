using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Teams;

namespace TaskForge.Application.Interfaces;

/// <summary>
/// Interface for team operations.
/// WHY: Defines the contract for team management, allowing
/// Infrastructure to implement without Application depending on it.
/// </summary>
public interface ITeamService
{
    /// <summary>
    /// Get team details by project ID.
    /// </summary>
    Task<Result<TeamDto>> GetTeamByProjectIdAsync(
        Guid projectId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get team details by team ID.
    /// </summary>
    Task<Result<TeamDto>> GetTeamByIdAsync(
        Guid teamId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update team details.
    /// </summary>
    Task<Result<TeamDto>> UpdateTeamAsync(
        Guid teamId,
        UpdateTeamRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Add a new member to a team.
    /// </summary>
    Task<Result<TeamMemberDto>> AddTeamMemberAsync(
        Guid teamId,
        AddTeamMemberRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update a team member's role.
    /// </summary>
    Task<Result<TeamMemberDto>> UpdateTeamMemberAsync(
        Guid teamId,
        Guid memberId,
        UpdateTeamMemberRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Remove a member from a team.
    /// </summary>
    Task<Result<bool>> RemoveTeamMemberAsync(
        Guid teamId,
        Guid memberId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all members of a team.
    /// </summary>
    Task<Result<IEnumerable<TeamMemberDto>>> GetTeamMembersAsync(
        Guid teamId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if the current user can manage the team.
    /// </summary>
    Task<bool> CanUserManageTeamAsync(
        Guid teamId,
        CancellationToken cancellationToken = default);
}
