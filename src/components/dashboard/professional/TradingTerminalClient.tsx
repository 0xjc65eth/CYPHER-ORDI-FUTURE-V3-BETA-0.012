'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DashboardIcons } from '@/lib/icons/icon-system';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';
import { useMarketData } from '@/hooks/dashboard/useMarketData';
import { ProfessionalChart } from '@/components/charts/ProfessionalChartSystem';
import { CandlestickChart, LineChart, BarChart3, Activity, TrendingUp } from 'lucide-react';

export function TradingTerminalClient() {
  const { price, change24h, volume24h } = useBitcoinPrice();
  const marketData = useMarketData();
  const [chartType, setChartType] = useState('candles');
  const [timeframe, setTimeframe] = useState('1h');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Always use current values directly (no SSR issues since this is client-only)
  const currentPrice = typeof price === 'number' ? price : 0;

  // Generate professional chart data
  const chartData = useMemo(() => {
    const basePrice = currentPrice || 96583.51;
    const periods = timeframe === '1m' ? 60 : timeframe === '5m' ? 48 : timeframe === '15m' ? 32 : timeframe === '1h' ? 24 : timeframe === '4h' ? 24 : 30;
    const intervalMs = timeframe === '1m' ? 60000 : timeframe === '5m' ? 300000 : timeframe === '15m' ? 900000 : timeframe === '1h' ? 3600000 : timeframe === '4h' ? 14400000 : 86400000;
    
    const seed = 12345;
    const pseudoRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: periods }, (_, i) => {
      const timeAgo = periods - i;
      const now = new Date();
      const time = new Date(now.getTime() - timeAgo * intervalMs);
      
      const trendFactor = 1 + (Math.sin(i * 0.15) * 0.008);
      const volatility = 0.012;
      const randomFactor = 1 + (pseudoRandom(i) * volatility * 2 - volatility);
      const value = basePrice * trendFactor * randomFactor;
      
      const open = i === 0 ? value : value * (1 + (pseudoRandom(i + 50) - 0.5) * 0.005);
      const close = value;
      const high = Math.max(open, close) * (1 + pseudoRandom(i + 100) * 0.01);
      const low = Math.min(open, close) * (1 - pseudoRandom(i + 150) * 0.01);
      const volume = 800000 + pseudoRandom(i + 200) * 3000000;
      
      return {
        time: time.toISOString(),
        value,
        open,
        high,
        low,
        close,
        volume
      };
    }).reverse();
  }, [currentPrice, timeframe, mounted]);

  // Chart configuration based on type
  const chartConfig = useMemo(() => ({
    type: chartType === 'candles' ? 'candlestick' as const : chartType === 'volume' ? 'bar' as const : chartType === 'line' ? 'line' as const : 'area' as const,
    height: 360,
    theme: 'dark' as const,
    showGrid: true,
    showCrosshair: true,
    showTooltip: true,
    showVolume: chartType === 'volume' || chartType === 'candles',
    colors: change24h >= 0 ? ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6'] : ['#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
    precision: 2,
    realtime: true,
    library: chartType === 'candles' ? 'lightweight' as const : 'recharts' as const
  }), [chartType, change24h]);

  return (
    <Card className="bg-gray-900 border-gray-800 p-4">
      <div className="flex flex-col space-y-4">
        {/* Header with price and controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h2 className="text-2xl font-bold text-white">BTC/USD</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-3xl font-mono text-white">
                  ${currentPrice.toLocaleString()}
                </span>
                <span className={`flex items-center text-sm font-medium ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change24h >= 0 ? <DashboardIcons.priceUp.icon className="w-4 h-4 mr-1" /> : <DashboardIcons.priceDown.icon className="w-4 h-4 mr-1" />}
                  {Math.abs(change24h).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">24h High</span>
                <p className="text-white font-medium">${marketData?.high24h?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <span className="text-gray-400">24h Low</span>
                <p className="text-white font-medium">${marketData?.low24h?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <span className="text-gray-400">24h Volume</span>
                <p className="text-white font-medium">${volume24h?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
          
          {/* Chart Controls */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-800 rounded p-0.5">
              <Button
                size="sm"
                variant={chartType === 'candles' ? 'default' : 'ghost'}
                onClick={() => setChartType('candles')}
                className="h-8 px-3"
              >
                <CandlestickChart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={chartType === 'line' ? 'default' : 'ghost'}
                onClick={() => setChartType('line')}
                className="h-8 px-3"
              >
                <LineChart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={chartType === 'volume' ? 'default' : 'ghost'}
                onClick={() => setChartType('volume')}
                className="h-8 px-3"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex bg-gray-800 rounded p-0.5">
              {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={timeframe === tf ? 'default' : 'ghost'}
                  onClick={() => setTimeframe(tf)}
                  className="h-8 px-2 text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Professional Chart Area */}
        <div className="relative">
          {mounted && chartData.length > 0 ? (
            <ProfessionalChart
              data={chartData}
              config={chartConfig}
              currentValue={currentPrice}
              change24h={change24h}
              className="bg-gray-800/50 border-gray-700"
            />
          ) : (
            <div className="h-96 bg-gray-800 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Activity className="w-8 h-8 text-orange-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Loading Professional Chart
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Initializing {chartType} view for {timeframe} timeframe
                </p>
              </div>
            </div>
          )}
          
          {/* Chart overlay info */}
          <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">TF:</span>
                <span className="text-white font-mono">{timeframe.toUpperCase()}</span>
              </div>
              <div className="w-1 h-4 bg-gray-600 rounded" />
              <div className="flex items-center space-x-1">
                <span className="text-gray-300">Type:</span>
                <span className="text-white font-mono capitalize">{chartType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <Button className="bg-green-600 hover:bg-green-700">
              Buy BTC
            </Button>
            <Button variant="outline" className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white">
              Sell BTC
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Spread: 0.01%</span>
            <span>•</span>
            <span>Fee: 0.1%</span>
            <span>•</span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              Live
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}