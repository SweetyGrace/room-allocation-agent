import React, { useState, useEffect } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import { DynamicSubProgramsSectionProps } from '../../types/dynamicForm';
import { DynamicSubProgramCard } from '../DynamicSubProgramCard';
import {
  DYNAMIC_SUB_PROGRAMS_TEXT,
  FIELD_TYPES,
  FORM_FIELD_NAMES,
  MODE_OF_PROGRAM_VALUES,
  YES_NO_VALUES,
  PROGRAM_TYPE_NAMES,
  ONLINE_DETAIL_FIELDS,
  VENUE_FIELDS,
  ALL_PREFILL_PARENT_FIELDS,
} from '../../constants/textConstants';
import styles from './index.module.scss';
import { Button } from '../../common/components/Button';
import { Add } from '@mui/icons-material';

export const DynamicSubProgramsSection: React.FC<DynamicSubProgramsSectionProps> = ({
  subProgramFields,
  control,
  errors,
  watch,
  setValue,
  trigger,
  venueOptions = [],
  handleDateRangeChange,
  handleVenueChange,
  getProgramDateRangeValue,
  isPublished = false,
  programTypeName = '',
  noOfItems = 0,
  modeOfProgram = '',
}) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: FORM_FIELD_NAMES.SUB_PROGRAMS,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  
  // Watch main program code to auto-generate sub-program codes
  const mainProgramCode = watch(FORM_FIELD_NAMES.PROGRAM_CODE);

  // Subscribe to parent prefillFrom field values so this component re-renders when they change
  const prefillParentValues = useWatch({ control, name: ALL_PREFILL_PARENT_FIELDS as any });
  const prefillValKey = Array.isArray(prefillParentValues)
    ? (prefillParentValues as any[]).map(v => (v === undefined || v === null ? '' : String(v))).join('|')
    : String(prefillParentValues ?? '');

  // Watch main program fees for prefilling
  const mainHdbFee = watch(FORM_FIELD_NAMES.HDB_FEE);
  const mainMsdFee = watch(FORM_FIELD_NAMES.MSD_FEE);
  // Watch main program seat and waitlist settings
  const mainHasSeatLimit = watch(FORM_FIELD_NAMES.HAS_SEAT_LIMIT);
  const mainHasWaitlist = watch(FORM_FIELD_NAMES.HAS_WAITLIST);
  const mainWaitlistTriggerCount = watch(FORM_FIELD_NAMES.WAITLIST_TRIGGER_COUNT);
  const mainSeatLimit = watch(FORM_FIELD_NAMES.SEAT_LIMIT);
  const mainHasCheckinCheckout = watch(FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT as any);

  // Sync sub-program codes when main program code changes
  useEffect(() => {
    if (!mainProgramCode || fields.length === 0) return;
    fields.forEach((_field, index) => {
      const expectedCode = `${mainProgramCode}_S${index + 1}`;
      const currentCode = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.code`);
      if (!currentCode || currentCode !== expectedCode) {
        setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.code`, expectedCode);
      }
    });
  }, [mainProgramCode, fields.length]);

  // Effect to sync hasSeatLimit from main program to all sub-programs
  useEffect(() => {
    if (mainHasSeatLimit !== undefined && fields.length > 0) {
      fields.forEach((_field, index) => {
        const currentSeatLimit = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.HAS_SEAT_LIMIT}`);
        // Only update if the seat limit is different to avoid infinite loops
        if (currentSeatLimit !== mainHasSeatLimit) {
          setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.HAS_SEAT_LIMIT}`, mainHasSeatLimit);
        }
      });
    }
  }, [mainHasSeatLimit, fields.length, watch, setValue]);

  // Effect to sync seatLimit value from main program to all sub-programs
  useEffect(() => {
    if (mainSeatLimit && fields.length > 0) {
      fields.forEach((_field, index) => {
        const currentSeatLimit = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.SEAT_LIMIT}`);
        // Only update if the seat limit is different to avoid infinite loops
        if (currentSeatLimit !== mainSeatLimit) {
          setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.SEAT_LIMIT}`, mainSeatLimit);
        }
      });
    }
  }, [mainSeatLimit, fields.length, watch, setValue]);

  // Effect to sync hasWaitlist from main program to all sub-programs
  useEffect(() => {
    if (mainHasWaitlist !== undefined && fields.length > 0) {
      fields.forEach((_field, index) => {
        const currentHasWaitlist = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.HAS_WAITLIST}`);
        // Only update if the waitlist setting is different to avoid infinite loops
        if (currentHasWaitlist !== mainHasWaitlist) {
          setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.HAS_WAITLIST}`, mainHasWaitlist);
        }
      });
    }
  }, [mainHasWaitlist, fields.length, watch, setValue]);

  // Effect to sync waitlistTriggerCount from main program to all sub-programs
  useEffect(() => {
    if (mainWaitlistTriggerCount && fields.length > 0) {
      fields.forEach((_field, index) => {
        const currentTriggerCount = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.WAITLIST_TRIGGER_COUNT}`);
        // Only update if the trigger count is different to avoid infinite loops
        if (currentTriggerCount !== mainWaitlistTriggerCount) {
          setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.WAITLIST_TRIGGER_COUNT}`, mainWaitlistTriggerCount);
        }
      });
    }
  }, [mainWaitlistTriggerCount, fields.length, watch, setValue]);

  // Sync hasCheckinCheckout from parent so Yup sub-program schema can evaluate checkin/checkout visibility
  useEffect(() => {
    if (mainHasCheckinCheckout === undefined || fields.length === 0) return;
    fields.forEach((_field, index) => {
      const current = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT}` as any);
      if (current !== mainHasCheckinCheckout) {
        setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT}` as any, mainHasCheckinCheckout);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainHasCheckinCheckout, fields.length]);

  // Effect to handle sessionType changes and prefill prices dynamically
  useEffect(() => {
    if (fields.length > 0) {
      fields.forEach((_field, index) => {
        const sessionType = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.sessionType`);
        
        // Find the sessionPrice field config to get dynamic prefill mapping
        const priceField = subProgramFields.find(f => f.name === FORM_FIELD_NAMES.SESSION_PRICE);
        
        if (priceField?.dynamicPrefill && sessionType) {
          const mapping = priceField.dynamicPrefill.mapping;
          const sourceFieldName = mapping[sessionType];
          
          if (sourceFieldName) {
            const sourceValue = watch(sourceFieldName);
            if (sourceValue) {
              const currentPrice = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.SESSION_PRICE}`);
              // Only set if field is empty or different to avoid infinite loops
              if (!currentPrice || currentPrice !== sourceValue) {
                setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.SESSION_PRICE}`, sourceValue);
              }
            }
          }
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length, mainHdbFee, mainMsdFee]);

  // Sync parent modeOfProgram → all child modeOfOperation fields.
  // Skipped for hybrid — each child picks its own mode independently.
  useEffect(() => {
    if (!modeOfProgram || fields.length === 0) return;
    if (modeOfProgram === MODE_OF_PROGRAM_VALUES.HYBRID) return;
    const targetMode = modeOfProgram === MODE_OF_PROGRAM_VALUES.ONLINE
      ? MODE_OF_PROGRAM_VALUES.ONLINE
      : MODE_OF_PROGRAM_VALUES.OFFLINE;
    fields.forEach((_field, index) => {
      const current = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.MODE_OF_OPERATION}`);
      if (current !== targetMode) {
        setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.MODE_OF_OPERATION}`, targetMode);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modeOfProgram, fields.length]);

  // Reactive prefill: when a parent prefillFrom field gets a value, fill any session field
  // that is still empty. Skips sessions loaded from the API (they have an `id`) so their
  // saved values are never overwritten.
  // For hybrid parent, mode-specific fields (venue, online details) are skipped — each child
  // manages those independently based on its own modeOfOperation selection.
  useEffect(() => {
    if (fields.length === 0 || subProgramFields.length === 0) return;
    const prefillableFields = subProgramFields.filter((f: any) => f.prefillFrom);
    if (prefillableFields.length === 0) return;
    const isHybridParent = modeOfProgram === MODE_OF_PROGRAM_VALUES.HYBRID;

    fields.forEach((_field, index) => {
      // API-loaded sessions have an id — their saved values must not be touched
      const currentSubProg = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}` as any);
      if (currentSubProg?.id) return;

      prefillableFields.forEach((fieldConfig: any) => {
        // For hybrid parent, skip any field whose visibility depends on modeOfOperation
        if (isHybridParent) {
          const isModeSpecific = fieldConfig.visibleWhen?.field === FORM_FIELD_NAMES.MODE_OF_OPERATION
            || fieldConfig.visibleWhenAll?.some((c: any) => c.field === FORM_FIELD_NAMES.MODE_OF_OPERATION);
          if (isModeSpecific) return;
        }
        const parentVal = watch(fieldConfig.prefillFrom as any);
        if (parentVal === undefined || parentVal === null || parentVal === '') return;
        const childKey = `${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${fieldConfig.name}` as any;
        const currentVal = watch(childKey);
        if (currentVal === undefined || currentVal === null || currentVal === '') {
          setValue(childKey, parentVal);
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillValKey, fields.length]);

  // When "same online link for all" is yes, sync parent online detail fields to all children.
  // For hybrid parent, only sync to children whose own modeOfOperation is online.
  const sameOnlineDetailsForAll = watch(FORM_FIELD_NAMES.SAME_ONLINE_DETAILS_FOR_ALL as any);
  useEffect(() => {
    if (sameOnlineDetailsForAll !== YES_NO_VALUES.YES || fields.length === 0) return;
    const isHybridParent = modeOfProgram === MODE_OF_PROGRAM_VALUES.HYBRID;
    fields.forEach((_field, index) => {
      if (isHybridParent) {
        const childMode = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.MODE_OF_OPERATION}` as any);
        if (childMode !== MODE_OF_PROGRAM_VALUES.ONLINE) return;
      }
      ONLINE_DETAIL_FIELDS.forEach((fieldName) => {
        const parentVal = watch(fieldName as any);
        if (parentVal !== undefined && parentVal !== null) {
          setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${fieldName}`, parentVal);
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sameOnlineDetailsForAll, ...ONLINE_DETAIL_FIELDS.map((f) => watch(f as any)), fields.length]);

  // When "same venue for all" is yes, sync parent venue fields to all children.
  // For hybrid parent, only sync to children whose own modeOfOperation is offline.
  const sameVenueForAll = watch(FORM_FIELD_NAMES.SAME_VENUE_FOR_ALL as any);
  useEffect(() => {
    if (sameVenueForAll !== YES_NO_VALUES.YES || fields.length === 0) return;
    const isHybridParent = modeOfProgram === MODE_OF_PROGRAM_VALUES.HYBRID;
    fields.forEach((_field, index) => {
      if (isHybridParent) {
        const childMode = watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.MODE_OF_OPERATION}` as any);
        if (childMode !== MODE_OF_PROGRAM_VALUES.OFFLINE) return;
      }
      VENUE_FIELDS.forEach((fieldName) => {
        const parentVal = watch(fieldName as any);
        if (parentVal !== undefined && parentVal !== null && parentVal !== '') {
          setValue(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${fieldName}`, parentVal);
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sameVenueForAll, ...VENUE_FIELDS.map((f) => watch(f as any)), fields.length]);

  // Auto-generate entries only when noOfItems is first entered and no sessions exist yet.
  // Never replaces existing sessions — data preservation is the priority.
  useEffect(() => {
    if (!noOfItems || noOfItems <= 0 || subProgramFields.length === 0) return;
    // Only generate when there are no sessions at all (first-time entry).
    // Any change to noOfItems after sessions exist is handled manually via add/remove.
    if (fields.length > 0) return;

    const isSession = programTypeName === PROGRAM_TYPE_NAMES.CUSTOM_SESSION;
    const isHybridParent = modeOfProgram === MODE_OF_PROGRAM_VALUES.HYBRID;
    const defaultMode = isHybridParent
      ? null
      : modeOfProgram === MODE_OF_PROGRAM_VALUES.ONLINE
        ? MODE_OF_PROGRAM_VALUES.ONLINE
        : MODE_OF_PROGRAM_VALUES.OFFLINE;

    const buildItem = (itemIndex: number): any => {
      const item: any = {};
      subProgramFields.forEach((fieldConfig) => {
        if (fieldConfig.dynamicPrefill) {
          item[fieldConfig.name] = '';
        } else if (fieldConfig.prefillFrom) {
          // For hybrid parent, skip prefilling mode-specific fields — child sets them independently
          const isModeSpecific = fieldConfig.visibleWhen?.field === FORM_FIELD_NAMES.MODE_OF_OPERATION
            || fieldConfig.visibleWhenAll?.some((c: any) => c.field === FORM_FIELD_NAMES.MODE_OF_OPERATION);
          if (isHybridParent && isModeSpecific) {
            item[fieldConfig.name] = '';
          } else {
            const prefillValue = watch(fieldConfig.prefillFrom);
            item[fieldConfig.name] = prefillValue !== undefined ? prefillValue : '';
          }
        } else if (fieldConfig.value !== undefined) {
          item[fieldConfig.name] = fieldConfig.value;
        } else if (fieldConfig.type === FIELD_TYPES.RADIO && fieldConfig.options?.length > 0) {
          const defaultOpt = fieldConfig.options.find((o: any) => o.value === fieldConfig.value) || fieldConfig.options[0];
          item[fieldConfig.name] = defaultOpt.value;
        } else if (fieldConfig.type === FIELD_TYPES.MULTISELECT) {
          item[fieldConfig.name] = [];
        } else if (fieldConfig.type === FIELD_TYPES.NUMBER) {
          item[fieldConfig.name] = fieldConfig.min || 0;
        } else if (fieldConfig.type === FIELD_TYPES.DATETIME || fieldConfig.type === FIELD_TYPES.DATERANGE) {
          item[fieldConfig.name] = null;
        } else {
          item[fieldConfig.name] = '';
        }
      });
      if (defaultMode !== null) {
        item[FORM_FIELD_NAMES.MODE_OF_OPERATION] = defaultMode;
      } else {
        // Hybrid: clear the config default ('offline') so child starts with no mode pre-selected
        item[FORM_FIELD_NAMES.MODE_OF_OPERATION] = '';
      }
      if (mainHasCheckinCheckout !== undefined) {
        item[FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT] = mainHasCheckinCheckout;
      }
      // Prefill online details only when parent mode is strictly online (not hybrid)
      if (!isHybridParent && defaultMode === MODE_OF_PROGRAM_VALUES.ONLINE) {
        ONLINE_DETAIL_FIELDS.forEach((onlineFieldName) => {
          const val = watch(onlineFieldName as any);
          if (val !== undefined && val !== null && val !== '') {
            item[onlineFieldName] = val;
          }
        });
      }
      item.name = `${DYNAMIC_SUB_PROGRAMS_TEXT.LABELS.getLabel(programTypeName)} ${itemIndex + 1}`;
      if (isSession) {
        item.displayOrder = itemIndex + 1;
        item.limitedSeats = YES_NO_VALUES.NO;
        item.waitlistApplicable = YES_NO_VALUES.NO;
      } else {
        item.groupDisplayOrder = itemIndex + 1;
        item.hasSeatLimit = YES_NO_VALUES.NO;
        item.waitlistApplicable = YES_NO_VALUES.NO;
      }
      return item;
    };

    replace(Array.from({ length: noOfItems }, (_value, itemIndex) => buildItem(itemIndex)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noOfItems, programTypeName]);

  const handleAddSubProgram = () => {
    const newSubProgram: any = {};
    const parentMode = watch(FORM_FIELD_NAMES.MODE_OF_PROGRAM);
    const parentCurrency = watch(FORM_FIELD_NAMES.CURRENCY);
    const isHybridParent = parentMode === MODE_OF_PROGRAM_VALUES.HYBRID;

    subProgramFields.forEach((field) => {
      if (field.dynamicPrefill) {
        newSubProgram[field.name] = '';
        return;
      }

      if (field.value) {
        // Use the default value from config
        newSubProgram[field.name] = field.value;
      } else if (field.type === FIELD_TYPES.RADIO && field.options && field.options.length > 0) {
        // For radio buttons, use first option or the one marked with value
        const defaultOption = field.options.find((opt: any) => opt.value === field.value) || field.options[0];
        newSubProgram[field.name] = defaultOption.value;
      } else if (field.type === FIELD_TYPES.MULTISELECT) {
        newSubProgram[field.name] = [];
      } else if (field.type === FIELD_TYPES.NUMBER) {
        newSubProgram[field.name] = field.min || 0;
      } else if (field.type === FIELD_TYPES.DATETIME || field.type === FIELD_TYPES.DATERANGE) {
        newSubProgram[field.name] = null;
      } else if (field.name === FORM_FIELD_NAMES.SUB_PROGRAM_CODE) {
        newSubProgram[field.name] = mainProgramCode
          ? `${mainProgramCode}_S${fields.length + 1}`
          : '';
      } else {
        newSubProgram[field.name] = '';
      }

      // Handle prefillFrom — skip mode-specific fields when parent is hybrid
      if (field.prefillFrom) {
        const isModeSpecific = field.visibleWhen?.field === FORM_FIELD_NAMES.MODE_OF_OPERATION
          || field.visibleWhenAll?.some((c: any) => c.field === FORM_FIELD_NAMES.MODE_OF_OPERATION);
        if (!(isHybridParent && isModeSpecific)) {
          const prefillValue = watch(field.prefillFrom);
          if (prefillValue) {
            newSubProgram[field.name] = prefillValue;
          }
        }
      }
    });

    // Lock child mode to parent only when parent is strictly online or offline;
    // for hybrid, clear the config default ('offline') so child starts with no mode pre-selected
    if (!isHybridParent && parentMode) {
      newSubProgram[FORM_FIELD_NAMES.MODE_OF_OPERATION] = parentMode;
    } else if (isHybridParent) {
      newSubProgram[FORM_FIELD_NAMES.MODE_OF_OPERATION] = '';
    }
    if (parentCurrency) {
      newSubProgram[FORM_FIELD_NAMES.CURRENCY] = parentCurrency;
    }

    if (mainHasCheckinCheckout !== undefined) {
      newSubProgram[FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT] = mainHasCheckinCheckout;
    }

    // Prefill online details only when parent mode is strictly online (not hybrid)
    if (!isHybridParent && parentMode === MODE_OF_PROGRAM_VALUES.ONLINE) {
      ONLINE_DETAIL_FIELDS.forEach((fieldName) => {
        const val = watch(fieldName as any);
        if (val !== undefined && val !== null && val !== '') {
          newSubProgram[fieldName] = val;
        }
      });
    }

    append(newSubProgram);
  };

  const handleRemoveSubProgram = (index: number) => {
    if (isPublished) return;
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
    }
    setDeleteDialogOpen(false);
  };

  if (subProgramFields.length === 0) {
    return null;
  }

  return (
    <div className={styles.subProgramsSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>
            {DYNAMIC_SUB_PROGRAMS_TEXT.SECTION.getTitleByType(programTypeName)}
          </h3>
          <p className={styles.sectionSubtitle}>
            {DYNAMIC_SUB_PROGRAMS_TEXT.SECTION.getSubtitleByType(programTypeName)}
          </p>
        </div>
        {!isPublished && (
          <button
            type="button"
            className={styles.addButton}
            onClick={handleAddSubProgram}
          >
            <Add className={styles.addIcon} />
            {DYNAMIC_SUB_PROGRAMS_TEXT.BUTTONS.getAddButtonText(programTypeName)}
          </button>
        )}
      </div>

      <div className={styles.subProgramsList}>
        {fields.length === 0 && (
          <div className={styles.emptyState}>
            <p>{DYNAMIC_SUB_PROGRAMS_TEXT.EMPTY_STATE.getMessageByType(programTypeName)}</p>
          </div>
        )}
        
        {fields.map((field, index) => (
          <DynamicSubProgramCard
            key={field.id}
            fields={subProgramFields}
            index={index}
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            trigger={trigger}
            venueOptions={venueOptions}
            onRemove={() => handleRemoveSubProgram(index)}
            handleDateRangeChange={handleDateRangeChange}
            handleVenueChange={handleVenueChange}
            getProgramDateRangeValue={getProgramDateRangeValue}
            isPublished={isPublished}
            sessionNumber={index + 1}
            programTypeName={programTypeName}
          />
        ))}
      </div>

      {/* Simple delete confirmation dialog */}
      {deleteDialogOpen && (
        <div className={styles.dialogOverlay} onClick={() => setDeleteDialogOpen(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3>{DYNAMIC_SUB_PROGRAMS_TEXT.DIALOG.getDeleteTitle(programTypeName)}</h3>
            <p>{DYNAMIC_SUB_PROGRAMS_TEXT.DIALOG.getDeleteMessage(programTypeName)}</p>
            <div className={styles.dialogActions}>
              <Button
                onClick={() => setDeleteDialogOpen(false)}
                buttonClassName={styles.cancelButton}
              >
                {DYNAMIC_SUB_PROGRAMS_TEXT.BUTTONS.CANCEL}
              </Button>
              <Button
                onClick={confirmDelete}
                buttonClassName={styles.deleteButtonDialog}
              >
                {DYNAMIC_SUB_PROGRAMS_TEXT.BUTTONS.DELETE}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicSubProgramsSection;
