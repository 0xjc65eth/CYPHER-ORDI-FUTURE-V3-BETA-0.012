'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { bitcoinEcosystemService, type RuneData } from '@/services/BitcoinEcosystemService';

interface Mover {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  volume: number;
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
        console.log('🔄 Loading real Runes movers from Hiro API...');
        
        const runesData = await bitcoinEcosystemService.getRunesData();
        
        // Sort by 24h change to find gainers and losers
        const sortedByChange = [...runesData].sort((a, b) => b.change24h - a.change24h);
        
        // Get top 3 gainers (positive change)
        const gainers = sortedByChange
          .filter(rune => rune.change24h > 0)
          .slice(0, 3)
          .map((rune): Mover => ({
            id: rune.id,
            name: rune.name,
            symbol: rune.symbol,
            price: rune.price,
            change: rune.change24h,
            volume: rune.volume24h,
            type: 'gainer'
          }));
        
        // Get top 3 losers (negative change)
        const losers = sortedByChange
          .filter(rune => rune.change24h < 0)
          .slice(-3)
          .reverse() // Most negative first
          .map((rune): Mover => ({
            id: rune.id,
            name: rune.name,
            symbol: rune.symbol,
            price: rune.price,
            change: rune.change24h,
            volume: rune.volume24h,
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
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Top Movers</span>
          <Flame className="h-4 w-4 text-orange-500" />
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
                <h4 className="text-sm font-medium text-green-500 mb-2">Top Gainers</h4>
                <div className="space-y-2">
                  {gainers.map((gainer, index) => (
                    <div key={gainer.id} className="flex items-center justify-between p-2 bg-green-500/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm" title={gainer.name}>{gainer.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {gainer.volume >= 1000000 ? 
                              `$${(gainer.volume / 1000000).toFixed(1)}M vol` : 
                              `$${(gainer.volume / 1000).toFixed(0)}K vol`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {gainer.price < 0.0001 ? gainer.price.toExponential(2) : `$${gainer.price.toFixed(8)}`}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500 font-medium">
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
                <h4 className="text-sm font-medium text-red-500 mb-2">Top Losers</h4>
                <div className="space-y-2">
                  {losers.map((loser, index) => (
                    <div key={loser.id} className="flex items-center justify-between p-2 bg-red-500/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                          #{index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm" title={loser.name}>{loser.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {loser.volume >= 1000000 ? 
                              `$${(loser.volume / 1000000).toFixed(1)}M vol` : 
                              `$${(loser.volume / 1000).toFixed(0)}K vol`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">
                          {loser.price < 0.0001 ? loser.price.toExponential(2) : `$${loser.price.toFixed(8)}`}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          <TrendingDown className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500 font-medium">
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