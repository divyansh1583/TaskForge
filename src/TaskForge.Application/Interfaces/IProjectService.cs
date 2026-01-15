using TaskForge.Application.Common;
using TaskForge.Application.DTOs.Projects;

namespace TaskForge.Application.Interfaces;

/// <summary>
/// Interface for project operations.
/// WHY: Defines the contract for project management, allowing
/// Infrastructure to implement without Application depending on it.
/// </summary>
public interface IProjectService
{
    /// <summary>
    /// Get paginated list of projects with filtering and sorting.
    /// </summary>
    Task<Result<PaginatedList<ProjectListDto>>> GetProjectsAsync(
        ProjectQueryParams queryParams,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get a single project by ID with full details.
    /// </summary>
    Task<Result<ProjectDetailDto>> GetProjectByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Create a new project.
    /// </summary>
    Task<Result<ProjectDetailDto>> CreateProjectAsync(
        CreateProjectRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing project.
    /// </summary>
    Task<Result<ProjectDetailDto>> UpdateProjectAsync(
        Guid id,
        UpdateProjectRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Soft delete a project.
    /// </summary>
    Task<Result<bool>> DeleteProjectAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if the current user can edit the project.
    /// </summary>
    Task<bool> CanUserEditProjectAsync(
        Guid projectId,
        CancellationToken cancellationToken = default);
}
