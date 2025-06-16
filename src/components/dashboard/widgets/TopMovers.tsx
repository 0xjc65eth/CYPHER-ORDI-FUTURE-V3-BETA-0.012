'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';

interface Mover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}

export function TopMovers() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Static data to prevent hydration issues
  const topGainers: Mover[] = [
    { symbol: 'ORDI', name: 'Ordinals', price: 45.23, change: 24.5, volume: 12.4 },
    { symbol: 'SATS', name: 'SATS', price: 0.000234, change: 18.2, volume: 8.7 },
    { symbol: 'PIPE', name: 'PIPE', price: 2.34, change: 15.8, volume: 5.2 },
  ];

  const topLosers: Mover[] = [
    { symbol: 'RUNE', name: 'Runes', price: 0.892, change: -12.3, volume: 6.1 },
    { symbol: 'CATS', name: 'Cats', price: 0.00123, change: -8.7, volume: 3.4 },
    { symbol: 'RATS', name: 'Rats', price: 0.000089, change: -6.2, volume: 2.1 },
  ];

  const formatPrice = (price: number) => {
    if (!isMounted) return '--';
    if (price < 0.0001) return price.toExponential(2);
    if (price < 1) return price.toFixed(6);
    return price.toFixed(2);
  };

  if (!isMounted) {
    return (
      <Card className="bg-gray-900 border-gray-800 p-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white flex items-center">
            <Flame className="w-4 h-4 mr-1.5 text-orange-500" />
            Top Movers
          </h4>
        </div>
        <div className="h-32 bg-gray-800/50 rounded animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800 p-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white flex items-center">
          <Flame className="w-4 h-4 mr-1.5 text-orange-500" />
          Top Movers
        </h4>
      </div>

      <div className="space-y-3">
        {/* Top Gainers */}
        <div>
          <h5 className="text-xs text-gray-400 mb-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
            Top Gainers
          </h5>
          <div className="space-y-1">
            {topGainers.map((mover) => (
              <div key={mover.symbol} className="bg-gray-800 rounded p-2 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-white">{mover.symbol}</span>
                    <span className="text-xs text-gray-500 ml-1">{mover.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-white">${formatPrice(mover.price)}</div>
                    <div className="text-xs text-green-500">+{mover.change}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div>
          <h5 className="text-xs text-gray-400 mb-2 flex items-center">
            <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
            Top Losers
          </h5>
          <div className="space-y-1">
            {topLosers.map((mover) => (
              <div key={mover.symbol} className="bg-gray-800 rounded p-2 hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-white">{mover.symbol}</span>
                    <span className="text-xs text-gray-500 ml-1">{mover.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-white">${formatPrice(mover.price)}</div>
                    <div className="text-xs text-red-500">{mover.change}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}