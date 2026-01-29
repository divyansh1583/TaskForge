/**
 * Task models for TaskForge.
 * WHY: TypeScript interfaces ensure type safety and match backend DTOs.
 */

// Task Status enum matching backend TaskItemStatus
export enum TaskStatus {
  Open = 0,
  InProgress = 1,
  InReview = 2,
  Done = 3,
  Cancelled = 4
}

// Task Priority enum matching backend
export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

// Helper functions for display
export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.Open]: 'Open',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.InReview]: 'In Review',
  [TaskStatus.Done]: 'Done',
  [TaskStatus.Cancelled]: 'Cancelled'
};

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'Low',
  [TaskPriority.Medium]: 'Medium',
  [TaskPriority.High]: 'High',
  [TaskPriority.Critical]: 'Critical'
};

export const TaskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.Open]: 'bg-gray-100 text-gray-800',
  [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800',
  [TaskStatus.InReview]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.Done]: 'bg-green-100 text-green-800',
  [TaskStatus.Cancelled]: 'bg-red-100 text-red-800'
};

export const TaskPriorityColors: Record<TaskPriority, string> = {
  [TaskPriority.Low]: 'bg-gray-100 text-gray-600',
  [TaskPriority.Medium]: 'bg-blue-100 text-blue-700',
  [TaskPriority.High]: 'bg-orange-100 text-orange-700',
  [TaskPriority.Critical]: 'bg-red-100 text-red-700'
};

// Task List DTO for paginated lists
export interface TaskListDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  statusName: string;
  priority: TaskPriority;
  priorityName: string;
  dueDate?: string;
  isOverdue: boolean;
  estimatedHours?: number;
  projectId: string;
  projectName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  displayOrder: number;
  tags?: string;
  createdAt: string;
}

// Task Detail DTO with full information
export interface TaskDetailDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  statusName: string;
  priority: TaskPriority;
  priorityName: string;
  dueDate?: string;
  isOverdue: boolean;
  estimatedHours?: number;
  actualHours?: number;
  projectId: string;
  projectName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  displayOrder: number;
  tags?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Task Summary DTO for dashboard/statistics
export interface TaskSummaryDto {
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  doneTasks: number;
  overdueTasks: number;
  unassignedTasks: number;
}

// Request DTOs
export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  assigneeId?: string;
  tags?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: string;
  tags?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface AssignTaskRequest {
  assigneeId?: string;
}

export interface ReorderTaskRequest {
  newDisplayOrder: number;
}

// Query parameters for task list
export interface TaskQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  isOverdue?: boolean;
  dueBefore?: string;
  dueAfter?: string;
  tags?: string;
  sortBy?: string;
  sortDescending?: boolean;
}

// Paginated response (reuse from project.model if needed)
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
