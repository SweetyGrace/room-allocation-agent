import React, { useEffect, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Box } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "../../styles/variables.scss";
import datePickerIcon from "../../../assets/images/date-picker.png";

type CustomDatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date | null) => void;
  error?: boolean;
  errorMessage?: string | null;
  maxDate?: Date;
  futureDate: boolean;
  errorExist?: boolean;
  dobDate?: boolean;
  readOnly?: boolean;
  startDate?: Date;
  iconStyles?: React.CSSProperties;
  disabled?: boolean;
  className?: string;
  height?: string;
};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  error = false,
  errorMessage = null,
  maxDate,
  futureDate,
  startDate,
  errorExist,
  dobDate,
  readOnly,
  iconStyles,
  disabled,
  className,
  height,
}) => {
  const [dateValue, setDateValue] = useState<Date | null>(value || null);

  //To prefill the date value
  useEffect(() => {
    setDateValue(value || null);
  }, [value]);

  /**
   * @description Handle date change will be called once the date is selected
   * @param date
   */
  const handleDateChange = (date: Date | null) => {
    if (date) {
      const isValidDate = !isNaN(date.getTime());
      if (isValidDate) {
        onChange(new Date(date));
      } else {
        onChange(date);
      }
    } else {
      onChange(null);
    }
    setDateValue(date);
  };

  /**
   * @description Calculate the min date based on the max date
   */

  const calculatedMinDate = maxDate
    ? new Date(
        maxDate.getFullYear() - 100,
        maxDate.getMonth(),
        maxDate.getDate(),
      )
    : new Date();

  return (
    <Box
      className={`${className || ""} custom-datepicker`}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          localeText={{
            fieldMonthPlaceholder: () => "MMM",
          }}
          value={dateValue}
          onChange={handleDateChange}
          minDate={
            dobDate ? calculatedMinDate : startDate ? startDate : undefined
          }
          maxDate={futureDate ? maxDate || new Date() : undefined}
          format="dd MMM yyyy"
          sx={{
            width: "100%",
            fieldset: {
              border: "1px solid #cacaca",
              borderColor: errorExist ? "#E28619" : "#cacaca;",
              borderRadius: "5px",
              color: "#051B46",
              fontSize: 26,
            },
            "&:hover": {
              fieldset: {
                borderColor: readOnly ? "#8A8A8A" : "#1859B4 !important",
              },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: readOnly ? "#8A8A8A" : "#1859B4",
              },
            },
            "&:focus-within": {
              fieldset: {
                borderColor: readOnly ? "#8A8A8A" : "#1859B4 !important",
              },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: readOnly ? "#8A8A8A" : "#1859B4 !important",
              },
            },
            "& input::placeholder": {
              fontSize: 16,
            },
            "& .MuiInputBase-input": {
              color: "#051b46",
              fontSize: 16,
              textAlign: "left",
              fontWeight: 400,
              cursor: readOnly ? "not-allowed" : "default",
            },
            input: {
              fontSize: 16,
              textAlign: "left",
              fontWeight: 400,
            },
            "& .MuiInputBase-root": {
              backgroundColor: readOnly ? "#f6f6f6" : "#fff",
              height: 40,
              gap: "8px",
              flexDirection: "row",
              width: "100%",
              cursor: readOnly ? "not-allowed" : "default",
              ...(className && { className }),
              ...(className && {
                backgroundColor: undefined,
                height: height,
              }),
            },
          }}
          slotProps={{
            textField: {
              autoFocus: false,
              error: !!error,
              helperText: errorMessage || null,
            },
            openPickerIcon: {
              component: () => (
                <img
                  width="24px"
                  height="24px"
                  src={datePickerIcon}
                  alt="DatePickerIcon"
                  style={iconStyles}
                  loading="lazy"
                />
              ),
            },
          }}
          readOnly={readOnly}
          disabled={disabled}
          className={className}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CustomDatePicker;
