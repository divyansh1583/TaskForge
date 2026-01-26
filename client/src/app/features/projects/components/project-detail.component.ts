import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { TeamService } from '../../../core/services/team.service';
import { 
  ProjectDetailDto, 
  ProjectStatus,
  TeamDto,
  TeamMemberDto,
  TeamRole
} from '../../../core/models/project.model';

/**
 * Project detail component showing project info and team management.
 * WHY: Central hub for viewing project details and managing team members.
 */
@Component({
    selector: 'app-project-detail',
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="container mx-auto px-4 py-8">
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
          <a routerLink="/projects" class="mt-2 text-red-600 hover:text-red-700 underline text-sm inline-block">
            Back to Projects
          </a>
        </div>
      }

      @if (project() && !loading()) {
        <!-- Breadcrumb & Header -->
        <div class="mb-8">
          <nav class="flex items-center text-sm text-gray-500 mb-4">
            <a routerLink="/projects" class="hover:text-primary-600">Projects</a>
            <svg class="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span class="text-gray-900">{{ project()?.name }}</span>
          </nav>

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-4">
              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-bold text-gray-900">{{ project()?.name }}</h1>
                  <span [class]="getStatusClass(project()!.status)">
                    {{ getStatusLabel(project()!.status) }}
                  </span>
                </div>
                <p class="text-gray-500 mt-1">{{ project()?.key }}</p>
              </div>
            </div>
            <a 
              [routerLink]="['/projects', project()?.id, 'edit']"
              class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Project
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Description Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              @if (project()?.description) {
                <p class="text-gray-600 whitespace-pre-wrap">{{ project()?.description }}</p>
              } @else {
                <p class="text-gray-400 italic">No description provided</p>
              }
            </div>

            <!-- Team Members Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900">Team Members</h2>
                <button 
                  (click)="showAddMemberModal.set(true)"
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  + Add Member
                </button>
              </div>

              @if (teamLoading()) {
                <div class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              } @else if (team()?.members?.length) {
                <div class="divide-y divide-gray-100">
                  @for (member of team()?.members; track member.id) {
                    <div class="py-4 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-medium">
                          {{ getInitials(member.userName) }}
                        </div>
                        <div>
                          <p class="font-medium text-gray-900">{{ member.userName }}</p>
                          <p class="text-sm text-gray-500">{{ member.userEmail }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span [class]="getRoleClass(member.role)">
                          {{ getRoleLabel(member.role) }}
                        </span>
                        <button 
                          (click)="removeMember(member)"
                          class="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove member"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
                  </svg>
                  <p class="mt-2 text-gray-500">No team members yet</p>
                  <button 
                    (click)="showAddMemberModal.set(true)"
                    class="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Add the first member
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Project Info Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Project Info</h2>
              <dl class="space-y-4">
                <div>
                  <dt class="text-sm text-gray-500">Owner</dt>
                  <dd class="mt-1 text-gray-900 font-medium">{{ project()?.ownerName || 'N/A' }}</dd>
                </div>
                <div>
                  <dt class="text-sm text-gray-500">Created</dt>
                  <dd class="mt-1 text-gray-900">{{ project()?.createdAt | date:'mediumDate' }}</dd>
                </div>
                @if (project()?.startDate) {
                  <div>
                    <dt class="text-sm text-gray-500">Start Date</dt>
                    <dd class="mt-1 text-gray-900">{{ project()?.startDate | date:'mediumDate' }}</dd>
                  </div>
                }
                @if (project()?.endDate) {
                  <div>
                    <dt class="text-sm text-gray-500">End Date</dt>
                    <dd class="mt-1 text-gray-900">{{ project()?.endDate | date:'mediumDate' }}</dd>
                  </div>
                }
                <div>
                  <dt class="text-sm text-gray-500">Team Members</dt>
                  <dd class="mt-1 text-gray-900">{{ team()?.members?.length || 0 }}</dd>
                </div>
              </dl>
            </div>

            <!-- Quick Actions Card -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div class="space-y-3">
                <a 
                  [routerLink]="['/projects', project()?.id, 'edit']"
                  class="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Project
                </a>
                <button 
                  (click)="showAddMemberModal.set(true)"
                  class="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                  Add Team Member
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Add Member Modal -->
      @if (showAddMemberModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Add Team Member</h3>
              <button 
                (click)="showAddMemberModal.set(false)"
                class="text-gray-400 hover:text-gray-600"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input
                  type="email"
                  [(ngModel)]="newMemberEmail"
                  placeholder="Enter user email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  [(ngModel)]="newMemberRole"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  @for (role of roleOptions; track role.value) {
                    <option [ngValue]="role.value">{{ role.label }}</option>
                  }
                </select>
              </div>
            </div>

            @if (addMemberError()) {
              <div class="mt-4 text-sm text-red-600">{{ addMemberError() }}</div>
            }

            <div class="flex justify-end gap-3 mt-6">
              <button
                (click)="showAddMemberModal.set(false)"
                class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="addMember()"
                [disabled]="addingMember()"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                @if (addingMember()) {
                  Adding...
                } @else {
                  Add Member
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly teamService = inject(TeamService);

  // State signals
  project = signal<ProjectDetailDto | null>(null);
  team = signal<TeamDto | null>(null);
  loading = signal(false);
  teamLoading = signal(false);
  error = signal<string | null>(null);
  
  // Modal state
  showAddMemberModal = signal(false);
  newMemberEmail = '';
  newMemberRole = TeamRole.Member;
  addingMember = signal(false);
  addMemberError = signal<string | null>(null);

  // Status options
  statusOptions = [
    { value: ProjectStatus.NotStarted, label: 'Not Started' },
    { value: ProjectStatus.Planning, label: 'Planning' },
    { value: ProjectStatus.InProgress, label: 'In Progress' },
    { value: ProjectStatus.OnHold, label: 'On Hold' },
    { value: ProjectStatus.Completed, label: 'Completed' },
    { value: ProjectStatus.Cancelled, label: 'Cancelled' }
  ];

  // Role options
  roleOptions = [
    { value: TeamRole.Owner, label: 'Owner' },
    { value: TeamRole.Admin, label: 'Admin' },
    { value: TeamRole.Member, label: 'Member' },
    { value: TeamRole.Viewer, label: 'Viewer' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(id);
    }
  }

  private loadProject(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getProject(id).subscribe({
      next: (project) => {
        this.project.set(project);
        this.loading.set(false);
        this.loadTeam(project.teamId);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.error.set('Failed to load project. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private loadTeam(teamId: string): void {
    this.teamLoading.set(true);

    this.teamService.getTeam(teamId).subscribe({
      next: (team) => {
        this.team.set(team);
        this.teamLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading team:', err);
        this.teamLoading.set(false);
      }
    });
  }

  addMember(): void {
    if (!this.newMemberEmail.trim()) {
      this.addMemberError.set('Please enter a valid email address');
      return;
    }

    const teamId = this.team()?.id;
    if (!teamId) return;

    this.addingMember.set(true);
    this.addMemberError.set(null);

    this.teamService.addTeamMember(teamId, {
      userEmail: this.newMemberEmail.trim(),
      role: this.newMemberRole
    }).subscribe({
      next: () => {
        this.addingMember.set(false);
        this.showAddMemberModal.set(false);
        this.newMemberEmail = '';
        this.newMemberRole = TeamRole.Member;
        this.loadTeam(teamId);
      },
      error: (err) => {
        console.error('Error adding member:', err);
        this.addMemberError.set(err.error?.message || 'Failed to add member. Please try again.');
        this.addingMember.set(false);
      }
    });
  }

  removeMember(member: TeamMemberDto): void {
    if (!confirm(`Are you sure you want to remove ${member.userName} from the team?`)) {
      return;
    }

    const teamId = this.team()?.id;
    if (!teamId) return;

    this.teamService.removeTeamMember(teamId, member.id).subscribe({
      next: () => {
        this.loadTeam(teamId);
      },
      error: (err) => {
        console.error('Error removing member:', err);
        alert('Failed to remove member. Please try again.');
      }
    });
  }

  getStatusClass(status: ProjectStatus): string {
    const baseClasses = 'px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case ProjectStatus.NotStarted:
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case ProjectStatus.Planning:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case ProjectStatus.InProgress:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case ProjectStatus.OnHold:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case ProjectStatus.Completed:
        return `${baseClasses} bg-green-100 text-green-800`;
      case ProjectStatus.Cancelled:
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getStatusLabel(status: ProjectStatus): string {
    return this.statusOptions.find(s => s.value === status)?.label ?? 'Unknown';
  }

  getRoleClass(role: TeamRole): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    
    switch (role) {
      case TeamRole.Owner:
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case TeamRole.Admin:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case TeamRole.Member:
        return `${baseClasses} bg-green-100 text-green-800`;
      case TeamRole.Viewer:
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getRoleLabel(role: TeamRole): string {
    return this.roleOptions.find(r => r.value === role)?.label ?? 'Unknown';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}

