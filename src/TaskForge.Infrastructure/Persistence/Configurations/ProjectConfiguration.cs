using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskForge.Domain.Entities;

namespace TaskForge.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core configuration for Project entity.
/// WHY: Separates entity configuration from DbContext for cleaner code
/// and better maintainability.
/// </summary>
public class ProjectConfiguration : IEntityTypeConfiguration<Project>
{
    public void Configure(EntityTypeBuilder<Project> builder)
    {
        builder.ToTable("Projects");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.Status)
            .IsRequired();

        builder.Property(p => p.OwnerId)
            .IsRequired();

        // Relationship with Owner (ApplicationUser)
        builder.HasOne(p => p.Owner)
            .WithMany()
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationship with Team (one-to-one)
        builder.HasOne(p => p.Team)
            .WithOne(t => t.Project)
            .HasForeignKey<Team>(t => t.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        // Global query filter for soft delete
        builder.HasQueryFilter(p => !p.IsDeleted);

        // Indexes
        builder.HasIndex(p => p.Name);
        builder.HasIndex(p => p.OwnerId);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.CreatedAt);
    }
}
