import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/80',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
