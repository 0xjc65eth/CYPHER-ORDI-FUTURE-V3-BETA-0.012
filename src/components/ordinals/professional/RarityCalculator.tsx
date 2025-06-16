'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Sparkles, Calculator, TrendingUp, Search, BarChart3, Activity, Info, Diamond } from 'lucide-react'
import { useRarityData } from '@/hooks/ordinals/useRarityData'

const RARITY_COLORS = {
  common: '#94a3b8',
  uncommon: '#10b981',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
  mythic: '#ef4444'
}

export default function RarityCalculator() {
  const [inscriptionId, setInscriptionId] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('nodemonkes')
  const { data: rarityData, isLoading } = useRarityData(inscriptionId || selectedCollection)

  // Mock trait rarity data
  const traitRarityData = [
    { trait: 'Background', value: 'Gold', rarity: 3.2, score: 31.25 },
    { trait: 'Body', value: 'Robot', rarity: 1.8, score: 55.56 },
    { trait: 'Eyes', value: 'Laser', rarity: 0.9, score: 111.11 },
    { trait: 'Mouth', value: 'Smile', rarity: 12.5, score: 8.00 },
    { trait: 'Hat', value: 'Crown', rarity: 2.1, score: 47.62 },
    { trait: 'Accessory', value: 'Chain', rarity: 5.7, score: 17.54 },
  ]

  // Mock statistical analysis
  const statisticalAnalysis = {
    totalScore: 271.08,
    percentile: 94.3,
    rank: 143,
    totalSupply: 10000,
    uniqueTraits: 6,
    averageRarity: 4.37
  }

  // Mock comparative index
  const comparativeData = [
    { collection: 'NodeMonkes', avgRarity: 45.2, floor: 0.045 },
    { collection: 'Bitcoin Puppets', avgRarity: 52.1, floor: 0.032 },
    { collection: 'Runestones', avgRarity: 38.7, floor: 0.028 },
    { collection: 'Quantum Cats', avgRarity: 61.3, floor: 0.025 },
    { collection: 'Bitcoin Frogs', avgRarity: 41.9, floor: 0.019 },
  ]

  // Mock historical trends
  const historicalTrends = [
    { date: '2024-01-01', avgRarity: 42.1, topRarity: 289.5, floor: 0.032 },
    { date: '2024-01-08', avgRarity: 43.5, topRarity: 295.2, floor: 0.035 },
    { date: '2024-01-15', avgRarity: 45.2, topRarity: 301.8, floor: 0.038 },
    { date: '2024-01-22', avgRarity: 44.8, topRarity: 298.4, floor: 0.041 },
    { date: '2024-01-29', avgRarity: 46.3, topRarity: 312.1, floor: 0.045 },
  ]

  // Mock rarity distribution
  const rarityDistribution = [
    { range: '0-50', count: 2341, percentage: 23.4 },
    { range: '50-100', count: 3456, percentage: 34.6 },
    { range: '100-150', count: 2123, percentage: 21.2 },
    { range: '150-200', count: 1234, percentage: 12.3 },
    { range: '200-250', count: 567, percentage: 5.7 },
    { range: '250+', count: 279, percentage: 2.8 },
  ]

  // Mock price correlation data
  const priceCorrelation = [
    { rarity: 25, price: 0.032, size: 45 },
    { rarity: 45, price: 0.035, size: 89 },
    { rarity: 67, price: 0.038, size: 123 },
    { rarity: 89, price: 0.042, size: 67 },
    { rarity: 112, price: 0.048, size: 34 },
    { rarity: 145, price: 0.056, size: 23 },
    { rarity: 189, price: 0.067, size: 15 },
    { rarity: 234, price: 0.089, size: 8 },
    { rarity: 289, price: 0.123, size: 5 },
  ]

  const getRarityTier = (score: number) => {
    if (score >= 250) return { tier: 'Mythic', color: RARITY_COLORS.mythic }
    if (score >= 200) return { tier: 'Legendary', color: RARITY_COLORS.legendary }
    if (score >= 150) return { tier: 'Epic', color: RARITY_COLORS.epic }
    if (score >= 100) return { tier: 'Rare', color: RARITY_COLORS.rare }
    if (score >= 50) return { tier: 'Uncommon', color: RARITY_COLORS.uncommon }
    return { tier: 'Common', color: RARITY_COLORS.common }
  }

  const currentRarity = getRarityTier(statisticalAnalysis.totalScore)

  return (
    <div className="space-y-6">
      {/* Search/Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Rarity Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input 
              placeholder="Enter inscription ID or collection item..." 
              value={inscriptionId}
              onChange={(e) => setInscriptionId(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nodemonkes">NodeMonkes</SelectItem>
                <SelectItem value="bitcoin-puppets">Bitcoin Puppets</SelectItem>
                <SelectItem value="runestones">Runestones</SelectItem>
                <SelectItem value="quantum-cats">Quantum Cats</SelectItem>
                <SelectItem value="bitcoin-frogs">Bitcoin Frogs</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Calculate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={`border-2`} style={{ borderColor: currentRarity.color }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Rarity Score
              <Sparkles className="h-4 w-4" style={{ color: currentRarity.color }} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold" style={{ color: currentRarity.color }}>
              {statisticalAnalysis.totalScore.toFixed(2)}
            </p>
            <Badge className="mt-2" style={{ backgroundColor: currentRarity.color, color: 'white' }}>
              {currentRarity.tier}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Percentile
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statisticalAnalysis.percentile}%</p>
            <p className="text-sm text-muted-foreground">Top {100 - statisticalAnalysis.percentile}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Rank
              <Diamond className="h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">#{statisticalAnalysis.rank}</p>
            <p className="text-sm text-muted-foreground">of {statisticalAnalysis.totalSupply.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              Unique Traits
              <Activity className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statisticalAnalysis.uniqueTraits}</p>
            <p className="text-sm text-muted-foreground">Avg rarity: {statisticalAnalysis.averageRarity}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis */}
      <Tabs defaultValue="traits" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="traits">Trait Analysis</TabsTrigger>
          <TabsTrigger value="statistical">Statistical</TabsTrigger>
          <TabsTrigger value="comparative">Comparative</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
          <TabsTrigger value="correlation">Price Correlation</TabsTrigger>
        </TabsList>

        <TabsContent value="traits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trait Rarity Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {traitRarityData.map((trait, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-medium w-24">{trait.trait}</span>
                        <Badge variant="outline">{trait.value}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{trait.rarity}% have this</span>
                        <span className="font-mono font-bold w-20 text-right">+{trait.score.toFixed(2)}</span>
                      </div>
                    </div>
                    <Progress value={100 - trait.rarity} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trait Rarity Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={traitRarityData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="trait" stroke="#666" />
                    <PolarRadiusAxis stroke="#666" />
                    <Radar name="Rarity Score" dataKey="score" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistical" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rarity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rarityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="range" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        labelStyle={{ color: '#999' }}
                      />
                      <Bar dataKey="count" fill="#f97316">
                        {rarityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 5 ? RARITY_COLORS.mythic : '#f97316'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistical Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Mean Rarity Score</span>
                      <span className="font-mono">87.3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Median Rarity Score</span>
                      <span className="font-mono">74.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Standard Deviation</span>
                      <span className="font-mono">42.8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Skewness</span>
                      <span className="font-mono">1.23</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Rarity Tiers</h4>
                    <div className="space-y-2">
                      {Object.entries(RARITY_COLORS).map(([tier, color]) => (
                        <div key={tier} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                          <span className="text-sm capitalize">{tier}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Collection Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparativeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="collection" stroke="#666" />
                    <YAxis yAxisId="left" stroke="#666" />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#999' }}
                    />
                    <Bar yAxisId="left" dataKey="avgRarity" fill="#f97316" />
                    <Line yAxisId="right" type="monotone" dataKey="floor" stroke="#10b981" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Rarity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#999' }}
                    />
                    <Line type="monotone" dataKey="avgRarity" stroke="#f97316" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="topRarity" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rarity vs Price Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="rarity" stroke="#666" name="Rarity Score" />
                    <YAxis dataKey="price" stroke="#666" name="Price (BTC)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                      labelStyle={{ color: '#999' }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Scatter name="Items" data={priceCorrelation} fill="#f97316">
                      {priceCorrelation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.rarity > 200 ? RARITY_COLORS.legendary : '#f97316'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Correlation Analysis</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Strong positive correlation (r = 0.78) between rarity score and price. 
                  Items with rarity scores above 200 command premium prices averaging 2.8x floor.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}