using Microsoft.AspNetCore.Mvc;
using TaskForge.Application.Common;

namespace TaskForge.API.Controllers;

/// <summary>
/// Base controller with common functionality for all API controllers.
/// WHY: Centralizes common controller configuration and reduces duplication.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Handles a Result<T> and returns the appropriate ActionResult.
    /// WHY: Provides consistent HTTP status code mapping based on result type.
    /// </summary>
    protected ActionResult<T> HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            return result.Data == null ? NoContent() : Ok(result.Data);
        }

        return result.ErrorType switch
        {
            ResultErrorType.NotFound => NotFound(new { error = result.Error }),
            ResultErrorType.Validation => BadRequest(new { error = result.Error }),
            ResultErrorType.Unauthorized => Unauthorized(new { error = result.Error }),
            ResultErrorType.Forbidden => Forbid(),
            _ => BadRequest(new { error = result.Error })
        };
    }

    /// <summary>
    /// Handles a non-generic Result and returns the appropriate ActionResult.
    /// </summary>
    protected IActionResult HandleResult(Result result)
    {
        if (result.IsSuccess)
        {
            return Ok();
        }

        return result.ErrorType switch
        {
            ResultErrorType.NotFound => NotFound(new { error = result.Error }),
            ResultErrorType.Validation => BadRequest(new { error = result.Error }),
            ResultErrorType.Unauthorized => Unauthorized(new { error = result.Error }),
            ResultErrorType.Forbidden => Forbid(),
            _ => BadRequest(new { error = result.Error })
        };
    }
}
