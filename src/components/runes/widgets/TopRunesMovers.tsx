'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame, Crown } from 'lucide-react';
import { runesRealDataService } from '@/services/runes/RunesRealDataService';
import { RuneMarketData } from '@/services/runes';

interface Mover {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  rank: number;
  type: 'gainer' | 'loser';
}

export function TopRunesMovers() {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real Runes data and calculate movers
  useEffect(() => {
    const loadMovers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 Loading real Runes movers...');
        
        const runesData = await runesRealDataService.getRealRunesMarketData();
        
        // Sort by 24h change to find gainers and losers
        const sortedByChange = [...runesData].sort((a, b) => b.price.change24h - a.price.change24h);
        
        // Get top 5 gainers (positive change)
        const gainers = sortedByChange
          .filter(rune => rune.price.change24h > 0)
          .slice(0, 5)
          .map((rune): Mover => ({
            id: rune.id,
            name: rune.name,
            symbol: rune.symbol,
            price: rune.price.current,
            change: rune.price.change24h,
            volume: rune.volume.volume24h,
            marketCap: rune.marketCap.current,
            rank: rune.marketCap.rank,
            type: 'gainer'
          }));
        
        // Get top 5 losers (negative change)
        const losers = sortedByChange
          .filter(rune => rune.price.change24h < 0)
          .slice(-5)
          .reverse() // Most negative first
          .map((rune): Mover => ({
            id: rune.id,
            name: rune.name,
            symbol: rune.symbol,
            price: rune.price.current,
            change: rune.price.change24h,
            volume: rune.volume.volume24h,
            marketCap: rune.marketCap.current,
            rank: rune.marketCap.rank,
            type: 'loser'
          }));
        
        setMovers([...gainers, ...losers]);
        console.log(`✅ Loaded ${gainers.length} gainers and ${losers.length} losers`);
      } catch (err) {
        console.error('❌ Failed to load runes movers:', err);
        setError('Failed to load movers data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMovers();
  }, []);

  const gainers = movers.filter(m => m.type === 'gainer');
  const losers = movers.filter(m => m.type === 'loser');

  return (
    <Card className="bg-black border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            <span>Market Movers</span>
          </div>
          <Badge variant="outline" className="text-xs bg-orange-900/20 border-orange-500/30 text-orange-400">
            {movers.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading movers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : movers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No movers data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top Gainers */}
            {gainers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top Gainers (24h)
                </h4>
                <div className="space-y-2">
                  {gainers.map((gainer, index) => (
                    <div key={gainer.id} className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-lg hover:bg-green-500/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {gainer.rank <= 3 && <Crown className="h-3 w-3 text-yellow-400" />}
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs font-mono">
                            #{gainer.rank}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white" title={gainer.name}>
                            {gainer.name.length > 20 ? gainer.name.substring(0, 20) + '...' : gainer.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="font-mono">{gainer.symbol}</span>
                            <span>•</span>
                            <span>
                              ${gainer.marketCap >= 1000000 ? 
                                `${(gainer.marketCap / 1000000).toFixed(1)}M` : 
                                `${(gainer.marketCap / 1000).toFixed(0)}K`
                              } mcap
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-white">
                          ${gainer.price < 0.0001 ? gainer.price.toExponential(2) : 
                            gainer.price < 1 ? gainer.price.toFixed(6) : gainer.price.toFixed(4)}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-green-400" />
                          <span className="text-xs text-green-400 font-bold">
                            +{gainer.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Losers */}
            {losers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Top Losers (24h)
                </h4>
                <div className="space-y-2">
                  {losers.map((loser, index) => (
                    <div key={loser.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {loser.rank <= 3 && <Crown className="h-3 w-3 text-yellow-400" />}
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs font-mono">
                            #{loser.rank}
                          </Badge>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-white" title={loser.name}>
                            {loser.name.length > 20 ? loser.name.substring(0, 20) + '...' : loser.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="font-mono">{loser.symbol}</span>
                            <span>•</span>
                            <span>
                              ${loser.marketCap >= 1000000 ? 
                                `${(loser.marketCap / 1000000).toFixed(1)}M` : 
                                `${(loser.marketCap / 1000).toFixed(0)}K`
                              } mcap
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-white">
                          ${loser.price < 0.0001 ? loser.price.toExponential(2) : 
                            loser.price < 1 ? loser.price.toFixed(6) : loser.price.toFixed(4)}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          <TrendingDown className="h-3 w-3 text-red-400" />
                          <span className="text-xs text-red-400 font-bold">
                            {loser.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gainers.length === 0 && losers.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No significant price movements today</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TopRunesMovers;