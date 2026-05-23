import React, { useState, useEffect, useRef } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { filterDataItem } from "../HeaderSection";

interface FilterSelectProps {
  label: string;
  options: filterDataItem[];
  value: string[];
  onChange: (value: string[]) => void;
  multi?: boolean;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  options,
  value,
  onChange,
  multi = false,
}) => {
  const normalizedValue = Array.isArray(value) ? value : value ? [value] : [];
  const [localValue, setLocalValue] = useState<string[]>(normalizedValue);
  const selectionChangedRef = useRef(false);

  const firstOptionName = options.length > 0 ? options[0].name : "";

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

    if (!multi) {
      setLocalValue(
        Array.isArray(selectedValue)
          ? [selectedValue[selectedValue.length - 1]]
          : [selectedValue]
      );
      return;
    }

    if (Array.isArray(selectedValue)) {
      const newlySelected = selectedValue.find(
        (item) => !localValue.includes(item)
      );
      const newlyDeselected = localValue.find(
        (item) => !selectedValue.includes(item)
      );

      if (
        selectedValue.length === 0 ||
        (newlyDeselected === firstOptionName && localValue.length === 1)
      ) {
        setLocalValue([firstOptionName]);
        return;
      }

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
