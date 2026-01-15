namespace TaskForge.Application.Common.Exceptions;

/// <summary>
/// Exception thrown when user lacks permission to perform an action.
/// WHY: Returns proper 403 Forbidden status code, distinct from 401 Unauthorized.
/// </summary>
public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base("You do not have permission to access this resource.")
    {
    }

    public ForbiddenAccessException(string message) : base(message)
    {
    }
}
