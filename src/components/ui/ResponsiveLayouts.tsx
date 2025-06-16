'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Interfaces
interface BreakpointConfig {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: boolean;
  centered?: boolean;
  fluid?: boolean;
}

interface GridLayoutProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number | string;
  className?: string;
  responsive?: boolean;
  autoRows?: string;
  areas?: string[];
}

interface FlexLayoutProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: boolean;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: number | string;
  className?: string;
  responsive?: {
    sm?: Partial<FlexLayoutProps>;
    md?: Partial<FlexLayoutProps>;
    lg?: Partial<FlexLayoutProps>;
    xl?: Partial<FlexLayoutProps>;
  };
}

interface StackLayoutProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  spacing?: number | string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  divider?: React.ReactNode;
}

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
  sidebarWidth?: string;
  position?: 'left' | 'right';
  collapsed?: boolean;
  overlay?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface MasonryLayoutProps {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

interface CardGridProps {
  children: React.ReactNode;
  minCardWidth?: string;
  maxCardWidth?: string;
  gap?: string;
  className?: string;
  autoFit?: boolean;
}

interface AspectRatioProps {
  ratio?: number | string;
  children: React.ReactNode;
  className?: string;
}

// Hooks
const useBreakpoint = (customBreakpoints?: BreakpointConfig) => {
  const defaultBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    ...customBreakpoints
  };

  const [breakpoint, setBreakpoint] = useState<string>('sm');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width >= defaultBreakpoints['2xl']!) {
        setBreakpoint('2xl');
      } else if (width >= defaultBreakpoints.xl!) {
        setBreakpoint('xl');
      } else if (width >= defaultBreakpoints.lg!) {
        setBreakpoint('lg');
      } else if (width >= defaultBreakpoints.md!) {
        setBreakpoint('md');
      } else {
        setBreakpoint('sm');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { breakpoint, windowSize, isSmall: breakpoint === 'sm', isMedium: breakpoint === 'md', isLarge: breakpoint === 'lg', isXLarge: breakpoint === 'xl', is2XLarge: breakpoint === '2xl' };
};

// Responsive Container
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = '2xl',
  padding = true,
  centered = true,
  fluid = false
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
    none: ''
  };

  return (
    <div
      className={cn(
        'w-full',
        !fluid && maxWidthClasses[maxWidth],
        centered && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
};

// Grid Layout
export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className,
  responsive = true,
  autoRows = 'auto',
  areas
}) => {
  const gridClasses = responsive
    ? cn(
        `grid`,
        `grid-cols-${columns.sm || 1}`,
        `sm:grid-cols-${columns.sm || 1}`,
        `md:grid-cols-${columns.md || 2}`,
        `lg:grid-cols-${columns.lg || 3}`,
        `xl:grid-cols-${columns.xl || 4}`,
        typeof gap === 'number' ? `gap-${gap}` : gap
      )
    : cn('grid', `grid-cols-${columns.lg || 3}`, typeof gap === 'number' ? `gap-${gap}` : gap);

  const style = areas ? {
    gridTemplateAreas: areas.map(area => `"${area}"`).join(' '),
    gridAutoRows: autoRows
  } : { gridAutoRows: autoRows };

  return (
    <div className={cn(gridClasses, className)} style={style}>
      {children}
    </div>
  );
};

// Flex Layout
export const FlexLayout: React.FC<FlexLayoutProps> = ({
  children,
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = 0,
  className,
  responsive
}) => {
  const { breakpoint } = useBreakpoint();
  
  const currentProps = responsive?.[breakpoint as keyof typeof responsive] || {};
  const actualDirection = currentProps.direction || direction;
  const actualWrap = currentProps.wrap ?? wrap;
  const actualJustify = currentProps.justify || justify;
  const actualAlign = currentProps.align || align;
  const actualGap = currentProps.gap || gap;

  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[actualDirection],
        actualWrap && 'flex-wrap',
        justifyClasses[actualJustify],
        alignClasses[actualAlign],
        typeof actualGap === 'number' ? `gap-${actualGap}` : actualGap,
        className
      )}
    >
      {children}
    </div>
  );
};

// Stack Layout
export const StackLayout: React.FC<StackLayoutProps> = ({
  children,
  direction = 'vertical',
  spacing = 4,
  align = 'stretch',
  className,
  divider
}) => {
  const isVertical = direction === 'vertical';
  
  const alignClasses = {
    start: isVertical ? 'items-start' : 'justify-start',
    center: isVertical ? 'items-center' : 'justify-center',
    end: isVertical ? 'items-end' : 'justify-end',
    stretch: isVertical ? 'items-stretch' : 'justify-stretch'
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <div
      className={cn(
        'flex',
        isVertical ? 'flex-col' : 'flex-row',
        alignClasses[align],
        typeof spacing === 'number' ? (isVertical ? `space-y-${spacing}` : `space-x-${spacing}`) : spacing,
        className
      )}
    >
      {divider
        ? childrenArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < childrenArray.length - 1 && divider}
            </React.Fragment>
          ))
        : children}
    </div>
  );
};

