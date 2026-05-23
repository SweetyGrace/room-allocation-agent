import React from "react";
import {
  DatePicker,
  DateValidationError,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { Box } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "../../styles/variables.scss";
import { ReactComponent as CalendarIcon } from "../../../assets/images/calendar.svg";
import {
  UI_COLORS,
  UI_DIMENSIONS,
  DATE_TIME_FORMATS,
  COMPONENT_ERRORS
} from "../../../constants/textConstants";

type CustomDatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date | null) => void;
  error?: boolean;
  errorMessage?: string | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  futureDate: boolean;
  fixedDate?: boolean;
  errorExist?: boolean;
  readOnly?: boolean;
  startDate?: Date;
  iconStyles?: React.CSSProperties;
  disabled?: boolean;
  className?: string;
  styleChange?: boolean;
  borderRight?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  dataTestId?: string;
};

const getDate = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  error = false,
  maxDate,
  minDate,
  futureDate,
  startDate,
  errorExist,
  readOnly,
  disabled,
  className,
  styleChange,
  borderRight,
  onKeyDown,
  dataTestId,
}) => {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const isValidDate = !isNaN(date.getTime());
      if (isValidDate) {
        const formattedDate = getDate(date).toISOString().split("T")[0];
        onChange(new Date(formattedDate));
      } else {
        onChange(date);
      }
    } else {
      onChange(null);
    }
  };

  const handleError = (error: DateValidationError, value: Date | null) => {
    console.error(COMPONENT_ERRORS.DATE_PICKER_ERROR, error, value);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
      }}
      data-testid="date-picker-box"
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          localeText={{
            fieldMonthPlaceholder: () => DATE_TIME_FORMATS.MONTH_PLACEHOLDER,
          }}
          value={value}
          onChange={handleDateChange}
          onError={handleError}
          minDate={minDate ? minDate : startDate ? startDate : undefined}
          maxDate={maxDate ? maxDate : undefined}
          disablePast={futureDate}
          shouldDisableDate={(date) => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            console.log(COMPONENT_ERRORS.CHECKING_DATE, maxDate, minDate);
            if (minDate) {
              const min = new Date(minDate);
              min.setHours(0, 0, 0, 0);
              if (d < min) return true;
            }
            if (maxDate) {
              const max = new Date(maxDate);
              max.setHours(0, 0, 0, 0);
              if (d > max) return true;
            }
            return false;
          }}
          format={DATE_TIME_FORMATS.DATE_DISPLAY}
          slots={{
            openPickerIcon: (props) => (
              <CalendarIcon {...props} data-testid="calendar-icon" />
            ),
          }}
          sx={{
            width: UI_DIMENSIONS.WIDTH.FULL,
            fieldset: {
              border: `1px solid ${UI_COLORS.BORDER_HOVER}`,
              borderColor: errorExist ? `${UI_COLORS.WARNING} !important` : UI_COLORS.BORDER_DEFAULT,
              borderRadius: styleChange ? UI_DIMENSIONS.BORDER_RADIUS.STANDARD : UI_DIMENSIONS.BORDER_RADIUS.LEFT_ONLY,
              borderRight:
                borderRight && errorExist ? `1px solid ${UI_COLORS.BORDER_DEFAULT} !important` : "",
              color: UI_COLORS.PRIMARY,
              fontSize: UI_DIMENSIONS.FONT_SIZE.MEDIUM,
            },
            "&:hover": {
              fieldset: {
                borderColor: readOnly ? UI_COLORS.BORDER_HOVER : `${UI_COLORS.SECONDARY} !important`,
              },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: readOnly ? UI_COLORS.BORDER_HOVER : UI_COLORS.SECONDARY,
                borderRight:
                  borderRight && errorExist
                    ? `1px solid ${UI_COLORS.BORDER_DEFAULT} !important`
                    : "",
              },
            },
            "&:focus-within": {
              fieldset: {
                borderColor: readOnly ? UI_COLORS.BORDER_HOVER : `${UI_COLORS.SECONDARY} !important`,
              },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: readOnly ? UI_COLORS.BORDER_HOVER : `${UI_COLORS.SECONDARY} !important`,
              },
            },
            "& input::placeholder": {
              fontSize: UI_DIMENSIONS.FONT_SIZE.SMALL,
            },
            "& .MuiInputBase-input": {
              color: UI_COLORS.BLACK,
              fontSize: UI_DIMENSIONS.FONT_SIZE.SMALL,
              textAlign: "left",
              fontWeight: 400,
              padding: "8px",
              borderRight: `1px solid ${UI_COLORS.BORDER_DEFAULT}`,
              cursor: readOnly ? "not-allowed" : "default",
            },
            input: {
              fontSize: UI_DIMENSIONS.FONT_SIZE.SMALL,
              textAlign: "left",
              fontWeight: 400,
            },
            "& .MuiInputBase-root": {
              backgroundColor: readOnly ? UI_COLORS.BACKGROUND_DISABLED : UI_COLORS.WHITE,
              height: UI_DIMENSIONS.HEIGHT.INPUT,
              flexDirection: "row",
              width: UI_DIMENSIONS.WIDTH.FULL,
              cursor: readOnly ? "not-allowed" : "default",
            },
            "& .MuiInputAdornment-root ": {
              marginLeft: "0px !important",
            },
          }}
          slotProps={{
            textField: {
              autoFocus: false,
              error: !!error,
              onKeyDown,
            },
            openPickerButton: {
              "data-testid": `${dataTestId}-calendar-icon`,
            },
            previousIconButton: {
              "data-testid": `${dataTestId}-prev-button`,
            },
            nextIconButton: {
              "data-testid": `${dataTestId}-next-button`,
            },
            toolbar: {
              'data-testid': 'datepicker-toolbar',
            },
            switchViewButton: {
              'data-testid': 'month-year-dropdown',
            },
          }}
          readOnly={readOnly}
          disabled={disabled}
          className={className}
          data-testid="date-picker-input"
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CustomDatePicker;
