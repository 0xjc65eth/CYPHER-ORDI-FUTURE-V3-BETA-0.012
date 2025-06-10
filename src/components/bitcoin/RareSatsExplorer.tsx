'use client';

import React, { useState } from 'react';
import { useRareSats } from '@/hooks/bitcoin/useRareSats';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Diamond, Gem, Crown, Star, Filter, Search, TrendingUp, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function RareSatsExplorer() {
  const { rareSats, categories, loading } = useRareSats();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'epic': return <Diamond className="w-4 h-4 text-purple-400" />;
      case 'rare': return <Gem className="w-4 h-4 text-blue-400" />;
      case 'uncommon': return <Star className="w-4 h-4 text-green-400" />;
      default: return <Diamond className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-500 to-orange-500';
      case 'epic': return 'from-purple-500 to-pink-500';
      case 'rare': return 'from-blue-500 to-indigo-500';
      case 'uncommon': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const filteredSats = rareSats
    .filter(sat => selectedCategory === 'all' || sat.category === selectedCategory)
    .filter(sat => selectedRarity === 'all' || sat.rarity === selectedRarity)
    .filter(sat => sat.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg mr-3 flex items-center justify-center">
            💎
          </div>
          Rare Sats Explorer
        </h2>
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            {filteredSats.length} Rare Sats Found
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search rare sats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 bg-white/10 border-white/20 text-white placeholder-gray-400"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 text-sm">Rarity:</span>
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm"
          >
            <option value="all">All Rarities</option>
            <option value="legendary">Legendary</option>
            <option value="epic">Epic</option>
            <option value="rare">Rare</option>
            <option value="uncommon">Uncommon</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger value="grid" className="data-[state=active]:bg-yellow-500">
            Grid View
          </TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-yellow-500">
            List View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSats.map((sat) => (
              <div
                key={sat.id}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    className={`bg-gradient-to-r ${getRarityColor(sat.rarity)} text-white border-0`}
                  >
                    {getRarityIcon(sat.rarity)}
                    {sat.rarity}
                  </Badge>
                  <div className="text-right">
                    <div className="text-white font-bold">#{sat.number}</div>
                    <div className="text-gray-400 text-xs">Rarity Score</div>
                    <div className="text-yellow-400 font-semibold">{sat.rarityScore}/100</div>
                  </div>
                </div>
                
                <div className={`w-full h-32 rounded-lg bg-gradient-to-br ${getRarityColor(sat.rarity)} mb-3 flex items-center justify-center text-white text-4xl`}>
                  {sat.visual || '💎'}
                </div>
                
                <h3 className="text-white font-semibold mb-1">{sat.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{sat.category}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-gray-400 text-xs">Floor Price</p>
                    <p className="text-white font-semibold">{sat.floorPrice} BTC</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">24h Change</p>
                    <Badge 
                      variant={sat.change24h >= 0 ? 'default' : 'destructive'}
                      className={sat.change24h >= 0 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }
                    >
                      {sat.change24h >= 0 ? '+' : ''}{sat.change24h}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1 bg-yellow-500 hover:bg-yellow-600">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <div className="space-y-4">
            {filteredSats.map((sat) => (
              <div
                key={sat.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getRarityColor(sat.rarity)} flex items-center justify-center text-white text-2xl`}>
                    {sat.visual || '💎'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold flex items-center">
                      {sat.name}
                      {getRarityIcon(sat.rarity)}
                    </h3>
                    <p className="text-gray-400 text-sm">{sat.category} • #{sat.number}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <Badge className={`bg-gradient-to-r ${getRarityColor(sat.rarity)} text-white border-0 text-xs`}>
                        {sat.rarity}
                      </Badge>
                      <span className="text-yellow-400 text-sm">Score: {sat.rarityScore}/100</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Floor Price</p>
                    <p className="text-white font-semibold">{sat.floorPrice} BTC</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">24h Change</p>
                    <Badge 
                      variant={sat.change24h >= 0 ? 'default' : 'destructive'}
                      className={sat.change24h >= 0 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }
                    >
                      {sat.change24h >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : ''}
                      {sat.change24h >= 0 ? '+' : ''}{sat.change24h}%
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Holders</p>
                    <p className="text-white font-semibold">{sat.holders}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
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