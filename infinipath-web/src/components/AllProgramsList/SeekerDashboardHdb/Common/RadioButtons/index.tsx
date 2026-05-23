import React from 'react';
import styles from './index.module.scss';
import CustomRadioButton from '../../../../../common/components/CustomRadioButton';

interface RadioGroupProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ label, value, options, onChange, disabled }) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    <div className={styles.radioOptions}>
      {options.map((option) => {
        const normalizedOption = option.toLowerCase();
        const isChecked = value?.toLowerCase() === normalizedOption;

        return (
          <CustomRadioButton
            key={option}
            text={option.charAt(0).toUpperCase() + option.slice(1)} // Capitalize for display
            name={`radioGroup-${label.replace(/\s+/g, '')}`} // Unique name per group
            value={option}
            checked={isChecked}
            onChange={() => onChange(option)}
            disabled={disabled}
          />
        );
      })}
    </div>
  </div>
);

export default RadioGroup;
