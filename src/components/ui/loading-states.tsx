/**
 * 🔄 LOADING STATES - CYPHER ORDi FUTURE V3
 * Componentes de loading e fallback para dados
 */

import React from 'react';
import { Card } from './card';
import { Skeleton } from './skeleton';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'blue' | 'green';
  className?: string;
}

export function LoadingSpinner({ size = 'md', color = 'orange', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16'
  };

  const colorClasses = {
    orange: 'border-orange-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} rounded-full animate-spin ${className}`} />
  );
}

interface TerminalLoadingProps {
  message?: string;
  subtitle?: string;
}

export function TerminalLoading({ message = 'LOADING DASHBOARD...', subtitle = 'BLOOMBERG TERMINAL' }: TerminalLoadingProps) {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <LoadingSpinner size="lg" color="orange" className="mx-auto" />
        </div>
        <h2 className="text-xl font-mono text-orange-500">{subtitle}</h2>
        <p className="text-sm text-orange-500/60 font-mono mt-2">{message}</p>
      </div>
    </div>
  );
}

interface DataLoadingCardProps {
  title: string;
  rows?: number;
  columns?: number;
  className?: string;
}

export function DataLoadingCard({ title, rows = 3, columns = 2, className = '' }: DataLoadingCardProps) {
  return (
    <Card className={`bg-gray-900 border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24 bg-gray-800" />
        <Skeleton className="h-4 w-16 bg-gray-800" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-20 bg-gray-800" />
            <Skeleton className="h-4 w-16 bg-gray-800" />
          </div>
        ))}
      </div>
    </Card>
  );
}

interface GridLoadingProps {
  cards: number;
  className?: string;
}

export function GridLoading({ cards = 6, className = '' }: GridLoadingProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: cards }).map((_, i) => (
        <DataLoadingCard key={i} title="Loading..." />
      ))}
    </div>
  );
}

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorFallback({ 
  title = 'Data Unavailable', 
  message = 'Unable to load data. Please try again.', 
  onRetry,
  className = '' 
}: ErrorFallbackProps) {
  return (
    <Card className={`bg-gray-900 border-red-500/50 p-6 text-center ${className}`}>
      <div className="text-red-500 mb-2">⚠️</div>
      <h3 className="text-red-400 font-medium mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm"
        >
          Retry
        </button>
      )}
    </Card>
  );
}

interface SafeDataDisplayProps {
  data: any;
  fallback?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: (data: any) => React.ReactNode;
}

export function SafeDataDisplay({ 
  data, 
  fallback, 
  loading = false, 
  error = null, 
  onRetry,
  children 
}: SafeDataDisplayProps) {
  if (loading) {
    return <DataLoadingCard title="Loading..." />;
  }

  if (error) {
    return <ErrorFallback message={error} onRetry={onRetry} />;
  }

  if (!data) {
    return fallback || <ErrorFallback title="No Data" message="No data available to display" onRetry={onRetry} />;
  }

  try {
    return <>{children(data)}</>;
  } catch (renderError) {
    console.error('SafeDataDisplay render error:', renderError);
    return <ErrorFallback title="Display Error" message="Error rendering data" onRetry={onRetry} />;
  }
}

interface BloombergLoadingProps {
  sections?: string[];
}

export function BloombergLoading({ sections = ['Market Data', 'Portfolio', 'Trading Bot', 'Analytics'] }: BloombergLoadingProps) {
  return (
    <div className="bg-black min-h-screen pt-20 p-4">
      <div className="border-b-2 border-orange-500 mb-6">
        <div className="grid grid-cols-12 gap-0 text-orange-500 font-mono text-xs">
          <div className="col-span-2 p-3 border-r border-orange-500/30">
            <Skeleton className="h-4 w-16 bg-orange-500/20" />
          </div>
          <div className="col-span-10 p-3 flex justify-between">
            <Skeleton className="h-4 w-32 bg-orange-500/20" />
            <Skeleton className="h-4 w-24 bg-orange-500/20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {sections.map((section, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32 bg-gray-800" />
                <Skeleton className="h-4 w-16 bg-gray-800" />
              </div>
              <GridLoading cards={3} />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <DataLoadingCard title="Live Activity" rows={5} />
          <DataLoadingCard title="Mining Metrics" rows={4} />
          <DataLoadingCard title="Trading Opportunities" rows={6} />
        </div>
      </div>
    </div>
  );
}

export default {
  LoadingSpinner,
  TerminalLoading,
  DataLoadingCard,
  GridLoading,
  ErrorFallback,
  SafeDataDisplay,
  BloombergLoading
};