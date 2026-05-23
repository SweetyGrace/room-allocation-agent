import { useMemo } from 'react';
import type { UsePublishedProgramPermissionsProps, AdditionalContext } from '../types/publishedProgramPermissions';
import {
  shouldDisableField,
  isFieldEditable,
  getFieldDisabledReason,
  getEditableFields,
  getReadonlyFields,
} from '../utils/publishedProgramPermissions';

/**
 * Custom hook for managing published program field permissions
 * 
 * Usage example:
 * ```tsx
 * const { isDisabled, canEdit, disabledReason } = usePublishedProgramPermissions({
 *   isPublished: true,
 *   section: 'programDetails'
 * });
 * 
 * <input 
 *   disabled={isDisabled('programName')} 
 *   title={disabledReason('programName')}
 * />
 * ```
 */

export const usePublishedProgramPermissions = ({
  isPublished,
  section = 'programDetails',
  registrationStartDate,
  originalSeatLimit,
}: UsePublishedProgramPermissionsProps) => {
  const currentDate = useMemo(() => new Date(), []);

  /**
   * Check if a field should be disabled
   */
  const isDisabled = (
    fieldName: string,
    additionalContext?: Omit<AdditionalContext, 'currentDate'>
  ): boolean => {
    return shouldDisableField(fieldName, isPublished, section, {
      currentDate,
      ...additionalContext,
    });
  };

  /**
   * Check if a field can be edited
   */
  const canEdit = (
    fieldName: string,
    additionalContext?: Omit<AdditionalContext, 'currentDate'>
  ): boolean => {
    if (!isPublished) return true;
    
    return isFieldEditable(fieldName, section, {
      currentDate,
      ...additionalContext,
    });
  };

  /**
   * Get the reason why a field is disabled
   */
  const disabledReason = (fieldName: string): string => {
    return getFieldDisabledReason(fieldName, section);
  };

  /**
   * Check if registration start date/time should be disabled
   */
  const isRegistrationStartDisabled = useMemo(() => {
    if (!isPublished) return false;
    
    return !isFieldEditable('registrationStartDate', section, {
      fieldDate: registrationStartDate,
      currentDate,
    });
  }, [isPublished, registrationStartDate, currentDate, section]);

  /**
   * Check if seat limit should be disabled
   * (Can only be increased, not decreased)
   */
  const isSeatLimitDisabled = (): boolean => {
    if (!isPublished) return false;
    
    // Seat limit field itself is not disabled, but we validate on change
    // that it can only increase
    return false;
  };

  /**
   * Validate seat limit increase only
   */
  const validateSeatLimitIncrease = (newValue: number): boolean => {
    if (!isPublished) return true;
    
    if (originalSeatLimit !== undefined && newValue < originalSeatLimit) {
      return false;
    }
    
    return true;
  };

  /**
   * Get all editable field names for current section
   */
  const editableFields = useMemo(() => {
    return getEditableFields(section);
  }, [section]);

  /**
   * Get all readonly field names for current section
   */
  const readonlyFields = useMemo(() => {
    return getReadonlyFields(section);
  }, [section]);

  return {
    isDisabled,
    canEdit,
    disabledReason,
    isRegistrationStartDisabled,
    isSeatLimitDisabled,
    validateSeatLimitIncrease,
    editableFields,
    readonlyFields,
  };
};

export default usePublishedProgramPermissions;
