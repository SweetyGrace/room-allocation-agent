
import { DateRange } from "rsuite/esm/DateRangePicker";

/**
 * Handle program date range change
 * @param value - Selected date range
 * @param setValue - React Hook Form setValue function
 * @param setDateRange - State setter for date range
 * @param onDateChange - Callback function for date change
 */
export const handleProgramDateRangeChange = (
  value: DateRange | null,
  setValue: (name: string, value: any) => void,
  setDateRange?: (value: [Date | null, Date | null]) => void,
  onDateChange?: (startDate: Date | null, endDate: Date | null) => void
) => {
  if (value && value.length === 2) {
    const [startDate, endDate] = value;

    // Update local state
    if (setDateRange) {
      setDateRange([startDate, endDate]);
    }

    // Update form values
    setValue("startDate", startDate);
    setValue("endDate", endDate);

    // Pass to parent component
    if (onDateChange) {
      onDateChange(startDate, endDate);
    }
  }
};

/**
 * Handle registration date range change
 * @param value - Selected date range
 * @param setValue - React Hook Form setValue function
 * @param setRegistrationDateRange - State setter for registration date range
 * @param onRegistrationDateChange - Callback function for registration date change
 */
export const handleRegistrationDateRangeChange = (
  value: DateRange | null,
  setValue: (name: string, value: any) => void,
  setRegistrationDateRange?: (value: [Date | null, Date | null]) => void,
  onRegistrationDateChange?: (regStartDate: Date | null, regEndDate: Date | null) => void
) => {
  if (value && value.length === 2) {
    const [regStartDate, regEndDate] = value;

    // Update local state
    if (setRegistrationDateRange) {
      setRegistrationDateRange([regStartDate, regEndDate]);
    }

    // Update form values
    setValue("registrationStartDate", regStartDate);
    setValue("registrationEndDate", regEndDate);

    // Pass to parent component
    if (onRegistrationDateChange) {
      onRegistrationDateChange(regStartDate, regEndDate);
    }
  }
};

/**
 * Clear program dates
 * @param setValue - React Hook Form setValue function
 * @param setDateRange - State setter for date range
 * @param onDateChange - Callback function for date change
 */
export const clearProgramDates = (
  setValue: (name: string, value: any) => void,
  setDateRange?: (value: [Date | null, Date | null]) => void,
  onDateChange?: (startDate: Date | null, endDate: Date | null) => void
) => {
  if (setDateRange) {
    setDateRange([null, null]);
  }
  setValue("startDate", null);
  setValue("endDate", null);
  if (onDateChange) {
    onDateChange(null, null);
  }
};

/**
 * Clear registration dates
 * @param setValue - React Hook Form setValue function
 * @param setRegistrationDateRange - State setter for registration date range
 * @param onRegistrationDateChange - Callback function for registration date change
 */
export const clearRegistrationDates = (
  setValue: (name: string, value: any) => void,
  setRegistrationDateRange?: (value: [Date | null, Date | null]) => void,
  onRegistrationDateChange?: (regStartDate: Date | null, regEndDate: Date | null) => void
) => {
  if (setRegistrationDateRange) {
    setRegistrationDateRange([null, null]);
  }
  setValue("registrationStartDate", null);
  setValue("registrationEndDate", null);
  if (onRegistrationDateChange) {
    onRegistrationDateChange(null, null);
  }
};

/**
 * Get program date range value for display
 * @param watch - React Hook Form watch function
 * @param dateRange - Date range prop
 * @returns Formatted date range or null
 */
export const getProgramDateRangeValue = (
  watch: (name: string) => any,
  dateRange?: [Date | null, Date | null] | null
): DateRange | null => {
  // First check the form values
  const formStartDate = watch("startDate");
  const formEndDate = watch("endDate");

  if (formStartDate && formEndDate) {
    return [new Date(formStartDate), new Date(formEndDate)];
  }

  // Fallback to dateRange prop
  if (dateRange && dateRange[0] && dateRange[1]) {
    return [new Date(dateRange[0]), new Date(dateRange[1])];
  }

  return null;
};

/**
 * Get registration date range value for display
 * @param watch - React Hook Form watch function
 * @param registrationDateRange - Registration date range prop
 * @returns Formatted date range or null
 */
export const getRegistrationDateRangeValue = (
  watch: (name: string) => any,
  registrationDateRange?: [Date | null, Date | null] | null
): DateRange | null => {
  // First check the form values
  const formRegStartDate = watch("registrationStartDate");
  const formRegEndDate = watch("registrationEndDate");

  if (formRegStartDate && formRegEndDate) {
    return [new Date(formRegStartDate), new Date(formRegEndDate)];
  }

  // Fallback to registrationDateRange prop
  if (
    registrationDateRange &&
    registrationDateRange[0] &&
    registrationDateRange[1]
  ) {
    return [
      new Date(registrationDateRange[0]),
      new Date(registrationDateRange[1]),
    ];
  }

  return null;
};

/**
 * Handle venue selection change
 * @param value - Selected venue value
 * @param setValue - React Hook Form setValue function
 * @param setCustomVenueModalOpen - State setter for custom venue modal
 * @param customVenueLabel - Label for custom venue option
 */
export const handleVenueSelectionChange = (
  value: string,
  setValue: (name: string, value: any) => void,
  setCustomVenueModalOpen: (open: boolean) => void,
  customVenueLabel: string
) => {
  if (value === customVenueLabel) {
    setCustomVenueModalOpen(true);
  } else {
    setValue("venueAddress", [value]);
  }
};

/**
 * Handle adding custom venue
 * @param venue - Custom venue value
 * @param setValue - React Hook Form setValue function
 * @param setCustomVenueModalOpen - State setter for custom venue modal
 */
export const handleAddCustomVenue = (
  venue: string,
  setValue: (name: string, value: any) => void,
  setCustomVenueModalOpen: (open: boolean) => void
) => {
  setValue("venueAddress", [venue]);
  setCustomVenueModalOpen(false);
};
