# Angular Update Guide

> **TaskForge Client** - Migration from Angular 18 to Angular 21

This document records the step-by-step upgrade process for the TaskForge Angular client application.

---

## Table of Contents

- [Overview](#overview)
- [Step 1: Angular 18 → 19](#step-1-angular-18--19)
- [Step 2: Angular 19 → 20](#step-2-angular-19--20)
- [Step 3: Angular 20 → 21](#step-3-angular-20--21)
- [Summary of Changes](#summary-of-changes)

---

## Overview

| Version | Angular | TypeScript | Key Changes |
|---------|---------|------------|-------------|
| Before  | 18.2.14 | 5.4.5      | Original version |
| Step 1  | 19.2.18 | 5.8.3      | Standalone components, new build system |
| Step 2  | 20.3.16 | 5.8.3      | Control flow migration, workspace defaults |
| Final   | 21.1.1  | 5.9.3      | ES2022 lib, final migrations |

---

## Step 1: Angular 18 → 19

### Command

```bash
ng update @angular/core@19 @angular/cli@19
```

### Dependencies Updated

| Package | From | To |
|---------|------|-----|
| `@angular-devkit/build-angular` | 18.2.21 | 19.2.19 |
| `@angular/cli` | 18.2.21 | 19.2.19 |
| `@angular/core` | 18.2.14 | 19.2.18 |
| `@angular/compiler-cli` | 18.2.14 | 19.2.18 |
| `@angular/animations` | 18.2.14 | 19.2.18 |
| `@angular/common` | 18.2.14 | 19.2.18 |
| `@angular/compiler` | 18.2.14 | 19.2.18 |
| `@angular/forms` | 18.2.14 | 19.2.18 |
| `@angular/platform-browser` | 18.2.14 | 19.2.18 |
| `@angular/platform-browser-dynamic` | 18.2.14 | 19.2.18 |
| `@angular/router` | 18.2.14 | 19.2.18 |
| `typescript` | 5.4.5 | 5.8.3 |
| `zone.js` | 0.14.10 | 0.15.1 |

### Migrations Executed

#### `@angular/cli` Migrations

- ✅ Update `@angular/ssr` import paths for `CommonEngine` — *No changes needed*
- ✅ Update deprecated options in `angular.json` — *No changes needed*

#### Optional: New Build System Migration

> Migrated to the new `application` builder from `browser`/`browser-esbuild`.
> 
> 📖 [Build System Migration Guide](https://angular.dev/tools/cli/build-system-migration)

**Files Modified:**
- `tsconfig.json`

#### `@angular/core` Migrations

- ✅ **Standalone Component Migration** — Updated components to explicitly set `standalone: false`
- ✅ `ExperimentalPendingTasks` → `PendingTasks` — *No changes needed*
- ✅ Add `BootstrapContext` to SSR — *No changes needed*

**Files Modified (Standalone Migration):**
- `src/app/app.component.ts`
- `src/app/features/auth/auth-layout.component.ts`
- `src/app/features/auth/login/login.component.ts`
- `src/app/features/auth/register/register.component.ts`
- `src/app/shared/components/navbar/navbar.component.ts`
- `src/app/features/dashboard/dashboard.component.ts`
- `src/app/features/projects/components/projects-list.component.ts`
- `src/app/features/projects/components/project-form.component.ts`
- `src/app/features/projects/components/project-detail.component.ts`
- `src/app/shared/components/not-found/not-found.component.ts`

---

## Step 2: Angular 19 → 20

### Command

```bash
ng update @angular/core@20 @angular/cli@20
```

### Dependencies Updated

| Package | From | To |
|---------|------|-----|
| `@angular-devkit/build-angular` | 19.2.19 | 20.3.15 |
| `@angular/cli` | 19.2.19 | 20.3.15 |
| `@angular/core` | 19.2.18 | 20.3.16 |
| `@angular/compiler-cli` | 19.2.18 | 20.3.16 |
| `@angular/animations` | 19.2.18 | 20.3.16 |
| `@angular/common` | 19.2.18 | 20.3.16 |
| `@angular/compiler` | 19.2.18 | 20.3.16 |
| `@angular/forms` | 19.2.18 | 20.3.16 |
| `@angular/platform-browser` | 19.2.18 | 20.3.16 |
| `@angular/platform-browser-dynamic` | 19.2.18 | 20.3.16 |
| `@angular/router` | 19.2.18 | 20.3.16 |

### Migrations Executed

#### `@angular/cli` Migrations

- ✅ Update workspace generation defaults — `angular.json` modified
- ✅ Migrate `provideServerRendering` imports — *No changes needed*
- ✅ Migrate `provideServerRendering` to use `withRoutes` — *No changes needed*
- ✅ Update `moduleResolution` to `bundler` — *No changes needed*
  > 📖 [TypeScript moduleResolution](https://www.typescriptlang.org/tsconfig/#moduleResolution)
- ✅ Remove default karma configuration files — *No changes needed*

#### Optional: Application Builder Migration

**Files Modified:**
- `angular.json`
- `package.json`

#### `@angular/core` Migrations

- ✅ Move `DOCUMENT` imports to `@angular/core` — *No changes needed*
- ✅ Replace deprecated `InjectFlags` enum — *No changes needed*
- ✅ Replace `TestBed.get` with `TestBed.inject` — *No changes needed*
- ✅ Add `BootstrapContext` for SSR — *No changes needed*

#### Optional: Control Flow Migration

> Converted `*ngIf`, `*ngFor`, `*ngSwitch` to the new block control flow syntax (`@if`, `@for`, `@switch`).

**Files Modified:**
- `src/app/features/auth/login/login.component.ts`
- `src/app/features/auth/register/register.component.ts`
- `src/app/shared/components/navbar/navbar.component.ts`
- `src/app/features/dashboard/dashboard.component.ts`
- `src/app/features/projects/components/project-form.component.ts`

---

## Step 3: Angular 20 → 21

### Command

```bash
ng update @angular/core@21 @angular/cli@21
```

### Dependencies Updated

| Package | From | To |
|---------|------|-----|
| `@angular/build` | 20.3.15 | 21.1.1 |
| `@angular/cli` | 20.3.15 | 21.1.1 |
| `@angular/core` | 20.3.16 | 21.1.1 |
| `@angular/compiler-cli` | 20.3.16 | 21.1.1 |
| `@angular/animations` | 20.3.16 | 21.1.1 |
| `@angular/common` | 20.3.16 | 21.1.1 |
| `@angular/compiler` | 20.3.16 | 21.1.1 |
| `@angular/forms` | 20.3.16 | 21.1.1 |
| `@angular/platform-browser` | 20.3.16 | 21.1.1 |
| `@angular/platform-browser-dynamic` | 20.3.16 | 21.1.1 |
| `@angular/router` | 20.3.16 | 21.1.1 |
| `typescript` | 5.8.3 | 5.9.3 |

### Migrations Executed

#### `@angular/cli` Migrations

- ✅ Remove default karma configuration files — *No changes needed*
- ✅ Update `moduleResolution` to `bundler` — *No changes needed*
- ✅ Update `lib` to `es2022` — `tsconfig.json` modified

#### `@angular/core` Migrations

- ✅ Add `BootstrapContext` for SSR — *No changes needed*
- ✅ Move `ApplicationConfig` imports to `@angular/core` — *No changes needed*
- ✅ Migrate deprecated bootstrap options to providers — *No changes needed*
- ✅ Convert to block control flow syntax — *No changes needed*
- ✅ Ensure `Router.lastSuccessfulNavigation` signal is invoked — *No changes needed*

#### Optional Migrations

- ✅ Replace `Router.getCurrentNavigation` with `currentNavigation` signal — *No changes needed*

---

## Summary of Changes

### Files Modified During Migration

| File | v19 | v20 | v21 |
|------|-----|-----|-----|
| `package.json` | ✅ | ✅ | ✅ |
| `tsconfig.json` | ✅ | | ✅ |
| `angular.json` | | ✅ | |
| `src/app/app.component.ts` | ✅ | | |
| `src/app/features/auth/auth-layout.component.ts` | ✅ | | |
| `src/app/features/auth/login/login.component.ts` | ✅ | ✅ | |
| `src/app/features/auth/register/register.component.ts` | ✅ | ✅ | |
| `src/app/shared/components/navbar/navbar.component.ts` | ✅ | ✅ | |
| `src/app/features/dashboard/dashboard.component.ts` | ✅ | ✅ | |
| `src/app/features/projects/components/projects-list.component.ts` | ✅ | | |
| `src/app/features/projects/components/project-form.component.ts` | ✅ | ✅ | |
| `src/app/features/projects/components/project-detail.component.ts` | ✅ | | |
| `src/app/shared/components/not-found/not-found.component.ts` | ✅ | | |

### Key Migration Highlights

1. **Standalone Components** (v19): All components now explicitly declare `standalone: false`
2. **New Build System** (v19-20): Migrated from `browser` to `application` builder
3. **Control Flow Syntax** (v20): Converted structural directives to block syntax
4. **TypeScript 5.9** (v21): Updated to latest TypeScript with ES2022 lib support

### References

- [Angular Update Guide](https://angular.dev/update-guide)
- [Build System Migration](https://angular.dev/tools/cli/build-system-migration)
- [TypeScript moduleResolution](https://www.typescriptlang.org/tsconfig/#moduleResolution)