/**
 * Published Program Field Permissions Types
 * 
 * Types and interfaces for managing field-level permissions in published programs
 */

export type FieldCondition = 'notPassed' | 'increaseOnly' | 'publishedOnly';

export type FormFieldValue = string | number | boolean | Date | null | undefined;

export interface AdditionalContext {
  currentValue?: FormFieldValue;
  originalValue?: FormFieldValue;
  currentDate?: Date;
  fieldDate?: Date;
}

export interface FieldPermission {
  allowed: boolean;
  condition?: FieldCondition;
  description: string;
}

export interface ProgramFieldPermissions {
  programDetails: {
    editable: Record<string, FieldPermission>;
    readonly: Record<string, FieldPermission>;
  };
  subPrograms: {
    editable: Record<string, FieldPermission>;
    readonly: Record<string, FieldPermission>;
  };
  actions: {
    editable: Record<string, FieldPermission>;
    readonly: Record<string, FieldPermission>;
  };
}

export interface UsePublishedProgramPermissionsProps {
  isPublished: boolean;
  section?: 'programDetails' | 'subPrograms' | 'actions';
  registrationStartDate?: Date;
  originalSeatLimit?: number;
}
