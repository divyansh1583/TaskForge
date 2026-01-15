import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProjectListDto,
  ProjectDetailDto,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectQueryParams,
  PaginatedList
} from '../models/project.model';

/**
 * Service for project-related API operations.
 * WHY: Centralizes all project API calls with proper typing and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  /**
   * Get paginated list of projects with filtering.
   */
  getProjects(params?: ProjectQueryParams): Observable<PaginatedList<ProjectListDto>> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.page) httpParams = httpParams.set('pageNumber', params.page.toString());
      if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
      if (params.search) httpParams = httpParams.set('searchTerm', params.search);
      if (params.status !== undefined) httpParams = httpParams.set('status', params.status.toString());
      if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
      if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending.toString());
    }

    return this.http.get<PaginatedList<ProjectListDto>>(this.baseUrl, { params: httpParams });
  }

  /**
   * Get a specific project by ID.
   */
  getProject(id: string): Observable<ProjectDetailDto> {
    return this.http.get<ProjectDetailDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new project.
   */
  createProject(request: CreateProjectRequest): Observable<ProjectDetailDto> {
    return this.http.post<ProjectDetailDto>(this.baseUrl, request);
  }

  /**
   * Update an existing project.
   */
  updateProject(id: string, request: UpdateProjectRequest): Observable<ProjectDetailDto> {
    return this.http.put<ProjectDetailDto>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Delete a project.
   */
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Check if current user can edit a project.
   */
  canEditProject(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${id}/can-edit`);
  }
}
