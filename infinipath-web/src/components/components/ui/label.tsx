
import * as React from "react"
import { FormLabel, FormLabelProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1,
  color: theme.palette.text.primary,
  '&.Mui-disabled': {
    cursor: 'not-allowed',
    opacity: 0.7,
  },
}));

const Label = React.forwardRef<
  HTMLLabelElement,
  FormLabelProps
>(({ ...props }, ref) => (
  <StyledFormLabel ref={ref} {...props} />
));
Label.displayName = "Label";

export { Label }
