// components/CustomDropDown.tsx
import React from "react";
import { Select, MenuItem } from "@mui/material";

interface OptionMap {
  option: {
    id: string | number;
    name: string;
  };
}

interface CustomDropDownProps {
  value: string;
  question: {
    id: number;
    label: string;
    questionOptionMaps: OptionMap[];
  };
  handleFieldChange: (id: string | number, value: string) => void;
  inputClasses?: string;
  onBlur: () => void;
  disabled?: boolean;
}

const CustomDropDown: React.FC<CustomDropDownProps> = ({
  value,
  question,
  handleFieldChange,
  inputClasses = "",
  onBlur,
  disabled,
}) => {
  return (
    <Select
      onBlur={onBlur}
      className={inputClasses}
      id={`select-${question.id}`}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        if (!disabled) {
          handleFieldChange(String(question.id), e.target.value as string);
        }
      }}
      displayEmpty
      renderValue={(selected) => {
        if (!selected) {
          return (
            <span style={{ 
              color: disabled ? "var(--gray-400)" : "var(--gray-700)" 
            }}>
              Select {question.label}
            </span>
          );
        }
        // Find the option name by id
        const selectedOption = question.questionOptionMaps.find(
          (optionMap) => String(optionMap.option.id) === String(selected),
        );
        return selectedOption ? selectedOption.option.name : "";
      }}
      sx={{
        width: "100%",  
        height: 38,
        padding: "0 0.75rem",
        border: "0.5px solid var(--gray-10)",
        borderRadius: "var(--border-radius-md)",
        fontSize: "14px",
        fontWeight: 400,
        color: disabled ? "var(--gray-400)" : "#051B46",
        transition: "var(--transition)",
        backgroundColor: disabled ? "var(--gray-50)" : "White",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        "&:hover": {
           backgroundColor: disabled ? "var(--gray-50)" : "transparent !important",
           border: "0.5px solid var(--gray-10)",
        },
        "&:focus": {
          outline: "none",
          borderColor: "var(--primary-blue)",
          boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
        },
        ".MuiSelect-select": {
          paddingTop: 6,
          paddingBottom: 6,
          paddingLeft: 0,
          lineHeight: 1.2,
          display: "flex",
          alignItems: "center",
        },
        ".MuiOutlinedInput-notchedOutline": {
          borderColor: "var(--gray-300)",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: disabled ? "" : "var(--gray-300)",
        },
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            maxHeight: 200,
            borderRadius: "var(--border-radius-md)",
            "& .MuiMenuItem-root:hover": {
              backgroundColor: "var(--gray-300)",
            },
            "& .Mui-selected": {
              backgroundColor: "var(--gray-300)",
            },
          },
        },
      }}
    >
      
      {question.questionOptionMaps.map((optionMap) => (
        <MenuItem key={optionMap.option.id} value={optionMap.option.id}>
          {optionMap.option.name}
        </MenuItem>
      ))}
    </Select>
  );
};

export default CustomDropDown;
