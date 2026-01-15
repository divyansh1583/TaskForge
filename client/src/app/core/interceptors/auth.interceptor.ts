import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * HTTP interceptor that adds JWT token to requests and handles token refresh.
 * WHY: Automatically attaches authentication headers to all API requests
 * and transparently handles token expiration/refresh.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Skip token for auth endpoints (except /me)
  if (isAuthEndpoint(req.url) && !req.url.includes('/me')) {
    return next(req);
  }

  const token = authService.getAccessToken();

  if (token) {
    req = addTokenToRequest(req, token);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !isRefreshEndpoint(req.url)) {
        return handleTokenRefresh(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Add authorization header to request.
 */
function addTokenToRequest(
  req: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Handle token refresh when 401 is received.
 */
function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (!authService.refreshTokenInProgress) {
    authService.refreshTokenInProgress = true;
    authService.refreshTokenSubject$.next(null);

    return authService.refreshToken().pipe(
      switchMap((response) => {
        authService.refreshTokenInProgress = false;
        authService.refreshTokenSubject$.next(response.accessToken);
        return next(addTokenToRequest(req, response.accessToken));
      }),
      catchError((error) => {
        authService.refreshTokenInProgress = false;
        authService.logout();
        return throwError(() => error);
      })
    );
  }

  // Wait for token refresh to complete
  return authService.refreshTokenSubject$.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) => next(addTokenToRequest(req, token!)))
  );
}

/**
 * Check if URL is an auth endpoint.
 */
function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/');
}

/**
 * Check if URL is the refresh token endpoint.
 */
function isRefreshEndpoint(url: string): boolean {
  return url.includes('/auth/refresh-token');
}
