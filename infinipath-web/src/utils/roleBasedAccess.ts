/**
 * Role-Based Access Control (RBAC) Utility
 * Handles permissions for different user roles based on resources and actions
 */

import { ACTION_LABELS, ACTION_TYPE_LABELS, ApprovalStatus, DEFINED_ROLES, RESEND_EMAIL, SWAP_REQUEST_TITLE } from "../constants/textConstants";


// Define all possible roles
export const ROLES = {
  ADMIN: "admin",
  MAHATRIA: "mahatria",
  SUPER_ADMIN: "superadmin",
  OPS_ADMIN: "operational_manger",
  FINANCE_ADMIN: "finance_manager",
  RM: "relational_manager",
  VIEWER: "viewer",
  SHOBA: "shoba",
  RM_SUPPORT: "rm_support",
};

// Define all possible actions
export const ACTIONS = {
  CREATE: "C",
  READ: "R",
  UPDATE: "U",
  DELETE: "D",
};

// Define all resources
export const RESOURCES = {
  BASIC_DETAILS: "Basic Details",
  PROGRAM_PREFERENCE: "PROGRAM_PREFERENCE",
  PAYMENT_DETAILS: "Payment & Invoice",
  INVOICE_DETAILS: "INVOICE_DETAILS",
  TRAVEL_DETAILS: "Travel Plan",
  GOODIES: "Goodies and Ratria Pillars",
  JOURNEY_GRAPH: "JOURNEY_GRAPH",
  SEEKER_DETAILS: "SEEKER_DETAILS",
  QUESTIONS: "QUESTIONS",
  RM_REVIEW: "RM_REVIEW",
  ADD_PROGRAM: "ADD_PROGRAM",
  ADD_REVIEW: "ADD_REVIEW",
  ADD_SEEKER_TAG: "ADD_SEEKER_TAG",
  REQ_SWAP_SEEKER: "REQ_SWAP_SEEKER",
  SEND_INVOICE: "SEND_INVOICE",
  SWAP_ACTION: "SWAP_ACTION",
  REGISTRATIONSKPI: "seats",
  PAYMENT_KPI: "payments",
  INVOICE_KPI: "invoices",
  TRAVElPLAN_KPI: "travelAndLogistics",
  ONHOLD_KPI: "onHold",
  MARK_AS_PAID_RESEND_INVOICE: "MARK_AS_PAID_RESEND_INVOICE",
  SEAT_ALLOCATION_TAB: "seat-allocations-tab",
  DOWNLOAD_INVOICE:"download-invoice",
  DRAFT_TAB: "drafts-tab",
  DOWNLOAD_PROFORMA: "DOWNLOAD_PROFORMA",
  EMAIL_ICON: "email-icon",
  CANCEL_REGISTRATION : "CANCEL_REGISTRATION",
  SEEKER_ASSOCIATION:"SEEKER_ASSOCIATION",
  ROOM_ALLOCATION:"ROOM_ALLOCATION",
  EXPRESSIONS:"EXPRESSIONS",
  SEEKER_EXPERIENCE:"SEEKER_EXPERIENCE",
  BULK_ID_PROOFS: "BULK_ID_PROOFS",
};

