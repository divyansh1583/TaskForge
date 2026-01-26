PS C:\Projects\TaskForge\client> ng update @angular/core@19 @angular/cli@19
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 19.2.19 to perform the update.
Using package manager: npm
Collecting installed dependencies...
Found 25 dependencies.
Fetching dependency metadata from registry...
Updating package.json with dependency @angular-devkit/build-angular @ "19.2.19" (was "18.2.21")...
Updating package.json with dependency @angular/cli @ "19.2.19" (was "18.2.21")...
Updating package.json with dependency @angular/compiler-cli @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency typescript @ "5.8.3" (was "5.4.5")...
Updating package.json with dependency @angular/animations @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/common @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/compiler @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/core @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/forms @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular-devkit/build-angular @ "19.2.19" (was "18.2.21")...
Updating package.json with dependency @angular/cli @ "19.2.19" (was "18.2.21")...
Updating package.json with dependency @angular/compiler-cli @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency typescript @ "5.8.3" (was "5.4.5")...
Updating package.json with dependency @angular/animations @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/common @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/compiler @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/core @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/forms @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/compiler-cli @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency typescript @ "5.8.3" (was "5.4.5")...
Updating package.json with dependency @angular/animations @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/common @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/compiler @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency typescript @ "5.8.3" (was "5.4.5")...
Updating package.json with dependency @angular/animations @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/common @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/compiler @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/core @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/forms @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/common @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/compiler @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/compiler @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/core @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/forms @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/platform-browser @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/forms @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/platform-browser @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/platform-browser-dynamic @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/platform-browser-dynamic @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency @angular/router @ "19.2.18" (was "18.2.14")...
Updating package.json with dependency zone.js @ "0.15.1" (was "0.14.10")...
UPDATE package.json (1146 bytes)
✔ Cleaning node modules directory
✔ Installing packages
** Executing migrations of package '@angular/cli' **

❯ Update '@angular/ssr' import paths to use the new '/node' entry point when 'CommonEngine' is detected.
Migration completed (No changes made).

❯ Update the workspace configuration by replacing deprecated options in 'angular.json' for compatibility with the latest Angular CLI changes.
Migration completed (No changes made).

** Optional migrations of package '@angular/cli' **

This package has 1 optional migration that can be executed.
Optional migrations may be skipped and executed after the update process, if preferred.

