using FluentValidation;
using TaskForge.Application.DTOs.Teams;

namespace TaskForge.Application.Features.Projects.Validators;

/// <summary>
/// Validator for AddTeamMemberRequest.
/// </summary>
public class AddTeamMemberRequestValidator : AbstractValidator<AddTeamMemberRequest>
{
    public AddTeamMemberRequestValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required");

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("Invalid team role")
            .When(x => x.Role.HasValue);
    }
}

/// <summary>
/// Validator for UpdateTeamMemberRequest.
/// </summary>
public class UpdateTeamMemberRequestValidator : AbstractValidator<UpdateTeamMemberRequest>
{
    public UpdateTeamMemberRequestValidator()
    {
        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("Invalid team role");
    }
}

/// <summary>
/// Validator for UpdateTeamRequest.
/// </summary>
public class UpdateTeamRequestValidator : AbstractValidator<UpdateTeamRequest>
{
    public UpdateTeamRequestValidator()
    {
        RuleFor(x => x.Name)
            .MinimumLength(2).WithMessage("Team name must be at least 2 characters")
            .MaximumLength(100).WithMessage("Team name must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