// Permissions matrix based on the provided image
const PERMISSIONS_MATRIX = {
  [ROLES.RM_SUPPORT]: {
    [RESOURCES.BASIC_DETAILS]: ["R"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["R"],
    [RESOURCES.PAYMENT_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.INVOICE_DETAILS]: ["R"],
    [RESOURCES.TRAVEL_DETAILS]: ["R", "U"],
    [RESOURCES.GOODIES]: ["R", "U"],
    [RESOURCES.JOURNEY_GRAPH]: [],
    [RESOURCES.SEEKER_DETAILS]: [],
    [RESOURCES.QUESTIONS]: [],
    [RESOURCES.RM_REVIEW]: [],
    [RESOURCES.REGISTRATIONSKPI]: ["R"],
    [RESOURCES.PAYMENT_KPI]: [],
    [RESOURCES.INVOICE_KPI]: [],
    [RESOURCES.TRAVElPLAN_KPI]: ["R"],
    [RESOURCES.CANCEL_REGISTRATION]: [],
    [RESOURCES.SEEKER_ASSOCIATION]:[],
    [RESOURCES.ADD_SEEKER_TAG]: [], 
    [RESOURCES.REQ_SWAP_SEEKER]: ["C", "R", "U", "D"],
    [RESOURCES.SWAP_ACTION]: ["C", "R", "U", "D"],
    [RESOURCES.BULK_ID_PROOFS]: [],


  },
  [ROLES.MAHATRIA]: {
    [RESOURCES.BASIC_DETAILS]: ["R"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["R"],
    [RESOURCES.PAYMENT_DETAILS]: ["R"],
    [RESOURCES.INVOICE_DETAILS]: ["R"],
    [RESOURCES.TRAVEL_DETAILS]: ["R"],
    [RESOURCES.JOURNEY_GRAPH]: ["R"],
    [RESOURCES.SEEKER_DETAILS]: ["R"],
    [RESOURCES.QUESTIONS]: ["R"],
    [RESOURCES.RM_REVIEW]: ["R"],
    [RESOURCES.SEND_INVOICE]: ["C"],
    [RESOURCES.REGISTRATIONSKPI]: ["R"],
    [RESOURCES.PAYMENT_KPI]: ["R"],
    [RESOURCES.INVOICE_KPI]: ["R"],
    [RESOURCES.TRAVElPLAN_KPI]: ["R"],
    [RESOURCES.MARK_AS_PAID_RESEND_INVOICE]: [],
    [RESOURCES.SEAT_ALLOCATION_TAB]: ["R"],
    [RESOURCES.DOWNLOAD_INVOICE]: [],
    [RESOURCES.SEEKER_ASSOCIATION]:["R"],
    [RESOURCES.ADD_SEEKER_TAG]: ["R"],
    [RESOURCES.ROOM_ALLOCATION]: ["C", "R", "U", "D"],
    [RESOURCES.EXPRESSIONS]: ["C", "R", "U", "D"],
    [RESOURCES.SEEKER_EXPERIENCE]: ["C", "R", "U", "D"],
    [RESOURCES.BULK_ID_PROOFS]: [],
    
  },
  [ROLES.SUPER_ADMIN]: {
    [RESOURCES.BASIC_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["C", "R", "U", "D"],
    [RESOURCES.PAYMENT_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.INVOICE_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.TRAVEL_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.GOODIES]: ["C", "R", "U", "D"],
    [RESOURCES.JOURNEY_GRAPH]: [],
    [RESOURCES.SEEKER_DETAILS]: [],
    [RESOURCES.SEND_INVOICE]: ["C"],
    [RESOURCES.QUESTIONS]: [],
    [RESOURCES.RM_REVIEW]: ["R"],
    [RESOURCES.REGISTRATIONSKPI]: ["R"],
    [RESOURCES.PAYMENT_KPI]: ["R"],
    [RESOURCES.INVOICE_KPI]: ["R"],
    [RESOURCES.TRAVElPLAN_KPI]: ["R"],
    [RESOURCES.MARK_AS_PAID_RESEND_INVOICE]: ["R"],
    [RESOURCES.DOWNLOAD_INVOICE]: ["C"],
    [RESOURCES.DRAFT_TAB]: ["R"],
    [RESOURCES.CANCEL_REGISTRATION]: ["C", "R", "U", "D"],
    [RESOURCES.SEEKER_ASSOCIATION]:[],
    [RESOURCES.ADD_SEEKER_TAG]: [],
    [RESOURCES.BULK_ID_PROOFS]: [],
    
  },
  [ROLES.ADMIN]: {
    [RESOURCES.BASIC_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["C", "R", "U", "D"],
    [RESOURCES.PAYMENT_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.INVOICE_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.TRAVEL_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.GOODIES]: ["C", "R", "U", "D"],
    [RESOURCES.JOURNEY_GRAPH]: [],
    [RESOURCES.SEEKER_DETAILS]: [],
    [RESOURCES.SEND_INVOICE]: ["C"],
    [RESOURCES.QUESTIONS]: [],
    // [RESOURCES.RM_REVIEW]: ["R"],
    [RESOURCES.ADD_PROGRAM]: ["C"],
    [RESOURCES.REGISTRATIONSKPI]: ["R"],
    [RESOURCES.PAYMENT_KPI]: ["R"],
    [RESOURCES.INVOICE_KPI]: ["R"],
    [RESOURCES.TRAVElPLAN_KPI]: ["R"],
    [RESOURCES.MARK_AS_PAID_RESEND_INVOICE]: [],
    [RESOURCES.DOWNLOAD_INVOICE]: ["C"],
    [RESOURCES.DRAFT_TAB]: ["R"],
    [RESOURCES.CANCEL_REGISTRATION]: ["C", "R", "U", "D"],    
    [RESOURCES.EMAIL_ICON]: ["R"],
    [RESOURCES.SEEKER_ASSOCIATION]:[],
    [RESOURCES.ADD_SEEKER_TAG]: [],
    [RESOURCES.BULK_ID_PROOFS]: ["R"],


  },
  [ROLES.OPS_ADMIN]: {
    [RESOURCES.BASIC_DETAILS]: ["R"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["R"],
    [RESOURCES.PAYMENT_DETAILS]: ["R"],
    [RESOURCES.INVOICE_DETAILS]: ["R"],
    [RESOURCES.TRAVEL_DETAILS]: ["R", "U"],
    [RESOURCES.GOODIES]: ["R", "U"],
    [RESOURCES.JOURNEY_GRAPH]: [],
    [RESOURCES.SEEKER_DETAILS]: [],
    [RESOURCES.QUESTIONS]: [],
    [RESOURCES.RM_REVIEW]: [],
    [RESOURCES.REGISTRATIONSKPI]: ["R"],
    [RESOURCES.PAYMENT_KPI]: [],
    [RESOURCES.INVOICE_KPI]: [],
    [RESOURCES.TRAVElPLAN_KPI]: ["R"],
    [RESOURCES.CANCEL_REGISTRATION]: [],
    [RESOURCES.SEEKER_ASSOCIATION]:[],
    [RESOURCES.ADD_SEEKER_TAG]: [], 
    [RESOURCES.BULK_ID_PROOFS]: ["R"],
  },
  [ROLES.FINANCE_ADMIN]: {
    [RESOURCES.BASIC_DETAILS]: ["R"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["R"],
    [RESOURCES.PAYMENT_DETAILS]: ["R", "U"],
    [RESOURCES.INVOICE_DETAILS]: ["R", "U"],
    [RESOURCES.TRAVEL_DETAILS]: [],
    [RESOURCES.JOURNEY_GRAPH]: [],
    [RESOURCES.SEEKER_DETAILS]: [],
    [RESOURCES.QUESTIONS]: [],
    [RESOURCES.RM_REVIEW]: [],
    [RESOURCES.SEND_INVOICE]: ["C"],
    [RESOURCES.REGISTRATIONSKPI]: ["R"],
    [RESOURCES.PAYMENT_KPI]: ["R"],
    [RESOURCES.INVOICE_KPI]: ["R"],
    [RESOURCES.TRAVElPLAN_KPI]: [],
    [RESOURCES.MARK_AS_PAID_RESEND_INVOICE]: ["R" , "C", "U", "D"],
    [RESOURCES.DOWNLOAD_INVOICE]: ["C"],
    [RESOURCES.SEEKER_ASSOCIATION]:[],
    [RESOURCES.ADD_SEEKER_TAG]: [], 
    [RESOURCES.BULK_ID_PROOFS]: [],
  },
  [ROLES.RM]: {
    [RESOURCES.BASIC_DETAILS]: ["R"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["R"],
    [RESOURCES.PAYMENT_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.INVOICE_DETAILS]: ["R"],
    [RESOURCES.TRAVEL_DETAILS]: ["R", "U"],
    [RESOURCES.JOURNEY_GRAPH]: [],
    [RESOURCES.SEEKER_DETAILS]: [],
    [RESOURCES.QUESTIONS]: [],
    [RESOURCES.SEND_INVOICE]: ["C"],
    [RESOURCES.RM_REVIEW]: ["R", "U"],
    [RESOURCES.ADD_REVIEW]: ["C", "R", "U", "D"],
    [RESOURCES.REQ_SWAP_SEEKER]: ["C", "R", "U", "D"],
    [RESOURCES.SWAP_ACTION]: ["C", "R", "U", "D"],
    [RESOURCES.REGISTRATIONSKPI]: ["R"],
    [RESOURCES.PAYMENT_KPI]: ["R"],
    [RESOURCES.INVOICE_KPI]: ["R"],
    [RESOURCES.TRAVElPLAN_KPI]: ["R"],
    [RESOURCES.DOWNLOAD_INVOICE]: ["C"],
    [RESOURCES.MARK_AS_PAID_RESEND_INVOICE]: [],
    [RESOURCES.DRAFT_TAB]: ["R"],
    [RESOURCES.DOWNLOAD_PROFORMA]: ["C", "R", "U", "D"],
    [RESOURCES.SEEKER_ASSOCIATION]:["R"],
    [RESOURCES.GOODIES]: ["R", "U"], 
    [RESOURCES.ADD_SEEKER_TAG]: ["R","U","C"], 
    [RESOURCES.SEEKER_EXPERIENCE]: ["C", "R"],
    [RESOURCES.BULK_ID_PROOFS]: [],
  },
  [ROLES.VIEWER]: {
    [RESOURCES.BASIC_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["C", "R", "U", "D"],
    [RESOURCES.PAYMENT_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.INVOICE_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.TRAVEL_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.JOURNEY_GRAPH]: [],
    [RESOURCES.SEEKER_DETAILS]: [],
    [RESOURCES.QUESTIONS]: [],
    [RESOURCES.RM_REVIEW]: [],
    [RESOURCES.SEEKER_ASSOCIATION]:[],
    [RESOURCES.ADD_SEEKER_TAG]: [],  
    [RESOURCES.BULK_ID_PROOFS]: [],
  },
  [ROLES.SHOBA]: {
    [RESOURCES.BASIC_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.PROGRAM_PREFERENCE]: ["C", "R", "U", "D"],
    [RESOURCES.PAYMENT_DETAILS]: ["C", "R", "D"],
    [RESOURCES.INVOICE_DETAILS]: ["C", "R", "D"],
    [RESOURCES.TRAVEL_DETAILS]: ["C", "R", "U", "D"],
    [RESOURCES.GOODIES]: ["C", "R", "U", "D"],
    [RESOURCES.JOURNEY_GRAPH]: [],
    [RESOURCES.SEEKER_DETAILS]: [],
    [RESOURCES.QUESTIONS]: ["R"],
    [RESOURCES.SEND_INVOICE]: ["C"],
    [RESOURCES.RM_REVIEW]: ["R"],
    [RESOURCES.ADD_PROGRAM]: [],
    [RESOURCES.SWAP_ACTION]: ["C", "R", "U", "D"],
    [RESOURCES.ADD_REVIEW]: ["C", "R", "U", "D"],
    [RESOURCES.REGISTRATIONSKPI]: ["R"],
    [RESOURCES.PAYMENT_KPI]: [],
    [RESOURCES.INVOICE_KPI]: [],
    [RESOURCES.TRAVElPLAN_KPI]: ["R"],
    [RESOURCES.DOWNLOAD_INVOICE]: ["C"],
    [RESOURCES.MARK_AS_PAID_RESEND_INVOICE]: [],
    [RESOURCES.DRAFT_TAB]: ["R"],
    [RESOURCES.SEAT_ALLOCATION_TAB]: ["R"],
    [RESOURCES.EMAIL_ICON]:["R"],
    [RESOURCES.REQ_SWAP_SEEKER]: ["C", "R", "U", "D"],
    [RESOURCES.CANCEL_REGISTRATION]: ["C", "R", "U", "D"],
    [RESOURCES.SEEKER_ASSOCIATION]:["R"],
    [RESOURCES.ADD_SEEKER_TAG]: ["R","U","C"],  
    [RESOURCES.ROOM_ALLOCATION]: ["C", "R", "U", "D"],
    [RESOURCES.EXPRESSIONS]: ["C", "R", "U", "D"],
    [RESOURCES.SEEKER_EXPERIENCE]: ["C", "R", "U", "D"],
    [RESOURCES.BULK_ID_PROOFS]: ["R"],
  },
};

/**
 * Validates if a user role exists
 * @param {string} role - User role to validate
 * @returns {boolean} - True if role is valid
 */
const isValidRole = (role: string) => {
  return Object.values(ROLES).includes(role);
};

/**
 * Validates if a resource exists
 * @param {string} resource - Resource to validate
 * @returns {boolean} - True if resource is valid
 */
const isValidResource = (resource: string) => {
  return Object.values(RESOURCES).includes(resource);
};

/**
 * Validates if an action exists
 * @param {string} action - Action to validate
 * @returns {boolean} - True if action is valid
 */
const isValidAction = (action: string) => {
  return Object.values(ACTIONS).includes(action);
};

/**
 * Main function to check if a user has permission for a specific action on a resource
 * @param {string} userRole - The role of the user
 * @param {string} resource - The resource being accessed
 * @param {string} action - The action being performed (C, R, U, D)
 * @returns {boolean} - True if user has permission, false otherwise
 */
export const hasPermission = (
  userRole: string,
  resource: string,
  action: string,
) => {
  try {
    // Input validation
    if (!userRole || typeof userRole !== "string") {
      console.warn("RBAC: Invalid user role provided");
      return false;
    }

    if (!resource || typeof resource !== "string") {
      console.warn("RBAC: Invalid resource provided");
      return false;
    }

    if (!action || typeof action !== "string") {
      console.warn("RBAC: Invalid action provided");
      return false;
    }

    // Normalize inputs
    const normalizedRole = userRole.toLowerCase().trim();
    const normalizedResource = resource.trim();
    const normalizedAction = action.toUpperCase().trim();

    // Validate inputs
    if (!isValidRole(normalizedRole)) {
      console.warn(`RBAC: Invalid role '${userRole}' provided`);
      return false;
    }

    if (!isValidResource(normalizedResource)) {
      console.warn(`RBAC: Invalid resource '${resource}' provided`);
      return false;
    }

    if (!isValidAction(normalizedAction)) {
      console.warn(`RBAC: Invalid action '${action}' provided`);
      return false;
    }

    // Get permissions for the role
    const rolePermissions = PERMISSIONS_MATRIX[normalizedRole];

    if (!rolePermissions) {
      console.warn(`RBAC: No permissions defined for role '${normalizedRole}'`);
      return false;
    }

    // Get permissions for the specific resource
    const resourcePermissions = rolePermissions[normalizedResource];

    if (!resourcePermissions) {
      console.warn(
        `RBAC: No permissions defined for resource '${normalizedResource}' and role '${normalizedRole}'`,
      );
      return false;
    }

    // Check if the action is allowed
    return resourcePermissions.includes(normalizedAction);
  } catch (error) {
    console.error("RBAC: Error checking permissions:", error);
    return false;
  }
};

/**
 * Check if user has any permission for a resource
 * @param {string} userRole - The role of the user
 * @param {string} resource - The resource being accessed
 * @returns {boolean} - True if user has any permission for the resource
 */
export const hasAnyPermission = (userRole: string, resource: string) => {
  try {
    if (!userRole || !resource) {
      return false;
    }

    const normalizedRole = userRole.toLowerCase().trim();
    const normalizedResource = resource.trim();

    if (!isValidRole(normalizedRole) || !isValidResource(normalizedResource)) {
      return false;
    }

    const rolePermissions = PERMISSIONS_MATRIX[normalizedRole];
    const resourcePermissions = rolePermissions?.[normalizedResource];

    return resourcePermissions && resourcePermissions.length > 0;
  } catch (error) {
    console.error("RBAC: Error checking any permissions:", error);
    return false;
  }
};

/**
 * Get all permissions for a user role and resource
 * @param {string} userRole - The role of the user
 * @param {string} resource - The resource being accessed
 * @returns {string[]} - Array of allowed actions
 */
export const getPermissions = (userRole: string, resource: string) => {
  try {
    if (!userRole || !resource) {
      return [];
    }

    const normalizedRole = userRole.toLowerCase().trim();
    const normalizedResource = resource.trim();

    if (!isValidRole(normalizedRole) || !isValidResource(normalizedResource)) {
      return [];
    }

    const rolePermissions = PERMISSIONS_MATRIX[normalizedRole];
    return rolePermissions?.[normalizedResource] || [];
  } catch (error) {
    return [];
  }
};

/**
 * Get all resources a user has access to
 * @param {string} userRole - The role of the user
 * @returns {string[]} - Array of accessible resources
 */
export const getAccessibleResources = (userRole: string) => {
  try {
    if (!userRole) {
      return [];
    }

    const normalizedRole = userRole.toLowerCase().trim();

    if (!isValidRole(normalizedRole)) {
      return [];
    }

    const rolePermissions = PERMISSIONS_MATRIX[normalizedRole];

    return Object.keys(rolePermissions).filter((resource) => {
      const permissions = rolePermissions[resource];
      return permissions && permissions.length > 0;
    });
  } catch (error) {
    console.error("RBAC: Error getting accessible resources:", error);
    return [];
  }
};

/**
 * Check multiple permissions at once
 * @param {string} userRole - The role of the user
 * @param {Array<{resource: string, action: string}>} permissions - Array of permission objects
 * @returns {boolean} - True if user has all specified permissions
 */
export const hasAllPermissions = (
  userRole: string,
  permissions: Array<{ resource: string; action: string }>,
) => {
  try {
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return false;
    }

    return permissions.every(({ resource, action }) =>
      hasPermission(userRole, resource, action),
    );
  } catch (error) {
    console.error("RBAC: Error checking multiple permissions:", error);
    return false;
  }
};

/**
 * React hook for permission checking
 * @param {string} userRole - The role of the user
 * @returns {Object} - Object with permission checking functions
 */
export const usePermissions = (userRole: string) => {
  return {
    hasPermission: (resource: string, action: string) =>
      hasPermission(userRole, resource, action),
    hasAnyPermission: (resource: string) =>
      hasAnyPermission(userRole, resource),
    getPermissions: (resource: string) => getPermissions(userRole, resource),
    getAccessibleResources: () => getAccessibleResources(userRole),
    hasAllPermissions: (
      permissions: Array<{ resource: string; action: string }>,
    ) => hasAllPermissions(userRole, permissions),
  };
};


/**
 * AUTHORIZATION_ACCESS.REGISTATION
 *
 * This configuration object defines the Role-Based Access Control (RBAC) rules for registration-related actions in the admin portal.
 * Each entry in the ACTIONS array represents a possible menu action or operation that can be shown or performed for a seeker (row).
 *
 * Structure of each action object:
 * - action: The label or identifier for the menu action.
 * - accessors: An array of roles (or a constant containing roles) allowed to see/perform this action.
 * - deciderKeys (optional): Array of objects, each with:
 *     - key: The property name from the seeker/row data to check.
 *     - value: A function that receives the property value (and optionally userRole) and returns true/false to determine eligibility.
 *   All deciderKeys must return true for the action to be available.
 * - permissions (optional): Array of objects, each with:
 *     - action: The resource name (from RESOURCES) to check permission for.
 *     - OPERATIONS: Array of allowed operations (e.g., ['C'] for Create).
 *   All permissions must be satisfied (checked via hasPermission) for the action to be available.
 *
 * This config is used by UI logic (e.g., getOptions) to dynamically determine which menu options to show for each row,
 * based on the current user's role, the seeker's data, and the user's permissions.
 */
export const AUTHORIZATION_ACCESS = {
  REGISTRATION: {
    ACTIONS: [
      // View Details (all roles)
      {
        action: ACTION_LABELS.VIEW_DETAILS,
        accessors: DEFINED_ROLES
      },
      // Available only for seekers whose approval status is 'rejected' and registration status is not 'cancelled'
      {
        action: ACTION_LABELS.CANCEL_REGISTRATION,
        accessors: [ROLES.MAHATRIA, ROLES.SHOBA],
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => ["rejected"].includes(val)
          },
          {
            key: "registrationStatus",
            value: (val:string) => val !== "cancelled"
          },
          {
            key: "allocatedProgramStartsAt",
            value: (val:any) => val ? new Date(val) > new Date() : true
          }
        ],
        permissions: [
          {
            action: RESOURCES.CANCEL_REGISTRATION,
            OPERATIONS: ['C']
          }
        ]
      },
      // Available only for seekers whose registration status is 'completed' and neither rm comments nor seeker experiences exist
      // Combined Add Review and Experience
      {
        action: ACTION_LABELS.ADD_REVIEW_AND_EXPERIENCE,
        accessors: DEFINED_ROLES,
        deciderKeys: [
          {
            key: "registrationStatus",
            value: (val:string) => val !== "cancelled"
          },
          {
            key : "rmComments",
            value: (val:string, userRole:string, row:any) => !val && (!row?.userProgramExperiences || row?.userProgramExperiences?.length === 0)
          }
        ],
        permissions: [
          {
            action: RESOURCES.ADD_REVIEW,
            OPERATIONS: ['C']
          },
          {
            action: RESOURCES.ADD_SEEKER_TAG,
            OPERATIONS: ['C']
          }
        ]
      },
      // Available only for seekers whose registration status is 'completed' and either rm comments or seeker experiences exist
      // Combined Update Review and Experience
      {
        action: ACTION_LABELS.UPDATE_REVIEW_AND_EXPERIENCE,
        accessors: DEFINED_ROLES,
        deciderKeys: [
          {
            key: "registrationStatus",
            value: (val:string) => val !== "cancelled"
          }, 
          {
            key : "rmComments",
            value: (val:string, userRole:string, row:any) => val || (row?.userProgramExperiences && row?.userProgramExperiences?.length > 0)
          }
        ],
        permissions: [
          {
            action: RESOURCES.ADD_REVIEW,
            OPERATIONS: ['C']
          },
          {
            action: RESOURCES.ADD_SEEKER_TAG,
            OPERATIONS: ['C']
          }
        ]
      },
      {
        action:  SWAP_REQUEST_TITLE.SWAP_REQUEST,
        accessors: DEFINED_ROLES,
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => val === "approved"
          },
          {
            key: "isSwapRequestActive",
            value: (val:boolean) => !val
          }
        ],
        permissions : [
          {
            action : RESOURCES.REQ_SWAP_SEEKER,
            OPERATIONS : ['C']
          }
        ]
      },
      {
        action:  SWAP_REQUEST_TITLE.UPDATE_SWAP_REQUEST,
        accessors: DEFINED_ROLES,
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => val === "approved"
          },
          {
            key: "isSwapRequestActive",
            value: (val:boolean) => val
          }
        ],
        permissions : [
          {
            action : RESOURCES.REQ_SWAP_SEEKER,
            OPERATIONS : ['C']
          }
        ]
      },
      {
        action:  SWAP_REQUEST_TITLE.CANCEL_SWAP_REQUEST,
        accessors: DEFINED_ROLES,
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => val === "approved"
          },
          {
            key: "isSwapRequestActive",
            value: (val:boolean) => val
          }
        ],
        permissions : [
          {
            action : RESOURCES.REQ_SWAP_SEEKER,
            OPERATIONS : ['C']
          }
        ]
      },
      // Available only for seekers whose payment status is 'Offline Completed' or 'Online Completed'
      {
        action: ACTION_LABELS.SEND_INVOICE,
        accessors: [ROLES.MAHATRIA, ROLES.SHOBA, ROLES.ADMIN, ROLES.FINANCE_ADMIN, ROLES.RM],
        deciderKeys: [
          {
            key: "paymentStatus",
            value: (val:string) => ["Offline Completed", "Online Completed"].includes(val)
          }
        ],
        permissions: [
          {
            action: RESOURCES.SEND_INVOICE,
            OPERATIONS: ['C']
          }
        ]
      },
      // Available only for seekers whose payment status is 'Offline Completed' or 'Online Completed'
      {
        action: ACTION_LABELS.DOWNLOAD_INVOICE,
        accessors: [ROLES.MAHATRIA, ROLES.SHOBA, ROLES.ADMIN, ROLES.FINANCE_ADMIN, ROLES.RM],
        deciderKeys: [
          {
            key: "paymentStatus",
            value: (val:string) => ["Offline Completed", "Online Completed"].includes(val)
          }
        ],
        permissions: [
          {
            action: RESOURCES.SEND_INVOICE,
            OPERATIONS: ['C']
          }
        ]
      },
      // Available only for seekers whose behaviour is not marked as defaulter
      {
        action: ACTION_TYPE_LABELS.MARK,
        accessors: DEFINED_ROLES,
        deciderKeys: [
          {
            key: "isDefaulter",
            value: (val:boolean) => !val
          }
        ],
        permissions: [
          {
            action: RESOURCES.SEEKER_EXPERIENCE,
            OPERATIONS: ['C']
          }
        ]
      },
      // Available only for seekers whose behaviour is marked as defaulter
      {
        action: ACTION_TYPE_LABELS.UNMARK_DEFAULTER,
        accessors: DEFINED_ROLES,
        deciderKeys: [
          {
            key: "isDefaulter",
            value: (val:boolean) => val
          }, 
          {
            key: "defaulterMarkedByRole",
            value: (val:string, userRole?:string) => (val?.toLowerCase() !== userRole && val?.toLowerCase() !== ROLES.MAHATRIA) || userRole === ROLES.MAHATRIA
          }
        ],
        permissions: [
          {
            action: RESOURCES.SEEKER_EXPERIENCE,
            OPERATIONS: ['U']
          }
        ]
      },
      // Bless
      {
        action: ACTION_LABELS.BLESS,
        accessors: [ROLES.MAHATRIA],
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => ["on_hold", "rejected", "pending"].includes(val)
          },
        ]
      },
      // Bless
      {
        action: ACTION_LABELS.BLESS,
        accessors: [ROLES.SHOBA],
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => ["on_hold", "rejected", "pending"].includes(val) && val!=="cancelled"
          }
        ]
      },
      // Hold
      {
        action: ACTION_LABELS.HOLD,
        accessors: [ROLES.MAHATRIA],
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => ["approved", "on_hold",  "pending"].includes(val)
          }
        ]
      },
      // Hold
      {
        action: ACTION_LABELS.HOLD,
        accessors: [ROLES.SHOBA],
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => ["approved", "on_hold", "pending"].includes(val) && val!=="cancelled"
          }
        ]
      },
      // YTD
      {
        action: ApprovalStatus.YTD,
        accessors: [ROLES.MAHATRIA, ROLES.SHOBA],
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => val === "approved"
          },
          {
            key : "isSwapRequestActive",
            value: (val:boolean) => val
          },
          {
            key : "wantsSwapReqActive",
            value: (val:boolean) => val
          }
        ]
      },
      // Available only for seekers with permissions specified
      {
        action: ACTION_LABELS.DOWNLOAD_PROFORMA_INVOICE,
        accessors: DEFINED_ROLES,
        deciderKeys: [
          {
            key: "proFormaInvoicePdfUrl",
            value: (val:string) => val
          }
        ],
        permissions: [
          {
            action: RESOURCES.DOWNLOAD_PROFORMA,
            OPERATIONS: ['C']
          }
        ]
      },
      // Available only for seekers whose blessed email needs to be resent
      {
        action: RESEND_EMAIL,
        accessors: [ROLES.SHOBA],
        deciderKeys: [
          {
            key: "approvalStatus",
            value: (val:string) => val === "approved"
          }
        ]
      }
    ]
  }
};

// Export default object with all functions
export default {
  ROLES,
  ACTIONS,
  RESOURCES,
  hasPermission,
  hasAnyPermission,
  getPermissions,
  getAccessibleResources,
  hasAllPermissions,
  usePermissions,
};

