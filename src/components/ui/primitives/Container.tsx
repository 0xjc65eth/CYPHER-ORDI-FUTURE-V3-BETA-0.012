'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Container variants
const containerVariants = cva(
  'mx-auto w-full',
  {
    variants: {
      size: {
        sm: 'max-w-screen-sm',   // 640px
        md: 'max-w-screen-md',   // 768px
        lg: 'max-w-screen-lg',   // 1024px
        xl: 'max-w-screen-xl',   // 1280px
        '2xl': 'max-w-screen-2xl', // 1536px
        '3xl': 'max-w-screen-3xl', // 1920px
        full: 'max-w-full',
        prose: 'max-w-prose',    // 65ch
      },
      padding: {
        none: 'px-0',
        sm: 'px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16',
        default: 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 3xl:px-16',
        lg: 'px-6 sm:px-8 md:px-10 lg:px-12 xl:px-14 2xl:px-16 3xl:px-20',
      },
    },
    defaultVariants: {
      size: 'xl',
      padding: 'default',
    },
  }
);

// Container component props
export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

// Main Container component
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ as: Component = 'div', size, padding, className, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(containerVariants({ size, padding }), className)}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

// Section component with vertical padding
export const Section = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    spacing?: 'sm' | 'default' | 'lg' | 'xl';
  }
>(({ spacing = 'default', className, ...props }, ref) => {
  const spacingClasses = {
    sm: 'py-8 sm:py-12 md:py-16',
    default: 'py-12 sm:py-16 md:py-20 lg:py-24',
    lg: 'py-16 sm:py-20 md:py-24 lg:py-32',
    xl: 'py-20 sm:py-24 md:py-32 lg:py-40',
  };
  
  return (
    <section
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  );
});

Section.displayName = 'Section';

// Grid component with 24-column system
const gridVariants = cva(
  'grid w-full',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
        6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
        12: 'grid-cols-12',
        24: 'grid-cols-24',
      },
      gap: {
        none: 'gap-0',
        sm: 'gap-2 sm:gap-3 md:gap-4',
        default: 'gap-4 sm:gap-5 md:gap-6 lg:gap-8',
        lg: 'gap-6 sm:gap-8 md:gap-10 lg:gap-12',
        xl: 'gap-8 sm:gap-10 md:gap-12 lg:gap-16',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
    },
    defaultVariants: {
      cols: 1,
      gap: 'default',
      align: 'stretch',
      justify: 'start',
    },
  }
);

// Grid component props
export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

// Grid component
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols, gap, align, justify, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gridVariants({ cols, gap, align, justify }), className)}
        {...props}
      />
    );
  }
);

Grid.displayName = 'Grid';

// Grid Item component for 24-column grid
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number;
  start?: number;
  end?: number;
  spanSm?: number;
  spanMd?: number;
  spanLg?: number;
  spanXl?: number;
  span2xl?: number;
  span3xl?: number;
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ 
    span,
    start,
    end,
    spanSm,
    spanMd,
    spanLg,
    spanXl,
    span2xl,
    span3xl,
    className,
    ...props 
  }, ref) => {
    const classes = cn(
      span && `col-span-${span}`,
      start && `col-start-${start}`,
      end && `col-end-${end}`,
      spanSm && `sm:col-span-${spanSm}`,
      spanMd && `md:col-span-${spanMd}`,
      spanLg && `lg:col-span-${spanLg}`,
      spanXl && `xl:col-span-${spanXl}`,
      span2xl && `2xl:col-span-${span2xl}`,
      span3xl && `3xl:col-span-${span3xl}`,
      className
    );
    
    return <div ref={ref} className={classes} {...props} />;
  }
);

GridItem.displayName = 'GridItem';

// Flex component
const flexVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        'row-reverse': 'flex-row-reverse',
        col: 'flex-col',
        'col-reverse': 'flex-col-reverse',
      },
      wrap: {
        wrap: 'flex-wrap',
        'wrap-reverse': 'flex-wrap-reverse',
        nowrap: 'flex-nowrap',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        baseline: 'items-baseline',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      gap: {
        none: 'gap-0',
        sm: 'gap-2',
        default: 'gap-4',
        lg: 'gap-6',
        xl: 'gap-8',
      },
    },
    defaultVariants: {
      direction: 'row',
      wrap: 'nowrap',
      align: 'stretch',
      justify: 'start',
      gap: 'default',
    },
  }
);

// Flex component props
export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {
  inline?: boolean;
}

// Flex component
export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ direction, wrap, align, justify, gap, inline, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          inline && 'inline-flex',
          flexVariants({ direction, wrap, align, justify, gap }),
          className
        )}
        {...props}
      />
    );
  }
);

Flex.displayName = 'Flex';

// Stack component (vertical flex)
export const Stack = React.forwardRef<
  HTMLDivElement,
  Omit<FlexProps, 'direction'>
>(({ ...props }, ref) => {
  return <Flex ref={ref} direction="col" {...props} />;
});

Stack.displayName = 'Stack';

// Center component
export const Center = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center justify-center', className)}
      {...props}
    />
  );
});

Center.displayName = 'Center';

// Spacer component
export const Spacer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'default' | 'lg' | 'xl';
    horizontal?: boolean;
  }
>(({ size = 'default', horizontal, className, ...props }, ref) => {
  const sizes = {
    sm: horizontal ? 'w-2' : 'h-2',
    default: horizontal ? 'w-4' : 'h-4',
    lg: horizontal ? 'w-6' : 'h-6',
    xl: horizontal ? 'w-8' : 'h-8',
  };
  
  return (
    <div
      ref={ref}
      className={cn(sizes[size], 'flex-shrink-0', className)}
      {...props}
    />
  );
});

Spacer.displayName = 'Spacer';

export { containerVariants, gridVariants, flexVariants };