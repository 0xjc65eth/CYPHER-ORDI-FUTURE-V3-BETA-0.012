'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { motion, MotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Button variants configuration
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm hover:shadow-md',
        destructive: 'bg-danger-500 text-white hover:bg-danger-600 focus-visible:ring-danger-500 shadow-sm hover:shadow-md',
        outline: 'border border-[var(--border-primary)] bg-transparent hover:bg-[var(--bg-secondary)] focus-visible:ring-primary-500',
        secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:ring-gray-500 shadow-sm',
        ghost: 'hover:bg-[var(--bg-secondary)] focus-visible:ring-gray-500',
        link: 'text-primary-500 underline-offset-4 hover:underline focus-visible:ring-primary-500',
        glass: 'glass text-white hover:bg-white/20 focus-visible:ring-white/50 shadow-glass',
        gradient: 'gradient-primary text-white hover:shadow-lg focus-visible:ring-primary-500 shadow-md hover:shadow-xl',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md',
        sm: 'h-9 px-3 text-sm',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-base',
        xl: 'h-12 px-10 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'cursor-wait',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
      loading: false,
    },
  }
);

// Loading spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Button component props
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Main Button component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading,
    asChild = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'leftIcon' | 'rightIcon'> & {
    'aria-label': string;
  }
>(({ className, size = 'default', ...props }, ref) => {
  const iconSizeClasses = {
    xs: 'h-7 w-7',
    sm: 'h-9 w-9',
    default: 'h-10 w-10',
    lg: 'h-11 w-11',
    xl: 'h-12 w-12',
  };
  
  return (
    <Button
      ref={ref}
      className={cn(
        'p-0',
        iconSizeClasses[size as keyof typeof iconSizeClasses],
        className
      )}
      size={size}
      {...props}
    />
  );
});

IconButton.displayName = 'IconButton';

// Button Group component
export const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
  }
>(({ className, orientation = 'horizontal', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        '[&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none',
        '[&>*:not(:last-child)]:border-r-0',
        className
      )}
      {...props}
    />
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export { Button, buttonVariants };