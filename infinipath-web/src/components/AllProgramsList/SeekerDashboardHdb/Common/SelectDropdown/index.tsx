import React from 'react';
import styles from './index.module.scss';

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange, disabled }) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <select
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">{value}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default SelectField;
