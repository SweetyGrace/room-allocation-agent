import React, { useState } from "react";
import Select, { components, StylesConfig } from "react-select";
import { Controller, useFormContext } from "react-hook-form";
import styles from "./index.module.scss";

interface DropdownWithInputProps {
  name: string;
  label: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  onValueChange?: (value: string | string[]) => void;
  filterFunction?: (inputValue: string) => void;
  error?: string;
  otherError?: string;
  showOtherField?: boolean;
  value?: string | string[];
  className?: string;
  height?: string;
  width?: string;
  isMulti?: boolean;
}

const DropdownTextfield: React.FC<DropdownWithInputProps> = ({
  name,
  label,
  options,
  placeholder = "",
  onValueChange,
  filterFunction,
  error,
  value,
  className,
  height,
  width,
  isMulti = false,
}) => {
  const { control } = useFormContext();
  const [inputValue, setInputValue] = useState("");
  const customStyles: StylesConfig<unknown, false> = {
    control: (provided, state) => ({
      ...provided,
      border: "none",
      borderRadius: "8px",
      boxShadow: state.isFocused ? "0 0 0 0px gray" : provided.boxShadow,
      "&:hover": {
        boxShadow: state.isFocused ? "0 0 0 0px gray" : provided.boxShadow,
      },
      height: className || height ? height : provided.height,
      backgroundColor: className || height ? "unset" : provided.backgroundColor,
      minHeight: height ? "unset" : provided.minHeight,
      width: width ? width : provided.width,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#051B46", // Text color for selected option
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      display: "none",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      padding: "0 9px",
    }),
  };

  // Filter options and add "Other" if no matches exist
  const filteredOptions = inputValue
    ? options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : options;

  if (filteredOptions.length === 0) {
    filteredOptions.push({ value: "Other", label: "Other" });
  }

  return (
    <div className={styles.muiInputField}>
      <div className={styles.fieldLabels}>{label}</div>
      <div
        className={`${className && !width ? styles.dropdownInputFromEmail : styles.dropdownInput} ${
          error ? styles.errorInput : ""
        }`}
      >
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <>
              <Select
                {...field}
                options={filteredOptions}
                value={
                  isMulti
                    ? options.filter(option => 
                        Array.isArray(value || field.value) && 
                        (value || field.value)?.includes(option.value)
                      )
                    : options.find(option => option.value === (value || field.value))
                }
                filterOption={() => true}
                components={{ DropdownIndicator: components.DropdownIndicator }}
                placeholder={placeholder}
                styles={customStyles}
                className={className ? styles.customControl : ""}
                onChange={(selectedOptions) => {
                  if (isMulti) {
                    const newValues = selectedOptions 
                      ? (selectedOptions as { value: string; label: string }[]).map(opt => opt.value)
                      : [];
                    field.onChange(newValues);
                    if (onValueChange) onValueChange(newValues);
                    
                    // Handle Other option
                    if (newValues.includes("Other")) {
                      setInputValue("Other");
                    }
                  } else {
                    const newValue = (selectedOptions as { value: string })?.value;
                    field.onChange(newValue);
                    if (onValueChange) onValueChange(newValue);
                    if (newValue === "Other") {
                      setInputValue("Other");
                    }
                  }
                }}
                isMulti={isMulti}
                onInputChange={(value) => {
                  setInputValue(value);
                  if (filterFunction) filterFunction(value);
                }}
              />
            </>
          )}
        />
      </div>
      {error && <i className={styles.error}>{error}</i>}
    </div>
  );
};

export default DropdownTextfield;
