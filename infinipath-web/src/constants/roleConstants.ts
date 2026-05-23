/**
 * Role Management Constants
 * Centralized constants for role handling across the application
 */

// LocalStorage Keys
export const ROLE_STORAGE_KEYS = {
  USER_ROLE: "userRole",           // Stores current active role object
  ROLE_KEY: "roleKey",             // Stores current role key for API
  AVAILABLE_ROLES: "availableRoles", // Stores all available roles for user
} as const;

// API Header Keys
export const ROLE_API_HEADERS = {
  ACTIVE_ROLE: "active-role",      // Header key sent with API requests
} as const;

// Excluded Roles (roles that should not be selectable as active role)
export const EXCLUDED_ROLE_PATTERNS = ["ROLE_VIEWER", "viewer"] as const;
