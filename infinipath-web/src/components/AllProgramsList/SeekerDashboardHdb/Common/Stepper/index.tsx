import { Stepper, Step, StepLabel } from '@mui/material';
import { CustomStepperIcon } from './CustomStepper/index';
import styles from './index.module.scss'; // Scoped styles for this component
import GrayLine from '../../../../../common/components/GrayLine';
import { styled } from '@mui/system';
import StepConnector, {
    stepConnectorClasses,
} from '@mui/material/StepConnector';
import backArrow from "../../../../../assets/images/admin-back-arrow.svg"

interface VerticalStepperProps {
    title: string;
    imageSrc: string;
    name: string;
    status: string;
    steps: string[];
    activeStep: number;
    onStepClick: (index: number) => void;
    onBack: () => void;
    isActive: (index: number) => boolean;
    isStepWarning: (index: number) => boolean;
    inActive: (index: number) => boolean;
}

const VerticalStepper = ({
    title,
    imageSrc,
    name,
    steps,
    activeStep,
    onStepClick,
    onBack,
    isActive,
    isStepWarning,
    inActive,
}: VerticalStepperProps) => {

    const CustomStepConnector = styled(StepConnector)(() => ({
        [`& .${stepConnectorClasses.line}`]: {
            borderLeftWidth: '1.2px',
            borderLeftStyle: 'dashed',
            borderLeftColor: '#c4c4c4',
            height: '30px',
            marginLeft: '-7px',
            padding: 'unset',

            '&::before': {},
        },

        [`& .${stepConnectorClasses.alternativeLabel}`]: {},
    }));
    return (
        <div className={styles.stepperContent}>

            <div className={styles.header}>
                <img src={backArrow} alt="back-arrow" onClick={onBack} className={styles.backArrow} />
                <div className={styles.title}>{title}</div>
            </div>


            <div className={styles.profileBlock}>
                <div className={styles.profileImageContainer}>
                    <img src={imageSrc} alt="Seeker" className={styles.seekerImg} />
                </div>
                <div className={styles.nameText}>{name}</div>
            </div>

            <div className={styles.stepperHeading}>
                <div className={styles.stagesText}>Stages</div>
                <GrayLine />
            </div>

            <div className={styles.stepperScroll}>
                <div style={{ paddingLeft: '7px' }}>
                    <Stepper
                        activeStep={activeStep}
                        orientation="vertical"
                        className={styles.stepperRoot}
                        connector={<CustomStepConnector />}
                    >
                        {steps.map((label, index) => (
                            <Step key={label} onClick={() => onStepClick(index)}>
                                <StepLabel
                                    StepIconComponent={(props) => (
                                        <CustomStepperIcon
                                            {...props}
                                            customActive={isActive(index)}
                                            warning={isStepWarning(index)}
                                            inActive={inActive(index)}
                                        />
                                    )}
                                    className={styles.stepperIconLabel}
                                >
                                    <span
                                        className={`${styles.stepperLabels} ${isActive(index) ? styles.activeLabel : styles.inactiveLabel
                                            }`}
                                    >
                                        {label}
                                    </span>
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </div>
            </div>
        </div>
    );
};

export default VerticalStepper;
