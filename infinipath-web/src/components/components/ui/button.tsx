
import * as React from "react"
import { Button as MuiButton, ButtonProps as MuiButtonProps, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant, size }) => ({
  textTransform: 'none',
  fontWeight: 500,
  ...(variant === 'contained' && {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  }),
  ...(size === 'small' && {
    height: '36px',
    fontSize: '0.875rem',
  }),
  ...(size === 'large' && {
    height: '44px',
    fontSize: '1rem',
  }),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: '8px',
}));

export interface ButtonProps extends Omit<MuiButtonProps, 'size' | 'variant'> {
  size?: 'small' | 'medium' | 'large' | 'icon';
  variant?: 'contained' | 'outlined' | 'text' | 'ghost' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "contained", size = "medium", ...props }, ref) => {
    // Handle icon size separately
    if (size === 'icon') {
      return (
        <StyledIconButton ref={ref} {...props}>
          {children}
        </StyledIconButton>
      );
    }

    // Map variants for compatibility
    const muiVariant = variant === 'ghost' ? 'text' : 
                      variant === 'outline' ? 'outlined' : 
                      variant as 'text' | 'outlined' | 'contained';
    
    return (
      <StyledButton ref={ref} variant={muiVariant} size={size} {...props}>
        {children}
      </StyledButton>
    )
  }
)
Button.displayName = "Button"

export { Button }
