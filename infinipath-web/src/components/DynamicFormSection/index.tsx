import React from 'react';
import { useWatch } from 'react-hook-form';
import { DynamicFormSectionProps } from '../../types/dynamicForm';
import { DynamicFieldRenderer } from '../DynamicFieldRenderer';
import { FIELD_TYPES } from '../../constants/textConstants';
import styles from './index.module.scss';

const groupFieldsIntoRows = (fields: any[], watch: (name: string) => any): any[][] => {
  const rows: any[][] = [];
  let currentRow: any[] = [];
  let currentRowWidth = 0;

  const visibleFields = fields.filter((field: any) => {
    if (field.visibleWhenAll) {
      return field.visibleWhenAll.every((cond: any) => cond.values.includes(watch(cond.field)));
    }
    if (!field.visibleWhen) return true;
    return field.visibleWhen.values.includes(watch(field.visibleWhen.field));
  });

  visibleFields.forEach((field: any) => {
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

export const DynamicFormSection: React.FC<DynamicFormSectionProps> = ({
  section,
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
  fieldCallbacks,
}) => {
  // Collect all field names that drive visibility so this component re-renders when they change
  const visibilityFieldNames = React.useMemo(() => {
    const names = new Set<string>();
    if (section.sectionVisibleWhen?.field) names.add(section.sectionVisibleWhen.field);
    (section.fields || []).forEach((f: any) => {
      if (f.visibleWhen?.field) names.add(f.visibleWhen.field);
      if (f.visibleWhenAll) f.visibleWhenAll.forEach((c: any) => names.add(c.field));
    });
    return [...names];
  }, [section]);

  // Subscribe to visibility-driving fields so this component re-renders when they change
  const watchedVisibility = useWatch({ control, name: visibilityFieldNames as any });

  // Stable string key so the effect only fires when actual values change (not on every render)
  const visKey = Array.isArray(watchedVisibility)
    ? (watchedVisibility as any[]).map(String).join('|')
    : String(watchedVisibility);

  // When a visibility-driving field changes, clear the values of fields that become hidden
  // so stale data from hidden controls is not submitted or shown when they re-appear.
  //
  // Guard: if the driver field is still undefined (form not yet initialised / edit data not
  // yet loaded via reset()), skip the clear so we don't wipe pre-filled edit-mode values.
  React.useEffect(() => {
    if (isPublished) return;
    (section.fields || []).forEach((field: any) => {
      let isHidden = false;
      if (field.visibleWhenAll) {
        // Skip if any condition field is still undefined — form hasn't loaded yet
        const allDefined = field.visibleWhenAll.every((cond: any) => watch(cond.field) !== undefined);
        if (!allDefined) return;
        isHidden = !field.visibleWhenAll.every((cond: any) => cond.values.includes(watch(cond.field)));
      } else if (field.visibleWhen) {
        const driverValue = watch(field.visibleWhen.field);
        // Skip if the driver field is still undefined — form hasn't loaded yet
        if (driverValue === undefined) return;
        isHidden = !field.visibleWhen.values.includes(driverValue);
      }
      if (!isHidden) return;

      // Clear the hidden field so stale values don't persist in form state
      if (field.type === FIELD_TYPES.MULTISELECT) {
        setValue(field.name, []);
      } else if ((field.type === FIELD_TYPES.DATERANGE || field.type === FIELD_TYPES.DATETIME) && field.fields?.length) {
        field.fields.forEach((f: string) => setValue(f as any, null));
      } else if (field.type === FIELD_TYPES.DATE) {
        setValue(field.name as any, null);
      } else {
        setValue(field.name as any, '');
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visKey]);

  // Check section-level visibility condition
  if (section.sectionVisibleWhen) {
    const watchedValue = watch(section.sectionVisibleWhen.field);
    if (!section.sectionVisibleWhen.values.includes(watchedValue)) {
      return null;
    }
  }

  const rows = groupFieldsIntoRows(section.fields || [], watch);

  // Don't render an empty section shell when all fields are hidden
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{section.sectionTitle}</h3>
        {section.sectionSubtitle && (
          <p className={styles.sectionSubtitle}>{section.sectionSubtitle}</p>
        )}
      </div>

      <div className={styles.sectionContent}>
        {rows.map((row) => (
          <div key={`row-${row[0]?.name}`} className={styles.fieldRow}>
            {row.map((field, fieldIndex) => (
              <DynamicFieldRenderer
                key={`${field.name}-${fieldIndex}`}
                field={field}
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
                fieldCallbacks={fieldCallbacks}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicFormSection;
