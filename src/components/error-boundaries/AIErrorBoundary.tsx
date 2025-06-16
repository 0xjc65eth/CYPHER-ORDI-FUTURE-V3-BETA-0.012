'use client'

import React from 'react'
import { Brain, RefreshCw, AlertTriangle, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EnhancedLogger } from '@/lib/enhanced-logger'

interface AIErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorType: 'ai_model' | 'training' | 'inference' | 'data_processing' | 'api_connection' | 'unknown'
  retryCount: number
  isRecovering: boolean
}

interface AIErrorBoundaryProps {
  children: React.ReactNode
  aiModuleName?: string
  fallbackMode?: 'graceful' | 'manual' | 'offline'
  onError?: (error: Error, errorType: string) => void
  maxRetries?: number
}

export class AIErrorBoundary extends React.Component<AIErrorBoundaryProps, AIErrorBoundaryState> {
  private recoveryTimeoutId: NodeJS.Timeout | null = null

  constructor(props: AIErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorType: 'unknown',
      retryCount: 0,
      isRecovering: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AIErrorBoundaryState> {
    // Classify error type based on error message/stack
    let errorType: AIErrorBoundaryState['errorType'] = 'unknown'
    
    const errorMessage = error.message.toLowerCase()
    const errorStack = error.stack?.toLowerCase() || ''
    
    if (errorMessage.includes('model') || errorMessage.includes('tensorflow') || errorMessage.includes('ml')) {
      errorType = 'ai_model'
    } else if (errorMessage.includes('training') || errorMessage.includes('learning')) {
      errorType = 'training'
    } else if (errorMessage.includes('inference') || errorMessage.includes('predict')) {
      errorType = 'inference'
    } else if (errorMessage.includes('data') || errorMessage.includes('feature')) {
      errorType = 'data_processing'
    } else if (errorMessage.includes('api') || errorMessage.includes('fetch') || errorMessage.includes('network')) {
      errorType = 'api_connection'
    }

    return {
      hasError: true,
      error,
      errorType
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { aiModuleName = 'Unknown AI Module', onError } = this.props
    
    const aiErrorContext = {
      component: 'AIErrorBoundary',
      aiModule: aiModuleName,
      errorType: this.state.errorType,
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      aiSpecificData: {
        possibleCauses: this.getAICauses(this.state.errorType),
        recoveryStrategies: this.getRecoveryStrategies(this.state.errorType)
      }
    }

    EnhancedLogger.error('AI Error Boundary Caught Error', aiErrorContext)

    if (onError) {
      onError(error, this.state.errorType)
    }

    // Attempt graceful recovery for certain AI errors
    this.attemptGracefulRecovery()
  }

  private getAICauses = (errorType: AIErrorBoundaryState['errorType']): string[] => {
    switch (errorType) {
      case 'ai_model':
        return ['Model not loaded', 'Invalid model weights', 'Model version mismatch']
      case 'training':
        return ['Insufficient training data', 'Learning rate issues', 'Convergence problems']
      case 'inference':
        return ['Invalid input data', 'Model prediction failure', 'Memory constraints']
      case 'data_processing':
        return ['Data format issues', 'Feature extraction failure', 'Data preprocessing error']
      case 'api_connection':
        return ['AI service unavailable', 'API rate limits', 'Network connectivity']
      default:
        return ['Unknown AI error']
    }
  }

  private getRecoveryStrategies = (errorType: AIErrorBoundaryState['errorType']): string[] => {
    switch (errorType) {
      case 'ai_model':
        return ['Reload model', 'Use fallback model', 'Switch to offline mode']
      case 'training':
        return ['Reset training state', 'Adjust parameters', 'Use pretrained model']
      case 'inference':
        return ['Retry with cleaned data', 'Use simplified model', 'Return cached results']
      case 'data_processing':
        return ['Validate input data', 'Use alternative preprocessing', 'Skip advanced features']
      case 'api_connection':
        return ['Retry connection', 'Use cached responses', 'Switch to local AI']
      default:
        return ['Generic recovery']
    }
  }

  private attemptGracefulRecovery = async () => {
    const { fallbackMode = 'graceful' } = this.props
    
    if (fallbackMode === 'graceful' && this.state.retryCount < 2) {
      this.setState({ isRecovering: true })
      
      // Simulate AI recovery process
      this.recoveryTimeoutId = setTimeout(() => {
        EnhancedLogger.info('AI Recovery attempted', {
          component: 'AIErrorBoundary',
          errorType: this.state.errorType,
          retryCount: this.state.retryCount
        })
        
        this.setState({ isRecovering: false })
      }, 3000)
    }
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    
    if (this.state.retryCount < maxRetries) {
      EnhancedLogger.info('AI Error Boundary - Retrying', {
        component: 'AIErrorBoundary',
        retryCount: this.state.retryCount + 1,
        errorType: this.state.errorType
      })

      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
        isRecovering: false
      }))
    }
  }

  private handleFallbackMode = () => {
    EnhancedLogger.info('AI Error Boundary - Switching to fallback mode', {
      component: 'AIErrorBoundary',
      errorType: this.state.errorType
    })

    // Redirect to a simplified version or show fallback UI
    if (typeof window !== 'undefined') {
      window.location.href = '/?ai_fallback=true'
    }
  }

  componentWillUnmount() {
    if (this.recoveryTimeoutId) {
      clearTimeout(this.recoveryTimeoutId)
    }
  }

  render() {
    const { hasError, error, errorType, retryCount, isRecovering } = this.state
    const { children, aiModuleName = 'AI Module', maxRetries = 3 } = this.props

    if (isRecovering) {
      return (
        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center space-y-4 pt-6">
              <div className="animate-spin">
                <Cpu className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold">AI Recovery in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Attempting to restore {aiModuleName}...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (hasError && error) {
      return (
        <div className="p-6">
          <Card className="w-full border-orange-200 bg-orange-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-orange-800">
                AI Module Error
              </CardTitle>
              <CardDescription className="text-orange-700">
                {aiModuleName} encountered an issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <div className="space-y-2">
                    <p><strong>Error Type:</strong> {errorType.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Message:</strong> {error.message}</p>
                    {retryCount > 0 && (
                      <p><strong>Attempts:</strong> {retryCount}/{maxRetries}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">Possible Causes:</h4>
                  <ul className="list-disc list-inside space-y-1 text-orange-700">
                    {this.getAICauses(errorType).map((cause, index) => (
                      <li key={index}>{cause}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-2">Recovery Options:</h4>
                  <ul className="list-disc list-inside space-y-1 text-orange-700">
                    {this.getRecoveryStrategies(errorType).map((strategy, index) => (
                      <li key={index}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {retryCount < maxRetries && (
                  <Button 
                    onClick={this.handleRetry} 
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry AI Module
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={this.handleFallbackMode}
                  className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Brain className="w-4 h-4" />
                  Use Fallback Mode
                </Button>
              </div>

              <div className="text-xs text-orange-600 text-center pt-2">
                <p>AI functionality may be limited until recovery is complete</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

// HOC wrapper for AI components
export function withAIErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  aiModuleName: string,
  boundaryProps?: Partial<AIErrorBoundaryProps>
) {
  return function WrappedAIComponent(props: P) {
    return (
      <AIErrorBoundary aiModuleName={aiModuleName} {...boundaryProps}>
        <Component {...props} />
      </AIErrorBoundary>
    )
  }
}

export default AIErrorBoundary