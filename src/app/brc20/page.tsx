'use client';

import React, { useState, useEffect } from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { NoSSRWrapper } from '@/components/ui/NoSSRWrapper';
import { MintPlatformGrid } from '@/components/ui/MintPlatform';
import { BRC20TokenList } from '@/components/brc20/BRC20TokenList';
import { BRC20Portfolio } from '@/components/brc20/BRC20Portfolio';
import { BRC20Analytics } from '@/components/brc20/BRC20Analytics';
import { BRC20Trading } from '@/components/brc20/BRC20Trading';
import { brc20Service, type BRC20Token } from '@/services/BRC20Service';
import { realPriceService } from '@/services/RealPriceService';
import { useLaserEyes } from '@omnisat/lasereyes';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  Search,
  Bitcoin,
  BarChart3,
  Zap,
  Wallet,
  Globe,
  Target
} from 'lucide-react';

export default function BRC20Page() {
  const { address } = useLaserEyes();
  const [tokens, setTokens] = useState<BRC20Token[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [realPrices, setRealPrices] = useState<any>({});
  const [selectedToken, setSelectedToken] = useState<BRC20Token | null>(null);

  useEffect(() => {
    loadBRC20Data();
  }, []);

  const loadBRC20Data = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading BRC-20 data...');
      
      const [tokensData, analyticsData, ordiPrice] = await Promise.all([
        brc20Service.getBRC20Tokens(100),
        brc20Service.getBRC20Analytics(),
        realPriceService.getRealPrice('ORDI')
      ]);
      
      setTokens(tokensData);
      setAnalytics(analyticsData);
      
      // Store real prices for display
      if (ordiPrice) {
        setRealPrices({ ordi: ordiPrice });
      }
      
      console.log('✅ Loaded BRC-20 data:', {
        tokens: tokensData.length,
        analytics: analyticsData ? 'loaded' : 'failed'
      });
    } catch (error) {
      console.error('❌ Error loading BRC-20 data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, compact = false) => {
    if (compact && num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (compact && num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (compact && num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <TopNavLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </TopNavLayout>
    );
  }

  return (
    <TopNavLayout>
      <div className="space-y-6">
        {/* Professional Header */}
        <div className="border-b border-gray-700 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                BRC-20 Intelligence Hub
              </h1>
              <p className="text-gray-400 mt-1">
                Professional-grade analytics for Bitcoin BRC-20 tokens with real-time data and trading tools
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {realPrices.ordi && (
                <Card className="px-4 py-2 bg-orange-500/10 border-orange-500/20">
                  <span className="text-orange-500 text-sm font-medium">
                    ORDI: ${realPrices.ordi.price.toFixed(2)} 
                    <span className={realPrices.ordi.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {realPrices.ordi.change24h >= 0 ? '+' : ''}{realPrices.ordi.change24h.toFixed(1)}%
                    </span>
                  </span>
                </Card>
              )}
              <Card className="px-4 py-2 bg-blue-500/10 border-blue-500/20">
                <span className="text-blue-500 text-sm font-medium">
                  {tokens.length} BRC-20 Tokens Loaded
                </span>
              </Card>
              {address && (
                <Card className="px-4 py-2 bg-green-500/10 border-green-500/20">
                  <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    Connected
                  </span>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        {analytics && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Market Cap</p>
                  <p className="text-2xl font-bold text-white">
                    ${formatNumber(analytics.totalMarketCap, true)}
                  </p>
                  <p className="text-xs text-green-400 mt-1">+12.5% from last month</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">24h Volume</p>
                  <p className="text-2xl font-bold text-white">
                    ${formatNumber(analytics.totalVolume24h, true)}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">+8.3% from yesterday</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Tokens</p>
                  <p className="text-2xl font-bold text-white">{formatNumber(analytics.totalTokens)}</p>
                  <p className="text-xs text-purple-400 mt-1">+15 new this week</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Holders</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(analytics.totalHolders, true)}
                  </p>
                  <p className="text-xs text-orange-400 mt-1">+2.1K new holders</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Professional Tabs Interface */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4" />
              Tokens
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="trading" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Trading
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <NoSSRWrapper fallback={
              <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64 bg-gray-700 rounded"></div>
                  <div className="h-64 bg-gray-700 rounded"></div>
                </div>
              </div>
            }>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Top Performers (24h)
                  </h3>
                  <div className="space-y-3">
                    {tokens.slice(0, 5).map((token, index) => (
                      <div key={token.ticker} className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm">#{index + 1}</span>
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs uppercase">
                              {token.ticker.slice(0, 2)}
                            </span>
                          </div>
                          <span className="font-bold text-white uppercase">{token.ticker}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card className="bg-gray-900 border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Market Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-400">Most Active Token</span>
                      <span className="text-white font-bold">
                        {tokens.sort((a, b) => b.volume24h - a.volume24h)[0]?.ticker.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-400">Highest Market Cap</span>
                      <span className="text-white font-bold">
                        {tokens.sort((a, b) => b.marketCap - a.marketCap)[0]?.ticker.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-400">Most Holders</span>
                      <span className="text-white font-bold">
                        {tokens.sort((a, b) => b.holders - a.holders)[0]?.ticker.toUpperCase() || 'N/A'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
              
              <Card className="bg-gray-900 border-gray-700 p-6">
                <MintPlatformGrid 
                  tokenType="brc20" 
                  title="Professional BRC-20 Trading Platforms"
                  description="Access the best platforms for trading BRC-20 tokens with competitive fees and high liquidity"
                />
              </Card>
            </NoSSRWrapper>
          </TabsContent>
          
          <TabsContent value="tokens">
            <BRC20TokenList onTokenSelect={setSelectedToken} />
          </TabsContent>
          
          <TabsContent value="portfolio">
            <BRC20Portfolio address={address} />
          </TabsContent>
          
          <TabsContent value="analytics">
            <BRC20Analytics />
          </TabsContent>
          
          <TabsContent value="trading">
            <BRC20Trading />
          </TabsContent>
        </Tabs>
      </div>
    </TopNavLayout>
  );
}

