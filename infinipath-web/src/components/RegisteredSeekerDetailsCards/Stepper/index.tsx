import { Stepper, Step, StepLabel } from '@mui/material';
import { CustomStepperIcon } from './CustomStepper/index';
import styles from './index.module.scss';
import { flexbox, styled } from '@mui/system';
import StepConnector, {
    stepConnectorClasses,
} from '@mui/material/StepConnector';
import defaultProfileIcon from "../../../assets/images/default-profile.svg";
import backArrow from "../../../assets/images/admin-back-arrow.svg";
import GrayLine from "../../../common/components/GrayLine"
import { colorizeMahatriaInfinitheism } from '../../../common/components/ColorizeMahatriaInfinitheism';

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
    isStepNotStarted: (index: number) => boolean;
    isPending: (index: number) => boolean;
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
    isStepNotStarted,
    isPending,
}: VerticalStepperProps) => {

    const CustomStepConnector = styled(StepConnector)(() => ({
        [`& .${stepConnectorClasses.line}`]: {
            borderLeftWidth: '1.2px',
            borderLeftStyle: 'dashed',
            borderLeftColor: '#c4c4c4',
            height: '30px',
            marginLeft: '-5px',
            padding: '20px',
        },
    }));

    const handleStepClick = (index: number) => {
        onStepClick(index);
    };

    return (
        <div className={styles.stepperContent}>
            <div className={styles.header}>
                <img src={backArrow} alt="back-arrow" onClick={onBack} className={styles.backArrow} />
                <div className={styles.title}>{title}</div>
            </div>

            <div className={styles.profileBlock}>
                <div className={styles.profileImageContainer}>
                    <img src={imageSrc || defaultProfileIcon} alt="Seeker" className={styles.seekerImg} />
                </div>
                <div className={styles.nameText}>{colorizeMahatriaInfinitheism(name)}</div>
            </div>

            <div className={styles.stepperHeading}>
                <div className={styles.stagesText}>Stages</div>
                <GrayLine />
            </div>

            <div className={styles.stepperScroll}>
                <div style={{ paddingLeft: '0px' }}>
                    <Stepper
                        activeStep={activeStep}
                        orientation="vertical"
                        className={styles.stepperRoot}
                        connector={<CustomStepConnector />}
                    >
                        {steps.map((label, index) => (
                            <Step
                                key={label}
                                onClick={() => handleStepClick(index)}
                                style={{ cursor: 'pointer' }}
                            >
                                <StepLabel
                                    StepIconComponent={(props) => (
                                        <CustomStepperIcon
                                            {...props}
                                            customActive={isActive(index)}
                                            notStarted={isStepNotStarted(index)}
                                            isPending={isPending(index)}
                                            completed={isActive(index)}
                                        />
                                    )}
                                    className={styles.stepperIconLabel}
                                >
                                    <span
                                        className={`${styles.stepperLabels} ${isActive(index) ? styles.activeLabel : styles.inactiveLabel
                                            }`}
                                    >
                                        {colorizeMahatriaInfinitheism(label)}
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