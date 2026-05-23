import React from 'react';
import styles from './index.module.scss';
import onHoldIcon from "../../../assets/images/onHold.svg";
import rightArrow from "../../../assets/images/arrow-right-icon.svg";
import SideDrawerOverlay from '../../../components/SideOverLay';
import TimelineActivity from '../ActivityLog';
import { colorizeMahatriaInfinitheism } from '../ColorizeMahatriaInfinitheism';

export interface StepData {
  id: string;
  title: string;
  subtitle?: string;
  status: 'done' | 'inprogress' | 'not_started' | 'hold' | 'rejected' | 'cancelled';
}

interface HorizontalStepperProps {
  steps: StepData[];
  registrationId?: string | number;
}

const HorizontalStepper: React.FC<HorizontalStepperProps> = ({ steps, registrationId }) => {
  const [viewActivity, setViewActivity] = React.useState(false);

  const handleOpenActivity = () => setViewActivity(true);
  const handleCloseActivity = () => setViewActivity(false);

  const showOverlay = viewActivity && (
    <SideDrawerOverlay
      open={viewActivity}
      grayLine={true}
      onClose={handleCloseActivity}
      headerText="Activity Logs"
    >
      <TimelineActivity registrationId={registrationId} />
    </SideDrawerOverlay>
  );

  const getStepIcon = (status: StepData['status'], index: number) => {
    switch (status) {
      case 'done':
        return (
          <svg
            className={styles.stepIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
        case 'cancelled': 
        return (
    <svg
      className={styles.stepIcon}
      viewBox="0 0 24 24"
      fill="FFC107"
      stroke="white"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
        );
      case 'inprogress':
        return <span className={styles.stepNumber}>{index + 1}</span>;
      case 'hold':
        return <img src={onHoldIcon} alt="on hold" />;
      case 'not_started':
        return <span className={styles.countText}>{index + 1}</span>;
      default:
        return <div className={styles.stepDot}></div>;
    }
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.heading}>
          <span className={styles.seekerJourney}>Seeker’s journey</span>
        <span className={styles.viewActivity} onClick={handleOpenActivity}>
          View Activity
          <img src={rightArrow} alt="right arrow" />
        </span>
      </div>
      {showOverlay}
      <div className={styles.stepperContainer}>
        {steps.map((step, index) => (
          <div key={step.id} className={styles.stepContainer}>
            <div className={styles.stepWrapper}>
              <div className={styles.stepItem}>
                <div className={`${styles.stepCircle} ${styles[step.status]}`}>
                  {getStepIcon(step.status, index)}
                </div>
                <div className={styles.stepContent}>
                  <div
                    className={
                      `${styles.stepTitle} ` +
                      (step.status === 'done' || step.status === 'cancelled'
                        ? styles.stepTitleDone
                        : step.status === 'inprogress'
                          ? styles.stepTitleInprogress
                          : styles.stepTitleNotStarted)
                    }
                  >
                    {colorizeMahatriaInfinitheism(step.title)}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={styles.stepConnector}></div>
              )}
            </div>
            <div>
              {step.subtitle && (
                <span className={styles.stepSubtitle}>{step.subtitle}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalStepper;