'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, ProgressBar } from '@tremor/react'
import { RiLineChartLine, RiExchangeLine, RiTimeLine, RiArrowUpSLine, RiArrowDownSLine } from 'react-icons/ri'

export function BitcoinEtfCard() {
  const [mounted, setMounted] = useState(false)
  
  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data for Bitcoin ETFs
  const etfData = [
    { 
      name: 'IBIT', 
      issuer: 'BlackRock', 
      aum: 17850000000, 
      dailyFlow: 125000000, 
      dailyFlowPercent: 0.7, 
      trend: 'up',
      holdings: 198500,
      fee: 0.25
    },
    { 
      name: 'FBTC', 
      issuer: 'Fidelity', 
      aum: 9250000000, 
      dailyFlow: 85000000, 
      dailyFlowPercent: 0.92, 
      trend: 'up',
      holdings: 102800,
      fee: 0.25
    },
    { 
      name: 'ARKB', 
      issuer: 'ARK Invest', 
      aum: 1250000000, 
      dailyFlow: -15000000, 
      dailyFlowPercent: -1.2, 
      trend: 'down',
      holdings: 13900,
      fee: 0.21
    },
    { 
      name: 'BITB', 
      issuer: 'Bitwise', 
      aum: 1850000000, 
      dailyFlow: 22000000, 
      dailyFlowPercent: 1.19, 
      trend: 'up',
      holdings: 20600,
      fee: 0.20
    },
    { 
      name: 'GBTC', 
      issuer: 'Grayscale', 
      aum: 21500000000, 
      dailyFlow: -85000000, 
      dailyFlowPercent: -0.4, 
      trend: 'down',
      holdings: 239000,
      fee: 1.5
    },
  ]

  // Format AUM for display
  const formatAUM = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return `$${value}`
  }

  // Format flow for display
  const formatFlow = (value: number) => {
    const prefix = value >= 0 ? '+' : ''
    if (Math.abs(value) >= 1000000000) {
      return `${prefix}$${(value / 1000000000).toFixed(1)}B`
    } else if (Math.abs(value) >= 1000000) {
      return `${prefix}$${(value / 1000000).toFixed(1)}M`
    }
    return `${prefix}$${value}`
  }

  // Calculate total AUM
  const totalAUM = etfData.reduce((sum, etf) => sum + etf.aum, 0)
  
  // Calculate total daily flow
  const totalDailyFlow = etfData.reduce((sum, etf) => sum + etf.dailyFlow, 0)
  
  // Calculate total BTC holdings
  const totalHoldings = etfData.reduce((sum, etf) => sum + etf.holdings, 0)

  if (!mounted) return null

  return (
    <Card className="bg-gradient-to-br from-[#1A1A3A] to-[#2A2A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-3 border border-amber-500/30">
            <RiExchangeLine className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <Title className="text-white text-xl">Bitcoin ETF Tracker</Title>
            <Text className="text-xs text-gray-400">
              Spot ETF flows and holdings
            </Text>
          </div>
        </div>
        <div className="flex items-center">
          <RiTimeLine className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-xs text-gray-400">Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
          <Text className="text-xs text-amber-300">Total AUM</Text>
          <Text className="text-lg font-bold text-white">{formatAUM(totalAUM)}</Text>
        </div>
        <div className={`${totalDailyFlow >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} rounded-lg p-3 border`}>
          <Text className="text-xs text-gray-300">Daily Flow</Text>
          <div className="flex items-center">
            {totalDailyFlow >= 0 ? (
              <RiArrowUpSLine className="w-4 h-4 text-emerald-400 mr-1" />
            ) : (
              <RiArrowDownSLine className="w-4 h-4 text-rose-400 mr-1" />
            )}
            <Text className={`text-lg font-bold ${totalDailyFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatFlow(totalDailyFlow)}
            </Text>
          </div>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
          <Text className="text-xs text-blue-300">Total BTC</Text>
          <Text className="text-lg font-bold text-white">{totalHoldings.toLocaleString()} BTC</Text>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        {etfData.map((etf, index) => (
          <div key={index} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Text className="text-sm font-bold text-white">{etf.name}</Text>
                <Text className="text-xs text-gray-400 ml-2">({etf.issuer})</Text>
              </div>
              <div className="flex items-center">
                <Text className="text-xs text-gray-400 mr-2">Fee: {etf.fee}%</Text>
                <Text className="text-sm font-bold text-white">{formatAUM(etf.aum)}</Text>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs mb-1">
              <Text className="text-gray-400">{etf.holdings.toLocaleString()} BTC</Text>
              <div className="flex items-center">
                {etf.trend === 'up' ? (
                  <RiArrowUpSLine className="w-3 h-3 text-emerald-400 mr-1" />
                ) : (
                  <RiArrowDownSLine className="w-3 h-3 text-rose-400 mr-1" />
                )}
                <Text className={`${etf.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatFlow(etf.dailyFlow)} ({etf.dailyFlowPercent > 0 ? '+' : ''}{etf.dailyFlowPercent.toFixed(2)}%)
                </Text>
              </div>
            </div>
            
            <ProgressBar 
              value={Math.abs(etf.aum / totalAUM * 100)} 
              color={etf.trend === 'up' ? 'emerald' : 'rose'} 
              className="mt-1" 
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
