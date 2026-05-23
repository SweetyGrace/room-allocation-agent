import styled from '@emotion/styled';
import {
  StepConnector,
  StepIconProps,
  stepConnectorClasses,
} from '@mui/material';
import React from 'react';

interface CustomStepIconProps extends StepIconProps {
  customActive?: boolean;
  warning?: boolean;
  inActive?: boolean;
}
const StepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean };
}>(({  ownerState }) => ({
  display: 'flex',
  height: 16,
  padding: 0,
  width: 12,
  alignItems: 'center',
  ...(ownerState.active && {
    color: '#1859B4',
  }),
  '& .stepIconRoot-completeIcon': {
    cursor: 'pointer',
    width: 12,
    height: 16,
    display: 'contents',
    backgroundColor: 'white',
    borderRadius: '50%',
    div: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: '#65C466',
    },
    // border: '1px solid #1859B4',
    // img: {
    //   objectFit: 'contain',
    // },
  },
  '& .stepIconRoot-activeIcon': {
    cursor: 'pointer',
    width: 12,
    height: 16,
    display: 'contents',
    div: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: 'blue',
    },
  },
  '& .stepIconRoot-grey': {
    cursor: 'pointer',
    width: 12,
    height: 16,
    display: 'contents',
    // border: '1px solid black',
    div: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: '#D9D9D9',
    },
  },
  '& .stepIconRoot-warningIcon': {
    cursor: 'pointer',
    width: 12,
    height: 16,
    display: 'contents',
    div: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: 'orange',
    },
  },
  '& .stepIconRoot-errorIcon': {
    cursor: 'pointer',
    width: 12,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'red',
  },
}));

export const CustomStepperIcon: React.FC<CustomStepIconProps> = (props) => {
  const { active, completed, className, customActive, warning } = props;
  return (
    <StepIconRoot ownerState={{ active, completed }} className={className}>


      {warning && !customActive && (
        <div className="stepIconRoot-warningIcon">
          <div />
        </div>
      )}

      {!customActive && !warning  && (
        <div className="stepIconRoot-grey">
          <div />
        </div>
      )}
      {customActive && (
        <div className="stepIconRoot-completeIcon">
          <div />
        </div>
      )}
     
    </StepIconRoot>
  );
};
export const CustomConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderTopWidth: 0,
    borderRadius: '1px',
    borderStyle: 'dashed',
    borderWidth: '0.5px',
    width: 16,
  },
}));
