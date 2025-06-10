'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Treemap, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  TrendingUp, Users, Activity, DollarSign, 
  BarChart3, PieChart as PieIcon, GitBranch, 
  Layers, Clock, Zap, Target, Award
} from 'lucide-react';
import { useRunesAnalytics } from '@/hooks/runes/useRunesAnalytics';

export function RunesAnalytics() {
  const [selectedRune, setSelectedRune] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  
  const { data: analyticsData, isLoading } = useRunesAnalytics(selectedRune, timeRange);

  // Supply/Demand Curve Data
  const supplyDemandData = Array.from({ length: 20 }, (_, i) => ({
    price: 0.005 + i * 0.001,
    supply: 100000 - i * 4000,
    demand: 20000 + i * 3000,
    equilibrium: i === 12
  }));

  // Market Cap Evolution
  const marketCapData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    marketCap: 50000000 + Math.random() * 20000000,
    volume: 2000000 + Math.random() * 1000000
  }));

  // Holder Distribution (Treemap)
  const holderDistribution = [
    { name: 'Whales (>1M)', size: 35, count: 12 },
    { name: 'Large (100K-1M)', size: 25, count: 89 },
    { name: 'Medium (10K-100K)', size: 20, count: 456 },
    { name: 'Small (1K-10K)', size: 15, count: 2341 },
    { name: 'Micro (<1K)', size: 5, count: 12847 }
  ];

  // Velocity of Money
  const velocityData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    velocity: 2.5 + Math.random() * 1.5,
    transactions: Math.floor(100 + Math.random() * 200)
  }));

  // Rune Metrics Comparison (Radar)
  const runeMetrics = [
    { metric: 'Liquidity', A: 80, B: 65, C: 90 },
    { metric: 'Volume', A: 70, B: 85, C: 60 },
    { metric: 'Holders', A: 90, B: 60, C: 75 },
    { metric: 'Activity', A: 85, B: 70, C: 80 },
    { metric: 'Growth', A: 75, B: 90, C: 65 },
    { metric: 'Stability', A: 60, B: 80, C: 85 }
  ];

  // Top Runes Performance
  const topRunesPerformance = [
    { name: 'DOG•GO•TO•THE•MOON', marketCap: 12500000, change24h: 15.2, volume24h: 2340000, holders: 5234 },
    { name: 'UNCOMMON•GOODS', marketCap: 8900000, change24h: 8.9, volume24h: 1890000, holders: 3812 },
    { name: 'RSIC•METAPROTOCOL', marketCap: 6700000, change24h: -3.1, volume24h: 1450000, holders: 2934 },
    { name: 'MEME•WARFARE', marketCap: 4500000, change24h: 12.5, volume24h: 980000, holders: 1789 },
    { name: 'PIZZA•NINJAS', marketCap: 3400000, change24h: 5.7, volume24h: 760000, holders: 1234 }
  ];

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedRune} onValueChange={setSelectedRune}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Rune" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Runes</SelectItem>
              <SelectItem value="DOG•GO•TO•THE•MOON">DOG•GO•TO•THE•MOON</SelectItem>
              <SelectItem value="UNCOMMON•GOODS">UNCOMMON•GOODS</SelectItem>
              <SelectItem value="RSIC•METAPROTOCOL">RSIC•METAPROTOCOL</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <TrendingUp className="h-3 w-3 mr-1" />
            Market Growing
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Activity className="h-3 w-3 mr-1" />
            High Activity
          </Badge>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Total Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$89.4M</div>
            <p className="text-xs text-muted-foreground mt-1">+12.3% from last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Holders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,892</div>
            <p className="text-xs text-muted-foreground mt-1">+8.7% from last period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              24h Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground mt-1">+23.1% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Avg Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.42x</div>
            <p className="text-xs text-muted-foreground mt-1">Healthy circulation</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="supply-demand" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="supply-demand">Supply & Demand</TabsTrigger>
          <TabsTrigger value="market-cap">Market Cap</TabsTrigger>
          <TabsTrigger value="holder-distribution">Holders</TabsTrigger>
          <TabsTrigger value="velocity">Velocity</TabsTrigger>
        </TabsList>

        <TabsContent value="supply-demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supply & Demand Curves</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={supplyDemandData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="price" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="supply" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={false}
                    name="Supply"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="Demand"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Equilibrium Price</span>
                  <span className="font-medium">0.017 BTC</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Market Efficiency</span>
                  <div className="flex items-center gap-2">
                    <Progress value={87} className="w-20" />
                    <span className="text-sm font-medium">87%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market-cap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Cap Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={marketCapData}>
                  <defs>
                    <linearGradient id="colorMarketCap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="marketCap" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    
                    name="Market Cap"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Top Performers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Runes by Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topRunesPerformance.map((rune, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                      <div>
                        <p className="font-medium">{rune.name}</p>
                        <p className="text-sm text-muted-foreground">{rune.holders.toLocaleString()} holders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(rune.marketCap / 1000000).toFixed(1)}M</p>
                      <p className={`text-sm ${rune.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {rune.change24h > 0 ? '+' : ''}{rune.change24h}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holder-distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Holder Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={holderDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="size"
                    >
                      {holderDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {holderDistribution.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-muted-foreground">{category.count.toLocaleString()} wallets</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Concentration Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Gini Coefficient</span>
                      <span className="text-sm font-medium">0.72</span>
                    </div>
                    <Progress value={72} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">High concentration</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Top 10 Holders Control</span>
                      <span className="text-sm font-medium">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Moderate decentralization</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Active Holders (30d)</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Good activity level</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="velocity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Velocity of Money (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={velocityData}>
                  <defs>
                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="velocity" 
                    stroke="#f59e0b" 
                    fillOpacity={1} 
                    
                    name="Velocity"
                  />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Velocity</span>
                      <span className="text-xl font-bold">3.42x</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Times supply circulated</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Peak Hour</span>
                      <span className="text-xl font-bold">14:00</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">4.8x velocity</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rune Comparison Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Rune Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={runeMetrics}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis dataKey="metric" stroke="#666" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#666" />
              <Radar name="DOG•GO•TO•THE•MOON" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
              <Radar name="UNCOMMON•GOODS" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="RSIC•METAPROTOCOL" dataKey="C" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}