/**
 * User model representing the authenticated user.
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
}

/**
 * Authentication response from the API.
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: Date;
  user: User;
}

/**
 * Login request payload.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload.
 */
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

/**
 * Refresh token request payload.
 */
export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}
