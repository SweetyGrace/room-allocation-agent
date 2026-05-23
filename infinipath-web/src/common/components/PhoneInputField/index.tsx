// PhoneInputField.tsx
import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "./index.module.scss";
import { CountryCode, getCountryCallingCode } from "libphonenumber-js";
interface PhoneInputFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any; // Correct type from react-hook-form
  name: string;
  defaultValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules?: any; // Correct type from react-hook-form
  className?: string;
  placeholder?: string;
  errorExist?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBlur?: any;
  phoneBlur?: () => void;
  disabled: boolean;
}
let countryCode = "91";
let defaultCountryCode: CountryCode | undefined = "IN";

const PhoneInputField = forwardRef((props: PhoneInputFieldProps, ref) => {
  const {
    control,
    name,
    defaultValue = "",
    rules,
    className,
    errorExist,
    placeholder = "Enter phone number",
    onBlur,
    phoneBlur,
    disabled,
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Prevent backspace and delete if cursor is at the beginning (right after the country code)
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const countryCodeLength = countryCode.length + 2 || 3; // Assumes a space follows the country code
    if (
      (event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === " ") &&
      cursorPosition <= countryCodeLength
    ) {
      event.preventDefault();
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCountry = (country: any) => {
    if (country.toString().length > 0) {
      countryCode = getCountryCallingCode(country);
      defaultCountryCode = country;
    }
  };

  return (
    <div className={styles.Container}>
      <div
        className={`${styles.phoneInputContainer} ${
          errorExist ? styles.errorInput : ""
        }`}
      >
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          rules={rules}
          render={({
            field: { onChange, onBlur: fieldOnBlur, value },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            fieldState: { error },
          }) => (
            <div className={className}>
              <PhoneInput
                international
                defaultCountry={defaultCountryCode}
                placeholder={placeholder}
                className={
                  disabled
                    ? `${styles.phoneInput} ${styles.phoneInputDisabled}`
                    : `${styles.phoneInput}`
                }
                countryCallingCodeEditable={false} // false disable to country calling code editing
                value={value}
                onChange={onChange}
                onCountryChange={(country) => {
                  if (country !== undefined) {
                    handleCountry(country);
                  }
                }}
                onBlur={(e) => {
                  fieldOnBlur();
                  if (phoneBlur) {
                    phoneBlur();
                  }
                  if (onBlur) {
                    onBlur(e);
                  }
                }}
                disabled={disabled}
                ref={ref}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
});
PhoneInputField.displayName = "PhoneInputField";
export default PhoneInputField;
