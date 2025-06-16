'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWallet } from '@/contexts/WalletContext'
import { useToast } from '@/components/ui/use-toast'
import {
  Shield, CheckCircle, XCircle, AlertTriangle,
  Activity, Clock, TrendingUp, Lock, Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidationMetrics {
  totalTransactions: number
  validatedTransactions: number
  pendingValidations: number
  failedValidations: number
  successRate: number
  averageValidationTime: number
}

export function TransactionValidationWidget() {
  const wallet = useWallet()
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<ValidationMetrics>({
    totalTransactions: 0,
    validatedTransactions: 0,
    pendingValidations: 0,
    failedValidations: 0,
    successRate: 100,
    averageValidationTime: 0
  })
  const [recentValidations, setRecentValidations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading validation data
    const loadValidationData = async () => {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data - in real app, this would come from your backend
      const mockMetrics: ValidationMetrics = {
        totalTransactions: 156,
        validatedTransactions: 148,
        pendingValidations: 3,
        failedValidations: 5,
        successRate: 94.9,
        averageValidationTime: 2.4
      }
      
      const mockRecent = [
        {
          id: '1',
          type: 'transfer',
          amount: 0.0045,
          status: 'validated',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          validationTime: 2.1
        },
        {
          id: '2',
          type: 'inscription',
          amount: 0.00012,
          status: 'validated',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          validationTime: 3.2
        },
        {
          id: '3',
          type: 'trade',
          amount: 0.125,
          status: 'pending',
          timestamp: new Date(Date.now() - 1000 * 60 * 2),
          validationTime: null
        }
      ]
      
      setMetrics(mockMetrics)
      setRecentValidations(mockRecent)
      setIsLoading(false)
    }
    
    loadValidationData()
    
    // Set up polling for real-time updates
    const interval = setInterval(loadValidationData, 30000)
    return () => clearInterval(interval)
  }, [wallet.isConnected])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-500/20 text-green-400'
      case 'failed':
        return 'bg-red-500/20 text-red-400'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return `${Math.floor(hours / 24)}d ago`
  }

  if (!wallet.isConnected) {
    return (
      <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Transaction Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Connect your wallet to view transaction validation metrics
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 backdrop-blur-sm border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" />
          Transaction Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Success Rate</span>
              <Badge className="bg-green-500/20 text-green-400">
                {metrics.successRate}%
              </Badge>
            </div>
            <Progress value={metrics.successRate} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Avg. Time</span>
              <Badge className="bg-blue-500/20 text-blue-400">
                {metrics.averageValidationTime}s
              </Badge>
            </div>
            <Progress value={(metrics.averageValidationTime / 5) * 100} className="h-2" />
          </div>
        </div>

        {/* Status Counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Validated</span>
              <CheckCircle className="w-3 h-3 text-green-500" />
            </div>
            <div className="text-lg font-bold text-green-400">
              {metrics.validatedTransactions}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Pending</span>
              <Clock className="w-3 h-3 text-yellow-500" />
            </div>
            <div className="text-lg font-bold text-yellow-400">
              {metrics.pendingValidations}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Failed</span>
              <XCircle className="w-3 h-3 text-red-500" />
            </div>
            <div className="text-lg font-bold text-red-400">
              {metrics.failedValidations}
            </div>
          </div>
        </div>

        {/* Recent Validations */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Validations</h4>
          <div className="space-y-2">
            {recentValidations.map((validation) => (
              <div
                key={validation.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(validation.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-200">
                        {validation.type.charAt(0).toUpperCase() + validation.type.slice(1)}
                      </span>
                      <Badge className={cn("text-xs", getStatusColor(validation.status))}>
                        {validation.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      {validation.amount} BTC • {formatTime(validation.timestamp)}
                    </div>
                  </div>
                </div>
                {validation.validationTime && (
                  <div className="text-xs text-gray-400">
                    {validation.validationTime}s
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <Alert className="bg-orange-500/10 border-orange-500/30">
          <Lock className="w-4 h-4 text-orange-500" />
          <AlertDescription className="text-gray-300">
            All transactions are validated using multi-signature security protocols
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}