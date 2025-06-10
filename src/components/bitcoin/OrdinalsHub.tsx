'use client';

import React, { useState } from 'react';
import { useOrdinalsData } from '@/hooks/bitcoin/useOrdinalsData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Eye, Star, Clock, AlertTriangle } from 'lucide-react';

export function OrdinalsHub() {
  const { collections, newInscriptions, rareInscriptions, loading } = useOrdinalsData();
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

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
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg mr-3 flex items-center justify-center">
            🟠
          </div>
          Ordinals Hub
        </h2>
        <div className="flex space-x-2">
          {['24h', '7d', '30d'].map((period) => (
            <Button
              key={period}
              variant={selectedTimeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(period)}
              className={selectedTimeframe === period 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'border-white/20 text-gray-300 hover:bg-white/10'
              }
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
          <TabsTrigger value="collections" className="data-[state=active]:bg-orange-500">
            Top Collections
          </TabsTrigger>
          <TabsTrigger value="inscriptions" className="data-[state=active]:bg-orange-500">
            New Inscriptions
          </TabsTrigger>
          <TabsTrigger value="rare" className="data-[state=active]:bg-orange-500">
            Rare Tracker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {collections.map((collection, index) => (
              <div
                key={collection.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold">
                    {collection.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{collection.name}</h3>
                    <p className="text-gray-400 text-sm">{collection.supply} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-semibold">{collection.floorPrice} BTC</span>
                    <Badge 
                      variant={collection.change24h >= 0 ? 'default' : 'destructive'}
                      className={collection.change24h >= 0 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }
                    >
                      {collection.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {Math.abs(collection.change24h)}%
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{collection.volume24h} BTC vol</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inscriptions" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {newInscriptions.map((inscription) => (
              <div
                key={inscription.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    {inscription.contentType === 'image' ? '🖼️' : 
                     inscription.contentType === 'text' ? '📝' : '🎵'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Inscription #{inscription.number}</h3>
                    <p className="text-gray-400 text-sm">{inscription.contentType} • {inscription.size}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500 text-xs">{inscription.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 mb-2">
                    {inscription.fee} sats/vB
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rare" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {rareInscriptions.map((rare) => (
              <div
                key={rare.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-2xl">
                      💎
                    </div>
                    <Badge 
                      className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs"
                    >
                      {rare.rarityRank}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold flex items-center">
                      {rare.name}
                      <Star className="w-4 h-4 text-yellow-400 ml-2" />
                    </h3>
                    <p className="text-gray-400 text-sm">{rare.category} • Rarity: {rare.rarityScore}/100</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      <span className="text-yellow-400 text-xs">{rare.traits} unique traits</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold mb-1">{rare.lastSale} BTC</div>
                  <Badge 
                    variant="outline" 
                    className="border-yellow-500/30 text-yellow-400 mb-2"
                  >
                    {rare.holders} holders
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                      <Star className="w-3 h-3 mr-1" />
                      Track
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