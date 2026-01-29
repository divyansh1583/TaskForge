using TaskForge.Domain.Common;
using TaskForge.Domain.Enums;

namespace TaskForge.Domain.Entities;

/// <summary>
/// TaskItem entity representing a work item within a project.
/// WHY: Core entity for task management, providing the main unit of work
/// that can be assigned, tracked, and completed by team members.
/// Named TaskItem to avoid conflict with System.Threading.Tasks.Task.
/// </summary>
public class TaskItem : BaseEntity, IAggregateRoot
{
    /// <summary>
    /// Title of the task - a short, descriptive name.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed description of the task requirements.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Current status of the task in the workflow.
    /// </summary>
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Open;

    /// <summary>
    /// Priority level for task ordering and focus.
    /// </summary>
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    /// <summary>
    /// Optional due date for task completion.
    /// </summary>
    public DateTime? DueDate { get; set; }

    /// <summary>
    /// Estimated effort in hours (optional).
    /// WHY: Helps with sprint planning and capacity management.
    /// </summary>
    public int? EstimatedHours { get; set; }

    /// <summary>
    /// Actual hours spent on the task (optional).
    /// WHY: Enables time tracking and estimation accuracy improvements.
    /// </summary>
    public int? ActualHours { get; set; }

    /// <summary>
    /// The project this task belongs to.
    /// WHY: Tasks are always associated with a project for organization.
    /// </summary>
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    /// <summary>
    /// The user this task is assigned to (optional).
    /// WHY: Nullable to allow unassigned tasks in the backlog.
    /// </summary>
    public string? AssigneeId { get; set; }
    public ApplicationUser? Assignee { get; set; }

    /// <summary>
    /// Display order within the project for drag-and-drop reordering.
    /// WHY: Allows users to prioritize tasks visually.
    /// </summary>
    public int DisplayOrder { get; set; }

    /// <summary>
    /// Optional tags for categorization (stored as comma-separated string).
    /// WHY: Enables flexible categorization without additional tables.
    /// </summary>
    public string? Tags { get; set; }
}
