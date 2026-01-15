using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Projects;
using TaskForge.Application.Interfaces;
using TaskForge.Domain.Constants;

namespace TaskForge.API.Controllers;

/// <summary>
/// API endpoints for managing projects.
/// WHY: Provides CRUD operations for projects with proper authorization,
/// pagination, and filtering support.
/// </summary>
[Authorize]
public class ProjectsController : BaseApiController
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>
    /// Get all projects with pagination and filtering.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedList<ProjectListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedList<ProjectListDto>>> GetProjects(
        [FromQuery] ProjectQueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var result = await _projectService.GetProjectsAsync(queryParams, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Get a specific project by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDetailDto>> GetProject(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _projectService.GetProjectByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Create a new project.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ProjectDetailDto>> CreateProject(
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _projectService.CreateProjectAsync(request, cancellationToken);

        if (result.IsSuccess && result.Data != null)
        {
            return CreatedAtAction(
                nameof(GetProject),
                new { id = result.Data.Id },
                result.Data);
        }

        return HandleResult(result);
    }

    /// <summary>
    /// Update an existing project.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDetailDto>> UpdateProject(
        Guid id,
        [FromBody] UpdateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _projectService.UpdateProjectAsync(id, request, cancellationToken);
        return HandleResult(result);
    }

    /// <summary>
    /// Delete a project (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Manager}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProject(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _projectService.DeleteProjectAsync(id, cancellationToken);

        if (result.IsSuccess)
        {
            return NoContent();
        }

        return result.ErrorType switch
        {
            ResultErrorType.NotFound => NotFound(new { error = result.Error }),
            ResultErrorType.Forbidden => Forbid(),
            _ => BadRequest(new { error = result.Error })
        };
    }

    /// <summary>
    /// Check if the current user can edit a specific project.
    /// </summary>
    [HttpGet("{id:guid}/can-edit")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> CanEditProject(
        Guid id,
        CancellationToken cancellationToken)
    {
        var canEdit = await _projectService.CanUserEditProjectAsync(id, cancellationToken);
        return Ok(canEdit);
    }
}
