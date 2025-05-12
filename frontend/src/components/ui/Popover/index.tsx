'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

export interface PopoverProps {
  /**
   * Popup content
   */
  children: React.ReactNode;
  /**
   * Trigger element
   */
  trigger: React.ReactNode;
  /**
   * Alignment
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Whether the popover is open
   */
  open?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
}

export const PopoverTrigger = ({ children, ...props }: { children: React.ReactNode }) => {
  return <div {...props}>{children}</div>;
};

export const PopoverContent = ({ 
  children, 
  className = '',
  ...props 
}: { 
  children: React.ReactNode; 
  className?: string;
  align?: 'start' | 'center' | 'end';
}) => {
  return <div className={`p-4 bg-white rounded-md shadow-md ${className}`} {...props}>{children}</div>;
};

/**
 * Popover component
 */
export const Popover: React.FC<PopoverProps> = ({
  children,
  trigger,
  align = 'center',
  className = '',
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // 处理受控与非受控状态
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const handleToggle = () => {
    const newOpenState = !isOpen;
    setInternalOpen(newOpenState);
    if (onOpenChange) onOpenChange(newOpenState);
  };
  
  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popoverRef.current &&
        triggerRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setInternalOpen(false);
        if (onOpenChange) onOpenChange(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);
  
  // 计算对齐样式
  const getAlignmentStyle = () => {
    switch (align) {
      case 'start':
        return 'left-0';
      case 'end':
        return 'right-0';
      case 'center':
      default:
        return 'left-1/2 transform -translate-x-1/2';
    }
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div ref={triggerRef} onClick={handleToggle}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute z-50 mt-2 ${getAlignmentStyle()}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
