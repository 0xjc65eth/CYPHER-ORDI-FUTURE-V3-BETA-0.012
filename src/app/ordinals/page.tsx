'use client'

import { useState, useEffect } from 'react'
import { TopNavLayout } from '@/components/layout/TopNavLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CollectionAnalytics from '@/components/ordinals/professional/CollectionAnalytics'
import InscriptionExplorer from '@/components/ordinals/professional/InscriptionExplorer'
import MarketDepth from '@/components/ordinals/professional/MarketDepth'
import RarityCalculator from '@/components/ordinals/professional/RarityCalculator'
import TraitAnalysis from '@/components/ordinals/professional/TraitAnalysis'
import { CollectionsTable } from '@/components/ordinals/tables/CollectionsTable'
import { InscriptionsTable } from '@/components/ordinals/tables/InscriptionsTable'
import { SalesHistoryTable } from '@/components/ordinals/tables/SalesHistoryTable'
import { OrdinalsSystemV2 } from '@/components/ordinals/OrdinalsSystemV2'
import { Input } from '@/components/ui/input'
import { NoSSRWrapper } from '@/components/ui/NoSSRWrapper'
import { bitcoinEcosystemService, type BitcoinEcosystemStats } from '@/services/BitcoinEcosystemService'
import { ordinalsService, type OrdinalsAnalytics } from '@/services/ordinals'
import { OrdinalsProvider } from '@/contexts/OrdinalsContext'
import { Search, Activity, TrendingUp, Layers, BarChart3, Sparkles, Bitcoin, Zap } from 'lucide-react'

export default function OrdinalsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('analytics')
  const [ecosystemStats, setEcosystemStats] = useState<BitcoinEcosystemStats | null>(null)
  const [ordinalsStats, setOrdinalsStats] = useState<OrdinalsAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        console.log('📊 Loading Ordinals ecosystem and analytics stats...')
        
        // Load both Bitcoin ecosystem and Ordinals analytics in parallel
        const [ecosystemData, ordinalsData] = await Promise.allSettled([
          bitcoinEcosystemService.getEcosystemStats(),
          ordinalsService.getOrdinalsStats()
        ])
        
        if (ecosystemData.status === 'fulfilled') {
          setEcosystemStats(ecosystemData.value)
          console.log('✅ Loaded ecosystem stats:', ecosystemData.value)
        }
        
        if (ordinalsData.status === 'fulfilled') {
          setOrdinalsStats(ordinalsData.value)
          console.log('✅ Loaded Ordinals analytics:', ordinalsData.value)
        }
      } catch (error) {
        console.error('❌ Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadStats()
  }, [])

  return (
    <TopNavLayout>
      <OrdinalsProvider>
        <div className="bg-background">
        {/* Professional Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Ordinals Intelligence Hub
              </h1>
              <p className="text-muted-foreground mt-1">
                Professional-grade analytics for Bitcoin Ordinals
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections, inscriptions, or paste Bitcoin address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 focus:border-orange-500"
                />
                {searchQuery && searchQuery.length > 10 && /^[13bc1tb1]/.test(searchQuery) && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 text-sm text-orange-400 flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Address detected - searching for Ordinals...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-time Key Metrics Bar */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            <div className="bg-muted/30 rounded-lg p-4 border bg-gradient-to-br from-orange-500/10 to-amber-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Inscriptions</span>
                <Bitcoin className="h-4 w-4 text-orange-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-20 mt-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16 mt-1"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold mt-1">{ordinalsStats?.total_inscriptions?.toLocaleString() || ecosystemStats?.totalInscriptions?.toLocaleString() || 'Loading...'}</p>
                  <span className="text-xs text-blue-500 flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Real-time data
                  </span>
                </>
              )}
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 border bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">24h Volume</span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-20 mt-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16 mt-1"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold mt-1">₿{ordinalsStats?.total_volume_24h.toFixed(1) || (ecosystemStats?.ordinalsVolume24h / 100000000 || 0).toFixed(1)}</p>
                  <span className="text-xs text-gray-400">24h volume</span>
                </>
              )}
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 border bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Collections</span>
                <Layers className="h-4 w-4 text-purple-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-20 mt-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16 mt-1"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold mt-1">{ordinalsStats?.total_collections.toLocaleString() || ecosystemStats?.totalOrdinals.toLocaleString() || 'Loading...'}</p>
                  <span className="text-xs text-muted-foreground">Active collections</span>
                </>
              )}
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 border bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Fee</span>
                <BarChart3 className="h-4 w-4 text-green-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-20 mt-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16 mt-1"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold mt-1">{Math.floor((ecosystemStats?.avgTransactionFee || 25000) / 1000)} sats/vB</p>
                  <span className="text-xs text-gray-400">Network fee</span>
                </>
              )}
            </div>
            
            <div className="bg-muted/30 rounded-lg p-4 border bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Block Height</span>
                <Zap className="h-4 w-4 text-yellow-500" />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-20 mt-1"></div>
                  <div className="h-3 bg-gray-700 rounded w-16 mt-1"></div>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold mt-1">{ecosystemStats?.blockHeight.toLocaleString() || 'Loading...'}</p>
                  <span className="text-xs text-blue-500 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live height
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl mx-auto">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Collections
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Market Depth
            </TabsTrigger>
            <TabsTrigger value="rarity" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Rarity
            </TabsTrigger>
            <TabsTrigger value="traits" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Traits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <NoSSRWrapper fallback={
              <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-32 bg-gray-700 rounded"></div>
                  <div className="h-32 bg-gray-700 rounded"></div>
                  <div className="h-32 bg-gray-700 rounded"></div>
                </div>
              </div>
            }>
              <CollectionAnalytics />
            </NoSSRWrapper>
          </TabsContent>

          <TabsContent value="explorer" className="space-y-6">
            <NoSSRWrapper fallback={
              <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            }>
              <InscriptionExplorer searchQuery={searchQuery} />
              {/* OrdinalsSystemV2 como fallback melhorado */}
              <div className="mt-8">
                <OrdinalsSystemV2 />
              </div>
            </NoSSRWrapper>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <NoSSRWrapper fallback={
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    {Array.from({length: 8}).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            }>
              <div className="grid grid-cols-1 gap-6">
                <CollectionsTable />
                <div className="grid grid-cols-2 gap-6">
                  <InscriptionsTable />
                  <SalesHistoryTable />
                </div>
              </div>
            </NoSSRWrapper>
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            <NoSSRWrapper fallback={
              <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-700 rounded"></div>
              </div>
            }>
              <MarketDepth />
            </NoSSRWrapper>
          </TabsContent>

          <TabsContent value="rarity" className="space-y-6">
            <NoSSRWrapper fallback={
              <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-48 bg-gray-700 rounded"></div>
                  <div className="h-48 bg-gray-700 rounded"></div>
                </div>
              </div>
            }>
              <RarityCalculator />
            </NoSSRWrapper>
          </TabsContent>

          <TabsContent value="traits" className="space-y-6">
            <NoSSRWrapper fallback={
              <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-80 bg-gray-700 rounded"></div>
              </div>
            }>
              <TraitAnalysis />
            </NoSSRWrapper>
          </TabsContent>
        </Tabs>
      </div>
      </div>
      </OrdinalsProvider>
    </TopNavLayout>
  )
}

