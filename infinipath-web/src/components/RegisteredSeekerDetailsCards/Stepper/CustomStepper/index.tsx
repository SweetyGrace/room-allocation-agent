import React from 'react';
import styles from './index.module.scss'; // Make sure you have the corresponding CSS file

interface CustomStepperIconProps {
  customActive?: boolean;
  notStarted?: boolean;
  isPending?: boolean;
  completed?: boolean;
  icon?: React.ReactNode;
}

export const CustomStepperIcon: React.FC<CustomStepperIconProps> = ({
  customActive,
  notStarted,
  isPending,
  completed,
  ...props
}) => {
  // Determine the appropriate class based on status
  const getIconClass = () => {
    if (completed) {
      return styles.completedIcon; // Green dot
    }
    if (customActive) {
      return styles.activeIcon; // Yellow dot for in-progress
    }
    if (isPending) {
      return styles.isPendingIcon; // Yellow dot for not started
    }
    return styles.notStartedIcon;
  };

  return (
    <div className={`${styles.stepperIcon} ${getIconClass()}`}>
      <div className={styles.iconDot} />
    </div>
  );
};