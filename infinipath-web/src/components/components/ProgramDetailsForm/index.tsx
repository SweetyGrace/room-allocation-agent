import { Controller } from "react-hook-form";
import * as yup from "yup";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import styles from "./index.module.scss";
import { DateRange } from "rsuite/esm/DateRangePicker";
import DateRangePicker from "rsuite/DateRangePicker";
import { getItemInLocalStorage } from "../../../services/localStorage";
import { useEffect, useState } from "react";
import CustomTimePicker from "../../../common/components/CustomTimePicker";
import CustomDropDown from "../../../common/components/CustomDropDown";
import CustomVenueModal from "../../../common/components/CustomVenueModal";
import CustomDatePicker from "../../../common/components/CustomDatePicker";
import { checkToDisable } from "../../../utils/checkToDisable";
import { shouldDisableField } from "../../../utils/publishedProgramPermissions";
import { PROGRAM_DETAILS_FORM_TEXT } from "../../../constants/textConstants";
import { ProgramDetailsFormProps } from "../../../types/programDetailsForm";
import {
  handleProgramDateRangeChange as handleProgramDateChange,
  handleRegistrationDateRangeChange as handleRegDateChange,
  clearProgramDates,
  clearRegistrationDates as clearRegDates,
  getProgramDateRangeValue as getDateRangeValue,
  getRegistrationDateRangeValue as getRegDateRangeValue,
  handleVenueSelectionChange,
  handleAddCustomVenue as addCustomVenue,
} from "../../../utils/programDetailsFormUtils";
import { generateProgramCodePlaceholder } from "../../../utils/commonFunctions";
//commented this, may be we need this schema for form validation in future, currently we are doing form validation on backend
// const programDetailsSchema = yup.object().shape({
//   programName: yup.string().required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.PROGRAM_NAME_REQUIRED),
//   programCode: yup.string().required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.PROGRAM_CODE_REQUIRED),
//   description: yup
//     .string()
//     .min(10, PROGRAM_DETAILS_FORM_TEXT.VALIDATION.DESCRIPTION_MIN_LENGTH),
//   startDate: yup.date().required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.START_DATE_REQUIRED),
//   programBanner: yup.mixed().optional(),
//   endDate: yup.date().required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.END_DATE_REQUIRED),
//   modeOfProgram: yup
//     .mixed()
//     .oneOf(["online", "offline", "hybrid"])
//     .required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.MODE_REQUIRED),
//   venueAddress: yup.array().of(yup.string()).required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.VENUE_NOT_SELECTED),
//   customVenue: yup.string().optional(),
//   isTravelRequired: yup.mixed().oneOf(["yes", "no"]).optional(),
//   isResidential: yup.mixed().oneOf(["yes", "no"]).optional(),
//   totalBedCount: yup.number().optional(),
//   tdsPercent: yup.number().optional(),
//   tdsApplicability: yup.string().optional(),
//   sgst: yup.number().optional(),
//   cgst: yup.number().optional(),
//   igst: yup.number().optional(),
//   invoiceSenderName: yup.string().optional(),
//   pan: yup.string().optional(),
//   gstin: yup.string().optional(),
//   cin: yup.string().optional(),
//   invoiceAddress: yup.string().optional(),
//   isPaymentRequired: yup.mixed().oneOf(["yes", "no"]).required(),
//   currency: yup.string().optional(),
//   programFee: yup.string().optional(),
//   registrationStartDate: yup
//     .date()
//     .required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.REGISTRATION_START_DATE_REQUIRED),
//   registrationStartTime: yup
//     .date()
//     .required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.REGISTRATION_START_TIME_REQUIRED),
//   registrationEndDate: yup.date().required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.REGISTRATION_END_DATE_REQUIRED),
//   registrationEndTime: yup.date().required(PROGRAM_DETAILS_FORM_TEXT.VALIDATION.REGISTRATION_END_TIME_REQUIRED),
//   approvalRequired: yup.mixed().oneOf(["yes", "no"]).required(),
//   hasSeatLimit: yup.mixed().oneOf(["yes", "no"]),
//   seatLimit: yup.string().optional(),
//   hasWaitlist: yup.mixed().oneOf(["yes", "no"]).required(),
//   launchStartDate: yup.date().optional(),
//   launchstartTime: yup.date().optional(),
//   waitlistTriggerCount: yup.string().optional(),
//   childMinAge: yup.number().min(0, PROGRAM_DETAILS_FORM_TEXT.VALIDATION.CHILD_MIN_AGE_NEGATIVE).max(18, PROGRAM_DETAILS_FORM_TEXT.VALIDATION.CHILD_MIN_AGE_EXCEED).optional(),
//   elderMaxAge: yup.number().min(18, PROGRAM_DETAILS_FORM_TEXT.VALIDATION.ELDER_MAX_AGE_MIN).max(120, PROGRAM_DETAILS_FORM_TEXT.VALIDATION.ELDER_MAX_AGE_EXCEED).optional(),
//   subPrograms: yup.array().of(yup.mixed()).required(),
// });

