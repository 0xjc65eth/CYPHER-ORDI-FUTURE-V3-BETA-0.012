'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Crown,
  Flame,
  Users,
  Volume2,
  Target,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RuneSelector } from './RuneSelector';

interface RuneToken {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  mintProgress: number;
  mintingActive: boolean;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category?: string;
  totalSupply: number;
  circulatingSupply: number;
  divisibility: number;
}

interface RuneComparisonProps {
  tokens: RuneToken[];
  maxComparisons?: number;
  defaultTokens?: string[];
  favorites: string[];
  onToggleFavorite: (tokenId: string) => void;
}

interface ComparisonMetric {
  name: string;
  key: keyof RuneToken;
  format: (value: any) => string;
  color: string;
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    name: 'Price',
    key: 'price',
    format: (value) => `${value.toFixed(8)} BTC`,
    color: '#3B82F6'
  },
  {
    name: '24h Change',
    key: 'priceChangePercent24h',
    format: (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
    color: '#10B981'
  },
  {
    name: 'Market Cap',
    key: 'marketCap',
    format: (value) => `${value.toFixed(2)} BTC`,
    color: '#F59E0B'
  },
  {
    name: 'Volume',
    key: 'volume24h',
    format: (value) => `${value.toFixed(2)} BTC`,
    color: '#8B5CF6'
  },
  {
    name: 'Holders',
    key: 'holders',
    format: (value) => value.toLocaleString(),
    color: '#EF4444'
  },
  {
    name: 'Mint Progress',
    key: 'mintProgress',
    format: (value) => `${value.toFixed(1)}%`,
    color: '#06B6D4'
  }
];

const RARITY_COLORS = {
  common: '#6B7280',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B'
};

