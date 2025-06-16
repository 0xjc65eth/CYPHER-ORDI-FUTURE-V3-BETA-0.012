'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, BarChart } from '@tremor/react'
import { RiLineChartLine, RiExchangeLine, RiTimeLine } from 'react-icons/ri'
import { useTradingData } from '@/hooks/useTradingData'

export function TradingVolumeCard() {
  const [mounted, setMounted] = useState(false)
  
  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data for trading volume
  const volumeData = [
    { exchange: 'Binance', volume: 1250000000, color: 'yellow' },
    { exchange: 'Coinbase', volume: 850000000, color: 'blue' },
    { exchange: 'OKX', volume: 620000000, color: 'cyan' },
    { exchange: 'Bybit', volume: 580000000, color: 'violet' },
    { exchange: 'Kraken', volume: 320000000, color: 'purple' },
    { exchange: 'Bitfinex', volume: 280000000, color: 'green' },
  ]

  // Format volume for display
  const formatVolume = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`
    }
    return `$${value}`
  }

  if (!mounted) return null

  return (
    <Card className="bg-gradient-to-br from-[#1D2D3D] to-[#2D3D4D] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
            <RiExchangeLine className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Title className="text-white text-xl">Exchange Volume (24h)</Title>
            <Text className="text-xs text-gray-400">
              Top exchanges by trading volume
            </Text>
          </div>
        </div>
        <div className="flex items-center">
          <RiTimeLine className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-xs text-gray-400">Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="mt-4">
        <BarChart
          data={volumeData}
          index="exchange"
          categories={["volume"]}
          colors={["blue"]}
          valueFormatter={formatVolume}
          showLegend={false}
          showGridLines={false}
          showAnimation={true}
          className="h-60"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {volumeData.map((item, index) => (
          <div key={index} className="bg-blue-500/10 rounded-lg p-2 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <Text className="text-sm font-medium text-white">{item.exchange}</Text>
              <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
            </div>
            <Text className="text-xs text-blue-400 font-bold">{formatVolume(item.volume)}</Text>
          </div>
        ))}
      </div>
    </Card>
  )
}
