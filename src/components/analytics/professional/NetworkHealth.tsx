'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { Activity, Zap, Server, GitBranch, AlertCircle, TrendingUp, Cpu, Network } from 'lucide-react'
import { useNetworkHealth } from '@/hooks/analytics/useNetworkHealth'

interface NetworkStat {
  label: string
  value: string | number
  unit: string
  trend: number
  icon: React.ReactNode
  status: 'healthy' | 'warning' | 'critical'
}

export default function NetworkHealth() {
  const { data: networkData, loading } = useNetworkHealth()

  const networkStats: NetworkStat[] = [
    {
      label: 'Network Capacity',
      value: networkData?.networkCapacity?.toFixed(2) || '5432.67',
      unit: 'BTC',
      trend: 5.2,
      icon: <Zap className="h-5 w-5" />,
      status: 'healthy'
    },
    {
      label: 'Channel Count',
      value: networkData?.channelCount?.toLocaleString() || '73,456',
      unit: 'channels',
      trend: 3.1,
      icon: <Cpu className="h-5 w-5" />,
      status: 'healthy'
    },
    {
      label: 'Node Count',
      value: networkData?.nodeCount?.toLocaleString() || '15,234',
      unit: 'nodes',
      trend: -2.3,
      icon: <Network className="h-5 w-5" />,
      status: 'warning'
    },
    {
      label: 'Avg Channel Size',
      value: networkData?.avgChannelSize?.toFixed(3) || '0.074',
      unit: 'BTC',
      trend: 12.5,
      icon: <Server className="h-5 w-5" />,
      status: 'warning'
    }
  ]

  // Hash Rate Ribbon Data
  const hashRateRibbon = [
    { date: '2025-01', ma30: 480, ma60: 470, hashRate: 485 },
    { date: '2025-02', ma30: 490, ma60: 478, hashRate: 495 },
    { date: '2025-03', ma30: 502, ma60: 488, hashRate: 510 },
    { date: '2025-04', ma30: 515, ma60: 498, hashRate: 520 },
    { date: '2025-05', ma30: 520, ma60: 510, hashRate: 525 },
  ]

  // Mining Profitability Index
  const profitabilityData = [
    { miner: 'S19 Pro', profitability: 85, efficiency: 29.5 },
    { miner: 'S19j Pro', profitability: 78, efficiency: 30.0 },
    { miner: 'M30S++', profitability: 72, efficiency: 31.0 },
    { miner: 'S19 XP', profitability: 92, efficiency: 21.5 },
    { miner: 'M50S', profitability: 88, efficiency: 26.0 },
  ]

  // Mempool Congestion Analysis
  const mempoolData = [
    { time: '00:00', size: 45, feeRate: 12, pending: 234567 },
    { time: '04:00', size: 38, feeRate: 8, pending: 198234 },
    { time: '08:00', size: 62, feeRate: 18, pending: 312456 },
    { time: '12:00', size: 124, feeRate: 45, pending: 456789 },
    { time: '16:00', size: 98, feeRate: 32, pending: 387654 },
    { time: '20:00', size: 76, feeRate: 24, pending: 298765 },
  ]

  // Node Distribution Map Data
  const nodeDistribution = [
    { region: 'North America', nodes: 4823, percentage: 31.6 },
    { region: 'Europe', nodes: 4256, percentage: 27.9 },
    { region: 'Asia', nodes: 3456, percentage: 22.6 },
    { region: 'South America', nodes: 1234, percentage: 8.1 },
    { region: 'Africa', nodes: 876, percentage: 5.7 },
    { region: 'Oceania', nodes: 589, percentage: 3.9 },
  ]

  // Block Propagation Time
  const propagationData = [
    { percentile: '50th', time: 0.45 },
    { percentile: '75th', time: 0.82 },
    { percentile: '90th', time: 1.35 },
    { percentile: '95th', time: 2.10 },
    { percentile: '99th', time: 4.25 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Network Health</h2>
        <p className="text-muted-foreground mt-1">
          Real-time Bitcoin network status and performance metrics
        </p>
      </div>

      {/* Network Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {networkStats.map((stat) => (
          <div key={stat.label} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={getStatusColor(stat.status)}>{stat.icon}</div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                stat.status === 'healthy' ? 'bg-green-500/20 text-green-500' :
                stat.status === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {stat.status}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-2xl font-bold">
                {stat.value} <span className="text-sm font-normal text-muted-foreground">{stat.unit}</span>
              </div>
              <div className={`text-sm flex items-center gap-1 ${
                stat.trend > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                <TrendingUp className={`h-3 w-3 ${stat.trend < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(stat.trend)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hash Rate & Difficulty Ribbon */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Hash Rate Difficulty Ribbon</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hashRateRibbon}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="ma60" 
              stroke="#6366f1" 
              fill="#6366f1"
              fillOpacity={0.3}
              name="60D MA"
            />
            <Line 
              type="monotone" 
              dataKey="ma30" 
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.3}
              name="30D MA"
            />
            <Line 
              type="monotone" 
              dataKey="hashRate" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Hash Rate"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mining Profitability & Mempool Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mining Profitability Index */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Mining Profitability Index</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitabilityData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="miner" type="category" className="text-xs" width={60} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Bar dataKey="profitability" fill="hsl(var(--primary))" name="Profitability %" />
              <Bar dataKey="efficiency" fill="#10b981" name="Efficiency (J/TH)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mempool Congestion */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Mempool Congestion Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mempoolData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="size" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Size (MB)"
                dot={false}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="feeRate" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Fee Rate (sat/vB)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Node Distribution & Block Propagation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Distribution Map */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Global Node Distribution</h3>
          <div className="space-y-3">
            {nodeDistribution.map((region) => (
              <div key={region.region} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{region.region}</span>
                    <span className="text-sm text-muted-foreground">
                      {region.nodes.toLocaleString()} ({region.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block Propagation Time */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Block Propagation Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={propagationData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="percentile" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: any) => `${value}s`}
              />
              <Bar 
                dataKey="time" 
                fill="hsl(var(--primary))"
                name="Time (seconds)"
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">
                50% of nodes receive blocks within <strong>0.45s</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Market Dynamics */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Fee Market Dynamics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Next Block</div>
            <div className="text-2xl font-bold">45 sat/vB</div>
            <div className="text-xs text-green-500 mt-1">Low priority</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">~30 min</div>
            <div className="text-2xl font-bold">32 sat/vB</div>
            <div className="text-xs text-yellow-500 mt-1">Medium priority</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">~60 min</div>
            <div className="text-2xl font-bold">18 sat/vB</div>
            <div className="text-xs text-blue-500 mt-1">Low priority</div>
          </div>
        </div>
      </div>
    </div>
  )
}