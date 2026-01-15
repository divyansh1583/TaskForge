namespace TaskForge.Domain.Common;

/// <summary>
/// Marker interface for aggregate roots in DDD.
/// WHY: Aggregates are consistency boundaries - only aggregate roots should be 
/// directly accessed from repositories, ensuring transactional consistency.
/// </summary>
public interface IAggregateRoot
{
}
