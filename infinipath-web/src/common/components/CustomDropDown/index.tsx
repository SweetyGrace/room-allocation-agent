
import React from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import styles from "./index.module.scss";

interface CustomDropDownOption {
  value: string;
  label: string;
  disabled?: boolean; 
}

interface CustomDropDownProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomDropDownOption[];
  placeholder?: string;
  width?: number | string;
  height?: number | string;
  error?: boolean;
  className?: string;
  name?: string;
  menuwidth?: number;
  menuHeight?: number | string;
  menuTop?: number | string;
  menuSx?: object;
  isCustomed?: boolean; 
  customColor?: string;
  disabled?: boolean; 
}

const CustomDropDown: React.FC<CustomDropDownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  width = "100%", // Default to 100% for responsiveness
  height = 40,
  error = false,
  className = "",
  menuHeight = "auto",
  menuTop,
  menuSx = {},
  isCustomed = false, 
  customColor,
  disabled = false,
}) => (
  <Select
    className={className}
    value={value}
    onChange={(e) =>{ onChange(e?.target?.value as string)}}
    displayEmpty
    disabled={disabled}
    renderValue={(selected) =>
      selected ? (
        options.find((opt) => opt.value === selected)?.label || ""
      ) : (
        <span className={styles.placeholder}>{placeholder}</span>
      )
    }
    sx={{
     
      fontSize: '14px',
      color: "#051B46",
      minHeight: height,
      height: height,
      width: width,
      maxWidth: "100%", // Responsive: never exceed parent width
      borderRadius: "10px",
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%23666'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpolyline%20points='6,9%2012,15%2018,9'%3E%3C/polyline%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      backgroundSize: "16px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      appearance: "none",
      backgroundColor: "white",
      border: error ? "1px solid #e28619" : "1px solid #e0e0e0",
      padding: "5px",
      transition: "border-color 0.2s",
      boxShadow: "none",
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none !important",
      },
      "&.MuiOutlinedInput-root": {
        borderRadius: "10px",
        paddingRight: "0 !important",
      },
      "& .MuiSelect-select": {
      
        padding: "6px 2px",
        minHeight: height,
        height: height,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        borderRadius: "10px",
        backgroundColor: customColor ? customColor : "white !important",
      },
      "&.Mui-focused": {
        border: error ? "1px solid #e28619" : "1px solid #4285f4",
        boxShadow: "none",
      },
      "&.Mui-selected:hover": {
        backgroundColor: "white !important",
      },
      "&:hover": {
        backgroundColor: "transparent !important",
        border: error ? "1px solid #e28619" : "1px solid #4285f4",
      },
 
      "@media (max-width: 600px)": {
        width: "100%",
        minWidth: "0",
        fontSize: "14px",
      },
    }}
    MenuProps={{
      PaperProps: {
        sx:{
          fontSize: '14px',
          color: "#051B46",
          padding: '10px',
          marginTop: '6px',
          width: "auto !important",
          minWidth: typeof width === "number" ? `${width}px !important` : `${width} !important`,
          maxWidth: typeof width === "number" ? `${width}px !important` : `${width} !important`,
          minHeight: "auto",
          maxHeight: menuHeight,
          borderRadius: '10px',
          paddingTop: '6px',
          paddingLeft: '6px',
          paddingRight: '6px',
          paddingBottom: '11px',
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px #0000001a",
          ...menuSx,
        },
      },
      MenuListProps: {
        style: {
          padding: 0,
        },
      },
    }}
  >
    {options.map((option) => (
      <MenuItem
        key={option.value}
        value={option.value}
        disabled={option.disabled} 
        sx={{
            
          padding: "8px",
          minHeight: "20px",
          width: "100%",
          maxWidth: "100%",
          display: "block",
          backgroundColor: "white",
          fontSize: "14px",
          color: option.disabled ? "#9ca3af !important" : "#051B46", // Grey color for disabled
          opacity: option.disabled ? 0.6 : 1, // Reduce opacity for disabled
          "&:hover": {
            backgroundColor: option.disabled ? "white !important" : "#f4f8fb !important",
          },
          "&.Mui-selected": {
            backgroundColor: "#f4f8fb !important",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#f4f8fb !important",
          },
          "&.Mui-focusVisible": {
            backgroundColor: "transparent !important",
          },
          "&.Mui-disabled": {
            opacity: "0.6 !important",
            color: "#9ca3af !important",
            pointerEvents: "none",
          },
        }}
      >
        <span tabIndex={0} title={option.label}>
          {option.label}
        </span>
      </MenuItem>
    ))}
  </Select>
);

export default CustomDropDown;

