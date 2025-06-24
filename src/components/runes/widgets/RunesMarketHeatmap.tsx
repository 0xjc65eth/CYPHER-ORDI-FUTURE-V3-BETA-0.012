'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, TrendingDown, Volume2, DollarSign } from 'lucide-react';

interface HeatmapData {
  name: string;
  symbol: string;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  size: number; // For heatmap sizing
}

export default function RunesMarketHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [metric, setMetric] = useState<'change' | 'volume' | 'market_cap'>('change');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateHeatmapData = () => {
      const runeNames = [
        'RSIC•GENESIS•RUNE', 'DOG•GO•TO•THE•MOON', 'RUNESTONE', 'UNCOMMON•GOODS',
        'RUNE•COIN', 'SATOSHI•NAKAMOTO', 'BITCOIN•ORDINALS', 'RARE•PEPE•RUNE',
        'ORDINAL•MAXI', 'DIGITAL•ARTIFACTS', 'SATS•NAMES', 'BTC•RUNES',
        'MOON•RUNE', 'DIAMOND•HANDS', 'HODL•RUNE', 'STACK•SATS',
        'ORANGE•PILL', 'LASER•EYES', 'RUNE•PUNKS', 'CRYPTO•ART'
      ];

      const data: HeatmapData[] = runeNames.map((name) => {
        const change = (Math.random() - 0.5) * 100; // -50% to +50%
        const volume = Math.random() * 5000000; // Up to 5M volume
        const marketCap = Math.random() * 100000000; // Up to 100M market cap
        
        return {
          name,
          symbol: name.split('•')[0],
          change_24h: change,
          volume_24h: volume,
          market_cap: marketCap,
          size: Math.abs(change) + 10 // Size based on absolute change
        };
      });

      setHeatmapData(data);
      setIsLoading(false);
    };

    generateHeatmapData();
    const interval = setInterval(generateHeatmapData, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const getColor = (value: number, metric: string) => {
    let intensity: number;
    
    switch (metric) {
      case 'change':
        // Color based on price change
        if (value > 0) {
          intensity = Math.min(value / 50, 1); // Normalize to 0-1
          return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`; // Green with varying opacity
        } else {
          intensity = Math.min(Math.abs(value) / 50, 1);
          return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // Red with varying opacity
        }
      
      case 'volume':
        intensity = Math.min(value / 5000000, 1); // Normalize to max volume
        return `rgba(59, 130, 246, ${0.3 + intensity * 0.7})`; // Blue
      
      case 'market_cap':
        intensity = Math.min(value / 100000000, 1); // Normalize to max market cap
        return `rgba(168, 85, 247, ${0.3 + intensity * 0.7})`; // Purple
      
      default:
        return 'rgba(107, 114, 128, 0.5)'; // Gray
    }
  };

  const getSize = (data: HeatmapData) => {
    let value: number;
    
    switch (metric) {
      case 'change':
        value = Math.abs(data.change_24h);
        break;
      case 'volume':
        value = data.volume_24h;
        break;
      case 'market_cap':
        value = data.market_cap;
        break;
      default:
        value = 50;
    }
    
    // Calculate size as percentage of container (min 8%, max 20%)
    const maxValue = Math.max(...heatmapData.map(d => {
      switch (metric) {
        case 'change': return Math.abs(d.change_24h);
        case 'volume': return d.volume_24h;
        case 'market_cap': return d.market_cap;
        default: return 50;
      }
    }));
    
    const normalizedSize = (value / maxValue) * 12 + 8; // 8% to 20%
    return `${normalizedSize}%`;
  };

  const formatValue = (data: HeatmapData) => {
    switch (metric) {
      case 'change':
        return `${data.change_24h >= 0 ? '+' : ''}${data.change_24h.toFixed(1)}%`;
      case 'volume':
        return `$${(data.volume_24h / 1000).toFixed(0)}K`;
      case 'market_cap':
        return `$${(data.market_cap / 1000000).toFixed(1)}M`;
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        <span className="ml-2 text-gray-400">Loading heatmap data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-white">Market Heatmap</h3>
          <Badge className="bg-cyan-500/20 border-cyan-500 text-cyan-400 border">
            <Activity className="h-3 w-3 mr-1" />
            {heatmapData.length} Runes
          </Badge>
        </div>
        
        {/* Metric Selector */}
        <div className="flex gap-1">
          <Button
            onClick={() => setMetric('change')}
            variant={metric === 'change' ? 'default' : 'outline'}
            size="sm"
            className={metric === 'change' ? 'bg-cyan-600' : 'border-gray-600 hover:border-cyan-500'}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Change
          </Button>
          <Button
            onClick={() => setMetric('volume')}
            variant={metric === 'volume' ? 'default' : 'outline'}
            size="sm"
            className={metric === 'volume' ? 'bg-cyan-600' : 'border-gray-600 hover:border-cyan-500'}
          >
            <Volume2 className="h-3 w-3 mr-1" />
            Volume
          </Button>
          <Button
            onClick={() => setMetric('market_cap')}
            variant={metric === 'market_cap' ? 'default' : 'outline'}
            size="sm"
            className={metric === 'market_cap' ? 'bg-cyan-600' : 'border-gray-600 hover:border-cyan-500'}
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Market Cap
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          {metric === 'change' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Bearish</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Bullish</span>
              </div>
            </>
          )}
          {metric === 'volume' && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Higher Volume</span>
            </div>
          )}
          {metric === 'market_cap' && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Higher Market Cap</span>
            </div>
          )}
        </div>
        <span>Size = Relative {metric === 'change' ? 'Change' : metric === 'volume' ? 'Volume' : 'Market Cap'}</span>
      </div>

      {/* Heatmap Grid */}
      <div className="relative h-64 bg-gray-900/30 rounded-lg p-4 overflow-hidden">
        <div className="flex flex-wrap gap-1 h-full content-start">
          {heatmapData.map((rune, index) => (
            <div
              key={rune.name}
              className="relative rounded cursor-pointer hover:opacity-80 transition-all duration-200 flex items-center justify-center text-center group"
              style={{
                backgroundColor: getColor(
                  metric === 'change' ? rune.change_24h : 
                  metric === 'volume' ? rune.volume_24h : 
                  rune.market_cap, 
                  metric
                ),
                width: getSize(rune),
                height: getSize(rune),
                minWidth: '60px',
                minHeight: '40px'
              }}
            >
              <div className="text-white font-bold text-xs p-1">
                <div className="truncate max-w-full">{rune.symbol}</div>
                <div className="text-xs opacity-90">
                  {formatValue(rune)}
                </div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-gray-600 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="font-bold">{rune.name}</div>
                <div>Change: {rune.change_24h >= 0 ? '+' : ''}{rune.change_24h.toFixed(1)}%</div>
                <div>Volume: ${(rune.volume_24h / 1000).toFixed(0)}K</div>
                <div>Market Cap: ${(rune.market_cap / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 text-xs">
        <div className="text-center">
          <div className="text-gray-400">Avg Change</div>
          <div className={`font-bold ${
            heatmapData.reduce((sum, r) => sum + r.change_24h, 0) / heatmapData.length >= 0 
              ? 'text-green-400' : 'text-red-400'
          }`}>
            {((heatmapData.reduce((sum, r) => sum + r.change_24h, 0) / heatmapData.length) || 0).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Total Volume</div>
          <div className="text-blue-400 font-bold">
            ${(heatmapData.reduce((sum, r) => sum + r.volume_24h, 0) / 1000000).toFixed(1)}M
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Top Gainer</div>
          <div className="text-green-400 font-bold">
            {Math.max(...heatmapData.map(r => r.change_24h)).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Top Loser</div>
          <div className="text-red-400 font-bold">
            {Math.min(...heatmapData.map(r => r.change_24h)).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}