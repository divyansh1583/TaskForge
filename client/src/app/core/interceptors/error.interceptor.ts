import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ApiError } from '../models/api.model';

/**
 * HTTP interceptor for global error handling.
 * WHY: Centralizes error handling and transforms HTTP errors
 * into a consistent format for the application.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let apiError: ApiError;

      if (error.error && typeof error.error === 'object') {
        // API returned a structured error
        apiError = error.error as ApiError;
      } else {
        // Network or other error
        apiError = {
          type: 'NetworkError',
          title: getErrorMessage(error),
          status: error.status,
        };
      }

      console.error('API Error:', apiError);

      return throwError(() => apiError);
    })
  );
};

/**
 * Get a user-friendly error message based on HTTP status.
 */
function getErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:
      return 'Unable to connect to the server. Please check your internet connection.';
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'You are not authenticated. Please log in.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'An internal server error occurred. Please try again later.';
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}
