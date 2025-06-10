'use client';

import { useState, useEffect } from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';
import { RunesTradingTerminal } from '@/components/runes/professional/RunesTradingTerminal';
import { RunesAnalytics } from '@/components/runes/professional/RunesAnalytics';
import { MintingCalculator } from '@/components/runes/professional/MintingCalculator';
import { LiquidityAnalysis } from '@/components/runes/professional/LiquidityAnalysis';
import { RunesPortfolio } from '@/components/runes/professional/RunesPortfolio';
import { RunesPriceMatrix } from '@/components/runes/widgets/RunesPriceMatrix';
import { MintingActivity } from '@/components/runes/widgets/MintingActivity';
import { TopRunesMovers } from '@/components/runes/widgets/TopRunesMovers';
import { RunesHeatmap } from '@/components/runes/widgets/RunesHeatmap';
import { MarketCapRanking } from '@/components/runes/widgets/MarketCapRanking';
import { RunesSystemV2 } from '@/components/runes/RunesSystemV2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { NoSSRWrapper } from '@/components/ui/NoSSRWrapper';
import { MintPlatformGrid, MintPlatform } from '@/components/ui/MintPlatform';
import { bitcoinEcosystemService, type BitcoinEcosystemStats, type RuneData } from '@/services/BitcoinEcosystemService';
import { Activity, Calculator, BarChart3, Wallet, TrendingUp, Droplets, Zap, Layers, DollarSign, Users } from 'lucide-react';

