import React from 'react';
import styles from './FloatingButton.module.scss';
import { Button } from '../Button';

interface FloatingButtonProps {
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  showBackButton: boolean;
  showNextButton: boolean;
  nextButtonText: string;
  onSubmit?: (formData: any) => void;
  formData?: any;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  activeStep,
  onNext,
  onBack,
  isValid,
  showBackButton,
  showNextButton,
  nextButtonText,
  onSubmit,
  formData
}) => {
  const handleNextClick = () => {
    if (nextButtonText === 'Submit' && onSubmit && formData) {
      onSubmit(formData);
    } else {
      onNext();
    }
  };

  return (
    <div className={styles.floatingButtons}>
      {showBackButton && (
        <Button 
          onClick={onBack}
          buttonClassName={styles.backButton}
          disable={false}
        >
          Back
        </Button>
      )}
      {showNextButton && (
        <Button
          onClick={handleNextClick}
          buttonClassName={styles.nextButton}
          disable={!isValid}
        >
          {nextButtonText}
        </Button>
      )}
    </div>
  );
};

export default FloatingButton;