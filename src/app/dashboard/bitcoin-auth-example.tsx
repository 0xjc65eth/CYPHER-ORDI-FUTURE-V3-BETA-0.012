'use client';

import { BitcoinProtectedRoute } from '@/components/auth/BitcoinProtectedRoute';
import { BitcoinUserMenu } from '@/components/auth/BitcoinUserMenu';
import { useBitcoinAuth } from '@/hooks/useBitcoinAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Wallet, Shield, Key } from 'lucide-react';

export default function BitcoinAuthExamplePage() {
  return (
    <BitcoinProtectedRoute>
      <BitcoinAuthContent />
    </BitcoinProtectedRoute>
  );
}

function BitcoinAuthContent() {
  const { user, getFormattedAddress, getWalletName } = useBitcoinAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with user menu */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Bitcoin className="h-8 w-8 text-orange-500" />
              <h1 className="text-xl font-bold text-white">Bitcoin Authenticated Dashboard</h1>
            </div>
            <BitcoinUserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Welcome Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome to Your Bitcoin Dashboard
                </h2>
                <p className="text-gray-400">
                  You are authenticated using your Bitcoin wallet. This provides a secure, 
                  decentralized way to access your account without passwords.
                </p>
              </div>
              <Shield className="h-12 w-12 text-green-500" />
            </div>
          </Card>

          {/* Authentication Details */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-orange-500" />
              Authentication Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Wallet Type:</span>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                  {getWalletName()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Bitcoin Address:</span>
                <code className="text-sm text-gray-300 bg-gray-900 px-2 py-1 rounded">
                  {user?.address}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Display Address:</span>
                <span className="text-gray-300">{getFormattedAddress()}</span>
              </div>
            </div>
          </Card>

          {/* Features Card */}
          <Card className="bg-gray-800 border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-500" />
              Wallet Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-white">Supported Operations</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>✓ Sign messages for authentication</li>
                  <li>✓ Verify wallet ownership</li>
                  <li>✓ Access Bitcoin-specific features</li>
                  <li>✓ Manage Ordinals and Runes</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Security Benefits</h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>✓ No password storage</li>
                  <li>✓ Cryptographic authentication</li>
                  <li>✓ Hardware wallet support</li>
                  <li>✓ Full control of your keys</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}