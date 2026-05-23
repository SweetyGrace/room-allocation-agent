
import * as React from "react"
import { Drawer, DrawerProps } from '@mui/material';

const Sheet = React.forwardRef<
  HTMLDivElement,
  DrawerProps
>(({ children, ...props }, ref) => (
  <Drawer ref={ref} {...props}>
    {children}
  </Drawer>
));
Sheet.displayName = "Sheet";

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
SheetContent.displayName = "SheetContent";

export {
  Sheet,
  SheetContent,
}
