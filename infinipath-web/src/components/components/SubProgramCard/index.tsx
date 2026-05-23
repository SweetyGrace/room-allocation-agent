import React from "react";
import { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import DateRangePicker from "rsuite/DateRangePicker";
import { DateRange } from "rsuite/esm/DateRangePicker";
import styles from "./index.module.scss";
import deleteIcon from "../../../assets/images/delete-icon.svg";
import { Controller } from "react-hook-form";
import { getCurrencySymbol } from "../../../utils/programUtils";
import { handleAWSFileUpload } from "../../../utils/commonFunctions";
import CustomTimePicker from "../../../common/components/CustomTimePicker";
import CustomDropDown from "../../../common/components/CustomDropDown";
import CustomVenueModal from "../../../common/components/CustomVenueModal"; // Adjust path if needed
import { validateFileTypeAndSize } from "../../../utils/fileUploadValidation";
import CustomDatePicker from "../../../common/components/CustomDatePicker";
import { checkToDisable } from "../../../utils/checkToDisable";
import { shouldDisableField } from "../../../utils/publishedProgramPermissions";
import { FORM_FIELD_NAMES } from "../../../constants/textConstants";
import {
  SUB_PROGRAM_TEXT,
  DEFAULT_VALUES,
  COMMON_PLACEHOLDERS,
  UI_DIMENSIONS,
  CURRENCY_SYMBOLS,
  PROGRAM_DETAILS_FORM_TEXT,
} from "../../../constants/textConstants";

// Helper: returns the full field path for a sub-program field, e.g. "subPrograms.2.programEndDate"
const spField = (index: number, field: keyof typeof FORM_FIELD_NAMES) =>
  `subPrograms.${index}.${FORM_FIELD_NAMES[field]}` as const;

interface SubProgram {
  id: string;
  title: string;
  banner?: File | null;
  description: string;
  startDate?: Date | null;
  endDate?: Date | null;
  modeOfProgram: "online" | "offline" | "hybrid";
  venueAddress: string[];
  customVenue: string;
  isTravelRequired?: "yes" | "no";
  isResidential?: "yes" | "no";
  isPaymentRequired: "yes" | "no";
  currency: string;
  programFee: string;
  isHighlighted?: boolean;
  highlightPhase?: "fade-in" | "visible" | "fade-out";
  bannerImageUrl?: string; // Added this to the interface
  showCustomVenue?: boolean;
}

interface SubProgramCardProps {
  subProgram: SubProgram;
  index: number;
  control: any;
  watch: any;
  errors: any;
  trigger: (name?: string | string[]) => Promise<boolean>;
  setValue: (name: string, value: any) => void;
  onSubProgramChange: (
    subProgramId: string,
    field: keyof SubProgram,
    value: any,
  ) => void;
  onSubProgramVenueChange: (subProgramId: string, venues: string[]) => void;
  // Updated to accept URL string instead of File
  onSubProgramBannerUpload: (subProgramIndex: string, imageUrl: string) => void;
  bannerImageUrl: string | null;
  onDeleteSubProgram: (subProgramId: string) => void;
  onRemove: () => void; // Added missing onRemove prop
  currencyOptions: Array<{ value: string; label: string; symbol: string }>;
  venueOptions: string[];
  isDateWithinProgramRange: (date: Date) => boolean;
  dateRange: [Date | null, Date | null];
  setDateRange: (dateRange: [Date | null, Date | null]) => void;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  programTypeNameFromSource: string; // Optional prop to get program type name from source
  fieldlength: number; // Optional prop to get the field length
  isPublished?: boolean; // Indicates if program is published
  prevSubProgramEndDate?: Date | null; // End date of previous sub-program for sequential date constraint
  prevSubProgramEndTime?: Date | null; // End time of previous sub-program for same-day time constraint
}

const SubProgramCard = ({
  subProgram,
  index,
  control,
  watch,
  errors,
  setValue,
  onRemove,
  onSubProgramChange,
  onSubProgramVenueChange,
  onSubProgramBannerUpload,
  bannerImageUrl,
  onDeleteSubProgram,
  currencyOptions,
  venueOptions,
  isDateWithinProgramRange,
  dateRange,
  setDateRange,
  onDateChange,
  trigger,
  programTypeNameFromSource,
  fieldlength,
  isPublished = false,
  prevSubProgramEndDate = null,
  prevSubProgramEndTime = null,
}: SubProgramCardProps) => {
  const formValues = watch(`subPrograms.${index}`);
  const modeOfProgram = watch(`subPrograms.${index}.modeOfProgram`);
  const isPaymentRequired = watch(`subPrograms.${index}.isPaymentRequired`);

  const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
    !!(a && b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate());


  const handleDateChange = (range: [Date | null, Date | null] | null) => {
    if (range && range.length === 2) {
      const [startDate, endDate] = range;

      // Update form values
      setValue(`subPrograms.${index}.startDate`, startDate);
      setValue(`subPrograms.${index}.endDate`, endDate);

      // Update local state if needed
      setDateRange && setDateRange([startDate, endDate]);

      // Call parent handler if provided
      onDateChange && onDateChange(startDate, endDate);
    }
  };

  // Use form state value first, then fallback to prop
  // const displayBannerUrl = formBannerImageUrl || bannerImageUrl;

  const [isCustomVenueModalOpen, setCustomVenueModalOpen] =
    React.useState(false);

  const handleAddCustomVenue = (venue: string) => {
    setValue(`subPrograms.${index}.venueAddress`, [venue]);
    setCustomVenueModalOpen(false);
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className={styles.formContainer}>
          <div className={styles.formContent}>
            <div className={styles.subProgramHeader}>
              <p>{formValues?.title}</p>
              {fieldlength > 1 && (
                <img
                  src={deleteIcon}
                  alt="delete"
                  onClick={onRemove}
                  className={styles.subSessionDeleteIcon}
                />
              )}
            </div>
            {/* Title Field */}
            <Controller
              name={`subPrograms.${index}.title`}
              control={control}
              render={({ field }) => (
                <div className={styles.formSection}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      {SUB_PROGRAM_TEXT.TITLES.WHAT_IS_CALLED}
                    </label>
                    <input
                      {...field}
                      type="text"
                      className={`${styles.inputField} ${errors?.title ? styles.inputError : ""}`}
                      placeholder={COMMON_PLACEHOLDERS.ENTER_SUB_PROGRAM_NAME}
                      style={{ width: UI_DIMENSIONS.WIDTH.INPUT_LARGE }}
                      disabled={shouldDisableField('title', isPublished, 'subPrograms')}
                    />
                    {errors?.title && (
                      <span className={styles.errorText}>
                        {errors.title.message}
                      </span>
                    )}
                  </div>
                </div>
              )}
            />
       
            {/* Description */}
            <Controller
              name={`subPrograms.${index}.description`}
              control={control}
              render={({ field }) => (
                <div className={styles.formSection}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      {SUB_PROGRAM_TEXT.TITLES.ADD_DESCRIPTION}
                    </label>
                    <textarea
                      {...field}
                      className={styles.textareaField}
                      rows={4}
                      placeholder={COMMON_PLACEHOLDERS.WHAT_IS_SUB_PROGRAM_ABOUT}
                      disabled={shouldDisableField('description', isPublished, 'subPrograms')}
                    />
                  </div>
                </div>
              )}
            />
            <div className={styles.formSection}>
              <div className={styles.ProgramDiv} data-testid="register-div">
                <div
                  className={styles.programInputContainer}
                  data-testid="register-date-div"
                >
                  <p
                    className={styles.labelText}
                    data-testid="label-text-start-date"
                  >
                    {SUB_PROGRAM_TEXT.TITLES.PROGRAM_START_DATE_TIME}
                  </p>
                  <div
                    className={styles.containerDateTime}
                    data-testid="program-start-date-time-inputs"
                  >
                    <div
                      className={styles.containerDate}
                      data-testid="form-fields-registrations"
                    >
                      <Controller
                        name={spField(index, 'PROGRAM_START_DATE')}
                        control={control}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value}
                            futureDate={false}
                            maxDate={watch("endDate") || null}
                            minDate={prevSubProgramEndDate || watch("startDate") || null}
                            onChange={(date) => {
                              field.onChange(date);
                              trigger(spField(index, 'PROGRAM_START_DATE'));
                              trigger(spField(index, 'PROGRAM_START_TIME'));
                            }}
                            startDate={new Date()}
                            borderRight={true}
                            errorExist={
                              !!errors?.subPrograms?.[index]
                                ?.programStartDate ||
                              !!errors?.subPrograms?.[index]?.programStartTime
                            }
                            errorMessage={
                              errors?.subPrograms?.[index]?.programStartDate
                                ?.message
                            }
                            data-testid="custom-date-picker"
                            dataTestId="program-start-date"
                          />
                        )}
                      />
                    </div>
                    <div
                      className={styles.containerTime}
                      data-testid="form-fields"
                    >
                      <Controller
                        name={spField(index, 'PROGRAM_START_TIME')}
                        control={control}
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            errorExist={
                              !!errors?.subPrograms?.[index]
                                ?.programStartDate ||
                              !!errors?.subPrograms?.[index]?.programStartTime
                            }
                            onChange={(time: Date | null) => {
                              if (time && !isNaN(time.getTime())) {
                                setValue(
                                  spField(index, 'PROGRAM_START_TIME'),
                                  time,
                                );
                              }
                              trigger(spField(index, 'PROGRAM_START_TIME'));
                              trigger(spField(index, 'PROGRAM_START_DATE'));
                              trigger(spField(index, 'PROGRAM_END_TIME'));
                            }}
                            noWidthStyle={true}
                            data-testid="custom-time-picker"
                            dataTestid="program-start-time"
                            minTime={
                              isSameDay(
                                watch(spField(index, 'PROGRAM_START_DATE')),
                                prevSubProgramEndDate,
                              )
                                ? prevSubProgramEndTime || null
                                : null
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors?.programStartDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-start-date"
                    >
                      {errors.programStartDate?.message}
                    </i>
                  )}
                  {errors?.programStartTime && !errors?.programStartDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-start-time"
                    >
                      {errors.programStartTime?.message}
                    </i>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.formSection}>
              <div className={styles.ProgramDiv} data-testid="end-div">
                <div
                  className={styles.programInputContainer}
                  data-testid="end-date-div"
                >
                  <p
                    className={styles.labelText}
                    data-testid="label-text-end-date"
                  >
                    {SUB_PROGRAM_TEXT.TITLES.PROGRAM_END_DATE_TIME}
                  </p>
                  <div
                    className={styles.containerDateTime}
                    data-testid="program-end-date-time-inputs"
                  >
                    <div
                      className={styles.containerDate}
                      data-testid="form-fields-end"
                    >
                      <Controller
                        name={spField(index, 'PROGRAM_END_DATE')}
                        control={control}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value}
                            futureDate={false}
                            minDate={
                              watch(spField(index, 'PROGRAM_START_DATE')) ||
                              null
                            }
                            maxDate={watch(`endDate`) || null}
                            onChange={(date) => {
                              field.onChange(date);
                              trigger(spField(index, 'PROGRAM_END_DATE'));
                              trigger(spField(index, 'PROGRAM_END_TIME'));
                            }}
                            startDate={new Date()}
                            borderRight={true}
                            errorExist={
                              !!errors?.subPrograms?.[index]?.programEndDate ||
                              !!errors?.subPrograms?.[index]?.programEndTime
                            }
                            errorMessage={
                              errors?.subPrograms?.[index]?.programEndDate
                                ?.message
                            }
                            data-testid="custom-date-picker"
                            dataTestId="program-end-date"
                          />
                        )}
                      />
                    </div>
                    <div
                      className={styles.containerTime}
                      data-testid="form-fields"
                    >
                      <Controller
                        name={spField(index, 'PROGRAM_END_TIME')}
                        control={control}
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            errorExist={
                              !!errors?.subPrograms?.[index]?.programEndDate ||
                              !!errors?.subPrograms?.[index]?.programEndTime
                            }
                            onChange={(time: Date | null) => {
                              if (time && !isNaN(time.getTime())) {
                                setValue(
                                  spField(index, 'PROGRAM_END_TIME'),
                                  time,
                                );
                              }
                              trigger(spField(index, 'PROGRAM_END_TIME'));
                              trigger(spField(index, 'PROGRAM_END_DATE'));
                              trigger(spField(index, 'CHECK_OUT_START_TIME'));
                            }}
                            noWidthStyle={true}
                            data-testid="custom-time-picker"
                            dataTestid="program-end-time"
                            minTime={
                              isSameDay(
                                watch(spField(index, 'PROGRAM_END_DATE')),
                                watch(spField(index, 'PROGRAM_START_DATE')),
                              )
                                ? watch(spField(index, 'PROGRAM_START_TIME')) || null
                                : null
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors?.programEndDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-end-date"
                    >
                      {errors.programEndDate?.message}
                    </i>
                  )}
                  {errors?.programEndTime && !errors?.programEndDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-end-time"
                    >
                      {errors.programEndTime?.message}
                    </i>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div
                className={styles.programDiv}
                data-testid="checkin-start-div"
              >
                <div
                  className={styles.programInputContainer}
                  data-testid="checkin-start-date-div"
                >
                  <p
                    className={styles.labelText}
                    data-testid="label-text-checkin-start-date"
                  >
                    {SUB_PROGRAM_TEXT.TITLES.CHECKIN_START_DATE_TIME}
                  </p>
                  <div
                    className={styles.containerDateTime}
                    data-testid="checkin-start-date-time-inputs"
                  >
                    <div
                      className={styles.containerDate}
                      data-testid="form-fields-checkin-start"
                    >
                      <Controller
                        name={spField(index, 'CHECK_IN_START_DATE')}
                        control={control}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value}
                            futureDate={false}
                            minDate={
                              watch(spField(index, 'PROGRAM_START_DATE')) ||
                              null
                            }
                            maxDate={
                              watch(spField(index, 'PROGRAM_END_DATE')) ||
                              null
                            }
                            onChange={(date) => {
                              field.onChange(date);
                              trigger(spField(index, 'CHECK_IN_START_DATE'));
                              trigger(spField(index, 'CHECK_IN_START_TIME'));
                            }}
                            startDate={new Date()}
                            borderRight={true}
                            errorExist={
                              !!errors?.subPrograms?.[index]
                                ?.checkInStartDate ||
                              !!errors?.subPrograms?.[index]?.checkInStartTime
                            }
                            errorMessage={
                              errors?.subPrograms?.[index]?.checkInStartDate
                                ?.message
                            }
                            data-testid="custom-date-picker"
                            dataTestId="checkin-start-date"
                          />
                        )}
                      />
                    </div>
                    <div
                      className={styles.containerTime}
                      data-testid="form-fields"
                    >
                      <Controller
                        name={spField(index, 'CHECK_IN_START_TIME')}
                        control={control}
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            errorExist={
                              !!errors?.subPrograms?.[index]
                                ?.checkInStartDate ||
                              !!errors?.subPrograms?.[index]?.checkInStartTime
                            }
                            onChange={(time: Date | null) => {
                              if (time && !isNaN(time.getTime())) {
                                setValue(
                                  spField(index, 'CHECK_IN_START_TIME'),
                                  time,
                                );
                              }
                              trigger(spField(index, 'CHECK_IN_START_TIME'));
                              trigger(spField(index, 'CHECK_IN_START_DATE'));
                              trigger(spField(index, 'CHECK_IN_END_TIME'));
                            }}
                            noWidthStyle={true}
                            data-testid="custom-time-picker"
                            dataTestid="checkin-start-time"
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors?.checkInStartDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-checkin-start-date"
                    >
                      {errors.checkInStartDate?.message}
                    </i>
                  )}
                  {errors?.checkInStartTime && !errors?.checkInStartDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-checkin-start-time"
                    >
                      {errors.checkInStartTime?.message}
                    </i>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.programDiv} data-testid="checkin-end-div">
                <div
                  className={styles.programInputContainer}
                  data-testid="checkin-end-date-div"
                >
                  <p
                    className={styles.labelText}
                    data-testid="label-text-checkin-end-date"
                  >
                    {SUB_PROGRAM_TEXT.TITLES.CHECKIN_END_DATE_TIME}
                  </p>
                  <div
                    className={styles.containerDateTime}
                    data-testid="checkin-end-date-time-inputs"
                  >
                    <div
                      className={styles.containerDate}
                      data-testid="form-fields-checkin-end"
                    >
                      <Controller
                        name={spField(index, 'CHECK_IN_END_DATE')}
                        control={control}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value}
                            futureDate={false}
                            minDate={
                              watch(spField(index, 'CHECK_IN_START_DATE')) ||
                              null
                            }
                            maxDate={
                              watch(spField(index, 'PROGRAM_END_DATE')) ||
                              null
                            }
                            onChange={(date) => {
                              field.onChange(date);
                              trigger(spField(index, 'CHECK_IN_END_DATE'));
                              trigger(spField(index, 'CHECK_IN_END_TIME'));
                            }}
                            startDate={new Date()}
                            borderRight={true}
                            errorExist={
                              !!errors?.subPrograms?.[index]?.checkInEndDate ||
                              !!errors?.subPrograms?.[index]?.checkInEndTime
                            }
                            errorMessage={
                              errors?.subPrograms?.[index]?.checkInEndDate
                                ?.message
                            }
                            data-testid="custom-date-picker"
                            dataTestId="checkin-end-date"
                          />
                        )}
                      />
                    </div>
                    <div
                      className={styles.containerTime}
                      data-testid="form-fields"
                    >
                      <Controller
                        name={spField(index, 'CHECK_IN_END_TIME')}
                        control={control}
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            errorExist={
                              !!errors?.subPrograms?.[index]?.checkInEndDate ||
                              !!errors?.subPrograms?.[index]?.checkInEndTime
                            }
                            onChange={(time: Date | null) => {
                              if (time && !isNaN(time.getTime())) {
                                setValue(
                                  spField(index, 'CHECK_IN_END_TIME'),
                                  time,
                                );
                              }
                              trigger(spField(index, 'CHECK_IN_END_TIME'));
                              trigger(spField(index, 'CHECK_IN_END_DATE'));
                            }}
                            noWidthStyle={true}
                            data-testid="custom-time-picker"
                            dataTestid="checkin-end-time"
                            minTime={
                              isSameDay(
                                watch(spField(index, 'CHECK_IN_END_DATE')),
                                watch(spField(index, 'CHECK_IN_START_DATE')),
                              )
                                ? watch(spField(index, 'CHECK_IN_START_TIME')) || null
                                : null
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors?.checkInEndDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-checkin-end-date"
                    >
                      {errors?.checkInEndDate?.message}
                    </i>
                  )}
                  {errors?.checkInEndTime && !errors?.checkInEndDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-checkin-end-time"
                    >
                      {errors?.checkInEndTime?.message}
                    </i>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div
                className={styles.programDiv}
                data-testid="checkout-start-div"
              >
                <div
                  className={styles.programInputContainer}
                  data-testid="checkout-start-date-div"
                >
                  <p
                    className={styles.labelText}
                    data-testid="label-text-checkout-start-date"
                  >
                    {SUB_PROGRAM_TEXT.TITLES.CHECKOUT_START_DATE_TIME}
                  </p>
                  <div
                    className={styles.containerDateTime}
                    data-testid="checkout-start-date-time-inputs"
                  >
                    <div
                      className={styles.containerDate}
                      data-testid="form-fields-checkout-start"
                    >
                      <Controller
                        name={spField(index, 'CHECK_OUT_START_DATE')}
                        control={control}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value}
                            futureDate={false}
                            minDate={
                              watch(spField(index, 'PROGRAM_END_DATE')) ||
                              null
                            }
                            maxDate={watch("endDate") || null}
                            onChange={(date) => {
                              field.onChange(date);
                              trigger(spField(index, 'CHECK_OUT_START_DATE'));
                              trigger(spField(index, 'CHECK_OUT_START_TIME'));
                            }}
                            startDate={new Date()}
                            borderRight={true}
                            errorExist={
                              !!errors?.subPrograms?.[index]
                                ?.checkOutStartDate ||
                              !!errors?.subPrograms?.[index]?.checkOutStartTime
                            }
                            errorMessage={
                              errors?.subPrograms?.[index]?.checkOutStartDate
                                ?.message
                            }
                            data-testid="custom-date-picker"
                            dataTestId="checkout-start-date"
                          />
                        )}
                      />
                    </div>
                    <div
                      className={styles.containerTime}
                      data-testid="form-fields"
                    >
                      <Controller
                        name={spField(index, 'CHECK_OUT_START_TIME')}
                        control={control}
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            errorExist={
                              !!errors?.subPrograms?.[index]
                                ?.checkOutStartDate ||
                              !!errors?.subPrograms?.[index]?.checkOutStartTime
                            }
                            onChange={(time: Date | null) => {
                              if (time && !isNaN(time.getTime())) {
                                setValue(
                                  spField(index, 'CHECK_OUT_START_TIME'),
                                  time,
                                );
                              }
                              trigger(spField(index, 'CHECK_OUT_START_TIME'));
                              trigger(spField(index, 'CHECK_OUT_START_DATE'));
                              trigger(spField(index, 'CHECK_OUT_END_TIME'));
                            }}
                            noWidthStyle={true}
                            data-testid="custom-time-picker"
                            dataTestid="checkout-start-time"
                            minTime={
                              isSameDay(
                                watch(spField(index, 'CHECK_OUT_START_DATE')),
                                watch(spField(index, 'PROGRAM_END_DATE')),
                              )
                                ? watch(spField(index, 'PROGRAM_END_TIME')) || null
                                : null
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors?.checkOutStartDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-checkout-start-date"
                    >
                      {errors?.checkOutStartDate?.message}
                    </i>
                  )}
                  {errors?.checkOutStartTime && !errors?.checkOutStartDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-checkout-start-time"
                    >
                      {errors.checkOutStartTime?.message}
                    </i>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.programDiv} data-testid="checkout-end-div">
                <div
                  className={styles.programInputContainer}
                  data-testid="checkout-end-date-div"
                >
                  <p
                    className={styles.labelText}
                    data-testid="label-text-checkout-end-date"
                  >
                    {SUB_PROGRAM_TEXT.TITLES.CHECKOUT_END_DATE_TIME}
                  </p>
                  <div
                    className={styles.containerDateTime}
                    data-testid="checkout-end-date-time-inputs"
                  >
                    <div
                      className={styles.containerDate}
                      data-testid="form-fields-checkout-end"
                    >
                      <Controller
                        name={spField(index, 'CHECK_OUT_END_DATE')}
                        control={control}
                        render={({ field }) => (
                          <CustomDatePicker
                            value={field.value}
                            futureDate={false}
                            minDate={
                              watch(spField(index, 'PROGRAM_END_DATE')) ||
                              null
                            }
                            maxDate={watch("endDate") || null}
                            onChange={(date) => {
                              field.onChange(date);
                              trigger(spField(index, 'CHECK_OUT_END_DATE'));
                              trigger(spField(index, 'CHECK_OUT_END_TIME'));
                            }}
                            startDate={new Date()}
                            borderRight={true}
                            errorExist={
                              !!errors?.subPrograms?.[index]?.checkOutEndDate ||
                              !!errors?.subPrograms?.[index]?.checkOutEndTime
                            }
                            errorMessage={
                              errors?.subPrograms?.[index]?.checkOutEndDate
                                ?.message
                            }
                            data-testid="custom-date-picker"
                            dataTestId="checkout-end-date"
                          />
                        )}
                      />
                    </div>
                    <div
                      className={styles.containerTime}
                      data-testid="form-fields"
                    >
                      <Controller
                        name={spField(index, 'CHECK_OUT_END_TIME')}
                        control={control}
                        render={({ field }) => (
                          <CustomTimePicker
                            value={field.value}
                            errorExist={
                              !!errors?.subPrograms?.[index]?.checkOutEndDate ||
                              !!errors?.subPrograms?.[index]?.checkOutEndTime
                            }
                            onChange={(time: Date | null) => {
                              if (time && !isNaN(time.getTime())) {
                                setValue(
                                  spField(index, 'CHECK_OUT_END_TIME'),
                                  time,
                                );
                              }
                              trigger(spField(index, 'CHECK_OUT_END_TIME'));
                              trigger(spField(index, 'CHECK_OUT_END_DATE'));
                            }}
                            noWidthStyle={true}
                            data-testid="custom-time-picker"
                            dataTestid="checkout-end-time"
                            minTime={
                              isSameDay(
                                watch(spField(index, 'CHECK_OUT_END_DATE')),
                                watch(spField(index, 'CHECK_OUT_START_DATE')),
                              )
                                ? watch(spField(index, 'CHECK_OUT_START_TIME')) || null
                                : null
                            }
                          />
                        )}
                      />
                    </div>
                  </div>
                  {errors?.checkOutEndDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-checkout-end-date"
                    >
                      {errors.checkOutEndDate?.message}
                    </i>
                  )}
                  {errors?.checkOutEndTime && !errors?.checkOutEndDate && (
                    <i
                      className={styles.dateErrorMsg}
                      data-testid="error-msg-checkout-end-time"
                    >
                      {errors.checkOutEndTime?.message}
                    </i>
                  )}
                </div>
              </div>
              {/* Mode of Program */}
              <Controller
                name={`subPrograms.${index}.modeOfProgram`}
                control={control}
                render={({ field }) => (
                  <div className={styles.formSection}>
                    <div className={styles.fieldGroupMode}>
                      <div className={styles.venueField}>
                        <label className={styles.fieldLabel}>
                          {SUB_PROGRAM_TEXT.TITLES.MODE_OF_OPERATION}
                        </label>
                        <div className={styles.radioGroup}>
                          {["online", "offline", "hybrid"].map((mode) => (
                            <label key={mode} className={styles.radioOption}>
                              <input
                                type="radio"
                                {...field}
                                value={mode}
                                className={styles.radioInput}
                                checked={field.value === mode}
                                onChange={() => {
                                  field.onChange(mode);
                                  // Reset isResendential and venueAddress when mode changes
                                  setValue(
                                    `subPrograms.${index}.isResendential`,
                                    undefined,
                                  );
                                  setValue(
                                    `subPrograms.${index}.venueAddress`,
                                    [],
                                  );
                                }}
                                disabled={isPublished || checkToDisable(
                                  programTypeNameFromSource,
                                  `modeOfProgram-${mode}`,
                                )}
                              />
                              <span>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />

              {watch(`subPrograms.${index}.modeOfProgram`) === "offline" && (
                <div className={styles.formSection}>
                  <div
                    className={styles.fieldGroupMode}
                    style={{
                      display: "flex",

                      alignItems: "flex-end",
                      alignContent: "center",
                      alignSelf: "center",
                    }}
                  >
                    {/* Is this residential program? */}
                    <div className={styles.venueField}>
                      <label className={styles.fieldLabel}>
                        {SUB_PROGRAM_TEXT.TITLES.RESIDENTIAL_PROGRAM}
                      </label>
                      <div className={styles.radioGroup}>
                        <Controller
                          name={`subPrograms.${index}.isResendential`}
                          control={control}
                          render={({ field }) => (
                            <>
                              <label className={styles.radioOption}>
                                <input
                                  type="radio"
                                  {...field}
                                  value="yes"
                                  checked={field.value === "yes"}
                                  className={styles.radioInput}
                                  onChange={() => field.onChange("yes")}
                                  disabled={shouldDisableField('isResendential', isPublished, 'subPrograms')}
                                />
                                <span className={styles.radioLabel}>Yes</span>
                              </label>
                              <label className={styles.radioOption}>
                                <input
                                  type="radio"
                                  {...field}
                                  value="no"
                                  checked={field.value === "no"}
                                  className={styles.radioInput}
                                  onChange={() => field.onChange("no")}
                                  disabled={isPublished || checkToDisable(
                                    programTypeNameFromSource,
                                    `isResendential-no`,
                                  )}
                                />
                                <span className={styles.radioLabel}>No</span>
                              </label>
                            </>
                          )}
                        />
                      </div>
                    </div>
                    {/* Venue Selection if residential is yes */}
                    {watch(`subPrograms.${index}.isResendential`) === "yes" && (
                      <Controller
                        name={`subPrograms.${index}.venueAddress`}
                        control={control}
                        render={({ field }) => (
                          <div className={styles.venueField}>
                            <label className={styles.fieldLabel}>
                              {SUB_PROGRAM_TEXT.TITLES.VENUE_SELECTION}
                            </label>

                            <CustomDropDown
                              // value={field.value?.[0] || ""}
                              value={
                                watch("venueAddress") &&
                                watch("venueAddress").length > 0
                                  ? venueOptions.find((venue) =>
                                      watch("venueAddress")[0]
                                        .toLowerCase()
                                        .includes(venue.toLowerCase()),
                                    ) || ""
                                  : ""
                              }
                              onChange={(val) => {
                                if (val === "Add Custom Venue") {
                                  setCustomVenueModalOpen(true);
                                } else {
                                  const newVenues = val ? [val] : [];
                                  field.onChange(newVenues);
                                  setValue(
                                    `subPrograms.${index}.venueAddress`,
                                    newVenues,
                                  );
                                }
                              }}
                              options={[
                                ...venueOptions.map((venue) => ({
                                  value: venue,
                                  label:
                                    venue.charAt(0).toUpperCase() +
                                    venue.slice(1),
                                })),
                              ]}
                              placeholder="Select the venue"
                              width={340}
                              height={40}
                              error={!!errors?.venueAddress}
                              className={styles.selectField}
                              disabled={shouldDisableField('venueAddress', isPublished, 'subPrograms')}
                            />
                          </div>
                        )}
                      />
                    )}
                  </div>
                </div>
              )}
             
              {/* Payment Fields */}
              <div className={styles.formSection}>
                <div className={styles.fieldGroupMode}>
                  {/* Currency Selection */}
                  <Controller
                    name={`subPrograms.${index}.currency`}
                    control={control}
                    render={({ field }) => (
                      <div className={styles.venueField}>
                        <label className={styles.fieldLabel}>
                          {SUB_PROGRAM_TEXT.TITLES.CURRENCY_FOR_FEE}
                        </label>
                        <input
                          {...field}
                          type="text"
                          value={PROGRAM_DETAILS_FORM_TEXT.VALUES.CURRENCY_INR}
                          readOnly
                          className={styles.INRInputField} // Add styles as needed
                          disabled={true}
                        />
                      </div>
                    )}
                  />


                  <Controller
                    name={`subPrograms.${index}.programFee`}
                    control={control}
                    render={({ field }) => {
                      // Watch for changes in hdbFee
                      const hdbFee = watch("hdbFee");
                      const msdFee = watch("msdFee");

                      // Use useEffect to sync the value when hdbFee changes
                      React.useEffect(() => {
                        if (hdbFee && subProgram?.title?.includes("HDB")) {
                          // Convert to string to ensure full value is captured
                          const feeValue = String(hdbFee);
                          // Update the field value
                          setValue(`subPrograms.${index}.programFee`, feeValue);
                        }
                      }, [hdbFee]);

                      // Use useEffect to sync the value when msdFee changes
                      React.useEffect(() => {
                        if (msdFee && subProgram?.title?.includes("MSD")) {
                          // Convert to string to ensure full value is captured
                          const feeValue = String(msdFee);
                          // Update the field value
                          setValue(`subPrograms.${index}.programFee`, feeValue);
                        }
                      }, [msdFee]);

                      return (
                        <div className={styles.venueField}>
                          <label className={styles.fieldLabel}>
                            {SUB_PROGRAM_TEXT.TITLES.ENTER_SUB_PROGRAM_FEE}
                          </label>
                          <div className={styles.currencyInput}>
                            <span className={styles.currencySymbol}>
                              {getCurrencySymbol(
                                watch(`subPrograms.${index}.currency`),
                              )}
                            </span>
                            <input
                              {...field}
                              type="number"
                              className={`${styles.inputField} ${errors?.programFee ? styles.inputError : ""}`}
                              id={styles.INRInputField}
                              placeholder={COMMON_PLACEHOLDERS.ENTER_FEE}
                              value={field.value || ""}
                              disabled={shouldDisableField('programFee', isPublished, 'subPrograms')}
                            />
                          </div>

                          {errors?.programFee?.message && (
                            <span className={styles.errorText}>
                              {errors.programFee.message}
                            </span>
                          )}
                        </div>
                      );
                    }}
                  />
                </div>
              </div>
              {/* )} */}
            </div>
          </div>
        </div>
      </LocalizationProvider>
      <CustomVenueModal
        isOpen={isCustomVenueModalOpen}
        onClose={() => setCustomVenueModalOpen(false)}
        onAdd={handleAddCustomVenue}
        title="Adding a Custom Venue"
        message="Enter the Venue Address"
        showInput={true}
      />
    </>
  );
};

export default SubProgramCard;
