'use client'

import { FC } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, TrendingUp, DollarSign, BarChart3, Activity, AlertTriangle } from 'lucide-react'

interface DerivativesDashboardProps {
  timeRange: string
  isLive?: boolean
}

export const DerivativesDashboard: FC<DerivativesDashboardProps> = ({ timeRange, isLive }) => {
  const derivativesStats = [
    { label: 'Open Interest', value: '$18.3B', icon: DollarSign, change: '+8.5%' },
    { label: 'Volume (24h)', value: '$67.2B', icon: BarChart3, change: '+23.1%' },
    { label: 'Funding Rate', value: '0.012%', icon: TrendingUp, change: '+0.003%' },
    { label: 'Liquidations', value: '$124M', icon: AlertTriangle, change: '+45.2%' }
  ]

  const topContracts = [
    { contract: 'BTC-PERP', oi: '$5.2B', volume: '$23.1B', funding: '0.015%', basis: '+0.32%' },
    { contract: 'BTC-29MAR24', oi: '$2.8B', volume: '$12.4B', funding: 'N/A', basis: '+2.15%' },
    { contract: 'BTC-28JUN24', oi: '$1.9B', volume: '$8.7B', funding: 'N/A', basis: '+4.28%' },
    { contract: 'BTC-27SEP24', oi: '$1.2B', volume: '$5.3B', funding: 'N/A', basis: '+6.82%' }
  ]

  const optionsData = [
    { strike: '$40,000', callOI: '$234M', putOI: '$156M', iv: '52%' },
    { strike: '$45,000', callOI: '$456M', putOI: '$89M', iv: '48%' },
    { strike: '$50,000', callOI: '$678M', putOI: '$45M', iv: '55%' },
    { strike: '$55,000', callOI: '$342M', putOI: '$23M', iv: '62%' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Derivatives Dashboard</h2>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {derivativesStats.map((stat) => (
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
            <CardTitle>Futures Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left pb-2">Contract</th>
                    <th className="text-right pb-2">OI</th>
                    <th className="text-right pb-2">Volume</th>
                    <th className="text-right pb-2">Funding</th>
                    <th className="text-right pb-2">Basis</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {topContracts.map((contract) => (
                    <tr key={contract.contract} className="border-b">
                      <td className="py-2 font-medium">{contract.contract}</td>
                      <td className="text-right">{contract.oi}</td>
                      <td className="text-right">{contract.volume}</td>
                      <td className="text-right">
                        <span className={contract.funding !== 'N/A' ? 'text-green-600' : 'text-muted-foreground'}>
                          {contract.funding}
                        </span>
                      </td>
                      <td className="text-right text-green-600">{contract.basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left pb-2">Strike</th>
                    <th className="text-right pb-2">Call OI</th>
                    <th className="text-right pb-2">Put OI</th>
                    <th className="text-right pb-2">IV</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {optionsData.map((option) => (
                    <tr key={option.strike} className="border-b">
                      <td className="py-2 font-medium">{option.strike}</td>
                      <td className="text-right text-green-600">{option.callOI}</td>
                      <td className="text-right text-red-600">{option.putOI}</td>
                      <td className="text-right">{option.iv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Microstructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Long/Short Ratio</p>
              <p className="text-2xl font-bold mt-2">1.32</p>
              <p className="text-xs text-green-600">Bullish sentiment</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Perpetual Premium</p>
              <p className="text-2xl font-bold mt-2">0.18%</p>
              <p className="text-xs text-muted-foreground">Above spot</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Options Skew</p>
              <p className="text-2xl font-bold mt-2">-2.3%</p>
              <p className="text-xs text-red-600">Put premium</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Term Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted/10 rounded-lg">
            <p className="text-muted-foreground">Futures term structure curve</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}