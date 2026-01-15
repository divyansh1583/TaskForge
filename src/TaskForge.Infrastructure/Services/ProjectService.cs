using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Projects;
using TaskForge.Application.Interfaces;
using TaskForge.Domain.Entities;
using TaskForge.Domain.Enums;
using TaskForge.Infrastructure.Persistence;

namespace TaskForge.Infrastructure.Services;

/// <summary>
/// Implementation of IProjectService.
/// WHY: Encapsulates all project-related business logic and data access,
/// following the single responsibility principle.
/// </summary>
public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ProjectService> _logger;

    public ProjectService(
        ApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<ProjectService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Result<PaginatedList<ProjectListDto>>> GetProjectsAsync(
        ProjectQueryParams queryParams,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _context.Projects
                .Include(p => p.Owner)
                .Include(p => p.Team!)
                    .ThenInclude(t => t.Members)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
            {
                var searchTerm = queryParams.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(searchTerm) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTerm)));
            }

            if (queryParams.Status.HasValue)
            {
                query = query.Where(p => p.Status == queryParams.Status.Value);
            }

            if (!string.IsNullOrWhiteSpace(queryParams.OwnerId))
            {
                query = query.Where(p => p.OwnerId == queryParams.OwnerId);
            }

            // Apply sorting
            query = queryParams.SortBy?.ToLower() switch
            {
                "name" => queryParams.SortDescending
                    ? query.OrderByDescending(p => p.Name)
                    : query.OrderBy(p => p.Name),
                "status" => queryParams.SortDescending
                    ? query.OrderByDescending(p => p.Status)
                    : query.OrderBy(p => p.Status),
                "startdate" => queryParams.SortDescending
                    ? query.OrderByDescending(p => p.StartDate)
                    : query.OrderBy(p => p.StartDate),
                "enddate" => queryParams.SortDescending
                    ? query.OrderByDescending(p => p.EndDate)
                    : query.OrderBy(p => p.EndDate),
                _ => queryParams.SortDescending
                    ? query.OrderByDescending(p => p.CreatedAt)
                    : query.OrderBy(p => p.CreatedAt)
            };

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);

            // Apply pagination
            var items = await query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .Select(p => new ProjectListDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Status = p.Status,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    OwnerName = p.Owner != null ? p.Owner.FirstName + " " + p.Owner.LastName : null,
                    TeamMemberCount = p.Team != null ? p.Team.Members.Count(m => !m.IsDeleted) : 0,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync(cancellationToken);

            var paginatedList = new PaginatedList<ProjectListDto>(
                items,
                totalCount,
                queryParams.PageNumber,
                queryParams.PageSize);

            return Result<PaginatedList<ProjectListDto>>.Success(paginatedList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving projects");
            return Result<PaginatedList<ProjectListDto>>.Failure("An error occurred while retrieving projects.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<ProjectDetailDto>> GetProjectByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var project = await _context.Projects
                .Include(p => p.Owner)
                .Include(p => p.Team!)
                    .ThenInclude(t => t.Members)
                        .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

            if (project == null)
            {
                return Result<ProjectDetailDto>.Failure("Project not found.", ResultErrorType.NotFound);
            }

            var dto = new ProjectDetailDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                Status = project.Status,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                OwnerId = project.OwnerId,
                OwnerName = project.Owner != null ? project.Owner.FirstName + " " + project.Owner.LastName : null,
                TeamId = project.Team?.Id,
                TeamName = project.Team?.Name,
                TeamMembers = project.Team?.Members
                    .Where(m => !m.IsDeleted)
                    .Select(m => new Application.DTOs.Teams.TeamMemberDto
                    {
                        Id = m.Id,
                        UserId = m.UserId,
                        UserName = m.User != null ? m.User.FirstName + " " + m.User.LastName : null,
                        Email = m.User?.Email,
                        Role = m.Role,
                        JoinedAt = m.JoinedAt
                    })
                    .ToList() ?? new List<Application.DTOs.Teams.TeamMemberDto>(),
                CreatedAt = project.CreatedAt,
                CreatedBy = project.CreatedBy,
                UpdatedAt = project.UpdatedAt,
                UpdatedBy = project.UpdatedBy
            };

            return Result<ProjectDetailDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving project {ProjectId}", id);
            return Result<ProjectDetailDto>.Failure("An error occurred while retrieving the project.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<ProjectDetailDto>> CreateProjectAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var currentUserId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Result<ProjectDetailDto>.Failure("User not authenticated.", ResultErrorType.Unauthorized);
            }

            // Check if project name already exists
            var nameExists = await _context.Projects
                .AnyAsync(p => p.Name.ToLower() == request.Name.ToLower(), cancellationToken);

            if (nameExists)
            {
                return Result<ProjectDetailDto>.Failure("A project with this name already exists.", ResultErrorType.Validation);
            }

            var project = new Project
            {
                Name = request.Name,
                Description = request.Description,
                Status = request.Status ?? ProjectStatus.Active,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                OwnerId = request.OwnerId ?? currentUserId
            };

            // Create associated team
            var team = new Team
            {
                Name = request.Name + " Team",
                Description = "Team for project: " + request.Name,
                Project = project
            };

            project.Team = team;

            // Add the owner as a team lead
            var ownerMember = new TeamMember
            {
                Team = team,
                UserId = project.OwnerId,
                Role = TeamRole.Lead,
                JoinedAt = DateTime.UtcNow
            };

            team.Members.Add(ownerMember);

            _context.Projects.Add(project);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Project {ProjectName} created by user {UserId}", project.Name, currentUserId);

            return await GetProjectByIdAsync(project.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating project");
            return Result<ProjectDetailDto>.Failure("An error occurred while creating the project.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<ProjectDetailDto>> UpdateProjectAsync(
        Guid id,
        UpdateProjectRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var project = await _context.Projects
                .Include(p => p.Team)
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

            if (project == null)
            {
                return Result<ProjectDetailDto>.Failure("Project not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canEdit = await CanUserEditProjectAsync(id, cancellationToken);
            if (!canEdit)
            {
                return Result<ProjectDetailDto>.Failure("You do not have permission to edit this project.", ResultErrorType.Forbidden);
            }

            // Check for duplicate name if name is being changed
            if (!string.IsNullOrWhiteSpace(request.Name) &&
                !request.Name.Equals(project.Name, StringComparison.OrdinalIgnoreCase))
            {
                var nameExists = await _context.Projects
                    .AnyAsync(p => p.Id != id && p.Name.ToLower() == request.Name.ToLower(), cancellationToken);

                if (nameExists)
                {
                    return Result<ProjectDetailDto>.Failure("A project with this name already exists.", ResultErrorType.Validation);
                }

                project.Name = request.Name;

                // Update team name if it follows the default pattern
                if (project.Team != null && project.Team.Name.EndsWith(" Team"))
                {
                    project.Team.Name = request.Name + " Team";
                }
            }

            if (request.Description != null)
            {
                project.Description = request.Description;
            }

            if (request.Status.HasValue)
            {
                project.Status = request.Status.Value;
            }

            if (request.StartDate.HasValue)
            {
                project.StartDate = request.StartDate;
            }

            if (request.EndDate.HasValue)
            {
                project.EndDate = request.EndDate;
            }

            if (!string.IsNullOrWhiteSpace(request.OwnerId))
            {
                project.OwnerId = request.OwnerId;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Project {ProjectId} updated by user {UserId}", id, _currentUserService.UserId);

            return await GetProjectByIdAsync(project.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating project {ProjectId}", id);
            return Result<ProjectDetailDto>.Failure("An error occurred while updating the project.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<bool>> DeleteProjectAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var project = await _context.Projects
                .Include(p => p.Team!)
                    .ThenInclude(t => t.Members)
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

            if (project == null)
            {
                return Result<bool>.Failure("Project not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canEdit = await CanUserEditProjectAsync(id, cancellationToken);
            if (!canEdit)
            {
                return Result<bool>.Failure("You do not have permission to delete this project.", ResultErrorType.Forbidden);
            }

            // Soft delete the project and related entities
            project.IsDeleted = true;

            if (project.Team != null)
            {
                project.Team.IsDeleted = true;

                foreach (var member in project.Team.Members)
                {
                    member.IsDeleted = true;
                }
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Project {ProjectId} deleted by user {UserId}", id, _currentUserService.UserId);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting project {ProjectId}", id);
            return Result<bool>.Failure("An error occurred while deleting the project.");
        }
    }

    /// <inheritdoc />
    public async Task<bool> CanUserEditProjectAsync(
        Guid projectId,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return false;
        }

        // Admins can edit any project
        if (_currentUserService.IsInRole("Admin"))
        {
            return true;
        }

        var project = await _context.Projects
            .Include(p => p.Team!)
                .ThenInclude(t => t.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project == null)
        {
            return false;
        }

        // Project owner can edit
        if (project.OwnerId == currentUserId)
        {
            return true;
        }

        // Managers who are team leads can edit
        if (_currentUserService.IsInRole("Manager"))
        {
            var isTeamLead = project.Team?.Members
                .Any(m => m.UserId == currentUserId && m.Role == TeamRole.Lead && !m.IsDeleted) ?? false;

            return isTeamLead;
        }

        return false;
    }
}