export default function RunesPage() {
  const [ecosystemStats, setEcosystemStats] = useState<BitcoinEcosystemStats | null>(null);
  const [runesData, setRunesData] = useState<RuneData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadRunesData = async () => {
      try {
        setIsLoading(true);
        console.log('📊 Loading Runes ecosystem data...');
        
        const [stats, runes] = await Promise.all([
          bitcoinEcosystemService.getEcosystemStats(),
          bitcoinEcosystemService.getRunesData()
        ]);
        
        setEcosystemStats(stats);
        setRunesData(runes);
        
        console.log('✅ Loaded Runes data:', { stats, runesCount: runes.length });
      } catch (error) {
        console.error('❌ Error loading Runes data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRunesData();
  }, []);
  
  const topRunes = runesData.slice(0, 5);
  const totalMarketCap = runesData.reduce((sum, rune) => sum + rune.marketCap, 0);
  const avgChange24h = runesData.length > 0 ? runesData.reduce((sum, rune) => sum + rune.change24h, 0) / runesData.length : 0;
  
  return (
    <TopNavLayout>
      <div className="bg-gradient-to-b from-background to-background/95">
        {/* Header Section */}
        <div className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Runes Professional Trading
                </h1>
                <p className="text-muted-foreground mt-1">Advanced analytics and trading tools for serious Runes traders</p>
              </div>
              <div className="flex items-center gap-4">
                {isLoading ? (
                  <div className="flex gap-4">
                    <div className="animate-pulse bg-gray-700 rounded h-10 w-32"></div>
                    <div className="animate-pulse bg-gray-700 rounded h-10 w-32"></div>
                  </div>
                ) : (
                  <>
                    <Card className="px-3 py-2 bg-green-500/10 border-green-500/20">
                      <span className="text-green-500 text-sm font-medium">
                        24h Volume: ${(ecosystemStats?.runesVolume24h || 0).toLocaleString()}
                      </span>
                    </Card>
                    <Card className="px-3 py-2 bg-blue-500/10 border-blue-500/20">
                      <span className="text-blue-500 text-sm font-medium">
                        Total Runes: {ecosystemStats?.totalRunes.toLocaleString() || 'Loading...'}
                      </span>
                    </Card>
                    <Card className="px-3 py-2 bg-purple-500/10 border-purple-500/20">
                      <span className="text-purple-500 text-sm font-medium">
                        Market Cap: ${totalMarketCap > 0 ? (totalMarketCap / 1000000).toFixed(1) : '0'}M
                      </span>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Market Overview */}
        <div className="container mx-auto px-4 py-6">
          {/* Live Market Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Top Rune Price</span>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold">${topRunes[0]?.price.toFixed(4) || 'Loading...'}</p>
                  <span className="text-xs text-gray-400">
                    Top rune price
                  </span>
                </>
              )}
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Holders</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold">{runesData.length > 0 ? runesData.reduce((sum, rune) => sum + rune.holders, 0).toLocaleString() : 'Loading...'}</p>
                  <span className="text-xs text-blue-500">Across {runesData.length} runes</span>
                </>
              )}
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Minted Today</span>
                <Zap className="h-4 w-4 text-green-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold">{runesData.length > 0 ? runesData.reduce((sum, rune) => sum + rune.mints, 0).toLocaleString() : 'Loading...'}</p>
                  <span className="text-xs text-gray-400">Total mints</span>
                </>
              )}
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Supply</span>
                <Layers className="h-4 w-4 text-purple-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold">{runesData.length > 0 ? ((runesData.reduce((sum, rune) => sum + rune.supply, 0) / runesData.length) / 1000000).toFixed(1) : '0'}M</p>
                  <span className="text-xs text-purple-500">Avg supply</span>
                </>
              )}
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <NoSSRWrapper fallback={
              <Card className="p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </Card>
            }>
              <RunesPriceMatrix />
            </NoSSRWrapper>
            
            <NoSSRWrapper fallback={
              <Card className="p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </Card>
            }>
              <TopRunesMovers />
            </NoSSRWrapper>
            
            <NoSSRWrapper fallback={
              <Card className="p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </Card>
            }>
              <MintingActivity />
            </NoSSRWrapper>
          </div>

          {/* Main Trading Interface */}
          <Tabs defaultValue="terminal" className="space-y-6">
            <TabsList className="w-full justify-start bg-background/50 backdrop-blur-sm">
              <TabsTrigger value="terminal" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trading Terminal
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="liquidity" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Liquidity
              </TabsTrigger>
              <TabsTrigger value="minting" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Mint Platforms
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Portfolio
              </TabsTrigger>
              <TabsTrigger value="heatmap" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Market Heatmap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="terminal" className="mt-6">
              <NoSSRWrapper fallback={
                <Card className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-64 bg-gray-700 rounded"></div>
                    <div className="h-64 bg-gray-700 rounded"></div>
                  </div>
                </Card>
              }>
                <RunesTradingTerminal />
              </NoSSRWrapper>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <NoSSRWrapper fallback={
                <Card className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-48 bg-gray-700 rounded"></div>
                    <div className="h-48 bg-gray-700 rounded"></div>
                    <div className="h-48 bg-gray-700 rounded"></div>
                  </div>
                </Card>
              }>
                <RunesAnalytics />
              </NoSSRWrapper>
            </TabsContent>

            <TabsContent value="liquidity" className="mt-6">
              <NoSSRWrapper fallback={
                <Card className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-80 bg-gray-700 rounded"></div>
                </Card>
              }>
                <LiquidityAnalysis />
              </NoSSRWrapper>
            </TabsContent>

            <TabsContent value="minting" className="mt-6">
              <NoSSRWrapper fallback={
                <Card className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-96 bg-gray-700 rounded"></div>
                    <div className="h-96 bg-gray-700 rounded"></div>
                  </div>
                </Card>
              }>
                <div className="space-y-6">
                  <Card className="bg-gray-900 border-gray-700 p-6">
                    <MintPlatformGrid 
                      tokenType="rune" 
                      title="Professional Rune Minting Platforms"
                    />
                  </Card>
                  
                  <Card className="bg-gray-900 border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 font-mono">Top Performing Runes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topRunes.slice(0, 6).map((rune) => (
                        <div key={rune.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-orange-500 font-mono text-sm">{rune.name}</h4>
                            <span className="text-xs text-gray-400">#{rune.id}</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Price:</span>
                              <span className="text-white font-mono">${rune.price.toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Supply:</span>
                              <span className="text-white">{(rune.supply / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Progress:</span>
                              <span className="text-green-400">{rune.mintProgress.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-700">
                            <div className="grid grid-cols-2 gap-2">
                              <MintPlatform platform="unisat" tokenSymbol={rune.symbol} tokenType="rune" size="sm" />
                              <MintPlatform platform="ordswap" tokenSymbol={rune.symbol} tokenType="rune" size="sm" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </NoSSRWrapper>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-6">
              <NoSSRWrapper fallback={
                <Card className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="space-y-4">
                    {Array.from({length: 6}).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </Card>
              }>
                <RunesPortfolio />
              </NoSSRWrapper>
            </TabsContent>

            <TabsContent value="heatmap" className="mt-6">
              <NoSSRWrapper fallback={
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-700 rounded"></div>
                  </Card>
                  <Card className="p-6 animate-pulse">
                    <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                      {Array.from({length: 8}).map((_, i) => (
                        <div key={i} className="h-8 bg-gray-700 rounded"></div>
                      ))}
                    </div>
                  </Card>
                </div>
              }>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RunesHeatmap />
                  <MarketCapRanking />
                </div>
              </NoSSRWrapper>
            </TabsContent>
          </Tabs>
          
          {/* Enhanced Runes Explorer */}
          <div className="mt-8">
            <NoSSRWrapper fallback={
              <Card className="p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </Card>
            }>
              <RunesSystemV2 />
            </NoSSRWrapper>
          </div>
        </div>
      </div>
    </TopNavLayout>
  );
}