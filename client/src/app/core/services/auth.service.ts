import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';

import { environment } from '@env/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from '../models/auth.model';

/**
 * Authentication service handling login, registration, and token management.
 * WHY: Centralizes all authentication logic using Angular signals for 
 * reactive state management without NgRx overhead.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive state management
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);

  // Computed signals for derived state
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly userRoles = computed(() => this.currentUserSignal()?.roles ?? []);

  // BehaviorSubject for token refresh coordination
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  /**
   * Load user from localStorage on app initialization.
   */
  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(environment.userKey);
    const token = localStorage.getItem(environment.tokenKey);

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser) as User;
        this.currentUserSignal.set(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  /**
   * Register a new user account.
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => this.handleAuthResponse(response)),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Login with email and password.
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => this.handleAuthResponse(response)),
      catchError((error) => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh the access token using the refresh token.
   */
  refreshToken(): Observable<AuthResponse> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return throwError(() => new Error('No tokens available'));
    }

    const request: RefreshTokenRequest = { accessToken, refreshToken };

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, request).pipe(
      tap((response) => this.handleAuthResponse(response)),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout the current user.
   */
  logout(): void {
    const token = this.getAccessToken();

    if (token) {
      // Call revoke endpoint (fire and forget)
      this.http.post(`${this.apiUrl}/revoke-token`, {}).subscribe({
        error: () => {
          // Ignore errors during logout
        },
      });
    }

    this.clearStorage();
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get the current access token.
   */
  getAccessToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  /**
   * Get the current refresh token.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshTokenKey);
  }

  /**
   * Check if user has a specific role.
   */
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  /**
   * Check if user has any of the specified roles.
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * Get current user from API.
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        localStorage.setItem(environment.userKey, JSON.stringify(user));
      })
    );
  }

  /**
   * Handle successful authentication response.
   */
  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(environment.tokenKey, response.accessToken);
    localStorage.setItem(environment.refreshTokenKey, response.refreshToken);
    localStorage.setItem(environment.userKey, JSON.stringify(response.user));

    this.currentUserSignal.set(response.user);
    this.isLoadingSignal.set(false);
  }

  /**
   * Clear all authentication data from storage.
   */
  private clearStorage(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshTokenKey);
    localStorage.removeItem(environment.userKey);
  }

  /**
   * Check if the token is expired or about to expire.
   */
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      // Consider token expired if it expires in less than 60 seconds
      return Date.now() > expirationTime - 60000;
    } catch {
      return true;
    }
  }

  // Token refresh coordination for interceptor
  get refreshTokenInProgress(): boolean {
    return this.isRefreshing;
  }

  set refreshTokenInProgress(value: boolean) {
    this.isRefreshing = value;
  }

  get refreshTokenSubject$(): BehaviorSubject<string | null> {
    return this.refreshTokenSubject;
  }
}
