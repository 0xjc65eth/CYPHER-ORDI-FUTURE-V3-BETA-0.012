'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Loader2, TrendingUp, BarChart3, LineChart, AlertTriangle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic imports for better performance
const LightweightChart = dynamic(
  () => import('./LightweightChart'),
  { 
    ssr: false, 
    loading: () => <ChartLoadingSkeleton />
  }
)

const RechartsChart = dynamic(
  () => import('./RechartsChart'),
  { 
    ssr: false, 
    loading: () => <ChartLoadingSkeleton />
  }
)

const SimpleChart = dynamic(
  () => import('./SimpleChart'),
  { 
    ssr: false, 
    loading: () => <ChartLoadingSkeleton />
  }
)

// Chart types
export type ChartType = 'candlestick' | 'line' | 'area' | 'bar' | 'histogram' | 'heatmap'
export type ChartProvider = 'lightweight' | 'recharts' | 'simple' | 'auto'

// Chart data interfaces
export interface CandlestickData {
  time: string | number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface LineData {
  time: string | number
  value: number
  label?: string
}

export interface BarData {
  category: string
  value: number
  color?: string
}

export interface HeatmapData {
  x: string
  y: string
  value: number
}

export type ChartData = CandlestickData[] | LineData[] | BarData[] | HeatmapData[]

// Chart configuration
export interface ChartConfig {
  title?: string
  subtitle?: string
  height?: number
  width?: number | string
  theme?: 'light' | 'dark' | 'auto'
  responsive?: boolean
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  showCrosshair?: boolean
  timeFormat?: string
  precision?: number
  colors?: string[]
  refreshInterval?: number
  realtime?: boolean
}

// Main component props
export interface UnifiedChartSystemProps {
  type: ChartType
  data: ChartData
  config?: ChartConfig
  provider?: ChartProvider
  className?: string
  onDataUpdate?: (data: ChartData) => void
  onError?: (error: Error) => void
}

// Loading skeleton component
function ChartLoadingSkeleton() {
  return (
    <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading chart...</p>
      </div>
    </div>
  )
}

// Error fallback component
function ChartErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="w-full h-64 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-center">
      <div className="text-center p-6">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
          Chart Error
        </h3>
        <p className="text-xs text-red-600 dark:text-red-300 mb-3">
          {error.message || 'Failed to render chart'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-3 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

// Provider selector logic
function selectOptimalProvider(type: ChartType, dataLength: number): ChartProvider {
  // For trading charts, prefer lightweight-charts
  if (type === 'candlestick') return 'lightweight'
  
  // For small datasets, use simple charts
  if (dataLength < 50) return 'simple'
  
  // For medium datasets, use recharts
  if (dataLength < 500) return 'recharts'
  
  // For large datasets, use lightweight charts for performance
  return 'lightweight'
}

// Data validation
function validateChartData(type: ChartType, data: ChartData): boolean {
  if (!Array.isArray(data) || data.length === 0) return false
  
  const sample = data[0]
  
  switch (type) {
    case 'candlestick':
      return 'open' in sample && 'high' in sample && 'low' in sample && 'close' in sample
    case 'line':
    case 'area':
      return 'time' in sample && 'value' in sample
    case 'bar':
      return 'category' in sample && 'value' in sample
    case 'heatmap':
      return 'x' in sample && 'y' in sample && 'value' in sample
    default:
      return true
  }
}

// Main UnifiedChartSystem component
export function UnifiedChartSystem({
  type,
  data,
  config = {},
  provider = 'auto',
  className = '',
  onDataUpdate,
  onError
}: UnifiedChartSystemProps) {
  const [actualProvider, setActualProvider] = useState<ChartProvider>('simple')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized configuration with defaults
  const chartConfig = useMemo((): ChartConfig => ({
    height: 300,
    width: '100%',
    theme: 'auto',
    responsive: true,
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    showCrosshair: type === 'candlestick',
    timeFormat: 'auto',
    precision: 2,
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    refreshInterval: 0,
    realtime: false,
    ...config
  }), [config, type])

  // Provider selection effect
  useEffect(() => {
    try {
      if (!validateChartData(type, data)) {
        throw new Error(`Invalid data format for chart type: ${type}`)
      }

      const selectedProvider = provider === 'auto' 
        ? selectOptimalProvider(type, data.length)
        : provider

      setActualProvider(selectedProvider)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      onError?.(new Error(errorMessage))
      setActualProvider('simple') // Fallback to simple chart
    } finally {
      setIsLoading(false)
    }
  }, [type, data, provider, onError])

  // Real-time data update effect
  useEffect(() => {
    if (!chartConfig.realtime || !chartConfig.refreshInterval) return

    const interval = setInterval(() => {
      onDataUpdate?.(data)
    }, chartConfig.refreshInterval)

    return () => clearInterval(interval)
  }, [chartConfig.realtime, chartConfig.refreshInterval, data, onDataUpdate])

  // Loading state
  if (isLoading) {
    return <ChartLoadingSkeleton />
  }

  // Error state
  if (error) {
    return (
      <ChartErrorFallback 
        error={new Error(error)} 
        resetErrorBoundary={() => {
          setError(null)
          setIsLoading(true)
        }} 
      />
    )
  }

  // Chart wrapper with error boundary
  const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
    <ErrorBoundary
      FallbackComponent={ChartErrorFallback}
      onError={(error) => {
        console.error('Chart rendering error:', error)
        onError?.(error)
      }}
      resetKeys={[type, data, actualProvider]}
    >
      <div className={`chart-container ${className}`}>
        {chartConfig.title && (
          <div className="chart-header mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {chartConfig.title}
            </h3>
            {chartConfig.subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {chartConfig.subtitle}
              </p>
            )}
          </div>
        )}
        <Suspense fallback={<ChartLoadingSkeleton />}>
          {children}
        </Suspense>
      </div>
    </ErrorBoundary>
  )

  // Render appropriate chart based on provider
  switch (actualProvider) {
    case 'lightweight':
      return (
        <ChartWrapper>
          <LightweightChart
            type={type}
            data={data}
            config={chartConfig}
          />
        </ChartWrapper>
      )

    case 'recharts':
      return (
        <ChartWrapper>
          <RechartsChart
            type={type}
            data={data}
            config={chartConfig}
          />
        </ChartWrapper>
      )

    case 'simple':
    default:
      return (
        <ChartWrapper>
          <SimpleChart
            type={type}
            data={data}
            config={chartConfig}
          />
        </ChartWrapper>
      )
  }
}

// Export chart icons for UI
export const ChartIcons = {
  TrendingUp,
  BarChart3,
  LineChart,
  AlertTriangle
}

// Export utility functions
export const ChartUtils = {
  validateChartData,
  selectOptimalProvider
}

export default UnifiedChartSystem