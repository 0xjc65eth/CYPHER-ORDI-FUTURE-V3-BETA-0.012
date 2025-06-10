'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap } from 'lucide-react';
import { useMarketData } from '@/hooks/useMarketData';
import { useFearGreedIndex } from '@/hooks/useFearGreedIndex';

interface MarketCard {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

export function MarketOverviewGrid() {
  const { marketCap, volume24h, btcDominance, loading } = useMarketData();
  const { index: fearGreedIndex, loading: fgiLoading } = useFearGreedIndex();

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  const getFearGreedColor = (value: number): string => {
    if (value < 25) return 'text-red-500';
    if (value < 45) return 'text-orange-500';
    if (value < 55) return 'text-yellow-500';
    if (value < 75) return 'text-green-500';
    return 'text-emerald-500';
  };

  const getFearGreedLabel = (value: number): string => {
    if (value < 25) return 'Extreme Fear';
    if (value < 45) return 'Fear';
    if (value < 55) return 'Neutral';
    if (value < 75) return 'Greed';
    return 'Extreme Greed';
  };

  const marketCards: MarketCard[] = [
    {
      title: 'Market Cap Tracker',
      value: loading ? 'Loading...' : formatNumber(marketCap.total),
      change: marketCap.change24h,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-blue-500 to-blue-600',
      description: 'Total cryptocurrency market capitalization'
    },
    {
      title: 'Fear & Greed Index',
      value: fgiLoading ? 'Loading...' : fearGreedIndex,
      icon: <Activity className="w-5 h-5" />,
      color: 'from-purple-500 to-purple-600',
      description: getFearGreedLabel(fearGreedIndex)
    },
    {
      title: 'Dominance Monitor',
      value: loading ? 'Loading...' : `${btcDominance.toFixed(1)}%`,
      change: btcDominance > 50 ? 1 : -1,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-orange-500 to-orange-600',
      description: 'Bitcoin market dominance'
    },
    {
      title: 'Volume Surge Detector',
      value: loading ? 'Loading...' : formatNumber(volume24h.total),
      change: volume24h.change24h,
      icon: <Zap className="w-5 h-5" />,
      color: 'from-green-500 to-green-600',
      description: '24-hour trading volume across all exchanges'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {marketCards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-gray-700 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br opacity-5 ${card.color}"></div>
          <div className="relative p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-400">{card.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {card.title === 'Fear & Greed Index' && typeof card.value === 'number' ? (
                    <span className={getFearGreedColor(card.value)}>{card.value}</span>
                  ) : (
                    card.value
                  )}
                </h3>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-10`}>
                {card.icon}
              </div>
            </div>
            {card.change !== undefined && card.title !== 'Fear & Greed Index' && (
              <div className="flex items-center gap-2 mb-2">
                {card.change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${card.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(card.change).toFixed(2)}%
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500">{card.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}