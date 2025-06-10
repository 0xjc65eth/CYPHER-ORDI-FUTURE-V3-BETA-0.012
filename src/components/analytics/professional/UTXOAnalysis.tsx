'use client'

import { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, TrendingUp, Clock, BarChart3 } from 'lucide-react'

interface UTXOAnalysisProps {
  timeRange: string
  isLive?: boolean
}

const UTXOAnalysis: FC<UTXOAnalysisProps> = ({ timeRange, isLive }) => {
  const metrics = [
    { label: 'Total UTXOs', value: '84.3M', icon: Coins, change: '+2.3%' },
    { label: 'Average UTXO Value', value: '0.023 BTC', icon: TrendingUp, change: '-5.1%' },
    { label: 'UTXO Age (Median)', value: '142 days', icon: Clock, change: '+8.7%' },
    { label: 'Distribution Score', value: '0.76', icon: BarChart3, change: '+1.2%' }
  ]

  const ageDistribution = [
    { range: '< 1 day', percentage: 12, count: '10.1M' },
    { range: '1-7 days', percentage: 18, count: '15.2M' },
    { range: '1-3 months', percentage: 25, count: '21.1M' },
    { range: '3-6 months', percentage: 20, count: '16.9M' },
    { range: '6-12 months', percentage: 15, count: '12.6M' },
    { range: '> 1 year', percentage: 10, count: '8.4M' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">UTXO Analysis</h2>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {metric.change}
                </span> from last {timeRange}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>UTXO Age Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ageDistribution.map((item) => (
              <div key={item.range}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">{item.range}</span>
                  <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>UTXO Value Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center bg-muted/10 rounded-lg">
              <p className="text-muted-foreground">UTXO value chart</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Dormant UTXOs</p>
                  <p className="text-xs text-muted-foreground">Not moved in 1+ years</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">62.3%</p>
                  <p className="text-xs text-green-600">+3.2%</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Active UTXOs</p>
                  <p className="text-xs text-muted-foreground">Moved in last 30 days</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">15.7%</p>
                  <p className="text-xs text-red-600">-1.8%</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Lost UTXOs (Est.)</p>
                  <p className="text-xs text-muted-foreground">Likely lost forever</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">22.0%</p>
                  <p className="text-xs text-muted-foreground">±0.1%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UTXOAnalysis