'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { runesRealDataService } from '@/services/runes/RunesRealDataService';
import { RuneMarketData } from '@/services/runes';

interface HeatmapCell {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  volume: number;
  marketCap: number;
  rank: number;
  price: number;
  flash?: 'up' | 'down' | null;
}

export function RunesHeatmap() {
  const [metric, setMetric] = useState<'volume' | 'price' | 'activity' | 'marketcap'>('volume');
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Load real Runes data
  useEffect(() => {
    const loadHeatmapData = async () => {
      try {
        setIsLoading(true);
        const runesData = await runesRealDataService.getRealRunesMarketData();
        
        // Transform to heatmap format and take top 16 for grid
        const transformedData: HeatmapCell[] = runesData.slice(0, 16).map((rune) => ({
          id: rune.id,
          name: rune.name,
          symbol: rune.symbol,
          value: rune.volume.volume24h / 1000000, // Volume in millions as activity value
          change: rune.price.change24h,
          volume: rune.volume.volume24h,
          marketCap: rune.marketCap.current,
          rank: rune.marketCap.rank,
          price: rune.price.current,
          flash: null
        }));

        setHeatmapData(transformedData);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to load heatmap data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHeatmapData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadHeatmapData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Simulate price flashing every 2 seconds
  useEffect(() => {
    if (heatmapData.length === 0) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * heatmapData.length);
      const flashType = Math.random() > 0.5 ? 'up' : 'down';
      
      setHeatmapData(prev => prev.map((cell, index) => 
        index === randomIndex 
          ? { ...cell, flash: flashType }
          : { ...cell, flash: null }
      ));
    }, 2000);

    return () => clearInterval(interval);
  }, [heatmapData.length]);

  const getColor = (value: number) => {
    if (value >= 80) return 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50';
    if (value >= 60) return 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50';
    if (value >= 40) return 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50';
    if (value >= 20) return 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50';
    return 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50';
  };

  const getIntensity = (cell: HeatmapCell) => {
    const maxVolume = Math.max(...heatmapData.map(c => c.volume));
    const maxMarketCap = Math.max(...heatmapData.map(c => c.marketCap));
    
    switch (metric) {
      case 'volume':
        return maxVolume > 0 ? (cell.volume / maxVolume) * 100 : 0;
      case 'price':
        return Math.min(100, Math.abs(cell.change) * 3); // Scale price changes
      case 'activity':
        return Math.min(100, cell.value * 20); // Scale activity (volume in millions)
      case 'marketcap':
        return maxMarketCap > 0 ? (cell.marketCap / maxMarketCap) * 100 : 0;
      default:
        return cell.value;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toFixed(0);
  };

  return (
    <Card className="bg-black border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Flame className="h-5 w-5 text-orange-400" />
            Live Heatmap
            {!isLoading && (
              <Badge variant="outline" className="bg-orange-900/20 border-orange-500/30 text-orange-400">
                {heatmapData.length} Runes
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Zap className="h-3 w-3" />
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
              <SelectTrigger className="w-[130px] bg-gray-900 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume">Volume</SelectItem>
                <SelectItem value="price">Price Change</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="marketcap">Market Cap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin h-8 w-8 border-2 border-orange-400 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {heatmapData.map((cell, index) => {
              const intensity = getIntensity(cell);
              const isFlashing = cell.flash !== null;
              
              return (
                <div
                  key={cell.id}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all cursor-pointer duration-300
                    ${isFlashing 
                      ? cell.flash === 'up' 
                        ? 'border-green-400 bg-green-500/30 shadow-lg shadow-green-500/25' 
                        : 'border-red-400 bg-red-500/30 shadow-lg shadow-red-500/25'
                      : getColor(intensity)
                    }
                  `}
                  style={{
                    opacity: isFlashing ? 1 : 0.5 + (intensity / 100) * 0.5
                  }}
                >
                  {/* Rank badge */}
                  <div className="absolute -top-1 -left-1">
                    <Badge variant="outline" className="text-xs bg-black border-gray-600">
                      #{cell.rank}
                    </Badge>
                  </div>

                  {/* Flash indicator */}
                  {isFlashing && (
                    <div className={`absolute top-1 right-1 ${
                      cell.flash === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {cell.flash === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </div>
                  )}
                  
                  <div className="text-center space-y-1">
                    <p className="font-bold text-xs text-white truncate" title={cell.name}>
                      {cell.symbol}
                    </p>
                    <p className={`text-xs font-bold ${
                      cell.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {cell.change >= 0 ? '+' : ''}{cell.change.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400">
                      ${formatNumber(cell.marketCap)}
                    </p>
                  </div>
                  
                  {/* Hover tooltip */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/95 rounded-lg transition-opacity z-10">
                    <div className="text-center p-2">
                      <p className="text-xs font-medium text-white">{cell.name}</p>
                      <div className="text-xs text-gray-400 mt-1 space-y-1">
                        <p>Rank: #{cell.rank}</p>
                        <p>MCap: ${formatNumber(cell.marketCap)}</p>
                        <p>Vol: ${formatNumber(cell.volume)}</p>
                        <p>Price: ${cell.price < 0.01 ? cell.price.toFixed(6) : cell.price.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Enhanced Legend */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500/30 rounded border border-red-500/50" />
              <span className="text-gray-400">Low {metric}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500/30 rounded border border-orange-500/50" />
              <div className="w-3 h-3 bg-yellow-500/30 rounded border border-yellow-500/50" />
              <div className="w-3 h-3 bg-emerald-500/30 rounded border border-emerald-500/50" />
              <div className="w-3 h-3 bg-green-500/30 rounded border border-green-500/50" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">High {metric}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-orange-400" />
                <span>Auto-refresh: 30s</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span>Flash: 2s</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <TrendingDown className="h-3 w-3 text-red-400" />
              <span>
                {metric === 'volume' ? 'Trading Volume Intensity' : 
                 metric === 'price' ? 'Price Movement Magnitude' : 
                 metric === 'marketcap' ? 'Market Cap Ranking' :
                 'Trading Activity Level'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RunesHeatmap;