import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

// Context to share open state between Tooltip and TooltipTrigger
const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  clickable: boolean;
}>({
  open: false,
  setOpen: () => {},
  clickable: true,
});

// Enhanced Tooltip component with click support
const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> & {
    clickable?: boolean;
  }
>(({ clickable = true, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);

  // Handle click outside to close when clickable
  React.useEffect(() => {
    if (!clickable || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking inside the tooltip content or trigger
      if (
        target.closest('[data-radix-tooltip-content]') || 
        target.closest('[data-radix-tooltip-trigger]') ||
        target.closest('[role="tooltip"]')
      ) {
        return;
      }
      setOpen(false);
    };

    // Use a small delay to avoid immediate closing on click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, clickable]);

  return (
    <TooltipContext.Provider value={{ open, setOpen, clickable }}>
      <TooltipPrimitive.Root
        {...props}
        open={clickable ? open : undefined}
        onOpenChange={clickable ? setOpen : undefined}
        delayDuration={200}
      />
    </TooltipContext.Provider>
  );
});
Tooltip.displayName = "Tooltip";

// Enhanced TooltipTrigger with click support
const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onClick, asChild, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  
  const handleClick = (e: React.MouseEvent) => {
    // Only toggle if context is available and clickable
    if (context && context.clickable) {
      // Toggle tooltip on click
      context.setOpen(!context.open);
    }
    // Still call original onClick handler
    onClick?.(e);
  };

  // When asChild is used, Radix UI will merge the onClick handler
  return (
    <TooltipPrimitive.Trigger
      {...props}
      asChild={asChild}
      ref={ref}
      onClick={handleClick}
    />
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
