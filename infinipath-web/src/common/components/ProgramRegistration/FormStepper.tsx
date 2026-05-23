import React from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';
import styles from './FormStepper.module.scss';

interface FormStepperProps {
  activeStep: number;
  steps: { id: string; title: string }[];
}

const FormStepper: React.FC<FormStepperProps> = ({ activeStep, steps }) => {
  return (
    <div className={styles.stepperContainer}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel>{step.title}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default FormStepper;