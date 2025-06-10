'use client'

import { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cpu, Zap, DollarSign, BarChart3, Hammer, TrendingUp } from 'lucide-react'

interface MinerDashboardProps {
  timeRange: string
  isLive?: boolean
}

export const MinerDashboard: FC<MinerDashboardProps> = ({ timeRange, isLive }) => {
  const miningStats = [
    { label: 'Network Hashrate', value: '485 EH/s', icon: Cpu, change: '+8.5%' },
    { label: 'Mining Difficulty', value: '67.3T', icon: Zap, change: '+3.2%' },
    { label: 'Block Reward', value: '$268,750', icon: DollarSign, change: '+12.7%' },
    { label: 'Hash Price', value: '$0.08/TH', icon: BarChart3, change: '-2.1%' }
  ]

  const topPools = [
    { name: 'Foundry USA', hashrate: '145.5 EH/s', share: '30%', blocks: 43 },
    { name: 'AntPool', hashrate: '97.0 EH/s', share: '20%', blocks: 29 },
    { name: 'ViaBTC', hashrate: '72.8 EH/s', share: '15%', blocks: 22 },
    { name: 'F2Pool', hashrate: '58.2 EH/s', share: '12%', blocks: 17 },
    { name: 'Binance Pool', hashrate: '48.5 EH/s', share: '10%', blocks: 14 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mining Dashboard</h2>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {miningStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span> from last {timeRange}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="h-5 w-5" />
              Mining Pool Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPools.map((pool) => (
                <div key={pool.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{pool.name}</p>
                      <p className="text-xs text-muted-foreground">{pool.hashrate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{pool.blocks} blocks</p>
                      <p className="text-xs text-muted-foreground">Last 24h</p>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                      style={{ width: pool.share }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mining Economics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Break-even Price</p>
                  <p className="text-xs text-muted-foreground">Average cost basis</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">$23,450</p>
                  <p className="text-xs text-green-600">Profitable</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Revenue per TH</p>
                  <p className="text-xs text-muted-foreground">Daily average</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">$0.0821</p>
                  <p className="text-xs text-red-600">-2.3%</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Electricity Cost</p>
                  <p className="text-xs text-muted-foreground">Average $/kWh</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">$0.045</p>
                  <p className="text-xs text-muted-foreground">Stable</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">ASIC Efficiency</p>
                  <p className="text-xs text-muted-foreground">J/TH average</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">21.5 J/TH</p>
                  <p className="text-xs text-green-600">Improving</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Hashrate Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted/10 rounded-lg">
            <p className="text-muted-foreground">Hashrate trend chart</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}