'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Interfaces
interface LoadingStateProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'skeleton' | 'bars' | 'ring' | 'bounce';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  text?: string;
  fullScreen?: boolean;
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangle' | 'circle' | 'card' | 'avatar';
  lines?: number;
  animate?: boolean;
}

interface LoadingOverlayProps {
  isVisible: boolean;
  variant?: LoadingStateProps['variant'];
  text?: string;
  backdrop?: boolean;
  className?: string;
}

// Utilidades
const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

const colorClasses = {
  primary: 'text-blue-500 border-blue-500',
  secondary: 'text-gray-500 border-gray-500',
  success: 'text-green-500 border-green-500',
  warning: 'text-yellow-500 border-yellow-500',
  error: 'text-red-500 border-red-500',
  info: 'text-cyan-500 border-cyan-500'
};

// Spinner Loading
export const SpinnerLoader: React.FC<LoadingStateProps> = ({
  className,
  size = 'md',
  color = 'primary',
  text
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-transparent border-t-current',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{
          animationDuration: '1s',
          animationTimingFunction: 'linear'
        }}
      />
      {text && (
        <p className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Dots Loading
export const DotsLoader: React.FC<LoadingStateProps> = ({
  className,
  size = 'md',
  color = 'primary',
  text
}) => {
  const dotSize = size === 'sm' ? 'w-1 h-1' : size === 'lg' ? 'w-3 h-3' : size === 'xl' ? 'w-4 h-4' : 'w-2 h-2';
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-pulse',
              dotSize,
              colorClasses[color].split(' ')[0].replace('text-', 'bg-')
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Pulse Loading
export const PulseLoader: React.FC<LoadingStateProps> = ({
  className,
  size = 'md',
  color = 'primary',
  text
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full animate-pulse',
          sizeClasses[size],
          colorClasses[color].split(' ')[0].replace('text-', 'bg-')
        )}
        style={{
          animationDuration: '2s'
        }}
      />
      {text && (
        <p className={cn('text-sm font-medium animate-pulse', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Wave Loading
export const WaveLoader: React.FC<LoadingStateProps> = ({
  className,
  size = 'md',
  color = 'primary',
  text
}) => {
  const barHeight = size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : size === 'xl' ? 'h-12' : 'h-6';
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className="flex items-end space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full animate-bounce',
              barHeight,
              colorClasses[color].split(' ')[0].replace('text-', 'bg-')
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Bars Loading
export const BarsLoader: React.FC<LoadingStateProps> = ({
  className,
  size = 'md',
  color = 'primary',
  text
}) => {
  const barWidth = size === 'sm' ? 'w-8' : size === 'lg' ? 'w-16' : size === 'xl' ? 'w-20' : 'w-12';
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className={cn('space-y-1', barWidth)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'h-1 rounded-full animate-pulse',
              colorClasses[color].split(' ')[0].replace('text-', 'bg-')
            )}
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Ring Loading
export const RingLoader: React.FC<LoadingStateProps> = ({
  className,
  size = 'md',
  color = 'primary',
  text
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-gray-200 border-t-current',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{
          animationDuration: '1s'
        }}
      />
      {text && (
        <p className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Bounce Loading
export const BounceLoader: React.FC<LoadingStateProps> = ({
  className,
  size = 'md',
  color = 'primary',
  text
}) => {
  const ballSize = size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : size === 'xl' ? 'w-6 h-6' : 'w-3 h-3';
  
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-bounce',
              ballSize,
              colorClasses[color].split(' ')[0].replace('text-', 'bg-')
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      {text && (
        <p className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  );
};

// Skeleton Loading
export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  lines = 3,
  animate = true
}) => {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700 rounded',
    animate && 'animate-pulse',
    className
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'circle':
        return <div className={cn(baseClasses, 'w-12 h-12 rounded-full')} />;
      
      case 'avatar':
        return <div className={cn(baseClasses, 'w-10 h-10 rounded-full')} />;
      
      case 'rectangle':
        return <div className={cn(baseClasses, 'w-full h-32')} />;
      
      case 'card':
        return (
          <div className="space-y-3">
            <div className={cn(baseClasses, 'w-full h-48')} />
            <div className={cn(baseClasses, 'w-3/4 h-4')} />
            <div className={cn(baseClasses, 'w-1/2 h-4')} />
          </div>
        );
      
      case 'text':
      default:
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  baseClasses,
                  'h-4',
                  i === lines - 1 ? 'w-3/4' : 'w-full'
                )}
              />
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
};

// Loading Overlay
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  variant = 'spinner',
  text = 'Loading...',
  backdrop = true,
  className
}) => {
  if (!isVisible) return null;

  const renderLoader = () => {
    const props = { size: 'lg' as const, color: 'primary' as const, text };
    
    switch (variant) {
      case 'dots':
        return <DotsLoader {...props} />;
      case 'pulse':
        return <PulseLoader {...props} />;
      case 'wave':
        return <WaveLoader {...props} />;
      case 'bars':
        return <BarsLoader {...props} />;
      case 'ring':
        return <RingLoader {...props} />;
      case 'bounce':
        return <BounceLoader {...props} />;
      case 'spinner':
      default:
        return <SpinnerLoader {...props} />;
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-black/50 backdrop-blur-sm',
        className
      )}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        {renderLoader()}
      </div>
    </div>
  );
};

// Main LoadingStates Component
export const LoadingStates: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  ...props
}) => {
  switch (variant) {
    case 'dots':
      return <DotsLoader {...props} />;
    case 'pulse':
      return <PulseLoader {...props} />;
    case 'wave':
      return <WaveLoader {...props} />;
    case 'bars':
      return <BarsLoader {...props} />;
    case 'ring':
      return <RingLoader {...props} />;
    case 'bounce':
      return <BounceLoader {...props} />;
    case 'skeleton':
      return <SkeletonLoader {...props} />;
    case 'spinner':
    default:
      return <SpinnerLoader {...props} />;
  }
};

// Export all components
export {
  type LoadingStateProps,
  type SkeletonProps,
  type LoadingOverlayProps
};

export default LoadingStates;