import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { TeamService } from '../../../core/services/team.service';
import { 
  TaskDetailDto, 
  TaskStatus, 
  TaskPriority,
  TaskStatusLabels,
  TaskPriorityLabels,
  TaskStatusColors,
  TaskPriorityColors
} from '../../../core/models/task.model';
import { TeamMemberDto } from '../../../core/models/project.model';

/**
 * Task detail component for viewing and managing a single task.
 * WHY: Provides detailed view of task with quick actions for status/assignment changes.
 */
@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- Loading State -->
      @if (loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-red-700 mb-4">{{ error() }}</p>
          <button 
            (click)="loadTask()"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      }

      <!-- Task Details -->
      @if (task() && !loading()) {
        <div class="space-y-6">
          <!-- Header -->
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div class="flex-1">
              <nav class="flex items-center text-sm text-gray-500 mb-2">
                <a [routerLink]="['/projects', task()!.projectId]" class="hover:text-primary-600">{{ task()!.projectName }}</a>
                <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <span class="text-gray-900">Task</span>
              </nav>
              <h1 class="text-2xl font-bold text-gray-900">{{ task()!.title }}</h1>
              <div class="flex flex-wrap items-center gap-3 mt-3">
                <span [class]="getStatusBadgeClass(task()!.status)">
                  {{ getTaskStatusLabel(task()!.status) }}
                </span>
                <span [class]="getPriorityBadgeClass(task()!.priority)">
                  {{ getTaskPriorityLabel(task()!.priority) }}
                </span>
                @if (isOverdue()) {
                  <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Overdue
                  </span>
                }
              </div>
            </div>
            <div class="flex items-center gap-3">
              <a 
                [routerLink]="['/tasks', task()!.id, 'edit']"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </a>
              <button 
                (click)="confirmDelete()"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex flex-wrap items-center gap-4">
              <!-- Quick Status Change -->
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">Status:</label>
                <select 
                  [ngModel]="task()!.status"
                  (ngModelChange)="onStatusChange($event)"
                  [disabled]="updatingStatus()"
                  class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  @for (status of statusOptions; track status.value) {
                    <option [ngValue]="status.value">{{ status.label }}</option>
                  }
                </select>
                @if (updatingStatus()) {
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                }
              </div>

              <!-- Quick Assign -->
              <div class="flex items-center gap-2">
                <label class="text-sm font-medium text-gray-700">Assignee:</label>
                <select 
                  [ngModel]="task()!.assigneeId"
                  (ngModelChange)="onAssigneeChange($event)"
                  [disabled]="updatingAssignee()"
                  class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option [ngValue]="undefined">Unassigned</option>
                  @for (member of teamMembers(); track member.userId) {
                    <option [ngValue]="member.userId">{{ member.userName }}</option>
                  }
                </select>
                @if (updatingAssignee()) {
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                }
              </div>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Description -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                @if (task()!.description) {
                  <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {{ task()!.description }}
                  </div>
                } @else {
                  <p class="text-gray-500 italic">No description provided.</p>
                }
              </div>

              <!-- Tags -->
              @if (task()!.tags) {
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
                  <div class="flex flex-wrap gap-2">
                    @for (tag of parseTags(task()!.tags!); track tag) {
                      <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {{ tag }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <!-- Details Card -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Details</h2>
                <dl class="space-y-4">
                  <!-- Due Date -->
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Due Date</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      @if (task()!.dueDate) {
                        <span [class.text-red-600]="isOverdue()">
                          {{ task()!.dueDate | date:'mediumDate' }}
                        </span>
                      } @else {
                        <span class="text-gray-500">Not set</span>
                      }
                    </dd>
                  </div>

                  <!-- Estimated Hours -->
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Estimated Hours</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      @if (task()!.estimatedHours !== null && task()!.estimatedHours !== undefined) {
                        {{ task()!.estimatedHours }}h
                      } @else {
                        <span class="text-gray-500">Not set</span>
                      }
                    </dd>
                  </div>

                  <!-- Actual Hours -->
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Actual Hours</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      @if (task()!.actualHours !== null && task()!.actualHours !== undefined) {
                        {{ task()!.actualHours }}h
                        @if (task()!.estimatedHours) {
                          <span class="text-gray-500">
                            ({{ getHoursPercentage() }}% of estimate)
                          </span>
                        }
                      } @else {
                        <span class="text-gray-500">Not tracked</span>
                      }
                    </dd>
                  </div>

                  <!-- Assignee -->
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Assignee</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      @if (task()!.assigneeName) {
                        <div class="flex items-center gap-2">
                          <div class="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-medium">
                            {{ getInitials(task()!.assigneeName!) }}
                          </div>
                          {{ task()!.assigneeName }}
                        </div>
                      } @else {
                        <span class="text-gray-500">Unassigned</span>
                      }
                    </dd>
                  </div>
                </dl>
              </div>

              <!-- Activity Card -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
                <dl class="space-y-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Created</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      {{ task()!.createdAt | date:'medium' }}
                      @if (task()!.createdBy) {
                        <span class="text-gray-500">by {{ task()!.createdBy }}</span>
                      }
                    </dd>
                  </div>
                  @if (task()!.updatedAt) {
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        {{ task()!.updatedAt | date:'medium' }}
                        @if (task()!.updatedBy) {
                          <span class="text-gray-500">by {{ task()!.updatedBy }}</span>
                        }
                      </dd>
                    </div>
                  }
                </dl>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
            <p class="text-gray-600 mb-6">
              Are you sure you want to delete "{{ task()!.title }}"? This action cannot be undone.
            </p>
            <div class="flex justify-end gap-3">
              <button 
                (click)="showDeleteModal.set(false)"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                (click)="deleteTask()"
                [disabled]="deleting()"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                @if (deleting()) {
                  Deleting...
                } @else {
                  Delete
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TaskDetailComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly teamService = inject(TeamService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  task = signal<TaskDetailDto | null>(null);
  teamMembers = signal<TeamMemberDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  updatingStatus = signal(false);
  updatingAssignee = signal(false);
  showDeleteModal = signal(false);
  deleting = signal(false);

  statusOptions = [
    { value: TaskStatus.Open, label: TaskStatusLabels[TaskStatus.Open] },
    { value: TaskStatus.InProgress, label: TaskStatusLabels[TaskStatus.InProgress] },
    { value: TaskStatus.InReview, label: TaskStatusLabels[TaskStatus.InReview] },
    { value: TaskStatus.Done, label: TaskStatusLabels[TaskStatus.Done] },
    { value: TaskStatus.Cancelled, label: TaskStatusLabels[TaskStatus.Cancelled] }
  ];

  isOverdue = computed(() => {
    const t = this.task();
    if (!t?.dueDate || t.status === TaskStatus.Done || t.status === TaskStatus.Cancelled) {
      return false;
    }
    return new Date(t.dueDate) < new Date();
  });

  ngOnInit(): void {
    this.loadTask();
  }

  loadTask(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (!taskId) {
      this.error.set('Task ID is required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.taskService.getTask(taskId).subscribe({
      next: (task) => {
        this.task.set(task);
        this.loading.set(false);
        this.loadTeamMembers(task.projectId);
      },
      error: (err) => {
        console.error('Error loading task:', err);
        this.error.set('Failed to load task. The task may not exist or you may not have permission to view it.');
        this.loading.set(false);
      }
    });
  }

  loadTeamMembers(projectId: string): void {
    this.teamService.getTeamByProject(projectId).subscribe({
      next: (team) => {
        this.teamMembers.set(team.members || []);
      },
      error: (err) => {
        console.error('Error loading team members:', err);
      }
    });
  }

  onStatusChange(newStatus: TaskStatus): void {
    const t = this.task();
    if (!t) return;

    this.updatingStatus.set(true);

    this.taskService.updateTaskStatus(t.id, { status: newStatus }).subscribe({
      next: (updatedTask) => {
        this.task.set(updatedTask);
        this.updatingStatus.set(false);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.updatingStatus.set(false);
        // Revert by reloading
        this.loadTask();
      }
    });
  }

  onAssigneeChange(assigneeId: string | undefined): void {
    const t = this.task();
    if (!t) return;

    this.updatingAssignee.set(true);

    this.taskService.assignTask(t.id, { assigneeId: assigneeId || undefined }).subscribe({
      next: (updatedTask) => {
        this.task.set(updatedTask);
        this.updatingAssignee.set(false);
      },
      error: (err) => {
        console.error('Error assigning task:', err);
        this.updatingAssignee.set(false);
        // Revert by reloading
        this.loadTask();
      }
    });
  }

  confirmDelete(): void {
    this.showDeleteModal.set(true);
  }

  deleteTask(): void {
    const t = this.task();
    if (!t) return;

    this.deleting.set(true);

    this.taskService.deleteTask(t.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.showDeleteModal.set(false);
        this.router.navigate(['/projects', t.projectId]);
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        this.deleting.set(false);
      }
    });
  }

  getStatusBadgeClass(status: TaskStatus): string {
    const colors = TaskStatusColors[status] || 'bg-gray-100 text-gray-800';
    return `px-2.5 py-1 text-xs font-medium rounded-full ${colors}`;
  }

  getPriorityBadgeClass(priority: TaskPriority): string {
    const colors = TaskPriorityColors[priority] || 'bg-gray-100 text-gray-800';
    return `px-2.5 py-1 text-xs font-medium rounded-full ${colors}`;
  }

  getTaskStatusLabel(status: TaskStatus): string {
    return TaskStatusLabels[status] || 'Unknown';
  }

  getTaskPriorityLabel(priority: TaskPriority): string {
    return TaskPriorityLabels[priority] || 'Unknown';
  }

  parseTags(tags: string): string[] {
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getHoursPercentage(): number {
    const t = this.task();
    if (!t?.estimatedHours || !t.actualHours) return 0;
    return Math.round((t.actualHours / t.estimatedHours) * 100);
  }
}
