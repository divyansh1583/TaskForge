import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root application component.
 * WHY: Minimal root component that hosts the router outlet,
 * following Angular's standalone component pattern.
 */
@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: `
    <router-outlet />
  `
})
export class AppComponent {
  title = 'TaskForge';
}
