import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

/**
 * Task feature routes.
 * WHY: Lazy-loaded routes for task management with auth protection.
 */
export const TASK_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'my',
        loadComponent: () => 
          import('./components/my-tasks.component').then(m => m.MyTasksComponent),
        title: 'My Tasks - TaskForge'
      },
      {
        path: 'new',
        loadComponent: () => 
          import('./components/task-form.component').then(m => m.TaskFormComponent),
        title: 'New Task - TaskForge'
      },
      {
        path: ':id',
        loadComponent: () => 
          import('./components/task-detail.component').then(m => m.TaskDetailComponent),
        title: 'Task Details - TaskForge'
      },
      {
        path: ':id/edit',
        loadComponent: () => 
          import('./components/task-form.component').then(m => m.TaskFormComponent),
        title: 'Edit Task - TaskForge'
      }
    ]
  }
];
