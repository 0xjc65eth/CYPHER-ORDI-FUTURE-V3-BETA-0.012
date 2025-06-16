'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

interface EnhancedLoadingProps {
  isLoading: boolean;
  error?: Error | null;
  timeout?: number; // milliseconds
  onRetry?: () => void;
  loadingText?: string;
  errorText?: string;
  timeoutText?: string;
  className?: string;
  variant?: 'minimal' | 'detailed' | 'card' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  progress?: number; // 0-100
  children?: React.ReactNode;
}

export function EnhancedLoading({
  isLoading,
  error,
  timeout = 30000,
  onRetry,
  loadingText = 'Loading...',
  errorText = 'Something went wrong',
  timeoutText = 'Request timed out',
  className,
  variant = 'minimal',
  size = 'md',
  showProgress = false,
  progress = 0,
  children
}: EnhancedLoadingProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      setRetryCount(0);
      return;
    }

    const timer = setTimeout(() => {
      setHasTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setHasTimedOut(false);
    onRetry?.();
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  // Show error state
  if (error || hasTimedOut) {
    const displayError = error?.message || (hasTimedOut ? timeoutText : errorText);
    
    if (variant === 'overlay') {
      return (
        <div className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
          className
        )}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{displayError}</p>
              {onRetry && (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry {retryCount > 0 && `(${retryCount})`}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (variant === 'card') {
      return (
        <div className={cn(
          "border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/10",
          className
        )}>
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              {hasTimedOut ? 'Request Timeout' : 'Error'}
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">{displayError}</p>
            {onRetry && (
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Try Again
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={cn("flex items-center gap-2 text-red-500", className)}>
        <AlertCircle className={sizeClasses[size]} />
        <span className="text-sm">{displayError}</span>
        {onRetry && (
          <button
            onClick={handleRetry}
            className="text-sm underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    if (variant === 'overlay') {
      return (
        <div className={cn(
          "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
          className
        )}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="font-medium">{loadingText}</p>
              {showProgress && (
                <div className="mt-4 w-48">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{progress}%</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (variant === 'card') {
      return (
        <div className={cn(
          "border rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50",
          className
        )}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="font-medium text-gray-700 dark:text-gray-300">{loadingText}</p>
            {showProgress && (
              <div className="mt-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{progress}%</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (variant === 'detailed') {
      return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
          <Loader2 className={cn("animate-spin text-blue-500", sizeClasses[size])} />
          <div className="text-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">{loadingText}</p>
            {showProgress && (
              <div className="mt-2 w-32">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{progress}%</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Minimal variant
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className={cn("animate-spin text-blue-500", sizeClasses[size])} />
        <span className="text-sm text-gray-600 dark:text-gray-400">{loadingText}</span>
      </div>
    );
  }

  // Show children when not loading and no error
  return <>{children}</>;
}

// Specialized loading components
export function DataTableLoading({ className }: { className?: string }) {
  return (
    <EnhancedLoading
      isLoading={true}
      variant="card"
      loadingText="Loading table data..."
      className={className}
    />
  );
}

export function ChartLoading({ className }: { className?: string }) {
  return (
    <EnhancedLoading
      isLoading={true}
      variant="card"
      loadingText="Loading chart..."
      className={className}
    />
  );
}

export function PageLoading({ className }: { className?: string }) {
  return (
    <EnhancedLoading
      isLoading={true}
      variant="overlay"
      loadingText="Loading page..."
      className={className}
    />
  );
}

// HOC for adding loading states to components
export function withLoading<P extends object>(
  Component: React.ComponentType<P>,
  loadingProps?: Partial<EnhancedLoadingProps>
) {
  return function LoadingWrapper(props: P & { isLoading?: boolean; error?: Error }) {
    const { isLoading, error, ...componentProps } = props;
    
    return (
      <EnhancedLoading
        isLoading={isLoading || false}
        error={error}
        {...loadingProps}
      >
        <Component {...(componentProps as P)} />
      </EnhancedLoading>
    );
  };
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setProgress(100);
  };

  const setLoadingError = (err: Error) => {
    setIsLoading(false);
    setError(err);
  };

  const updateProgress = (value: number) => {
    setProgress(Math.max(0, Math.min(100, value)));
  };

  const retry = () => {
    setError(null);
    setProgress(0);
    setIsLoading(true);
  };

  return {
    isLoading,
    error,
    progress,
    startLoading,
    stopLoading,
    setLoadingError,
    updateProgress,
    retry
  };
}

export default EnhancedLoading;