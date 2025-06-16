'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  BarChart3,
  Activity,
  Star,
  RefreshCw,
  Settings,
  Download,
  Maximize2,
  Eye,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamicRunesChart } from '@/components/charts/DynamicRunesChart';
import { RuneComparison } from './RuneComparison';
import { RuneSelector } from './RuneSelector';
import { useRunesTokenPrices } from '@/hooks/useRunesTokenPrices';

interface RunesAnalyticsDashboardProps {
  className?: string;
  defaultTab?: 'charts' | 'comparison' | 'overview';
  showAdvancedFeatures?: boolean;
}

export const RunesAnalyticsDashboard: React.FC<RunesAnalyticsDashboardProps> = ({
  className = '',
  defaultTab = 'overview',
  showAdvancedFeatures = true
}) => {
  // State
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedToken, setSelectedToken] = useState('all');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('runes-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    const savedWatchlist = localStorage.getItem('runes-watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('runes-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('runes-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Hooks
  const {
    tokens,
    metrics,
    loading,
    error,
    refetch
  } = useRunesTokenPrices('all', '7d');

  // Auto-refresh
  useEffect(() => {
    if (!isAutoRefresh) return;
    
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, refetch]);

  const toggleFavorite = (tokenId: string) => {
    setFavorites(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  const toggleWatchlist = (tokenId: string) => {
    setWatchlist(prev => 
      prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId)
        : [...prev, tokenId]
    );
  };

  // Get favorite tokens
  const favoriteTokens = tokens.filter(token => favorites.includes(token.id));
  
  // Get watchlist tokens
  const watchlistTokens = tokens.filter(token => watchlist.includes(token.id));

  // Get trending tokens (top gainers)
  const trendingTokens = [...tokens]
    .sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h)
    .slice(0, 5);

  // Get most active tokens (by volume)
  const mostActiveTokens = [...tokens]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 5);

  // Get new tokens (recently minted)
  const newTokens = [...tokens]
    .filter(token => token.mintingActive)
    .sort((a, b) => b.mintProgress - a.mintProgress)
    .slice(0, 5);

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <Card>
          <CardHeader>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-48 rounded" />
          </CardHeader>
          <CardContent>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-md" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="py-8">
            <div className="text-center">
              <Zap className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="text-red-500 mb-2">Failed to Load Runes Data</div>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full space-y-6 ${className}`}
    >
      {/* Header with Quick Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Runes Analytics Dashboard
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {tokens.length} tokens
              </Badge>
              {metrics && (
                <>
                  <Badge variant="outline">
                    {metrics.totalVolume24h.toFixed(2)} BTC volume
                  </Badge>
                  <Badge variant={metrics.marketCapGrowth24h >= 0 ? 'default' : 'destructive'}>
                    {metrics.marketCapGrowth24h >= 0 ? '+' : ''}{metrics.marketCapGrowth24h.toFixed(2)}%
                  </Badge>
                </>
              )}
              <Button
                variant={isAutoRefresh ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                title="Toggle Auto Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick Market Stats */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="text-xs text-blue-700 dark:text-blue-300">Total Market Cap</div>
                <div className="text-lg font-bold text-blue-600">
                  {metrics.totalMarketCap.toFixed(0)} BTC
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-xs text-green-700 dark:text-green-300">24h Volume</div>
                <div className="text-lg font-bold text-green-600">
                  {metrics.totalVolume24h.toFixed(2)} BTC
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="text-xs text-purple-700 dark:text-purple-300">Active Mints</div>
                <div className="text-lg font-bold text-purple-600">
                  {metrics.activeMints}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                <div className="text-xs text-orange-700 dark:text-orange-300">Total Holders</div>
                <div className="text-lg font-bold text-orange-600">
                  {metrics.totalHolders.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-700 dark:text-gray-300">Avg Price</div>
                <div className="text-lg font-bold text-gray-600">
                  {metrics.averagePrice.toFixed(6)} BTC
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Comparison
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Top Performers */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Top Gainers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {trendingTokens.map((token, index) => (
                          <div key={token.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                              <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-xs text-gray-500">{token.price.toFixed(8)} BTC</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-600 font-medium">
                                +{token.priceChangePercent24h.toFixed(2)}%
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(token.id)}
                                className="p-1 h-auto"
                              >
                                <Star className={`w-3 h-3 ${favorites.includes(token.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Most Active */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Most Active
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mostActiveTokens.map((token, index) => (
                          <div key={token.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                              <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-xs text-gray-500">{token.holders.toLocaleString()} holders</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-blue-600">
                                {token.volume24h.toFixed(2)} BTC
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleWatchlist(token.id)}
                                className="p-1 h-auto"
                              >
                                <Eye className={`w-3 h-3 ${watchlist.includes(token.id) ? 'text-blue-500' : 'text-gray-400'}`} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Favorites & Watchlist */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Your Lists
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-2">Favorites ({favorites.length})</div>
                          {favoriteTokens.length > 0 ? (
                            <div className="space-y-2">
                              {favoriteTokens.slice(0, 3).map((token) => (
                                <div key={token.id} className="flex items-center justify-between text-sm">
                                  <span>{token.symbol}</span>
                                  <span className={`${token.priceChangePercent24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {token.priceChangePercent24h >= 0 ? '+' : ''}{token.priceChangePercent24h.toFixed(2)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">No favorites yet</div>
                          )}
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-2">Watchlist ({watchlist.length})</div>
                          {watchlistTokens.length > 0 ? (
                            <div className="space-y-2">
                              {watchlistTokens.slice(0, 3).map((token) => (
                                <div key={token.id} className="flex items-center justify-between text-sm">
                                  <span>{token.symbol}</span>
                                  <span>{token.volume24h.toFixed(2)} BTC</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">No items in watchlist</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="charts" className="mt-0">
                <DynamicRunesChart
                  height={600}
                  allowFullscreen={true}
                  defaultToken={selectedToken}
                  showAdvancedTools={showAdvancedFeatures}
                />
              </TabsContent>

              <TabsContent value="comparison" className="mt-0">
                <RuneComparison
                  tokens={tokens}
                  maxComparisons={5}
                  defaultTokens={favorites.slice(0, 3)}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </motion.div>
  );
};

export default RunesAnalyticsDashboard;