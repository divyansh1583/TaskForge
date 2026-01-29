using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Tasks;

namespace TaskForge.Application.Interfaces;

/// <summary>
/// Interface for task operations.
/// WHY: Defines the contract for task management, allowing
/// Infrastructure to implement without Application depending on it.
/// </summary>
public interface ITaskService
{
    /// <summary>
    /// Get all tasks for a project with pagination and filtering.
    /// </summary>
    Task<Result<PaginatedList<TaskListDto>>> GetTasksByProjectAsync(
        Guid projectId,
        TaskQueryParams queryParams,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a task by ID.
    /// </summary>
    Task<Result<TaskDetailDto>> GetTaskByIdAsync(
        Guid taskId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Create a new task in a project.
    /// </summary>
    Task<Result<TaskDetailDto>> CreateTaskAsync(
        Guid projectId,
        CreateTaskRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing task.
    /// </summary>
    Task<Result<TaskDetailDto>> UpdateTaskAsync(
        Guid taskId,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a task (soft delete).
    /// </summary>
    Task<Result<bool>> DeleteTaskAsync(
        Guid taskId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update only the task status.
    /// </summary>
    Task<Result<TaskDetailDto>> UpdateTaskStatusAsync(
        Guid taskId,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Assign a task to a user.
    /// </summary>
    Task<Result<TaskDetailDto>> AssignTaskAsync(
        Guid taskId,
        AssignTaskRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Reorder a task within the project.
    /// </summary>
    Task<Result<bool>> ReorderTaskAsync(
        Guid taskId,
        ReorderTaskRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get task summary statistics for a project.
    /// </summary>
    Task<Result<TaskSummaryDto>> GetTaskSummaryAsync(
        Guid projectId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get all tasks assigned to the current user.
    /// </summary>
    Task<Result<PaginatedList<TaskListDto>>> GetMyTasksAsync(
        TaskQueryParams queryParams,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get task summary statistics for the current user.
    /// </summary>
    Task<Result<TaskSummaryDto>> GetMyTaskSummaryAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if the current user can edit the task.
    /// </summary>
    Task<bool> CanUserEditTaskAsync(
        Guid taskId,
        CancellationToken cancellationToken = default);
}
