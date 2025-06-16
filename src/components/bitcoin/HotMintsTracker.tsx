'use client';

import React, { useState } from 'react';
import { useHotMints } from '@/hooks/bitcoin/useHotMints';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, TrendingUp, Clock, Users, Zap, AlertCircle, Play, Pause } from 'lucide-react';

export function HotMintsTracker() {
  const { hotMints, trendingMints, recentMints, loading } = useHotMints();
  const [isLiveTracking, setIsLiveTracking] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');

  const getMintHeatLevel = (mintRate: number) => {
    if (mintRate >= 50) return { level: 'extreme', color: 'from-red-600 to-red-500', emoji: '🔥🔥🔥' };
    if (mintRate >= 25) return { level: 'hot', color: 'from-orange-500 to-red-500', emoji: '🔥🔥' };
    if (mintRate >= 10) return { level: 'warm', color: 'from-yellow-500 to-orange-500', emoji: '🔥' };
    return { level: 'cool', color: 'from-blue-500 to-green-500', emoji: '🟢' };
  };

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
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg mr-3 flex items-center justify-center">
            🔥
          </div>
          Hot Mints Tracker
        </h2>
        <div className="flex items-center space-x-2">
          <Badge className={`${isLiveTracking ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isLiveTracking ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            {isLiveTracking ? 'Live' : 'Paused'}
          </Badge>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsLiveTracking(!isLiveTracking)}
            className="border-white/20 text-gray-300 hover:bg-white/10"
          >
            {isLiveTracking ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            {isLiveTracking ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>

      {/* Timeframe Filter */}
      <div className="flex space-x-2 mb-6">
        {['1h', '6h', '24h', '7d'].map((period) => (
          <Button
            key={period}
            variant={selectedTimeframe === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeframe(period)}
            className={selectedTimeframe === period 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'border-white/20 text-gray-300 hover:bg-white/10'
            }
          >
            {period}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="hot" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="hot" className="data-[state=active]:bg-red-500">
            🔥 Hot Mints
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-red-500">
            📈 Trending
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-red-500">
            ⚡ Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hot" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {hotMints.map((mint) => {
              const heatLevel = getMintHeatLevel(mint.mintRate);
              return (
                <div
                  key={mint.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${heatLevel.color} flex items-center justify-center text-white text-2xl`}>
                        {heatLevel.emoji}
                      </div>
                      <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs animate-pulse">
                        HOT
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold flex items-center">
                        {mint.name}
                        <Flame className="w-4 h-4 text-red-400 ml-2" />
                      </h3>
                      <p className="text-gray-400 text-sm">{mint.category} • {mint.supply.toLocaleString()} supply</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-red-400 text-sm flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {mint.mintRate} mints/hr
                        </span>
                        <span className="text-blue-400 text-sm flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {mint.uniqueMinters} minters
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-white font-semibold">{mint.mintPrice} sats</span>
                      <Badge 
                        className="bg-red-500/20 text-red-400 border-red-500/30"
                      >
                        {mint.progress}% minted
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Remaining</p>
                        <p className="text-white font-semibold">{mint.remaining.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Est. Complete</p>
                        <p className="text-yellow-400 text-sm">{mint.estimatedCompletion}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-red-500 hover:bg-red-600">
                        <Flame className="w-3 h-3 mr-1" />
                        Mint Now
                      </Button>
                      <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Alert
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {trendingMints.map((mint, index) => (
              <div
                key={mint.id}
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
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold relative">
                      📈
                      <TrendingUp className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full p-0.5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{mint.name}</h3>
                    <p className="text-gray-400 text-sm">Trend Score: {mint.trendScore}/100</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500 text-xs">Started {mint.startTime}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold mb-1">{mint.mintPrice} sats</div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">
                    +{mint.mintRateIncrease}% rate increase
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-purple-500 hover:bg-purple-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Join Trend
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {recentMints.map((mint) => (
              <div
                key={mint.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      ⚡
                    </div>
                    <Badge className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs">
                      NEW
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{mint.name}</h3>
                    <p className="text-gray-400 text-sm">Just launched • {mint.mintPrice} sats</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-400 text-xs">{mint.launchTime} ago</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold mb-1">{mint.supply.toLocaleString()} total</div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2">
                    {mint.earlyMinters} early minters
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                      <Zap className="w-3 h-3 mr-1" />
                      Mint Early
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