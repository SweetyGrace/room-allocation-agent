/**
 * Role Management Utilities
 * Handles role selection, priority determination, and role switching logic
 */

import { EXCLUDED_ROLE_PATTERNS } from '../constants/roleConstants';

export interface Role {
  name: string;
  role_key: string;
  role_name: string;  // Display name from API (e.g., "Source", "Seeker")
  priority: number;
}

/**
 * Determines if a role should be excluded from AUTO-SELECTION
 * (Used only during login to prevent ROLE_VIEWER from being auto-selected)
 * Note: Excluded roles can still appear in dropdown for manual selection
 */
export const shouldExcludeFromAutoSelection = (role: Role | string): boolean => {
  const checkValue = typeof role === 'string' ? role : (role.role_key || role.name);
  return EXCLUDED_ROLE_PATTERNS.some(pattern => checkValue.includes(pattern));
};


/**
 * Selects the active role from an array of roles
 * Excludes ROLE_VIEWER from AUTO-SELECTION and selects highest priority role
 * Note: This is only for automatic selection during login
 */
export const selectActiveRole = (roles: Role[]): Role | null => {
  if (!roles || roles.length === 0) {
    return null;
  }

  // Filter out roles that should not be auto-selected (e.g., ROLE_VIEWER)
  const eligibleRoles = roles.filter(role => !shouldExcludeFromAutoSelection(role));

  if (eligibleRoles.length === 0) {
    return null;
  }

  // Sort by priority without mutating original array (lowest number = highest priority)
  const sortedRoles = [...eligibleRoles].sort((a, b) => {
    const priorityA = a.priority || 999;
    const priorityB = b.priority || 999;
    return priorityA - priorityB;
  });

  return sortedRoles[0];
};

/**
 * Returns the role key from role object
 * Note: Currently returns the raw role_key value as-is (e.g., "ROLE_MAHATRIA")
 * The backend API expects this format for the active-role header
 */
export const extractRoleKey = (role: Role): string => {
  return role.role_key;
};

/**
 * Validates if a role object has required fields
 */
export const isValidRole = (role: any): role is Role => {
  return role && typeof role === 'object' && 
         (typeof role.name === 'string' || typeof role.role_key === 'string');
};

/**
 * Filters and prepares roles for display in dropdown
 * Note: Currently excludes roles from auto-selection pattern (e.g., ROLE_VIEWER)
 * Returns roles sorted by priority (lowest number = highest priority)
 * TODO: Consider whether excluded roles should appear in dropdown for manual selection
 */
export const prepareRolesForDropdown = (roles: Role[]): Role[] => {
  const filtered = roles.filter(role => !shouldExcludeFromAutoSelection(role));
  return filtered
    .map(role => ({
      ...role,
      priority: role.priority || 999
    }))
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
};
