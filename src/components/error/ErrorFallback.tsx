'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  showError?: boolean;
  level?: 'critical' | 'warning' | 'info';
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  showError = false,
  level = 'critical'
}) => {
  const getLevelStyles = () => {
    switch (level) {
      case 'critical':
        return {
          border: 'border-red-500/30',
          icon: 'text-red-400',
          title: 'text-red-400',
          bg: 'bg-red-500/20'
        };
      case 'warning':
        return {
          border: 'border-yellow-500/30',
          icon: 'text-yellow-400',
          title: 'text-yellow-400',
          bg: 'bg-yellow-500/20'
        };
      case 'info':
        return {
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
          title: 'text-blue-400',
          bg: 'bg-blue-500/20'
        };
      default:
        return {
          border: 'border-red-500/30',
          icon: 'text-red-400',
          title: 'text-red-400',
          bg: 'bg-red-500/20'
        };
    }
  };

  const styles = getLevelStyles();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className={`bg-gray-900 ${styles.border} p-8 max-w-md w-full`}>
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className={`w-16 h-16 ${styles.bg} rounded-full flex items-center justify-center`}>
              {level === 'critical' ? (
                <AlertTriangle className={`w-8 h-8 ${styles.icon}`} />
              ) : level === 'warning' ? (
                <TrendingDown className={`w-8 h-8 ${styles.icon}`} />
              ) : (
                <AlertTriangle className={`w-8 h-8 ${styles.icon}`} />
              )}
            </div>
          </div>

          {/* Error Message */}
          <div>
            <h2 className={`text-xl font-bold ${styles.title} font-mono mb-2`}>
              {title}
            </h2>
            <p className="text-orange-500/80 text-sm">
              {description}
            </p>
          </div>

          {/* Error Details */}
          {showError && error && (
            <div className="text-left bg-black/50 p-4 rounded-lg border border-gray-700">
              <div className="text-sm text-red-400 mb-2 font-mono">
                {error.message}
              </div>
              {error.stack && (
                <pre className="text-xs text-gray-500 overflow-x-auto max-h-32">
                  {error.stack}
                </pre>
              )}
            </div>
          )}

          {/* Retry Button */}
          {resetError && (
            <Button
              onClick={resetError}
              className="bg-orange-500 hover:bg-orange-600 text-black font-mono font-bold"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              TRY AGAIN
            </Button>
          )}

          {/* Bloomberg Terminal Style Footer */}
          <div className="text-xs text-gray-500 font-mono pt-4 border-t border-gray-700">
            CYPHER ORDi ERROR RECOVERY | {new Date().toLocaleTimeString()}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Specific fallback components for different scenarios
export const TradingErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="TRADING SYSTEM ERROR"
    description="The trading system encountered an error. Your funds are safe."
    level="critical"
  />
);

export const DataErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="DATA LOADING ERROR"
    description="Unable to load market data. Retrying automatically..."
    level="warning"
  />
);

export const WalletErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="WALLET CONNECTION ERROR"
    description="Please check your wallet connection and try again."
    level="warning"
  />
);

export const APIErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="API SERVICE ERROR"
    description="External service temporarily unavailable. Using cached data."
    level="info"
  />
);