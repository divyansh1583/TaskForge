using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace TaskForge.Application;

/// <summary>
/// Extension methods for configuring Application layer services.
/// WHY: Encapsulates DI configuration, keeping Program.cs clean and 
/// making the Application layer self-contained.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Register all validators from this assembly
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        return services;
    }
}
