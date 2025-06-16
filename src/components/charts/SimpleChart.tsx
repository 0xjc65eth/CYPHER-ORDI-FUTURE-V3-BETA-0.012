'use client'

import React from 'react'
import type { ChartType, ChartData, ChartConfig, CandlestickData, LineData, BarData } from './UnifiedChartSystem'

interface SimpleChartProps {
  type: ChartType
  data: ChartData
  config: ChartConfig
}

export function SimpleChart({ type, data, config }: SimpleChartProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
        No data available
      </div>
    )
  }

  // Simple fallback chart rendering using SVG
  const renderSimpleChart = () => {
    const width = typeof config.width === 'number' ? config.width : 600
    const height = config.height || 300
    const padding = 40

    switch (type) {
      case 'line':
      case 'area':
        const lineData = data as LineData[]
        const values = lineData.map(d => d.value)
        const minValue = Math.min(...values)
        const maxValue = Math.max(...values)
        const range = maxValue - minValue || 1

        const points = lineData.map((d, i) => {
          const x = padding + (i / (lineData.length - 1)) * (width - 2 * padding)
          const y = height - padding - ((d.value - minValue) / range) * (height - 2 * padding)
          return `${x},${y}`
        }).join(' ')

        return (
          <svg width={width} height={height} className="w-full">
            {/* Grid lines */}
            {config.showGrid !== false && (
              <g stroke={config.theme === 'dark' ? '#374151' : '#f3f4f6'} strokeWidth="1">
                {[...Array(5)].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={padding}
                    y1={padding + (i * (height - 2 * padding)) / 4}
                    x2={width - padding}
                    y2={padding + (i * (height - 2 * padding)) / 4}
                  />
                ))}
                {[...Array(5)].map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={padding + (i * (width - 2 * padding)) / 4}
                    y1={padding}
                    x2={padding + (i * (width - 2 * padding)) / 4}
                    y2={height - padding}
                  />
                ))}
              </g>
            )}

            {/* Area fill */}
            {type === 'area' && (
              <path
                d={`M${padding},${height - padding} L${points} L${width - padding},${height - padding} Z`}
                fill={config.colors?.[0] ? `${config.colors[0]}20` : '#3B82F620'}
                stroke="none"
              />
            )}

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={config.colors?.[0] || '#3B82F6'}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Axes */}
            <g stroke={config.theme === 'dark' ? '#6b7280' : '#9ca3af'} strokeWidth="1">
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
            </g>

            {/* Labels */}
            <g fill={config.theme === 'dark' ? '#d1d5db' : '#374151'} fontSize="12" textAnchor="middle">
              <text x={padding} y={height - 10}>{lineData[0]?.time || ''}</text>
              <text x={width - padding} y={height - 10}>{lineData[lineData.length - 1]?.time || ''}</text>
              <text x={10} y={padding} transform={`rotate(-90, 10, ${padding})`} textAnchor="middle">
                {maxValue.toFixed(config.precision || 2)}
              </text>
              <text x={10} y={height - padding} transform={`rotate(-90, 10, ${height - padding})`} textAnchor="middle">
                {minValue.toFixed(config.precision || 2)}
              </text>
            </g>
          </svg>
        )

      case 'bar':
        const barData = data as BarData[]
        const barValues = barData.map(d => d.value)
        const barMaxValue = Math.max(...barValues)
        const barWidth = (width - 2 * padding) / barData.length

        return (
          <svg width={width} height={height} className="w-full">
            {/* Grid lines */}
            {config.showGrid !== false && (
              <g stroke={config.theme === 'dark' ? '#374151' : '#f3f4f6'} strokeWidth="1">
                {[...Array(5)].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={padding}
                    y1={padding + (i * (height - 2 * padding)) / 4}
                    x2={width - padding}
                    y2={padding + (i * (height - 2 * padding)) / 4}
                  />
                ))}
              </g>
            )}

            {/* Bars */}
            {barData.map((d, i) => {
              const barHeight = (d.value / barMaxValue) * (height - 2 * padding)
              const x = padding + i * barWidth + barWidth * 0.1
              const y = height - padding - barHeight
              
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill={d.color || config.colors?.[0] || '#3B82F6'}
                />
              )
            })}

            {/* Axes */}
            <g stroke={config.theme === 'dark' ? '#6b7280' : '#9ca3af'} strokeWidth="1">
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
            </g>

            {/* Labels */}
            <g fill={config.theme === 'dark' ? '#d1d5db' : '#374151'} fontSize="12" textAnchor="middle">
              {barData.map((d, i) => (
                <text
                  key={i}
                  x={padding + i * barWidth + barWidth / 2}
                  y={height - 10}
                  transform={`rotate(-45, ${padding + i * barWidth + barWidth / 2}, ${height - 10})`}
                >
                  {d.category}
                </text>
              ))}
            </g>
          </svg>
        )

      case 'candlestick':
        const candleData = data as CandlestickData[]
        const candleValues = candleData.flatMap(d => [d.high, d.low])
        const candleMinValue = Math.min(...candleValues)
        const candleMaxValue = Math.max(...candleValues)
        const candleRange = candleMaxValue - candleMinValue || 1
        const candleWidth = (width - 2 * padding) / candleData.length

        return (
          <svg width={width} height={height} className="w-full">
            {/* Grid lines */}
            {config.showGrid !== false && (
              <g stroke={config.theme === 'dark' ? '#374151' : '#f3f4f6'} strokeWidth="1">
                {[...Array(5)].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={padding}
                    y1={padding + (i * (height - 2 * padding)) / 4}
                    x2={width - padding}
                    y2={padding + (i * (height - 2 * padding)) / 4}
                  />
                ))}
              </g>
            )}

            {/* Candlesticks */}
            {candleData.map((d, i) => {
              const x = padding + i * candleWidth + candleWidth / 2
              const highY = height - padding - ((d.high - candleMinValue) / candleRange) * (height - 2 * padding)
              const lowY = height - padding - ((d.low - candleMinValue) / candleRange) * (height - 2 * padding)
              const openY = height - padding - ((d.open - candleMinValue) / candleRange) * (height - 2 * padding)
              const closeY = height - padding - ((d.close - candleMinValue) / candleRange) * (height - 2 * padding)
              
              const isGreen = d.close >= d.open
              const color = isGreen ? (config.colors?.[1] || '#10B981') : (config.colors?.[3] || '#EF4444')
              
              return (
                <g key={i}>
                  {/* Wick */}
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1" />
                  {/* Body */}
                  <rect
                    x={x - candleWidth * 0.3}
                    y={Math.min(openY, closeY)}
                    width={candleWidth * 0.6}
                    height={Math.abs(closeY - openY) || 1}
                    fill={color}
                    stroke={color}
                  />
                </g>
              )
            })}

            {/* Axes */}
            <g stroke={config.theme === 'dark' ? '#6b7280' : '#9ca3af'} strokeWidth="1">
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
            </g>
          </svg>
        )

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            Chart type "{type}" not supported by SimpleChart
          </div>
        )
    }
  }

  return (
    <div 
      className="simple-chart-container w-full"
      style={{ 
        minHeight: config.height || 300,
        backgroundColor: config.theme === 'dark' ? '#1f2937' : '#ffffff'
      }}
    >
      {renderSimpleChart()}
    </div>
  )
}

export default SimpleChart