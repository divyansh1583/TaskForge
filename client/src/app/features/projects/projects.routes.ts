import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

/**
 * Project feature routes.
 * WHY: Lazy-loaded routes for project management with auth protection.
 */
export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => 
          import('./components/projects-list.component').then(m => m.ProjectsListComponent),
        title: 'Projects - TaskForge'
      },
      {
        path: 'new',
        loadComponent: () => 
          import('./components/project-form.component').then(m => m.ProjectFormComponent),
        title: 'New Project - TaskForge'
      },
      {
        path: ':id',
        loadComponent: () => 
          import('./components/project-detail.component').then(m => m.ProjectDetailComponent),
        title: 'Project Details - TaskForge'
      },
      {
        path: ':id/edit',
        loadComponent: () => 
          import('./components/project-form.component').then(m => m.ProjectFormComponent),
        title: 'Edit Project - TaskForge'
      }
    ]
  }
];
