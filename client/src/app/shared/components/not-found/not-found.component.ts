import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * 404 Not Found component.
 * WHY: Provides user-friendly error page for invalid routes.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <div class="text-center">
        <h1 class="text-9xl font-bold text-primary-600">404</h1>
        <h2 class="text-3xl font-semibold text-secondary-900 mt-4">Page Not Found</h2>
        <p class="text-secondary-600 mt-2 max-w-md mx-auto">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div class="mt-8 flex justify-center space-x-4">
          <a routerLink="/dashboard" class="btn-primary">
            Go to Dashboard
          </a>
          <button (click)="goBack()" class="btn-outline">
            Go Back
          </button>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  goBack(): void {
    window.history.back();
  }
}
