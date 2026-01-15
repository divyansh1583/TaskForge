namespace TaskForge.Domain.Enums;

/// <summary>
/// Project status enumeration.
/// WHY: Provides clear project lifecycle states for filtering and reporting.
/// </summary>
public enum ProjectStatus
{
    Active = 0,
    OnHold = 1,
    Completed = 2,
    Cancelled = 3
}
