import React from "react";
import {
  DateRangePicker,
  DateValidationError,
  LocalizationProvider,
  SingleInputDateRangeField
} from "@mui/x-date-pickers-pro";
import { Box } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ReactComponent as CalendarIcon } from "../../../assets/images/calendar.svg";
import { DateRange } from "@mui/x-date-pickers-pro/DateRangePicker";

type CustomDateRangePickerProps = {
  value: DateRange<Date>;
  onChange: (value: DateRange<Date>) => void;
  error?: boolean;
  errorMessage?: string | null;
  maxDate?: Date;
  futureDate?: boolean;
  startDate?: Date;
  errorExist?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  styleChange?: boolean;
  borderRight?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  dataTestId?: string;
};

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  value,
  onChange,
  error = false,
  maxDate,
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
  const handleError = (error: DateValidationError, value: DateRange<Date> | null) => {
    console.error("Date range picker error:", error, value);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
      }}
      data-testid="date-range-picker-box"
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateRangePicker
          value={value}
          onChange={onChange}
          onError={handleError}
          minDate={startDate}
          maxDate={futureDate ? maxDate : undefined}
          format="dd MMM yyyy"
          slots={{
            field: SingleInputDateRangeField,
            openPickerIcon: (props) => (
              <CalendarIcon {...props} data-testid="calendar-icon" />
            ),
          }}
          sx={{
            width: "100%",
            fieldset: {
              border: "1px solid #8A8A8A",
              borderColor: errorExist ? "#E28619 !important" : "#C9C9C9",
              borderRadius: styleChange ? "8px" : "8px 0px 0px 8px",
              borderRight: borderRight && errorExist ? "1px solid #C9C9C9 !important" : "",
            },
            "&:hover": {
              fieldset: {
                borderColor: readOnly ? "#8A8A8A" : "#1859B4 !important",
              },
            },
            "& .MuiInputBase-input": {
              color: "#051b46",
              fontSize: 16,
              textAlign: "left",
              fontWeight: 400,
              padding: "8px",
              cursor: readOnly ? "not-allowed" : "default",
            },
            "& .MuiInputBase-root": {
              backgroundColor: readOnly ? "#f6f6f6" : "#fff",
              height: 40,
              flexDirection: "row",
              width: "100%",
            },
          }}
          slotProps={{
            textField: {
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
          }}
          readOnly={readOnly}
          disabled={disabled}
          className={className}
          data-testid="date-range-picker-input"
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CustomDateRangePicker;