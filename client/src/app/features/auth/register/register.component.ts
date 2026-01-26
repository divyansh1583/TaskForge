import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ApiError } from '@core/models/api.model';

/**
 * Custom validator for password matching.
 */
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

/**
 * Custom validator for password strength.
 */
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumeric = /[0-9]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  const errors: ValidationErrors = {};

  if (!hasUpperCase) errors['noUpperCase'] = true;
  if (!hasLowerCase) errors['noLowerCase'] = true;
  if (!hasNumeric) errors['noNumeric'] = true;
  if (!hasSpecialChar) errors['noSpecialChar'] = true;

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Register component with comprehensive form validation.
 * WHY: Implements production-grade registration with strong password
 * requirements and helpful user feedback.
 */
@Component({
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="card-body p-8">
      <h2 class="text-2xl font-bold text-center text-secondary-900 mb-6">
        Create Account
      </h2>

      <!-- Error Alert -->
      @if (errorMessage()) {
        <div class="alert-error mb-6">
          <div class="flex items-start">
            <svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <div>
              <span>{{ errorMessage() }}</span>
              @if (errorDetails().length > 0) {
                <ul class="mt-2 list-disc list-inside text-sm">
                  @for (error of errorDetails(); track error) {
                    <li>{{ error }}</li>
                  }
                </ul>
              }
            </div>
          </div>
        </div>
      }

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <!-- Name Fields -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label for="firstName" class="form-label">First Name</label>
            <input
              type="text"
              id="firstName"
              formControlName="firstName"
              [class]="getFieldClass('firstName')"
              placeholder="John"
              autocomplete="given-name"
            />
            @if (showError('firstName')) {
              <p class="form-error">{{ getErrorMessage('firstName') }}</p>
            }
          </div>

          <div class="form-group">
            <label for="lastName" class="form-label">Last Name</label>
            <input
              type="text"
              id="lastName"
              formControlName="lastName"
              [class]="getFieldClass('lastName')"
              placeholder="Doe"
              autocomplete="family-name"
            />
            @if (showError('lastName')) {
              <p class="form-error">{{ getErrorMessage('lastName') }}</p>
            }
          </div>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            formControlName="email"
            [class]="getFieldClass('email')"
            placeholder="you@example.com"
            autocomplete="email"
          />
          @if (showError('email')) {
            <p class="form-error">{{ getErrorMessage('email') }}</p>
          }
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="relative">
            <input
              [type]="showPassword() ? 'text' : 'password'"
              id="password"
              formControlName="password"
              [class]="getFieldClass('password')"
              placeholder="••••••••"
              autocomplete="new-password"
            />
            <button
              type="button"
              (click)="togglePasswordVisibility()"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-secondary-400 hover:text-secondary-600"
            >
              @if (showPassword()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              }
            </button>
          </div>
          @if (showError('password')) {
            <p class="form-error">{{ getErrorMessage('password') }}</p>
          }

          <!-- Password Strength Indicators -->
          @if (registerForm.get('password')?.value) {
            <div class="mt-2 space-y-1">
              <div class="flex items-center text-xs">
                <span [class]="getStrengthClass('minLength')">
                  {{ getStrengthIcon('minLength') }}
                </span>
                <span class="ml-2">At least 8 characters</span>
              </div>
              <div class="flex items-center text-xs">
                <span [class]="getStrengthClass('uppercase')">
                  {{ getStrengthIcon('uppercase') }}
                </span>
                <span class="ml-2">One uppercase letter</span>
              </div>
              <div class="flex items-center text-xs">
                <span [class]="getStrengthClass('lowercase')">
                  {{ getStrengthIcon('lowercase') }}
                </span>
                <span class="ml-2">One lowercase letter</span>
              </div>
              <div class="flex items-center text-xs">
                <span [class]="getStrengthClass('number')">
                  {{ getStrengthIcon('number') }}
                </span>
                <span class="ml-2">One number</span>
              </div>
              <div class="flex items-center text-xs">
                <span [class]="getStrengthClass('special')">
                  {{ getStrengthIcon('special') }}
                </span>
                <span class="ml-2">One special character</span>
              </div>
            </div>
          }
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            formControlName="confirmPassword"
            [class]="getFieldClass('confirmPassword')"
            placeholder="••••••••"
            autocomplete="new-password"
          />
          @if (showError('confirmPassword')) {
            <p class="form-error">{{ getErrorMessage('confirmPassword') }}</p>
          }
        </div>

        <!-- Terms Checkbox -->
        <div class="flex items-start">
          <input
            type="checkbox"
            id="acceptTerms"
            formControlName="acceptTerms"
            class="w-4 h-4 mt-0.5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
          />
          <label for="acceptTerms" class="ml-2 text-sm text-secondary-600">
            I agree to the
            <a href="#" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
            and
            <a href="#" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
          </label>
        </div>
        @if (showError('acceptTerms')) {
          <p class="form-error -mt-3">You must accept the terms and conditions</p>
        }

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="isLoading()"
          class="btn-primary w-full btn-lg"
        >
          @if (isLoading()) {
            <span class="spinner-sm mr-2"></span>
            Creating account...
          } @else {
            Create Account
          }
        </button>
      </form>

      <!-- Login Link -->
      <p class="mt-6 text-center text-sm text-secondary-600">
        Already have an account?
        <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-500 font-medium">
          Sign in
        </a>
      </p>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  errorDetails = signal<string[]>([]);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z\s\-']+$/),
          ],
        ],
        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(50),
            Validators.pattern(/^[a-zA-Z\s\-']+$/),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(100),
            passwordStrengthValidator,
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      { validators: passwordMatchValidator }
    );
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.errorDetails.set([]);

    const { firstName, lastName, email, password, confirmPassword } =
      this.registerForm.value;

    this.authService
      .register({ firstName, lastName, email, password, confirmPassword })
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error: ApiError) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            error.title || 'Registration failed. Please try again.'
          );

          // Extract detailed errors
          if (error.errors) {
            const details: string[] = [];
            Object.values(error.errors).forEach((messages) => {
              details.push(...messages);
            });
            this.errorDetails.set(details);
          }
        },
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  showError(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldClass(field: string): string {
    return this.showError(field) ? 'form-input-error' : 'form-input';
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return `${this.getFieldLabel(field)} is required`;
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['minlength']) {
      return `${this.getFieldLabel(field)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['maxlength']) {
      return `${this.getFieldLabel(field)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
    }
    if (control.errors['pattern']) {
      return `${this.getFieldLabel(field)} contains invalid characters`;
    }
    if (control.errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    if (control.errors['noUpperCase'] || control.errors['noLowerCase'] ||
        control.errors['noNumeric'] || control.errors['noSpecialChar']) {
      return 'Password does not meet requirements';
    }
    return 'Invalid input';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
    };
    return labels[field] || field;
  }

  // Password strength indicator helpers
  getStrengthClass(type: string): string {
    const password = this.registerForm.get('password')?.value || '';
    let isValid = false;

    switch (type) {
      case 'minLength':
        isValid = password.length >= 8;
        break;
      case 'uppercase':
        isValid = /[A-Z]/.test(password);
        break;
      case 'lowercase':
        isValid = /[a-z]/.test(password);
        break;
      case 'number':
        isValid = /[0-9]/.test(password);
        break;
      case 'special':
        isValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        break;
    }

    return isValid ? 'text-green-600' : 'text-secondary-400';
  }

  getStrengthIcon(type: string): string {
    const password = this.registerForm.get('password')?.value || '';
    let isValid = false;

    switch (type) {
      case 'minLength':
        isValid = password.length >= 8;
        break;
      case 'uppercase':
        isValid = /[A-Z]/.test(password);
        break;
      case 'lowercase':
        isValid = /[a-z]/.test(password);
        break;
      case 'number':
        isValid = /[0-9]/.test(password);
        break;
      case 'special':
        isValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        break;
    }

    return isValid ? '✓' : '○';
  }
}
