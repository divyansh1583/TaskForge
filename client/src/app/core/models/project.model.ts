/**
 * Project and Team models for TaskForge.
 * WHY: TypeScript interfaces ensure type safety and match backend DTOs.
 */

// Project Status enum matching backend
export enum ProjectStatus {
  NotStarted = 0,
  Planning = 1,
  InProgress = 2,
  OnHold = 3,
  Completed = 4,
  Cancelled = 5
}

// Team Role enum matching backend
export enum TeamRole {
  Owner = 0,
  Admin = 1,
  Member = 2,
  Viewer = 3
}

// Project List DTO for paginated lists
export interface ProjectListDto {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  statusName?: string;
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  ownerName?: string;
  teamMemberCount: number;
  createdAt: string;
}

// Team Member DTO
export interface TeamMemberDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: TeamRole;
  roleName?: string;
  joinedAt: string;
}

// Project Detail DTO with full information
export interface ProjectDetailDto {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  statusName?: string;
  startDate?: string;
  endDate?: string;
  ownerId: string;
  ownerName?: string;
  teamId: string;
  teamName?: string;
  teamMembers?: TeamMemberDto[];
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Team DTO
export interface TeamDto {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  projectName?: string;
  members: TeamMemberDto[];
  createdAt: string;
  updatedAt?: string;
}

// Request DTOs
export interface CreateProjectRequest {
  name: string;
  key: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface AddTeamMemberRequest {
  userEmail: string;
  role: TeamRole;
}

export interface UpdateTeamMemberRequest {
  role: TeamRole;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
}

// Query parameters for project list
export interface ProjectQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProjectStatus;
  sortBy?: string;
  sortDescending?: boolean;
}

// Paginated response
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
