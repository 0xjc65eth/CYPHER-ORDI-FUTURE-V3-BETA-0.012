'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Users,
  DollarSign,
  BarChart3,
  Hash,
  Zap,
  Globe,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon: string;
  sparkline: number[];
}

interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  fearGreedIndex: number;
  altcoinSeason: boolean;
}

export function MarketOverviewGrid() {
  const [assets, setAssets] = useState<MarketAsset[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 104500,
      change24h: 2.34,
      volume24h: 45600000000,
      marketCap: 2045000000000,
      icon: '₿',
      sparkline: generateSparkline()
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 2285,
      change24h: -1.23,
      volume24h: 23400000000,
      marketCap: 274000000000,
      icon: 'Ξ',
      sparkline: generateSparkline()
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 98.75,
      change24h: 5.67,
      volume24h: 3450000000,
      marketCap: 44200000000,
      icon: '◎',
      sparkline: generateSparkline()
    },
    {
      symbol: 'ORDI',
      name: 'Ordinals',
      price: 45.32,
      change24h: 12.45,
      volume24h: 234000000,
      marketCap: 951000000,
      icon: '🟠',
      sparkline: generateSparkline()
    }
  ]);

  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalMarketCap: 2400000000000,
    totalVolume24h: 123000000000,
    btcDominance: 52.3,
    fearGreedIndex: 72,
    altcoinSeason: false
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prev => prev.map(asset => ({
        ...asset,
        price: asset.price * (1 + (Math.random() - 0.5) * 0.002),
        change24h: asset.change24h + (Math.random() - 0.5) * 0.1,
        volume24h: asset.volume24h * (1 + (Math.random() - 0.5) * 0.01)
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  function generateSparkline(): number[] {
    return Array.from({ length: 20 }, () => Math.random() * 100);
  }

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] > data[0];

    return (
      <svg width="60" height="30" className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#10b981' : '#ef4444'}
          strokeWidth="1.5"
        />
      </svg>
    );
  };

  const getFearGreedColor = (index: number): string => {
    if (index < 20) return 'text-red-500';
    if (index < 40) return 'text-orange-500';
    if (index < 60) return 'text-yellow-500';
    if (index < 80) return 'text-green-500';
    return 'text-emerald-500';
  };

  const getFearGreedLabel = (index: number): string => {
    if (index < 20) return 'Extreme Fear';
    if (index < 40) return 'Fear';
    if (index < 60) return 'Neutral';
    if (index < 80) return 'Greed';
    return 'Extreme Greed';
  };

  return (
    <div className="space-y-4">
      {/* Market Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-gray-800/30 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Market Cap</p>
              <p className="text-lg font-bold">${formatNumber(marketStats.totalMarketCap)}</p>
            </div>
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
        </Card>
        
        <Card className="p-3 bg-gray-800/30 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">24h Volume</p>
              <p className="text-lg font-bold">${formatNumber(marketStats.totalVolume24h)}</p>
            </div>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Fear & Greed Index */}
      <Card className="p-4 bg-gray-800/30 border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">Fear & Greed Index</h4>
          <Badge className={`${getFearGreedColor(marketStats.fearGreedIndex)} bg-opacity-20`}>
            {marketStats.fearGreedIndex}
          </Badge>
        </div>
        <Progress value={marketStats.fearGreedIndex} className="h-2 mb-2" />
        <p className={`text-xs ${getFearGreedColor(marketStats.fearGreedIndex)}`}>
          {getFearGreedLabel(marketStats.fearGreedIndex)}
        </p>
      </Card>

      {/* BTC Dominance */}
      <Card className="p-3 bg-gray-800/30 border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">₿</span>
            <div>
              <p className="text-xs text-gray-400">BTC Dominance</p>
              <p className="font-bold">{marketStats.btcDominance.toFixed(1)}%</p>
            </div>
          </div>
          {marketStats.altcoinSeason && (
            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
              Alt Season
            </Badge>
          )}
        </div>
      </Card>

      {/* Top Assets */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">Top Assets</h4>
        {assets.map((asset, index) => (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-3 bg-gray-800/30 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center text-lg">
                    {asset.icon}
                  </div>
                  <div>
                    <p className="font-medium">{asset.symbol}</p>
                    <p className="text-xs text-gray-400">{asset.name}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">${asset.price.toLocaleString()}</p>
                  <div className="flex items-center gap-1 justify-end">
                    {asset.change24h > 0 ? (
                      <ArrowUp className="w-3 h-3 text-green-400" />
                    ) : asset.change24h < 0 ? (
                      <ArrowDown className="w-3 h-3 text-red-400" />
                    ) : (
                      <Minus className="w-3 h-3 text-gray-400" />
                    )}
                    <span className={`text-xs ${
                      asset.change24h > 0 ? 'text-green-400' : 
                      asset.change24h < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {Math.abs(asset.change24h).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Vol ${formatNumber(asset.volume24h)}</span>
                  <span>MCap ${formatNumber(asset.marketCap)}</span>
                </div>
                {renderSparkline(asset.sparkline)}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Card className="p-2 bg-gray-800/30 border-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400">Active Wallets</span>
          </div>
          <p className="font-medium mt-1">1.2M</p>
        </Card>
        
        <Card className="p-2 bg-gray-800/30 border-gray-700">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="text-gray-400">Gas (Gwei)</span>
          </div>
          <p className="font-medium mt-1">32</p>
        </Card>
      </div>
    </div>
  );
}