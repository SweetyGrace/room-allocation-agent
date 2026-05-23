import React from 'react';
import styles from './index.module.scss';

interface CustomRadioButtonProps {
    text: string;
    name: string;
    value: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
    text,
    name,
    value,
    checked,
    onChange,
}) => {
    return (
        <label className={styles.customradio}>
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className={styles.radioInput}
            />
            <span className={`${styles.checkmark}`}></span>
            <span className={styles.labelText}>{text}</span>
        </label>
    );
};

export default CustomRadioButton;
