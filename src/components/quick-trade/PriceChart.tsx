'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Clock,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PricePoint {
  timestamp: number
  price: number
  volume: number
}

interface PriceChartProps {
  tokenAddress: string
  tokenSymbol: string
  chainId: number
  isExpanded?: boolean
  onToggleExpand?: () => void
  height?: number
  showControls?: boolean
}

const PriceChart: React.FC<PriceChartProps> = ({
  tokenAddress,
  tokenSymbol,
  chainId,
  isExpanded = false,
  onToggleExpand,
  height = 300,
  showControls = true
}) => {
  const [timeFrame, setTimeFrame] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [chartType, setChartType] = useState<'price' | 'volume'>('price')
  const [priceData, setPriceData] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [priceChange, setPriceChange] = useState<number>(0)

  // Generate mock price data
  const generatePriceData = (timeframe: string): PricePoint[] => {
    const now = Date.now()
    const intervals = {
      '1h': { points: 60, interval: 60000 }, // 1 minute intervals
      '24h': { points: 144, interval: 600000 }, // 10 minute intervals
      '7d': { points: 168, interval: 3600000 }, // 1 hour intervals
      '30d': { points: 120, interval: 21600000 } // 6 hour intervals
    }

    const config = intervals[timeframe as keyof typeof intervals]
    const data: PricePoint[] = []

    // Base price for different tokens
    const basePrices: Record<string, number> = {
      'ETH': 2350,
      'SOL': 98.76,
      'USDC': 1.0,
      'USDT': 1.0,
      'GOODS': 0.0024,
      'DOG': 0.0018
    }

    let basePrice = basePrices[tokenSymbol] || 100
    let price = basePrice

    // Generate realistic price movement
    for (let i = config.points; i >= 0; i--) {
      const timestamp = now - (i * config.interval)
      
      // Add some volatility based on token type
      const volatility = tokenSymbol.includes('USD') ? 0.001 : 0.02
      const change = (Math.random() - 0.5) * volatility
      price = price * (1 + change)
      
      // Keep stablecoins stable
      if (tokenSymbol.includes('USD')) {
        price = basePrice + (Math.random() - 0.5) * 0.01
      }

      const volume = Math.random() * 1000000 + 100000

      data.push({
        timestamp,
        price: Math.max(price, 0.0001), // Minimum price
        volume
      })
    }

    return data
  }

  // Load price data
  useEffect(() => {
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const data = generatePriceData(timeFrame)
      setPriceData(data)
      
      if (data.length > 0) {
        const latest = data[data.length - 1]
        const previous = data[0]
        setCurrentPrice(latest.price)
        setPriceChange(((latest.price - previous.price) / previous.price) * 100)
      }
      
      setLoading(false)
    }, 500)
  }, [tokenAddress, timeFrame, tokenSymbol])

  // Calculate chart dimensions
  const chartData = useMemo(() => {
    if (priceData.length === 0) return []

    const values = priceData.map(d => chartType === 'price' ? d.price : d.volume)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const range = maxValue - minValue || 1

    return priceData.map((point, index) => {
      const value = chartType === 'price' ? point.price : point.volume
      const x = (index / (priceData.length - 1)) * 100
      const y = 100 - ((value - minValue) / range) * 100

      return { x, y, value, timestamp: point.timestamp }
    })
  }, [priceData, chartType])

  // Create SVG path
  const pathData = useMemo(() => {
    if (chartData.length === 0) return ''
    
    const path = chartData.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${acc} ${command} ${point.x} ${point.y}`
    }, '')
    
    return path
  }, [chartData])

  // Create area fill path
  const areaPath = useMemo(() => {
    if (chartData.length === 0) return ''
    
    const linePath = pathData
    const firstPoint = chartData[0]
    const lastPoint = chartData[chartData.length - 1]
    
    return `${linePath} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`
  }, [pathData, chartData])

  // Format price
  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Format volume
  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  // Format time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    if (timeFrame === '1h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (timeFrame === '24h') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (timeFrame === '7d') return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                {tokenSymbol} Price Chart
                {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
              </CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-bold text-slate-200">
                  {formatPrice(currentPrice)}
                </span>
                <Badge 
                  variant="outline" 
                  className={`${priceChange >= 0 ? 'text-green-400 border-green-500/20' : 'text-red-400 border-red-500/20'}`}
                >
                  {priceChange >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {priceChange.toFixed(2)}%
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showControls && (
              <>
                <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)}>
                  <TabsList className="bg-slate-700 h-8">
                    <TabsTrigger value="price" className="text-xs">Price</TabsTrigger>
                    <TabsTrigger value="volume" className="text-xs">Volume</TabsTrigger>
                  </TabsList>
                </Tabs>

                <Tabs value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)}>
                  <TabsList className="bg-slate-700 h-8">
                    <TabsTrigger value="1h" className="text-xs">1H</TabsTrigger>
                    <TabsTrigger value="24h" className="text-xs">24H</TabsTrigger>
                    <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
                    <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
                  </TabsList>
                </Tabs>

                {onToggleExpand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleExpand}
                    className="text-slate-400 hover:text-slate-300 h-8 w-8 p-0"
                  >
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative" style={{ height }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            </div>
          ) : (
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0"
            >
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgb(71 85 105)" strokeOpacity="0.1" strokeWidth="0.1" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />

              {/* Area fill */}
              <path
                d={areaPath}
                fill="url(#gradient)"
                fillOpacity="0.2"
              />

              {/* Price line */}
              <path
                d={pathData}
                fill="none"
                stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={priceChange >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Data points */}
              {chartData.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="0.2"
                  fill={priceChange >= 0 ? '#10b981' : '#ef4444'}
                  className="opacity-0 hover:opacity-100 transition-opacity"
                >
                  <title>
                    {formatTime(point.timestamp)}: {
                      chartType === 'price' ? formatPrice(point.value) : formatVolume(point.value)
                    }
                  </title>
                </circle>
              ))}
            </svg>
          )}

          {/* Chart overlay info */}
          {!loading && chartData.length > 0 && (
            <div className="absolute top-2 left-2 text-xs text-slate-400">
              {chartType === 'price' ? (
                <div>
                  <div>High: {formatPrice(Math.max(...priceData.map(d => d.price)))}</div>
                  <div>Low: {formatPrice(Math.min(...priceData.map(d => d.price)))}</div>
                </div>
              ) : (
                <div>
                  <div>Avg Vol: {formatVolume(priceData.reduce((sum, d) => sum + d.volume, 0) / priceData.length)}</div>
                  <div>Total: {formatVolume(priceData.reduce((sum, d) => sum + d.volume, 0))}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Time labels */}
        {!loading && chartData.length > 0 && (
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{formatTime(chartData[0].timestamp)}</span>
            <span>{formatTime(chartData[Math.floor(chartData.length / 2)].timestamp)}</span>
            <span>{formatTime(chartData[chartData.length - 1].timestamp)}</span>
          </div>
        )}

        {/* Additional stats */}
        {!loading && priceData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
            <div className="text-center">
              <div className="text-xs text-slate-400">24h Volume</div>
              <div className="text-sm font-semibold text-slate-300">
                {formatVolume(priceData.reduce((sum, d) => sum + d.volume, 0))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Market Cap</div>
              <div className="text-sm font-semibold text-slate-300">
                {formatVolume(currentPrice * 1000000)} {/* Mock market cap */}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Volatility</div>
              <div className="text-sm font-semibold text-slate-300">
                {Math.abs(priceChange).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PriceChart