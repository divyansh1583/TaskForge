using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskForge.Domain.Entities;

namespace TaskForge.Infrastructure.Persistence.Configurations;

/// <summary>
/// EF Core configuration for TeamMember entity.
/// </summary>
public class TeamMemberConfiguration : IEntityTypeConfiguration<TeamMember>
{
    public void Configure(EntityTypeBuilder<TeamMember> builder)
    {
        builder.ToTable("TeamMembers");

        builder.HasKey(tm => tm.Id);

        builder.Property(tm => tm.Role)
            .IsRequired();

        builder.Property(tm => tm.JoinedAt)
            .IsRequired();

        // Relationship with User
        builder.HasOne(tm => tm.User)
            .WithMany()
            .HasForeignKey(tm => tm.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Global query filter for soft delete
        builder.HasQueryFilter(tm => !tm.IsDeleted);

        // Composite unique index to prevent duplicate memberships
        builder.HasIndex(tm => new { tm.TeamId, tm.UserId }).IsUnique();

        // Indexes
        builder.HasIndex(tm => tm.UserId);
        builder.HasIndex(tm => tm.Role);
    }
}
