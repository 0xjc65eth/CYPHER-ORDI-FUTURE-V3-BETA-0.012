'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  count: number;
}

interface RuneData {
  name: string;
  price_usd: number;
  symbol: string;
}

interface Props {
  rune: RuneData | null;
}

export default function RunesOrderBook({ rune }: Props) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState(0);
  const [depth, setDepth] = useState<'5' | '10' | '20'>('10');

  useEffect(() => {
    if (!rune) return;

    const generateOrderBook = () => {
      const basePrice = rune.price_usd;
      const newBids: OrderBookEntry[] = [];
      const newAsks: OrderBookEntry[] = [];

      // Generate bid orders (buy orders below current price)
      for (let i = 0; i < 20; i++) {
        const priceOffset = (i + 1) * 0.001 * basePrice; // 0.1% steps
        const price = basePrice - priceOffset;
        const amount = Math.random() * 1000 + 100;
        const total = price * amount;
        const count = Math.floor(Math.random() * 10) + 1;

        newBids.push({ price, amount, total, count });
      }

      // Generate ask orders (sell orders above current price)
      for (let i = 0; i < 20; i++) {
        const priceOffset = (i + 1) * 0.001 * basePrice; // 0.1% steps
        const price = basePrice + priceOffset;
        const amount = Math.random() * 1000 + 100;
        const total = price * amount;
        const count = Math.floor(Math.random() * 10) + 1;

        newAsks.push({ price, amount, total, count });
      }

      setBids(newBids);
      setAsks(newAsks);
      
      // Calculate spread
      const bestBid = newBids[0]?.price || 0;
      const bestAsk = newAsks[0]?.price || 0;
      setSpread(bestAsk - bestBid);
    };

    generateOrderBook();
    const interval = setInterval(generateOrderBook, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, [rune]);

  if (!rune) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        <Activity className="h-8 w-8 mr-2" />
        Select a Rune to view order book
      </div>
    );
  }

  const depthLevels = { '5': 5, '10': 10, '20': 20 };
  const displayCount = depthLevels[depth];

  const totalBidVolume = bids.slice(0, displayCount).reduce((sum, bid) => sum + bid.amount, 0);
  const totalAskVolume = asks.slice(0, displayCount).reduce((sum, ask) => sum + ask.amount, 0);
  const maxVolume = Math.max(totalBidVolume, totalAskVolume);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{rune.symbol}/BTC</h3>
          <p className="text-xs text-gray-400">Order Book Depth</p>
        </div>
        
        {/* Depth Selector */}
        <div className="flex gap-1">
          {(['5', '10', '20'] as const).map((d) => (
            <Button
              key={d}
              onClick={() => setDepth(d)}
              variant={depth === d ? 'default' : 'outline'}
              size="sm"
              className={depth === d ? 'bg-blue-600' : 'border-gray-600 hover:border-blue-500'}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>

      {/* Market Info */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-gray-400">Spread</div>
          <div className="text-orange-400 font-bold">
            ${spread.toFixed(6)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Last Price</div>
          <div className="text-white font-bold">
            ${rune.price_usd.toFixed(6)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">24h Change</div>
          <div className="text-green-400 font-bold">+2.34%</div>
        </div>
      </div>

      {/* Order Book Headers */}
      <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 font-bold border-b border-gray-700 pb-2">
        <div>Price</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
        <div className="text-right">Count</div>
      </div>

      {/* Ask Orders (Sell) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-red-400" />
          <span className="text-red-400 font-bold text-sm">ASKS (SELL)</span>
          <Badge className="bg-red-500/20 border-red-500 text-red-400 text-xs">
            {totalAskVolume.toFixed(0)}
          </Badge>
        </div>
        
        {asks.slice(0, displayCount).reverse().map((ask, index) => {
          const volumePercent = (ask.amount / maxVolume) * 100;
          
          return (
            <div 
              key={index}
              className="relative grid grid-cols-4 gap-2 text-xs py-1 px-2 hover:bg-red-500/10 transition-colors"
            >
              {/* Volume Bar Background */}
              <div 
                className="absolute right-0 top-0 h-full bg-red-500/20 rounded"
                style={{ width: `${volumePercent}%` }}
              />
              
              <div className="text-red-400 font-mono relative z-10">
                ${ask.price.toFixed(6)}
              </div>
              <div className="text-white text-right relative z-10">
                {ask.amount.toFixed(2)}
              </div>
              <div className="text-gray-400 text-right relative z-10">
                ${ask.total.toFixed(2)}
              </div>
              <div className="text-gray-400 text-right relative z-10">
                {ask.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Price */}
      <div className="py-3 text-center border-y border-gray-700">
        <div className="text-2xl font-bold text-white">
          ${rune.price_usd.toFixed(6)}
        </div>
        <div className="text-xs text-gray-400">Current Price</div>
      </div>

      {/* Bid Orders (Buy) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="h-4 w-4 text-green-400" />
          <span className="text-green-400 font-bold text-sm">BIDS (BUY)</span>
          <Badge className="bg-green-500/20 border-green-500 text-green-400 text-xs">
            {totalBidVolume.toFixed(0)}
          </Badge>
        </div>
        
        {bids.slice(0, displayCount).map((bid, index) => {
          const volumePercent = (bid.amount / maxVolume) * 100;
          
          return (
            <div 
              key={index}
              className="relative grid grid-cols-4 gap-2 text-xs py-1 px-2 hover:bg-green-500/10 transition-colors"
            >
              {/* Volume Bar Background */}
              <div 
                className="absolute right-0 top-0 h-full bg-green-500/20 rounded"
                style={{ width: `${volumePercent}%` }}
              />
              
              <div className="text-green-400 font-mono relative z-10">
                ${bid.price.toFixed(6)}
              </div>
              <div className="text-white text-right relative z-10">
                {bid.amount.toFixed(2)}
              </div>
              <div className="text-gray-400 text-right relative z-10">
                ${bid.total.toFixed(2)}
              </div>
              <div className="text-gray-400 text-right relative z-10">
                {bid.count}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-xs text-gray-400">Bid Volume</div>
          <div className="text-green-400 font-bold">
            {totalBidVolume.toFixed(0)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400">Ask Volume</div>
          <div className="text-red-400 font-bold">
            {totalAskVolume.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}