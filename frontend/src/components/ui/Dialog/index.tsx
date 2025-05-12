import React from 'react';
import { cn } from '@/lib/utils';

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, open = false, onOpenChange, ...props }, ref) => {
    return (
      <>
        {open && (
          <div
            ref={ref}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50",
              className
            )}
            onClick={() => onOpenChange && onOpenChange(false)}
            {...props}
          />
        )}
      </>
    );
  }
);
Dialog.displayName = "Dialog";

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 grid w-full max-w-lg scale-100 gap-4 bg-background p-6 opacity-100 shadow-lg border rounded-lg",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DialogContent.displayName = "DialogContent";

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-2 text-center sm:text-left",
          className
        )}
        {...props}
      />
    );
  }
);
DialogHeader.displayName = "DialogHeader";

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
          className
        )}
        {...props}
      />
    );
  }
);
DialogFooter.displayName = "DialogFooter";

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-lg font-semibold text-foreground",
          className
        )}
        {...props}
      />
    );
  }
);
DialogTitle.displayName = "DialogTitle";

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
