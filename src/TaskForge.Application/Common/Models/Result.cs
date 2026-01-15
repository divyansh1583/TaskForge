namespace TaskForge.Application.Common;

/// <summary>
/// Enum representing the type of error that occurred.
/// WHY: Provides consistent error categorization for proper HTTP status code mapping.
/// </summary>
public enum ResultErrorType
{
    None,
    Validation,
    NotFound,
    Unauthorized,
    Forbidden,
    Conflict,
    InternalError
}

/// <summary>
/// Generic wrapper for operation results providing consistent structure.
/// WHY: Standardizes operation results across all services, making it easier
/// to handle responses and map to appropriate HTTP status codes.
/// </summary>
/// <typeparam name="T">The type of data being returned</typeparam>
public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public bool Succeeded => IsSuccess; // Alias for backward compatibility
    public T? Data { get; private set; }
    public string? Error { get; private set; }
    public ResultErrorType ErrorType { get; private set; }
    public List<string> Errors { get; private set; } = new();

    private Result(bool isSuccess, T? data, string? error, ResultErrorType errorType)
    {
        IsSuccess = isSuccess;
        Data = data;
        Error = error;
        ErrorType = errorType;
        if (!string.IsNullOrEmpty(error))
        {
            Errors.Add(error);
        }
    }

    public static Result<T> Success(T data)
        => new(true, data, null, ResultErrorType.None);

    public static Result<T> Failure(string error, ResultErrorType errorType = ResultErrorType.Validation)
        => new(false, default, error, errorType);

    public static Result<T> Failure(List<string> errors, ResultErrorType errorType = ResultErrorType.Validation)
    {
        var result = new Result<T>(false, default, errors.FirstOrDefault(), errorType);
        result.Errors = errors;
        return result;
    }
}

/// <summary>
/// Non-generic result for operations that don not return data.
/// </summary>
public class Result
{
    public bool IsSuccess { get; private set; }
    public bool Succeeded => IsSuccess; // Alias for backward compatibility
    public string? Error { get; private set; }
    public ResultErrorType ErrorType { get; private set; }
    public List<string> Errors { get; private set; } = new();

    private Result(bool isSuccess, string? error, ResultErrorType errorType)
    {
        IsSuccess = isSuccess;
        Error = error;
        ErrorType = errorType;
        if (!string.IsNullOrEmpty(error))
        {
            Errors.Add(error);
        }
    }

    public static Result Success()
        => new(true, null, ResultErrorType.None);

    public static Result Failure(string error, ResultErrorType errorType = ResultErrorType.Validation)
        => new(false, error, errorType);

    public static Result Failure(List<string> errors, ResultErrorType errorType = ResultErrorType.Validation)
    {
        var result = new Result(false, errors.FirstOrDefault(), errorType);
        result.Errors = errors;
        return result;
    }
}
