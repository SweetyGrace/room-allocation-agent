
import * as React from "react"
import { Snackbar, Alert, AlertProps } from '@mui/material';

export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export type ToastActionElement = React.ReactElement;

const ToastProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
ToastProvider.displayName = "ToastProvider";

const Toast = React.forwardRef<
  HTMLDivElement,
  ToastProps
>(({ children, open, onOpenChange, title, description, ...props }, ref) => (
  <Snackbar 
    open={open} 
    onClose={() => onOpenChange?.(false)}
    autoHideDuration={6000}
  >
    <Alert severity="info">
      {title && <div>{title}</div>}
      {description && <div>{description}</div>}
      {children}
    </Alert>
  </Snackbar>
));
Toast.displayName = "Toast";

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ ...props }, ref) => (
  <button ref={ref} {...props}>
    ×
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
ToastDescription.displayName = "ToastDescription";

const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} {...props} />
));
ToastViewport.displayName = "ToastViewport";

export {
  ToastProvider,
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  ToastViewport,
}
