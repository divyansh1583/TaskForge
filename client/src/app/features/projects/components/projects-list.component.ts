import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { 
  ProjectListDto, 
  ProjectStatus, 
  ProjectQueryParams 
} from '../../../core/models/project.model';

/**
 * Projects list component with filtering, sorting, and pagination.
 * WHY: Provides a comprehensive view of all projects with management capabilities.
 */
@Component({
    selector: 'app-projects-list',
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Projects</h1>
          <p class="text-gray-600 mt-1">Manage your projects and track progress</p>
        </div>
        <a 
          routerLink="/projects/new" 
          class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Project
        </a>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              placeholder="Search projects..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="loadProjects()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option [ngValue]="null">All Statuses</option>
              @for (status of statusOptions; track status.value) {
                <option [ngValue]="status.value">{{ status.label }}</option>
              }
            </select>
          </div>

          <!-- Sort By -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              [(ngModel)]="sortBy"
              (ngModelChange)="loadProjects()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="name">Name</option>
              <option value="createdAt">Created Date</option>
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
            </select>
          </div>

          <!-- Sort Order -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              [(ngModel)]="sortDescending"
              (ngModelChange)="loadProjects()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option [ngValue]="false">Ascending</option>
              <option [ngValue]="true">Descending</option>
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
          <button 
            (click)="loadProjects()" 
            class="mt-2 text-red-600 hover:text-red-700 underline text-sm"
          >
            Try again
          </button>
        </div>
      }

      <!-- Projects Grid -->
      @if (!loading() && !error()) {
        @if (projects().length === 0) {
          <div class="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
            <div class="mt-6">
              <a 
                routerLink="/projects/new" 
                class="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                New Project
              </a>
            </div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (project of projects(); track project.id) {
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div class="p-6">
                  <!-- Project Header -->
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1 min-w-0">
                      <a 
                        [routerLink]="['/projects', project.id]"
                        class="text-lg font-semibold text-gray-900 hover:text-primary-600 truncate block"
                      >
                        {{ project.name }}
                      </a>
                      <p class="text-sm text-gray-500 mt-1">{{ project.key }}</p>
                    </div>
                    <span [class]="getStatusClass(project.status)">
                      {{ getStatusLabel(project.status) }}
                    </span>
                  </div>

                  <!-- Project Description -->
                  @if (project.description) {
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ project.description }}</p>
                  }

                  <!-- Project Meta -->
                  <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
                      </svg>
                      {{ project.teamMemberCount }} members
                    </div>
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {{ project.createdAt | date:'mediumDate' }}
                    </div>
                  </div>

                  <!-- Progress Bar -->
                  @if (project.status !== ProjectStatus.NotStarted) {
                    <div class="mb-4">
                      <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600">Progress</span>
                        <span class="font-medium">{{ getProgressPercent(project) }}%</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          [style.width.%]="getProgressPercent(project)"
                        ></div>
                      </div>
                    </div>
                  }

                  <!-- Actions -->
                  <div class="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                    <a 
                      [routerLink]="['/projects', project.id]"
                      class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      View
                    </a>
                    <a 
                      [routerLink]="['/projects', project.id, 'edit']"
                      class="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex justify-center items-center gap-2 mt-8">
              <button
                (click)="goToPage(currentPage() - 1)"
                [disabled]="currentPage() === 1"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              @for (page of visiblePages(); track page) {
                <button
                  (click)="goToPage(page)"
                  [class]="page === currentPage() 
                    ? 'px-3 py-2 text-sm bg-primary-600 text-white rounded-lg' 
                    : 'px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50'"
                >
                  {{ page }}
                </button>
              }
              
              <button
                (click)="goToPage(currentPage() + 1)"
                [disabled]="currentPage() === totalPages()"
                class="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          }
        }
      }
    </div>
  `,
    styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProjectsListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  // Expose enum to template
  protected readonly ProjectStatus = ProjectStatus;

  // State signals
  projects = signal<ProjectListDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = 9;

  // Filter state
  searchTerm = '';
  selectedStatus: ProjectStatus | null = null;
  sortBy = 'createdAt';
  sortDescending = true;

  // Search debounce timer
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // Computed values
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize));
  
  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  });

  // Status options for filter
  statusOptions = [
    { value: ProjectStatus.NotStarted, label: 'Not Started' },
    { value: ProjectStatus.Planning, label: 'Planning' },
    { value: ProjectStatus.InProgress, label: 'In Progress' },
    { value: ProjectStatus.OnHold, label: 'On Hold' },
    { value: ProjectStatus.Completed, label: 'Completed' },
    { value: ProjectStatus.Cancelled, label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: ProjectQueryParams = {
      page: this.currentPage(),
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortDescending: this.sortDescending
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    if (this.selectedStatus !== null) {
      params.status = this.selectedStatus;
    }

    this.projectService.getProjects(params).subscribe({
      next: (response) => {
        this.projects.set(response.items);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        this.error.set('Failed to load projects. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(): void {
    // Debounce search to avoid too many API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(1);
      this.loadProjects();
    }, 300);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProjects();
    }
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

  getProgressPercent(project: ProjectListDto): number {
    // Simple progress calculation based on status
    switch (project.status) {
      case ProjectStatus.NotStarted:
        return 0;
      case ProjectStatus.Planning:
        return 15;
      case ProjectStatus.InProgress:
        return 50;
      case ProjectStatus.OnHold:
        return 50;
      case ProjectStatus.Completed:
        return 100;
      case ProjectStatus.Cancelled:
        return 0;
      default:
        return 0;
    }
  }
}
