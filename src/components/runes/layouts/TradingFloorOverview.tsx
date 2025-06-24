'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Target,
  DollarSign,
  BarChart3,
  Flame,
  Crown,
  AlertCircle
} from 'lucide-react';
import { RuneMarketData } from '@/services/runes';

interface TradingFloorOverviewProps {
  data: RuneMarketData[];
  selectedRune?: RuneMarketData | null;
  onSelectRune?: (rune: RuneMarketData) => void;
}

interface FlashPrice {
  id: string;
  flash: 'up' | 'down' | null;
  timestamp: number;
}

export default function TradingFloorOverview({ 
  data, 
  selectedRune, 
  onSelectRune 
}: TradingFloorOverviewProps) {
  const [flashPrices, setFlashPrices] = useState<Map<string, FlashPrice>>(new Map());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate price movements and flashing
  useEffect(() => {
    const interval = setInterval(() => {
      if (data.length === 0) return;

      const randomRune = data[Math.floor(Math.random() * data.length)];
      const flashType = Math.random() > 0.5 ? 'up' : 'down';
      
      setFlashPrices(prev => new Map(prev.set(randomRune.id, {
        id: randomRune.id,
        flash: flashType,
        timestamp: Date.now()
      })));

      // Clear flash after 800ms
      setTimeout(() => {
        setFlashPrices(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(randomRune.id);
          if (current) {
            newMap.set(randomRune.id, { ...current, flash: null });
          }
          return newMap;
        });
      }, 800);
    }, 1500); // Flash every 1.5 seconds

    return () => clearInterval(interval);
  }, [data]);

  const formatPrice = (price: number): string => {
    if (price < 0.00001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(8);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  // Calculate market stats
  const totalMarketCap = data.reduce((sum, rune) => sum + rune.marketCap.current, 0);
  const totalVolume = data.reduce((sum, rune) => sum + rune.volume.volume24h, 0);
  const gainers = data.filter(rune => rune.price.change24h > 0).length;
  const losers = data.filter(rune => rune.price.change24h < 0).length;
  const avgChange = data.length > 0 ? data.reduce((sum, rune) => sum + rune.price.change24h, 0) / data.length : 0;

  // Get top performers for quick display
  const topGainers = [...data]
    .filter(rune => rune.price.change24h > 0)
    .sort((a, b) => b.price.change24h - a.price.change24h)
    .slice(0, 6);

  const topLosers = [...data]
    .filter(rune => rune.price.change24h < 0)
    .sort((a, b) => a.price.change24h - b.price.change24h)
    .slice(0, 6);

  const FlashingPriceCard = ({ rune }: { rune: RuneMarketData }) => {
    const flash = flashPrices.get(rune.id);
    const isSelected = selectedRune?.id === rune.id;
    
    return (
      <motion.div
        key={rune.id}
        className={`
          relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
          ${isSelected 
            ? 'border-orange-400 bg-orange-900/20' 
            : 'border-gray-700 hover:border-gray-600'
          }
          ${flash?.flash === 'up' 
            ? 'bg-green-500/30 border-green-400' 
            : flash?.flash === 'down' 
            ? 'bg-red-500/30 border-red-400' 
            : 'bg-gray-900/50'
          }
        `}
        onClick={() => onSelectRune?.(rune)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: flash?.flash 
            ? flash.flash === 'up' 
              ? '0 0 20px rgba(34, 197, 94, 0.5)'
              : '0 0 20px rgba(239, 68, 68, 0.5)'
            : 'none'
        }}
      >
        {/* Rank Badge */}
        <div className="absolute -top-2 -left-2 flex items-center gap-1">
          {rune.marketCap.rank <= 3 && <Crown className="h-3 w-3 text-yellow-400" />}
          <Badge variant="outline" className="text-xs font-mono bg-black border-gray-600">
            #{rune.marketCap.rank}
          </Badge>
        </div>

        {/* Flash indicator */}
        <AnimatePresence>
          {flash?.flash && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className={`absolute top-1 right-1 ${
                flash.flash === 'up' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {flash.flash === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {/* Name */}
          <div>
            <p className="font-bold text-white text-sm truncate" title={rune.name}>
              {rune.name}
            </p>
            <p className="text-xs text-gray-400 font-mono">{rune.symbol}</p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className={`font-mono text-lg font-bold ${
              flash?.flash === 'up' ? 'text-green-400' : 
              flash?.flash === 'down' ? 'text-red-400' : 'text-white'
            }`}>
              ${formatPrice(rune.price.current)}
            </p>
          </div>

          {/* Change */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1 ${
              rune.price.change24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {rune.price.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="text-xs font-bold">
                {rune.price.change24h >= 0 ? '+' : ''}{rune.price.change24h.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-400">
              ${formatNumber(rune.marketCap.current, 1)}
            </div>
          </div>

          {/* Volume bar */}
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div 
              className="h-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
              style={{ 
                width: `${Math.min(100, (rune.volume.volume24h / Math.max(...data.map(r => r.volume.volume24h))) * 100)}%` 
              }}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Market Status Header */}
      <div className="bg-black border border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-400 animate-pulse" />
              <h2 className="text-xl font-bold text-white">RUNES TRADING FLOOR</h2>
            </div>
            <Badge variant="outline" className="bg-green-900/20 border-green-500/30 text-green-400 animate-pulse">
              LIVE
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Market Time</p>
            <p className="text-lg font-mono text-white">
              {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Market Overview Stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-orange-400" />
              <p className="text-xs text-gray-400">TOTAL CAP</p>
            </div>
            <p className="text-lg font-mono text-white font-bold">
              ${formatNumber(totalMarketCap)}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-gray-400">24H VOL</p>
            </div>
            <p className="text-lg font-mono text-white font-bold">
              ${formatNumber(totalVolume)}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <p className="text-xs text-gray-400">GAINERS</p>
            </div>
            <p className="text-lg font-bold text-green-400">
              {gainers}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <p className="text-xs text-gray-400">LOSERS</p>
            </div>
            <p className="text-lg font-bold text-red-400">
              {losers}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-purple-400" />
              <p className="text-xs text-gray-400">AVG CHG</p>
            </div>
            <p className={`text-lg font-mono font-bold ${
              avgChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(1)}%
            </p>
          </div>

          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <p className="text-xs text-gray-400">ACTIVE</p>
            </div>
            <p className="text-lg font-bold text-orange-400">
              {data.length}
            </p>
          </div>
        </div>
      </div>

      {/* Trading Floor Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Gainers */}
        <Card className="bg-black border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">TOP GAINERS</h3>
              <Badge variant="outline" className="bg-green-900/20 border-green-500/30 text-green-400">
                {topGainers.length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {topGainers.map((rune) => (
                <FlashingPriceCard key={rune.id} rune={rune} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="bg-black border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <h3 className="text-lg font-bold text-white">TOP LOSERS</h3>
              <Badge variant="outline" className="bg-red-900/20 border-red-500/30 text-red-400">
                {topLosers.length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {topLosers.map((rune) => (
                <FlashingPriceCard key={rune.id} rune={rune} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Alerts */}
      <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400 animate-pulse" />
              <span className="text-white font-bold">MARKET ALERTS</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-400">High volatility detected</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-blue-400" />
                <span className="text-gray-400">Updates every 1.5s</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}