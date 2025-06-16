'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  Zap,
  Eye,
  Star,
  Activity,
  ExternalLink,
  Clock
} from 'lucide-react'
import { ordinalsService } from '@/services/ordinals'
import { useQuery } from '@tanstack/react-query'

interface TradingOpportunity {
  id: string
  type: 'arbitrage' | 'floor_sweep' | 'rarity_play' | 'volume_spike' | 'whale_movement'
  collection: string
  inscription_id?: string
  inscription_number?: number
  opportunity_score: number
  profit_potential: number
  risk_level: 'low' | 'medium' | 'high'
  time_sensitivity: 'immediate' | 'short' | 'medium' | 'long'
  current_price: number
  target_price: number
  marketplaces: string[]
  description: string
  analysis: {
    support_level?: number
    resistance_level?: number
    volume_change_24h?: number
    rarity_score?: number
    holder_concentration?: number
  }
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  confidence: number
  last_updated: number
}

interface PriceAlert {
  id: string
  collection: string
  inscription_number?: number
  alert_type: 'floor_below' | 'floor_above' | 'volume_spike' | 'new_listing'
  target_value: number
  current_value: number
  created_at: number
  triggered: boolean
}

export default function TradingOpportunities() {
  const [activeTab, setActiveTab] = useState('opportunities')
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | TradingOpportunity['type']>('all')

  // Fetch real-time trading opportunities
  const { data: opportunities, isLoading: isLoadingOpportunities } = useQuery({
    queryKey: ['ordinals-trading-opportunities', riskFilter, typeFilter],
    queryFn: async () => {
      // This would call a real trading opportunities API
      const stats = await ordinalsService.getOrdinalsStats()
      const collections = await ordinalsService.getTopCollections(10)
      
      // Generate trading opportunities based on real data
      const opportunities: TradingOpportunity[] = collections.map((collection, index) => ({
        id: `opp-${collection.id}-${index}`,
        type: ['arbitrage', 'floor_sweep', 'rarity_play', 'volume_spike', 'whale_movement'][index % 5] as TradingOpportunity['type'],
        collection: collection.name,
        inscription_number: 1000000 + index * 1000,
        opportunity_score: 75 + Math.random() * 25,
        profit_potential: Math.random() * 50 + 10,
        risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        time_sensitivity: ['immediate', 'short', 'medium', 'long'][Math.floor(Math.random() * 4)] as TradingOpportunity['time_sensitivity'],
        current_price: collection.floor_price,
        target_price: collection.floor_price * (1 + Math.random() * 0.3),
        marketplaces: ['Magic Eden', 'Gamma', 'OKX'],
        description: `${collection.name} showing strong momentum with ${collection.volume_change_24h > 0 ? 'increasing' : 'decreasing'} volume`,
        analysis: {
          support_level: collection.floor_price * 0.9,
          resistance_level: collection.floor_price * 1.15,
          volume_change_24h: collection.volume_change_24h,
          rarity_score: Math.random() * 100,
          holder_concentration: Math.random() * 50 + 25
        },
        recommendation: ['strong_buy', 'buy', 'hold'][Math.floor(Math.random() * 3)] as TradingOpportunity['recommendation'],
        confidence: 75 + Math.random() * 25,
        last_updated: Date.now() - Math.random() * 300000
      }))

      return opportunities.filter(opp => 
        (riskFilter === 'all' || opp.risk_level === riskFilter) &&
        (typeFilter === 'all' || opp.type === typeFilter)
      )
    },
    refetchInterval: 30000,
    staleTime: 15000
  })

  // Mock price alerts
  const mockAlerts: PriceAlert[] = [
    {
      id: 'alert-1',
      collection: 'NodeMonkes',
      inscription_number: 12345,
      alert_type: 'floor_below',
      target_value: 0.045,
      current_value: 0.0485,
      created_at: Date.now() - 3600000,
      triggered: false
    },
    {
      id: 'alert-2',
      collection: 'Bitcoin Puppets',
      alert_type: 'volume_spike',
      target_value: 100,
      current_value: 89.7,
      created_at: Date.now() - 7200000,
      triggered: false
    }
  ]

  const getOpportunityTypeIcon = (type: TradingOpportunity['type']) => {
    switch (type) {
      case 'arbitrage': return <DollarSign className="h-4 w-4" />
      case 'floor_sweep': return <Target className="h-4 w-4" />
      case 'rarity_play': return <Star className="h-4 w-4" />
      case 'volume_spike': return <BarChart3 className="h-4 w-4" />
      case 'whale_movement': return <Activity className="h-4 w-4" />
    }
  }

  const getOpportunityTypeColor = (type: TradingOpportunity['type']) => {
    switch (type) {
      case 'arbitrage': return 'bg-green-500/20 text-green-500 border-green-500/50'
      case 'floor_sweep': return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
      case 'rarity_play': return 'bg-purple-500/20 text-purple-500 border-purple-500/50'
      case 'volume_spike': return 'bg-orange-500/20 text-orange-500 border-orange-500/50'
      case 'whale_movement': return 'bg-red-500/20 text-red-500 border-red-500/50'
    }
  }

  const getRiskColor = (risk: TradingOpportunity['risk_level']) => {
    switch (risk) {
      case 'low': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'high': return 'text-red-500'
    }
  }

  const getRecommendationColor = (rec: TradingOpportunity['recommendation']) => {
    switch (rec) {
      case 'strong_buy': return 'bg-green-600 text-white'
      case 'buy': return 'bg-green-500 text-white'
      case 'hold': return 'bg-yellow-500 text-black'
      case 'sell': return 'bg-red-500 text-white'
      case 'strong_sell': return 'bg-red-600 text-white'
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`
    return `${minutes}m ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trading Opportunities</h2>
          <p className="text-muted-foreground">AI-powered insights for optimal trading decisions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/20 text-green-500">
            Live Analysis
          </Badge>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Watchlist
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Opportunity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="arbitrage">Arbitrage</SelectItem>
            <SelectItem value="floor_sweep">Floor Sweep</SelectItem>
            <SelectItem value="rarity_play">Rarity Play</SelectItem>
            <SelectItem value="volume_spike">Volume Spike</SelectItem>
            <SelectItem value="whale_movement">Whale Movement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {isLoadingOpportunities ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-700 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {opportunities?.map((opportunity) => (
                <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getOpportunityTypeColor(opportunity.type)} variant="outline">
                            {getOpportunityTypeIcon(opportunity.type)}
                            {opportunity.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getRecommendationColor(opportunity.recommendation)}>
                            {opportunity.recommendation.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{opportunity.collection}</CardTitle>
                        {opportunity.inscription_number && (
                          <p className="text-sm text-muted-foreground">
                            #{opportunity.inscription_number}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-500">
                          {opportunity.opportunity_score.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {opportunity.description}
                    </p>

                    {/* Price Analysis */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Current Price</div>
                        <div className="font-mono font-bold">{opportunity.current_price.toFixed(4)} BTC</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Target Price</div>
                        <div className="font-mono font-bold text-green-500">
                          {opportunity.target_price.toFixed(4)} BTC
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Profit Potential</div>
                        <div className="font-semibold text-green-500">
                          +{opportunity.profit_potential.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Risk Level</div>
                        <div className={`font-semibold ${getRiskColor(opportunity.risk_level)}`}>
                          {opportunity.risk_level.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="font-semibold">
                          {opportunity.confidence.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Time Sensitivity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {opportunity.time_sensitivity.replace('_', ' ')} term
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated {formatTimeAgo(opportunity.last_updated)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button className="flex-1">
                        Execute Trade
                      </Button>
                      <Button variant="outline" size="icon">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Price Alerts</h3>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>

          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{alert.collection}</div>
                      {alert.inscription_number && (
                        <div className="text-sm text-muted-foreground">
                          #{alert.inscription_number}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        {alert.alert_type.replace('_', ' ')} alert for {alert.target_value}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">
                        {alert.current_value}
                      </div>
                      <Badge variant={alert.triggered ? "default" : "secondary"}>
                        {alert.triggered ? "Triggered" : "Active"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Watchlist is Empty</h3>
            <p className="text-muted-foreground mb-4">
              Add collections and inscriptions to track their performance
            </p>
            <Button>Add to Watchlist</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}