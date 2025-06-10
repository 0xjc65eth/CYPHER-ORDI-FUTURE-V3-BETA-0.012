'use client'

import { useState, useEffect } from 'react'
import { TopNavLayout } from '@/components/layout/TopNavLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NoSSRWrapper } from '@/components/ui/NoSSRWrapper'
import { bitcoinEcosystemService, type RareSatData } from '@/services/BitcoinEcosystemService'
import { 
  Crown, 
  Gem, 
  Star, 
  Search, 
  TrendingUp, 
  Activity, 
  Users, 
  DollarSign,
  Bitcoin,
  Layers,
  Clock,
  Filter,
  Eye,
  ExternalLink,
  Sparkles,
  Zap,
  Shield,
  Award
} from 'lucide-react'

export default function RareSatsPage() {
  const [rareSats, setRareSats] = useState<RareSatData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    const loadRareSatsData = async () => {
      try {
        setLoading(true)
        console.log('💎 Loading Rare Sats data...')
        
        const rareSatsData = await bitcoinEcosystemService.getRareSatsData()
        setRareSats(rareSatsData)
        
        console.log('✅ Loaded', rareSatsData.length, 'rare sats')
      } catch (error) {
        console.error('❌ Error loading rare sats data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadRareSatsData()
  }, [])

  const filteredSats = rareSats.filter(sat => {
    const matchesSearch = sat.satNumber.toString().includes(searchQuery) ||
                         sat.rarityType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRarity = selectedRarity === 'all' || sat.rarityType === selectedRarity
    return matchesSearch && matchesRarity
  })

  const rarityStats = rareSats.reduce((acc, sat) => {
    acc[sat.rarityType] = (acc[sat.rarityType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalValue = rareSats.reduce((sum, sat) => sum + sat.estimatedValue, 0)
  const avgValue = rareSats.length > 0 ? totalValue / rareSats.length : 0

  const getRarityColor = (rarity: RareSatData['rarityType']) => {
    const colors = {
      'common': 'text-gray-400 bg-gray-400/10',
      'uncommon': 'text-green-400 bg-green-400/10',
      'rare': 'text-blue-400 bg-blue-400/10',
      'epic': 'text-purple-400 bg-purple-400/10',
      'legendary': 'text-orange-400 bg-orange-400/10',
      'mythic': 'text-red-400 bg-red-400/10'
    }
    return colors[rarity] || 'text-gray-400 bg-gray-400/10'
  }

  const getRarityIcon = (rarity: RareSatData['rarityType']) => {
    const icons = {
      'common': Star,
      'uncommon': Gem,
      'rare': Crown,
      'epic': Award,
      'legendary': Shield,
      'mythic': Sparkles
    }
    const Icon = icons[rarity] || Star
    return <Icon className="w-4 h-4" />
  }

  const formatSatNumber = (satNumber: number) => {
    return satNumber.toLocaleString()
  }

  return (
    <TopNavLayout>
      <div className="space-y-6">
        {/* Professional Header */}
        <div className="border-b border-gray-700 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Rare Sats Intelligence Hub
              </h1>
              <p className="text-gray-400 mt-1">
                Professional-grade analytics and marketplace for rare Bitcoin satoshis
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by sat number or rarity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600"
                />
              </div>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="bg-gray-900 text-white text-sm rounded px-3 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none cursor-pointer hover:bg-gray-800"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
                <option value="mythic">Mythic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Rare Sats</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-16 mt-1"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">
                    {rareSats.length.toLocaleString()}
                  </p>
                )}
              </div>
              <Crown className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-20 mt-1"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">
                    ₿{totalValue.toFixed(2)}
                  </p>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Value</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-16 mt-1"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">
                    ₿{avgValue.toFixed(4)}
                  </p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Mythic Sats</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-12 mt-1"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">
                    {rarityStats.mythic || 0}
                  </p>
                )}
              </div>
              <Sparkles className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Legendary</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-12 mt-1"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">
                    {rarityStats.legendary || 0}
                  </p>
                )}
              </div>
              <Shield className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Epic Sats</p>
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-700 rounded w-12 mt-1"></div>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">
                    {rarityStats.epic || 0}
                  </p>
                )}
              </div>
              <Award className="w-8 h-8 text-indigo-500" />
            </div>
          </Card>
        </div>

        {/* Professional Tabs Interface */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="rarity" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Rarity Guide
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <NoSSRWrapper fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="space-y-3">
                    {Array.from({length: 6}).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-700 rounded"></div>
                    ))}
                  </div>
                </Card>
                <Card className="p-6 animate-pulse">
                  <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-700 rounded"></div>
                </Card>
              </div>
            }>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Rarity Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(rarityStats).map(([rarity, count]) => (
                      <div key={rarity} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div className="flex items-center gap-3">
                          <Badge className={getRarityColor(rarity as RareSatData['rarityType'])}>
                            {getRarityIcon(rarity as RareSatData['rarityType'])}
                            <span className="ml-1 capitalize">{rarity}</span>
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{count.toLocaleString()}</div>
                          <div className="text-gray-400 text-xs">
                            {((count / rareSats.length) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-gray-900 border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-400" />
                    Most Valuable Sats
                  </h3>
                  <div className="space-y-3">
                    {rareSats
                      .sort((a, b) => b.estimatedValue - a.estimatedValue)
                      .slice(0, 8)
                      .map((sat, index) => (
                        <div key={sat.satNumber} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                            <div>
                              <div className="text-white font-mono text-sm">
                                Sat #{formatSatNumber(sat.satNumber)}
                              </div>
                              <Badge className={getRarityColor(sat.rarityType)} size="sm">
                                {sat.rarityType}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">₿{sat.estimatedValue.toFixed(4)}</div>
                            <div className="text-gray-400 text-xs">{sat.rarity}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              </div>
            </NoSSRWrapper>
          </TabsContent>

          <TabsContent value="explorer" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    Rare Sats Explorer ({filteredSats.length.toLocaleString()})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="pb-3 font-medium">#</th>
                        <th className="pb-3 font-medium">Sat Number</th>
                        <th className="pb-3 font-medium">Rarity</th>
                        <th className="pb-3 font-medium">Block</th>
                        <th className="pb-3 font-medium">Value</th>
                        <th className="pb-3 font-medium">Cycle</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSats.slice(0, 50).map((sat, index) => (
                        <tr key={sat.satNumber} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                          <td className="py-4 text-gray-400 font-mono">{index + 1}</td>
                          <td className="py-4">
                            <div className="font-mono text-white">{formatSatNumber(sat.satNumber)}</div>
                          </td>
                          <td className="py-4">
                            <Badge className={getRarityColor(sat.rarityType)}>
                              {getRarityIcon(sat.rarityType)}
                              <span className="ml-1 capitalize">{sat.rarityType}</span>
                            </Badge>
                          </td>
                          <td className="py-4">
                            <div className="text-white">{sat.blockHeight.toLocaleString()}</div>
                            <div className="text-gray-400 text-xs">{new Date(sat.blockTime).toLocaleDateString()}</div>
                          </td>
                          <td className="py-4">
                            <div className="font-mono text-white">₿{sat.estimatedValue.toFixed(6)}</div>
                          </td>
                          <td className="py-4">
                            <div className="text-white">{sat.cycle}</div>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="border-gray-600">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rarity" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Rare Satoshi Rarity Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { type: 'common' as const, desc: 'First sat of each block', freq: 'Every ~10 minutes' },
                  { type: 'uncommon' as const, desc: 'First sat of each difficulty adjustment', freq: 'Every ~2 weeks' },
                  { type: 'rare' as const, desc: 'First sat of each halving epoch', freq: 'Every ~4 years' },
                  { type: 'epic' as const, desc: 'First sat of each cycle', freq: 'Every ~8 years' },
                  { type: 'legendary' as const, desc: 'First sat of each halving', freq: 'Every ~4 years' },
                  { type: 'mythic' as const, desc: 'Genesis block sat', freq: 'Only one exists' }
                ].map((rarity) => (
                  <div key={rarity.type} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getRarityColor(rarity.type)}>
                        {getRarityIcon(rarity.type)}
                        <span className="ml-1 capitalize">{rarity.type}</span>
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{rarity.desc}</p>
                    <p className="text-gray-400 text-xs">Frequency: {rarity.freq}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Count: {rarityStats[rarity.type] || 0}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Rare Sats Marketplace</h3>
              <div className="text-gray-400">
                Professional marketplace integration coming soon...
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Advanced Analytics</h3>
              <div className="text-gray-400">
                Advanced analytics dashboard coming soon...
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TopNavLayout>
  )
}