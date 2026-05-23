import React from 'react';
import styles from './index.module.scss';
import { BorderButtonProps } from '../../../types/roomAllocation';


const BorderButton: React.FC<BorderButtonProps> = ({ text, onClick }) => {
    return (
        <div onClick={onClick} className={styles.clearButton}>
            {text}
        </div>
    );
};

export default BorderButton;