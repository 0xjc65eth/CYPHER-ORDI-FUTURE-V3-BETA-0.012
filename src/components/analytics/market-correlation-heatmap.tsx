'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Select, SelectItem, Grid, Col } from '@tremor/react'
import { RiDashboardLine, RiRefreshLine, RiInformationLine } from 'react-icons/ri'

interface CorrelationData {
  assets: string[]
  correlationMatrix: number[][]
  timeframe: string
  lastUpdated: Date
}

export function MarketCorrelationHeatmap() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeframe, setTimeframe] = useState('30d')
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{i: number, j: number} | null>(null)

  // Avoid hydration issues
  useEffect(() => {
    setMounted(true)
    generateCorrelationData(timeframe)
  }, [])

  // Generate correlation data based on timeframe
  const generateCorrelationData = (selectedTimeframe: string) => {
    setIsLoading(true)
    
    // Simulated assets
    const assets = [
      'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 
      'DOGE', 'ADA', 'AVAX', 'DOT', 'LINK',
      'MATIC', 'UNI', 'SHIB', 'LTC', 'BCH'
    ]
    
    // Generate random correlation matrix with realistic values
    const matrix: number[][] = []
    
    for (let i = 0; i < assets.length; i++) {
      const row: number[] = []
      
      for (let j = 0; j < assets.length; j++) {
        if (i === j) {
          // Perfect correlation with self
          row.push(1)
        } else if (matrix[j] && matrix[j][i] !== undefined) {
          // Use symmetric value
          row.push(matrix[j][i])
        } else {
          // Generate realistic correlation
          let baseCorrelation = 0
          
          // BTC tends to have high correlation with most crypto
          if (i === 0 || j === 0) {
            baseCorrelation = 0.6
          } 
          // ETH also has high correlation with many assets
          else if (i === 1 || j === 1) {
            baseCorrelation = 0.5
          }
          // Some assets are more correlated with each other
          else if ((i < 5 && j < 5) || (i >= 10 && j >= 10)) {
            baseCorrelation = 0.4
          } else {
            baseCorrelation = 0.2
          }
          
          // Add some randomness
          let correlation = baseCorrelation + (Math.random() * 0.4 - 0.2)
          
          // Ensure correlation is between -1 and 1
          correlation = Math.max(-1, Math.min(1, correlation))
          
          // Round to 2 decimal places
          correlation = Math.round(correlation * 100) / 100
          
          row.push(correlation)
        }
      }
      
      matrix.push(row)
    }
    
    // Simulate different correlations based on timeframe
    if (selectedTimeframe === '7d') {
      // 7-day correlations tend to be more volatile
      matrix.forEach((row, i) => {
        row.forEach((val, j) => {
          if (i !== j) {
            const volatilityFactor = Math.random() * 0.3 - 0.15
            matrix[i][j] = Math.max(-1, Math.min(1, val + volatilityFactor))
            matrix[i][j] = Math.round(matrix[i][j] * 100) / 100
          }
        })
      })
    } else if (selectedTimeframe === '90d') {
      // 90-day correlations tend to be more stable and higher
      matrix.forEach((row, i) => {
        row.forEach((val, j) => {
          if (i !== j) {
            const stabilityFactor = Math.random() * 0.2
            matrix[i][j] = Math.max(-1, Math.min(1, val + stabilityFactor))
            matrix[i][j] = Math.round(matrix[i][j] * 100) / 100
          }
        })
      })
    }
    
    setCorrelationData({
      assets,
      correlationMatrix: matrix,
      timeframe: selectedTimeframe,
      lastUpdated: new Date()
    })
    
    setIsLoading(false)
  }

  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value)
    generateCorrelationData(value)
  }

  // Get color based on correlation value
  const getCorrelationColor = (value: number) => {
    if (value >= 0.8) return 'rgb(0, 128, 0)' // Strong positive - dark green
    if (value >= 0.5) return 'rgb(144, 238, 144)' // Moderate positive - light green
    if (value >= 0.2) return 'rgb(173, 255, 173)' // Weak positive - very light green
    if (value > -0.2) return 'rgb(240, 240, 240)' // No correlation - light gray
    if (value > -0.5) return 'rgb(255, 200, 200)' // Weak negative - light red
    if (value > -0.8) return 'rgb(255, 150, 150)' // Moderate negative - medium red
    return 'rgb(178, 34, 34)' // Strong negative - dark red
  }

  // Format correlation value for display
  const formatCorrelation = (value: number) => {
    if (value === 1) return '1.00'
    return value.toFixed(2)
  }

  // Return null during SSR to avoid hydration issues
  if (!mounted) return null

  return (
    <Card className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 border border-blue-500/30">
            <RiDashboardLine className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Title className="text-white text-xl">Asset Correlation Matrix</Title>
            <Text className="text-xs text-gray-400">
              {correlationData?.lastUpdated ? `Last updated: ${correlationData.lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </Text>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-2">
            <Select
              value={timeframe}
              onValueChange={handleTimeframeChange}
              className="min-w-[120px]"
              disabled={isLoading}
            >
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </Select>
          </div>
          <button 
            onClick={() => generateCorrelationData(timeframe)}
            className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors border border-blue-500/30"
            disabled={isLoading}
          >
            <RiRefreshLine className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 mb-4 overflow-x-auto">
        {correlationData ? (
          <div className="relative">
            <div className="flex">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-500/20 font-medium text-white sticky left-0">
                Assets
              </div>
              {correlationData.assets.map((asset, i) => (
                <div 
                  key={`header-${i}`} 
                  className="w-16 h-16 flex items-center justify-center font-medium text-white"
                >
                  {asset}
                </div>
              ))}
            </div>
            
            {correlationData.correlationMatrix.map((row, i) => (
              <div key={`row-${i}`} className="flex">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-500/20 font-medium text-white sticky left-0">
                  {correlationData.assets[i]}
                </div>
                {row.map((value, j) => (
                  <div 
                    key={`cell-${i}-${j}`} 
                    className="w-16 h-16 flex items-center justify-center text-sm relative cursor-pointer transition-all duration-200"
                    style={{ 
                      backgroundColor: getCorrelationColor(value),
                      color: value > 0.2 || value < -0.2 ? 'black' : 'gray',
                      transform: hoveredCell && (hoveredCell.i === i || hoveredCell.j === j) ? 'scale(1.05)' : 'scale(1)'
                    }}
                    onMouseEnter={() => setHoveredCell({i, j})}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {formatCorrelation(value)}
                    
                    {hoveredCell && hoveredCell.i === i && hoveredCell.j === j && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-10 bg-gray-800 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap">
                        {correlationData.assets[i]} to {correlationData.assets[j]}: {formatCorrelation(value)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-blue-500/20 rounded"></div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
        <div className="flex items-center">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: 'rgb(0, 128, 0)' }}></div>
          <Text className="text-xs text-gray-300">Strong Positive (0.8 to 1.0)</Text>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: 'rgb(144, 238, 144)' }}></div>
          <Text className="text-xs text-gray-300">Moderate Positive (0.5 to 0.8)</Text>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: 'rgb(173, 255, 173)' }}></div>
          <Text className="text-xs text-gray-300">Weak Positive (0.2 to 0.5)</Text>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: 'rgb(240, 240, 240)' }}></div>
          <Text className="text-xs text-gray-300">No Correlation (-0.2 to 0.2)</Text>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: 'rgb(255, 200, 200)' }}></div>
          <Text className="text-xs text-gray-300">Weak Negative (-0.5 to -0.2)</Text>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: 'rgb(255, 150, 150)' }}></div>
          <Text className="text-xs text-gray-300">Moderate Negative (-0.8 to -0.5)</Text>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 mr-1" style={{ backgroundColor: 'rgb(178, 34, 34)' }}></div>
          <Text className="text-xs text-gray-300">Strong Negative (-1.0 to -0.8)</Text>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
        <div className="flex items-center mb-2">
          <RiInformationLine className="w-4 h-4 text-blue-400 mr-2" />
          <Text className="text-white font-medium">Correlation Insights</Text>
        </div>
        <Text className="text-sm text-gray-300">
          {timeframe === '7d' ? (
            <>
              Short-term correlations show increased volatility with Bitcoin and Ethereum displaying weaker correlation patterns than usual. 
              Layer-1 alternatives (SOL, AVAX) are showing stronger internal correlation, suggesting sector-specific movements.
              Meme coins (DOGE, SHIB) are currently moving more independently from the broader market.
            </>
          ) : timeframe === '30d' ? (
            <>
              Medium-term correlations reveal Bitcoin's dominant influence on market movements with most assets showing moderate to strong positive correlation.
              DeFi tokens (UNI, LINK, AAVE) demonstrate higher internal correlation, indicating sector-specific trends.
              Stablecoins maintain their expected negative correlation with volatile assets during market fluctuations.
            </>
          ) : (
            <>
              Long-term correlations highlight the structural relationships between assets with Bitcoin and Ethereum forming the core correlation cluster.
              Most altcoins show strong positive correlation with the market leaders over this extended timeframe.
              Layer-2 solutions (MATIC, OP) maintain consistent correlation patterns with their respective Layer-1 platforms.
            </>
          )}
        </Text>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Text className="text-xs text-blue-300 font-bold">INFORMATION:</Text>
        <Text className="text-xs text-gray-400 mt-1">
          Correlation coefficients range from -1 to 1, where 1 indicates perfect positive correlation, 
          -1 indicates perfect negative correlation, and 0 indicates no correlation. 
          Correlation does not imply causation, and historical correlations may not predict future relationships.
        </Text>
      </div>
    </Card>
  )
}

export default MarketCorrelationHeatmap
