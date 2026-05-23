
import * as React from "react"
import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    height: '40px',
    fontSize: '0.875rem',
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.text.primary,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
  '& .MuiInputBase-input': {
    padding: '8px 12px',
  },
}));

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  type?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", ...props }, ref) => {
    return (
      <StyledTextField
        type={type}
        variant="outlined"
        size="small"
        fullWidth
        inputRef={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
