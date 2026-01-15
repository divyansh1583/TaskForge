namespace TaskForge.Application.Interfaces;

/// <summary>
/// Interface for date/time operations.
/// WHY: Makes code testable by allowing time to be mocked in tests,
/// and centralizes timezone handling across the application.
/// </summary>
public interface IDateTimeService
{
    DateTime Now { get; }
    DateTime UtcNow { get; }
}
