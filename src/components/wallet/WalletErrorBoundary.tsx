'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state to trigger fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log wallet-specific errors
    console.error('Wallet Error Boundary caught an error:', error)
    console.error('Error Info:', errorInfo)
    
    // Check for specific BigInt errors
    if (error.message.includes('Cannot convert a BigInt value to a number')) {
      console.error('🚨 BigInt Conversion Error detected in wallet integration')
      console.error('This is likely due to LaserEyes library compatibility issues')
    }
    
    // Check for wallet extension conflicts
    if (error.message.includes('Multiple wallets detected') || 
        error.message.includes('wallet is already installed')) {
      console.error('🚨 Wallet Extension Conflict detected')
    }

    this.setState({
      error,
      errorInfo
    })
  }

  handleRetry = () => {
    // Clear error state and reload
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    
    // Optionally reload the page for critical wallet errors
    if (this.state.error?.message.includes('BigInt')) {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI for wallet errors
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isBigIntError = this.state.error?.message.includes('BigInt')
      const isWalletConflict = this.state.error?.message.includes('Multiple wallets') ||
                             this.state.error?.message.includes('wallet is already')

      return (
        <Card className="max-w-md mx-auto mt-8 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Wallet Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isBigIntError && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>BigInt Compatibility Issue:</strong> The wallet library encountered a number conversion error. 
                  This may be due to browser compatibility or wallet extension conflicts.
                </p>
              </div>
            )}
            
            {isWalletConflict && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Wallet Extension Conflict:</strong> Multiple wallet extensions are detected. 
                  Please disable conflicting wallets or use a different browser profile.
                </p>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p><strong>Error:</strong> {this.state.error?.message}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                size="sm"
              >
                Reload Page
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Debug Info (Dev Mode)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}