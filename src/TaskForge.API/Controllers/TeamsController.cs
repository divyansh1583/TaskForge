using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.Application.DTOs.Teams;
using TaskForge.Application.Interfaces;
using TaskForge.Domain.Constants;

namespace TaskForge.API.Controllers;

/// <summary>
/// API endpoints for managing teams and team members.
/// WHY: Provides endpoints for team management with proper authorization,
/// allowing project managers and leads to manage their team members.
/// </summary>
[Authorize]
public class TeamsController : BaseApiController
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    /// <summary>
    /// Get a team by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TeamDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamDto>> GetTeam(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _teamService.GetTeamByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Get a team by project ID.
    /// </summary>
    [HttpGet("project/{projectId:guid}")]
    [ProducesResponseType(typeof(TeamDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamDto>> GetTeamByProject(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var result = await _teamService.GetTeamByProjectIdAsync(projectId, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Update team details.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    [ProducesResponseType(typeof(TeamDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamDto>> UpdateTeam(
        Guid id,
        [FromBody] UpdateTeamRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _teamService.UpdateTeamAsync(id, request, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Get all members of a team.
    /// </summary>
    [HttpGet("{id:guid}/members")]
    [ProducesResponseType(typeof(IEnumerable<TeamMemberDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IEnumerable<TeamMemberDto>>> GetTeamMembers(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _teamService.GetTeamMembersAsync(id, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Add a new member to a team.
    /// </summary>
    [HttpPost("{id:guid}/members")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamMemberDto>> AddTeamMember(
        Guid id,
        [FromBody] AddTeamMemberRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _teamService.AddTeamMemberAsync(id, request, cancellationToken);

        if (result.IsSuccess && result.Data != null)
        {
            return CreatedAtAction(
                nameof(GetTeamMembers),
                new { id },
                result.Data);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Update a team member's role.
    /// </summary>
    [HttpPut("{id:guid}/members/{memberId:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    [ProducesResponseType(typeof(TeamMemberDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TeamMemberDto>> UpdateTeamMember(
        Guid id,
        Guid memberId,
        [FromBody] UpdateTeamMemberRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _teamService.UpdateTeamMemberAsync(id, memberId, request, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Remove a member from a team.
    /// </summary>
    [HttpDelete("{id:guid}/members/{memberId:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveTeamMember(
        Guid id,
        Guid memberId,
        CancellationToken cancellationToken)
    {
        var result = await _teamService.RemoveTeamMemberAsync(id, memberId, cancellationToken);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return result.ErrorType switch
        {
            Application.Common.ResultErrorType.NotFound => NotFound(new { error = result.Error }),
            Application.Common.ResultErrorType.Forbidden => Forbid(),
            _ => BadRequest(new { error = result.Error })
        };
    }
}
