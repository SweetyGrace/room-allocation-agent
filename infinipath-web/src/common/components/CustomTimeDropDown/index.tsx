import React from "react";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { ReactComponent as ClockIcon } from "../../../assets/images/drop-down-light.svg";

// Define the interface for the props
interface CustomTimeDropdownProps {
  initialDuration?: number; // Initial duration in minutes (optional)
  onDurationSelect: (selectedDuration: number | null) => void; // Callback for duration selection
  readOnly?: boolean; // Indicates if the dropdown should be read-only
  errorExist?: boolean; // Indicates if an error exists
  dataTestId?: string; // Test ID for testing purposes
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CustomTimeDropdown: React.FC<CustomTimeDropdownProps> = ({
  initialDuration,
  onDurationSelect,
  readOnly = false,
  errorExist = false,
  dataTestId,
  onKeyDown,
}) => {
  // Initialize value as null by default to show the placeholder
  const [value, setValue] = React.useState<Dayjs | null>(() => {
    if (initialDuration === undefined || initialDuration === null || initialDuration === 0) {
      return null;
    }
    
    const hours = Math.floor(initialDuration / 60);
    const minutes = initialDuration % 60;
    
    // If both hours and minutes are 0, set to null to show the placeholder
    if (hours === 0 && minutes === 0) {
      return null;
    }
    
    return dayjs().hour(hours).minute(minutes);
  });

  // Handle time change
  const handleTimeChange = (newValue: Dayjs | null) => {
    if (readOnly) return;
    
    if (!newValue) {
      setValue(null);
      onDurationSelect(null);
      return;
    }
    
    // Only prevent selection of exactly 00:00, allow times like 00:01, 00:02, etc.
    if (newValue.hour() === 0 && newValue.minute() === 0) {
      setValue(null);
      onDurationSelect(null);
    } else {
      setValue(newValue);
      const totalDuration = newValue.hour() * 60 + newValue.minute();
      onDurationSelect(totalDuration);
    }
  };

  // Function to determine if a time should be disabled - only 00:00 is disabled
  const shouldDisableTime = (value: Dayjs, view: 'hours' | 'minutes' | 'seconds') => {
    if (view === 'hours') {
      return false; // Allow all hours, including 00
    }
    if (view === 'minutes' && value.hour() === 0) {
      return value.minute() === 0; // Only disable 00 minutes when hour is 00
    }
    return false;
  };

  // Handle keyboard input to accept 00 hours
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return (
    <div className={`time-dropdown-container ${errorExist ? "error" : ""}`}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TimePicker
          value={value}
          onChange={handleTimeChange}
          slots={{
            openPickerIcon: (props) => (
              <ClockIcon {...props} data-testid="clock-icon" />
            ),
          }}
          views={['hours', 'minutes']}
          format="HH:mm" 
          ampm={false} // Ensure 24-hour format without AM/PM
          timeSteps={{ minutes: 1 }}
          shouldDisableTime={shouldDisableTime}
          sx={{
            fieldset: {
              borderColor: errorExist ? "#E28619" : "#C9C9C9",
              borderTopWidth: 1,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderLeftWidth: 1,
              borderRadius: "8px",
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
              fieldset: { borderColor: "#8A8A8A" },
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: readOnly ? "#8A8A8A" : "#1859B4",
              },
            },
            "& input::placeholder": {
              textColor: "#051b46",
              fontSize: 16,
            },
            "& .MuiInputBase-input": {
              color: "#051b46", // Text color for the input field
              fontSize: 16,
              textAlign: "left",
              fontWeight: 400,
              padding: "8px",
            },
            "& .MuiInputBase-root": {
              backgroundColor: readOnly ? "#f6f6f6" : "#fff",
              height: 40,
              width: 200,
              flexDirection: { flexDirection: "row" },
            },
            "& .MuiInputAdornment-root": {
              marginLeft: "0px",
            },
          }}
          slotProps={{
            textField: {
              size: "medium",
              fullWidth: true,
              required: false,
              autoFocus: false,
              onKeyDown: handleKeyDown,
              InputProps: {
                readOnly: readOnly,
                placeholder: "hh:mm",
              },
              inputProps: {
                placeholder: "hh:mm", // Add placeholder to the inner input as well
              }
            },
            openPickerButton: {
              "aria-label": `${dataTestId}-duration-icon`,
            },
            layout: {
              sx: {
                ul: {
                  "::-webkit-scrollbar": {
                    width: "4px", // Adjust the width of the scrollbar
                  },
                  "::-webkit-scrollbar-track": {
                    background: "unset !important", // Background of the scrollbar track
                  },
                  "::-webkit-scrollbar-thumb": {
                    background: "#D9D9D9", // Color of the scrollbar thumb
                    borderRadius: "10px", // Rounded corners for the scrollbar thumb
                  },
                  "::-webkit-scrollbar-thumb:hover": {
                    background: "#555", // Color of the scrollbar thumb on hover
                  },
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export default CustomTimeDropdown;