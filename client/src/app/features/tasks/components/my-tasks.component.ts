import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { 
  TaskListDto, 
  TaskStatus, 
  TaskPriority,
  TaskQueryParams,
  TaskStatusLabels,
  TaskPriorityLabels,
  TaskStatusColors,
  TaskPriorityColors,
  PaginatedList
} from '../../../core/models/task.model';

/**
 * My Tasks component showing all tasks assigned to the current user.
 * WHY: Central hub for users to view and manage their assigned tasks.
 */
@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p class="text-gray-500 mt-1">Tasks assigned to you across all projects</p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input 
              type="text"
              [(ngModel)]="filters.searchTerm"
              (ngModelChange)="onFilterChange()"
              placeholder="Search tasks..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              [(ngModel)]="filters.status"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option [ngValue]="undefined">All Statuses</option>
              @for (status of statusOptions; track status.value) {
                <option [ngValue]="status.value">{{ status.label }}</option>
              }
            </select>
          </div>

          <!-- Priority Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select 
              [(ngModel)]="filters.priority"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option [ngValue]="undefined">All Priorities</option>
              @for (priority of priorityOptions; track priority.value) {
                <option [ngValue]="priority.value">{{ priority.label }}</option>
              }
            </select>
          </div>

          <!-- Overdue Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <select 
              [(ngModel)]="filters.isOverdue"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option [ngValue]="undefined">All Tasks</option>
              <option [ngValue]="true">Overdue Only</option>
            </select>
          </div>
        </div>
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

      <!-- Tasks List -->
      @if (!loading() && tasks().length > 0) {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (task of tasks(); track task.id) {
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                      <a [routerLink]="['/tasks', task.id]" class="text-primary-600 hover:text-primary-700 font-medium">
                        {{ task.title }}
                      </a>
                      @if (task.description) {
                        <p class="text-sm text-gray-500 truncate max-w-xs">{{ task.description }}</p>
                      }
                    </td>
                    <td class="px-6 py-4">
                      <a [routerLink]="['/projects', task.projectId]" class="text-gray-600 hover:text-primary-600">
                        {{ task.projectName }}
                      </a>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="getStatusClass(task.status)">
                        {{ getStatusLabel(task.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="getPriorityClass(task.priority)">
                        {{ getPriorityLabel(task.priority) }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      @if (task.dueDate) {
                        <span [class]="task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'">
                          {{ task.dueDate | date:'mediumDate' }}
                          @if (task.isOverdue) {
                            <span class="ml-1 text-xs">(Overdue)</span>
                          }
                        </span>
                      } @else {
                        <span class="text-gray-400">No due date</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2">
                        <a 
                          [routerLink]="['/tasks', task.id]"
                          class="text-gray-400 hover:text-primary-600 transition-colors"
                          title="View task"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </a>
                        <a 
                          [routerLink]="['/tasks', task.id, 'edit']"
                          class="text-gray-400 hover:text-primary-600 transition-colors"
                          title="Edit task"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (pagination()) {
            <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div class="text-sm text-gray-500">
                Showing {{ (pagination()!.pageNumber - 1) * pagination()!.pageSize + 1 }} to 
                {{ Math.min(pagination()!.pageNumber * pagination()!.pageSize, pagination()!.totalCount) }} 
                of {{ pagination()!.totalCount }} tasks
              </div>
              <div class="flex gap-2">
                <button 
                  (click)="previousPage()"
                  [disabled]="!pagination()?.hasPreviousPage"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button 
                  (click)="nextPage()"
                  [disabled]="!pagination()?.hasNextPage"
                  class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && tasks().length === 0 && !error()) {
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No tasks found</h3>
          <p class="mt-2 text-gray-500">
            @if (hasActiveFilters()) {
              Try adjusting your filters to see more tasks.
            } @else {
              You don't have any tasks assigned to you yet.
            }
          </p>
          @if (hasActiveFilters()) {
            <button 
              (click)="clearFilters()"
              class="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          }
        </div>
      }
    </div>
  `
})
export class MyTasksComponent implements OnInit {
  private readonly taskService = inject(TaskService);

  tasks = signal<TaskListDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  pagination = signal<PaginatedList<TaskListDto> | null>(null);

  filters: TaskQueryParams = {
    pageNumber: 1,
    pageSize: 20
  };

  Math = Math;

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
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    this.taskService.getMyTasks(this.filters).subscribe({
      next: (response) => {
        this.tasks.set(response.items);
        this.pagination.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
        this.error.set('Failed to load tasks. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.filters.pageNumber = 1;
    this.loadTasks();
  }

  previousPage(): void {
    if (this.pagination()?.hasPreviousPage) {
      this.filters.pageNumber = (this.filters.pageNumber || 1) - 1;
      this.loadTasks();
    }
  }

  nextPage(): void {
    if (this.pagination()?.hasNextPage) {
      this.filters.pageNumber = (this.filters.pageNumber || 1) + 1;
      this.loadTasks();
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.searchTerm || this.filters.status !== undefined || 
              this.filters.priority !== undefined || this.filters.isOverdue !== undefined);
  }

  clearFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: 20
    };
    this.loadTasks();
  }

  getStatusClass(status: TaskStatus): string {
    return `px-2.5 py-0.5 rounded-full text-xs font-medium ${TaskStatusColors[status]}`;
  }

  getStatusLabel(status: TaskStatus): string {
    return TaskStatusLabels[status];
  }

  getPriorityClass(priority: TaskPriority): string {
    return `px-2 py-0.5 rounded text-xs font-medium ${TaskPriorityColors[priority]}`;
  }

  getPriorityLabel(priority: TaskPriority): string {
    return TaskPriorityLabels[priority];
  }
}
