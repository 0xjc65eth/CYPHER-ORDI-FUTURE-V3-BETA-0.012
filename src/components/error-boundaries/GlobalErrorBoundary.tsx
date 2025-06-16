'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EnhancedLogger } from '@/lib/enhanced-logger'

interface ErrorInfo {
  componentStack: string
  errorBoundary?: string
  errorBoundaryStack?: string
}

interface GlobalErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode
  fallbackComponent?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  maxRetries?: number
  enableReporting?: boolean
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: GlobalErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableReporting = true } = this.props
    
    // Enhanced logging with context
    const errorContext = {
      component: 'GlobalErrorBoundary',
      errorId: this.state.errorId,
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    }

    EnhancedLogger.error('Global Error Boundary Caught Error', errorContext)

    // Update state with error info
    this.setState({ errorInfo })

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo)
    }

    // Report to monitoring service if enabled
    if (enableReporting) {
      this.reportError(error, errorInfo, errorContext)
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo, context: any) => {
    try {
      // Send to monitoring service (implement your monitoring solution)
      if (typeof window !== 'undefined') {
        // Example: Send to Sentry, LogRocket, or custom monitoring
        console.warn('Error reported:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          context
        })
      }
    } catch (reportingError) {
      EnhancedLogger.error('Failed to report error', {
        originalError: error.message,
        reportingError: reportingError instanceof Error ? reportingError.message : 'Unknown reporting error'
      })
    }
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount < maxRetries) {
      EnhancedLogger.info('Retrying after error', {
        component: 'GlobalErrorBoundary',
        retryCount: retryCount + 1,
        maxRetries,
        errorId: this.state.errorId
      })

      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    } else {
      EnhancedLogger.warn('Max retries reached', {
        component: 'GlobalErrorBoundary',
        maxRetries,
        errorId: this.state.errorId
      })
    }
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state
    const { children, fallbackComponent: FallbackComponent, maxRetries = 3 } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (FallbackComponent) {
        return <FallbackComponent error={error} retry={this.handleRetry} />
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">
                Application Error
              </CardTitle>
              <CardDescription>
                Something went wrong in the CYPHER ORDi Future application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Error:</strong> {error.message}</p>
                    <p><strong>Error ID:</strong> {errorId}</p>
                    {retryCount > 0 && (
                      <p><strong>Retry Count:</strong> {retryCount}/{maxRetries}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Developer Information
                  </summary>
                  <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-60">
                    <p><strong>Stack Trace:</strong></p>
                    <pre className="whitespace-pre-wrap text-xs mt-2">{error.stack}</pre>
                    {errorInfo && (
                      <>
                        <p className="mt-4"><strong>Component Stack:</strong></p>
                        <pre className="whitespace-pre-wrap text-xs mt-2">{errorInfo.componentStack}</pre>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {retryCount < maxRetries && (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                <p>If this problem persists, please contact support with Error ID: {errorId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

// Convenience wrapper for functional components
export function withGlobalErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<GlobalErrorBoundaryProps>
) {
  return function WrappedComponent(props: P) {
    return (
      <GlobalErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </GlobalErrorBoundary>
    )
  }
}

export default GlobalErrorBoundary