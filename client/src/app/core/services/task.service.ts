import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TaskListDto,
  TaskDetailDto,
  TaskSummaryDto,
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  AssignTaskRequest,
  ReorderTaskRequest,
  TaskQueryParams,
  PaginatedList
} from '../models/task.model';

/**
 * Service for task-related API operations.
 * WHY: Centralizes all task API calls with proper typing and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  /**
   * Get paginated list of tasks for a project.
   */
  getTasksByProject(projectId: string, params?: TaskQueryParams): Observable<PaginatedList<TaskListDto>> {
    let httpParams = this.buildQueryParams(params);
    return this.http.get<PaginatedList<TaskListDto>>(
      `${this.apiUrl}/projects/${projectId}/tasks`,
      { params: httpParams }
    );
  }

  /**
   * Get task summary statistics for a project.
   */
  getTaskSummaryByProject(projectId: string): Observable<TaskSummaryDto> {
    return this.http.get<TaskSummaryDto>(`${this.apiUrl}/projects/${projectId}/tasks/summary`);
  }

  /**
   * Get task summary statistics for the current user.
   */
  getTaskSummary(): Observable<TaskSummaryDto> {
    return this.http.get<TaskSummaryDto>(`${this.apiUrl}/tasks/my/summary`);
  }

  /**
   * Create a new task in a project.
   */
  createTask(projectId: string, request: CreateTaskRequest): Observable<TaskDetailDto> {
    return this.http.post<TaskDetailDto>(`${this.apiUrl}/projects/${projectId}/tasks`, request);
  }

  /**
   * Get a specific task by ID.
   */
  getTask(taskId: string): Observable<TaskDetailDto> {
    return this.http.get<TaskDetailDto>(`${this.apiUrl}/tasks/${taskId}`);
  }

  /**
   * Update an existing task.
   */
  updateTask(taskId: string, request: UpdateTaskRequest): Observable<TaskDetailDto> {
    return this.http.put<TaskDetailDto>(`${this.apiUrl}/tasks/${taskId}`, request);
  }

  /**
   * Delete a task.
   */
  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
  }

  /**
   * Update only the task status.
   */
  updateTaskStatus(taskId: string, request: UpdateTaskStatusRequest): Observable<TaskDetailDto> {
    return this.http.put<TaskDetailDto>(`${this.apiUrl}/tasks/${taskId}/status`, request);
  }

  /**
   * Assign a task to a user.
   */
  assignTask(taskId: string, request: AssignTaskRequest): Observable<TaskDetailDto> {
    return this.http.put<TaskDetailDto>(`${this.apiUrl}/tasks/${taskId}/assign`, request);
  }

  /**
   * Reorder a task within the project.
   */
  reorderTask(taskId: string, request: ReorderTaskRequest): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/tasks/${taskId}/reorder`, request);
  }

  /**
   * Get all tasks assigned to the current user.
   */
  getMyTasks(params?: TaskQueryParams): Observable<PaginatedList<TaskListDto>> {
    let httpParams = this.buildQueryParams(params);
    return this.http.get<PaginatedList<TaskListDto>>(`${this.apiUrl}/tasks/my`, { params: httpParams });
  }

  /**
   * Check if current user can edit a task.
   */
  canEditTask(taskId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/tasks/${taskId}/can-edit`);
  }

  /**
   * Build HTTP params from query parameters.
   */
  private buildQueryParams(params?: TaskQueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.searchTerm) httpParams = httpParams.set('searchTerm', params.searchTerm);
      if (params.status !== undefined) httpParams = httpParams.set('status', params.status.toString());
      if (params.priority !== undefined) httpParams = httpParams.set('priority', params.priority.toString());
      if (params.assigneeId) httpParams = httpParams.set('assigneeId', params.assigneeId);
      if (params.isOverdue !== undefined) httpParams = httpParams.set('isOverdue', params.isOverdue.toString());
      if (params.dueBefore) httpParams = httpParams.set('dueBefore', params.dueBefore);
      if (params.dueAfter) httpParams = httpParams.set('dueAfter', params.dueAfter);
      if (params.tags) httpParams = httpParams.set('tags', params.tags);
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    }

    return httpParams;
  }
}
