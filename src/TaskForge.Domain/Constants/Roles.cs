namespace TaskForge.Domain.Constants;

/// <summary>
/// Static class containing role names used throughout the application.
/// WHY: Centralizes role names to prevent magic strings and typos,
/// making role management consistent and maintainable.
/// </summary>
public static class Roles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Member = "Member";
    
    public static readonly IReadOnlyList<string> All = new[] { Admin, Manager, Member };
}
