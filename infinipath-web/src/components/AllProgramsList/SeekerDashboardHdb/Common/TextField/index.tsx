import React from 'react';
import styles from './index.module.scss';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, disabled }) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <input
      type="text"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  </div>
);

export default TextField;
