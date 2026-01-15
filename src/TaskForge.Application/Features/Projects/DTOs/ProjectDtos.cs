using TaskForge.Domain.Enums;

namespace TaskForge.Application.Features.Projects.DTOs;

/// <summary>
/// DTO for project list items with summary information.
/// </summary>
public class ProjectListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public int TeamMemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO for detailed project information including team.
/// </summary>
public class ProjectDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; }
    public string StatusName => Status.ToString();
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string OwnerId { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public TeamDto? Team { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new project.
/// </summary>
public class CreateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

/// <summary>
/// DTO for updating an existing project.
/// </summary>
public class UpdateProjectRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

/// <summary>
/// Query parameters for filtering projects.
/// </summary>
public class ProjectQueryParams
{
    private const int MaxPageSize = 50;
    private int _pageSize = 10;
    private int _pageNumber = 1;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? 1 : value;
    }

    public string? SearchTerm { get; set; }
    public ProjectStatus? Status { get; set; }
    public string? OwnerId { get; set; }
    public string? SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}
