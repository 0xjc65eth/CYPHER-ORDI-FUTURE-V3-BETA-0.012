'use client';

import React from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';
import ArbitrageTerminal from '@/components/arbitrage/ArbitrageTerminal';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Demo credentials - In production, these should come from secure storage
const demoCredentials = {
  // Add your actual API credentials here for testing
  coinapi: {
    apiKey: process.env.NEXT_PUBLIC_COINAPI_KEY || 'demo-key',
    sandbox: true
  }
  // Note: Other exchanges require secure credential management
  // Uncomment and configure as needed:
  /*
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    apiSecret: process.env.BINANCE_API_SECRET || '',
    sandbox: true
  },
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY || '',
    apiSecret: process.env.COINBASE_API_SECRET || '',
    passphrase: process.env.COINBASE_PASSPHRASE || '',
    sandbox: true
  }
  */
};

const initialConfig = {
  minSpreadPercentage: 0.3,
  maxPositionSize: 500,
  enabledExchanges: ['coinapi'], // Start with CoinAPI for data
  enabledPairs: ['BTC/USDT', 'ETH/USDT', 'BTC/USD', 'ETH/USD'],
  autoExecute: false,
  riskLevel: 'CONSERVATIVE' as const,
  latencyThreshold: 2000
};

export default function ArbitragePage() {
  return (
    <TopNavLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-gray-400">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Advanced Arbitrage System</span>
            </div>
          </div>
          
          <div className="text-right">
            <h1 className="text-2xl font-bold text-white">CYPHER ARBITRAGE TERMINAL</h1>
            <p className="text-sm text-gray-400">Advanced cross-exchange arbitrage detection & automated execution</p>
          </div>
        </div>
        
        <ArbitrageTerminal 
          initialConfig={initialConfig}
          credentials={demoCredentials}
        />
      </div>
    </TopNavLayout>
  );
}