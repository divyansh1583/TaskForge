import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { Roles } from '@core/constants/roles.constant';

/**
 * Navigation bar component with role-based menu items.
 * WHY: Provides consistent navigation with user menu and role-based
 * visibility of menu items.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white border-b border-secondary-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo & Main Nav -->
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/dashboard" class="flex items-center">
                <span class="text-2xl font-bold text-primary-600">TaskForge</span>
              </a>
            </div>

            <!-- Desktop Navigation -->
            <div class="hidden md:ml-8 md:flex md:space-x-4">
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-primary-50 text-primary-700"
                [routerLinkActiveOptions]="{ exact: true }"
                class="nav-link"
              >
                Dashboard
              </a>

              <a
                routerLink="/projects"
                routerLinkActive="bg-primary-50 text-primary-700"
                class="nav-link nav-link-disabled"
              >
                Projects
                <span class="ml-1 text-xs text-secondary-400">(Phase 2)</span>
              </a>

              <a
                routerLink="/tasks"
                routerLinkActive="bg-primary-50 text-primary-700"
                class="nav-link nav-link-disabled"
              >
                Tasks
                <span class="ml-1 text-xs text-secondary-400">(Phase 3)</span>
              </a>

              @if (isAdmin()) {
                <a
                  routerLink="/admin"
                  routerLinkActive="bg-primary-50 text-primary-700"
                  class="nav-link nav-link-disabled"
                >
                  Admin
                  <span class="ml-1 text-xs text-secondary-400">(Phase 2)</span>
                </a>
              }
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center">
            <!-- Notifications -->
            <button
              class="p-2 text-secondary-500 hover:text-secondary-700 relative"
              disabled
              title="Available in Phase 4"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </button>

            <!-- User Menu -->
            <div class="ml-4 relative">
              <button
                (click)="toggleUserMenu()"
                class="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {{ userInitials() }}
                </div>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-medium text-secondary-900">{{ user()?.fullName }}</p>
                  <p class="text-xs text-secondary-500">{{ primaryRole() }}</p>
                </div>
                <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- Dropdown Menu -->
              @if (showUserMenu()) {
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-50">
                  <div class="px-4 py-2 border-b border-secondary-200">
                    <p class="text-sm font-medium text-secondary-900">{{ user()?.fullName }}</p>
                    <p class="text-xs text-secondary-500">{{ user()?.email }}</p>
                  </div>
                  
                  <a
                    routerLink="/profile"
                    class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    (click)="closeUserMenu()"
                  >
                    Profile Settings
                  </a>
                  
                  <button
                    (click)="logout()"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              }
            </div>

            <!-- Mobile menu button -->
            <button
              (click)="toggleMobileMenu()"
              class="md:hidden ml-4 p-2 text-secondary-500 hover:text-secondary-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (showMobileMenu()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        @if (showMobileMenu()) {
          <div class="md:hidden border-t border-secondary-200 py-2">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-primary-50 text-primary-700"
              [routerLinkActiveOptions]="{ exact: true }"
              class="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
              (click)="closeMobileMenu()"
            >
              Dashboard
            </a>
            <a
              class="block px-4 py-2 text-sm text-secondary-400 cursor-not-allowed"
            >
              Projects (Phase 2)
            </a>
            <a
              class="block px-4 py-2 text-sm text-secondary-400 cursor-not-allowed"
            >
              Tasks (Phase 3)
            </a>
          </div>
        }
      </div>
    </nav>

    <!-- Click outside to close menus -->
    @if (showUserMenu() || showMobileMenu()) {
      <div
        class="fixed inset-0 z-40"
        (click)="closeAllMenus()"
      ></div>
    }
  `,
  styles: [`
    .nav-link {
      @apply inline-flex items-center px-3 py-2 text-sm font-medium text-secondary-600 
             rounded-lg hover:bg-secondary-100 hover:text-secondary-900 transition-colors;
    }

    .nav-link-disabled {
      @apply cursor-not-allowed opacity-60;
    }
  `],
})
export class NavbarComponent {
  private authService = inject(AuthService);

  user = this.authService.currentUser;
  showUserMenu = signal(false);
  showMobileMenu = signal(false);

  userInitials = computed(() => {
    const user = this.user();
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  });

  primaryRole = computed(() => {
    const roles = this.user()?.roles ?? [];
    if (roles.includes(Roles.Admin)) return Roles.Admin;
    if (roles.includes(Roles.Manager)) return Roles.Manager;
    return Roles.Member;
  });

  isAdmin = computed(() => this.authService.hasRole(Roles.Admin));

  toggleUserMenu(): void {
    this.showUserMenu.update((v) => !v);
    this.showMobileMenu.set(false);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update((v) => !v);
    this.showUserMenu.set(false);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  closeAllMenus(): void {
    this.showUserMenu.set(false);
    this.showMobileMenu.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