// Sidebar Layout
export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  sidebar,
  main,
  sidebarWidth = '16rem',
  position = 'left',
  collapsed = false,
  overlay = false,
  breakpoint = 'lg',
  className
}) => {
  const { breakpoint: currentBreakpoint } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);
  
  const shouldCollapse = currentBreakpoint === 'sm' || currentBreakpoint === 'md';
  const isCollapsed = collapsed || shouldCollapse;

  useEffect(() => {
    if (!shouldCollapse) {
      setIsOpen(false);
    }
  }, [shouldCollapse]);

  const sidebarStyles = {
    width: isCollapsed ? (isOpen ? sidebarWidth : '0') : sidebarWidth,
    transform: isCollapsed && !isOpen ? 'translateX(-100%)' : 'translateX(0)'
  };

  return (
    <div className={cn('flex h-screen', className)}>
      {/* Overlay */}
      {overlay && isCollapsed && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      {position === 'left' && (
        <aside
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isCollapsed ? 'fixed left-0 top-0 h-full z-50 bg-white dark:bg-gray-800 shadow-lg' : 'relative',
            'border-r border-gray-200 dark:border-gray-700'
          )}
          style={sidebarStyles}
        >
          <div className="h-full overflow-y-auto">
            {sidebar}
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile menu button */}
        {isCollapsed && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
        
        {main}
      </main>

      {/* Right Sidebar */}
      {position === 'right' && (
        <aside
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden',
            isCollapsed ? 'fixed right-0 top-0 h-full z-50 bg-white dark:bg-gray-800 shadow-lg' : 'relative',
            'border-l border-gray-200 dark:border-gray-700'
          )}
          style={sidebarStyles}
        >
          <div className="h-full overflow-y-auto">
            {sidebar}
          </div>
        </aside>
      )}
    </div>
  );
};

// Masonry Layout
export const MasonryLayout: React.FC<MasonryLayoutProps> = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className
}) => {
  const { breakpoint } = useBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);

  const columnCount = columns[breakpoint as keyof typeof columns] || columns.lg || 3;

  useEffect(() => {
    setColumnHeights(new Array(columnCount).fill(0));
  }, [columnCount]);

  const childrenArray = React.Children.toArray(children);
  
  const arrangedChildren = useMemo(() => {
    if (columnHeights.length === 0) return [];
    
    const heights = [...columnHeights];
    const arranged: Array<{ child: React.ReactNode; column: number; top: number }> = [];
    
    childrenArray.forEach((child) => {
      const shortestColumnIndex = heights.indexOf(Math.min(...heights));
      const top = heights[shortestColumnIndex];
      
      arranged.push({
        child,
        column: shortestColumnIndex,
        top
      });
      
      // Estimate height (you might want to measure actual height)
      heights[shortestColumnIndex] += 200; // Placeholder height
    });
    
    return arranged;
  }, [childrenArray, columnHeights]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{
        columnCount,
        columnGap: `${gap * 0.25}rem`,
        columnFill: 'balance'
      }}
    >
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="break-inside-avoid mb-4"
          style={{ pageBreakInside: 'avoid' }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Card Grid
export const CardGrid: React.FC<CardGridProps> = ({
  children,
  minCardWidth = '300px',
  maxCardWidth = '1fr',
  gap = '1rem',
  className,
  autoFit = true
}) => {
  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: autoFit
          ? `repeat(auto-fit, minmax(${minCardWidth}, ${maxCardWidth}))`
          : `repeat(auto-fill, minmax(${minCardWidth}, ${maxCardWidth}))`,
        gap
      }}
    >
      {children}
    </div>
  );
};

// Aspect Ratio
export const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio = 16 / 9,
  children,
  className
}) => {
  const paddingTop = typeof ratio === 'string' ? ratio : `${(1 / ratio) * 100}%`;

  return (
    <div className={cn('relative w-full', className)}>
      <div style={{ paddingTop }} />
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
};

// Responsive Show/Hide
export const Show: React.FC<{
  above?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  below?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  only?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}> = ({ above, below, only, children }) => {
  const getClasses = () => {
    if (only) {
      return {
        sm: 'block sm:hidden',
        md: 'hidden sm:block md:hidden',
        lg: 'hidden md:block lg:hidden',
        xl: 'hidden lg:block xl:hidden',
        '2xl': 'hidden xl:block'
      }[only];
    }

    if (above && below) {
      return `hidden ${above}:block ${below}:hidden`;
    }

    if (above) {
      return `hidden ${above}:block`;
    }

    if (below) {
      return `block ${below}:hidden`;
    }

    return '';
  };

  return <div className={getClasses()}>{children}</div>;
};

// Layout Debugger (for development)
export const LayoutDebugger: React.FC<{ 
  enabled?: boolean; 
  showBreakpoints?: boolean;
  showGrid?: boolean;
}> = ({ 
  enabled = false, 
  showBreakpoints = true,
  showGrid = true 
}) => {
  const { breakpoint, windowSize } = useBreakpoint();

  if (!enabled) return null;

  return (
    <div className="fixed top-0 right-0 z-50 bg-black text-white p-2 text-xs font-mono">
      {showBreakpoints && (
        <div>
          <div>Breakpoint: {breakpoint}</div>
          <div>Size: {windowSize.width}x{windowSize.height}</div>
        </div>
      )}
      {showGrid && (
        <div className="fixed inset-0 pointer-events-none opacity-10">
          <div className="h-full bg-gradient-to-r from-transparent via-red-500 to-transparent bg-repeat-x" 
               style={{ backgroundSize: '100px 1px' }} />
          <div className="h-full bg-gradient-to-b from-transparent via-red-500 to-transparent bg-repeat-y" 
               style={{ backgroundSize: '1px 100px' }} />
        </div>
      )}
    </div>
  );
};

// Export hook
export { useBreakpoint };

// Export all components
export {
  type ResponsiveContainerProps,
  type GridLayoutProps,
  type FlexLayoutProps,
  type StackLayoutProps,
  type SidebarLayoutProps,
  type MasonryLayoutProps,
  type CardGridProps,
  type AspectRatioProps
};

export default {
  ResponsiveContainer,
  GridLayout,
  FlexLayout,
  StackLayout,
  SidebarLayout,
  MasonryLayout,
  CardGrid,
  AspectRatio,
  Show,
  LayoutDebugger,
  useBreakpoint
};