using TaskForge.Domain.Enums;

namespace TaskForge.Application.DTOs.Tasks;

/// <summary>
/// DTO for task list items with summary information.
/// </summary>
public class TaskListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public TaskPriority Priority { get; set; }
    public string PriorityName => Priority.ToString();
    public DateTime? DueDate { get; set; }
    public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.UtcNow && Status != TaskItemStatus.Done && Status != TaskItemStatus.Cancelled;
    public int? EstimatedHours { get; set; }
    public Guid ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public string? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeEmail { get; set; }
    public int DisplayOrder { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for detailed task information.
/// </summary>
public class TaskDetailDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public TaskPriority Priority { get; set; }
    public string PriorityName => Priority.ToString();
    public DateTime? DueDate { get; set; }
    public bool IsOverdue => DueDate.HasValue && DueDate.Value < DateTime.UtcNow && Status != TaskItemStatus.Done && Status != TaskItemStatus.Cancelled;
    public int? EstimatedHours { get; set; }
    public int? ActualHours { get; set; }
    public Guid ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public string? AssigneeId { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeEmail { get; set; }
    public int DisplayOrder { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}

/// <summary>
/// DTO for creating a new task.
/// </summary>
public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public int? EstimatedHours { get; set; }
    public string? AssigneeId { get; set; }
    public string? Tags { get; set; }
}

/// <summary>
/// DTO for updating an existing task.
/// </summary>
public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public TaskItemStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public int? EstimatedHours { get; set; }
    public int? ActualHours { get; set; }
    public string? AssigneeId { get; set; }
    public string? Tags { get; set; }
}

/// <summary>
/// DTO for updating task status only.
/// </summary>
public class UpdateTaskStatusRequest
{
    public TaskItemStatus Status { get; set; }
}

/// <summary>
/// DTO for assigning a task to a user.
/// </summary>
public class AssignTaskRequest
{
    public string? AssigneeId { get; set; }
}

/// <summary>
/// DTO for reordering tasks.
/// </summary>
public class ReorderTaskRequest
{
    public int NewDisplayOrder { get; set; }
}

/// <summary>
/// Query parameters for filtering tasks.
/// </summary>
public class TaskQueryParams
{
    private const int MaxPageSize = 100;
    private int _pageSize = 20;
    private int _pageNumber = 1;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? 1 : value;
    }

    public string? SearchTerm { get; set; }
    public TaskItemStatus? Status { get; set; }
    public TaskPriority? Priority { get; set; }
    public string? AssigneeId { get; set; }
    public bool? IsOverdue { get; set; }
    public DateTime? DueBefore { get; set; }
    public DateTime? DueAfter { get; set; }
    public string? Tags { get; set; }
    public string? SortBy { get; set; } = "DisplayOrder";
    public bool SortDescending { get; set; } = false;
}

/// <summary>
/// Summary statistics for tasks in a project.
/// </summary>
public class TaskSummaryDto
{
    public int TotalTasks { get; set; }
    public int OpenTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int InReviewTasks { get; set; }
    public int DoneTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int UnassignedTasks { get; set; }
}
