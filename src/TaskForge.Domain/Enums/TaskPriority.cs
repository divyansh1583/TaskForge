namespace TaskForge.Domain.Enums;

/// <summary>
/// Task priority enumeration.
/// WHY: Enables prioritization of tasks for resource allocation
/// and focus on critical work items.
/// </summary>
public enum TaskPriority
{
    /// <summary>
    /// Low priority - can be addressed when time permits.
    /// </summary>
    Low = 0,

    /// <summary>
    /// Medium priority - standard work items.
    /// </summary>
    Medium = 1,

    /// <summary>
    /// High priority - should be addressed promptly.
    /// </summary>
    High = 2,

    /// <summary>
    /// Critical priority - requires immediate attention.
    /// </summary>
    Critical = 3
}
