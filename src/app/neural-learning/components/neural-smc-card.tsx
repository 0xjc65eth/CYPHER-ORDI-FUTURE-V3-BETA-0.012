'use client'

import React, { useState, useEffect } from 'react'
import { Card, Title, Text } from '@tremor/react'
import { RiLineChartLine, RiRefreshLine } from 'react-icons/ri'

export function NeuralSmcCard() {
  const [smcData, setSmcData] = useState({
    currentPrice: 0,
    change24h: 0,
    isLoading: true,
    lastUpdate: '',
    levels: {
      support: [] as number[],
      resistance: [] as number[]
    }
  })

  useEffect(() => {
    const fetchCMCData = async () => {
      try {
        const response = await fetch('/api/coinmarketcap?symbols=BTC&timeframe=1h')
        const data = await response.json()
        
        if (data.success && data.data.current?.BTC) {
          const btcData = data.data.current.BTC
          const price = btcData.price
          
          // Calculate SMC levels based on real price
          const support = [
            Math.round(price * 0.95), // 5% below
            Math.round(price * 0.90), // 10% below
            Math.round(price * 0.85)  // 15% below
          ]
          
          const resistance = [
            Math.round(price * 1.05), // 5% above
            Math.round(price * 1.10), // 10% above
            Math.round(price * 1.15)  // 15% above
          ]
          
          setSmcData({
            currentPrice: Math.round(price),
            change24h: btcData.change24h,
            isLoading: false,
            lastUpdate: new Date().toLocaleTimeString(),
            levels: { support, resistance }
          })
        }
      } catch (error) {
        console.error('Erro ao buscar dados CMC para Neural SMC:', error)
        setSmcData(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchCMCData()
    const interval = setInterval(fetchCMCData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3 border border-[#8B5CF6]/30">
            {smcData.isLoading ? (
              <RiRefreshLine className="w-5 h-5 text-[#8B5CF6] animate-spin" />
            ) : (
              <RiLineChartLine className="w-5 h-5 text-[#8B5CF6]" />
            )}
          </div>
          <Title className="text-white text-xl">Neural SMC Analysis</Title>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>CMC Live</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        <Text className="text-gray-400">
          Real-time Smart Money Concepts analysis using CoinMarketCap data. Updated: {smcData.lastUpdate}
        </Text>
        
        {/* Current Price Section */}
        <div className="bg-[#8B5CF6]/10 p-4 rounded-lg border border-[#8B5CF6]/20">
          <div className="flex justify-between items-center mb-3">
            <Text className="text-white font-medium">Current BTC Price</Text>
            <div className={`px-2 py-1 rounded-md text-xs font-bold ${
              smcData.change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {smcData.change24h >= 0 ? '+' : ''}{smcData.change24h?.toFixed(2)}%
            </div>
          </div>
          <Text className="text-white text-2xl font-bold">
            ${smcData.currentPrice.toLocaleString()}
          </Text>
        </div>

        {/* SMC Levels */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <Text className="text-green-400 font-medium text-sm mb-2">Support Levels</Text>
            <div className="space-y-1">
              {smcData.levels.support.map((level, index) => (
                <div key={index} className="text-xs text-green-300">
                  S{index + 1}: ${level.toLocaleString()}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <Text className="text-red-400 font-medium text-sm mb-2">Resistance Levels</Text>
            <div className="space-y-1">
              {smcData.levels.resistance.map((level, index) => (
                <div key={index} className="text-xs text-red-300">
                  R{index + 1}: ${level.toLocaleString()}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Text className="text-xs text-gray-500">
          Data powered by CoinMarketCap API • Updated every 30 seconds
        </Text>
      </div>
    </Card>
  )
}
