'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, TrendingDown, BarChart3, Activity, 
  Users, Zap, DollarSign, ArrowUpRight, ArrowDownRight,
  Clock, Globe, Layers, Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { runesService, type RuneMarketData, type RunesAnalytics } from '@/services/runes';

interface RunesMarketAnalyticsProps {
  selectedRune?: string;
}

export function RunesMarketAnalytics({ selectedRune }: RunesMarketAnalyticsProps) {
  const [analytics, setAnalytics] = useState<RunesAnalytics | null>(null);
  const [runesData, setRunesData] = useState<RuneMarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '24H' | '7D' | '30D'>('24H');
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'volume' | 'marketCap'>('price');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        const [analyticsData, marketData] = await Promise.all([
          runesService.getRunesAnalytics(),
          runesService.getRunesMarketData()
        ]);
        
        setAnalytics(analyticsData);
        setRunesData(marketData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

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

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Market Cap</p>
                <p className="text-2xl font-bold text-blue-400">
                  ${formatNumber(analytics.marketOverview.totalMarketCap)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">24h Volume</p>
                <p className="text-2xl font-bold text-green-400">
                  ${formatNumber(analytics.marketOverview.totalVolume24h)}
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
                <p className="text-sm text-gray-400">Active Runes</p>
                <p className="text-2xl font-bold text-purple-400">
                  {analytics.marketOverview.activeRunes.toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Holders</p>
                <p className="text-2xl font-bold text-orange-400">
                  {analytics.marketOverview.totalHolders.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Sentiment & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Sentiment */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <Target className="h-5 w-5" />
              Market Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <Badge 
                className={`text-lg px-4 py-2 ${
                  analytics.marketOverview.marketSentiment === 'bullish' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : analytics.marketOverview.marketSentiment === 'bearish'
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                }`}
              >
                {analytics.marketOverview.marketSentiment.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">New Runes (24h)</span>
                <span className="text-green-400 font-bold">
                  +{analytics.marketOverview.newRunes24h}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Price</span>
                <span className="text-white font-mono">
                  ${formatPrice(analytics.marketOverview.averagePrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cross-Chain Volume</span>
                <span className="text-purple-400">
                  ${formatNumber(analytics.crossChainMetrics.bridgeVolume24h)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <TrendingUp className="h-5 w-5" />
              Top Performers (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-green-400 mb-2">🚀 Top Gainers</h4>
                {analytics.topPerformers.gainers24h.slice(0, 3).map((rune, index) => (
                  <div key={rune.id} className="flex justify-between items-center py-1">
                    <span className="text-gray-300 text-sm font-mono">{rune.symbol}</span>
                    <span className="text-green-400 text-sm font-bold">
                      +{rune.price.change24h.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-red-400 mb-2">📉 Top Losers</h4>
                {analytics.topPerformers.losers24h.slice(0, 3).map((rune, index) => (
                  <div key={rune.id} className="flex justify-between items-center py-1">
                    <span className="text-gray-300 text-sm font-mono">{rune.symbol}</span>
                    <span className="text-red-400 text-sm font-bold">
                      {rune.price.change24h.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-500">
            <BarChart3 className="h-5 w-5" />
            Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="trends">Market Trends</TabsTrigger>
              <TabsTrigger value="distribution">Holdings</TabsTrigger>
              <TabsTrigger value="volume">Volume Leaders</TabsTrigger>
              <TabsTrigger value="crosschain">Cross-Chain</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Price Movement Trend */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Price Movement (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={analytics.trends.priceMovements}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#9CA3AF"
                          tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        />
                        <YAxis stroke="#9CA3AF" tickFormatter={formatPrice} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                          formatter={(value: any) => [`$${formatPrice(value)}`, 'Avg Price']}
                        />
                        <Area
                          type="monotone"
                          dataKey="averagePrice"
                          stroke="#f97316"
                          fill="#f97316"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Minting Activity */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Minting Activity (24h)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.trends.mintingActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#9CA3AF"
                          tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit' })}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          labelFormatter={(value) => new Date(value).toLocaleString()}
                        />
                        <Bar dataKey="mintsCount" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="distribution">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Holdings Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.trends.holdingDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ range, percentage }) => `${range}: ${percentage.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {analytics.trends.holdingDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {analytics.trends.holdingDistribution.map((item, index) => (
                        <div key={item.range} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm text-gray-300">{item.range}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">{item.holders.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">{item.percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="volume">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Volume Leaders (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topPerformers.volumeLeaders.slice(0, 10).map((rune, index) => (
                      <div key={rune.id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div className="flex items-center gap-3">
                          <div className="text-orange-500 font-bold">#{index + 1}</div>
                          <div>
                            <div className="font-bold text-white">{rune.symbol}</div>
                            <div className="text-xs text-gray-400">{rune.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">
                            ${formatNumber(rune.volume.volume24h)}
                          </div>
                          <div className="text-xs text-gray-400">
                            ${formatPrice(rune.price.current)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="crosschain">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Cross-Chain Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 p-4 rounded">
                      <div className="text-sm text-gray-400">Bridge Volume (24h)</div>
                      <div className="text-xl font-bold text-purple-400">
                        ${formatNumber(analytics.crossChainMetrics.bridgeVolume24h)}
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded">
                      <div className="text-sm text-gray-400">Wrapped Runes Value</div>
                      <div className="text-xl font-bold text-blue-400">
                        ${formatNumber(analytics.crossChainMetrics.wrappedRunesValue)}
                      </div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded">
                      <div className="text-sm text-gray-400">Cross-Chain Txs</div>
                      <div className="text-xl font-bold text-green-400">
                        {analytics.crossChainMetrics.crossChainTransactions.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}