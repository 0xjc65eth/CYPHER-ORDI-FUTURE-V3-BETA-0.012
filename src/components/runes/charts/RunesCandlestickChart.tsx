'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface CandlestickData {
  x: string;
  y: [number, number, number, number]; // [open, high, low, close]
  volume: number;
}

interface RuneData {
  name: string;
  price_usd: number;
  change_24h: number;
}

interface Props {
  rune: RuneData | null;
}

export default function RunesCandlestickChart({ rune }: Props) {
  const [timeframe, setTimeframe] = useState('1H');
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const timeframes = ['5M', '15M', '1H', '4H', '1D', '1W'];

  // Generate realistic candlestick data
  useEffect(() => {
    if (!rune) return;

    setIsLoading(true);
    
    const generateCandlestickData = () => {
      const data: CandlestickData[] = [];
      let basePrice = rune.price_usd;
      const now = new Date();
      
      // Generate 50 candles for the chart
      for (let i = 49; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * (timeframe === '5M' ? 5 : timeframe === '15M' ? 15 : timeframe === '1H' ? 60 : timeframe === '4H' ? 240 : timeframe === '1D' ? 1440 : 10080) * 60000);
        
        // Generate OHLC with some realistic movement
        const volatility = 0.02; // 2% volatility
        const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
        const close = open * (1 + (Math.random() - 0.5) * volatility);
        const high = Math.max(open, close) * (1 + Math.random() * volatility / 2);
        const low = Math.min(open, close) * (1 - Math.random() * volatility / 2);
        
        data.push({
          x: timestamp.toISOString(),
          y: [open, high, low, close],
          volume: Math.random() * 1000000
        });
        
        basePrice = close; // Use close as next base price
      }
      
      setChartData(data);
      setIsLoading(false);
    };

    const timeout = setTimeout(generateCandlestickData, 500);
    return () => clearTimeout(timeout);
  }, [rune, timeframe]);

  // Simple candlestick visualization using HTML/CSS
  const renderCandlestick = (candle: CandlestickData, index: number) => {
    const [open, high, low, close] = candle.y;
    const isGreen = close > open;
    const bodyHeight = Math.abs(close - open);
    const wickTop = high - Math.max(open, close);
    const wickBottom = Math.min(open, close) - low;
    
    // Normalize heights for display (percentage of container)
    const priceRange = Math.max(...chartData.map(c => c.y[1])) - Math.min(...chartData.map(c => c.y[2]));
    const bodyHeightPercent = (bodyHeight / priceRange) * 80; // 80% of container height
    const wickTopPercent = (wickTop / priceRange) * 80;
    const wickBottomPercent = (wickBottom / priceRange) * 80;
    
    return (
      <div key={index} className="flex flex-col items-center justify-end h-full relative">
        {/* Upper wick */}
        <div 
          className={`w-0.5 ${isGreen ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ height: `${wickTopPercent}%` }}
        />
        
        {/* Body */}
        <div 
          className={`w-2 ${isGreen ? 'bg-green-400' : 'bg-red-400'} ${bodyHeightPercent < 1 ? 'min-h-[1px]' : ''}`}
          style={{ height: `${Math.max(bodyHeightPercent, 0.5)}%` }}
        />
        
        {/* Lower wick */}
        <div 
          className={`w-0.5 ${isGreen ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ height: `${wickBottomPercent}%` }}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
        <span className="ml-2 text-gray-400">Loading chart data...</span>
      </div>
    );
  }

  if (!rune) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        <BarChart3 className="h-8 w-8 mr-2" />
        Select a Rune to view chart
      </div>
    );
  }

  const latestCandle = chartData[chartData.length - 1];
  const isPositive = latestCandle && latestCandle.y[3] > latestCandle.y[0];

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white">{rune.name}</h3>
          <Badge className={`${isPositive ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'} border`}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {rune.change_24h >= 0 ? '+' : ''}{rune.change_24h.toFixed(2)}%
          </Badge>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              onClick={() => setTimeframe(tf)}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              className={timeframe === tf ? 'bg-orange-600' : 'border-gray-600 hover:border-orange-500'}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-400">Open</div>
          <div className="text-white font-bold">
            ${latestCandle?.y[0].toFixed(4)}
          </div>
        </div>
        <div>
          <div className="text-gray-400">High</div>
          <div className="text-green-400 font-bold">
            ${latestCandle?.y[1].toFixed(4)}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Low</div>
          <div className="text-red-400 font-bold">
            ${latestCandle?.y[2].toFixed(4)}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Close</div>
          <div className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            ${latestCandle?.y[3].toFixed(4)}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-64 bg-gray-900/30 rounded-lg p-4 overflow-hidden">
        <div className="flex items-end justify-between h-full gap-1">
          {chartData.slice(-30).map((candle, index) => renderCandlestick(candle, index))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute right-2 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-4">
          <span>${Math.max(...chartData.map(c => c.y[1])).toFixed(4)}</span>
          <span>${(Math.max(...chartData.map(c => c.y[1])) + Math.min(...chartData.map(c => c.y[2]))) / 2}</span>
          <span>${Math.min(...chartData.map(c => c.y[2])).toFixed(4)}</span>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="h-16 bg-gray-900/30 rounded-lg p-2">
        <div className="flex items-end justify-between h-full gap-1">
          {chartData.slice(-30).map((candle, index) => {
            const maxVolume = Math.max(...chartData.map(c => c.volume));
            const volumeHeight = (candle.volume / maxVolume) * 100;
            const isGreen = candle.y[3] > candle.y[0];
            
            return (
              <div
                key={index}
                className={`w-2 ${isGreen ? 'bg-green-400/60' : 'bg-red-400/60'}`}
                style={{ height: `${volumeHeight}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Chart Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Volume: {latestCandle?.volume.toLocaleString()}</span>
        <span>Timeframe: {timeframe}</span>
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}