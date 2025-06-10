'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Target,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  volume: number;
  confidence: number;
  timeWindow: number;
  profitEstimate: number;
  risk: 'low' | 'medium' | 'high';
}

export function ArbitrageScanner() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([
    {
      id: '1',
      pair: 'BTC/USDT',
      buyExchange: 'Binance',
      sellExchange: 'OKX',
      buyPrice: 104450,
      sellPrice: 104680,
      spread: 0.22,
      volume: 125000,
      confidence: 87,
      timeWindow: 45,
      profitEstimate: 275,
      risk: 'low'
    },
    {
      id: '2',
      pair: 'ETH/USDT',
      buyExchange: 'Coinbase',
      sellExchange: 'Kraken',
      buyPrice: 2283,
      sellPrice: 2295,
      spread: 0.53,
      volume: 89000,
      confidence: 92,
      timeWindow: 32,
      profitEstimate: 468,
      risk: 'low'
    },
    {
      id: '3',
      pair: 'SOL/USDT',
      buyExchange: 'OKX',
      sellExchange: 'Bybit',
      buyPrice: 98.45,
      sellPrice: 99.12,
      spread: 0.68,
      volume: 45000,
      confidence: 78,
      timeWindow: 67,
      profitEstimate: 301,
      risk: 'medium'
    }
  ]);

  const [scanningActive, setScanningActive] = useState(true);
  const [lastScan, setLastScan] = useState(new Date());

  // Simulate real-time scanning
  useEffect(() => {
    if (!scanningActive) return;

    const updateOpportunities = () => {
      setOpportunities(prev => prev.map(opp => ({
        ...opp,
        buyPrice: opp.buyPrice * (1 + (Math.random() - 0.5) * 0.001),
        sellPrice: opp.sellPrice * (1 + (Math.random() - 0.5) * 0.001),
        spread: opp.spread + (Math.random() - 0.5) * 0.1,
        confidence: Math.max(50, Math.min(100, opp.confidence + (Math.random() - 0.5) * 5)),
        timeWindow: Math.max(10, opp.timeWindow + (Math.random() - 0.5) * 10),
        profitEstimate: opp.profitEstimate * (1 + (Math.random() - 0.5) * 0.2)
      })));
      
      setLastScan(new Date());
    };

    const interval = setInterval(updateOpportunities, 3000);
    return () => clearInterval(interval);
  }, [scanningActive]);

  const getRiskColor = (risk: ArbitrageOpportunity['risk']): string => {
    switch (risk) {
      case 'low':
        return 'bg-green-500/20 text-green-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'high':
        return 'bg-red-500/20 text-red-400';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 85) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          <h4 className="text-sm font-medium">Arbitrage</h4>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={scanningActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScanningActive(!scanningActive)}
            className="h-6 px-2 text-xs"
          >
            {scanningActive ? 'Stop' : 'Start'}
          </Button>
        </div>
      </div>

      {/* Scanner Status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${scanningActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-gray-400">
            {scanningActive ? 'Scanning...' : 'Scanner stopped'}
          </span>
        </div>
        <span className="text-gray-500">
          Last scan: {formatTimeAgo(lastScan)}
        </span>
      </div>

      {/* Opportunities List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {opportunities.map((opp, index) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{opp.pair}</span>
                <Badge className={getRiskColor(opp.risk)}>
                  {opp.risk}
                </Badge>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">
                  +{opp.spread.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-400">
                  ${opp.profitEstimate.toFixed(0)}
                </p>
              </div>
            </div>

            {/* Exchange info */}
            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
              <div className="bg-gray-800/50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-gray-400">Buy</span>
                </div>
                <p className="font-medium">{opp.buyExchange}</p>
                <p className="text-gray-400">${opp.buyPrice.toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded p-2">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
                  <span className="text-gray-400">Sell</span>
                </div>
                <p className="font-medium">{opp.sellExchange}</p>
                <p className="text-gray-400">${opp.sellPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Confidence</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={opp.confidence} 
                    className="w-16 h-1" 
                  />
                  <span className={`font-medium ${getConfidenceColor(opp.confidence)}`}>
                    {opp.confidence}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Time Window</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>{opp.timeWindow}s</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Volume</span>
                <span>${(opp.volume / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                {opp.confidence > 85 && (
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    High Confidence
                  </Badge>
                )}
                {opp.timeWindow < 30 && (
                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                >
                  <BarChart3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-6 px-3 text-xs bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Execute
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/30 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-3 h-3 text-purple-400" />
            <span className="text-gray-400">Active Opportunities</span>
          </div>
          <p className="font-medium">{opportunities.length}</p>
        </div>
        
        <div className="bg-gray-800/30 rounded p-2">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Potential Profit</span>
          </div>
          <p className="font-medium">
            ${opportunities.reduce((sum, opp) => sum + opp.profitEstimate, 0).toFixed(0)}
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs">
          <p className="text-yellow-300 font-medium">Risk Warning</p>
          <p className="text-gray-400 mt-1">
            Arbitrage opportunities carry execution risks. Always verify prices and liquidity before trading.
          </p>
        </div>
      </div>
    </div>
  );
}