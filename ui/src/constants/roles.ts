export const Roles = {
  Admin: 'Admin',
  User: 'User',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
