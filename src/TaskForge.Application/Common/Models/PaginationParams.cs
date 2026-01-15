namespace TaskForge.Application.Common.Models;

/// <summary>
/// Base class for pagination query parameters.
/// WHY: Standardizes pagination parameters across all list endpoints,
/// with sensible defaults and maximum limits to prevent abuse.
/// </summary>
public class PaginationParams
{
    private const int MaxPageSize = 100;
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

    public string? SortBy { get; set; }
    
    public bool SortDescending { get; set; }
    
    public string? SearchTerm { get; set; }
}
