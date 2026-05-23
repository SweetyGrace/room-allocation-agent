import React, { useState, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { DynamicSubProgramCardProps } from '../../types/dynamicForm';
import { FieldConfig } from '../../hooks/useAddProgramFormConfig';
import { DynamicFieldRenderer } from '../DynamicFieldRenderer';
import { DYNAMIC_SUB_PROGRAMS_TEXT, FORM_FIELD_NAMES, MODE_OF_PROGRAM_VALUES, CODE_FORMAT_REGEX } from '../../constants/textConstants';
import { useSubProgramCrossFieldValidation } from '../../hooks/useSubProgramCrossFieldValidation';
import { getCall } from '../../services/apiService';
import { endPoints, PORTAL } from '../../constants/urlConstants';
import styles from './index.module.scss';
import deleteIcon from '../../assets/images/delete-icon.svg';

const groupFieldsIntoRows = (fields: FieldConfig[]): FieldConfig[][] => {
  const rows: FieldConfig[][] = [];
  let currentRow: FieldConfig[] = [];
  let currentRowWidth = 0;

  fields.forEach((field) => {
    const fieldWidth = field.column === 1 ? 1 : 0.5;
    if (currentRowWidth + fieldWidth > 1) {
      if (currentRow.length > 0) rows.push(currentRow);
      currentRow = [field];
      currentRowWidth = fieldWidth;
    } else {
      currentRow.push(field);
      currentRowWidth += fieldWidth;
    }
  });

  if (currentRow.length > 0) rows.push(currentRow);
  return rows;
};

const getNamespacedField = (field: FieldConfig, index: number): FieldConfig => ({
  ...field,
  name: `${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${field.name}`,
  visibleWhen: undefined,
  visibleWhenAll: undefined,
  ...(field.fields && {
    fields: field.fields.map((f) => `${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${f}`),
  }),
});

export const DynamicSubProgramCard: React.FC<DynamicSubProgramCardProps> = ({
  fields,
  index,
  control,
  errors,
  watch,
  setValue,
  trigger,
  venueOptions = [],
  onRemove,
  handleDateRangeChange,
  handleVenueChange,
  getProgramDateRangeValue,
  isPublished = false,
  sessionNumber = 1,
  programTypeName = '',
}) => {
  // Watch ALL sub-program fields to ensure reactivity for any field
  const subProgramValues = useWatch({
    control,
    name: `${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}`,
  });

  const codeValue = subProgramValues?.[FORM_FIELD_NAMES.SUB_PROGRAM_CODE] as string | undefined;
  const subProgramId = subProgramValues?.id as string | undefined;

  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const trimmed = codeValue?.trim().toUpperCase() || '';
    if (!trimmed || !CODE_FORMAT_REGEX.test(trimmed)) {
      setCodeAvailable(null);
      setIsCheckingCode(false);
      return;
    }
    setIsCheckingCode(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const response = await getCall(endPoints.programCodeCheck(trimmed, subProgramId), undefined, PORTAL);
        if (cancelled) return;
        if (response?.data?.data?.isAvailable === false) setCodeAvailable(false);
        else setCodeAvailable(true);
      } catch {
        if (!cancelled) setCodeAvailable(null);
      } finally {
        if (!cancelled) setIsCheckingCode(false);
      }
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [codeValue, subProgramId]);

  useSubProgramCrossFieldValidation({ watch, trigger, index });

  const rows = groupFieldsIntoRows(fields);

  // For visibleWhen conditions, we need to check the field within this sub-program
  // Using watched values to ensure component re-renders when conditions change
  const isFieldVisible = (field: FieldConfig): boolean => {
    // Helper: resolve the sub-program's value for a given field name
    const resolveValue = (fieldName: string): any => {
      if (fieldName === FORM_FIELD_NAMES.MODE_OF_OPERATION) {
        const parentMode = watch(FORM_FIELD_NAMES.MODE_OF_PROGRAM as any);
        // For hybrid parent, each child has its own mode — read it directly
        if (parentMode === MODE_OF_PROGRAM_VALUES.HYBRID) {
          return subProgramValues?.[FORM_FIELD_NAMES.MODE_OF_OPERATION]
            ?? watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${FORM_FIELD_NAMES.MODE_OF_OPERATION}`);
        }
        return parentMode === MODE_OF_PROGRAM_VALUES.ONLINE
          ? MODE_OF_PROGRAM_VALUES.ONLINE
          : MODE_OF_PROGRAM_VALUES.OFFLINE;
      }
      if (fieldName === FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT) {
        return watch(FORM_FIELD_NAMES.HAS_CHECKIN_CHECKOUT as any);
      }
      if (fieldName === FORM_FIELD_NAMES.APPROVAL_REQUIRED) {
        return watch(FORM_FIELD_NAMES.APPROVAL_REQUIRED as any);
      }

      let val = subProgramValues?.[fieldName]
        ?? watch(`${FORM_FIELD_NAMES.SUB_PROGRAMS}.${index}.${fieldName}`);
      if (val === undefined || val === null) {
        const configField = fields.find((f: any) => f.name === fieldName);
        if (configField) {
          if (configField.value !== undefined) val = configField.value;
          else if (configField.options?.length > 0) val = configField.options[0].value;
        }
      }
      return val;
    };

    if (field.visibleWhenAll?.length) {
      return field.visibleWhenAll.every((cond: any) =>
        cond.values.includes(resolveValue(cond.field))
      );
    }

    if (!field.visibleWhen) return true;

    return field.visibleWhen.values.includes(resolveValue(field.visibleWhen.field));
  };

  return (
    <div className={styles.subProgramCard}>
      <div className={styles.cardHeader}>
        <h4 className={styles.sessionTitle}>
          {DYNAMIC_SUB_PROGRAMS_TEXT.LABELS.getLabel(programTypeName)} {sessionNumber}
        </h4>
        {!isPublished && (
          <button
            type="button"
            className={styles.deleteButton}
            onClick={onRemove}
            aria-label={DYNAMIC_SUB_PROGRAMS_TEXT.ARIA.getDeleteAriaLabel(programTypeName)}
          >
            <img src={deleteIcon} alt={DYNAMIC_SUB_PROGRAMS_TEXT.BUTTONS.DELETE} className={styles.deleteIcon} />
          </button>
        )}
      </div>

      <div className={styles.cardContent}>
        {rows.map((row, rowIndex) => {
          const visibleFields = row.filter(field => isFieldVisible(field));
          if (visibleFields.length === 0) return null;

          return (
            <div key={`row-${rowIndex}`} className={styles.fieldRow}>
              {row.map((field, fieldIndex) => {
                const visible = isFieldVisible(field);
                if (!visible) {
                  return null;
                }

                const namespacedField = getNamespacedField(field, index);
                const fieldCbs = field.name === FORM_FIELD_NAMES.SUB_PROGRAM_CODE
                ? { [namespacedField.name]: { isChecking: isCheckingCode, available: codeAvailable } }
                : undefined;
                return (
                  <DynamicFieldRenderer
                    key={`${field.name}-${fieldIndex}`}
                    field={namespacedField}
                    control={control}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    trigger={trigger}
                    venueOptions={venueOptions}
                    handleDateRangeChange={handleDateRangeChange}
                    handleVenueChange={handleVenueChange}
                    getProgramDateRangeValue={getProgramDateRangeValue}
                    isPublished={isPublished}
                    fieldCallbacks={fieldCbs}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DynamicSubProgramCard;
