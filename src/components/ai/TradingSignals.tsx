/**
 * 📊 Trading Signals Display
 * Real-time visualization of AI trading signals
 */

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MinusCircle, Zap, Clock } from 'lucide-react';

export interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  timestamp: Date;
  reason: string;
}

interface TradingSignalsProps {
  signals: TradingSignal[];
  onExecute?: (signal: TradingSignal) => void;
}

export function TradingSignals({ signals, onExecute }: TradingSignalsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="w-5 h-5" />;
      case 'SELL':
        return <TrendingDown className="w-5 h-5" />;
      case 'HOLD':
        return <MinusCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'text-green-400 bg-green-400/10';
      case 'SELL':
        return 'text-red-400 bg-red-400/10';
      case 'HOLD':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Trading Signals</h3>
        <Zap className="w-5 h-5 text-yellow-400" />
      </div>

      {signals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No active trading signals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((signal) => (
            <div
              key={signal.id}
              className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${getActionColor(signal.action)}`}>
                      {getActionIcon(signal.action)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{signal.symbol}</p>
                      <p className="text-sm text-gray-400">
                        ${signal.price.toFixed(3)}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">{signal.reason}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {mounted ? new Date(signal.timestamp).toLocaleTimeString() : '--:--:--'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Confidence:</span>
                      <span className={signal.confidence > 0.8 ? 'text-green-400' : 'text-yellow-400'}>
                        {(signal.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {onExecute && (
                  <button
                    onClick={() => onExecute(signal)}
                    className="ml-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Execute
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
