'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Droplets, DollarSign, TrendingUp, Users, 
  ArrowRightLeft, Layers, Target, AlertTriangle,
  Coins, BarChart3, Zap, Shield
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { runesService, type LiquidityPool, type YieldFarmingOpportunity } from '@/services/runes';

export function RunesLiquidityAnalysis() {
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([]);
  const [yieldOpportunities, setYieldOpportunities] = useState<YieldFarmingOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [sortBy, setSortBy] = useState<'tvl' | 'apr' | 'volume'>('tvl');

  useEffect(() => {
    const loadLiquidityData = async () => {
      try {
        setIsLoading(true);
        const [pools, opportunities] = await Promise.all([
          runesService.getLiquidityPools(),
          runesService.getYieldFarmingOpportunities()
        ]);
        
        setLiquidityPools(pools);
        setYieldOpportunities(opportunities);
        
        if (pools.length > 0) {
          setSelectedPool(pools[0]);
        }
      } catch (error) {
        console.error('Failed to load liquidity data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiquidityData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  const formatPrice = (price: number) => {
    if (price < 0.000001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(6);
    return price.toFixed(4);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const sortedPools = [...liquidityPools].sort((a, b) => {
    switch (sortBy) {
      case 'tvl': return b.tvl - a.tvl;
      case 'apr': return b.apr - a.apr;
      case 'volume': return b.volume24h - a.volume24h;
      default: return 0;
    }
  });

  const sortedOpportunities = [...yieldOpportunities].sort((a, b) => b.apr - a.apr);

  const totalTVL = liquidityPools.reduce((sum, pool) => sum + pool.tvl, 0);
  const totalVolume24h = liquidityPools.reduce((sum, pool) => sum + pool.volume24h, 0);
  const avgAPR = liquidityPools.length > 0 ? liquidityPools.reduce((sum, pool) => sum + pool.apr, 0) / liquidityPools.length : 0;

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Liquidity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total TVL</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${formatNumber(totalTVL)}
                </p>
              </div>
              <Droplets className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">24h Volume</p>
                <p className="text-2xl font-bold text-green-400">
                  ${formatNumber(totalVolume24h)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg APR</p>
                <p className="text-2xl font-bold text-purple-400">
                  {avgAPR.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-500">
            <Droplets className="h-5 w-5" />
            Liquidity & Yield Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pools" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
              <TabsTrigger value="farming">Yield Farming</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="pools" className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-400">Sort by:</span>
                <div className="flex gap-2">
                  {(['tvl', 'apr', 'volume'] as const).map((option) => (
                    <Button
                      key={option}
                      variant={sortBy === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(option)}
                      className={sortBy === option ? "bg-orange-500 text-black" : ""}
                    >
                      {option.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pools List */}
                <div className="space-y-3">
                  {sortedPools.map((pool) => (
                    <Card 
                      key={pool.id} 
                      className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                        selectedPool?.id === pool.id ? 'ring-2 ring-orange-500' : 'hover:bg-gray-750'
                      }`}
                      onClick={() => setSelectedPool(pool)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4 text-orange-500" />
                            <span className="font-bold text-white">
                              {pool.runeA.symbol}/{pool.runeB.symbol}
                            </span>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {pool.platform}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">TVL:</span>
                            <span className="ml-2 text-green-400 font-bold">
                              ${formatNumber(pool.tvl)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">APR:</span>
                            <span className="ml-2 text-purple-400 font-bold">
                              {pool.apr.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Volume:</span>
                            <span className="ml-2 text-blue-400">
                              ${formatNumber(pool.volume24h)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Impact:</span>
                            <span className="ml-2 text-yellow-400">
                              {pool.priceImpact.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Selected Pool Details */}
                {selectedPool && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5 text-orange-500" />
                        {selectedPool.runeA.symbol}/{selectedPool.runeB.symbol} Pool
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Pool Composition */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Pool Composition</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{selectedPool.runeA.symbol}</span>
                            <span className="font-mono text-white">
                              {formatNumber(selectedPool.runeA.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{selectedPool.runeB.symbol}</span>
                            <span className="font-mono text-white">
                              {formatNumber(selectedPool.runeB.amount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Metrics</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-700 p-2 rounded">
                            <div className="text-gray-400">Fees (24h)</div>
                            <div className="text-green-400 font-bold">
                              ${formatNumber(selectedPool.fees24h)}
                            </div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded">
                            <div className="text-gray-400">LP Tokens</div>
                            <div className="text-blue-400 font-bold">
                              {formatNumber(selectedPool.lpTokens)}
                            </div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded">
                            <div className="text-gray-400">Bid-Ask Spread</div>
                            <div className="text-yellow-400 font-bold">
                              {selectedPool.priceImpact.toFixed(3)}%
                            </div>
                          </div>
                          <div className="bg-gray-700 p-2 rounded">
                            <div className="text-gray-400">Platform</div>
                            <div className="text-purple-400 font-bold">
                              {selectedPool.platform}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* APR Breakdown */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">APR Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Trading Fees</span>
                            <span className="text-green-400">
                              {(selectedPool.apr * 0.7).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Liquidity Rewards</span>
                            <span className="text-blue-400">
                              {(selectedPool.apr * 0.3).toFixed(1)}%
                            </span>
                          </div>
                          <div className="border-t border-gray-600 pt-2">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-white">Total APR</span>
                              <span className="text-purple-400">
                                {selectedPool.apr.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="farming" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedOpportunities.map((opportunity) => (
                  <Card key={opportunity.poolId} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{opportunity.name}</CardTitle>
                        <Badge className={getRiskColor(opportunity.riskLevel)}>
                          {opportunity.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* APR Display */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">
                          {opportunity.apr.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">APR</div>
                      </div>

                      {/* Pool Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">TVL:</span>
                          <span className="text-blue-400">${formatNumber(opportunity.tvl)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platform:</span>
                          <span className="text-purple-400">{opportunity.platform}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Lock Period:</span>
                          <span className="text-yellow-400">
                            {opportunity.lockPeriod === 0 ? 'None' : `${opportunity.lockPeriod} days`}
                          </span>
                        </div>
                      </div>

                      {/* Reward Tokens */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Rewards</h4>
                        <div className="space-y-1">
                          {opportunity.rewards.map((reward, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-gray-300">{reward.token}</span>
                              <span className="text-green-400">
                                ${formatNumber(reward.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-black"
                          size="sm"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          Stake
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-600 hover:bg-gray-700"
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* TVL vs APR Scatter */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">TVL vs APR Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart data={liquidityPools}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="tvl" 
                          stroke="#9CA3AF" 
                          tickFormatter={formatNumber}
                          name="TVL"
                        />
                        <YAxis 
                          dataKey="apr" 
                          stroke="#9CA3AF"
                          name="APR"
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          formatter={(value: any, name: string) => [
                            name === 'apr' ? `${value.toFixed(1)}%` : `$${formatNumber(value)}`,
                            name.toUpperCase()
                          ]}
                        />
                        <Scatter dataKey="apr" fill="#f97316" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Platform Distribution */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Platform Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(
                        liquidityPools.reduce((acc, pool) => {
                          acc[pool.platform] = (acc[pool.platform] || 0) + pool.tvl;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([platform, tvl]) => (
                        <div key={platform} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">{platform}</span>
                            <span className="text-green-400">${formatNumber(tvl)}</span>
                          </div>
                          <Progress 
                            value={(tvl / totalTVL) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}