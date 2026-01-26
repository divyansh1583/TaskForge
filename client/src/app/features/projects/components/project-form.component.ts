import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { 
  ProjectDetailDto, 
  ProjectStatus, 
  CreateProjectRequest,
  UpdateProjectRequest 
} from '../../../core/models/project.model';

/**
 * Project form component for creating and editing projects.
 * WHY: Reusable form that handles both create and edit operations.
 */
@Component({
    selector: 'app-project-form',
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <!-- Header -->
      <div class="mb-8">
        <nav class="flex items-center text-sm text-gray-500 mb-4">
          <a routerLink="/projects" class="hover:text-primary-600">Projects</a>
          <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <span class="text-gray-900">{{ isEditMode() ? 'Edit Project' : 'New Project' }}</span>
        </nav>
        
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditMode() ? 'Edit Project' : 'Create New Project' }}
        </h1>
        <p class="text-gray-600 mt-1">
          {{ isEditMode() ? 'Update project details and settings' : 'Set up a new project for your team' }}
        </p>
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-red-700">{{ error() }}</span>
          </div>
        </div>
      }

      <!-- Form -->
      @if (!loading()) {
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <!-- Project Name -->
            <div class="mb-6">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                formControlName="name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                [class.border-red-500]="showError('name')"
                placeholder="Enter project name"
              >
              @if (showError('name')) {
                <p class="mt-1 text-sm text-red-500">
                  @if (projectForm.get('name')?.errors?.['required']) {
                    Project name is required
                  } @else if (projectForm.get('name')?.errors?.['minlength']) {
                    Project name must be at least 3 characters
                  } @else if (projectForm.get('name')?.errors?.['maxlength']) {
                    Project name cannot exceed 100 characters
                  }
                </p>
              }
            </div>

            <!-- Project Key (Create mode only) -->
            @if (!isEditMode()) {
              <div class="mb-6">
                <label for="key" class="block text-sm font-medium text-gray-700 mb-1">
                  Project Key <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="key"
                  formControlName="key"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
                  [class.border-red-500]="showError('key')"
                  placeholder="e.g., PROJ"
                  maxlength="10"
                >
                @if (showError('key')) {
                  <p class="mt-1 text-sm text-red-500">
                    @if (projectForm.get('key')?.errors?.['required']) {
                      Project key is required
                    } @else if (projectForm.get('key')?.errors?.['minlength']) {
                      Project key must be at least 2 characters
                    } @else if (projectForm.get('key')?.errors?.['maxlength']) {
                      Project key cannot exceed 10 characters
                    } @else if (projectForm.get('key')?.errors?.['pattern']) {
                      Project key must contain only uppercase letters and numbers
                    }
                  </p>
                } @else {
                  <p class="mt-1 text-sm text-gray-500">
                    A unique identifier for your project (e.g., TF for TaskForge)
                  </p>
                }
              </div>
            }

            <!-- Description -->
            <div class="mb-6">
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                formControlName="description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                [class.border-red-500]="showError('description')"
                placeholder="Describe your project..."
              ></textarea>
              @if (showError('description')) {
                <p class="mt-1 text-sm text-red-500">
                  Description cannot exceed 2000 characters
                </p>
              }
            </div>

            <!-- Status (Edit mode only) -->
            @if (isEditMode()) {
              <div class="mb-6">
                <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  formControlName="status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  @for (status of statusOptions; track status.value) {
                    <option [ngValue]="status.value">{{ status.label }}</option>
                  }
                </select>
              </div>
            }

            <!-- Date Range -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  formControlName="startDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  formControlName="endDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  [class.border-red-500]="showError('endDate')"
                >
                @if (showError('endDate')) {
                  <p class="mt-1 text-sm text-red-500">
                    End date must be after start date
                  </p>
                }
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-4">
            <a
              routerLink="/projects"
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              [disabled]="submitting() || projectForm.invalid"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              @if (submitting()) {
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEditMode() ? 'Saving...' : 'Creating...' }}
              } @else {
                {{ isEditMode() ? 'Save Changes' : 'Create Project' }}
              }
            </button>
          </div>
        </form>
      }

      <!-- Delete Section (Edit mode only) -->
      @if (isEditMode() && !loading()) {
        <div class="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 class="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
          <p class="text-red-700 text-sm mb-4">
            Deleting a project is permanent and cannot be undone. All associated data will be lost.
          </p>
          <button
            type="button"
            (click)="confirmDelete()"
            [disabled]="deleting()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
          >
            @if (deleting()) {
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            } @else {
              Delete Project
            }
          </button>
        </div>
      }
    </div>
  `
})
export class ProjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);

  // State signals
  isEditMode = signal(false);
  loading = signal(false);
  submitting = signal(false);
  deleting = signal(false);
  error = signal<string | null>(null);
  projectId = signal<string | null>(null);

  // Form
  projectForm!: FormGroup;

  // Status options
  statusOptions = [
    { value: ProjectStatus.NotStarted, label: 'Not Started' },
    { value: ProjectStatus.Planning, label: 'Planning' },
    { value: ProjectStatus.InProgress, label: 'In Progress' },
    { value: ProjectStatus.OnHold, label: 'On Hold' },
    { value: ProjectStatus.Completed, label: 'Completed' },
    { value: ProjectStatus.Cancelled, label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    
    // Check if we're in edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.projectId.set(id);
      this.loadProject(id);
    }
  }

  private initializeForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      key: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10), Validators.pattern(/^[A-Z0-9]+$/)]],
      description: ['', [Validators.maxLength(2000)]],
      status: [ProjectStatus.NotStarted],
      startDate: [null],
      endDate: [null]
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  private loadProject(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.patchFormWithProject(project);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.error.set('Failed to load project. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private patchFormWithProject(project: ProjectDetailDto): void {
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate ? this.formatDateForInput(project.startDate) : null,
      endDate: project.endDate ? this.formatDateForInput(project.endDate) : null
    });
    
    // Disable key field in edit mode
    this.projectForm.get('key')?.disable();
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  showError(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      // Mark all fields as touched to show errors
      Object.keys(this.projectForm.controls).forEach(key => {
        this.projectForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    if (this.isEditMode()) {
      this.updateProject();
    } else {
      this.createProject();
    }
  }

  private createProject(): void {
    const formValue = this.projectForm.value;
    
    const request: CreateProjectRequest = {
      name: formValue.name,
      key: formValue.key.toUpperCase(),
      description: formValue.description || undefined,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined
    };

    this.projectService.createProject(request).subscribe({
      next: (project) => {
        this.submitting.set(false);
        this.router.navigate(['/projects', project.id]);
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.error.set(err.error?.message || 'Failed to create project. Please try again.');
        this.submitting.set(false);
      }
    });
  }

  private updateProject(): void {
    const formValue = this.projectForm.getRawValue();
    const id = this.projectId();
    
    if (!id) return;

    const request: UpdateProjectRequest = {
      name: formValue.name,
      description: formValue.description || undefined,
      status: formValue.status,
      startDate: formValue.startDate || undefined,
      endDate: formValue.endDate || undefined
    };

    this.projectService.updateProject(id, request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/projects', id]);
      },
      error: (err) => {
        console.error('Error updating project:', err);
        this.error.set(err.error?.message || 'Failed to update project. Please try again.');
        this.submitting.set(false);
      }
    });
  }

  confirmDelete(): void {
    const id = this.projectId();
    if (!id) return;

    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.deleteProject(id);
    }
  }

  private deleteProject(id: string): void {
    this.deleting.set(true);
    this.error.set(null);

    this.projectService.deleteProject(id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.router.navigate(['/projects']);
      },
      error: (err) => {
        console.error('Error deleting project:', err);
        this.error.set(err.error?.message || 'Failed to delete project. Please try again.');
        this.deleting.set(false);
      }
    });
  }
}
