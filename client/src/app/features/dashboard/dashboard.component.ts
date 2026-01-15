import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { Roles } from '@core/constants/roles.constant';
import { NavbarComponent } from '@shared/components/navbar/navbar.component';

/**
 * Dashboard component - main landing page after login.
 * WHY: Provides role-based content and navigation based on user permissions.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="min-h-screen bg-secondary-50">
      <app-navbar />

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Welcome Section -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-secondary-900">
            Welcome back, {{ user()?.firstName }}!
          </h1>
          <p class="mt-1 text-secondary-600">
            Here's what's happening with your projects today.
          </p>
        </div>

        <!-- Role Badge -->
        <div class="mb-6">
          <span [class]="getRoleBadgeClass()">
            {{ primaryRole() }}
          </span>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-secondary-600">Total Projects</p>
                  <p class="text-2xl font-bold text-secondary-900">--</p>
                </div>
                <div class="p-3 bg-primary-100 rounded-lg">
                  <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-sm text-secondary-500">Available in Phase 2</p>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-secondary-600">Active Tasks</p>
                  <p class="text-2xl font-bold text-secondary-900">--</p>
                </div>
                <div class="p-3 bg-green-100 rounded-lg">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-sm text-secondary-500">Available in Phase 3</p>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-secondary-600">Team Members</p>
                  <p class="text-2xl font-bold text-secondary-900">--</p>
                </div>
                <div class="p-3 bg-yellow-100 rounded-lg">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-sm text-secondary-500">Available in Phase 2</p>
            </div>
          </div>

          <div class="card">
            <div class="card-body">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-secondary-600">Notifications</p>
                  <p class="text-2xl font-bold text-secondary-900">--</p>
                </div>
                <div class="p-3 bg-red-100 rounded-lg">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                </div>
              </div>
              <p class="mt-2 text-sm text-secondary-500">Available in Phase 4</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-secondary-900">Quick Actions</h2>
          </div>
          <div class="card-body">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @if (isAdmin() || isManager()) {
                <a routerLink="/projects/new" class="btn-outline py-4 flex flex-col items-center space-y-2 hover:bg-primary-50 hover:border-primary-500">
                  <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  <span class="text-primary-700">Create Project</span>
                </a>
              }

              <button class="btn-outline py-4 flex flex-col items-center space-y-2" disabled>
                <svg class="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
                <span>View Tasks</span>
                <span class="text-xs text-secondary-400">Phase 3</span>
              </button>

              @if (isAdmin()) {
                <button class="btn-outline py-4 flex flex-col items-center space-y-2" disabled>
                  <svg class="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  <span>Manage Users</span>
                  <span class="text-xs text-secondary-400">Phase 2</span>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- User Info Card -->
        <div class="card mt-8">
          <div class="card-header">
            <h2 class="text-lg font-semibold text-secondary-900">Account Information</h2>
          </div>
          <div class="card-body">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt class="text-sm font-medium text-secondary-500">Full Name</dt>
                <dd class="mt-1 text-sm text-secondary-900">{{ user()?.fullName }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-secondary-500">Email</dt>
                <dd class="mt-1 text-sm text-secondary-900">{{ user()?.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-secondary-500">Roles</dt>
                <dd class="mt-1 text-sm text-secondary-900">
                  @for (role of user()?.roles; track role) {
                    <span class="badge-secondary mr-1">{{ role }}</span>
                  }
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-secondary-500">Account Status</dt>
                <dd class="mt-1">
                  <span class="badge-success">Active</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class DashboardComponent {
  private authService = inject(AuthService);

  user = this.authService.currentUser;
  
  primaryRole = computed(() => {
    const roles = this.user()?.roles ?? [];
    if (roles.includes(Roles.Admin)) return Roles.Admin;
    if (roles.includes(Roles.Manager)) return Roles.Manager;
    return Roles.Member;
  });

  isAdmin = computed(() => this.authService.hasRole(Roles.Admin));
  isManager = computed(() => this.authService.hasRole(Roles.Manager));

  getRoleBadgeClass(): string {
    switch (this.primaryRole()) {
      case Roles.Admin:
        return 'badge-danger';
      case Roles.Manager:
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  }
}

