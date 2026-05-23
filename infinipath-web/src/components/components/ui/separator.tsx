
import * as React from "react"
import { Divider, DividerProps } from '@mui/material';

const Separator = React.forwardRef<
  HTMLHRElement,
  DividerProps
>(({ ...props }, ref) => (
  <Divider ref={ref} {...props} />
));
Separator.displayName = "Separator";

export { Separator }
