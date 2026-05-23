import React from 'react';
import styles from './index.module.scss';
import clearIcon from '../../../assets/images/cross-bg.svg';

interface CommonTextFieldProps {
    placeholder: string;
    name: string;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    showClearButton?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CommonTextField: React.FC<CommonTextFieldProps> = ({ 
    placeholder, 
    name, 
    value,
    onClear,
    showClearButton = true,
    ...props 
}) => {
    return (
        <div className={`${styles.inputWrapper} ${props.className || ''}`}>
            <input
                name={name}
                placeholder={placeholder}
                value={value}
                {...props}
                data-testid="search-field"
                className={styles.searchInput}
                onChange={props.onChange}
            />
            {showClearButton && value && onClear && (
               <img
                   src={clearIcon}
                   alt="Clear"
                   className={styles.clearIcon}
                   onClick={onClear}
               />
            )}
        </div>
    );
};

export default CommonTextField;