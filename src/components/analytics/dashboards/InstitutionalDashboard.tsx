'use client'

import { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, TrendingUp, Shield, BarChart3, Briefcase, DollarSign } from 'lucide-react'

interface InstitutionalDashboardProps {
  timeRange: string
  isLive?: boolean
}

export const InstitutionalDashboard: FC<InstitutionalDashboardProps> = ({ timeRange, isLive }) => {
  const institutionalMetrics = [
    { label: 'Total AUM', value: '$145.2B', icon: Building2, change: '+23.5%' },
    { label: 'Institutional Holdings', value: '3.2M BTC', icon: Shield, change: '+15.8%' },
    { label: 'Average Position', value: '$12.3M', icon: DollarSign, change: '+8.2%' },
    { label: 'Active Institutions', value: '1,847', icon: Briefcase, change: '+45' }
  ]

  const topHoldings = [
    { name: 'MicroStrategy', btc: '189,150', value: '$8.2B', change: '+12.3%' },
    { name: 'Tesla', btc: '42,902', value: '$1.9B', change: '0%' },
    { name: 'Block', btc: '8,027', value: '$347M', change: '+5.2%' },
    { name: 'Coinbase', btc: '4,482', value: '$194M', change: '+8.7%' },
    { name: 'Marathon Digital', btc: '15,174', value: '$657M', change: '+18.5%' }
  ]

  const flowMetrics = [
    { period: 'Today', inflow: '$234M', outflow: '$156M', net: '+$78M' },
    { period: 'This Week', inflow: '$1.2B', outflow: '$890M', net: '+$310M' },
    { period: 'This Month', inflow: '$4.5B', outflow: '$3.1B', net: '+$1.4B' },
    { period: 'YTD', inflow: '$45.2B', outflow: '$32.8B', net: '+$12.4B' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Institutional Dashboard</h2>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {institutionalMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={metric.change.startsWith('+') ? 'text-green-600' : 'text-muted-foreground'}>
                  {metric.change}
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
              <Building2 className="h-5 w-5" />
              Top Institutional Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHoldings.map((holding) => (
                <div key={holding.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{holding.name}</p>
                    <p className="text-xs text-muted-foreground">{holding.btc} BTC</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{holding.value}</p>
                    <p className="text-xs text-green-600">{holding.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Capital Flows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flowMetrics.map((flow) => (
                <div key={flow.period} className="space-y-2">
                  <p className="text-sm font-medium">{flow.period}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-green-500/10 rounded p-2">
                      <p className="text-muted-foreground">Inflow</p>
                      <p className="font-medium text-green-600">{flow.inflow}</p>
                    </div>
                    <div className="bg-red-500/10 rounded p-2">
                      <p className="text-muted-foreground">Outflow</p>
                      <p className="font-medium text-red-600">{flow.outflow}</p>
                    </div>
                    <div className="bg-primary/10 rounded p-2">
                      <p className="text-muted-foreground">Net</p>
                      <p className="font-medium">{flow.net}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Institutional Activity Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted/10 rounded-lg">
            <p className="text-muted-foreground">Institutional activity heat map</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}