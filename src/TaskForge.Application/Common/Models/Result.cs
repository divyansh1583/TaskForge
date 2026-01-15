namespace TaskForge.Application.Common.Models;

/// <summary>
/// Generic wrapper for API responses providing consistent response structure.
/// WHY: Standardizes API responses across all endpoints, making it easier for 
/// frontend to handle responses and display appropriate messages.
/// </summary>
/// <typeparam name="T">The type of data being returned</typeparam>
public class Result<T>
{
    public bool Succeeded { get; private set; }
    public T? Data { get; private set; }
    public string? Message { get; private set; }
    public List<string> Errors { get; private set; } = new();

    private Result(bool succeeded, T? data, string? message, List<string>? errors)
    {
        Succeeded = succeeded;
        Data = data;
        Message = message;
        Errors = errors ?? new List<string>();
    }

    public static Result<T> Success(T data, string? message = null)
        => new(true, data, message, null);

    public static Result<T> Failure(string error)
        => new(false, default, null, new List<string> { error });

    public static Result<T> Failure(List<string> errors)
        => new(false, default, null, errors);
}

/// <summary>
/// Non-generic result for operations that don't return data.
/// </summary>
public class Result
{
    public bool Succeeded { get; private set; }
    public string? Message { get; private set; }
    public List<string> Errors { get; private set; } = new();

    private Result(bool succeeded, string? message, List<string>? errors)
    {
        Succeeded = succeeded;
        Message = message;
        Errors = errors ?? new List<string>();
    }

    public static Result Success(string? message = null)
        => new(true, message, null);

    public static Result Failure(string error)
        => new(false, null, new List<string> { error });

    public static Result Failure(List<string> errors)
        => new(false, null, errors);
}
