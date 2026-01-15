using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Teams;
using TaskForge.Application.Interfaces;
using TaskForge.Domain.Entities;
using TaskForge.Domain.Enums;
using TaskForge.Infrastructure.Persistence;

namespace TaskForge.Infrastructure.Services;

/// <summary>
/// Implementation of ITeamService.
/// WHY: Encapsulates all team-related business logic and data access,
/// handling team membership management with proper authorization checks.
/// </summary>
public class TeamService : ITeamService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<TeamService> _logger;

    public TeamService(
        ApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<TeamService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Result<TeamDto>> GetTeamByProjectIdAsync(
        Guid projectId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var team = await _context.Teams
                .Include(t => t.Project)
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(t => t.ProjectId == projectId, cancellationToken);

            if (team == null)
            {
                return Result<TeamDto>.Failure("Team not found for this project.", ResultErrorType.NotFound);
            }

            var dto = MapToDto(team);
            return Result<TeamDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving team for project {ProjectId}", projectId);
            return Result<TeamDto>.Failure("An error occurred while retrieving the team.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TeamDto>> GetTeamByIdAsync(
        Guid teamId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var team = await _context.Teams
                .Include(t => t.Project)
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(t => t.Id == teamId, cancellationToken);

            if (team == null)
            {
                return Result<TeamDto>.Failure("Team not found.", ResultErrorType.NotFound);
            }

            var dto = MapToDto(team);
            return Result<TeamDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving team {TeamId}", teamId);
            return Result<TeamDto>.Failure("An error occurred while retrieving the team.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TeamDto>> UpdateTeamAsync(
        Guid teamId,
        UpdateTeamRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var team = await _context.Teams
                .Include(t => t.Project)
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(t => t.Id == teamId, cancellationToken);

            if (team == null)
            {
                return Result<TeamDto>.Failure("Team not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canEdit = await CanUserManageTeamAsync(teamId, cancellationToken);
            if (!canEdit)
            {
                return Result<TeamDto>.Failure("You do not have permission to edit this team.", ResultErrorType.Forbidden);
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                team.Name = request.Name;
            }

            if (request.Description != null)
            {
                team.Description = request.Description;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Team {TeamId} updated by user {UserId}", teamId, _currentUserService.UserId);

            var dto = MapToDto(team);
            return Result<TeamDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating team {TeamId}", teamId);
            return Result<TeamDto>.Failure("An error occurred while updating the team.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TeamMemberDto>> AddTeamMemberAsync(
        Guid teamId,
        AddTeamMemberRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var team = await _context.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == teamId, cancellationToken);

            if (team == null)
            {
                return Result<TeamMemberDto>.Failure("Team not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canManage = await CanUserManageTeamAsync(teamId, cancellationToken);
            if (!canManage)
            {
                return Result<TeamMemberDto>.Failure("You do not have permission to manage this team.", ResultErrorType.Forbidden);
            }

            // Check if user exists
            var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
            if (user == null)
            {
                return Result<TeamMemberDto>.Failure("User not found.", ResultErrorType.NotFound);
            }

            // Check if user is already a member
            var existingMember = team.Members
                .FirstOrDefault(m => m.UserId == request.UserId && !m.IsDeleted);

            if (existingMember != null)
            {
                return Result<TeamMemberDto>.Failure("User is already a member of this team.", ResultErrorType.Validation);
            }

            // Check for soft-deleted membership and reactivate if exists
            var deletedMember = team.Members
                .FirstOrDefault(m => m.UserId == request.UserId && m.IsDeleted);

            TeamMember member;
            if (deletedMember != null)
            {
                deletedMember.IsDeleted = false;
                deletedMember.Role = request.Role ?? TeamRole.Member;
                deletedMember.JoinedAt = DateTime.UtcNow;
                member = deletedMember;
            }
            else
            {
                member = new TeamMember
                {
                    TeamId = teamId,
                    UserId = request.UserId,
                    Role = request.Role ?? TeamRole.Member,
                    JoinedAt = DateTime.UtcNow
                };

                _context.TeamMembers.Add(member);
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("User {UserId} added to team {TeamId} by {CurrentUserId}",
                request.UserId, teamId, _currentUserService.UserId);

            // Reload with user info
            await _context.Entry(member).Reference(m => m.User).LoadAsync(cancellationToken);

            var dto = MapMemberToDto(member);
            return Result<TeamMemberDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding member to team {TeamId}", teamId);
            return Result<TeamMemberDto>.Failure("An error occurred while adding the team member.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TeamMemberDto>> UpdateTeamMemberAsync(
        Guid teamId,
        Guid memberId,
        UpdateTeamMemberRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var member = await _context.TeamMembers
                .Include(m => m.User)
                .Include(m => m.Team)
                .FirstOrDefaultAsync(m => m.Id == memberId && m.TeamId == teamId, cancellationToken);

            if (member == null)
            {
                return Result<TeamMemberDto>.Failure("Team member not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canManage = await CanUserManageTeamAsync(teamId, cancellationToken);
            if (!canManage)
            {
                return Result<TeamMemberDto>.Failure("You do not have permission to manage this team.", ResultErrorType.Forbidden);
            }

            // Prevent demoting the last team lead
            if (member.Role == TeamRole.Lead && request.Role != TeamRole.Lead)
            {
                var leadCount = await _context.TeamMembers
                    .CountAsync(m => m.TeamId == teamId && m.Role == TeamRole.Lead && !m.IsDeleted, cancellationToken);

                if (leadCount <= 1)
                {
                    return Result<TeamMemberDto>.Failure("Cannot demote the last team lead. Promote another member first.", ResultErrorType.Validation);
                }
            }

            member.Role = request.Role;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Team member {MemberId} updated in team {TeamId} by {CurrentUserId}",
                memberId, teamId, _currentUserService.UserId);

            var dto = MapMemberToDto(member);
            return Result<TeamMemberDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating team member {MemberId}", memberId);
            return Result<TeamMemberDto>.Failure("An error occurred while updating the team member.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<bool>> RemoveTeamMemberAsync(
        Guid teamId,
        Guid memberId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var member = await _context.TeamMembers
                .Include(m => m.Team)
                    .ThenInclude(t => t.Project)
                .FirstOrDefaultAsync(m => m.Id == memberId && m.TeamId == teamId, cancellationToken);

            if (member == null)
            {
                return Result<bool>.Failure("Team member not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canManage = await CanUserManageTeamAsync(teamId, cancellationToken);
            if (!canManage)
            {
                return Result<bool>.Failure("You do not have permission to manage this team.", ResultErrorType.Forbidden);
            }

            // Prevent removing project owner
            if (member.Team?.Project?.OwnerId == member.UserId)
            {
                return Result<bool>.Failure("Cannot remove the project owner from the team.", ResultErrorType.Validation);
            }

            // Prevent removing the last team lead
            if (member.Role == TeamRole.Lead)
            {
                var leadCount = await _context.TeamMembers
                    .CountAsync(m => m.TeamId == teamId && m.Role == TeamRole.Lead && !m.IsDeleted, cancellationToken);

                if (leadCount <= 1)
                {
                    return Result<bool>.Failure("Cannot remove the last team lead. Promote another member first.", ResultErrorType.Validation);
                }
            }

            // Soft delete
            member.IsDeleted = true;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Team member {MemberId} removed from team {TeamId} by {CurrentUserId}",
                memberId, teamId, _currentUserService.UserId);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing team member {MemberId}", memberId);
            return Result<bool>.Failure("An error occurred while removing the team member.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<IEnumerable<TeamMemberDto>>> GetTeamMembersAsync(
        Guid teamId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var team = await _context.Teams
                .Include(t => t.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(t => t.Id == teamId, cancellationToken);

            if (team == null)
            {
                return Result<IEnumerable<TeamMemberDto>>.Failure("Team not found.", ResultErrorType.NotFound);
            }

            var members = team.Members
                .Where(m => !m.IsDeleted)
                .OrderBy(m => m.Role)
                .ThenBy(m => m.JoinedAt)
                .Select(m => MapMemberToDto(m))
                .ToList();

            return Result<IEnumerable<TeamMemberDto>>.Success(members);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving team members for team {TeamId}", teamId);
            return Result<IEnumerable<TeamMemberDto>>.Failure("An error occurred while retrieving team members.");
        }
    }

    /// <inheritdoc />
    public async Task<bool> CanUserManageTeamAsync(
        Guid teamId,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return false;
        }

        // Admins can manage any team
        if (_currentUserService.IsInRole("Admin"))
        {
            return true;
        }

        var team = await _context.Teams
            .Include(t => t.Project)
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId, cancellationToken);

        if (team == null)
        {
            return false;
        }

        // Project owner can manage the team
        if (team.Project?.OwnerId == currentUserId)
        {
            return true;
        }

        // Team leads can manage the team (if they are also managers)
        if (_currentUserService.IsInRole("Manager"))
        {
            var isTeamLead = team.Members
                .Any(m => m.UserId == currentUserId && m.Role == TeamRole.Lead && !m.IsDeleted);

            return isTeamLead;
        }

        return false;
    }

    /// <summary>
    /// Maps a Team entity to TeamDto.
    /// </summary>
    private static TeamDto MapToDto(Team team)
    {
        return new TeamDto
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            ProjectId = team.ProjectId,
            ProjectName = team.Project?.Name,
            Members = team.Members
                .Where(m => !m.IsDeleted)
                .OrderBy(m => m.Role)
                .ThenBy(m => m.JoinedAt)
                .Select(m => MapMemberToDto(m))
                .ToList(),
            CreatedAt = team.CreatedAt,
            UpdatedAt = team.UpdatedAt
        };
    }

    /// <summary>
    /// Maps a TeamMember entity to TeamMemberDto.
    /// </summary>
    private static TeamMemberDto MapMemberToDto(TeamMember member)
    {
        return new TeamMemberDto
        {
            Id = member.Id,
            UserId = member.UserId,
            UserName = member.User != null ? $"{member.User.FirstName} {member.User.LastName}" : null,
            Email = member.User?.Email,
            Role = member.Role,
            JoinedAt = member.JoinedAt
        };
    }
}
