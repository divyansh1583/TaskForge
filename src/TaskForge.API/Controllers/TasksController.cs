using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Tasks;
using TaskForge.Application.Interfaces;
using TaskForge.Domain.Constants;

namespace TaskForge.API.Controllers;

/// <summary>
/// API endpoints for managing tasks.
/// WHY: Provides CRUD operations for tasks with proper authorization,
/// pagination, and filtering support.
/// </summary>
[Authorize]
public class TasksController : BaseApiController
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>
    /// Get all tasks for a project with pagination and filtering.
    /// </summary>
    [HttpGet("/api/projects/{projectId:guid}/tasks")]
    [ProducesResponseType(typeof(PaginatedList<TaskListDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PaginatedList<TaskListDto>>> GetTasksByProject(
        Guid projectId,
        [FromQuery] TaskQueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.GetTasksByProjectAsync(projectId, queryParams, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Get task summary statistics for a project.
    /// </summary>
    [HttpGet("/api/projects/{projectId:guid}/tasks/summary")]
    [ProducesResponseType(typeof(TaskSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskSummaryDto>> GetTaskSummary(
        Guid projectId,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.GetTaskSummaryAsync(projectId, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new task in a project.
    /// </summary>
    [HttpPost("/api/projects/{projectId:guid}/tasks")]
    [ProducesResponseType(typeof(TaskDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskDetailDto>> CreateTask(
        Guid projectId,
        [FromBody] CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.CreateTaskAsync(projectId, request, cancellationToken);

        if (result.IsSuccess && result.Data != null)
        {
            return CreatedAtAction(
                nameof(GetTask),
                new { id = result.Data.Id },
                result.Data);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Get a specific task by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(TaskDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskDetailDto>> GetTask(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.GetTaskByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Update an existing task.
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskDetailDto>> UpdateTask(
        Guid id,
        [FromBody] UpdateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.UpdateTaskAsync(id, request, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a task (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTask(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.DeleteTaskAsync(id, cancellationToken);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return result.ErrorType switch
        {
            ResultErrorType.NotFound => NotFound(new { error = result.Error }),
            ResultErrorType.Forbidden => Forbid(),
            _ => BadRequest(new { error = result.Error })
        };
    }

    /// <summary>
    /// Update only the task status.
    /// </summary>
    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(typeof(TaskDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskDetailDto>> UpdateTaskStatus(
        Guid id,
        [FromBody] UpdateTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.UpdateTaskStatusAsync(id, request, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Assign a task to a user.
    /// </summary>
    [HttpPut("{id:guid}/assign")]
    [ProducesResponseType(typeof(TaskDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskDetailDto>> AssignTask(
        Guid id,
        [FromBody] AssignTaskRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.AssignTaskAsync(id, request, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Reorder a task within the project.
    /// </summary>
    [HttpPut("{id:guid}/reorder")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderTask(
        Guid id,
        [FromBody] ReorderTaskRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.ReorderTaskAsync(id, request, cancellationToken);

        if (result.IsSuccess)
        {
            return Ok(new { success = true });
        }

        return result.ErrorType switch
        {
            ResultErrorType.NotFound => NotFound(new { error = result.Error }),
            ResultErrorType.Forbidden => Forbid(),
            _ => BadRequest(new { error = result.Error })
        };
    }

    /// <summary>
    /// Get all tasks assigned to the current user.
    /// </summary>
    [HttpGet("my")]
    [ProducesResponseType(typeof(PaginatedList<TaskListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedList<TaskListDto>>> GetMyTasks(
        [FromQuery] TaskQueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var result = await _taskService.GetMyTasksAsync(queryParams, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Get task summary statistics for the current user.
    /// </summary>
    [HttpGet("my/summary")]
    [ProducesResponseType(typeof(TaskSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TaskSummaryDto>> GetMyTaskSummary(
        CancellationToken cancellationToken)
    {
        var result = await _taskService.GetMyTaskSummaryAsync(cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Check if the current user can edit the task.
    /// </summary>
    [HttpGet("{id:guid}/can-edit")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> CanEditTask(
        Guid id,
        CancellationToken cancellationToken)
    {
        var canEdit = await _taskService.CanUserEditTaskAsync(id, cancellationToken);
        return Ok(canEdit);
    }
}