const ProgramDetailsForm = ({
  control,
  setValue,
  watch,
  errors,
  getValues,
  trigger,
  programType,
  uploadedBanner,
  bannerImageUrl,
  showCustomVenue,
  onBannerUpload,
  onVenueChange,
  getCurrencySymbol,
  currencyOptions,
  venueOptions,
  dateRange,
  setDateRange,
  onDateChange,
  registrationDateRange,
  setRegistrationDateRange,
  onRegistrationDateChange,
  programTypeNameFromSource,
  isPublished = false,
}: ProgramDetailsFormProps) => {
  // Watch for changes
  const modeOfProgram = watch("modeOfProgram");
  const isPaymentRequired = watch("isPaymentRequired");
  const hasSeatLimit = watch("hasSeatLimit");
  const hasWaitlist = watch("hasWaitlist");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const registrationStartDate = watch("registrationStartDate");
  const registrationEndDate = watch("registrationEndDate");
  const selectedCurrency = watch("currency");
  
  // Check if registration start date has passed
  const registrationStartPassed = registrationStartDate && 
    new Date(registrationStartDate) < new Date();
  useEffect(() => {
    const venueAddress = watch("venueAddress");
    if (venueAddress && venueAddress.length > 0) {
      setValue("venueNameInEmail", venueAddress[0]);
    } else {
      setValue("venueNameInEmail", "");
    }
  }, [watch("venueAddress")]);
  
  // Handle program date range change
  const handleDateRangeChange = (value: DateRange | null) => {
    handleProgramDateChange(value, setValue, setDateRange, onDateChange);
  };
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  useEffect(() => {
    setUploadedFile(uploadedBanner);
  }, [uploadedBanner, setUploadedFile]);

  // Handle registration date range change
  const handleRegistrationDateRangeChange = (value: DateRange | null) => {
    handleRegDateChange(value, setValue, setRegistrationDateRange, onRegistrationDateChange);
  };

  // Clear program dates function
  const clearDates = () => {
    clearProgramDates(setValue, setDateRange, onDateChange);
  };

  // Clear registration dates function
  const clearRegistrationDates = () => {
    clearRegDates(setValue, setRegistrationDateRange, onRegistrationDateChange);
  };

  // Format date range for display - Program dates
  const getProgramDateRangeValue = (): DateRange | null => {
    return getDateRangeValue(watch, dateRange);
  };

  // Format date range for display - Registration dates
  const getRegistrationDateRangeValue = (): DateRange | null => {
    return getRegDateRangeValue(watch, registrationDateRange);
  };
  const seekerDetails = getItemInLocalStorage(PROGRAM_DETAILS_FORM_TEXT.VALUES.SEEKER_DETAILS_KEY);
  const [isCustomVenueModalOpen, setCustomVenueModalOpen] = useState(false);

  const handleVenueChange = (value: string) => {
    handleVenueSelectionChange(value, setValue, setCustomVenueModalOpen, PROGRAM_DETAILS_FORM_TEXT.UI.ADD_CUSTOM_VENUE);
  };

  const handleAddCustomVenue = (venue: string) => {
    addCustomVenue(venue, setValue, setCustomVenueModalOpen);
  };

  return (
    <>
      <Controller
        name="registrationStartDate"
        control={control}
        render={() => <></>}
      />
      <Controller
        name="registrationEndDate"
        control={control}
        render={() => <></>}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className={styles.formContainer}>
          {/* Header */}

          {/* Form Content */}
          <div className={styles.formContent}>
            <p className={styles.Detailstitle}>{PROGRAM_DETAILS_FORM_TEXT.UI.SECTION_TITLE}</p>
            <p className={styles.subtitle}>
              {PROGRAM_DETAILS_FORM_TEXT.UI.SECTION_SUBTITLE}
            </p>

            {/* Mode of Program */}
            <div className={styles.formSection}>
              <div className={styles.fieldGroup}>
                <div>
                  <label className={styles.fieldLabel}>
                    {PROGRAM_DETAILS_FORM_TEXT.UI.PROGRAM_NAME_LABEL}
                  </label>
                  <Controller
                    name="programName"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.PROGRAM_NAME}
                        className={`${styles.inputFieldtitle} ${
                          errors.programName ? styles.inputError : ""
                        }`}
                        disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.PROGRAM_NAME, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                      />
                    )}
                  />
                  {errors.programName && (
                    <span className={styles.errorText}>
                      {errors.programName.message}
                    </span>
                  )}
                </div>
                <div>
                  <label className={styles.fieldLabel}>
                    {PROGRAM_DETAILS_FORM_TEXT.UI.PROGRAM_CODE_LABEL}
                  </label>
                  <Controller
                    name="programCode"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder={generateProgramCodePlaceholder(watch("programName") || "")}
                        className={`${styles.inputFieldtitle} ${
                          errors.programCode ? styles.inputError : ""
                        }`}
                        disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.PROGRAM_CODE, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                      />
                    )}
                  />
                  {errors.programCode && (
                    <span className={styles.errorText}>
                      {errors.programCode.message}
                    </span>
                  )}
                </div>
              </div>
              {/* Program Description */}
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {PROGRAM_DETAILS_FORM_TEXT.UI.DESCRIPTION_LABEL}
                  </label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.DESCRIPTION_PLACEHOLDER}
                        className={`${styles.textareaField} ${
                          errors.description ? styles.inputError : ""
                        }`}
                        rows={4}
                        disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.DESCRIPTION, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                      />
                    )}
                  />
                  {errors.description && (
                    <span className={styles.errorText}>
                      {errors.description.message}
                    </span>
                  )}
                </div>
              </div>
              {/* Mode of Program */}
              <div className={styles.formSection}>
                <div className={styles.fieldGroupMode}>
                  <div className={styles.venueField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.MODE_LABEL}
                    </label>
                    <div className={styles.radioGroup}>
                      <Controller
                        name="modeOfProgram"
                        control={control}
                        render={({ field }) => (
                          <>
                            <label className={styles.radioOption}>
                              <input
                                type="radio"
                                {...field}
                                value={PROGRAM_DETAILS_FORM_TEXT.VALUES.ONLINE_VALUE}
                                checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.ONLINE_VALUE}
                                className={styles.radioInput}
                                disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.MODE_OF_PROGRAM, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS) || checkToDisable(
                                  programTypeNameFromSource,
                                  "modeOfProgram-online",
                                )}
                              />
                              <span className={styles.radioLabel}>{PROGRAM_DETAILS_FORM_TEXT.UI.ONLINE}</span>
                            </label>
                            <label className={styles.radioOption}>
                              <input
                                type="radio"
                                {...field}
                                value={PROGRAM_DETAILS_FORM_TEXT.VALUES.OFFLINE_VALUE}
                                checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.OFFLINE_VALUE}
                                className={styles.radioInput}
                                disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.MODE_OF_PROGRAM, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                              />
                              <span className={styles.radioLabel}>{PROGRAM_DETAILS_FORM_TEXT.UI.OFFLINE}</span>
                            </label>
                            <label className={styles.radioOption}>
                              <input
                                type="radio"
                                {...field}
                                value={PROGRAM_DETAILS_FORM_TEXT.VALUES.HYBRID_VALUE}
                                checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.HYBRID_VALUE}
                                className={styles.radioInput}
                                disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.MODE_OF_PROGRAM, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS) || checkToDisable(
                                  programTypeNameFromSource,
                                  "modeOfProgram-hybrid",
                                )}
                              />
                              <span className={styles.radioLabel}>{PROGRAM_DETAILS_FORM_TEXT.UI.HYBRID}</span>
                            </label>
                          </>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {watch("modeOfProgram") === PROGRAM_DETAILS_FORM_TEXT.VALUES.OFFLINE_VALUE && (
                <div className={styles.formSection}>
                  <div
                    className={styles.fieldGroupMode}
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    {/* Is this residential program? */}
                    <div className={styles.venueField}>
                      <label className={styles.fieldLabel}>
                        {PROGRAM_DETAILS_FORM_TEXT.UI.RESIDENTIAL_LABEL}
                      </label>
                      <div className={styles.radioGroup}>
                        <Controller
                          name="isResendential"
                          control={control}
                          render={({ field }) => (
                            <>
                              <label className={styles.radioOption}>
                                <input
                                  type="radio"
                                  {...field}
                                  value={PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE}
                                  checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE}
                                  className={styles.radioInput}
                                  onChange={() => field.onChange(PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE)}
                                  disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.IS_RESIDENTIAL, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                                />
                                <span className={styles.radioLabel}>{PROGRAM_DETAILS_FORM_TEXT.UI.YES}</span>
                              </label>
                              <label className={styles.radioOption}>
                                <input
                                  type="radio"
                                  {...field}
                                  value={PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE}
                                  checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE}
                                  className={styles.radioInput}
                                  onChange={() => field.onChange(PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE)}
                                  disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.IS_RESIDENTIAL, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS) || checkToDisable(
                                    programTypeNameFromSource,
                                    "isResendential-no",
                                  )}
                                />
                                <span className={styles.radioLabel}>{PROGRAM_DETAILS_FORM_TEXT.UI.NO}</span>
                              </label>
                            </>
                          )}
                        />
                      </div>
                    </div>
                    {/* Venue Selection */}
                    {watch("isResendential") === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE && (
                      <div className={styles.venueField}>
                        <label className={styles.fieldLabel}>
                          {PROGRAM_DETAILS_FORM_TEXT.UI.VENUE_LABEL}
                        </label>
                        <Controller
                          name="venueAddress"
                          control={control}
                          render={({ field }) => (
                            <CustomDropDown
                              value={
                                watch("venueAddress") &&
                                watch("venueAddress").length > 0
                                  ? venueOptions.find((venue: string) =>
                                      watch("venueAddress")[0]
                                        ?.toLowerCase()
                                        .includes(venue.toLowerCase()),
                                    ) || ""
                                  : ""
                              }
                              onChange={handleVenueChange}
                              options={
                                venueOptions && venueOptions.length > 0
                                  ? venueOptions.map((venue: string) => ({
                                      value: venue,
                                      label:
                                        venue.charAt(0).toUpperCase() +
                                        venue.slice(1),
                                    }))
                                  : [
                                      {
                                        value: "",
                                        label: PROGRAM_DETAILS_FORM_TEXT.UI.OTHER,
                                      },
                                    ]
                              }
                              placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.SELECT_VENUE}
                              width={340}
                              height={40}
                              error={
                                !!(
                                  errors.venueAddress &&
                                  (!field.value || field.value.length === 0)
                                )
                              }
                              className={styles.selectFieldFixed}
                              disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.VENUE_ADDRESS, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                            />
                          )}
                        />
                        {errors.venueAddress &&
                          (!watch("venueAddress") ||
                            watch("venueAddress").length === 0) && (
                            <span className={styles.venueErrorText}>
                              <p>{PROGRAM_DETAILS_FORM_TEXT.VALIDATION.VENUE_REQUIRED}</p>
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                  {/* Total Bed Count - on separate line */}
                  {watch("isResendential") === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE && (
                    <div className={styles.fieldGroupBedCount}>
                      <label className={styles.fieldLabel}>
                        {PROGRAM_DETAILS_FORM_TEXT.UI.TOTAL_BED_COUNT_LABEL}
                      </label>
                      <Controller
                        name="totalBedCount"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.BED_COUNT}
                            className={`${styles.inputFieldtitle} ${
                              errors.totalBedCount ? styles.inputError : ""
                            } ${styles.bedCountInput}`}
                          />
                        )}
                      />
                      {errors.totalBedCount && (
                        <span className={styles.errorText}>
                          {errors.totalBedCount.message}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              {watch("programName")?.includes(PROGRAM_DETAILS_FORM_TEXT.VALUES.HDB_MSD_IDENTIFIER) && (
                <div className={styles.formSection}>
                  <div className={styles.fieldGroupMode}>
                    <div className={styles.seatLimit}>
                      <label className={styles.fieldLabel}>
                        {PROGRAM_DETAILS_FORM_TEXT.UI.SEAT_LIMIT_LABEL}
                      </label>
                      <div className={styles.radioGroup}>
                        <Controller
                          name="hasSeatLimit"
                          control={control}
                          render={({ field }) => (
                            <>
                              <label className={styles.radioOption}>
                                <input
                                  type="radio"
                                  {...field}
                                  value={PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE}
                                  checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE}
                                  className={styles.radioInput}
                                  disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.HAS_SEAT_LIMIT, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                                />
                                <span className={styles.radioLabel}>
                                  {PROGRAM_DETAILS_FORM_TEXT.UI.LIMIT_PARTICIPANTS}
                                </span>
                              </label>
                              <label className={styles.radioOption}>
                                <input
                                  type="radio"
                                  {...field}
                                  value={PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE}
                                  checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE}
                                  className={styles.radioInput}
                                  disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.HAS_SEAT_LIMIT, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                                />
                                <span className={styles.radioLabel}>
                                  {PROGRAM_DETAILS_FORM_TEXT.UI.UNLIMITED_PARTICIPANTS}
                                </span>
                              </label>
                            </>
                          )}
                        />
                      </div>
                      {errors.hasSeatLimit && (
                        <span className={styles.errorText}>
                          {errors.hasSeatLimit.message}
                        </span>
                      )}
                    </div>
                    {hasSeatLimit === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE && (
                      <div className={styles.seatField}>
                        <label className={styles.fieldLabel}>
                          {PROGRAM_DETAILS_FORM_TEXT.UI.NUMBER_OF_SEATS_LABEL}
                        </label>
                        <Controller
                          name="seatLimit"
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="number"
                              placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.SEAT_COUNT}
                              className={styles.inputField}
                            />
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  {hasSeatLimit === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE && (
                    <div className={styles.fieldGroupMode}>
                      <div className={styles.venueField}>
                        <label className={styles.fieldLabel}>
                          {PROGRAM_DETAILS_FORM_TEXT.UI.WAITLIST_LABEL}
                        </label>
                        <div className={styles.radioGroup}>
                          <Controller
                            name="hasWaitlist"
                            control={control}
                            defaultValue={PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE}
                            render={({ field }) => (
                              <>
                                <label className={styles.radioOption}>
                                  <input
                                    type="radio"
                                    {...field}
                                    value={PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE}
                                    checked={
                                      field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE ||
                                      field.value === undefined
                                    }
                                    className={styles.radioInput}
                                    disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.HAS_WAITLIST, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                                  />
                                  <span className={styles.radioLabel}>
                                    {PROGRAM_DETAILS_FORM_TEXT.UI.YES_ALLOW_WAITLIST}
                                  </span>
                                </label>
                                <label className={styles.radioOption}>
                                  <input
                                    type="radio"
                                    {...field}
                                    value={PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE}
                                    checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE}
                                    className={styles.radioInput}
                                    disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.HAS_WAITLIST, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                                  />
                                  <span className={styles.radioLabel}>
                                    {PROGRAM_DETAILS_FORM_TEXT.UI.NO_WAITLIST}
                                  </span>
                                </label>
                              </>
                            )}
                          />
                        </div>
                        {errors.hasWaitlist && (
                          <span className={styles.errorText}>
                            {errors.hasWaitlist.message}
                          </span>
                        )}
                      </div>

                      {hasWaitlist === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE && (
                        <div className={styles.waitlistField}>
                          <label className={styles.fieldLabel}>
                            {PROGRAM_DETAILS_FORM_TEXT.UI.TRIGGER_COUNT_LABEL}
                          </label>
                          <Controller
                            name="waitlistTriggerCount"
                            control={control}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="number"
                                placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.TRIGGER_COUNT}
                                className={styles.inputField}
                                disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.WAITLIST_TRIGGER_COUNT, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Program Dates */}
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {PROGRAM_DETAILS_FORM_TEXT.UI.PROGRAM_DATES_LABEL}
                  </label>
                  <div>
                  <div className={styles.dateRow}>
                    <div className={styles.dateField}>
                      {/* <span className={styles.dateLabel}>
                        Setting end date of the program by default
                      </span> */}

                      <div className={styles.datePicker}>
                        <DateRangePicker
                          placement="bottomStart"
                          value={getProgramDateRangeValue()}
                          onOk={handleDateRangeChange}
                          onChange={(value) => {
                            handleDateRangeChange(value);
                            trigger("startDate");
                            trigger("endDate");
                          }}
                          disabledDate={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          ranges={[]}
                          format={PROGRAM_DETAILS_FORM_TEXT.VALUES.DATE_FORMAT}
                          onClean={clearDates}
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.UI.DATE_RANGE_PLACEHOLDER}
                          style={{ width: PROGRAM_DETAILS_FORM_TEXT.VALUES.WIDTH_FULL }}
                          className={
                            errors.startDate || errors.endDate
                              ? styles.datePickerError
                              : styles.datePicker
                          }
                          onBlur={() => {
                            trigger("startDate");
                            trigger("endDate");
                          }}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.START_DATE, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Display validation errors for dates */}
                  <div className={styles.dateErrorRow}>
                    {errors.startDate && (
                      <span className={styles.errorText}>
                        {errors.startDate.message}
                      </span>
                    )}
                    {errors.endDate && (
                      <span className={styles.errorText}>
                        {errors.endDate.message}
                      </span>
                    )}
                  </div>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <div
                  className={styles.RegistrationDiv}
                  data-testid="register-div"
                >
                  <div
                    className={styles.RegistrationInputContainer}
                    data-testid="register-date-div"
                  >
                    <p
                      className={styles.labelText}
                      data-testid="label-text-start-date"
                    >
                      {PROGRAM_DETAILS_FORM_TEXT.UI.REGISTRATION_START_LABEL}
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
                          name={`registrationStartDate`}
                          control={control}
                          render={({ field }) => (
                            <CustomDatePicker
                              value={field.value}
                              futureDate={false}
                              onChange={(date) => {
                                field.onChange(date);
                                trigger(`registrationStartDate`);
                                trigger(`registrationStartTime`);
                              }}
                              maxDate={watch("startDate") || null}
                              startDate={new Date()}
                              borderRight={true}
                              errorExist={
                                !!errors?.registrationStartDate ||
                                !!errors?.registrationStartTime
                              }
                              errorMessage={
                                errors?.registrationStartDate?.message
                              }
                              data-testid="custom-date-picker"
                              dataTestId="program-start-date"
                              disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.REGISTRATION_START_DATE, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS) && registrationStartPassed}
                            />
                          )}
                        />
                      </div>
                      <div
                        className={styles.containerTime}
                        data-testid="form-fields"
                      >
                        <Controller
                          name={`registrationStartTime`}
                          control={control}
                          render={({ field }) => (
                            <CustomTimePicker
                              value={field.value}
                              errorExist={
                                !!errors?.registrationStartDate ||
                                !!errors?.registrationStartTime
                              }
                              onChange={(time: Date | null) => {
                                if (time && !isNaN(time.getTime())) {
                                  setValue(`registrationStartTime`, time);
                                }
                                trigger(`registrationStartTime`);
                                trigger(`registrationStartDate`);
                                trigger(`registrationEndTime`);
                              }}
                              noWidthStyle={true}
                              data-testid="custom-time-picker"
                              dataTestid="program-start-time"
                              readOnly={isPublished && registrationStartPassed}
                            />
                          )}
                        />
                      </div>
                    </div>
                    {errors?.registrationStartDate && (
                      <i
                        className={styles.errorMsg}
                        data-testid="error-msg-start-date"
                      >
                        {errors.registrationStartDate?.message}
                      </i>
                    )}
                    {errors?.registrationStartTime &&
                      !errors?.registrationStartTime && (
                        <i
                          className={styles.errorMsg}
                          data-testid="error-msg-start-time"
                        >
                          {errors.registrationStartTime?.message}
                        </i>
                      )}
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.RegistrationDiv} data-testid="end-div">
                  <div
                    className={styles.RegistrationInputContainer}
                    data-testid="end-date-div"
                  >
                    <p
                      className={styles.labelText}
                      data-testid="label-text-end-date"
                    >
                      {PROGRAM_DETAILS_FORM_TEXT.UI.REGISTRATION_END_LABEL}
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
                          name="registrationEndDate"
                          control={control}
                          render={({ field }) => (
                            <CustomDatePicker
                              value={field.value}
                              futureDate={true}
                              onChange={(date) => {
                                field.onChange(date);
                                trigger(`registrationEndDate`);
                                trigger(`registrationEndTime`);
                              }}
                              // maxDate={watch("startDate") || null}
                              minDate={watch("registrationStartDate") || null}
                              maxDate={watch("startDate") || null}
                              startDate={new Date()}
                              borderRight={true}
                              errorExist={
                                !!errors?.RegistrationEndDate ||
                                !!errors?.RegistrationEndTime
                              }
                              errorMessage={
                                errors?.RegistrationEndDate?.message
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
                          name="registrationEndTime"
                          control={control}
                          render={({ field }) => (
                            <CustomTimePicker
                              value={field.value}
                              errorExist={
                                !!errors?.registrationEndDate ||
                                !!errors?.registrationEndTime
                              }
                              onChange={(time: Date | null) => {
                                if (time && !isNaN(time.getTime())) {
                                  setValue(`registrationEndTime`, time);
                                }
                                trigger(`registrationEndTime`);
                                trigger(`registrationEndDate`);
                              }}
                               noWidthStyle={true}
                              data-testid="custom-time-picker"
                              dataTestid="program-end-time"
                              minTime={
                                registrationEndDate && registrationStartDate &&
                                new Date(registrationEndDate).toDateString() === new Date(registrationStartDate).toDateString()
                                  ? watch("registrationStartTime") || null
                                  : null
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                    {errors?.registrationEndDate && (
                      <i
                        className={styles.errorMsg}
                        data-testid="error-msg-end-date"
                      >
                        {errors.registrationEndDate?.message}
                      </i>
                    )}
                    {errors?.registrationEndTime &&
                      !errors?.registrationEndDate && (
                        <i
                          className={styles.errorMsg}
                          data-testid="error-msg-end-time"
                        >
                          {errors.registrationEndTime?.message}
                        </i>
                      )}
                  </div>
                </div>
              </div>
              {/* Payment Section */}
              {/* Participants Limit */}
              {/* Waitlist */}
              {/* Approval Required */}
              <div className={styles.formSection}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    {PROGRAM_DETAILS_FORM_TEXT.UI.APPROVAL_LABEL}
                  </label>
                  <div className={styles.radioGroup}>
                    <Controller
                      name="approvalRequired"
                      control={control}
                      render={({ field }) => (
                        <>
                          <label className={styles.radioOption}>
                            <input
                              type="radio"
                              {...field}
                              value={PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE}
                              checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.YES_VALUE}
                              className={styles.radioInput}
                              disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.APPROVAL_REQUIRED, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                            />
                            <span className={styles.radioLabel}>
                              {PROGRAM_DETAILS_FORM_TEXT.UI.YES_REQUIRE_APPROVAL}
                            </span>
                          </label>
                          <label className={styles.radioOption}>
                            <input
                              type="radio"
                              {...field}
                              value={PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE}
                              checked={field.value === PROGRAM_DETAILS_FORM_TEXT.VALUES.NO_VALUE}
                              className={styles.radioInput}
                              disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.APPROVAL_REQUIRED, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS) || checkToDisable(
                                programTypeNameFromSource,
                                "approvalRequired-no",
                              )}
                            />
                            <span className={styles.radioLabel}>
                              {PROGRAM_DETAILS_FORM_TEXT.UI.NO_APPROVAL_NEEDED}
                            </span>
                          </label>
                        </>
                      )}
                    />
                  </div>
                  {errors.approvalRequired && (
                    <span className={styles.errorText}>
                      {errors.approvalRequired.message}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.fieldGroupModeTwo}>
                  {/* <div className={styles.venueField}> */}
                  {/* <label className={styles.fieldLabel}>
                  Is there a fee for the program?
                </label>
                <div className={styles.radioGroup}>
                  <Controller
                    name="isPaymentRequired"
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
                          />
                          <span className={styles.radioLabel}>No</span>
                        </label>
                      </>
                    )}
                  />
                </div>
                {errors.isPaymentRequired && (
                  <span className={styles.errorText}>
                    {errors.isPaymentRequired.message}
                  </span>
                )} */}

                  <div
                    className={
                      programTypeNameFromSource?.includes("HDB")
                        ? `${styles.feeSection}`
                        : `${styles.feeSectionHDB}`
                    }
                  >
                    <div className={styles.feeDisableField}>
                      <label className={styles.fieldLabelText}>
                        {PROGRAM_DETAILS_FORM_TEXT.UI.CURRENCY_LABEL}
                      </label>
                      {/* <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => (
                      <select {...field} className={styles.selectField}>
                        <option value="">Select the Currency</option>
                        {currencyOptions.map((currency) => (
                          <option key={currency.value} value={currency.value}>
                            {currency.label}
                          </option>
                        ))}
                      </select>
                    )}
                  /> */}

                      <Controller
                        name="currency"
                        control={control}
                        render={({ field }) => (
                          <div className={styles.venueFfeeField}>
                            {/* <label className={styles.fieldLabel}>
                            Currency for the sub-program fee
                          </label> */}
                            <input
                              {...field}
                              type="text"
                              value={PROGRAM_DETAILS_FORM_TEXT.VALUES.CURRENCY_INR}
                              readOnly
                              className={styles.INRField}
                            />
                          </div>
                        )}
                      />
                    </div>
                    {/* Fee inputs in the next row, all in a flex row */}

                    {programTypeNameFromSource?.includes(PROGRAM_DETAILS_FORM_TEXT.VALUES.HDB_VALUE) ? (
                      <div className={styles.subProgramFeeSection}>
                        <div className={styles.fieldGroupMode}>
                          <div className={styles.contactField}>
                            <label className={styles.fieldLabel}>
                              {PROGRAM_DETAILS_FORM_TEXT.UI.HDB_FEE_LABEL}
                            </label>
                            <div className={styles.inputWithSymbol}>
                              <Controller
                                name="hdbFee"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="number"
                                    placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.ENTER_FEE}
                                    className={`${styles.inputField} ${errors.hdbFee ? styles.inputError : ""}`}
                                    disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.HDB_FEE, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                                  />
                                )}
                              />
                              <span className={styles.currencySymbol}>₹</span>
                            </div>
                            {errors.hdbFee && (
                              <span className={styles.contactErrorText}>
                                {errors.hdbFee.message}
                              </span>
                            )}
                          </div>

                          <div className={styles.contactField}>
                            <label className={styles.fieldLabel}>
                              {PROGRAM_DETAILS_FORM_TEXT.UI.MSD_FEE_LABEL}
                            </label>
                            <div className={styles.inputWithSymbol}>
                              <Controller
                                name="msdFee"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="number"
                                    placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.ENTER_FEE}
                                    className={`${styles.inputField} ${errors.msdFee ? styles.inputError : ""}`}
                                    disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.MSD_FEE, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                                  />
                                )}
                              />
                              <span className={styles.currencySymbol}>₹</span>
                            </div>
                            {errors.msdFee && (
                              <span className={styles.contactErrorText}>
                                {errors.msdFee.message}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.subProgramFeeSection}>
                        <div className={styles.feeRow}>
                          <div className={styles.feeField}>
                            <label className={styles.fieldLabel}>
                              {PROGRAM_DETAILS_FORM_TEXT.UI.HDB_FEE_LABEL}
                            </label>
                            <div className={styles.currencyInput}>
                              <span className={styles.currencySymbol}>
                                {getCurrencySymbol(selectedCurrency || "INR")}
                              </span>
                              <Controller
                                name="hdbFee"
                                control={control}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="number"
                                    placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.ENTER_FEE}
                                    className={styles.inputField}
                                    onBlur={() => {
                                      trigger("hdbFee");
                                    }}
                                    disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.HDB_FEE, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                                  />
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* </div> */}
                  </div>
                </div>
              </div>
              <div className={styles.formSection}>
                <div className={styles.fieldGroupMode}>
                  <div className={styles.contactField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.CHILD_MIN_AGE_LABEL}
                    </label>
                    <Controller
                      name="childMinAge"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.CHILD_AGE}
                          className={`${styles.inputFieldtitle} ${
                            errors.childMinAge ? styles.inputError : ""
                          }`}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.CHILD_MIN_AGE, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      )}
                    />
                    {errors.childMinAge && (
                      <span className={styles.contactErrorText}>
                        {errors.childMinAge.message}
                      </span>
                    )}
                  </div>
                  <div className={styles.contactField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.ELDER_MAX_AGE_LABEL}
                    </label>
                    <Controller
                      name="elderMaxAge"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.ELDER_AGE}
                          className={`${styles.inputFieldtitle} ${
                            errors.elderMaxAge ? styles.inputError : ""
                          }`}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.ELDER_MAX_AGE, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      )}
                    />
                    {errors.elderMaxAge && (
                      <span className={styles.contactErrorText}>
                        {errors.elderMaxAge.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.contactFormSection}>
                {/* Row 1: Help Line Number and Email Sender Name */}
                <div className={styles.ContactfieldGroup}>
                  <div className={styles.contactField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.HELP_LINE_LABEL}
                    </label>
                    <Controller
                      name="helpLineNumber"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.HELP_LINE}
                          className={`${styles.inputFieldtitle} ${
                            errors.helpLineNumber ? styles.inputError : ""
                          }`}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.HELP_LINE_NUMBER, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      )}
                    />
                    {errors.helpLineNumber && (
                      <span className={styles.contactErrorText}>
                        {errors.helpLineNumber.message}
                      </span>
                    )}
                  </div>
                  <div className={styles.contactField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.EMAIL_SENDER_LABEL}
                    </label>
                    <Controller
                      name="emailSenderName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.EMAIL_SENDER}
                          className={`${styles.inputFieldtitle} ${
                            errors.emailSenderName ? styles.inputError : ""
                          }`}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.EMAIL_SENDER_NAME, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      )}
                    />
                    {errors.emailSenderName && (
                      <span className={styles.contactErrorText}>
                        {errors.emailSenderName.message}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Row 2: Email Sender Address and BCC Name */}
                <div className={styles.ContactfieldGroup}>
                  <div className={styles.contactField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.EMAIL_SENDER_ADDRESS_LABEL}
                    </label>
                    <Controller
                      name="emailSenderAddress"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.EMAIL_SENDER_ADDRESS}
                          className={`${styles.inputFieldtitle} ${
                            errors.emailSenderAddress ? styles.inputError : ""
                          }`}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.EMAIL_SENDER_ADDRESS, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      )}
                    />
                    {errors.emailSenderAddress && (
                      <span className={styles.contactErrorText}>
                        {errors.emailSenderAddress.message}
                      </span>
                    )}
                  </div>
                  <div className={styles.contactField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.EMAIL_BCC_NAME_LABEL}
                    </label>
                    <Controller
                      name="emailBccName"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.EMAIL_BCC_NAME}
                          className={`${styles.inputFieldtitle} ${
                            errors.emailBccName ? styles.inputError : ""
                          }`}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.EMAIL_BCC_NAME, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      )}
                    />
                    {errors.emailBccName && (
                      <span className={styles.contactErrorText}>
                        {errors.emailBccName.message}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Row 3: BCC Email Address and Venue Name in Email */}
                <div className={styles.ContactfieldGroup}>
                  <div className={styles.contactField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.EMAIL_BCC_ADDRESS_LABEL}
                    </label>
                    <Controller
                      name="emailBccAddress"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="email"
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.EMAIL_BCC_ADDRESS}
                          className={`${styles.inputFieldtitle} ${
                            errors.emailBccAddress ? styles.inputError : ""
                          }`}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.EMAIL_BCC_ADDRESS, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      )}
                    />
                    {errors.emailBccAddress && (
                      <span className={styles.contactErrorText}>
                        {errors.emailBccAddress.message}
                      </span>
                    )}
                  </div>
                  <div className={styles.contactField}>
                    <label className={styles.fieldLabel}>
                      {PROGRAM_DETAILS_FORM_TEXT.UI.VENUE_IN_EMAIL_LABEL}
                    </label>
                    <Controller
                      name="venueNameInEmail"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder={PROGRAM_DETAILS_FORM_TEXT.PLACEHOLDERS.VENUE_IN_EMAIL}
                          className={`${styles.inputFieldtitle} ${
                            errors.venueNameInEmail ? styles.inputError : ""
                          }`}
                          disabled={shouldDisableField(PROGRAM_DETAILS_FORM_TEXT.FIELD_NAMES.VENUE_NAME_IN_EMAIL, isPublished, PROGRAM_DETAILS_FORM_TEXT.SECTIONS.PROGRAM_DETAILS)}
                        />
                      )}
                    />
                    {errors.venueNameInEmail && (
                      <span className={styles.contactErrorText}>
                        {errors.venueNameInEmail.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LocalizationProvider>
      <CustomVenueModal
        isOpen={isCustomVenueModalOpen}
        onClose={() => setCustomVenueModalOpen(false)}
        setValue={(venue: string) => handleAddCustomVenue(venue)}
      />
    </>
  );
};

export default ProgramDetailsForm;
