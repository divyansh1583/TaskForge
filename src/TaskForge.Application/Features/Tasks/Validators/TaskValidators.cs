using FluentValidation;
using TaskForge.Application.DTOs.Tasks;

namespace TaskForge.Application.Features.Tasks.Validators;

/// <summary>
/// Validator for CreateTaskRequest.
/// </summary>
public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required")
            .MinimumLength(3).WithMessage("Task title must be at least 3 characters")
            .MaximumLength(200).WithMessage("Task title must not exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid task status")
            .When(x => x.Status.HasValue);

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid task priority")
            .When(x => x.Priority.HasValue);

        RuleFor(x => x.EstimatedHours)
            .GreaterThan(0).WithMessage("Estimated hours must be greater than 0")
            .LessThanOrEqualTo(1000).WithMessage("Estimated hours must not exceed 1000")
            .When(x => x.EstimatedHours.HasValue);

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.UtcNow.AddMinutes(-5))
            .WithMessage("Due date cannot be in the past")
            .When(x => x.DueDate.HasValue);

        RuleFor(x => x.Tags)
            .MaximumLength(500).WithMessage("Tags must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Tags));
    }
}

/// <summary>
/// Validator for UpdateTaskRequest.
/// </summary>
public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .MinimumLength(3).WithMessage("Task title must be at least 3 characters")
            .MaximumLength(200).WithMessage("Task title must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Title));

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid task status")
            .When(x => x.Status.HasValue);

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Invalid task priority")
            .When(x => x.Priority.HasValue);

        RuleFor(x => x.EstimatedHours)
            .GreaterThan(0).WithMessage("Estimated hours must be greater than 0")
            .LessThanOrEqualTo(1000).WithMessage("Estimated hours must not exceed 1000")
            .When(x => x.EstimatedHours.HasValue);

        RuleFor(x => x.ActualHours)
            .GreaterThanOrEqualTo(0).WithMessage("Actual hours cannot be negative")
            .LessThanOrEqualTo(10000).WithMessage("Actual hours must not exceed 10000")
            .When(x => x.ActualHours.HasValue);

        RuleFor(x => x.Tags)
            .MaximumLength(500).WithMessage("Tags must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Tags));
    }
}

/// <summary>
/// Validator for UpdateTaskStatusRequest.
/// </summary>
public class UpdateTaskStatusRequestValidator : AbstractValidator<UpdateTaskStatusRequest>
{
    public UpdateTaskStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Invalid task status");
    }
}

/// <summary>
/// Validator for AssignTaskRequest.
/// </summary>
public class AssignTaskRequestValidator : AbstractValidator<AssignTaskRequest>
{
    public AssignTaskRequestValidator()
    {
        // AssigneeId can be null to unassign, no validation needed
    }
}

/// <summary>
/// Validator for ReorderTaskRequest.
/// </summary>
public class ReorderTaskRequestValidator : AbstractValidator<ReorderTaskRequest>
{
    public ReorderTaskRequestValidator()
    {
        RuleFor(x => x.NewDisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative");
    }
}
