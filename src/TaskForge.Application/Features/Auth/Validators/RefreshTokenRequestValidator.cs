using FluentValidation;
using TaskForge.Application.Features.Auth.DTOs;

namespace TaskForge.Application.Features.Auth.Validators;

/// <summary>
/// Validator for RefreshTokenRequest.
/// </summary>
public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.AccessToken)
            .NotEmpty().WithMessage("Access token is required");

        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required");
    }
}
