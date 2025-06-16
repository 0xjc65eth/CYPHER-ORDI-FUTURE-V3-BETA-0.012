'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Tab, TabGroup, TabList, TabPanel, TabPanels, AreaChart, BarChart, DonutChart, Flex, Metric, Badge } from '@tremor/react'
import { RiLineChartLine, RiBarChartLine, RiPieChartLine, RiRefreshLine, RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri'

interface TechnicalIndicator {
  name: string
  value: number
  signal: 'Buy' | 'Sell' | 'Neutral'
  strength: number
  color: 'emerald' | 'rose' | 'blue' | 'amber' | 'indigo' | 'gray'
}

interface TimeframeData {
  timeframe: string
  buySignals: number
  sellSignals: number
  neutralSignals: number
}

export function TechnicalAnalysisCard() {
  const [mounted, setMounted] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
    setLastUpdated(new Date())
  }, [])

  // Simulated technical indicators data
  const technicalIndicators: Record<string, TechnicalIndicator[]> = {
    '1h': [
      { name: 'RSI', value: 62.5, signal: 'Buy', strength: 70, color: 'emerald' },
      { name: 'MACD', value: 0.25, signal: 'Buy', strength: 65, color: 'emerald' },
      { name: 'Stochastic', value: 75.3, signal: 'Buy', strength: 60, color: 'emerald' },
      { name: 'Bollinger Bands', value: 0.82, signal: 'Buy', strength: 75, color: 'emerald' },
      { name: 'Moving Average', value: 67500, signal: 'Buy', strength: 80, color: 'emerald' },
      { name: 'Ichimoku Cloud', value: 1.2, signal: 'Buy', strength: 55, color: 'emerald' },
      { name: 'ADX', value: 28.4, signal: 'Buy', strength: 60, color: 'emerald' },
      { name: 'OBV', value: 1250000, signal: 'Buy', strength: 70, color: 'emerald' },
    ],
    '4h': [
      { name: 'RSI', value: 58.2, signal: 'Neutral', strength: 50, color: 'blue' },
      { name: 'MACD', value: 0.15, signal: 'Buy', strength: 60, color: 'emerald' },
      { name: 'Stochastic', value: 65.7, signal: 'Buy', strength: 55, color: 'emerald' },
      { name: 'Bollinger Bands', value: 0.65, signal: 'Neutral', strength: 45, color: 'blue' },
      { name: 'Moving Average', value: 67200, signal: 'Buy', strength: 65, color: 'emerald' },
      { name: 'Ichimoku Cloud', value: 0.9, signal: 'Neutral', strength: 50, color: 'blue' },
      { name: 'ADX', value: 24.8, signal: 'Neutral', strength: 45, color: 'blue' },
      { name: 'OBV', value: 1150000, signal: 'Buy', strength: 60, color: 'emerald' },
    ],
    '1d': [
      { name: 'RSI', value: 45.3, signal: 'Neutral', strength: 50, color: 'blue' },
      { name: 'MACD', value: -0.05, signal: 'Sell', strength: 55, color: 'rose' },
      { name: 'Stochastic', value: 42.1, signal: 'Neutral', strength: 45, color: 'blue' },
      { name: 'Bollinger Bands', value: 0.35, signal: 'Sell', strength: 60, color: 'rose' },
      { name: 'Moving Average', value: 66800, signal: 'Neutral', strength: 50, color: 'blue' },
      { name: 'Ichimoku Cloud', value: 0.5, signal: 'Sell', strength: 65, color: 'rose' },
      { name: 'ADX', value: 18.5, signal: 'Neutral', strength: 40, color: 'blue' },
      { name: 'OBV', value: 980000, signal: 'Sell', strength: 55, color: 'rose' },
    ],
    '1w': [
      { name: 'RSI', value: 72.8, signal: 'Sell', strength: 65, color: 'rose' },
      { name: 'MACD', value: 0.35, signal: 'Buy', strength: 70, color: 'emerald' },
      { name: 'Stochastic', value: 82.4, signal: 'Sell', strength: 60, color: 'rose' },
      { name: 'Bollinger Bands', value: 0.92, signal: 'Sell', strength: 55, color: 'rose' },
      { name: 'Moving Average', value: 68500, signal: 'Buy', strength: 75, color: 'emerald' },
      { name: 'Ichimoku Cloud', value: 1.5, signal: 'Buy', strength: 65, color: 'emerald' },
      { name: 'ADX', value: 32.7, signal: 'Buy', strength: 70, color: 'emerald' },
      { name: 'OBV', value: 1450000, signal: 'Buy', strength: 80, color: 'emerald' },
    ],
  }

  // Calculate summary data
  const calculateSummaryData = (timeframe: string) => {
    const indicators = technicalIndicators[timeframe]
    const buyCount = indicators.filter(i => i.signal === 'Buy').length
    const sellCount = indicators.filter(i => i.signal === 'Sell').length
    const neutralCount = indicators.filter(i => i.signal === 'Neutral').length

    const totalStrength = indicators.reduce((sum, i) => sum + i.strength, 0)
    const buyStrength = indicators.filter(i => i.signal === 'Buy').reduce((sum, i) => sum + i.strength, 0)
    const sellStrength = indicators.filter(i => i.signal === 'Sell').reduce((sum, i) => sum + i.strength, 0)

    const overallSignal = buyStrength > sellStrength
      ? 'Buy'
      : sellStrength > buyStrength
        ? 'Sell'
        : 'Neutral'

    const signalStrength = Math.round((Math.max(buyStrength, sellStrength) / totalStrength) * 100)

    return {
      buyCount,
      sellCount,
      neutralCount,
      overallSignal,
      signalStrength
    }
  }

  // Chart data
  const signalDistributionData = [
    { timeframe: '1h', buySignals: 7, sellSignals: 0, neutralSignals: 1 },
    { timeframe: '4h', buySignals: 4, sellSignals: 0, neutralSignals: 4 },
    { timeframe: '1d', buySignals: 0, sellSignals: 4, neutralSignals: 4 },
    { timeframe: '1w', buySignals: 5, sellSignals: 3, neutralSignals: 0 },
  ]

  const donutChartData = [
    { name: 'Buy Signals', value: signalDistributionData.find(d => d.timeframe === selectedTimeframe)?.buySignals || 0 },
    { name: 'Sell Signals', value: signalDistributionData.find(d => d.timeframe === selectedTimeframe)?.sellSignals || 0 },
    { name: 'Neutral Signals', value: signalDistributionData.find(d => d.timeframe === selectedTimeframe)?.neutralSignals || 0 },
  ]

  // Trend strength over time
  const trendStrengthData = [
    { date: '2023-12-01', strength: 45 },
    { date: '2023-12-15', strength: 52 },
    { date: '2024-01-01', strength: 58 },
    { date: '2024-01-15', strength: 65 },
    { date: '2024-02-01', strength: 72 },
    { date: '2024-02-15', strength: 68 },
    { date: '2024-03-01', strength: 75 },
    { date: '2024-03-15', strength: 82 },
    { date: '2024-04-01', strength: 78 },
    { date: '2024-04-15', strength: 85 },
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

  // Return null during SSR to avoid hydration issues
  if (!mounted) return null

  const summary = calculateSummaryData(selectedTimeframe)

  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
            <RiLineChartLine className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Title className="text-white text-xl">Technical Analysis</Title>
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

      {/* Summary */}
      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <Text className="text-gray-400 mb-1">Overall Signal</Text>
            <div className="flex items-center">
              <Badge
                color={summary.overallSignal === 'Buy' ? 'emerald' : summary.overallSignal === 'Sell' ? 'rose' : 'blue'}
                size="xl"
              >
                <div className="flex items-center">
                  {summary.overallSignal === 'Buy' ? (
                    <RiArrowUpSLine className="mr-1" />
                  ) : summary.overallSignal === 'Sell' ? (
                    <RiArrowDownSLine className="mr-1" />
                  ) : null}
                  <span className="font-bold">{summary.overallSignal}</span>
                </div>
              </Badge>
              <Text className="ml-2 text-white">Strength: {summary.signalStrength}%</Text>
            </div>
          </div>
          <div className="text-right">
            <Text className="text-gray-400 mb-1">Signal Distribution</Text>
            <div className="flex space-x-3">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
                <Text className="text-white">{summary.buyCount} Buy</Text>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-rose-500 mr-1"></div>
                <Text className="text-white">{summary.sellCount} Sell</Text>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                <Text className="text-white">{summary.neutralCount} Neutral</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe tabs */}
      <TabGroup className="mb-6" onIndexChange={(index) => {
        const timeframes = ['1h', '4h', '1d', '1w']
        setSelectedTimeframe(timeframes[index])
      }}>
        <TabList variant="solid" className="bg-blue-500/10">
          <Tab className="text-sm data-[selected]:bg-blue-500/30">1 Hour</Tab>
          <Tab className="text-sm data-[selected]:bg-blue-500/30">4 Hours</Tab>
          <Tab className="text-sm data-[selected]:bg-blue-500/30">1 Day</Tab>
          <Tab className="text-sm data-[selected]:bg-blue-500/30">1 Week</Tab>
        </TabList>
      </TabGroup>

      {/* Indicators grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {technicalIndicators[selectedTimeframe].map((indicator, index) => (
          <div key={index} className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <Text className="text-gray-400 text-xs">{indicator.name}</Text>
            <div className="flex justify-between items-center mt-1">
              <Metric className="text-white text-lg">{indicator.value.toLocaleString()}</Metric>
              <Badge color={indicator.color} size="xs">
                {indicator.signal}
              </Badge>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
              <div
                className={`h-1 rounded-full`}
                style={{
                  width: `${indicator.strength}%`,
                  backgroundColor: indicator.color === 'emerald' ? '#10B981' :
                                  indicator.color === 'rose' ? '#F43F5E' :
                                  indicator.color === 'blue' ? '#3B82F6' :
                                  indicator.color === 'amber' ? '#F59E0B' :
                                  indicator.color === 'indigo' ? '#6366F1' : '#9CA3AF'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center mb-3">
            <RiBarChartLine className="w-4 h-4 text-blue-400 mr-2" />
            <Text className="text-white font-medium">Signal Distribution by Timeframe</Text>
          </div>
          <BarChart
            data={signalDistributionData}
            index="timeframe"
            categories={["buySignals", "sellSignals", "neutralSignals"]}
            colors={["emerald", "rose", "blue"]}
            valueFormatter={(value) => `${value} signals`}
            stack={false}
            className="h-64"
          />
        </div>
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center mb-3">
            <RiPieChartLine className="w-4 h-4 text-blue-400 mr-2" />
            <Text className="text-white font-medium">Current Timeframe Signal Distribution</Text>
          </div>
          <DonutChart
            data={donutChartData}
            category="value"
            index="name"
            colors={["emerald", "rose", "blue"]}
            valueFormatter={(value) => `${value} signals`}
            className="h-64"
          />
        </div>
      </div>

      {/* Trend strength over time */}
      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mt-6">
        <div className="flex items-center mb-3">
          <RiLineChartLine className="w-4 h-4 text-blue-400 mr-2" />
          <Text className="text-white font-medium">Trend Strength Over Time</Text>
        </div>
        <AreaChart
          data={trendStrengthData}
          index="date"
          categories={["strength"]}
          colors={["blue"]}
          valueFormatter={(value) => `${value}%`}
          showLegend={false}
          className="h-64"
        />
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
        <Text className="text-xs text-rose-300 font-bold">RISK DISCLAIMER:</Text>
        <Text className="text-xs text-gray-400 mt-1">
          Technical analysis indicators are based on historical data and should not be considered as financial advice.
          Past performance is not indicative of future results. Always conduct your own research before making investment decisions.
        </Text>
      </div>
    </Card>
  )
}

export default TechnicalAnalysisCard
