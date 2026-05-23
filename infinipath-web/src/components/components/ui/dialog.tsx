import * as React from "react"
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  DialogProps as MuiDialogProps,
  IconButton,
  Box,
} from '@mui/material';
import { X } from "lucide-react";

const Dialog = React.forwardRef<
  HTMLDivElement,
  MuiDialogProps & { onOpenChange?: (open: boolean) => void }
>(({ onOpenChange, ...props }, ref) => (
  <MuiDialog 
    ref={ref} 
    onClose={() => onOpenChange?.(false)}
    {...props} 
  />
));
Dialog.displayName = "Dialog";

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
));
DialogTrigger.displayName = "DialogTrigger";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MuiDialogContent> & { showCloseButton?: boolean }
>(({ children, showCloseButton = true, ...props }, ref) => (
  <MuiDialogContent ref={ref} {...props}>
    {showCloseButton && (
      <IconButton
        aria-label="close"
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <X size={16} />
      </IconButton>
    )}
    {children}
  </MuiDialogContent>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <Box ref={ref} {...props}>
    {children}
  </Box>
));
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <MuiDialogActions ref={ref} {...props}>
    {children}
  </MuiDialogActions>
));
DialogFooter.displayName = "DialogFooter";

const DialogTitle = MuiDialogTitle;

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => (
  <Box component="p" ref={ref} sx={{ color: 'text.secondary', fontSize: '0.875rem' }} {...props}>
    {children}
  </Box>
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
