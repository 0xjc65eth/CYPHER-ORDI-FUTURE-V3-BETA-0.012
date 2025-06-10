'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import SecureTransaction from '@/components/wallet/SecureTransaction'
import { 
  Shield, Lock, Key, CheckCircle, 
  FileSignature, AlertTriangle, Info,
  Zap, Bitcoin, ArrowRight
} from 'lucide-react'

export default function SecureTransactionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold">Secure Transaction System</h1>
        </div>
        <p className="text-gray-400 text-lg">
          Sign and authorize Bitcoin transactions securely with your wallet
        </p>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-blue-500" />
              Message Signing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              All transactions require cryptographic signatures from your wallet, 
              ensuring only you can authorize transfers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="w-5 h-5 text-green-500" />
              Private Key Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Your private keys never leave your wallet. We only request signatures 
              for transaction authorization.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              Validation API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Server-side validation ensures all transactions are properly 
              authorized before execution.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Transaction Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction Form */}
        <div>
          <SecureTransaction />
        </div>

        {/* How It Works */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-500">1</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Create Transaction</h4>
                  <p className="text-sm text-gray-400">
                    Enter transaction details like recipient and amount
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-500">2</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Review & Sign</h4>
                  <p className="text-sm text-gray-400">
                    Review transaction details and sign with your wallet
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-500">3</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Server Validation</h4>
                  <p className="text-sm text-gray-400">
                    Signature is verified server-side for security
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-orange-500">4</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Execute Transaction</h4>
                  <p className="text-sm text-gray-400">
                    Upon successful validation, transaction is executed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Time-based Expiry</p>
                  <p className="text-xs text-gray-400">
                    Transactions expire after 5 minutes for security
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Rate Limiting</p>
                  <p className="text-xs text-gray-400">
                    Prevents spam and protects against attacks
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address Validation</p>
                  <p className="text-xs text-gray-400">
                    All Bitcoin addresses are validated before use
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Nonce Protection</p>
                  <p className="text-xs text-gray-400">
                    Unique nonces prevent replay attacks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Important:</strong> Always verify transaction details in your 
              wallet before signing. Never sign messages you don&apos;t understand.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Transaction Types */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Supported Transaction Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="w-5 h-5 text-orange-500" />
                Bitcoin Transfer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-3">
                Send Bitcoin to any address with secure wallet authorization
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">P2PKH</Badge>
                <Badge variant="secondary">P2SH</Badge>
                <Badge variant="secondary">Bech32</Badge>
                <Badge variant="secondary">Taproot</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-purple-500" />
                Ordinals Inscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-3">
                Create inscriptions on the Bitcoin blockchain securely
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Text</Badge>
                <Badge variant="secondary">Images</Badge>
                <Badge variant="secondary">JSON</Badge>
                <Badge variant="secondary">HTML</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-green-500" />
                Token Swap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-3">
                Swap between different tokens with signature verification
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">BTC</Badge>
                <Badge variant="secondary">ORDI</Badge>
                <Badge variant="secondary">SATS</Badge>
                <Badge variant="secondary">RUNES</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}