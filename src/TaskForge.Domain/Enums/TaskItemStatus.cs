namespace TaskForge.Domain.Enums;

/// <summary>
/// Task status enumeration representing the lifecycle of a task.
/// WHY: Provides clear task states for tracking progress,
/// filtering, and reporting in Kanban/Scrum workflows.
/// </summary>
public enum TaskItemStatus
{
    /// <summary>
    /// Task is created but work has not started.
    /// </summary>
    Open = 0,

    /// <summary>
    /// Task is actively being worked on.
    /// </summary>
    InProgress = 1,

    /// <summary>
    /// Task is completed and awaiting review.
    /// </summary>
    InReview = 2,

    /// <summary>
    /// Task has been completed and approved.
    /// </summary>
    Done = 3,

    /// <summary>
    /// Task has been cancelled and will not be completed.
    /// </summary>
    Cancelled = 4
}
