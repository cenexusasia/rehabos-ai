/**
 * RehabOS AI — Permission System
 *
 * Defines all available permissions and maps them to default roles.
 * Permissions follow a resource:action naming convention.
 */

export type Permission =
  | 'patient:read'
  | 'patient:write'
  | 'patient:delete'
  | 'soap:read'
  | 'soap:write'
  | 'soap:sign'
  | 'assessment:administer'
  | 'assessment:interpret'
  | 'billing:read'
  | 'billing:write'
  | 'schedule:read'
  | 'schedule:write'
  | 'admin:users'
  | 'admin:settings'
  | 'admin:audit';

export type RoleName = keyof typeof ROLES;

/**
 * Default role-to-permission mappings.
 * These are seeded into the database and can be customized per-org.
 */
export const ROLES: Record<string, Permission[]> = {
  admin: [
    'patient:read',
    'patient:write',
    'patient:delete',
    'soap:read',
    'soap:write',
    'soap:sign',
    'assessment:administer',
    'assessment:interpret',
    'billing:read',
    'billing:write',
    'schedule:read',
    'schedule:write',
    'admin:users',
    'admin:settings',
    'admin:audit',
  ],
  clinician: [
    'patient:read',
    'patient:write',
    'soap:read',
    'soap:write',
    'soap:sign',
    'assessment:administer',
    'assessment:interpret',
    'billing:read',
    'schedule:read',
    'schedule:write',
  ],
  billing_admin: [
    'patient:read',
    'billing:read',
    'billing:write',
  ],
  front_desk: [
    'patient:read',
    'patient:write',
    'schedule:read',
    'schedule:write',
  ],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(
  userRole: string,
  permission: Permission,
): boolean {
  return ROLES[userRole]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: string): Permission[] {
  return ROLES[role] ?? [];
}

/**
 * Check if a role is the admin role.
 */
export function isAdminRole(role: string): boolean {
  return role === 'admin';
}

/**
 * Check if a role has all of the specified permissions.
 */
export function hasAllPermissions(
  userRole: string,
  permissions: Permission[],
): boolean {
  const userPermissions = ROLES[userRole];
  if (!userPermissions) return false;
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * Check if a role has any of the specified permissions.
 */
export function hasAnyPermission(
  userRole: string,
  permissions: Permission[],
): boolean {
  const userPermissions = ROLES[userRole];
  if (!userPermissions) return false;
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * All available permissions as an array (useful for admin UIs).
 */
export const ALL_PERMISSIONS: Permission[] = [
  'patient:read',
  'patient:write',
  'patient:delete',
  'soap:read',
  'soap:write',
  'soap:sign',
  'assessment:administer',
  'assessment:interpret',
  'billing:read',
  'billing:write',
  'schedule:read',
  'schedule:write',
  'admin:users',
  'admin:settings',
  'admin:audit',
];

/**
 * Human-readable labels for each permission.
 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  'patient:read': 'View Patients',
  'patient:write': 'Create / Edit Patients',
  'patient:delete': 'Delete Patients',
  'soap:read': 'View SOAP Notes',
  'soap:write': 'Create / Edit SOAP Notes',
  'soap:sign': 'Sign SOAP Notes',
  'assessment:administer': 'Administer Assessments',
  'assessment:interpret': 'Interpret Assessment Results',
  'billing:read': 'View Billing',
  'billing:write': 'Create / Edit Billing',
  'schedule:read': 'View Schedule',
  'schedule:write': 'Create / Edit Schedule',
  'admin:users': 'Manage Users',
  'admin:settings': 'Manage Settings',
  'admin:audit': 'View Audit Logs',
};
