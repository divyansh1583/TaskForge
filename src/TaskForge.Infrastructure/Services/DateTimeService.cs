using TaskForge.Application.Interfaces;

namespace TaskForge.Infrastructure.Services;

/// <summary>
/// Implementation of date/time service.
/// WHY: Centralizes time operations for consistent timezone handling
/// and enables mocking in tests.
/// </summary>
public class DateTimeService : IDateTimeService
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
}
