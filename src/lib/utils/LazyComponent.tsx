'use client';

import React, { Suspense, ComponentType } from 'react';
import { Card } from '@/components/ui/card';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

const DefaultLoadingFallback = () => (
  <Card className="bg-gray-900 border-gray-700 p-8">
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-700 rounded w-1/3"></div>
      <div className="h-32 bg-gray-700 rounded"></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-20 bg-gray-700 rounded"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
        <div className="h-20 bg-gray-700 rounded"></div>
      </div>
    </div>
  </Card>
);

export function LazyComponent({ 
  children, 
  fallback = <DefaultLoadingFallback />, 
  delay = 0 
}: LazyComponentProps) {
  const [isReady, setIsReady] = React.useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setIsReady(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!isReady) {
    return <>{fallback}</>;
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// HOC for lazy loading heavy components
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  loadingComponent?: React.ComponentType
) {
  const LazyWrapper = (props: P) => {
    const LoadingFallback = loadingComponent || DefaultLoadingFallback;
    
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };

  LazyWrapper.displayName = `LazyLoaded(${Component.displayName || Component.name})`;
  return LazyWrapper;
}

// Hook for deferred component loading
export function useDeferredLoading(delay: number = 100) {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return shouldLoad;
}