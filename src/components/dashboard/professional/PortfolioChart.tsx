'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  change24h: number;
  color: string;
}

interface PerformanceData {
  timestamp: string;
  value: number;
  pnl: number;
}

export function PortfolioChart() {
  const [showBalance, setShowBalance] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');

  const assets: Asset[] = [
    { symbol: 'BTC', name: 'Bitcoin', value: 52250, percentage: 41.8, change24h: 2.34, color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum', value: 22850, percentage: 18.3, change24h: -1.23, color: '#627eea' },
    { symbol: 'SOL', name: 'Solana', value: 24687.5, percentage: 19.75, change24h: 5.67, color: '#9945ff' },
    { symbol: 'ORDI', name: 'Ordinals', value: 12500, percentage: 10.0, change24h: 12.45, color: '#ff6b35' },
    { symbol: 'RUNES', name: 'Runes', value: 8750, percentage: 7.0, change24h: -3.21, color: '#00d4aa' },
    { symbol: 'Others', name: 'Others', value: 3962.5, percentage: 3.15, change24h: 1.78, color: '#6b7280' }
  ];

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalPnL = 3500; // Mock P&L
  const totalPnLPercentage = (totalPnL / totalValue) * 100;

  // Mock performance data
  const performanceData: PerformanceData[] = Array.from({ length: 24 }, (_, i) => ({
    timestamp: `${i}:00`,
    value: totalValue + (Math.random() - 0.5) * 5000,
    pnl: totalPnL + (Math.random() - 0.5) * 1000
  }));

  const formatValue = (value: number): string => {
    if (!showBalance) return '****';
    return `$${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white font-medium">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Portfolio Value */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-2xl font-bold">
            {formatValue(totalValue)}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
            className="h-6 w-6"
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-2">
          {totalPnL >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-sm ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : ''}{showBalance ? formatValue(Math.abs(totalPnL)) : '****'} 
            ({totalPnL >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%)
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">24h P&L</p>
      </div>

      {/* Pie Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={assets}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {assets.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatValue(value), 'Value']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Chart */}
      <Card className="p-3 bg-gray-800/30 border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Performance</h4>
          <div className="flex gap-1">
            {['24h', '7d', '30d'].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="h-6 px-2 text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <XAxis dataKey="timestamp" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Assets List */}
      <div className="space-y-2">
        {assets.map((asset, index) => (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: asset.color }}
              />
              <div>
                <p className="text-sm font-medium">{asset.symbol}</p>
                <p className="text-xs text-gray-400">{asset.percentage.toFixed(1)}%</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {formatValue(asset.value)}
              </p>
              <p className={`text-xs ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}