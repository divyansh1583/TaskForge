import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { TeamService } from '../../../core/services/team.service';
import { 
  TaskDetailDto,
  TaskStatus, 
  TaskPriority,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatusLabels,
  TaskPriorityLabels
} from '../../../core/models/task.model';
import { TeamMemberDto } from '../../../core/models/project.model';

/**
 * Task form component for creating and editing tasks.
 * WHY: Unified form for task CRUD operations with validation.
 */
@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-3xl">
      <!-- Header -->
      <div class="mb-8">
        <nav class="flex items-center text-sm text-gray-500 mb-4">
          @if (projectId()) {
            <a [routerLink]="['/projects', projectId()]" class="hover:text-primary-600">Project</a>
            <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          }
          <span class="text-gray-900">{{ isEditMode() ? 'Edit Task' : 'New Task' }}</span>
        </nav>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditMode() ? 'Edit Task' : 'Create New Task' }}
        </h1>
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
        <form (ngSubmit)="onSubmit()" #taskForm="ngForm" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
                Title <span class="text-red-500">*</span>
              </label>
              <input 
                type="text"
                id="title"
                name="title"
                [(ngModel)]="formData.title"
                required
                minlength="3"
                maxlength="200"
                #titleInput="ngModel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                [class.border-red-500]="titleInput.invalid && titleInput.touched"
                placeholder="Enter task title"
              />
              @if (titleInput.invalid && titleInput.touched) {
                <p class="mt-1 text-sm text-red-500">
                  @if (titleInput.errors?.['required']) {
                    Title is required
                  } @else if (titleInput.errors?.['minlength']) {
                    Title must be at least 3 characters
                  }
                </p>
              }
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                id="description"
                name="description"
                [(ngModel)]="formData.description"
                rows="4"
                maxlength="2000"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter task description (optional)"
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">{{ (formData.description?.length || 0) }}/2000 characters</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Status -->
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select 
                  id="status"
                  name="status"
                  [(ngModel)]="formData.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  @for (status of statusOptions; track status.value) {
                    <option [ngValue]="status.value">{{ status.label }}</option>
                  }
                </select>
              </div>

              <!-- Priority -->
              <div>
                <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select 
                  id="priority"
                  name="priority"
                  [(ngModel)]="formData.priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  @for (priority of priorityOptions; track priority.value) {
                    <option [ngValue]="priority.value">{{ priority.label }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Due Date -->
              <div>
                <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input 
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  [(ngModel)]="formData.dueDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <!-- Estimated Hours -->
              <div>
                <label for="estimatedHours" class="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input 
                  type="number"
                  id="estimatedHours"
                  name="estimatedHours"
                  [(ngModel)]="formData.estimatedHours"
                  min="0"
                  max="1000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 8"
                />
              </div>
            </div>

            @if (isEditMode()) {
              <!-- Actual Hours (Edit only) -->
              <div class="md:w-1/2">
                <label for="actualHours" class="block text-sm font-medium text-gray-700 mb-1">
                  Actual Hours
                </label>
                <input 
                  type="number"
                  id="actualHours"
                  name="actualHours"
                  [(ngModel)]="formData.actualHours"
                  min="0"
                  max="10000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., 6"
                />
              </div>
            }

            <!-- Assignee -->
            <div>
              <label for="assigneeId" class="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              @if (loadingTeamMembers()) {
                <div class="flex items-center text-gray-500">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Loading team members...
                </div>
              } @else {
                <select 
                  id="assigneeId"
                  name="assigneeId"
                  [(ngModel)]="formData.assigneeId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option [ngValue]="undefined">Unassigned</option>
                  @for (member of teamMembers(); track member.userId) {
                    <option [ngValue]="member.userId">{{ member.userName }} ({{ member.userEmail }})</option>
                  }
                </select>
              }
            </div>

            <!-- Tags -->
            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input 
                type="text"
                id="tags"
                name="tags"
                [(ngModel)]="formData.tags"
                maxlength="500"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., bug, frontend, urgent (comma-separated)"
              />
              <p class="mt-1 text-sm text-gray-500">Separate multiple tags with commas</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-4">
            <button 
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="taskForm.invalid || saving()"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (saving()) {
                <span class="flex items-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {{ isEditMode() ? 'Saving...' : 'Creating...' }}
                </span>
              } @else {
                {{ isEditMode() ? 'Save Changes' : 'Create Task' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly teamService = inject(TeamService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  projectId = signal<string | null>(null);
  taskId = signal<string | null>(null);
  teamMembers = signal<TeamMemberDto[]>([]);
  loadingTeamMembers = signal(false);

  formData: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    estimatedHours?: number;
    actualHours?: number;
    assigneeId?: string;
    tags?: string;
  } = {
    title: '',
    status: TaskStatus.Open,
    priority: TaskPriority.Medium
  };

  statusOptions = [
    { value: TaskStatus.Open, label: TaskStatusLabels[TaskStatus.Open] },
    { value: TaskStatus.InProgress, label: TaskStatusLabels[TaskStatus.InProgress] },
    { value: TaskStatus.InReview, label: TaskStatusLabels[TaskStatus.InReview] },
    { value: TaskStatus.Done, label: TaskStatusLabels[TaskStatus.Done] },
    { value: TaskStatus.Cancelled, label: TaskStatusLabels[TaskStatus.Cancelled] }
  ];

  priorityOptions = [
    { value: TaskPriority.Low, label: TaskPriorityLabels[TaskPriority.Low] },
    { value: TaskPriority.Medium, label: TaskPriorityLabels[TaskPriority.Medium] },
    { value: TaskPriority.High, label: TaskPriorityLabels[TaskPriority.High] },
    { value: TaskPriority.Critical, label: TaskPriorityLabels[TaskPriority.Critical] }
  ];

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    const projectId = this.route.snapshot.queryParamMap.get('projectId');

    if (taskId && taskId !== 'new') {
      this.taskId.set(taskId);
      this.isEditMode.set(true);
      this.loadTask(taskId);
    } else if (projectId) {
      this.projectId.set(projectId);
      this.loadTeamMembers(projectId);
    }
  }

  loadTask(taskId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskService.getTask(taskId).subscribe({
      next: (task) => {
        this.projectId.set(task.projectId);
        this.formData = {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          assigneeId: task.assigneeId,
          tags: task.tags
        };
        this.loading.set(false);
        this.loadTeamMembers(task.projectId);
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.error.set('Failed to load task. Please try again.');
        this.loading.set(false);
      }
    });
  }

  loadTeamMembers(projectId: string): void {
    this.loadingTeamMembers.set(true);

    this.teamService.getTeamByProject(projectId).subscribe({
      next: (team) => {
        this.teamMembers.set(team.members || []);
        this.loadingTeamMembers.set(false);
      },
      error: (err) => {
        console.error('Error loading team members:', err);
        this.loadingTeamMembers.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditMode()) {
      this.updateTask();
    } else {
      this.createTask();
    }
  }

  createTask(): void {
    const projectId = this.projectId();
    if (!projectId) {
      this.error.set('Project ID is required to create a task');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const request: CreateTaskRequest = {
      title: this.formData.title,
      description: this.formData.description,
      status: this.formData.status,
      priority: this.formData.priority,
      dueDate: this.formData.dueDate,
      estimatedHours: this.formData.estimatedHours,
      assigneeId: this.formData.assigneeId,
      tags: this.formData.tags
    };

    this.taskService.createTask(projectId, request).subscribe({
      next: (task) => {
        this.saving.set(false);
        this.router.navigate(['/tasks', task.id]);
      },
      error: (err) => {
        console.error('Error creating task:', err);
        this.error.set(err.error?.error || 'Failed to create task. Please try again.');
        this.saving.set(false);
      }
    });
  }

  updateTask(): void {
    const taskId = this.taskId();
    if (!taskId) return;

    this.saving.set(true);
    this.error.set(null);

    const request: UpdateTaskRequest = {
      title: this.formData.title,
      description: this.formData.description,
      status: this.formData.status,
      priority: this.formData.priority,
      dueDate: this.formData.dueDate,
      estimatedHours: this.formData.estimatedHours,
      actualHours: this.formData.actualHours,
      assigneeId: this.formData.assigneeId,
      tags: this.formData.tags
    };

    this.taskService.updateTask(taskId, request).subscribe({
      next: (task) => {
        this.saving.set(false);
        this.router.navigate(['/tasks', task.id]);
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.error.set(err.error?.error || 'Failed to update task. Please try again.');
        this.saving.set(false);
      }
    });
  }

  onCancel(): void {
    if (this.isEditMode() && this.taskId()) {
      this.router.navigate(['/tasks', this.taskId()]);
    } else if (this.projectId()) {
      this.router.navigate(['/projects', this.projectId()]);
    } else {
      this.router.navigate(['/projects']);
    }
  }
}
