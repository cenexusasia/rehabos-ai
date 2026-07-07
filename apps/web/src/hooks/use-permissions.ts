'use client';

import { useCallback, useMemo } from 'react';

import { useUser } from '@/hooks/use-user';
import {
  hasPermission,
  isAdminRole,
  hasAllPermissions,
  hasAnyPermission,
  type Permission,
} from '@/lib/permissions';

export interface UsePermissionsReturn {
  /** The user's role name, or null if not loaded / not logged in. */
  role: string | null;
  /** Whether the user is an admin. */
  isAdmin: boolean;
  /** Whether the user data is still loading. */
  isLoading: boolean;
  /** Whether the user is authenticated (has a role). */
  isAuthenticated: boolean;
  /** Check if the current user has a specific permission. */
  can: (permission: Permission) => boolean;
  /** Check if the current user has all of the specified permissions. */
  canAll: (permissions: Permission[]) => boolean;
  /** Check if the current user has any of the specified permissions. */
  canAny: (permissions: Permission[]) => boolean;
}

/**
 * React hook for checking permissions based on the current user's role.
 *
 * Must be used within a component wrapped by the QueryClientProvider
 * (since it relies on useUser which uses react-query).
 *
 * @example
 * ```tsx
 * const { can, isAdmin } = usePermissions();
 *
 * if (can('patient:write')) {
 *   // render create patient button
 * }
 *
 * if (isAdmin) {
 *   // render admin panel
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const { data: user, isLoading } = useUser();

  const role = useMemo<string | null>(() => {
    if (!user) return null;
    // Extract role from user_metadata (set during auth flow / login)
    return user.user_metadata?.role ?? null;
  }, [user]);

  const isAuthenticated = role !== null;

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    [role],
  );

  const canAll = useCallback(
    (permissions: Permission[]): boolean => {
      if (!role) return false;
      return hasAllPermissions(role, permissions);
    },
    [role],
  );

  const canAny = useCallback(
    (permissions: Permission[]): boolean => {
      if (!role) return false;
      return hasAnyPermission(role, permissions);
    },
    [role],
  );

  return {
    role,
    isAdmin: role ? isAdminRole(role) : false,
    isLoading,
    isAuthenticated,
    can,
    canAll,
    canAny,
  };
}
