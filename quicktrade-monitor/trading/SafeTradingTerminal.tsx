'use client';

import React from 'react';
import { useSafePrice } from '@/hooks/useSafePrice';
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
  const { data, isLoading, error } = useSafePrice({ symbol });

  if (isLoading) {
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
              ${data?.price?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400">24h High</p>
            <p className="font-semibold text-green-500" suppressHydrationWarning>
              ${((data?.price || 0) * 1.02).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">24h Low</p>
            <p className="font-semibold text-red-500" suppressHydrationWarning>
              ${((data?.price || 0) * 0.98).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Volume</p>
            <p className="font-semibold text-white" suppressHydrationWarning>
              ${((data?.volume || 0) / 1000).toFixed(1)}K
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

export const SafeTradingTerminal = TradingTerminalContent;