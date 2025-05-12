'use client';

import * as React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Label text
   */
  children: React.ReactNode;
  /**
   * Whether this field is required
   */
  required?: boolean;
  /**
   * HTML 'for' attribute of the label, should match the ID of the related form control
   */
  htmlFor?: string;
}

/**
 * Form label component
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export default Label;
