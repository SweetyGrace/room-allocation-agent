import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../../lib/utils"
import styles from './index.module.scss'

interface CustomSelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  matchTriggerWidth?: boolean;
}

const Select = (props: CustomSelectProps) => {
  const { matchTriggerWidth = false, children, ...rest } = props;
  const [triggerWidth, setTriggerWidth] = React.useState<number | undefined>(undefined);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // When open, set the width
  React.useEffect(() => {
    if (matchTriggerWidth && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth);
    }
  }, [triggerRef.current, matchTriggerWidth, props.open]);

  return (
    <SelectPrimitive.Root {...rest}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        // Inject ref and width into SelectTrigger and SelectContent
        if (child.type === SelectTrigger && matchTriggerWidth) {
          return React.cloneElement(child, { ref: triggerRef });
        }
        if (child.type === SelectContent && matchTriggerWidth) {
          return React.cloneElement(child, { triggerWidth });
        }
        return child;
      })}
    </SelectPrimitive.Root>
  );
}

const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(styles.selectTrigger, className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown style={{ height: '1rem', width: '1rem', opacity: 0.5 }} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { triggerWidth?: number }
>(({ className, children, position = "popper", triggerWidth, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(styles.selectContent, className)}
      position={position}
      style={triggerWidth ? { width: triggerWidth } : undefined}
      {...props}
    >
      <SelectPrimitive.Viewport style={{ padding: '0.25rem' }}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(styles.selectLabel, className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(styles.selectItem, className)}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
}