export const RuneComparison: React.FC<RuneComparisonProps> = ({
  tokens,
  maxComparisons = 5,
  defaultTokens = [],
  favorites,
  onToggleFavorite
}) => {
  const [selectedTokens, setSelectedTokens] = useState<string[]>(defaultTokens);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'metrics' | 'radar'>('overview');

  // Get comparison data
  const comparisonTokens = useMemo(() => {
    return selectedTokens.map(tokenId => 
      tokens.find(token => token.id === tokenId)
    ).filter(Boolean) as RuneToken[];
  }, [selectedTokens, tokens]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const metrics = ['price', 'volume24h', 'marketCap', 'holders', 'mintProgress'];
    
    return metrics.map(metric => {
      const dataPoint: any = { metric: metric.charAt(0).toUpperCase() + metric.slice(1) };
      
      comparisonTokens.forEach(token => {
        let value = token[metric as keyof RuneToken] as number;
        
        // Normalize values for better comparison
        if (metric === 'price') {
          value = value * 100000; // Scale up for visibility
        } else if (metric === 'marketCap' || metric === 'volume24h') {
          value = value / 100; // Scale down for visibility
        }
        
        dataPoint[token.symbol] = value;
      });
      
      return dataPoint;
    });
  }, [comparisonTokens]);

  // Prepare radar chart data
  const radarData = useMemo(() => {
    return comparisonTokens.map(token => {
      // Normalize all metrics to 0-100 scale for radar chart
      const maxPrice = Math.max(...tokens.map(t => t.price));
      const maxVolume = Math.max(...tokens.map(t => t.volume24h));
      const maxMarketCap = Math.max(...tokens.map(t => t.marketCap));
      const maxHolders = Math.max(...tokens.map(t => t.holders));
      
      return {
        token: token.symbol,
        price: (token.price / maxPrice) * 100,
        volume: (token.volume24h / maxVolume) * 100,
        marketCap: (token.marketCap / maxMarketCap) * 100,
        holders: (token.holders / maxHolders) * 100,
        mintProgress: token.mintProgress,
        change: Math.max(0, token.priceChangePercent24h + 50) // Shift to positive range
      };
    });
  }, [comparisonTokens, tokens]);

  const addToken = (tokenId: string) => {
    if (selectedTokens.length < maxComparisons && !selectedTokens.includes(tokenId)) {
      setSelectedTokens(prev => [...prev, tokenId]);
    }
  };

  const removeToken = (tokenId: string) => {
    setSelectedTokens(prev => prev.filter(id => id !== tokenId));
  };

  const clearAll = () => {
    setSelectedTokens([]);
  };

  const canAddMore = selectedTokens.length < maxComparisons;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Rune Comparison
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {selectedTokens.length}/{maxComparisons} tokens
            </Badge>
            {selectedTokens.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
        </div>
        
        {/* Token Selection */}
        <div className="flex flex-wrap gap-2">
          {comparisonTokens.map((token) => (
            <motion.div
              key={token.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {token.rarity && (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: RARITY_COLORS[token.rarity] }}
                  />
                )}
                <span className="font-medium">{token.symbol}</span>
                {token.mintingActive && <Flame className="w-3 h-3 text-orange-500" />}
                {token.rarity === 'legendary' && <Crown className="w-3 h-3 text-yellow-500" />}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeToken(token.id)}
                className="p-1 h-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          ))}
          
          {canAddMore && (
            <RuneSelector
              tokens={tokens}
              selectedToken=""
              onTokenSelect={addToken}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              size="sm"
              className="bg-dashed border-2 border-dashed border-gray-300 hover:border-gray-400"
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        {selectedTokens.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No tokens selected
            </h3>
            <p className="text-gray-500 mb-4">
              Add up to {maxComparisons} tokens to compare their performance and metrics
            </p>
            <RuneSelector
              tokens={tokens}
              selectedToken=""
              onTokenSelect={addToken}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="radar">Radar</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="overview" className="mt-0">
                    <div className="space-y-6">
                      {/* Quick Comparison Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3">Token</th>
                              <th className="text-right p-3">Price</th>
                              <th className="text-right p-3">24h Change</th>
                              <th className="text-right p-3">Market Cap</th>
                              <th className="text-right p-3">Volume</th>
                              <th className="text-right p-3">Holders</th>
                              <th className="text-center p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonTokens.map((token) => (
                              <tr key={token.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    {token.rarity && (
                                      <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: RARITY_COLORS[token.rarity] }}
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium">{token.symbol}</div>
                                      <div className="text-xs text-gray-500 truncate max-w-32">
                                        {token.name}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right p-3 font-medium">
                                  {token.price.toFixed(8)} BTC
                                </td>
                                <td className={`text-right p-3 ${
                                  token.priceChangePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {token.priceChangePercent24h >= 0 ? '+' : ''}
                                  {token.priceChangePercent24h.toFixed(2)}%
                                </td>
                                <td className="text-right p-3">
                                  {token.marketCap.toFixed(2)} BTC
                                </td>
                                <td className="text-right p-3">
                                  {token.volume24h.toFixed(2)} BTC
                                </td>
                                <td className="text-right p-3">
                                  {token.holders.toLocaleString()}
                                </td>
                                <td className="text-center p-3">
                                  {token.mintingActive ? (
                                    <Badge variant="default" className="bg-green-500">
                                      <Flame className="w-3 h-3 mr-1" />
                                      Minting
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">Complete</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="text-sm text-blue-700 dark:text-blue-300">Highest Price</div>
                          <div className="font-bold text-blue-600">
                            {Math.max(...comparisonTokens.map(t => t.price)).toFixed(8)} BTC
                          </div>
                          <div className="text-xs text-blue-500">
                            {comparisonTokens.find(t => t.price === Math.max(...comparisonTokens.map(t => t.price)))?.symbol}
                          </div>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                          <div className="text-sm text-green-700 dark:text-green-300">Best Performer</div>
                          <div className="font-bold text-green-600">
                            +{Math.max(...comparisonTokens.map(t => t.priceChangePercent24h)).toFixed(2)}%
                          </div>
                          <div className="text-xs text-green-500">
                            {comparisonTokens.find(t => t.priceChangePercent24h === Math.max(...comparisonTokens.map(t => t.priceChangePercent24h)))?.symbol}
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                          <div className="text-sm text-purple-700 dark:text-purple-300">Highest Volume</div>
                          <div className="font-bold text-purple-600">
                            {Math.max(...comparisonTokens.map(t => t.volume24h)).toFixed(2)} BTC
                          </div>
                          <div className="text-xs text-purple-500">
                            {comparisonTokens.find(t => t.volume24h === Math.max(...comparisonTokens.map(t => t.volume24h)))?.symbol}
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                          <div className="text-sm text-orange-700 dark:text-orange-300">Most Holders</div>
                          <div className="font-bold text-orange-600">
                            {Math.max(...comparisonTokens.map(t => t.holders)).toLocaleString()}
                          </div>
                          <div className="text-xs text-orange-500">
                            {comparisonTokens.find(t => t.holders === Math.max(...comparisonTokens.map(t => t.holders)))?.symbol}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="charts" className="mt-0">
                    <div className="space-y-6">
                      {/* Price Comparison */}
                      <div>
                        <h4 className="font-semibold mb-3">Price Comparison</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[{ name: 'Price (×100k)', ...comparisonTokens.reduce((acc, token) => ({ ...acc, [token.symbol]: token.price * 100000 }), {}) }]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {comparisonTokens.map((token, index) => (
                              <Bar 
                                key={token.id}
                                dataKey={token.symbol} 
                                fill={`hsl(${index * 360 / comparisonTokens.length}, 70%, 50%)`}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Volume Comparison */}
                      <div>
                        <h4 className="font-semibold mb-3">Volume Comparison</h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[{ name: 'Volume (BTC)', ...comparisonTokens.reduce((acc, token) => ({ ...acc, [token.symbol]: token.volume24h }), {}) }]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {comparisonTokens.map((token, index) => (
                              <Bar 
                                key={token.id}
                                dataKey={token.symbol} 
                                fill={`hsl(${index * 360 / comparisonTokens.length}, 70%, 60%)`}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="mt-0">
                    <div className="space-y-6">
                      {COMPARISON_METRICS.map((metric) => (
                        <div key={metric.key} className="space-y-2">
                          <h4 className="font-semibold">{metric.name}</h4>
                          <div className="space-y-2">
                            {comparisonTokens.map((token) => {
                              const value = token[metric.key] as any;
                              const maxValue = Math.max(...comparisonTokens.map(t => t[metric.key] as number));
                              const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                              
                              return (
                                <div key={token.id} className="flex items-center gap-3">
                                  <div className="w-16 text-sm font-medium">{token.symbol}</div>
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full transition-all duration-300"
                                      style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: metric.color
                                      }}
                                    />
                                  </div>
                                  <div className="w-24 text-right text-sm">
                                    {metric.format(value)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="radar" className="mt-0">
                    <div className="text-center">
                      <h4 className="font-semibold mb-6">Multi-Metric Radar Comparison</h4>
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={radarData[0] ? Object.keys(radarData[0]).filter(key => key !== 'token').map(key => {
                          const dataPoint: any = { metric: key };
                          radarData.forEach(item => {
                            dataPoint[item.token] = item[key as keyof typeof item];
                          });
                          return dataPoint;
                        }) : []}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="metric" />
                          <PolarRadiusAxis domain={[0, 100]} tick={false} />
                          {comparisonTokens.map((token, index) => (
                            <Radar
                              key={token.id}
                              name={token.symbol}
                              dataKey={token.symbol}
                              stroke={`hsl(${index * 360 / comparisonTokens.length}, 70%, 50%)`}
                              fill={`hsl(${index * 360 / comparisonTokens.length}, 70%, 50%)`}
                              fillOpacity={0.1}
                              strokeWidth={2}
                            />
                          ))}
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                      <div className="text-sm text-gray-500 mt-4">
                        All metrics normalized to 0-100 scale for comparison
                      </div>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default RuneComparison;