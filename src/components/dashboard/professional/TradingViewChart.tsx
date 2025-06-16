'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Volume2,
  Target,
  Settings,
  Maximize2,
  RefreshCw
} from 'lucide-react';

// TradingView Widget Component
export function TradingViewChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [symbol, setSymbol] = useState('BTCUSD');
  const [interval, setInterval] = useState('15');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (containerRef.current) {
      // Clear previous widget
      containerRef.current.innerHTML = '';

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: `BINANCE:${symbol}`,
        interval: interval,
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: 'tradingview_chart',
        studies: [
          'RSI@tv-basicstudies',
          'MACD@tv-basicstudies'
        ],
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        save_image: false,
        calendar: false,
        support_host: 'https://www.tradingview.com'
      });

      containerRef.current.appendChild(script);
      
      // Simulate loading
      setTimeout(() => setIsLoading(false), 2000);
    }
  }, [symbol, interval]);

  const symbols = [
    { symbol: 'BTCUSD', name: 'Bitcoin' },
    { symbol: 'ETHUSD', name: 'Ethereum' },
    { symbol: 'SOLUSD', name: 'Solana' },
    { symbol: 'ADAUSD', name: 'Cardano' }
  ];

  const intervals = [
    { value: '1', label: '1m' },
    { value: '5', label: '5m' },
    { value: '15', label: '15m' },
    { value: '60', label: '1h' },
    { value: '240', label: '4h' },
    { value: 'D', label: '1D' }
  ];

  return (
    <div className="h-[400px] flex flex-col">
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold">Trading Chart</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Symbol Selector */}
          <div className="flex gap-1">
            {symbols.map((s) => (
              <Button
                key={s.symbol}
                variant={symbol === s.symbol ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSymbol(s.symbol)}
                className="h-7 px-2 text-xs"
              >
                {s.symbol.replace('USD', '')}
              </Button>
            ))}
          </div>
          
          {/* Interval Selector */}
          <div className="flex gap-1">
            {intervals.map((int) => (
              <Button
                key={int.value}
                variant={interval === int.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInterval(int.value)}
                className="h-7 px-2 text-xs"
              >
                {int.label}
              </Button>
            ))}
          </div>

          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
              <span className="text-sm text-gray-400">Loading chart...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={containerRef}
          id="tradingview_chart"
          className="w-full h-full"
        />
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between mt-3 text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-gray-400">Support: $102,500</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-gray-400">Resistance: $106,000</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400">
            RSI: 65.2
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400">
            MACD: Bullish
          </Badge>
        </div>
      </div>
    </div>
  );
}