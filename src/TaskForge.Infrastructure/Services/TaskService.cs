using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Tasks;
using TaskForge.Application.Interfaces;
using TaskForge.Domain.Entities;
using TaskForge.Domain.Enums;
using TaskForge.Infrastructure.Persistence;

namespace TaskForge.Infrastructure.Services;

/// <summary>
/// Implementation of ITaskService.
/// WHY: Encapsulates all task-related business logic and data access,
/// following the single responsibility principle.
/// </summary>
public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<TaskService> _logger;

    public TaskService(
        ApplicationDbContext context,
        ICurrentUserService currentUserService,
        ILogger<TaskService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Result<PaginatedList<TaskListDto>>> GetTasksByProjectAsync(
        Guid projectId,
        TaskQueryParams queryParams,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Verify project exists
            var projectExists = await _context.Projects
                .AnyAsync(p => p.Id == projectId, cancellationToken);

            if (!projectExists)
            {
                return Result<PaginatedList<TaskListDto>>.Failure("Project not found.", ResultErrorType.NotFound);
            }

            var query = _context.Set<TaskItem>()
                .Include(t => t.Project)
                .Include(t => t.Assignee)
                .Where(t => t.ProjectId == projectId)
                .AsQueryable();

            query = ApplyFilters(query, queryParams);
            query = ApplySorting(query, queryParams);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .Select(t => MapToListDto(t))
                .ToListAsync(cancellationToken);

            var paginatedList = new PaginatedList<TaskListDto>(
                items,
                totalCount,
                queryParams.PageNumber,
                queryParams.PageSize);

            return Result<PaginatedList<TaskListDto>>.Success(paginatedList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for project {ProjectId}", projectId);
            return Result<PaginatedList<TaskListDto>>.Failure("An error occurred while retrieving tasks.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TaskDetailDto>> GetTaskByIdAsync(
        Guid taskId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var task = await _context.Set<TaskItem>()
                .Include(t => t.Project)
                .Include(t => t.Assignee)
                .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

            if (task == null)
            {
                return Result<TaskDetailDto>.Failure("Task not found.", ResultErrorType.NotFound);
            }

            var dto = MapToDetailDto(task);
            return Result<TaskDetailDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task {TaskId}", taskId);
            return Result<TaskDetailDto>.Failure("An error occurred while retrieving the task.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TaskDetailDto>> CreateTaskAsync(
        Guid projectId,
        CreateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var currentUserId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Result<TaskDetailDto>.Failure("User not authenticated.", ResultErrorType.Unauthorized);
            }

            // Verify project exists and user has access
            var project = await _context.Projects
                .Include(p => p.Team!)
                    .ThenInclude(t => t.Members)
                .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

            if (project == null)
            {
                return Result<TaskDetailDto>.Failure("Project not found.", ResultErrorType.NotFound);
            }

            // Check if user is a team member or project owner
            var isTeamMember = project.Team?.Members.Any(m => m.UserId == currentUserId && !m.IsDeleted) ?? false;
            var isOwner = project.OwnerId == currentUserId;

            if (!isTeamMember && !isOwner)
            {
                return Result<TaskDetailDto>.Failure("You do not have permission to create tasks in this project.", ResultErrorType.Forbidden);
            }

            // Validate assignee if provided
            if (!string.IsNullOrEmpty(request.AssigneeId))
            {
                var assigneeIsTeamMember = project.Team?.Members.Any(m => m.UserId == request.AssigneeId && !m.IsDeleted) ?? false;
                var assigneeIsOwner = project.OwnerId == request.AssigneeId;

                if (!assigneeIsTeamMember && !assigneeIsOwner)
                {
                    return Result<TaskDetailDto>.Failure("Assignee must be a team member.", ResultErrorType.Validation);
                }
            }

            // Get the next display order for this project
            var maxDisplayOrder = await _context.Set<TaskItem>()
                .Where(t => t.ProjectId == projectId)
                .MaxAsync(t => (int?)t.DisplayOrder, cancellationToken) ?? 0;

            var task = new TaskItem
            {
                Title = request.Title,
                Description = request.Description,
                Status = request.Status ?? TaskItemStatus.Open,
                Priority = request.Priority ?? TaskPriority.Medium,
                DueDate = request.DueDate,
                EstimatedHours = request.EstimatedHours,
                AssigneeId = request.AssigneeId,
                ProjectId = projectId,
                Tags = request.Tags,
                DisplayOrder = maxDisplayOrder + 1
            };

            _context.Set<TaskItem>().Add(task);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Task {TaskTitle} created in project {ProjectId} by user {UserId}",
                task.Title, projectId, currentUserId);

            return await GetTaskByIdAsync(task.Id, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task in project {ProjectId}", projectId);
            return Result<TaskDetailDto>.Failure("An error occurred while creating the task.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TaskDetailDto>> UpdateTaskAsync(
        Guid taskId,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var task = await _context.Set<TaskItem>()
                .Include(t => t.Project)
                    .ThenInclude(p => p.Team!)
                        .ThenInclude(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

            if (task == null)
            {
                return Result<TaskDetailDto>.Failure("Task not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canEdit = await CanUserEditTaskAsync(taskId, cancellationToken);
            if (!canEdit)
            {
                return Result<TaskDetailDto>.Failure("You do not have permission to edit this task.", ResultErrorType.Forbidden);
            }

            // Validate assignee if provided
            if (request.AssigneeId != null)
            {
                if (!string.IsNullOrEmpty(request.AssigneeId))
                {
                    var project = task.Project;
                    var assigneeIsTeamMember = project.Team?.Members.Any(m => m.UserId == request.AssigneeId && !m.IsDeleted) ?? false;
                    var assigneeIsOwner = project.OwnerId == request.AssigneeId;

                    if (!assigneeIsTeamMember && !assigneeIsOwner)
                    {
                        return Result<TaskDetailDto>.Failure("Assignee must be a team member.", ResultErrorType.Validation);
                    }
                }

                task.AssigneeId = string.IsNullOrEmpty(request.AssigneeId) ? null : request.AssigneeId;
            }

            // Update fields
            if (!string.IsNullOrWhiteSpace(request.Title))
            {
                task.Title = request.Title;
            }

            if (request.Description != null)
            {
                task.Description = request.Description;
            }

            if (request.Status.HasValue)
            {
                task.Status = request.Status.Value;
            }

            if (request.Priority.HasValue)
            {
                task.Priority = request.Priority.Value;
            }

            if (request.DueDate.HasValue)
            {
                task.DueDate = request.DueDate.Value;
            }

            if (request.EstimatedHours.HasValue)
            {
                task.EstimatedHours = request.EstimatedHours.Value;
            }

            if (request.ActualHours.HasValue)
            {
                task.ActualHours = request.ActualHours.Value;
            }

            if (request.Tags != null)
            {
                task.Tags = request.Tags;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Task {TaskId} updated by user {UserId}",
                taskId, _currentUserService.UserId);

            return await GetTaskByIdAsync(taskId, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {TaskId}", taskId);
            return Result<TaskDetailDto>.Failure("An error occurred while updating the task.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<bool>> DeleteTaskAsync(
        Guid taskId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var task = await _context.Set<TaskItem>()
                .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

            if (task == null)
            {
                return Result<bool>.Failure("Task not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canEdit = await CanUserEditTaskAsync(taskId, cancellationToken);
            if (!canEdit)
            {
                return Result<bool>.Failure("You do not have permission to delete this task.", ResultErrorType.Forbidden);
            }

            // Soft delete
            task.IsDeleted = true;
            task.DeletedAt = DateTime.UtcNow;
            task.DeletedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Task {TaskId} deleted by user {UserId}",
                taskId, _currentUserService.UserId);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {TaskId}", taskId);
            return Result<bool>.Failure("An error occurred while deleting the task.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TaskDetailDto>> UpdateTaskStatusAsync(
        Guid taskId,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var task = await _context.Set<TaskItem>()
                .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

            if (task == null)
            {
                return Result<TaskDetailDto>.Failure("Task not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canEdit = await CanUserEditTaskAsync(taskId, cancellationToken);
            if (!canEdit)
            {
                return Result<TaskDetailDto>.Failure("You do not have permission to update this task.", ResultErrorType.Forbidden);
            }

            task.Status = request.Status;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Task {TaskId} status updated to {Status} by user {UserId}",
                taskId, request.Status, _currentUserService.UserId);

            return await GetTaskByIdAsync(taskId, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task status {TaskId}", taskId);
            return Result<TaskDetailDto>.Failure("An error occurred while updating the task status.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TaskDetailDto>> AssignTaskAsync(
        Guid taskId,
        AssignTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var task = await _context.Set<TaskItem>()
                .Include(t => t.Project)
                    .ThenInclude(p => p.Team!)
                        .ThenInclude(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

            if (task == null)
            {
                return Result<TaskDetailDto>.Failure("Task not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canEdit = await CanUserEditTaskAsync(taskId, cancellationToken);
            if (!canEdit)
            {
                return Result<TaskDetailDto>.Failure("You do not have permission to assign this task.", ResultErrorType.Forbidden);
            }

            // Validate assignee if provided
            if (!string.IsNullOrEmpty(request.AssigneeId))
            {
                var project = task.Project;
                var assigneeIsTeamMember = project.Team?.Members.Any(m => m.UserId == request.AssigneeId && !m.IsDeleted) ?? false;
                var assigneeIsOwner = project.OwnerId == request.AssigneeId;

                if (!assigneeIsTeamMember && !assigneeIsOwner)
                {
                    return Result<TaskDetailDto>.Failure("Assignee must be a team member.", ResultErrorType.Validation);
                }
            }

            task.AssigneeId = string.IsNullOrEmpty(request.AssigneeId) ? null : request.AssigneeId;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Task {TaskId} assigned to {AssigneeId} by user {UserId}",
                taskId, request.AssigneeId ?? "unassigned", _currentUserService.UserId);

            return await GetTaskByIdAsync(taskId, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning task {TaskId}", taskId);
            return Result<TaskDetailDto>.Failure("An error occurred while assigning the task.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<bool>> ReorderTaskAsync(
        Guid taskId,
        ReorderTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var task = await _context.Set<TaskItem>()
                .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

            if (task == null)
            {
                return Result<bool>.Failure("Task not found.", ResultErrorType.NotFound);
            }

            // Check authorization
            var canEdit = await CanUserEditTaskAsync(taskId, cancellationToken);
            if (!canEdit)
            {
                return Result<bool>.Failure("You do not have permission to reorder this task.", ResultErrorType.Forbidden);
            }

            var oldOrder = task.DisplayOrder;
            var newOrder = request.NewDisplayOrder;

            if (oldOrder == newOrder)
            {
                return Result<bool>.Success(true);
            }

            // Update other tasks' display orders
            if (newOrder > oldOrder)
            {
                // Moving down - decrement items between old and new position
                await _context.Set<TaskItem>()
                    .Where(t => t.ProjectId == task.ProjectId &&
                               t.DisplayOrder > oldOrder &&
                               t.DisplayOrder <= newOrder &&
                               t.Id != taskId)
                    .ExecuteUpdateAsync(s => s.SetProperty(t => t.DisplayOrder, t => t.DisplayOrder - 1), cancellationToken);
            }
            else
            {
                // Moving up - increment items between new and old position
                await _context.Set<TaskItem>()
                    .Where(t => t.ProjectId == task.ProjectId &&
                               t.DisplayOrder >= newOrder &&
                               t.DisplayOrder < oldOrder &&
                               t.Id != taskId)
                    .ExecuteUpdateAsync(s => s.SetProperty(t => t.DisplayOrder, t => t.DisplayOrder + 1), cancellationToken);
            }

            task.DisplayOrder = newOrder;
            await _context.SaveChangesAsync(cancellationToken);

            return Result<bool>.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reordering task {TaskId}", taskId);
            return Result<bool>.Failure("An error occurred while reordering the task.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TaskSummaryDto>> GetTaskSummaryAsync(
        Guid projectId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Verify project exists
            var projectExists = await _context.Projects
                .AnyAsync(p => p.Id == projectId, cancellationToken);

            if (!projectExists)
            {
                return Result<TaskSummaryDto>.Failure("Project not found.", ResultErrorType.NotFound);
            }

            var tasks = await _context.Set<TaskItem>()
                .Where(t => t.ProjectId == projectId)
                .ToListAsync(cancellationToken);

            var now = DateTime.UtcNow;
            var summary = new TaskSummaryDto
            {
                TotalTasks = tasks.Count,
                OpenTasks = tasks.Count(t => t.Status == TaskItemStatus.Open),
                InProgressTasks = tasks.Count(t => t.Status == TaskItemStatus.InProgress),
                InReviewTasks = tasks.Count(t => t.Status == TaskItemStatus.InReview),
                DoneTasks = tasks.Count(t => t.Status == TaskItemStatus.Done),
                OverdueTasks = tasks.Count(t => t.DueDate.HasValue &&
                                                t.DueDate.Value < now &&
                                                t.Status != TaskItemStatus.Done &&
                                                t.Status != TaskItemStatus.Cancelled),
                UnassignedTasks = tasks.Count(t => string.IsNullOrEmpty(t.AssigneeId) &&
                                                   t.Status != TaskItemStatus.Done &&
                                                   t.Status != TaskItemStatus.Cancelled)
            };

            return Result<TaskSummaryDto>.Success(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task summary for project {ProjectId}", projectId);
            return Result<TaskSummaryDto>.Failure("An error occurred while retrieving the task summary.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<PaginatedList<TaskListDto>>> GetMyTasksAsync(
        TaskQueryParams queryParams,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var currentUserId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Result<PaginatedList<TaskListDto>>.Failure("User not authenticated.", ResultErrorType.Unauthorized);
            }

            var query = _context.Set<TaskItem>()
                .Include(t => t.Project)
                .Include(t => t.Assignee)
                .Where(t => t.AssigneeId == currentUserId)
                .AsQueryable();

            query = ApplyFilters(query, queryParams);
            query = ApplySorting(query, queryParams);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((queryParams.PageNumber - 1) * queryParams.PageSize)
                .Take(queryParams.PageSize)
                .Select(t => MapToListDto(t))
                .ToListAsync(cancellationToken);

            var paginatedList = new PaginatedList<TaskListDto>(
                items,
                totalCount,
                queryParams.PageNumber,
                queryParams.PageSize);

            return Result<PaginatedList<TaskListDto>>.Success(paginatedList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for current user");
            return Result<PaginatedList<TaskListDto>>.Failure("An error occurred while retrieving tasks.");
        }
    }

    /// <inheritdoc />
    public async Task<Result<TaskSummaryDto>> GetMyTaskSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var currentUserId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Result<TaskSummaryDto>.Failure("User not authenticated.", ResultErrorType.Unauthorized);
            }

            var tasks = await _context.Set<TaskItem>()
                .Where(t => t.AssigneeId == currentUserId)
                .ToListAsync(cancellationToken);

            var now = DateTime.UtcNow;
            var summary = new TaskSummaryDto
            {
                TotalTasks = tasks.Count,
                OpenTasks = tasks.Count(t => t.Status == TaskItemStatus.Open),
                InProgressTasks = tasks.Count(t => t.Status == TaskItemStatus.InProgress),
                InReviewTasks = tasks.Count(t => t.Status == TaskItemStatus.InReview),
                DoneTasks = tasks.Count(t => t.Status == TaskItemStatus.Done),
                OverdueTasks = tasks.Count(t => 
                    t.DueDate.HasValue && 
                    t.DueDate.Value < now && 
                    t.Status != TaskItemStatus.Done && 
                    t.Status != TaskItemStatus.Cancelled),
                UnassignedTasks = 0 // For user summary, all tasks are assigned to them
            };

            return Result<TaskSummaryDto>.Success(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task summary for current user");
            return Result<TaskSummaryDto>.Failure("An error occurred while retrieving task summary.");
        }
    }

    /// <inheritdoc />
    public async Task<bool> CanUserEditTaskAsync(
        Guid taskId,
        CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(currentUserId))
        {
            return false;
        }

        var task = await _context.Set<TaskItem>()
            .Include(t => t.Project)
                .ThenInclude(p => p.Team!)
                    .ThenInclude(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken);

        if (task == null)
        {
            return false;
        }

        var project = task.Project;

        // Project owner can always edit
        if (project.OwnerId == currentUserId)
        {
            return true;
        }

        // Check if user is a team member with Lead role
        var teamMember = project.Team?.Members.FirstOrDefault(m => m.UserId == currentUserId && !m.IsDeleted);
        if (teamMember != null)
        {
            // Leads can edit any task
            if (teamMember.Role == TeamRole.Lead)
            {
                return true;
            }

            // Regular members can only edit their own assigned tasks
            if (teamMember.Role == TeamRole.Member && task.AssigneeId == currentUserId)
            {
                return true;
            }
        }

        return false;
    }

    #region Private Helper Methods

    private static IQueryable<TaskItem> ApplyFilters(IQueryable<TaskItem> query, TaskQueryParams queryParams)
    {
        if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
        {
            var searchTerm = queryParams.SearchTerm.ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(searchTerm) ||
                (t.Description != null && t.Description.ToLower().Contains(searchTerm)));
        }

        if (queryParams.Status.HasValue)
        {
            query = query.Where(t => t.Status == queryParams.Status.Value);
        }

        if (queryParams.Priority.HasValue)
        {
            query = query.Where(t => t.Priority == queryParams.Priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(queryParams.AssigneeId))
        {
            query = query.Where(t => t.AssigneeId == queryParams.AssigneeId);
        }

        if (queryParams.IsOverdue == true)
        {
            var now = DateTime.UtcNow;
            query = query.Where(t => t.DueDate.HasValue &&
                                     t.DueDate.Value < now &&
                                     t.Status != TaskItemStatus.Done &&
                                     t.Status != TaskItemStatus.Cancelled);
        }

        if (queryParams.DueBefore.HasValue)
        {
            query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value <= queryParams.DueBefore.Value);
        }

        if (queryParams.DueAfter.HasValue)
        {
            query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value >= queryParams.DueAfter.Value);
        }

        if (!string.IsNullOrWhiteSpace(queryParams.Tags))
        {
            var tag = queryParams.Tags.ToLower();
            query = query.Where(t => t.Tags != null && t.Tags.ToLower().Contains(tag));
        }

        return query;
    }

    private static IQueryable<TaskItem> ApplySorting(IQueryable<TaskItem> query, TaskQueryParams queryParams)
    {
        return queryParams.SortBy?.ToLower() switch
        {
            "title" => queryParams.SortDescending
                ? query.OrderByDescending(t => t.Title)
                : query.OrderBy(t => t.Title),
            "status" => queryParams.SortDescending
                ? query.OrderByDescending(t => t.Status)
                : query.OrderBy(t => t.Status),
            "priority" => queryParams.SortDescending
                ? query.OrderByDescending(t => t.Priority)
                : query.OrderBy(t => t.Priority),
            "duedate" => queryParams.SortDescending
                ? query.OrderByDescending(t => t.DueDate)
                : query.OrderBy(t => t.DueDate),
            "createdat" => queryParams.SortDescending
                ? query.OrderByDescending(t => t.CreatedAt)
                : query.OrderBy(t => t.CreatedAt),
            "assignee" => queryParams.SortDescending
                ? query.OrderByDescending(t => t.Assignee != null ? t.Assignee.FirstName : "")
                : query.OrderBy(t => t.Assignee != null ? t.Assignee.FirstName : ""),
            _ => queryParams.SortDescending
                ? query.OrderByDescending(t => t.DisplayOrder)
                : query.OrderBy(t => t.DisplayOrder)
        };
    }

    private static TaskListDto MapToListDto(TaskItem task)
    {
        return new TaskListDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            EstimatedHours = task.EstimatedHours,
            ProjectId = task.ProjectId,
            ProjectName = task.Project?.Name,
            AssigneeId = task.AssigneeId,
            AssigneeName = task.Assignee != null ? $"{task.Assignee.FirstName} {task.Assignee.LastName}" : null,
            AssigneeEmail = task.Assignee?.Email,
            DisplayOrder = task.DisplayOrder,
            Tags = task.Tags,
            CreatedAt = task.CreatedAt
        };
    }

    private static TaskDetailDto MapToDetailDto(TaskItem task)
    {
        return new TaskDetailDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            EstimatedHours = task.EstimatedHours,
            ActualHours = task.ActualHours,
            ProjectId = task.ProjectId,
            ProjectName = task.Project?.Name,
            AssigneeId = task.AssigneeId,
            AssigneeName = task.Assignee != null ? $"{task.Assignee.FirstName} {task.Assignee.LastName}" : null,
            AssigneeEmail = task.Assignee?.Email,
            DisplayOrder = task.DisplayOrder,
            Tags = task.Tags,
            CreatedAt = task.CreatedAt,
            CreatedBy = task.CreatedBy,
            UpdatedAt = task.UpdatedAt,
            UpdatedBy = task.UpdatedBy
        };
    }

    #endregion
}
