'use client';

import React from 'react';
import { SmartQuickTrade } from '@/components/dashboard/SmartQuickTrade';
import QuickTrade from '@/components/dashboard/QuickTrade';
import { FractionalTradeTest } from '@/components/dashboard/FractionalTradeTest';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Zap, TestTube } from 'lucide-react';

export default function FractionalTradingDemo() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Smart Fractional Trading Demo
          </h1>
          <p className="text-gray-400 text-lg">
            Convert any USD amount to crypto with automatic fractionation
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="smart" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
            <TabsTrigger value="smart" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Smart Trade
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Enhanced Quick Trade
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Test Suite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="smart" className="mt-8">
            <div className="max-w-2xl mx-auto">
              <SmartQuickTrade />
            </div>
          </TabsContent>

          <TabsContent value="enhanced" className="mt-8">
            <div className="max-w-2xl mx-auto">
              <QuickTrade />
            </div>
          </TabsContent>

          <TabsContent value="test" className="mt-8">
            <FractionalTradeTest />
          </TabsContent>
        </Tabs>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Start with $10
            </h3>
            <p className="text-gray-400">
              No minimum investment required. Buy fractions of Bitcoin, Ethereum, or any supported crypto starting from just $10.
            </p>
          </Card>

          <Card className="p-6 bg-gray-900 border-gray-800">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              Automatic Conversion
            </h3>
            <p className="text-gray-400">
              Smart system automatically calculates fractional amounts based on real-time prices from multiple exchanges.
            </p>
          </Card>

          <Card className="p-6 bg-gray-900 border-gray-800">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-500" />
              Multi-Network Support
            </h3>
            <p className="text-gray-400">
              Trade on Bitcoin, Ethereum, BSC, Polygon, and Solana networks with optimized fees for each chain.
            </p>
          </Card>
        </div>

        {/* Examples Section */}
        <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Fractional Trading Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-yellow-400">$10 Investment Examples:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
                  <span>$10 → Bitcoin</span>
                  <span className="font-mono">≈ 0.00020000 BTC</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
                  <span>$10 → Ethereum</span>
                  <span className="font-mono">≈ 0.00333333 ETH</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
                  <span>$10 → Solana</span>
                  <span className="font-mono">≈ 0.10000000 SOL</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-800 rounded-lg">
                  <span>$10 → Ordinals</span>
                  <span className="font-mono">≈ 0.20000000 ORDI</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Benefits:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>No need to calculate complex decimal amounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Automatic best price discovery across exchanges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Real-time validation prevents invalid orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Network fee optimization for small amounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Perfect for DCA (Dollar Cost Averaging)</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-xl font-bold mb-4">How to Test:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>Go to the &quot;Smart Trade&quot; tab and try the $10 quick examples</li>
            <li>Select different networks to see fee differences</li>
            <li>Use the &quot;Test Suite&quot; tab to run automated tests</li>
            <li>Try custom amounts in USD or crypto currencies</li>
            <li>Check the validation messages for helpful tips</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

// Import additional icons
import { DollarSign, Calculator, Network } from 'lucide-react';