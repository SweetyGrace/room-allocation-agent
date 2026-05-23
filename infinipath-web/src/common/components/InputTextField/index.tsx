import React from "react";
import styles from "./index.module.scss";

interface InputTextFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  inputClassname?: string;
  autoFocus?: boolean;
}

const InputTextField: React.FC<InputTextFieldProps> = ({
  value,
  onChange,
  inputClassnames,
  autoFocus,
}) => {
  return (
    <div className={styles.inputBlock} data-testid="input-field">
      <input
        type="text"
        value={value}
        onChange={onChange}
        className={`${styles.inputStyles} ${inputClassnames || ""}`}
        autoFocus={autoFocus}
        data-testid="input-text-field"
      />
    </div>
  );
};

export default InputTextField;
