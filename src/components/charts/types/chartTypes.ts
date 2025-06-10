// 📊 CYPHER ORDI FUTURE v3.0.0 - Chart Types
// Definições de tipos para biblioteca de charts

export interface ChartData {
  timestamp: string | number;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceData {
  time: string;
  price: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  marketCap?: number;
}

export interface VolumeData {
  time: string;
  volume: number;
  buyVolume?: number;
  sellVolume?: number;
  avgPrice?: number;
}

export interface SentimentData {
  time: string;
  sentiment: number; // -1 to 1
  bullish: number;
  bearish: number;
  neutral: number;
}

export interface OnChainData {
  time: string;
  hashRate: number;
  difficulty: number;
  transactions: number;
  blockSize: number;
  fees: number;
}

export interface PortfolioData {
  asset: string;
  value: number;
  percentage: number;
  change24h: number;
  quantity: number;
}

export type ChartTimeframe = '1h' | '4h' | '1d' | '1w' | '1m' | '1y' | 'all';

export type ChartTheme = 'dark' | 'light' | 'custom';

export interface ChartProps {
  data: any[];
  width?: number | string;
  height?: number;
  theme?: ChartTheme;
  timeframe?: ChartTimeframe;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface BaseChartProps extends ChartProps {
  title?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  animated?: boolean;
}