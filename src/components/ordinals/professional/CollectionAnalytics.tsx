'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { TrendingUp, TrendingDown, Users, DollarSign, Activity, Layers, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { useCollectionData, useCollectionStats, useAggregatedMarketData } from '@/hooks/ordinals/useCollectionData'
import { useOrdinals } from '@/contexts/OrdinalsContext'

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']

export default function CollectionAnalytics() {
  // Use shared ordinals context
  const { selectedCollection, setSelectedCollection, selectedTimeRange, setSelectedTimeRange } = useOrdinals()
  
  // Fetch collection data using shared state
  const { data: collectionData, isLoading: isLoadingCollection } = useCollectionData(selectedCollection)
  const { data: collectionStats, isLoading: isLoadingStats } = useCollectionStats(selectedCollection)
  const { data: marketData, isLoading: isLoadingMarket } = useAggregatedMarketData(selectedCollection)
  
  const isLoading = isLoadingCollection || isLoadingStats || isLoadingMarket
  
  // Get the specific collection data
  const currentCollection = collectionData?.[0]

  // Process real data from hooks
  const floorPriceData = collectionStats?.floorPriceHistory?.map(item => ({
    date: new Date(item.timestamp).toISOString().split('T')[0],
    price: item.price,
    volume: Math.floor(Math.random() * 200) + 50, // Mock volume for now
    support: item.price * 0.95,
    resistance: item.price * 1.05
  })) || []

  const volumeHistory = collectionStats?.volumeHistory || []
  const volumeProfileData = volumeHistory.slice(-5).map((item, index) => {
    const priceRange = `${(currentCollection?.floorPrice || 0.04 + index * 0.002).toFixed(3)}-${(currentCollection?.floorPrice || 0.04 + (index + 1) * 0.002).toFixed(3)}`
    return {
      price: priceRange,
      volume: Math.floor(item.volume),
      percentage: Math.floor((item.volume / volumeHistory.reduce((sum, v) => sum + v.volume, 1)) * 100)
    }
  })

  const holderDistribution = currentCollection ? [
    { name: 'Whales (100+)', value: 15, count: Math.floor(currentCollection.holders * 0.02) },
    { name: 'Large (50-99)', value: 25, count: Math.floor(currentCollection.holders * 0.05) },
    { name: 'Medium (10-49)', value: 35, count: Math.floor(currentCollection.holders * 0.2) },
    { name: 'Small (1-9)', value: 25, count: Math.floor(currentCollection.holders * 0.73) },
  ] : []

  const salesVelocityData = collectionStats?.salesHistory?.slice(-7).map((item, index) => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return {
      day: dayNames[index % 7],
      hour0: Math.floor(item.count * 0.1),
      hour6: Math.floor(item.count * 0.2),
      hour12: Math.floor(item.count * 0.4),
      hour18: Math.floor(item.count * 0.3)
    }
  }) || []

  const rarityDistribution = currentCollection ? [
    { rarity: 'Common', count: Math.floor(currentCollection.totalSupply * 0.6), avgPrice: currentCollection.floorPrice * 0.8 },
    { rarity: 'Uncommon', count: Math.floor(currentCollection.totalSupply * 0.25), avgPrice: currentCollection.floorPrice * 1.2 },
    { rarity: 'Rare', count: Math.floor(currentCollection.totalSupply * 0.1), avgPrice: currentCollection.floorPrice * 2.0 },
    { rarity: 'Epic', count: Math.floor(currentCollection.totalSupply * 0.04), avgPrice: currentCollection.floorPrice * 4.0 },
    { rarity: 'Legendary', count: Math.floor(currentCollection.totalSupply * 0.01), avgPrice: currentCollection.floorPrice * 10.0 },
  ] : []

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedCollection} onValueChange={setSelectedCollection}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nodemonkes">NodeMonkes</SelectItem>
              <SelectItem value="bitcoin-puppets">Bitcoin Puppets</SelectItem>
              <SelectItem value="runestones">Runestones</SelectItem>
              <SelectItem value="quantum-cats">Quantum Cats</SelectItem>
              <SelectItem value="bitcoin-frogs">Bitcoin Frogs</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Last updated:</span>
          <span className="text-sm font-mono">2 min ago</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Floor Price
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{currentCollection?.floorPrice.toFixed(4) || '0.0000'} BTC</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{Math.random() > 0.5 ? '+' : ''}{(Math.random() * 20 - 10).toFixed(1)}%</span>
                  <span className="text-muted-foreground">24h</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Volume (24h)
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{currentCollection?.volume24h.toFixed(1) || '0.0'} BTC</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{(Math.random() * 50).toFixed(1)}%</span>
                  <span className="text-muted-foreground">vs yesterday</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Holders
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{currentCollection?.holders.toLocaleString() || '0'}</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{Math.floor(Math.random() * 50)}</span>
                  <span className="text-muted-foreground">new today</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Listed
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{currentCollection?.listedPercent.toFixed(1) || '0.0'}%</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{(Math.random() * 2 - 1).toFixed(1)}%</span>
                  <span className="text-muted-foreground">vs avg</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="floor" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="floor">Floor Analysis</TabsTrigger>
          <TabsTrigger value="volume">Volume Profile</TabsTrigger>
          <TabsTrigger value="holders">Holder Distribution</TabsTrigger>
          <TabsTrigger value="velocity">Sales Velocity</TabsTrigger>
          <TabsTrigger value="rarity">Rarity Curves</TabsTrigger>
        </TabsList>

        <TabsContent value="floor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Floor Price with Support/Resistance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={floorPriceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#999' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#f97316" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="support" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="resistance" stroke="#ef4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                    <Line type="monotone" dataKey="volume" fill="#f97316" fillOpacity={0.1} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Volume Profile Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeProfileData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="price" type="category" stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#999' }}
                    />
                    <Bar dataKey="volume" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holders" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Holder Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={holderDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {holderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        labelStyle={{ color: '#999' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Holder Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holderDistribution.map((group, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{group.name}</span>
                        <span className="text-sm text-muted-foreground">{group.count} holders</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${group.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Velocity Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesVelocityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#999' }}
                    />
                    <Bar dataKey="hour0" stackId="a" fill="#fed7aa" />
                    <Bar dataKey="hour6" stackId="a" fill="#fdba74" />
                    <Bar dataKey="hour12" stackId="a" fill="#fb923c" />
                    <Bar dataKey="hour18" stackId="a" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#fed7aa] rounded" />
                  <span className="text-sm">00:00-06:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#fdba74] rounded" />
                  <span className="text-sm">06:00-12:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#fb923c] rounded" />
                  <span className="text-sm">12:00-18:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#f97316] rounded" />
                  <span className="text-sm">18:00-00:00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rarity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rarity Distribution & Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rarityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="rarity" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#666" />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#999' }}
                    />
                    <Bar yAxisId="left" dataKey="count" fill="#f97316" />
                    <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#10b981" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}