import fieldPermissions from '../config/publishedProgramFieldPermissions.json';
import type {
  FieldCondition,
  FieldPermission,
  ProgramFieldPermissions,
  AdditionalContext,
} from '../types/publishedProgramPermissions';

/**
 * Published Program Field Permissions Utility
 * 
 * This utility provides functions to check field-level permissions for published programs.
 * It uses the centralized configuration from publishedProgramFieldPermissions.json
 */

/**
 * Check if a program field is editable when the program is published
 * @param fieldName - Name of the field to check
 * @param section - Section of the program ('programDetails', 'subPrograms', or 'actions')
 * @param additionalContext - Optional context for conditional checks (e.g., date values, current vs original values)
 * @returns boolean - true if field is editable, false if readonly
 */
export const isFieldEditable = (
  fieldName: string,
  section: 'programDetails' | 'subPrograms' | 'actions' = 'programDetails',
  additionalContext?: AdditionalContext
): boolean => {
  const permissions = fieldPermissions as ProgramFieldPermissions;
  const sectionPermissions = permissions[section];

  // Check if field is in editable list
  const editableField = sectionPermissions.editable[fieldName];
  if (editableField) {
    // If there's a condition, evaluate it
    if (editableField.condition && additionalContext) {
      return evaluateCondition(editableField.condition, additionalContext);
    }
    return editableField.allowed;
  }


  // If field is not defined in permissions, default to not editable (safe default)
  return false;
};

/**
 * Evaluate a field condition
 * @param condition - The condition to evaluate
 * @param context - Context needed for evaluation
 * @returns boolean - true if condition passes, false otherwise
 */
const evaluateCondition = (
  condition: FieldCondition,
  context: AdditionalContext
): boolean => {
  switch (condition) {
    case 'notPassed':
      // Field is editable only if the date hasn't passed
      if (context.fieldDate && context.currentDate) {
        return context.fieldDate > context.currentDate;
      }
      return true; // If no dates provided, allow editing

    case 'increaseOnly':
      // Field is editable only if new value is greater than original
      // This validation should happen during form submission
      return true; // Allow editing, validation happens elsewhere

    case 'publishedOnly':
      // Inverse logic - field is readonly only for published programs
      return false;

    default:
      return true;
  }
};

/**
 * Get all editable fields for a section
 * @param section - Section to get editable fields for
 * @returns Array of editable field names
 */
export const getEditableFields = (
  section: 'programDetails' | 'subPrograms' | 'actions' = 'programDetails'
): string[] => {
  const permissions = fieldPermissions as ProgramFieldPermissions;
  return Object.keys(permissions[section].editable);
};

/**
 * Get all readonly fields for a section
 * @param section - Section to get readonly fields for
 * @returns Array of readonly field names
 */
export const getReadonlyFields = (
  section: 'programDetails' | 'subPrograms' | 'actions' = 'programDetails'
): string[] => {
  const permissions = fieldPermissions as ProgramFieldPermissions;
  return Object.keys(permissions[section].readonly);
};

/**
 * Get field permission details
 * @param fieldName - Name of the field
 * @param section - Section of the program
 * @returns FieldPermission object or null if not found
 */
export const getFieldPermission = (
  fieldName: string,
  section: 'programDetails' | 'subPrograms' | 'actions' = 'programDetails'
): FieldPermission | null => {
  const permissions = fieldPermissions as ProgramFieldPermissions;
  const sectionPermissions = permissions[section];

  return (
    sectionPermissions.editable[fieldName] ||
    sectionPermissions.readonly[fieldName] ||
    null
  );
};

/**
 * Check if a field should be disabled based on published status
 * This is the main function to use in components
 * @param fieldName - Name of the field
 * @param isPublished - Whether the program is published
 * @param section - Section of the program
 * @param additionalContext - Optional context for conditional checks
 * @returns boolean - true if field should be disabled
 */
export const shouldDisableField = (
  fieldName: string,
  isPublished: boolean,
  section: 'programDetails' | 'subPrograms' | 'actions' = 'programDetails',
  additionalContext?: AdditionalContext
): boolean => {
  // If program is not published, no fields are disabled
  if (!isPublished) {
    return false;
  }

  // If program is published, check if field is editable
  return !isFieldEditable(fieldName, section, additionalContext);
};

/**
 * Get human-readable description for why a field is disabled
 * @param fieldName - Name of the field
 * @param section - Section of the program
 * @returns string - Description of why field is disabled
 */
export const getFieldDisabledReason = (
  fieldName: string,
  section: 'programDetails' | 'subPrograms' | 'actions' = 'programDetails'
): string => {
  const permission = getFieldPermission(fieldName, section);
  return permission?.description || 'This field cannot be edited after publishing';
};

export default {
  isFieldEditable,
  shouldDisableField,
  getEditableFields,
  getReadonlyFields,
  getFieldPermission,
  getFieldDisabledReason,
};
