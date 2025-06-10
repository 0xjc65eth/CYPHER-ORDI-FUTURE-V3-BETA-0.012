// Professional Chart Configuration for Bitcoin Analytics Platform

export const CHART_THEMES = {
  dark: {
    background: '#111827',
    surface: '#1F2937',
    border: '#374151',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    grid: '#374151',
    bullish: '#10B981',
    bearish: '#EF4444',
    neutral: '#6B7280',
    primary: '#3B82F6',
    volume: '#8B5CF6'
  },
  light: {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    text: '#111827',
    textSecondary: '#6B7280',
    grid: '#E5E7EB',
    bullish: '#059669',
    bearish: '#DC2626',
    neutral: '#6B7280',
    primary: '#2563EB',
    volume: '#7C3AED'
  }
} as const;

export const CHART_INTERVALS = {
  '1m': { label: '1 Minute', milliseconds: 60 * 1000 },
  '5m': { label: '5 Minutes', milliseconds: 5 * 60 * 1000 },
  '15m': { label: '15 Minutes', milliseconds: 15 * 60 * 1000 },
  '30m': { label: '30 Minutes', milliseconds: 30 * 60 * 1000 },
  '1h': { label: '1 Hour', milliseconds: 60 * 60 * 1000 },
  '4h': { label: '4 Hours', milliseconds: 4 * 60 * 60 * 1000 },
  '1d': { label: '1 Day', milliseconds: 24 * 60 * 60 * 1000 },
  '1w': { label: '1 Week', milliseconds: 7 * 24 * 60 * 60 * 1000 }
} as const;

export const TRADING_PAIRS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
  { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
  { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '▲' },
  { symbol: 'MATICUSDT', name: 'Polygon', icon: '◆' },
  { symbol: 'LINKUSDT', name: 'Chainlink', icon: '⬢' }
] as const;

export const CHART_DEFAULTS = {
  height: 400,
  interval: '1h' as keyof typeof CHART_INTERVALS,
  theme: 'dark' as keyof typeof CHART_THEMES,
  showVolume: true,
  showGrid: true,
  showTooltip: true,
  showLegend: false,
  refreshInterval: 30000, // 30 seconds
  maxDataPoints: 100
} as const;

export const TECHNICAL_INDICATORS = {
  SMA: { name: 'Simple Moving Average', periods: [20, 50, 200] },
  EMA: { name: 'Exponential Moving Average', periods: [12, 26, 50] },
  RSI: { name: 'Relative Strength Index', period: 14 },
  MACD: { name: 'MACD', fast: 12, slow: 26, signal: 9 },
  BB: { name: 'Bollinger Bands', period: 20, deviation: 2 },
  VOLUME: { name: 'Volume', show: true }
} as const;

export const LIGHTWEIGHT_CHART_CONFIG = {
  layout: {
    background: { color: 'transparent' },
    textColor: '#d1d5db',
  },
  grid: {
    vertLines: { color: '#374151' },
    horzLines: { color: '#374151' },
  },
  crosshair: {
    mode: 1,
    vertLine: {
      width: 1,
      color: '#6B7280',
      style: 3,
    },
    horzLine: {
      width: 1,
      color: '#6B7280',
      style: 3,
    },
  },
  rightPriceScale: {
    borderColor: '#374151',
  },
  timeScale: {
    borderColor: '#374151',
    timeVisible: true,
    secondsVisible: false,
  },
  candlestick: {
    upColor: '#10B981',
    downColor: '#EF4444',
    borderVisible: false,
    wickUpColor: '#10B981',
    wickDownColor: '#EF4444',
  },
  volume: {
    priceFormat: { type: 'volume' as const },
    priceScaleId: '',
    scaleMargins: { top: 0.8, bottom: 0 },
  }
} as const;

export const RECHARTS_CONFIG = {
  margin: { top: 10, right: 30, left: 0, bottom: 0 },
  grid: {
    strokeDasharray: '3 3',
    stroke: '#374151'
  },
  xAxis: {
    stroke: '#9CA3AF',
    tick: { fontSize: 12 }
  },
  yAxis: {
    stroke: '#9CA3AF',
    tick: { fontSize: 12 }
  },
  tooltip: {
    contentStyle: { 
      backgroundColor: '#1F2937', 
      border: '1px solid #374151',
      borderRadius: '8px'
    },
    labelStyle: { color: '#9CA3AF' }
  }
} as const;

// Performance optimization settings
export const PERFORMANCE_CONFIG = {
  // Lazy loading thresholds
  lazyLoadThreshold: 3, // Load charts when within 3 viewports
  
  // Data decimation for large datasets
  maxDataPointsForInteraction: 500,
  decimationThreshold: 1000,
  
  // Update frequencies
  highFrequencyUpdate: 1000,  // 1 second for active trading
  normalUpdate: 30000,        // 30 seconds for general charts
  lowFrequencyUpdate: 300000, // 5 minutes for historical data
  
  // Memory management
  maxCachedCharts: 10,
  chartCacheExpiry: 300000,   // 5 minutes
  
  // Error handling
  maxRetries: 3,
  retryDelay: 1000,
  fallbackTimeout: 5000
} as const;

export type ChartTheme = keyof typeof CHART_THEMES;
export type ChartInterval = keyof typeof CHART_INTERVALS;
export type TradingPair = typeof TRADING_PAIRS[number];
export type TechnicalIndicator = keyof typeof TECHNICAL_INDICATORS;