namespace TaskForge.Application.Common.Exceptions;

/// <summary>
/// Exception thrown for bad requests that don't fit validation errors.
/// WHY: Returns proper 400 Bad Request for business rule violations.
/// </summary>
public class BadRequestException : Exception
{
    public BadRequestException() : base()
    {
    }

    public BadRequestException(string message) : base(message)
    {
    }

    public BadRequestException(string message, Exception innerException) 
        : base(message, innerException)
    {
    }
}
