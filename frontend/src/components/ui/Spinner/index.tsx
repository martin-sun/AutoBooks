import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
          size === 'sm' && 'h-4 w-4',
          size === 'md' && 'h-6 w-6',
          size === 'lg' && 'h-8 w-8',
          className
        )}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner };
