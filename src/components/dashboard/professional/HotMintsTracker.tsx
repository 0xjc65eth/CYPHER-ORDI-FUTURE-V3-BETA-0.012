'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Hash,
  ExternalLink,
  Flame
} from 'lucide-react';

interface HotMint {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change1h: number;
  volume1h: number;
  mints: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  lastMint: Date;
  trending: boolean;
}

export function HotMintsTracker() {
  const [hotMints, setHotMints] = useState<HotMint[]>([
    {
      id: '1',
      name: 'Quantum Cats',
      symbol: 'QCAT',
      price: 0.085,
      change1h: 145.2,
      volume1h: 12.5,
      mints: 234,
      rarity: 'rare',
      lastMint: new Date(Date.now() - 2 * 60 * 1000),
      trending: true
    },
    {
      id: '2',
      name: 'Bitcoin Bots',
      symbol: 'BBOT',
      price: 0.032,
      change1h: 67.8,
      volume1h: 8.9,
      mints: 156,
      rarity: 'uncommon',
      lastMint: new Date(Date.now() - 5 * 60 * 1000),
      trending: true
    },
    {
      id: '3',
      name: 'Ordinal Punks',
      symbol: 'OPNK',
      price: 0.156,
      change1h: -23.4,
      volume1h: 15.2,
      mints: 89,
      rarity: 'epic',
      lastMint: new Date(Date.now() - 8 * 60 * 1000),
      trending: false
    }
  ]);

  const [timeframe, setTimeframe] = useState('1h');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHotMints(prev => prev.map(mint => ({
        ...mint,
        price: mint.price * (1 + (Math.random() - 0.5) * 0.1),
        change1h: mint.change1h + (Math.random() - 0.5) * 10,
        mints: mint.mints + Math.floor(Math.random() * 5),
        volume1h: mint.volume1h * (1 + (Math.random() - 0.5) * 0.2),
        lastMint: Math.random() > 0.7 ? new Date() : mint.lastMint
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRarityColor = (rarity: HotMint['rarity']): string => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500/20 text-gray-400';
      case 'uncommon':
        return 'bg-green-500/20 text-green-400';
      case 'rare':
        return 'bg-blue-500/20 text-blue-400';
      case 'epic':
        return 'bg-purple-500/20 text-purple-400';
      case 'legendary':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-medium">Hot Mints</h4>
        </div>
        <div className="flex gap-1">
          {['1h', '24h'].map((tf) => (
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

      {/* Hot Mints List */}
      <div className="space-y-2">
        {hotMints.map((mint, index) => (
          <motion.div
            key={mint.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {mint.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{mint.name}</p>
                    {mint.trending && (
                      <Flame className="w-3 h-3 text-orange-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{mint.symbol}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-sm">
                  {mint.price.toFixed(3)} BTC
                </p>
                <div className="flex items-center gap-1 justify-end">
                  <span className={`text-xs ${
                    mint.change1h > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {mint.change1h > 0 ? '+' : ''}{mint.change1h.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Badge className={getRarityColor(mint.rarity)}>
                  {mint.rarity}
                </Badge>
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400">{mint.mints}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400">{mint.volume1h.toFixed(1)} BTC</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400">
                    {formatTimeAgo(mint.lastMint)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Mint progress bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Minting Progress</span>
                <span className="text-gray-400">{mint.mints}/1000</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(mint.mints / 1000) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/30 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Active Mints</span>
          </div>
          <p className="font-medium">127</p>
        </div>
        
        <div className="bg-gray-800/30 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-gray-400">New Today</span>
          </div>
          <p className="font-medium">23</p>
        </div>
      </div>
    </div>
  );
}