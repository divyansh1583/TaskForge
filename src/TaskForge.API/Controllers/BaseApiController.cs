using Microsoft.AspNetCore.Mvc;

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
}
