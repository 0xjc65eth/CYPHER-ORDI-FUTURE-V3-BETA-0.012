'use client'

import React from 'react'
import { TrendingUp, RefreshCw, AlertTriangle, DollarSign, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { EnhancedLogger } from '@/lib/enhanced-logger'

interface TradingErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorCategory: 'execution' | 'market_data' | 'risk_management' | 'position' | 'api' | 'validation' | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  retryCount: number
  safeMode: boolean
  tradingHalted: boolean
}

interface TradingErrorBoundaryProps {
  children: React.ReactNode
  tradingModule?: string
  enableSafeMode?: boolean
  onError?: (error: Error, category: string, severity: string) => void
  onTradingHalt?: () => void
  maxRetries?: number
  riskThreshold?: number
}

export class TradingErrorBoundary extends React.Component<TradingErrorBoundaryProps, TradingErrorBoundaryState> {
  constructor(props: TradingErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorCategory: 'unknown',
      severity: 'medium',
      retryCount: 0,
      safeMode: false,
      tradingHalted: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<TradingErrorBoundaryState> {
    const errorMessage = error.message.toLowerCase()
    const errorStack = error.stack?.toLowerCase() || ''
    
    // Categorize trading errors
    let errorCategory: TradingErrorBoundaryState['errorCategory'] = 'unknown'
    let severity: TradingErrorBoundaryState['severity'] = 'medium'
    
    if (errorMessage.includes('order') || errorMessage.includes('execution') || errorMessage.includes('trade')) {
      errorCategory = 'execution'
      severity = 'high'
    } else if (errorMessage.includes('price') || errorMessage.includes('market') || errorMessage.includes('data')) {
      errorCategory = 'market_data'
      severity = 'medium'
    } else if (errorMessage.includes('risk') || errorMessage.includes('limit') || errorMessage.includes('exposure')) {
      errorCategory = 'risk_management'
      severity = 'critical'
    } else if (errorMessage.includes('position') || errorMessage.includes('balance') || errorMessage.includes('portfolio')) {
      errorCategory = 'position'
      severity = 'high'
    } else if (errorMessage.includes('api') || errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      errorCategory = 'api'
      severity = 'medium'
    } else if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('format')) {
      errorCategory = 'validation'
      severity = 'low'
    }

    // Determine if trading should be halted
    const tradingHalted = severity === 'critical' || errorCategory === 'risk_management'

    return {
      hasError: true,
      error,
      errorCategory,
      severity,
      tradingHalted
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { tradingModule = 'Unknown Trading Module', onError, onTradingHalt } = this.props
    const { errorCategory, severity, tradingHalted } = this.state
    
    const tradingErrorContext = {
      component: 'TradingErrorBoundary',
      tradingModule,
      errorCategory,
      severity,
      tradingHalted,
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      tradingSpecificData: {
        riskLevel: this.calculateRiskLevel(errorCategory, severity),
        recommendedActions: this.getRecommendedActions(errorCategory, severity),
        marketImpact: this.assessMarketImpact(errorCategory)
      }
    }

    EnhancedLogger.error('Trading Error Boundary Caught Error', tradingErrorContext)

    if (onError) {
      onError(error, errorCategory, severity)
    }

    if (tradingHalted && onTradingHalt) {
      onTradingHalt()
    }

    // Enable safe mode for certain errors
    if (severity === 'high' || severity === 'critical') {
      this.setState({ safeMode: true })
    }
  }

  private calculateRiskLevel = (category: string, severity: string): number => {
    const baseRisk = {
      'execution': 0.8,
      'market_data': 0.4,
      'risk_management': 1.0,
      'position': 0.7,
      'api': 0.3,
      'validation': 0.2,
      'unknown': 0.5
    }[category] || 0.5

    const severityMultiplier = {
      'low': 0.5,
      'medium': 0.75,
      'high': 1.0,
      'critical': 1.5
    }[severity] || 1.0

    return Math.min(baseRisk * severityMultiplier, 1.0)
  }

  private getRecommendedActions = (category: string, severity: string): string[] => {
    const actions: Record<string, string[]> = {
      'execution': [
        'Halt all active orders',
        'Review order execution logs',
        'Check exchange connectivity',
        'Verify account permissions'
      ],
      'market_data': [
        'Switch to backup data provider',
        'Verify price feed accuracy',
        'Check market hours',
        'Review data latency'
      ],
      'risk_management': [
        'IMMEDIATE: Stop all trading',
        'Review position sizes',
        'Check exposure limits',
        'Perform risk assessment'
      ],
      'position': [
        'Verify portfolio state',
        'Check position accuracy',
        'Review balance calculations',
        'Reconcile with exchange'
      ],
      'api': [
        'Check API connectivity',
        'Verify API credentials',
        'Review rate limits',
        'Switch to backup endpoints'
      ],
      'validation': [
        'Review input parameters',
        'Check data formats',
        'Verify business rules',
        'Update validation logic'
      ]
    }

    return actions[category] || ['Generic error recovery', 'Review system logs', 'Contact support']
  }

  private assessMarketImpact = (category: string): 'none' | 'low' | 'medium' | 'high' => {
    const impact = {
      'execution': 'high',
      'market_data': 'medium',
      'risk_management': 'high',
      'position': 'medium',
      'api': 'low',
      'validation': 'none'
    }[category] as 'none' | 'low' | 'medium' | 'high'

    return impact || 'low'
  }

  private handleRetry = () => {
    const { maxRetries = 2 } = this.props // Lower retry count for trading
    
    if (this.state.retryCount < maxRetries && this.state.severity !== 'critical') {
      EnhancedLogger.info('Trading Error Boundary - Retrying', {
        component: 'TradingErrorBoundary',
        retryCount: this.state.retryCount + 1,
        errorCategory: this.state.errorCategory
      })

      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  private handleSafeMode = () => {
    this.setState({ safeMode: true })
    EnhancedLogger.info('Trading Safe Mode Activated', {
      component: 'TradingErrorBoundary',
      errorCategory: this.state.errorCategory
    })
  }

  private handleEmergencyStop = () => {
    EnhancedLogger.warn('Trading Emergency Stop Activated', {
      component: 'TradingErrorBoundary',
      errorCategory: this.state.errorCategory,
      severity: this.state.severity
    })

    // In a real app, this would trigger emergency stop procedures
    alert('EMERGENCY STOP: All trading activities have been halted!')
  }

  private getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  render() {
    const { hasError, error, errorCategory, severity, retryCount, safeMode, tradingHalted } = this.state
    const { children, tradingModule = 'Trading Module', maxRetries = 2 } = this.props

    if (hasError && error) {
      const riskLevel = this.calculateRiskLevel(errorCategory, severity)
      const marketImpact = this.assessMarketImpact(errorCategory)
      const canRetry = retryCount < maxRetries && severity !== 'critical'

      return (
        <div className="p-6">
          <Card className="w-full border-red-200 bg-red-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-800 flex items-center justify-center gap-2">
                Trading System Error
                {tradingHalted && <Shield className="w-5 h-5 text-red-600" />}
              </CardTitle>
              <CardDescription className="text-red-700">
                {tradingModule} encountered a trading-related issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className={this.getSeverityColor(severity)}>
                  {severity.toUpperCase()} SEVERITY
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {errorCategory.replace('_', ' ').toUpperCase()}
                </Badge>
                {tradingHalted && (
                  <Badge variant="destructive">
                    TRADING HALTED
                  </Badge>
                )}
                {safeMode && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                    SAFE MODE
                  </Badge>
                )}
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Error:</strong> {error.message}</p>
                    <p><strong>Risk Level:</strong> {Math.round(riskLevel * 100)}%</p>
                    <p><strong>Market Impact:</strong> {marketImpact.toUpperCase()}</p>
                    {retryCount > 0 && (
                      <p><strong>Retry Attempts:</strong> {retryCount}/{maxRetries}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Recommended Actions:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                  {this.getRecommendedActions(errorCategory, severity).map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry} 
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Trading
                  </Button>
                )}
                
                {!safeMode && severity !== 'critical' && (
                  <Button 
                    variant="outline" 
                    onClick={this.handleSafeMode}
                    className="flex items-center gap-2 border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <Shield className="w-4 h-4" />
                    Enable Safe Mode
                  </Button>
                )}
                
                {(severity === 'high' || severity === 'critical') && (
                  <Button 
                    variant="destructive"
                    onClick={this.handleEmergencyStop}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Emergency Stop
                  </Button>
                )}
              </div>

              <div className="text-xs text-red-600 text-center pt-2 space-y-1">
                <p>⚠️ Trading functionality may be impacted</p>
                {tradingHalted && (
                  <p className="font-semibold">🛑 All trading operations are currently halted for safety</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

// HOC wrapper for trading components
export function withTradingErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  tradingModule: string,
  boundaryProps?: Partial<TradingErrorBoundaryProps>
) {
  return function WrappedTradingComponent(props: P) {
    return (
      <TradingErrorBoundary tradingModule={tradingModule} {...boundaryProps}>
        <Component {...props} />
      </TradingErrorBoundary>
    )
  }
}

export default TradingErrorBoundary