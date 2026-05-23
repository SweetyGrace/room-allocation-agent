// Import necessary dependencies from React and Material-UI
import React, { useState, useEffect, useRef } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { filterDataItem } from "../HeaderSection";

/**
 * Interface for FilterSelect component props
 * @property {string} label - Display label for the select input
 * @property {filterDataItem[]} options - Array of available filter options
 * @property {string[]} value - Currently selected values
 * @property {Function} onChange - Callback function when selection changes
 * @property {boolean} multi - Enable multi-select functionality (default: false)
 */
interface FilterSelectProps {
  label: string;
  options: filterDataItem[];
  value: string[];
  onChange: (value: string[]) => void;
  multi?: boolean;
}

/**
 * FilterSelect Component
 * A customized Material-UI Select component with single/multi-select functionality
 */
const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  options,
  value,
  onChange,
  multi = false,
}) => {
  // Normalize value to always be an array
  const normalizedValue = Array.isArray(value) ? value : value ? [value] : [];
  
  // Local state to manage selected values
  const [localValue, setLocalValue] = useState<string[]>(normalizedValue);
  
  // Ref to track if selection has changed
  const selectionChangedRef = useRef(false);

  // Store first option name for special handling
  const firstOptionName = options.length > 0 ? options[0].name : "";

  // Sync local state with prop value changes
  useEffect(() => {
    setLocalValue(normalizedValue);
  }, [value]);

  /**
   * Handles change events on the select input
   * Manages both single and multi-select logic
   * @param event - Select change event
   */
  const handleChange = (event: SelectChangeEvent<typeof normalizedValue>) => {
    const selectedValue = event.target.value;
    selectionChangedRef.current = true;

    // Handle single select mode
    if (!multi) {
      setLocalValue(
        Array.isArray(selectedValue)
          ? [selectedValue[selectedValue.length - 1]]
          : [selectedValue]
      );
      return;
    }

    // Handle multi-select mode
    if (Array.isArray(selectedValue)) {
      const newlySelected = selectedValue.find(
        (item) => !localValue.includes(item)
      );
      const newlyDeselected = localValue.find(
        (item) => !selectedValue.includes(item)
      );

      // Reset to first option if all options are deselected
      if (
        selectedValue.length === 0 ||
        (newlyDeselected === firstOptionName && localValue.length === 1)
      ) {
        setLocalValue([firstOptionName]);
        return;
      }

      // Handle special cases for first option selection
      if (newlySelected === firstOptionName) {
        setLocalValue([firstOptionName]);
      } else if (newlySelected && localValue.includes(firstOptionName)) {
        const newSelection = selectedValue.filter(
          (item) => item !== firstOptionName
        );
        setLocalValue(newSelection);
      } else {
        setLocalValue(selectedValue);
      }
    } else {
      setLocalValue([selectedValue]);
    }
  };

  /**
   * Handles select menu close event
   * Triggers onChange callback if values have changed
   */
  const handleClose = () => {
    if (selectionChangedRef.current) {
      selectionChangedRef.current = false;
      if (JSON.stringify(localValue) !== JSON.stringify(normalizedValue)) {
        onChange(localValue);
      }
    }
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} size="small" variant="outlined">
      <Select
        multiple={multi}
        value={localValue}
        onChange={handleChange}
        onClose={handleClose}
        input={<OutlinedInput />}
        // Custom render function for selected values
        renderValue={(selected: string | string[]) => {
          if (Array.isArray(selected)) {
            if (selected.length === 0) return label;
            if (selected.length === 1)
              return selected[0].length > 15
                ? `${selected[0].slice(0, 15)}...`
                : selected[0];

            const combined = selected.join(", ");
            return combined.length > 15
              ? `${combined.slice(0, 15)}...`
              : combined;
          }
          return selected.length > 15
            ? `${selected.slice(0, 15)}...`
            : selected;
        }}
        // Custom styling for the select input
        sx={{
          height: "28px",
          width: "150px",
          backgroundColor: "#FFFFFF",
          fontSize: "12px",
          borderColor: "#ffffff",
          borderRadius: "999px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ffffff",
          },
        }}
        // Custom styling for the dropdown menu
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "8px",
              maxHeight: "200px",
              fontSize: "12px",
            },
          },
        }}
      >
        {/* Render menu items */}
        {options.map((option, index) => (
          <MenuItem key={index} value={option.name} sx={{ fontSize: "12px" }}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterSelect;
