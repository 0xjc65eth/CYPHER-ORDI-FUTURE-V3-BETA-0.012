'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import {
  Shield, AlertTriangle, CheckCircle, Clock, 
  Bitcoin, ArrowRight, Key, FileSignature,
  Lock, Unlock, Info, AlertCircle, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TransactionToSign, TransactionValidator } from '@/lib/auth/transaction-validator'

interface TransactionApprovalProps {
  transaction: TransactionToSign | null
  isOpen: boolean
  onClose: () => void
  onApprove: (signature: string) => void
  onReject: () => void
}

export default function TransactionApproval({
  transaction,
  isOpen,
  onClose,
  onApprove,
  onReject
}: TransactionApprovalProps) {
  const wallet = useWallet()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [verificationStep, setVerificationStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes

  // Countdown timer for transaction expiry
  useEffect(() => {
    if (!isOpen || !transaction) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, transaction])

  const handleExpired = () => {
    toast({
      title: 'Transaction Expired',
      description: 'This transaction has expired. Please try again.',
      variant: 'destructive'
    })
    onReject()
  }

  const handleApprove = async () => {
    if (!wallet.isConnected || !wallet.signMessage || !transaction) {
      setError('Wallet not connected or signing not supported')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Step 1: Prepare message
      setVerificationStep(1)
      const signingMessage = TransactionValidator.createSigningMessage(transaction)
      const humanMessage = TransactionValidator.createHumanReadableMessage(transaction)

      // Step 2: Request signature
      setVerificationStep(2)
      const signature = await wallet.signMessage(humanMessage)

      // Step 3: Verify locally
      setVerificationStep(3)
      await new Promise(resolve => setTimeout(resolve, 500)) // Brief delay for UX

      // Step 4: Complete
      setVerificationStep(4)
      
      toast({
        title: 'Transaction Approved',
        description: 'Your transaction has been signed successfully.',
      })

      onApprove(signature)
    } catch (error) {
      console.error('Transaction approval error:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign transaction')
      toast({
        title: 'Approval Failed',
        description: error instanceof Error ? error.message : 'Failed to sign transaction',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
      setVerificationStep(0)
    }
  }

  const formatBTC = (sats: number) => {
    return (sats / 100000000).toFixed(8)
  }

  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTransactionIcon = () => {
    switch (transaction?.type) {
      case 'transfer': return <ArrowRight className="w-5 h-5" />
      case 'inscription': return <FileSignature className="w-5 h-5" />
      case 'trade': return <Bitcoin className="w-5 h-5" />
      case 'swap': return <Bitcoin className="w-5 h-5" />
      default: return <Shield className="w-5 h-5" />
    }
  }

  const getTransactionColor = () => {
    switch (transaction?.type) {
      case 'transfer': return 'text-blue-500'
      case 'inscription': return 'text-purple-500'
      case 'trade': return 'text-green-500'
      case 'swap': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  if (!transaction) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => !isProcessing && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            Transaction Authorization Required
          </DialogTitle>
          <DialogDescription>
            Review and approve this transaction to continue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Type Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("gap-2", getTransactionColor())}>
              {getTransactionIcon()}
              {transaction.type.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeRemaining(timeRemaining)}
            </Badge>
          </div>

          {/* Transaction Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="font-mono text-xs">{transaction.id.slice(0, 8)}...</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">From:</span>
                  <span className="font-mono text-xs">
                    {transaction.from.slice(0, 6)}...{transaction.from.slice(-4)}
                  </span>
                </div>

                {transaction.to && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">To:</span>
                    <span className="font-mono text-xs">
                      {transaction.to.slice(0, 6)}...{transaction.to.slice(-4)}
                    </span>
                  </div>
                )}

                {transaction.amount !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Amount:</span>
                    <div className="flex items-center gap-1">
                      <Bitcoin className="w-3 h-3 text-orange-500" />
                      <span className="font-medium">{formatBTC(transaction.amount)} BTC</span>
                    </div>
                  </div>
                )}

                {transaction.message && (
                  <div className="space-y-1">
                    <span className="text-gray-400 text-sm">Message:</span>
                    <div className="bg-gray-900 p-2 rounded text-sm">
                      {transaction.message}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              You will be asked to sign a message with your wallet to authorize this transaction. 
              This signature proves you control the wallet and approve this action.
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Processing Steps */}
          {isProcessing && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="space-y-2">
                  <ProcessingStep 
                    step={1}
                    currentStep={verificationStep}
                    label="Preparing transaction"
                  />
                  <ProcessingStep 
                    step={2}
                    currentStep={verificationStep}
                    label="Requesting wallet signature"
                  />
                  <ProcessingStep 
                    step={3}
                    currentStep={verificationStep}
                    label="Verifying signature"
                  />
                  <ProcessingStep 
                    step={4}
                    currentStep={verificationStep}
                    label="Completing authorization"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onReject}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isProcessing || !wallet.isConnected}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Approve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Processing Step Component
function ProcessingStep({ 
  step, 
  currentStep, 
  label 
}: { 
  step: number
  currentStep: number
  label: string 
}) {
  const isActive = currentStep === step
  const isComplete = currentStep > step

  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
        isComplete && "bg-green-500 text-white",
        isActive && "bg-orange-500 text-white animate-pulse",
        !isActive && !isComplete && "bg-gray-800 text-gray-400"
      )}>
        {isComplete ? (
          <CheckCircle className="w-4 h-4" />
        ) : isActive ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <span className="text-sm">{step}</span>
        )}
      </div>
      <span className={cn(
        "text-sm",
        isActive && "text-white font-medium",
        isComplete && "text-green-500",
        !isActive && !isComplete && "text-gray-400"
      )}>
        {label}
      </span>
    </div>
  )
}