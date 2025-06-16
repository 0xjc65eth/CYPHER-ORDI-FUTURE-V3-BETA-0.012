'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, LineChart, BarChart, Flex, Metric, Badge, Tab, TabGroup, TabList } from '@tremor/react'
import { RiDatabase2Line, RiRefreshLine, RiArrowUpSLine, RiArrowDownSLine, RiInformationLine } from 'react-icons/ri'

interface OnChainMetric {
  name: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  color: 'emerald' | 'rose' | 'blue' | 'amber' | 'indigo' | 'gray'
  description: string
}

export function OnChainMetricsCard() {
  const [mounted, setMounted] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('nvt')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
    setLastUpdated(new Date())
  }, [])

  // Simulated on-chain metrics data
  const onChainMetrics: Record<string, OnChainMetric> = {
    'nvt': {
      name: 'NVT Ratio',
      value: 24.8,
      change: -3.2,
      trend: 'down',
      color: 'emerald',
      description: 'Network Value to Transactions Ratio - measures the dollar value of crypto transaction activity relative to network value'
    },
    'sopr': {
      name: 'SOPR',
      value: 1.05,
      change: 2.1,
      trend: 'up',
      color: 'emerald',
      description: 'Spent Output Profit Ratio - ratio of price sold to price paid for all coins moved on-chain'
    },
    'difficulty': {
      name: 'Mining Difficulty',
      value: 78.32,
      change: 5.7,
      trend: 'up',
      color: 'amber',
      description: 'Current Bitcoin mining difficulty in trillions - higher values indicate more computing power on the network'
    },
    'hashrate': {
      name: 'Hash Rate',
      value: 542.6,
      change: 4.2,
      trend: 'up',
      color: 'emerald',
      description: 'Estimated hash rate in exahashes per second (EH/s) - measures the processing power of the Bitcoin network'
    },
    'active': {
      name: 'Active Addresses',
      value: 1.24,
      change: 8.5,
      trend: 'up',
      color: 'emerald',
      description: 'Number of unique addresses active in the network (in millions) - indicates user engagement'
    },
    'fees': {
      name: 'Average Fee',
      value: 12.85,
      change: 15.3,
      trend: 'up',
      color: 'rose',
      description: 'Average transaction fee in USD - higher fees indicate network congestion'
    },
    'supply': {
      name: 'Circulating Supply',
      value: 19.68,
      change: 0.2,
      trend: 'up',
      color: 'blue',
      description: 'Current circulating supply of Bitcoin in millions - approaches the 21 million maximum'
    },
    'exchange': {
      name: 'Exchange Reserves',
      value: 2.34,
      change: -1.8,
      trend: 'down',
      color: 'emerald',
      description: 'Bitcoin held on exchanges in millions - decreasing reserves often indicate accumulation and reduced selling pressure'
    },
  }

  // Historical data for charts
  const historicalData: Record<string, { date: string, value: number }[]> = {
    'nvt': [
      { date: '2023-10-01', value: 32.5 },
      { date: '2023-11-01', value: 30.2 },
      { date: '2023-12-01', value: 28.7 },
      { date: '2024-01-01', value: 27.3 },
      { date: '2024-02-01', value: 26.1 },
      { date: '2024-03-01', value: 25.4 },
      { date: '2024-04-01', value: 24.8 },
    ],
    'sopr': [
      { date: '2023-10-01', value: 0.92 },
      { date: '2023-11-01', value: 0.95 },
      { date: '2023-12-01', value: 0.98 },
      { date: '2024-01-01', value: 1.01 },
      { date: '2024-02-01', value: 1.03 },
      { date: '2024-03-01', value: 1.04 },
      { date: '2024-04-01', value: 1.05 },
    ],
    'difficulty': [
      { date: '2023-10-01', value: 55.62 },
      { date: '2023-11-01', value: 61.45 },
      { date: '2023-12-01', value: 66.78 },
      { date: '2024-01-01', value: 70.34 },
      { date: '2024-02-01', value: 72.56 },
      { date: '2024-03-01', value: 75.89 },
      { date: '2024-04-01', value: 78.32 },
    ],
    'hashrate': [
      { date: '2023-10-01', value: 420.5 },
      { date: '2023-11-01', value: 452.3 },
      { date: '2023-12-01', value: 478.6 },
      { date: '2024-01-01', value: 495.2 },
      { date: '2024-02-01', value: 512.7 },
      { date: '2024-03-01', value: 528.4 },
      { date: '2024-04-01', value: 542.6 },
    ],
    'active': [
      { date: '2023-10-01', value: 0.95 },
      { date: '2023-11-01', value: 1.02 },
      { date: '2023-12-01', value: 1.08 },
      { date: '2024-01-01', value: 1.12 },
      { date: '2024-02-01', value: 1.15 },
      { date: '2024-03-01', value: 1.19 },
      { date: '2024-04-01', value: 1.24 },
    ],
    'fees': [
      { date: '2023-10-01', value: 5.25 },
      { date: '2023-11-01', value: 6.78 },
      { date: '2023-12-01', value: 8.45 },
      { date: '2024-01-01', value: 9.32 },
      { date: '2024-02-01', value: 10.56 },
      { date: '2024-03-01', value: 11.24 },
      { date: '2024-04-01', value: 12.85 },
    ],
    'supply': [
      { date: '2023-10-01', value: 19.52 },
      { date: '2023-11-01', value: 19.55 },
      { date: '2023-12-01', value: 19.58 },
      { date: '2024-01-01', value: 19.61 },
      { date: '2024-02-01', value: 19.64 },
      { date: '2024-03-01', value: 19.66 },
      { date: '2024-04-01', value: 19.68 },
    ],
    'exchange': [
      { date: '2023-10-01', value: 2.58 },
      { date: '2023-11-01', value: 2.52 },
      { date: '2023-12-01', value: 2.48 },
      { date: '2024-01-01', value: 2.45 },
      { date: '2024-02-01', value: 2.41 },
      { date: '2024-03-01', value: 2.38 },
      { date: '2024-04-01', value: 2.34 },
    ],
  }

  // Transaction volume data
  const transactionVolumeData = [
    { date: '2023-10-01', volume: 245.8 },
    { date: '2023-10-15', volume: 268.3 },
    { date: '2023-11-01', volume: 285.6 },
    { date: '2023-11-15', volume: 312.4 },
    { date: '2023-12-01', volume: 342.7 },
    { date: '2023-12-15', volume: 378.5 },
    { date: '2024-01-01', volume: 405.2 },
    { date: '2024-01-15', volume: 425.8 },
    { date: '2024-02-01', volume: 452.3 },
    { date: '2024-02-15', volume: 478.6 },
    { date: '2024-03-01', volume: 512.4 },
    { date: '2024-03-15', volume: 545.7 },
    { date: '2024-04-01', volume: 582.3 },
    { date: '2024-04-15', volume: 615.8 },
  ]

  // Refresh data
  const refreshData = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setLastUpdated(new Date())
    }, 1000)
  }

  // Format value based on metric
  const formatValue = (metric: string, value: number) => {
    switch(metric) {
      case 'nvt':
      case 'sopr':
        return value.toFixed(2)
      case 'difficulty':
        return `${value.toFixed(2)}T`
      case 'hashrate':
        return `${value.toFixed(1)} EH/s`
      case 'active':
      case 'supply':
      case 'exchange':
        return `${value.toFixed(2)}M`
      case 'fees':
        return `$${value.toFixed(2)}`
      default:
        return value.toString()
    }
  }

  // Return null during SSR to avoid hydration issues
  if (!mounted) return null

  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
            <RiDatabase2Line className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Title className="text-white text-xl">On-Chain Metrics</Title>
            <Text className="text-xs text-gray-400">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </Text>
          </div>
        </div>
        <button
          onClick={refreshData}
          className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30"
          disabled={isLoading}
        >
          <RiRefreshLine className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(onChainMetrics).map(([key, metric]) => (
          <div
            key={key}
            className={`bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 cursor-pointer transition-colors ${selectedMetric === key ? 'border-blue-400' : 'hover:border-blue-400/50'}`}
            onClick={() => setSelectedMetric(key)}
          >
            <div className="flex justify-between items-start">
              <Text className="text-gray-400 text-xs flex items-center">
                {metric.name}
                <button
                  className="ml-1 text-gray-500 hover:text-blue-400"
                  onMouseEnter={() => setShowTooltip(key)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <RiInformationLine className="w-3 h-3" />
                </button>
              </Text>
              <Badge
                color={metric.trend === 'up' ? (metric.color === 'rose' ? 'rose' : 'emerald') : metric.trend === 'down' ? (metric.color === 'emerald' ? 'emerald' : 'rose') : 'blue'}
                size="xs"
              >
                <div className="flex items-center">
                  {metric.trend === 'up' ? (
                    <RiArrowUpSLine className="mr-0.5" />
                  ) : metric.trend === 'down' ? (
                    <RiArrowDownSLine className="mr-0.5" />
                  ) : null}
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
              </Badge>
            </div>
            <Metric className="text-white text-lg mt-1">{formatValue(key, metric.value)}</Metric>
            {showTooltip === key && (
              <div className="absolute z-10 bg-gray-800 text-white text-xs p-2 rounded shadow-lg max-w-xs mt-1">
                {metric.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected metric chart */}
      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <Text className="text-white font-medium">{onChainMetrics[selectedMetric].name} - Historical Trend</Text>
          <Badge color={onChainMetrics[selectedMetric].color}>
            {onChainMetrics[selectedMetric].trend === 'up' ? 'Increasing' : onChainMetrics[selectedMetric].trend === 'down' ? 'Decreasing' : 'Stable'}
          </Badge>
        </div>
        <LineChart
          data={historicalData[selectedMetric]}
          index="date"
          categories={["value"]}
          colors={[onChainMetrics[selectedMetric].color]}
          valueFormatter={(value) => formatValue(selectedMetric, value)}
          showLegend={false}
          className="h-64"
        />
        <Text className="text-xs text-gray-400 mt-2">
          {onChainMetrics[selectedMetric].description}
        </Text>
      </div>

      {/* Transaction volume chart */}
      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
        <Text className="text-white font-medium mb-3">Bitcoin Daily Transaction Volume (BTC)</Text>
        <BarChart
          data={transactionVolumeData}
          index="date"
          categories={["volume"]}
          colors={["amber"]}
          valueFormatter={(value) => `${value.toLocaleString()} BTC`}
          showLegend={false}
          className="h-64"
        />
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Text className="text-xs text-blue-300 font-bold">INFORMATION:</Text>
        <Text className="text-xs text-gray-400 mt-1">
          On-chain metrics provide insights into blockchain activity and network health. These metrics can help identify trends and market sentiment, but should be used alongside other analysis methods for a complete picture.
        </Text>
      </div>
    </Card>
  )
}

export default OnChainMetricsCard
