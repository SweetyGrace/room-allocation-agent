import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DesktopTimePicker } from "@mui/x-date-pickers/DesktopTimePicker";
import { ReactComponent as ClockIcon } from "../../../assets/images/clock.svg";
import {
  UI_COLORS,
  UI_DIMENSIONS,
  DATE_TIME_FORMATS
} from "../../../constants/textConstants";
interface CustomTimePickerProps {
  value: Date;
  onChange: (date: Date | null) => void;
  readOnly?: boolean;
  errorExist?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  dataTestid?: string;
  diffStyle?: boolean; // Optional prop to apply different styles
  noWidthStyle?: boolean; // Optional prop to apply different styles
  minTime?: Date | null;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  readOnly = false,
  errorExist,
  onKeyDown,
  dataTestid,
  diffStyle,
  noWidthStyle,
  minTime,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DesktopTimePicker
        value={value}
        onChange={(e) => onChange(e)}
        ampm={true}
        format={DATE_TIME_FORMATS.TIME_12_HOUR}
        slots={{
          openPickerIcon: (props) => (
            <ClockIcon {...props} data-testid="clock-icon" />
          ), // Icon for the open picker button with data-testid
        }}
        sx={{
          fieldset: {
            borderColor: errorExist ? UI_COLORS.WARNING : UI_COLORS.BORDER_DEFAULT,
            borderTopWidth: 1,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderLeftWidth: 1,
            borderRadius: diffStyle? UI_DIMENSIONS.BORDER_RADIUS.STANDARD : UI_DIMENSIONS.BORDER_RADIUS.RIGHT_ONLY,
            borderLeft: diffStyle? "":"none",
          },
          "&:hover": {
            fieldset: {
              borderColor: readOnly ? UI_COLORS.BORDER_HOVER : `${UI_COLORS.SECONDARY} !important`,
            },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: readOnly ? UI_COLORS.BORDER_HOVER : UI_COLORS.SECONDARY,
            },
          },
          "&:focus-within": {
            fieldset: { borderColor: UI_COLORS.BORDER_HOVER },
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: readOnly ? UI_COLORS.BORDER_HOVER : UI_COLORS.SECONDARY,
            },
          },
          "& input::placeholder": {
            textColor: UI_COLORS.BLACK,
            fontSize: UI_DIMENSIONS.FONT_SIZE.SMALL,
          },
          "& .MuiInputBase-input": {
            color: UI_COLORS.BLACK,
            fontSize: UI_DIMENSIONS.FONT_SIZE.SMALL,
            textAlign: "left",
            fontWeight: 400,
            padding: "8px",
            borderRight: `1px solid ${UI_COLORS.BORDER_DEFAULT}`,
          },
          "& .MuiInputBase-root": {
            backgroundColor: readOnly ? UI_COLORS.BACKGROUND_DISABLED : UI_COLORS.WHITE,
            height: UI_DIMENSIONS.HEIGHT.INPUT,
            width: noWidthStyle ? "auto" : diffStyle ? UI_DIMENSIONS.WIDTH.FULL : UI_DIMENSIONS.WIDTH.INPUT_MEDIUM,
            // gap: "8px",
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
            error: false,
            onKeyDown,
          },
          openPickerButton: {
            "data-testid": `${dataTestid}-timer-icon`, 
          },
          layout: {
            sx: {
              ul: {
                "::-webkit-scrollbar": {
                  width: UI_DIMENSIONS.SCROLLBAR.WIDTH,
                },
                "::-webkit-scrollbar-track": {
                  background: "unset !important",
                },
                "::-webkit-scrollbar-thumb": {
                  background: UI_COLORS.SCROLLBAR_THUMB,
                  borderRadius: UI_DIMENSIONS.SCROLLBAR.BORDER_RADIUS,
                },
                "::-webkit-scrollbar-thumb:hover": {
                  background: UI_COLORS.SCROLLBAR_THUMB_HOVER,
                },
              },
            },
          },
        }}
        readOnly={readOnly}
        minTime={minTime ?? undefined}
        data-testid="desktop-time-picker"
      />
    </LocalizationProvider>
  );
};

export default CustomTimePicker;
