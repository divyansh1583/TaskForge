import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TeamDto,
  TeamMemberDto,
  AddTeamMemberRequest,
  UpdateTeamMemberRequest,
  UpdateTeamRequest
} from '../models/project.model';

/**
 * Service for team-related API operations.
 * WHY: Centralizes all team API calls with proper typing and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/teams`;

  /**
   * Get team by ID.
   */
  getTeam(id: string): Observable<TeamDto> {
    return this.http.get<TeamDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get team by project ID.
   */
  getTeamByProject(projectId: string): Observable<TeamDto> {
    return this.http.get<TeamDto>(`${this.baseUrl}/by-project/${projectId}`);
  }

  /**
   * Update team details.
   */
  updateTeam(id: string, request: UpdateTeamRequest): Observable<TeamDto> {
    return this.http.put<TeamDto>(`${this.baseUrl}/${id}`, request);
  }

  /**
   * Get team members.
   */
  getTeamMembers(teamId: string): Observable<TeamMemberDto[]> {
    return this.http.get<TeamMemberDto[]>(`${this.baseUrl}/${teamId}/members`);
  }

  /**
   * Add a member to a team.
   */
  addTeamMember(teamId: string, request: AddTeamMemberRequest): Observable<TeamMemberDto> {
    return this.http.post<TeamMemberDto>(`${this.baseUrl}/${teamId}/members`, request);
  }

  /**
   * Update a team member role.
   */
  updateTeamMember(teamId: string, memberId: string, request: UpdateTeamMemberRequest): Observable<TeamMemberDto> {
    return this.http.put<TeamMemberDto>(`${this.baseUrl}/${teamId}/members/${memberId}`, request);
  }

  /**
   * Remove a member from a team.
   */
  removeTeamMember(teamId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${teamId}/members/${memberId}`);
  }

  /**
   * Check if current user can manage a team.
   */
  canManageTeam(teamId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${teamId}/can-manage`);
  }
}
