import React from 'react';
import { Controller, useWatch } from 'react-hook-form';
import DateRangePicker from 'rsuite/DateRangePicker';
import CustomDatePicker from '../../common/components/CustomDatePicker';
import CustomTimePicker from '../../common/components/CustomTimePicker';
import CustomDropDown from '../../common/components/CustomDropDown';
import MuiSelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CreatableSelectField from '../../common/components/CreatableSelectField';
import ImageUploadField from '../../common/components/ImageUploadField';
import styles from './index.module.scss';
import { DynamicFieldRendererProps } from '../../types/dynamicForm';
import { FIELD_TYPES, ADD_PROGRAM_PAGE_TEXT, FORM_FIELD_NAMES } from '../../constants/textConstants';
import { MENU_ITEM_SX, MENU_PAPER_SX, getSelectSx } from '../../constants/muiSxStyles';
import { getNestedError } from '../../utils/validationUtils';
import { THEME } from '../../constants/theme';

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
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
  // Subscribe to the visibleWhen and disabledWhen fields so this component re-renders when they change.
  const visibilityFieldName = field.visibleWhen?.field;
  const disabledWhenFieldName = field.disabledWhen?.field;
  const visibleWhenAllFields = (field as any).visibleWhenAll?.map((c: any) => c.field) ?? [];
  useWatch({ control, name: visibilityFieldName as any, disabled: !visibilityFieldName });
  useWatch({ control, name: disabledWhenFieldName as any, disabled: !disabledWhenFieldName });
  useWatch({ control, name: visibleWhenAllFields as any, disabled: visibleWhenAllFields.length === 0 });

  // Compute disabledWhen condition
  const isDisabledByCondition = field.disabledWhen
    ? field.disabledWhen.values.includes(watch(field.disabledWhen.field))
    : false;

  // Check visibleWhenAll (all conditions must be true)
  if ((field as any).visibleWhenAll) {
    const allMet = (field as any).visibleWhenAll.every((cond: any) => cond.values.includes(watch(cond.field)));
    if (!allMet) return null;
  }

  // Check visibility condition with fallback for undefined values
  if (field.visibleWhen) {
    let watchedValue = watch(field.visibleWhen.field);

    // If value is undefined, try to use parent program's value as fallback
    if (watchedValue === undefined || watchedValue === null) {
      // For sub-program fields (containing 'subPrograms.'), check parent program
      if (field.visibleWhen.field.includes('subPrograms.')) {
        // Extract the field name (e.g., 'modeOfProgram', 'hasSeatLimit')
        const fieldName = field.visibleWhen.field.split('.').pop();
        if (fieldName) {
          watchedValue = watch(fieldName); // Use parent program's value
        }
      }
    }

    if (!field.visibleWhen.values.includes(watchedValue)) {
      return null;
    }
  }

  const getFieldClassName = () => {
    if (field.column === 1) {
      return styles.fieldGroupFull;
    }
    return styles.fieldGroupHalf;
  };

  const renderFieldContent = () => {
    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.EMAIL:
      case FIELD_TYPES.NUMBER: {
        const inputError = getNestedError(errors, field.name);
        const cb = fieldCallbacks?.[field.name];
        // apply code sanitization to programCode and any namespaced .code field (sub-programs/sessions)
        const isCodeField = field.name === FORM_FIELD_NAMES.PROGRAM_CODE || field.name.endsWith(`.${FORM_FIELD_NAMES.SUB_PROGRAM_CODE}`);
        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <div className={field.prefix ? styles.inputWithSymbol : undefined}>
                  <input
                    {...controllerField}
                    type={field.type}
                    placeholder={field.placeholder}
                    className={`${styles.inputField} ${
                      inputError ? styles.inputError : ''
                    }`}
                    disabled={field.disabled || isPublished}
                    min={field.min}
                    max={field.max}
                    maxLength={field.maxLength}
                    pattern={field.pattern}
                    value={field.value || controllerField.value || ''}
                    readOnly={field.disabled}
                    onChange={(e) => {
                      const val = isCodeField
                        ? e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]+/g, '_')
                            .replace(/^_|_$/g, '')
                        : e.target.value;
                      controllerField.onChange(val);
                    }}
                  />
                  {field.prefix && <span className={styles.currencySymbol}>{field.prefix}</span>}
                </div>
              )}
            />
            {cb?.isChecking && (
              <span className={styles.codeChecking}>
                {ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_CHECKING}
              </span>
            )}
            {!cb?.isChecking && cb?.available === true && (
              <span className={styles.codeAvailable}>
                ✓ {ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_AVAILABLE}
              </span>
            )}
            {!cb?.isChecking && cb?.available === false && (
              <span className={styles.codeUnavailable}>
                ✗ {ADD_PROGRAM_PAGE_TEXT.VALIDATION.PROGRAM_CODE_TAKEN}
              </span>
            )}
            {inputError && (
              <span className={styles.errorText}>
                {inputError.message}
              </span>
            )}
          </div>
        );
      }

      case FIELD_TYPES.TEXTAREA: {
        const textareaError = getNestedError(errors, field.name);
        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <textarea
                  {...controllerField}
                  placeholder={field.placeholder}
                  className={`${styles.textareaField} ${
                    textareaError ? styles.inputError : ''
                  }`}
                  disabled={field.disabled || isPublished}
                  rows={4}
                />
              )}
            />
            {textareaError && (
              <span className={styles.errorText}>
                {textareaError.message}
              </span>
            )}
          </div>
        );
      }

      case FIELD_TYPES.RADIO: {
        const radioError = getNestedError(errors, field.name);
        const radioDisabled = field.disabled || isPublished || isDisabledByCondition;
        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.radioGroup}>
              <Controller
                name={field.name}
                control={control}
                render={({ field: controllerField }) => (
                  <>
                    {field.options?.map((option) => (
                      <label key={option.value} className={styles.radioOption}>
                        <input
                          type="radio"
                          name={controllerField.name}
                          value={option.value}
                          checked={controllerField.value === option.value}
                          className={styles.radioInput}
                          disabled={radioDisabled}
                          onChange={() => !radioDisabled && controllerField.onChange(option.value)}
                          onBlur={controllerField.onBlur}
                        />
                        <span className={styles.radioLabel}>{option.label}</span>
                      </label>
                    ))}
                  </>
                )}
              />
            </div>
            {radioError && (
              <span className={styles.errorText}>
                {radioError.message}
              </span>
            )}
          </div>
        );
      }

      case FIELD_TYPES.SELECT: {
        const selectError = getNestedError(errors, field.name);
        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <MuiSelect
                  value={controllerField.value || ''}
                  displayEmpty
                  disabled={field.disabled || isPublished}
                  onChange={(e) => controllerField.onChange(e.target.value)}
                  onBlur={controllerField.onBlur}
                  renderValue={(selected) =>
                    selected
                      ? field.options?.find((o: any) => o.value === selected)?.label || selected
                      : <span style={{ color: THEME.colors.placeholder }}>{field.placeholder || 'Select an option'}</span>
                  }
                  sx={getSelectSx(selectError)}
                  MenuProps={{
                    PaperProps: { sx: MENU_PAPER_SX },
                    MenuListProps: { style: { padding: 0 } },
                  }}
                >
                  {field.options?.map((option: any) => (
                    <MenuItem key={option.value} value={option.value} sx={MENU_ITEM_SX}>
                      {option.label}
                    </MenuItem>
                  ))}
                </MuiSelect>
              )}
            />
            {selectError && (
              <span className={styles.errorText}>
                {selectError.message}
              </span>
            )}
          </div>
        );
      }

      case FIELD_TYPES.MULTISELECT: {
        const multiselectError = getNestedError(errors, field.name);
        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <CustomDropDown
                  value={
                    watch(field.name) && Array.isArray(watch(field.name)) && watch(field.name).length > 0
                      ? venueOptions.find((venue: string) =>
                          watch(field.name)[0]?.toLowerCase().includes(venue.toLowerCase()),
                        ) || ''
                      : ''
                  }
                  onChange={handleVenueChange || (() => {})}
                  options={
                    venueOptions && venueOptions.length > 0
                      ? venueOptions.map((venue: string) => ({
                          value: venue,
                          label: venue.charAt(0).toUpperCase() + venue.slice(1),
                        }))
                      : [{ value: '', label: 'Other' }]
                  }
                  placeholder={field.placeholder}
                  width={340}
                  height={40}
                  error={!!(multiselectError && (!controllerField.value || controllerField.value.length === 0))}
                  className={styles.selectFieldFixed}
                  disabled={field.disabled || isPublished}
                />
              )}
            />
            {multiselectError && (
              <span className={styles.errorText}>
                {multiselectError.message}
              </span>
            )}
          </div>
        );
      }

      case FIELD_TYPES.DATERANGE: {
        const startDateError = field.fields ? getNestedError(errors, field.fields[0]) : null;
        const endDateError = field.fields ? getNestedError(errors, field.fields[1]) : null;

        // Sub-program daterange fields are namespaced (e.g. subPrograms.0.startsAt).
        // For these we read/write via watch/setValue directly so they don't
        // affect the main program's date state.
        const isSubProgramField = field.fields?.some((f) => f.includes('subPrograms.'));

        const getDateRangeValue = (): DateRange | null => {
          if (isSubProgramField && field.fields?.length >= 2) {
            const start = watch(field.fields[0]);
            const end = watch(field.fields[1]);
            if (start && end) return [new Date(start), new Date(end)] as DateRange;
            return null;
          }
          return getProgramDateRangeValue ? getProgramDateRangeValue() : null;
        };

        const handleChange = (value: DateRange | null) => {
          if (isSubProgramField && field.fields?.length >= 2) {
            if (value && value.length === 2) {
              setValue(field.fields[0], value[0]);
              setValue(field.fields[1], value[1]);
              field.fields.forEach((f) => trigger(f));
            }
          } else {
            handleDateRangeChange && handleDateRangeChange(value);
            if (field.fields) field.fields.forEach((f) => trigger(f));
          }
        };

        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <DateRangePicker
              placement="bottomStart"
              value={getDateRangeValue()}
              onOk={handleChange}
              onChange={handleChange}
              disabledDate={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              ranges={[]}
              format="yyyy-MM-dd"
              placeholder="Select date range"
              style={{ width: '100%' }}
              className={startDateError || endDateError ? styles.datePickerError : styles.datePicker}
              disabled={field.disabled || isPublished}
            />
            {(startDateError || endDateError) && (
              <div className={styles.dateErrorRow}>
                {startDateError && (
                  <span className={styles.errorText}>{startDateError.message}</span>
                )}
                {endDateError && (
                  <span className={styles.errorText}>{endDateError.message}</span>
                )}
              </div>
            )}
          </div>
        );
      }

      case FIELD_TYPES.DATETIME: {
        const dateField = field.fields ? field.fields[0] : field.name;
        const timeField = field.fields ? field.fields[1] : `${field.name}Time`;
        const dateError = getNestedError(errors, dateField);
        const timeError = getNestedError(errors, timeField);
        
        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <div className={styles.dateTimeContainer}>
              <div className={styles.dateContainer}>
                <Controller
                  name={dateField}
                  control={control}
                  render={({ field: controllerField }) => (
                    <CustomDatePicker
                      value={controllerField.value}
                      futureDate={true}
                      onChange={(date) => {
                        controllerField.onChange(date);
                        if (field.fields) {
                          field.fields.forEach((f) => trigger(f));
                        }
                      }}
                      startDate={new Date()}
                      borderRight={true}
                      errorExist={!!(dateError || timeError)}
                      disabled={field.disabled || isPublished}
                    />
                  )}
                />
              </div>
              <div className={styles.timeContainer}>
                <Controller
                  name={timeField}
                  control={control}
                  render={({ field: controllerField }) => (
                    <CustomTimePicker
                      value={controllerField.value}
                      onChange={(time: Date | null) => {
                        if (time && !isNaN(time.getTime())) {
                          setValue(timeField, time);
                        }
                        if (field.fields) {
                          field.fields.forEach((f) => trigger(f));
                        }
                      }}
                      noWidthStyle={true}
                      readOnly={field.disabled || isPublished}
                    />
                  )}
                />
              </div>
            </div>
            {(dateError || timeError) && (
              <span className={styles.errorText}>
                {dateError?.message || timeError?.message}
              </span>
            )}
          </div>
        );
      }

      case FIELD_TYPES.DATE: {
        const dateOnlyError = getNestedError(errors, field.name);
        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <CustomDatePicker
                  value={controllerField.value}
                  futureDate={false}
                  onChange={(date) => {
                    controllerField.onChange(date);
                    trigger(field.name);
                  }}
                  startDate={new Date()}
                  borderRight={false}
                  errorExist={!!dateOnlyError}
                  disabled={field.disabled || isPublished}
                />
              )}
            />
            {dateOnlyError && (
              <span className={styles.errorText}>{dateOnlyError.message}</span>
            )}
          </div>
        );
      }

      case FIELD_TYPES.TIME: {
        const timeOnlyError = getNestedError(errors, field.name);
        return (
          <div className={getFieldClassName()}>
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>
            <Controller
              name={field.name}
              control={control}
              render={({ field: controllerField }) => (
                <CustomTimePicker
                  value={controllerField.value}
                  onChange={(time: Date | null) => {
                    if (time && !isNaN(time.getTime())) {
                      setValue(field.name, time);
                    }
                    trigger(field.name);
                  }}
                  noWidthStyle={true}
                  readOnly={field.disabled || isPublished}
                />
              )}
            />
            {timeOnlyError && (
              <span className={styles.errorText}>{timeOnlyError.message}</span>
            )}
          </div>
        );
      }

      case FIELD_TYPES.IMAGE_UPLOAD:
        return (
          <ImageUploadField
            field={field}
            control={control}
            errors={errors}
            getFieldClassName={getFieldClassName}
            isPublished={isPublished}
          />
        );

      case FIELD_TYPES.CREATABLE_SELECT:
        return (
          <CreatableSelectField
            field={field}
            control={control}
            errors={errors}
            getFieldClassName={getFieldClassName}
            isPublished={isPublished}
          />
        );

      default:
        return null;
    }
  };

  const content = renderFieldContent();
  if (!content) return null;
  const dataFieldNames = field.fields
    ? [...field.fields, field.name].join(' ')
    : field.name;
  return React.cloneElement(content, { 'data-field-name': dataFieldNames });
};

export default DynamicFieldRenderer;
