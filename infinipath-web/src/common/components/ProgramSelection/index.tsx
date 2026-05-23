import React from 'react';
import { Checkbox } from "@mui/material";
import styles from './index.module.scss';
import checked from '../../../assets/images/checked-checkbox.svg';
import unchecked from '../../../assets/images/unchecked-checkbox.svg';

interface ProgramOption {
  id: number;
  name: string;
}

interface ProgramSelectionProps {
  options: ProgramOption[];
  selectedOption: string;
  onChange: (value: string) => void;
}

export const ProgramSelection: React.FC<ProgramSelectionProps> = ({
  options,
  selectedOption,
  onChange
}) => {
  return (
    <div className={styles.optionsContainer}>
      {options.map((option, index) => (
        index !== 0 && (
          <div key={option.id} className={styles.optionItem}>
            <label className={styles.optionLabel}>
              <Checkbox
                icon={<img src={unchecked} alt="unchecked" loading="lazy" />}
                checkedIcon={<img src={checked} alt="checked" loading="lazy" />}
                checked={selectedOption === option.name}
                onChange={() => onChange(option.name)}
              />
              {option.name}
            </label>
          </div>
        )
      ))}
    </div>
  );
};