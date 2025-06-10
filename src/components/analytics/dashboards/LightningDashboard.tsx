'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Network, Activity, DollarSign, Users, TrendingUp } from 'lucide-react';

interface LightningDashboardProps {
  timeRange: string;
  isLive?: boolean;
}

export const LightningDashboard: FC<LightningDashboardProps> = ({ timeRange, isLive }) => {
  const lightningStats = [
    { label: 'Network Capacity', value: '5,423 BTC', icon: Zap, change: '+12.3%' },
    { label: 'Active Channels', value: '73,521', icon: Network, change: '+8.7%' },
    { label: 'Active Nodes', value: '16,842', icon: Users, change: '+5.2%' },
    { label: 'Avg Channel Size', value: '0.074 BTC', icon: DollarSign, change: '+2.1%' }
  ];

  const topNodes = [
    { name: 'ACINQ', capacity: '423.5 BTC', channels: 2834, fee: '0.1%' },
    { name: 'River Financial', capacity: '312.8 BTC', channels: 1923, fee: '0.05%' },
    { name: 'Kraken', capacity: '287.2 BTC', channels: 1654, fee: '0.08%' },
    { name: 'Bitfinex', capacity: '234.1 BTC', channels: 1432, fee: '0.12%' },
    { name: 'OpenNode', capacity: '198.7 BTC', channels: 1234, fee: '0.15%' }
  ];

  const networkMetrics = [
    { metric: 'Avg Payment Size', value: '42,300 sats', change: '-5.2%' },
    { metric: 'Routing Success', value: '94.3%', change: '+1.2%' },
    { metric: 'Median Base Fee', value: '1 sat', change: '0%' },
    { metric: 'Median Fee Rate', value: '0.1%', change: '-0.02%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lightning Network Dashboard</h2>
        {isLive && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {lightningStats.map((stat) => (
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
              <Network className="h-5 w-5" />
              Top Lightning Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topNodes.map((node) => (
                <div key={node.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.channels} channels</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{node.capacity}</p>
                    <p className="text-xs text-muted-foreground">Fee: {node.fee}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {networkMetrics.map((item) => (
                <div key={item.metric} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{item.metric}</p>
                  <div className="text-right">
                    <p className="text-sm font-bold">{item.value}</p>
                    <p className="text-xs">
                      <span className={
                        item.change === '0%' ? 'text-muted-foreground' :
                        item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }>
                        {item.change}
                      </span>
                    </p>
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
            <TrendingUp className="h-5 w-5" />
            Channel Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Small ({"<"} 0.01 BTC)</span>
                <span className="text-sm text-muted-foreground">45,230 (61.5%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/80" style={{ width: '61.5%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Medium (0.01 - 0.1 BTC)</span>
                <span className="text-sm text-muted-foreground">23,125 (31.5%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/80" style={{ width: '31.5%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Large ({">"} 0.1 BTC)</span>
                <span className="text-sm text-muted-foreground">5,166 (7%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/80" style={{ width: '7%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network Graph Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-muted/10 rounded-lg">
            <p className="text-muted-foreground">Lightning network topology visualization</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};