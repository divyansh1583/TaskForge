/**
 * Environment configuration for development.
 * WHY: Separates environment-specific settings from code,
 * enabling different configurations for dev/staging/production.
 */
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api',
  tokenKey: 'taskforge_token',
  refreshTokenKey: 'taskforge_refresh_token',
  userKey: 'taskforge_user',
};
