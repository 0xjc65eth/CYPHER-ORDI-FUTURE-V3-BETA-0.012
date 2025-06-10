'use client';

import * as React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Card variants configuration
const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-[var(--bg-secondary)] border border-[var(--border-primary)]',
        glass: 'glass',
        gradient: 'gradient-mesh border border-[var(--border-primary)]',
        elevated: 'bg-[var(--bg-secondary)] shadow-lg hover:shadow-xl',
        outline: 'border-2 border-[var(--border-secondary)] bg-transparent',
      },
      depth: {
        0: 'bg-[var(--bg-primary)]',
        1: 'bg-[var(--bg-secondary)]',
        2: 'bg-[var(--bg-tertiary)]',
        3: 'bg-[var(--bg-quaternary)]',
        4: 'bg-[var(--bg-quinary)]',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg active:scale-[0.99]',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      interactive: false,
    },
  }
);

// Card component props
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

// Main Card component
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    depth,
    padding,
    interactive,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, depth, padding, interactive }),
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card Header component
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

// Card Title component
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight text-[var(--text-primary)]',
      className
    )}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

// Card Description component
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-[var(--text-tertiary)]', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

// Card Content component
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

// Card Footer component
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

// Glass Card variant with enhanced effects
export const GlassCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="glass"
        className={cn(
          'backdrop-blur-xl bg-white/5 dark:bg-black/5',
          'border border-white/10 dark:border-white/5',
          'shadow-glass',
          className
        )}
        {...props}
      />
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Metric Card component
export const MetricCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    title: string;
    value: string | number;
    change?: {
      value: number;
      label?: string;
    };
    icon?: React.ReactNode;
  }
>(({ title, value, change, icon, className, ...props }, ref) => {
  const isPositive = change && change.value >= 0;
  
  return (
    <Card ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--text-tertiary)]">{title}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
            {change && (
              <div className="flex items-center space-x-1">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isPositive ? 'text-success-500' : 'text-danger-500'
                  )}
                >
                  {isPositive ? '+' : ''}{change.value}%
                </span>
                {change.label && (
                  <span className="text-sm text-[var(--text-quaternary)]">
                    {change.label}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="text-[var(--text-quaternary)]">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

// Feature Card component
export const FeatureCard = React.forwardRef<
  HTMLDivElement,
  CardProps & {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  }
>(({ title, description, icon, action, className, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      interactive
      className={cn('group', className)}
      {...props}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500 group-hover:bg-primary-500/20 transition-colors">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      </CardHeader>
    </Card>
  );
});

FeatureCard.displayName = 'FeatureCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};