Select the migrations that you'd like to run [use-application-builder] Migrate application projects to the new build  
system. (https://angular.dev/tools/cli/build-system-migration)

❯ Migrate application projects to the new build system.
Application projects that are using the '@angular-devkit/build-angular' package's 'browser' and/or 'browser-esbuild' builders will be migrated to use the new 'application' builder.
You can read more about this, including known issues and limitations, here: https://angular.dev/tools/cli/build-system-migration
UPDATE tsconfig.json (964 bytes)
Migration completed (1 file modified).

** Executing migrations of package '@angular/core' **

❯ Updates non-standalone Directives, Component and Pipes to 'standalone:false' and removes 'standalone:true' from those who are standalone.
UPDATE src/app/app.component.ts (425 bytes)
UPDATE src/app/features/auth/auth-layout.component.ts (1083 bytes)
UPDATE src/app/features/auth/login/login.component.ts (7460 bytes)
UPDATE src/app/features/auth/register/register.component.ts (15931 bytes)
UPDATE src/app/shared/components/navbar/navbar.component.ts (8617 bytes)
UPDATE src/app/features/dashboard/dashboard.component.ts (9465 bytes)
UPDATE src/app/features/projects/components/projects-list.component.ts (16570 bytes)
UPDATE src/app/features/projects/components/project-form.component.ts (17434 bytes)
UPDATE src/app/features/projects/components/project-detail.component.ts (19374 bytes)
UPDATE src/app/shared/components/not-found/not-found.component.ts (1115 bytes)
Migration completed (10 files modified).

❯ Updates ExperimentalPendingTasks to PendingTasks.
Migration completed (No changes made).
UPDATE src/app/features/projects/components/project-form.component.ts (17434 bytes)
UPDATE src/app/features/projects/components/project-detail.component.ts (19374 bytes)
UPDATE src/app/shared/components/not-found/not-found.component.ts (1115 bytes)
Migration completed (10 files modified).

❯ Updates ExperimentalPendingTasks to PendingTasks.
Migration completed (No changes made).

UPDATE src/app/features/projects/components/project-form.component.ts (17434 bytes)
UPDATE src/app/features/projects/components/project-detail.component.ts (19374 bytes)
UPDATE src/app/shared/components/not-found/not-found.component.ts (1115 bytes)
Migration completed (10 files modified).

❯ Updates ExperimentalPendingTasks to PendingTasks.
Migration completed (No changes made).
UPDATE src/app/shared/components/not-found/not-found.component.ts (1115 bytes)
Migration completed (10 files modified).

❯ Updates ExperimentalPendingTasks to PendingTasks.
Migration completed (No changes made).

❯ Updates ExperimentalPendingTasks to PendingTasks.
Migration completed (No changes made).

Migration completed (No changes made).

❯ Adds `BootstrapContext` to `bootstrapApplication` calls in `main.server.ts` to support server rendering.
❯ Adds `BootstrapContext` to `bootstrapApplication` calls in `main.server.ts` to support server rendering.
Migration completed (No changes made).
Migration completed (No changes made).

** Optional migrations of package '@angular/core' **

This package has 1 optional migration that can be executed.
Optional migrations may be skipped and executed after the update process, if preferred.

Select the migrations that you'd like to run

---

Error: Repository is not clean. Please commit or stash any changes before updating.
PS C:\Projects\TaskForge\client> ng update @angular/core@20 @angular/cli@20
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 20.3.15 to perform the update.
Using package manager: npm
Collecting installed dependencies...
Found 25 dependencies.
Fetching dependency metadata from registry...
Updating package.json with dependency @angular-devkit/build-angular @ "20.3.15" (was "19.2.19")...
Updating package.json with dependency @angular/cli @ "20.3.15" (was "19.2.19")...
Updating package.json with dependency @angular/compiler-cli @ "20.3.16" (was "19.2.18")...
Updating package.json with dependency @angular/animations @ "20.3.16" (was "19.2.18")...
Updating package.json with dependency @angular/common @ "20.3.16" (was "19.2.18")...
Updating package.json with dependency @angular/compiler @ "20.3.16" (was "19.2.18")...
Updating package.json with dependency @angular/core @ "20.3.16" (was "19.2.18")...
Updating package.json with dependency @angular/forms @ "20.3.16" (was "19.2.18")...
Updating package.json with dependency @angular/platform-browser @ "20.3.16" (was "19.2.18")...
Updating package.json with dependency @angular/platform-browser-dynamic @ "20.3.16" (was "19.2.18")...
Updating package.json with dependency @angular/router @ "20.3.16" (was "19.2.18")...
UPDATE package.json (1146 bytes)
✔ Cleaning node modules directory
✔ Installing packages
** Executing migrations of package '@angular/cli' **

❯ Update workspace generation defaults to maintain previous style guide behavior.
UPDATE angular.json (3681 bytes)
Migration completed (1 file modified).

❯ Migrate imports of 'provideServerRendering' from '@angular/platform-server' to '@angular/ssr'.
Migration completed (No changes made).

❯ Migrate 'provideServerRendering' to use 'withRoutes', and remove 'provideServerRouting' and 'provideServerRoutesConfig' from '@angular/ssr'.
** Executing migrations of package '@angular/cli' **

❯ Update workspace generation defaults to maintain previous style guide behavior.
UPDATE angular.json (3681 bytes)
Migration completed (1 file modified).

❯ Migrate imports of 'provideServerRendering' from '@angular/platform-server' to '@angular/ssr'.
Migration completed (No changes made).

❯ Migrate 'provideServerRendering' to use 'withRoutes', and remove 'provideServerRouting' and 'provideServerRoutesConfig' from '@angular/ssr'.

❯ Update workspace generation defaults to maintain previous style guide behavior.
UPDATE angular.json (3681 bytes)
Migration completed (1 file modified).

❯ Migrate imports of 'provideServerRendering' from '@angular/platform-server' to '@angular/ssr'.
Migration completed (No changes made).

❯ Migrate 'provideServerRendering' to use 'withRoutes', and remove 'provideServerRouting' and 'provideServerRoutesConfig' from '@angular/ssr'.
UPDATE angular.json (3681 bytes)
Migration completed (1 file modified).

❯ Migrate imports of 'provideServerRendering' from '@angular/platform-server' to '@angular/ssr'.
Migration completed (No changes made).

❯ Migrate 'provideServerRendering' to use 'withRoutes', and remove 'provideServerRouting' and 'provideServerRoutesConfig' from '@angular/ssr'.

❯ Migrate imports of 'provideServerRendering' from '@angular/platform-server' to '@angular/ssr'.
Migration completed (No changes made).

❯ Migrate 'provideServerRendering' to use 'withRoutes', and remove 'provideServerRouting' and 'provideServerRoutesConfig' from '@angular/ssr'.
❯ Migrate imports of 'provideServerRendering' from '@angular/platform-server' to '@angular/ssr'.
Migration completed (No changes made).

❯ Migrate 'provideServerRendering' to use 'withRoutes', and remove 'provideServerRouting' and 'provideServerRoutesConfig' from '@angular/ssr'.

❯ Migrate 'provideServerRendering' to use 'withRoutes', and remove 'provideServerRouting' and 'provideServerRoutesConfig' from '@angular/ssr'.
❯ Migrate 'provideServerRendering' to use 'withRoutes', and remove 'provideServerRouting' and 'provideServerRoutesConfig' from '@angular/ssr'.
Migration completed (No changes made).

❯ Update 'moduleResolution' to 'bundler' in TypeScript configurations.
❯ Update 'moduleResolution' to 'bundler' in TypeScript configurations.
You can read more about this, here: https://www.typescriptlang.org/tsconfig/#moduleResolution
Migration completed (No changes made).

❯ Remove any karma configuration files that only contain the default content.
The default configuration is automatically available without a specific project file.
Migration completed (No changes made).
Migration completed (No changes made).

** Optional migrations of package '@angular/cli' **
** Optional migrations of package '@angular/cli' **

This package has 1 optional migration that can be executed.
Optional migrations may be skipped and executed after the update process, if preferred.

Select the migrations that you'd like to run [use-application-builder] Migrate application projects to the new build  
system. (https://angular.dev/tools/cli/build-system-migration)

❯ Migrate application projects to the new build system.
Application projects that are using the '@angular-devkit/build-angular' package's 'browser' and/or 'browser-esbuild' builders will be migrated to use the new 'application' builder.
You can read more about this, including known issues and limitations, here: https://angular.dev/tools/cli/build-system-migration
UPDATE angular.json (3636 bytes)
UPDATE package.json (1129 bytes)
✔ Packages installed successfully.
Migration completed (2 files modified).

** Executing migrations of package '@angular/core' **

❯ Moves imports of `DOCUMENT` from `@angular/common` to `@angular/core`.
Migration completed (No changes made).

❯ Replaces usages of the deprecated InjectFlags enum.
Migration completed (No changes made).

❯ Replaces usages of the deprecated TestBed.get method with TestBed.inject.
Migration completed (No changes made).

❯ Adds `BootstrapContext` to `bootstrapApplication` calls in `main.server.ts` to support server rendering.
Migration completed (No changes made).

** Optional migrations of package '@angular/core' **

This package has 2 optional migrations that can be executed.
Optional migrations may be skipped and executed after the update process, if preferred.

Select the migrations that you'd like to run [control-flow-migration] Converts the entire application to block control
flow syntax., [router-current-navigation] Replaces usages of the deprecated Router.getCurrentNavigation method with  
the Router.currentNavigation signal.

❯ Converts the entire application to block control flow syntax.
UPDATE src/app/features/auth/login/login.component.ts (7399 bytes)
UPDATE src/app/features/auth/register/register.component.ts (15870 bytes)
UPDATE src/app/shared/components/navbar/navbar.component.ts (8556 bytes)
UPDATE src/app/features/dashboard/dashboard.component.ts (9404 bytes)
UPDATE src/app/features/projects/components/project-form.component.ts (17373 bytes)
Migration completed (5 files modified).

❯ Replaces usages of the deprecated Router.getCurrentNavigation method with the Router.currentNavigation signal.  
 Migration completed (No changes made).

---

PS C:\Projects\TaskForge\client> ng update @angular/core@21 @angular/cli@21
The installed Angular CLI version is outdated.
Installing a temporary Angular CLI versioned 21.1.1 to perform the update.
Using package manager: npm
Collecting installed dependencies...
Found 25 dependencies.
Fetching dependency metadata from registry...
Updating package.json with dependency @angular/build @ "21.1.1" (was "20.3.15")...
Updating package.json with dependency @angular/cli @ "21.1.1" (was "20.3.15")...
Updating package.json with dependency @angular/compiler-cli @ "21.1.1" (was "20.3.16")...
Updating package.json with dependency typescript @ "5.9.3" (was "5.8.3")...
Updating package.json with dependency @angular/animations @ "21.1.1" (was "20.3.16")...
Updating package.json with dependency @angular/common @ "21.1.1" (was "20.3.16")...
Updating package.json with dependency @angular/compiler @ "21.1.1" (was "20.3.16")...
Updating package.json with dependency @angular/core @ "21.1.1" (was "20.3.16")...
Updating package.json with dependency @angular/forms @ "21.1.1" (was "20.3.16")...
Updating package.json with dependency @angular/platform-browser @ "21.1.1" (was "20.3.16")...
Updating package.json with dependency @angular/platform-browser-dynamic @ "21.1.1" (was "20.3.16")...
Updating package.json with dependency @angular/router @ "21.1.1" (was "20.3.16")...
UPDATE package.json (1118 bytes)
✔ Cleaning node modules directory
✔ Installing packages
** Executing migrations of package '@angular/cli' **

❯ Remove any karma configuration files that only contain the default content.
The default configuration is automatically available without a specific project file.
Migration completed (No changes made).

❯ Update 'moduleResolution' to 'bundler' in TypeScript configurations.
You can read more about this, here: https://www.typescriptlang.org/tsconfig/#moduleResolution
Migration completed (No changes made).

❯ Updates the 'lib' property in tsconfig files to use 'es2022' or a more modern version.
UPDATE tsconfig.json (934 bytes)
Migration completed (1 file modified).

** Optional migrations of package '@angular/cli' **

This package has 1 optional migration that can be executed.
Optional migrations may be skipped and executed after the update process, if preferred.

Select the migrations that you'd like to run [use-application-builder] Migrate application projects to the new build  
system. (https://angular.dev/tools/cli/build-system-migration)

❯ Migrate application projects to the new build system.
Application projects that are using the '@angular-devkit/build-angular' package's 'browser' and/or 'browser-esbuild' builders will be migrated to use the new 'application' builder.
You can read more about this, including known issues and limitations, here: https://angular.dev/tools/cli/build-system-migration
Migration completed (No changes made).

** Executing migrations of package '@angular/core' **

❯ Adds `BootstrapContext` to `bootstrapApplication` calls in `main.server.ts` to support server rendering.
Migration completed (No changes made).

❯ Moves imports of `ApplicationConfig` from `@angular/platform-browser` to `@angular/core`.
Migration completed (No changes made).

❯ Migrates deprecated bootstrap options to providers.
Migration completed (No changes made).

❯ Converts the entire application to block control flow syntax.
Migration completed (No changes made).

❯ Ensures that the Router.lastSuccessfulNavigation signal is now invoked.
Migration completed (No changes made).

** Optional migrations of package '@angular/core' **

This package has 1 optional migration that can be executed.
Optional migrations may be skipped and executed after the update process, if preferred.

Select the migrations that you'd like to run [router-current-navigation] Replaces usages of the deprecated
Router.getCurrentNavigation method with the Router.currentNavigation signal.

❯ Replaces usages of the deprecated Router.getCurrentNavigation method with the Router.currentNavigation signal.  
 Migration completed (No changes made).
