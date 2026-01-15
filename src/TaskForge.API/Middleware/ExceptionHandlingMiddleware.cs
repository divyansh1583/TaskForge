using System.Net;
using System.Text.Json;
using TaskForge.Application.Common.Exceptions;

namespace TaskForge.API.Middleware;

/// <summary>
/// Global exception handling middleware.
/// WHY: Centralizes exception handling, ensuring consistent error responses
/// and preventing sensitive information leakage in production.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, response) = exception switch
        {
            ValidationException validationEx => (
                HttpStatusCode.BadRequest,
                new ErrorResponse
                {
                    Type = "ValidationError",
                    Title = "One or more validation errors occurred.",
                    Status = (int)HttpStatusCode.BadRequest,
                    Errors = validationEx.Errors
                }),

            NotFoundException notFoundEx => (
                HttpStatusCode.NotFound,
                new ErrorResponse
                {
                    Type = "NotFound",
                    Title = notFoundEx.Message,
                    Status = (int)HttpStatusCode.NotFound
                }),

            ForbiddenAccessException forbiddenEx => (
                HttpStatusCode.Forbidden,
                new ErrorResponse
                {
                    Type = "Forbidden",
                    Title = forbiddenEx.Message,
                    Status = (int)HttpStatusCode.Forbidden
                }),

            BadRequestException badRequestEx => (
                HttpStatusCode.BadRequest,
                new ErrorResponse
                {
                    Type = "BadRequest",
                    Title = badRequestEx.Message,
                    Status = (int)HttpStatusCode.BadRequest
                }),

            UnauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                new ErrorResponse
                {
                    Type = "Unauthorized",
                    Title = "You are not authorized to access this resource.",
                    Status = (int)HttpStatusCode.Unauthorized
                }),

            _ => (
                HttpStatusCode.InternalServerError,
                new ErrorResponse
                {
                    Type = "InternalServerError",
                    Title = _environment.IsDevelopment() 
                        ? exception.Message 
                        : "An unexpected error occurred.",
                    Status = (int)HttpStatusCode.InternalServerError,
                    Detail = _environment.IsDevelopment() ? exception.StackTrace : null
                })
        };

        // Log the exception
        if (statusCode == HttpStatusCode.InternalServerError)
        {
            _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);
        }
        else
        {
            _logger.LogWarning("A handled exception occurred: {Type} - {Message}", 
                exception.GetType().Name, exception.Message);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}

/// <summary>
/// Standard error response format following RFC 7807.
/// WHY: Consistent error format makes it easier for clients to handle errors.
/// </summary>
public class ErrorResponse
{
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int Status { get; set; }
    public string? Detail { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }
}
