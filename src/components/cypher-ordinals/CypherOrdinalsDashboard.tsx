'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Layers,
  Hash,
  Bitcoin,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Wallet,
  Zap
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface CypherOrdinalsDashboardProps {
  searchQuery: string
}

export function CypherOrdinalsDashboard({ searchQuery }: CypherOrdinalsDashboardProps) {
  const [timeRange, setTimeRange] = useState('24h')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Mock data para demonstração
  const inscriptionsData = [
    { time: '00:00', inscriptions: 1200, volume: 2.4 },
    { time: '04:00', inscriptions: 1350, volume: 2.8 },
    { time: '08:00', inscriptions: 1180, volume: 2.1 },
    { time: '12:00', inscriptions: 1450, volume: 3.2 },
    { time: '16:00', inscriptions: 1320, volume: 2.9 },
    { time: '20:00', inscriptions: 1280, volume: 2.6 },
  ]

  const topCollections = [
    { 
      name: 'NodeMonkes', 
      floorPrice: 0.024, 
      volume24h: 12.4, 
      change: 15.3,
      holders: 2847,
      items: 10000
    },
    { 
      name: 'Bitcoin Puppets', 
      floorPrice: 0.018, 
      volume24h: 8.7, 
      change: -5.2,
      holders: 1923,
      items: 10000
    },
    { 
      name: 'Ordinal Maxi Biz', 
      floorPrice: 0.035, 
      volume24h: 15.2, 
      change: 22.8,
      holders: 3456,
      items: 5000
    },
    { 
      name: 'Runestone', 
      floorPrice: 0.012, 
      volume24h: 6.3, 
      change: 8.1,
      holders: 8734,
      items: 112384
    },
  ]

  const topBRC20 = [
    { symbol: 'ORDI', price: 45.67, volume24h: 89234567, change: 12.4, marketCap: 956789123 },
    { symbol: 'SATS', price: 0.000234, volume24h: 45678901, change: -3.2, marketCap: 234567890 },
    { symbol: 'RATS', price: 0.00156, volume24h: 23456789, change: 18.7, marketCap: 156789012 },
    { symbol: 'MEME', price: 0.0892, volume24h: 34567890, change: -8.5, marketCap: 89123456 },
  ]

  const recentTransactions = [
    {
      type: 'inscription',
      hash: 'bc1q...xyz123',
      amount: '0.024 BTC',
      collection: 'NodeMonkes #4527',
      time: '2 min',
      from: 'bc1q...abc456',
      to: 'bc1q...def789'
    },
    {
      type: 'brc20',
      hash: 'bc1q...uvw456',
      amount: '50,000 ORDI',
      collection: 'ORDI Transfer',
      time: '5 min',
      from: 'bc1q...ghi012',
      to: 'bc1q...jkl345'
    },
    {
      type: 'inscription',
      hash: 'bc1q...rst789',
      amount: '0.018 BTC',
      collection: 'Bitcoin Puppets #2314',
      time: '8 min',
      from: 'bc1q...mno678',
      to: 'bc1q...pqr901'
    },
  ]

  const whaleActivity = [
    {
      whale: 'bc1q...whale1',
      action: 'Bought 15 NodeMonkes',
      value: '0.36 BTC',
      time: '1h ago',
      impact: 'high'
    },
    {
      whale: 'bc1q...whale2',
      action: 'Sold 100,000 ORDI',
      value: '$4.5M',
      time: '2h ago',
      impact: 'medium'
    },
    {
      whale: 'bc1q...whale3',
      action: 'Inscribed 50 items',
      value: '0.12 BTC',
      time: '3h ago',
      impact: 'low'
    }
  ]

  const rarityDistribution = [
    { name: 'Common', value: 65, color: '#8B5CF6' },
    { name: 'Uncommon', value: 20, color: '#10B981' },
    { name: 'Rare', value: 10, color: '#F59E0B' },
    { name: 'Epic', value: 4, color: '#EF4444' },
    { name: 'Legendary', value: 1, color: '#F97316' }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard Geral</h2>
        <div className="flex items-center gap-2">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-orange-600' : ''}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inscriptions Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-orange-500" />
              Atividade de Inscrições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={inscriptionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="inscriptions" 
                  stroke="#F97316" 
                  fill="url(#inscriptionsGradient)" 
                />
                <defs>
                  <linearGradient id="inscriptionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Volume de Negociação (BTC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inscriptionsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="volume" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Collections and BRC20 Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Collections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-500" />
              Top Coleções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCollections.map((collection, index) => (
                <div key={collection.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{collection.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {collection.holders.toLocaleString()} holders • {collection.items.toLocaleString()} items
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₿{collection.floorPrice}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {collection.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={collection.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {Math.abs(collection.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top BRC20 Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-amber-500" />
              Top Tokens BRC-20
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBRC20.map((token, index) => (
                <div key={token.symbol} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{token.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        MCap: ${(token.marketCap / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${token.price}</p>
                    <div className="flex items-center gap-1 text-sm">
                      {token.change >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-500" />
                      )}
                      <span className={token.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {Math.abs(token.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Whale Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${tx.type === 'inscription' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                    <div>
                      <p className="font-medium text-sm">{tx.collection}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.from.slice(0, 8)}...→{tx.to.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{tx.amount}</p>
                    <p className="text-xs text-muted-foreground">{tx.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Whale Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-red-500" />
              Atividade de Baleias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {whaleActivity.map((activity, index) => (
                <div key={index} className="p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        activity.impact === 'high' ? 'border-red-500 text-red-400' :
                        activity.impact === 'medium' ? 'border-yellow-500 text-yellow-400' :
                        'border-green-500 text-green-400'
                      }`}
                    >
                      {activity.impact.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <p className="text-sm font-medium mb-1">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.whale}</p>
                  <p className="text-sm font-medium text-orange-400">{activity.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}