export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop-limit' | 'oco' | 'iceberg' | 'twap';
  amount: number;
  price?: number;
  stopPrice?: number;
  limitPrice?: number;
  status: 'pending' | 'filled' | 'partial' | 'cancelled' | 'rejected';
  exchange?: string;
  timestamp?: Date;
}

export interface Portfolio {
  balance: number;
  positions: Position[];
  totalValue?: number;
  pnl?: number;
  pnlPercentage?: number;
}

export interface Position {
  symbol: string;
  amount: number;
  avgPrice: number;
  currentPrice?: number;
  unrealizedPnl?: number;
  realizedPnl?: number;
  exchange?: string;
}

export interface RiskParameters {
  maxRisk: number;
  stopLoss: number;
  maxDrawdown: number;
  positionSize?: number;
  leverage?: number;
  marginRequirement?: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: Date;
  bid?: number;
  ask?: number;
  spread?: number;
}

export interface TechnicalIndicators {
  sma?: number[];
  ema?: number[];
  rsi?: number;
  macd?: {
    line: number;
    signal: number;
    histogram: number;
  };
  bollinger?: {
    upper: number;
    middle: number;
    lower: number;
    percentB?: number;
  };
  stochastic?: {
    percentK: number;
    percentD: number;
  };
}

export interface TradingSignal {
  asset: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeframe?: string;
  strategy?: string;
  timestamp: Date;
}

export interface Exchange {
  name: string;
  supported: boolean;
  apiKey?: string;
  apiSecret?: string;
  testnet?: boolean;
}

export interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  trades: number;
}