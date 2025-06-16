'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Activity } from 'lucide-react';

interface HeatmapCell {
  name: string;
  symbol: string;
  value: number;
  change: number;
  volume: number;
}

export function RunesHeatmap() {
  const [metric, setMetric] = useState<'volume' | 'price' | 'activity'>('volume');
  
  const heatmapData: HeatmapCell[] = [
    { name: 'DOG•GO•TO•THE•MOON', symbol: 'DOG', value: 95, change: 15.2, volume: 2340000 },
    { name: 'UNCOMMON•GOODS', symbol: 'GOODS', value: 82, change: 8.9, volume: 1890000 },
    { name: 'RSIC•METAPROTOCOL', symbol: 'RSIC', value: 45, change: -3.1, volume: 1450000 },
    { name: 'MEME•WARFARE', symbol: 'MEME', value: 78, change: 12.5, volume: 980000 },
    { name: 'PIZZA•NINJAS', symbol: 'PIZZA', value: 65, change: 5.7, volume: 760000 },
    { name: 'BITCOIN•FRENS', symbol: 'FRENS', value: 38, change: -1.2, volume: 540000 },
    { name: 'RARE•PEPE', symbol: 'PEPE', value: 91, change: 45.2, volume: 890000 },
    { name: 'BITCOIN•PIZZA', symbol: 'BPIZZA', value: 72, change: 38.7, volume: 670000 },
    { name: 'WOJAK•COIN', symbol: 'WOJAK', value: 68, change: 29.3, volume: 450000 },
    { name: 'FLOOR•PROTOCOL', symbol: 'FLOOR', value: 25, change: -23.1, volume: 340000 },
    { name: 'RUG•PULL', symbol: 'RUG', value: 15, change: -19.8, volume: 120000 },
    { name: 'BEAR•MARKET', symbol: 'BEAR', value: 22, change: -15.4, volume: 89000 },
    { name: 'ORDINAL•PUNKS', symbol: 'PUNKS', value: 88, change: 22.3, volume: 1200000 },
    { name: 'BITCOIN•ROCKS', symbol: 'ROCKS', value: 54, change: 7.8, volume: 430000 },
    { name: 'RARE•SATS', symbol: 'SATS', value: 76, change: 18.9, volume: 890000 },
    { name: 'MOON•BOYS', symbol: 'MOON', value: 61, change: 11.2, volume: 560000 }
  ];

  const getColor = (value: number) => {
    if (value >= 80) return 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50';
    if (value >= 60) return 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50';
    if (value >= 40) return 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50';
    if (value >= 20) return 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50';
    return 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50';
  };

  const getIntensity = (cell: HeatmapCell) => {
    switch (metric) {
      case 'volume':
        return (cell.volume / 2340000) * 100; // Normalize by max volume
      case 'price':
        return Math.abs(cell.change) * 2; // Scale price changes
      case 'activity':
        return cell.value; // Use existing value for activity
      default:
        return cell.value;
    }
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Market Heatmap
          </CardTitle>
          <Select value={metric} onValueChange={(v) => setMetric(v as any)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="price">Price Change</SelectItem>
              <SelectItem value="activity">Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2">
          {heatmapData.map((cell, index) => {
            const intensity = getIntensity(cell);
            return (
              <div
                key={index}
                className={`relative p-3 rounded-lg border transition-all cursor-pointer ${getColor(intensity)}`}
                style={{
                  opacity: 0.5 + (intensity / 100) * 0.5
                }}
              >
                <div className="text-center">
                  <p className="font-bold text-xs">{cell.symbol}</p>
                  <p className={`text-xs mt-1 ${cell.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {cell.change >= 0 ? '+' : ''}{cell.change.toFixed(1)}%
                  </p>
                </div>
                
                {/* Hover tooltip */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-background/95 rounded-lg transition-opacity">
                  <div className="text-center p-2">
                    <p className="text-xs font-medium">{cell.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vol: ${(cell.volume / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500/30 rounded" />
            <span className="text-muted-foreground">Cold</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500/30 rounded" />
            <div className="w-3 h-3 bg-yellow-500/30 rounded" />
            <div className="w-3 h-3 bg-emerald-500/30 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/30 rounded" />
            <span className="text-muted-foreground">Hot</span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>Updates every 30s</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{metric === 'volume' ? 'Volume Heat' : metric === 'price' ? 'Price Movement' : 'Trading Activity'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}