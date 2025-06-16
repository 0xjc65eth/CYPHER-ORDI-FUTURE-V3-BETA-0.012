'use client'

import { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, TrendingUp, DollarSign, BarChart3, Activity, Zap } from 'lucide-react'

interface MacroDashboardProps {
  timeRange: string
  isLive?: boolean
}

export const MacroDashboard: FC<MacroDashboardProps> = ({ timeRange, isLive }) => {
  const macroIndicators = [
    { label: 'Global Market Cap', value: '$856B', icon: Globe, change: '+12.3%' },
    { label: 'BTC Dominance', value: '52.3%', icon: TrendingUp, change: '+2.1%' },
    { label: 'DXY Index', value: '103.45', icon: DollarSign, change: '-0.8%' },
    { label: 'Correlation (S&P)', value: '0.67', icon: BarChart3, change: '+0.05' }
  ]

  const economicIndicators = [
    { name: 'Fed Rate', value: '5.25%', trend: 'stable' },
    { name: 'CPI', value: '3.2%', trend: 'down' },
    { name: 'Gold/BTC Ratio', value: '0.045', trend: 'up' },
    { name: 'VIX', value: '15.23', trend: 'down' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Macro Economic Dashboard</h2>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {macroIndicators.map((indicator) => (
          <Card key={indicator.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{indicator.label}</CardTitle>
              <indicator.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{indicator.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={indicator.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {indicator.change}
                </span> from last {timeRange}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Global Liquidity Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded-lg">
              <p className="text-muted-foreground">Global liquidity chart</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cross-Asset Correlations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <div></div>
                <div className="text-center">BTC</div>
                <div className="text-center">Gold</div>
                <div className="text-center">S&P</div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 items-center">
                  <div className="text-xs">BTC</div>
                  <div className="h-8 bg-primary rounded flex items-center justify-center text-xs font-medium">1.00</div>
                  <div className="h-8 bg-primary/60 rounded flex items-center justify-center text-xs font-medium">0.42</div>
                  <div className="h-8 bg-primary/80 rounded flex items-center justify-center text-xs font-medium">0.67</div>
                </div>
                <div className="grid grid-cols-4 gap-2 items-center">
                  <div className="text-xs">Gold</div>
                  <div className="h-8 bg-primary/60 rounded flex items-center justify-center text-xs font-medium">0.42</div>
                  <div className="h-8 bg-primary rounded flex items-center justify-center text-xs font-medium">1.00</div>
                  <div className="h-8 bg-primary/40 rounded flex items-center justify-center text-xs font-medium">0.35</div>
                </div>
                <div className="grid grid-cols-4 gap-2 items-center">
                  <div className="text-xs">S&P</div>
                  <div className="h-8 bg-primary/80 rounded flex items-center justify-center text-xs font-medium">0.67</div>
                  <div className="h-8 bg-primary/40 rounded flex items-center justify-center text-xs font-medium">0.35</div>
                  <div className="h-8 bg-primary rounded flex items-center justify-center text-xs font-medium">1.00</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Economic Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {economicIndicators.map((indicator) => (
              <div key={indicator.name} className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">{indicator.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xl font-bold">{indicator.value}</p>
                  <div className="flex items-center gap-1">
                    <Zap className={`h-4 w-4 ${
                      indicator.trend === 'up' ? 'text-green-600 rotate-0' : 
                      indicator.trend === 'down' ? 'text-red-600 rotate-180' : 
                      'text-yellow-600 rotate-90'
                    }`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}