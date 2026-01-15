using FluentValidation;
using TaskForge.Application.DTOs.Auth;

namespace TaskForge.Application.Features.Auth.Validators;

/// <summary>
/// Validator for LoginRequest.
/// </summary>
public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required");
    }
}
