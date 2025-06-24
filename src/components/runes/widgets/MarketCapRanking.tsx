'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, TrendingDown, Crown, Medal, Award } from 'lucide-react';

interface RuneRanking {
  rank: number;
  name: string;
  symbol: string;
  marketCap: number;
  change24h: number;
  volume24h: number;
  holders: number;
  dominance: number;
}

export function MarketCapRanking() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  
  const rankings: RuneRanking[] = [
    {
      rank: 1,
      name: 'DOG•GO•TO•THE•MOON',
      symbol: 'DOG',
      marketCap: 12500000,
      change24h: 15.2,
      volume24h: 2340000,
      holders: 5234,
      dominance: 28.5
    },
    {
      rank: 2,
      name: 'UNCOMMON•GOODS',
      symbol: 'GOODS',
      marketCap: 8900000,
      change24h: 8.9,
      volume24h: 1890000,
      holders: 3812,
      dominance: 20.3
    },
    {
      rank: 3,
      name: 'RSIC•METAPROTOCOL',
      symbol: 'RSIC',
      marketCap: 6700000,
      change24h: -3.1,
      volume24h: 1450000,
      holders: 2934,
      dominance: 15.3
    },
    {
      rank: 4,
      name: 'MEME•WARFARE',
      symbol: 'MEME',
      marketCap: 4500000,
      change24h: 12.5,
      volume24h: 980000,
      holders: 1789,
      dominance: 10.3
    },
    {
      rank: 5,
      name: 'PIZZA•NINJAS',
      symbol: 'PIZZA',
      marketCap: 3400000,
      change24h: 5.7,
      volume24h: 760000,
      holders: 1234,
      dominance: 7.8
    },
    {
      rank: 6,
      name: 'BITCOIN•FRENS',
      symbol: 'FRENS',
      marketCap: 2800000,
      change24h: -1.2,
      volume24h: 540000,
      holders: 987,
      dominance: 6.4
    },
    {
      rank: 7,
      name: 'ORDINAL•PUNKS',
      symbol: 'PUNKS',
      marketCap: 2300000,
      change24h: 22.3,
      volume24h: 1200000,
      holders: 2456,
      dominance: 5.2
    },
    {
      rank: 8,
      name: 'RARE•SATS',
      symbol: 'SATS',
      marketCap: 1900000,
      change24h: 18.9,
      volume24h: 890000,
      holders: 1678,
      dominance: 4.3
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const totalMarketCap = rankings.reduce((sum, r) => sum + r.marketCap, 0);

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Market Cap Rankings
          </CardTitle>
          <Badge variant="outline">
            Total: ${(totalMarketCap / 1000000).toFixed(1)}M
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankings.map((rune) => (
            <div key={rune.rank} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">
                    {getRankIcon(rune.rank)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{rune.symbol}</p>
                    <p className="text-xs text-muted-foreground">{rune.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">${(rune.marketCap / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center justify-end gap-1">
                    {rune.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${
                      rune.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {rune.change24h >= 0 ? '+' : ''}{rune.change24h.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Progress value={rune.dominance} className="flex-1 h-1.5" />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {rune.dominance.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{rune.holders.toLocaleString()} holders</span>
                <span>${(rune.volume24h / 1000000).toFixed(1)}M vol</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Avg Market Cap</p>
              <p className="font-medium">${(totalMarketCap / rankings.length / 1000000).toFixed(1)}M</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="text-muted-foreground">Total Holders</p>
              <p className="font-medium">{rankings.reduce((sum, r) => sum + r.holders, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default MarketCapRanking;