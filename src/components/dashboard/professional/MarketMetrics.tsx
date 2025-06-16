'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, DollarSign } from 'lucide-react';
import { DashboardIcons } from '@/lib/icons/icon-system';

export function MarketMetrics() {
  // Mock data - replace with real data hooks
  const metrics = {
    dominance: 51.2,
    fearGreed: 72,
    volumeProfile: {
      spot: 65,
      derivatives: 35
    },
    liquidations: {
      longs: 45.2,
      shorts: 32.8
    },
    funding: 0.012,
    openInterest: 15.4
  };

  const FearGreedGauge = ({ value }: { value: number }) => {
    const getColor = () => {
      if (value < 20) return 'text-red-600';
      if (value < 40) return 'text-orange-500';
      if (value < 60) return 'text-yellow-500';
      if (value < 80) return 'text-green-500';
      return 'text-green-600';
    };

    const getLabel = () => {
      if (value < 20) return 'Extreme Fear';
      if (value < 40) return 'Fear';
      if (value < 60) return 'Neutral';
      if (value < 80) return 'Greed';
      return 'Extreme Greed';
    };

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Fear & Greed Index</span>
          <span className={`text-2xl font-bold ${getColor()}`}>{value}</span>
        </div>
        <Progress value={value} className="h-2" />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Fear</span>
          <span className={`text-xs ${getColor()}`}>{getLabel()}</span>
          <span className="text-xs text-gray-500">Greed</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-500" />
        Market Metrics
      </h3>

      <div className="space-y-4">
        {/* Bitcoin Dominance */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">BTC Dominance</span>
            <span className="text-lg font-medium text-white">{metrics.dominance.toFixed(1)}%</span>
          </div>
          <Progress value={metrics.dominance} className="h-2" />
        </div>

        {/* Fear & Greed Index */}
        <FearGreedGauge value={metrics.fearGreed} />

        {/* Volume Profile */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Volume Profile (24h)</span>
            <span className="text-xs text-gray-500">$12.4B Total</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Spot</span>
                <span className="text-xs text-white">{metrics.volumeProfile.spot}%</span>
              </div>
              <Progress value={metrics.volumeProfile.spot} className="h-1" />
            </div>
            <div className="bg-gray-800 rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Derivatives</span>
                <span className="text-xs text-white">{metrics.volumeProfile.derivatives}%</span>
              </div>
              <Progress value={metrics.volumeProfile.derivatives} className="h-1" />
            </div>
          </div>
        </div>

        {/* Liquidations Heatmap */}
        <div className="bg-gray-800 rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Liquidations (24h)</span>
            <span className="text-xs text-gray-500">$78M Total</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-xl font-bold text-red-500">${metrics.liquidations.longs}M</div>
              <div className="text-xs text-gray-500">Longs</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-500">${metrics.liquidations.shorts}M</div>
              <div className="text-xs text-gray-500">Shorts</div>
            </div>
          </div>
        </div>

        {/* Funding & OI */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 rounded p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Funding Rate</span>
              <Zap className="w-3 h-3 text-yellow-500" />
            </div>
            <div className={`text-lg font-bold ${metrics.funding > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.funding > 0 ? '+' : ''}{(metrics.funding * 100).toFixed(3)}%
            </div>
          </div>
          <div className="bg-gray-800 rounded p-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Open Interest</span>
              <DollarSign className="w-3 h-3 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-white">${metrics.openInterest}B</div>
          </div>
        </div>
      </div>
    </Card>
  );
}