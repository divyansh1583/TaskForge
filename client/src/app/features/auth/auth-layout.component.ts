import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Layout component for authentication pages.
 * WHY: Provides consistent layout for all auth pages (login, register)
 * with centered card design.
 */
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">TaskForge</h1>
          <p class="text-primary-200">Manage your projects efficiently</p>
        </div>
        
        <!-- Auth Card -->
        <div class="card">
          <router-outlet />
        </div>
        
        <!-- Footer -->
        <p class="text-center text-primary-200 text-sm mt-6">
          © 2026 TaskForge. All rights reserved.
        </p>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
