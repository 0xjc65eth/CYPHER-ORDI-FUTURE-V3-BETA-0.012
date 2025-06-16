'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'feature';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    this.logError(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('🚨 Error Boundary Caught Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      level: this.props.level || 'component',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    });

    // Send to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: this.props.level === 'page',
        custom_map: {
          error_id: this.state.errorId,
          component_stack: errorInfo.componentStack,
        },
      });
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    } else {
      // Max retries reached, reload page
      window.location.reload();
    }
  };

  private handleReportIssue = () => {
    const { error, errorInfo, errorId } = this.state;
    const reportData = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Open GitHub issues or support system
    const issueUrl = `https://github.com/cypher-ordi/issues/new?title=Error%20${errorId}&body=${encodeURIComponent(
      `**Error ID:** ${errorId}\n**Message:** ${error?.message}\n**URL:** ${window.location.href}\n**Stack:**\n\`\`\`\n${error?.stack}\n\`\`\``
    )}`;

    window.open(issueUrl, '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const isPageLevel = this.props.level === 'page';

      return (
        <div className={`min-h-screen bg-black flex items-center justify-center p-4 ${
          isPageLevel ? 'min-h-screen' : 'min-h-[400px]'
        }`}>
          <Card className="bg-gray-900 border-red-500/30 p-8 max-w-2xl w-full">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>
              </div>

              {/* Error Message */}
              <div>
                <h1 className="text-2xl font-bold text-red-400 font-mono mb-2">
                  {isPageLevel ? 'SYSTEM ERROR' : 'COMPONENT ERROR'}
                </h1>
                <p className="text-orange-500/80 mb-4">
                  {isPageLevel 
                    ? 'The application encountered an unexpected error'
                    : 'A component failed to render properly'
                  }
                </p>
                <div className="text-xs text-gray-400 font-mono">
                  Error ID: {errorId}
                </div>
              </div>

              {/* Error Details (if enabled) */}
              {this.props.showDetails && error && (
                <div className="text-left bg-black/50 p-4 rounded-lg border border-gray-700">
                  <div className="text-sm font-mono text-red-400 mb-2">
                    {error.message}
                  </div>
                  {error.stack && (
                    <pre className="text-xs text-gray-500 overflow-x-auto">
                      {error.stack.slice(0, 500)}...
                    </pre>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-orange-500 hover:bg-orange-600 text-black font-mono font-bold"
                  disabled={this.retryCount >= this.maxRetries}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  {this.retryCount >= this.maxRetries ? 'RELOAD PAGE' : 'RETRY'}
                  {this.retryCount > 0 && ` (${this.retryCount}/${this.maxRetries})`}
                </Button>

                {isPageLevel && (
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10 font-mono"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    GO TO DASHBOARD
                  </Button>
                )}

                <Button
                  onClick={this.handleReportIssue}
                  variant="outline"
                  className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10 font-mono"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  REPORT ISSUE
                </Button>
              </div>

              {/* Bloomberg Terminal Style Footer */}
              <div className="border-t border-gray-700 pt-4 text-xs text-gray-500 font-mono">
                CYPHER ORDi FUTURE V3 | Error Recovery System | 
                {new Date().toLocaleString()}
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Specific error boundaries for different levels
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
    {children}
  </ErrorBoundary>
);

export const FeatureErrorBoundary: React.FC<{ children: ReactNode; feature: string }> = ({ 
  children, 
  feature 
}) => (
  <ErrorBoundary 
    level="feature" 
    onError={(error) => console.error(`Feature ${feature} error:`, error)}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component">
    {children}
  </ErrorBoundary>
);