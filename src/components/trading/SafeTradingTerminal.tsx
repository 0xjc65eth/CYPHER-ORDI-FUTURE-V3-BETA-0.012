'use client';

import React from 'react';
import { useSafeCryptoPrice } from '@/hooks/useSafePrice';
import { ClientOnly } from '@/components/common/ClientOnly';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

interface SafeTradingTerminalProps {
  symbol: string;
  onTrade?: (action: 'buy' | 'sell', amount: number) => void;
}

const TradingTerminalContent: React.FC<SafeTradingTerminalProps> = ({ 
  symbol, 
  onTrade 
}) => {
  const { 
    formattedPrice, 
    high24h, 
    low24h, 
    volume, 
    isLoading, 
    error,
    mounted 
  } = useSafeCryptoPrice(symbol);

  if (!mounted || isLoading) {
    return (
      <Card className="p-6 bg-gray-900">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-400">Loading terminal...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-gray-900">
        <div className="text-center text-red-500">
          Failed to load trading data
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gray-900">
      <div className="space-y-4">
        {/* Header com preço */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">
              {symbol.replace('USDT', '/USDT')}
            </h3>
            <p className="text-sm text-gray-400">Spot Trading</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white" suppressHydrationWarning>
              {formattedPrice}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">24h High</p>
            <p className="font-semibold text-green-500" suppressHydrationWarning>
              {mounted ? `$${high24h.toFixed(2)}` : "..."}
            </p>
          </div>
          <div>
            <p className="text-gray-400">24h Low</p>
            <p className="font-semibold text-red-500" suppressHydrationWarning>
              {mounted ? `$${low24h.toFixed(2)}` : "..."}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Volume</p>
            <p className="font-semibold text-white" suppressHydrationWarning>
              {mounted ? `${(volume / 1000).toFixed(1)}K` : "..."}
            </p>
          </div>
        </div>

        {/* Quick Trade Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onTrade?.('buy', 100)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Buy
          </button>
          <button
            onClick={() => onTrade?.('sell', 100)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <TrendingDown className="w-4 h-4" />
            Sell
          </button>
        </div>
      </div>
    </Card>
  );
};

export const SafeTradingTerminal: React.FC<SafeTradingTerminalProps> = (props) => {
  return (
    <ClientOnly 
      fallback={
        <Card className="p-6 bg-gray-900">
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-400">Loading terminal...</div>
          </div>
        </Card>
      }
    >
      <TradingTerminalContent {...props} />
    </ClientOnly>
  );
};