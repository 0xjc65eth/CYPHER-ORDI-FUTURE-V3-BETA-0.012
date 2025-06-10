'use client';

import React, { useState } from 'react';
import { useRunesData } from '@/hooks/bitcoin/useRunesData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Volume2, Zap, ShoppingCart, Rocket, Bell } from 'lucide-react';

export function RunesMarket() {
  const { tradingPairs, volumeLeaders, newLaunches, loading } = useRunesData();
  const [selectedFilter, setSelectedFilter] = useState('all');

  if (loading) {
    return (
      <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mr-3 flex items-center justify-center">
            ᚱ
          </div>
          Runes Market
        </h2>
        <div className="flex items-center space-x-2">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Zap className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
            <Bell className="w-3 h-3 mr-1" />
            Alerts
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trading" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="trading" className="data-[state=active]:bg-purple-500">
            Active Trading
          </TabsTrigger>
          <TabsTrigger value="volume" className="data-[state=active]:bg-purple-500">
            Volume Leaders
          </TabsTrigger>
          <TabsTrigger value="launches" className="data-[state=active]:bg-purple-500">
            New Launches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-4 mt-4">
          <div className="flex space-x-2 mb-4">
            {['all', 'hot', 'trending', 'new'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={selectedFilter === filter 
                  ? 'bg-purple-500 hover:bg-purple-600' 
                  : 'border-white/20 text-gray-300 hover:bg-white/10'
                }
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="grid gap-4">
            {tradingPairs.map((pair) => (
              <div
                key={pair.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {pair.symbol.charAt(0)}
                    </div>
                    {pair.isHot && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        🔥
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold flex items-center">
                      {pair.name}
                      <span className="text-gray-400 ml-2">({pair.symbol})</span>
                    </h3>
                    <p className="text-gray-400 text-sm">Supply: {pair.totalSupply.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-white font-semibold">{pair.price} sats</p>
                    <Badge 
                      variant={pair.change24h >= 0 ? 'default' : 'destructive'}
                      className={pair.change24h >= 0 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }
                    >
                      {pair.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(pair.change24h)}%
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">24h Volume</p>
                    <p className="text-white font-semibold">{pair.volume24h} BTC</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Buy
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      Sell
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {volumeLeaders.map((leader, index) => (
              <div
                key={leader.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-300' : 
                      index === 2 ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold relative">
                      {leader.symbol.charAt(0)}
                      <Volume2 className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full p-0.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{leader.name}</h3>
                    <p className="text-gray-400 text-sm">Market Cap: {leader.marketCap} BTC</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1">{leader.volume24h} BTC</div>
                  <p className="text-gray-400 text-sm">{leader.trades24h} trades</p>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1">
                    {leader.volumeChange}% vs yesterday
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="launches" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {newLaunches.map((launch) => (
              <div
                key={launch.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                      {launch.symbol.charAt(0)}
                    </div>
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                      NEW
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold flex items-center">
                      {launch.name}
                      <Rocket className="w-4 h-4 text-green-400 ml-2" />
                    </h3>
                    <p className="text-gray-400 text-sm">Launched {launch.launchDate}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-green-400 text-sm">Initial Price: {launch.initialPrice} sats</span>
                      <span className="text-blue-400 text-sm">Total Supply: {launch.totalSupply.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold mb-1">{launch.currentPrice} sats</div>
                  <Badge 
                    className="bg-green-500/20 text-green-400 border-green-500/30 mb-2"
                  >
                    +{launch.priceIncrease}% since launch
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      <Rocket className="w-3 h-3 mr-1" />
                      Buy Early
                    </Button>
                    <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                      <Bell className="w-3 h-3 mr-1" />
                      Watch
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}