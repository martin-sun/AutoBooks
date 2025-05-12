import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Styled Select component with dropdown functionality
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  disabled = false,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef<HTMLDivElement>(null);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Extract SelectTrigger, SelectValue, and SelectContent from children
  let triggerElement: React.ReactElement | null = null;
  let contentElement: React.ReactElement | null = null;
  let selectedLabel = "";

  // Find the selected item's label
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child) || child.type !== SelectContent) return;
    
    // Safely access props
    const childProps = child.props as { children?: React.ReactNode };
    
    React.Children.forEach(childProps.children, (item) => {
      if (React.isValidElement(item) && item.type === SelectItem) {
        const itemProps = item.props as { value?: string; children?: React.ReactNode };
        if (itemProps.value === selectedValue) {
          selectedLabel = String(itemProps.children || '');
        }
      }
    });
  });

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    if (child.type === SelectTrigger) {
      // Clone trigger to inject the selected value
      const childProps = child.props as { children?: React.ReactNode };
      const originalChildren = childProps.children;
      
      triggerElement = React.cloneElement(child, {}, 
        React.Children.map(originalChildren, (triggerChild) => {
          if (React.isValidElement(triggerChild) && triggerChild.type === SelectValue) {
            const triggerChildProps = triggerChild.props as { placeholder?: string };
            return React.cloneElement(triggerChild, {
              selectedValue: selectedLabel || triggerChildProps.placeholder
            } as SelectValueProps);
          }
          return triggerChild;
        })
      );
    } else if (child.type === SelectContent) {
      contentElement = child;
    }
  });

  // Handle value selection
  const handleSelect = (value: string) => {
    setSelectedValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
    setOpen(false);
  };

  return (
    <div 
      ref={selectRef} 
      className={cn(
        "relative w-full", 
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Render trigger with click handler */}
      <div onClick={() => !disabled && setOpen(!open)}>
        {triggerElement}
      </div>

      {/* Render dropdown content when open */}
      {open && !disabled && contentElement && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          {React.cloneElement(contentElement, {
            onSelect: handleSelect,
            selectedValue,
          } as SelectContentPropsInternal)}
        </div>
      )}
    </div>
  );
};

// Trigger component (the visible part of the select)
interface SelectTriggerProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

// Value component (displays the selected value or placeholder)
interface SelectValueProps {
  placeholder?: string;
  className?: string;
  selectedValue?: string;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, selectedValue }, ref) => {
    // This component gets its actual value from the parent Select component context
    return (
      <span
        ref={ref}
        className={cn("block truncate", className)}
      >
        {selectedValue || placeholder}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

// Content component (the dropdown options)
interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
  selectedValue?: string;
}

// Extended props for internal use
interface SelectContentPropsInternal extends SelectContentProps {
  onSelect?: (value: string) => void;
  selectedValue?: string;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, onSelect, selectedValue }, ref) => {
    // Clone children (SelectItem) with onSelect handler
    const items = React.Children.map(children, (child) => {
      if (!React.isValidElement(child) || child.type !== SelectItem) return child;
      
      const childProps = child.props as { value?: string };
      return React.cloneElement(child, {
        onSelect,
        isSelected: childProps.value === selectedValue,
      } as SelectItemPropsInternal);
    });

    return (
      <div
        ref={ref}
        className={cn("py-1", className)}
      >
        {items}
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

// Item component (individual dropdown options)
interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onSelect?: (value: string) => void;
  isSelected?: boolean;
}

// Extended props for internal use
interface SelectItemPropsInternal extends SelectItemProps {
  onSelect?: (value: string) => void;
  isSelected?: boolean;
}

const SelectItem: React.FC<SelectItemProps> = ({ 
  value, 
  children, 
  className,
  onSelect,
  isSelected = false,
}) => {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent/50",
        className
      )}
      onClick={() => onSelect && onSelect(value)}
    >
      {children}
    </div>
  );
};
SelectItem.displayName = "SelectItem";

export { Select, SelectItem, SelectTrigger, SelectValue, SelectContent };
