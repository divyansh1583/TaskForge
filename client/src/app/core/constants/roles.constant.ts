/**
 * Application role constants.
 * WHY: Centralizes role names for consistent role-based logic.
 */
export const Roles = {
  Admin: 'Admin',
  Manager: 'Manager',
  Member: 'Member',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
