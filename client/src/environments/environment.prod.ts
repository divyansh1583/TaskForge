/**
 * Environment configuration for production.
 */
export const environment = {
  production: true,
  apiUrl: '/api', // Relative URL for same-origin deployment
  tokenKey: 'taskforge_token',
  refreshTokenKey: 'taskforge_refresh_token',
  userKey: 'taskforge_user',
};
