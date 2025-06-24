// Types for Runes Chart Components
export interface RunesPriceData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma50?: number;
  vwap?: number;
}

export interface RunesVolumeData {
  timestamp: number;
  date: string;
  volume: number;
  volumeUSD: number;
  trades: number;
  period: string;
}

export interface MarketDepthData {
  price: number;
  bidSize: number;
  askSize: number;
  bidVolume: number;
  askVolume: number;
  spread: number;
}

export interface HoldersDistributionData {
  range: string;
  holders: number;
  percentage: number;
  amount: number;
  value: number;
}

export interface ChartConfig {
  theme: 'dark' | 'light';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    grid: string;
    candleUp: string;
    candleDown: string;
    volume: string;
    ma20: string;
    ma50: string;
    bid: string;
    ask: string;
  };
  animation: {
    duration: number;
    easing: string;
  };
  responsive: boolean;
}

export interface TooltipData {
  label: string;
  value: string | number;
  color: string;
  formatter?: (value: any) => string;
}

export interface ZoomState {
  startIndex: number;
  endIndex: number;
  scale: number;
}

export interface TechnicalIndicators {
  ma20: boolean;
  ma50: boolean;
  vwap: boolean;
  bollinger: boolean;
  rsi: boolean;
  macd: boolean;
}

export interface ChartProps {
  data: any[];
  height?: number;
  width?: number;
  config?: Partial<ChartConfig>;
  loading?: boolean;
  error?: string | null;
  onZoom?: (state: ZoomState) => void;
  onTooltip?: (data: TooltipData[]) => void;
  indicators?: Partial<TechnicalIndicators>;
  className?: string;
}

export interface RunesPriceChartProps extends ChartProps {
  data: RunesPriceData[];
  showVolume?: boolean;
  showIndicators?: boolean;
  zoomable?: boolean;
  realTime?: boolean;
}

export interface RunesVolumeChartProps extends ChartProps {
  data: RunesVolumeData[];
  period?: '1h' | '4h' | '1d' | '1w';
  showTrades?: boolean;
}

export interface MarketDepthChartProps extends ChartProps {
  data: MarketDepthData[];
  showSpread?: boolean;
  maxDepth?: number;
}

export interface HoldersDistributionChartProps extends ChartProps {
  data: HoldersDistributionData[];
  showPercentage?: boolean;
  showValue?: boolean;
}