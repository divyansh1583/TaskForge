namespace TaskForge.Domain.Common;

/// <summary>
/// Base entity class that provides common properties for all domain entities.
/// WHY: Ensures consistency across all entities with audit fields and soft delete support.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public string? CreatedBy { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
    
    public string? UpdatedBy { get; set; }
    
    /// <summary>
    /// Soft delete flag - data is never physically removed from the database.
    /// WHY: Maintains data integrity, audit trail, and allows recovery of deleted items.
    /// </summary>
    public bool IsDeleted { get; set; }
    
    public DateTime? DeletedAt { get; set; }
    
    public string? DeletedBy { get; set; }
}
