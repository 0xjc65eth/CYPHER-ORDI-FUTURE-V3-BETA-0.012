/**
 * Trading Data Types
 * 
 * This file defines the types for trading data used in the Bitcoin Blockchain Analytics application.
 */

export interface SmcTradeSetup {
  id: string;
  timestamp: string;
  asset: string;
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w';
  direction: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number[];
  riskRewardRatio: number;
  confidence: number; // 0-100%
  status: 'pending' | 'active' | 'completed' | 'invalidated';
  result?: 'win' | 'loss' | 'breakeven';
  pnl?: number;
  pnlPercentage?: number;
  tags: string[];
  notes?: string;
  imageUrl?: string;
  orderBlocks: OrderBlock[];
  liquidityLevels: LiquidityLevel[];
  marketStructure: MarketStructurePoint[];
  volume: VolumeProfile;
}

export interface OrderBlock {
  id: string;
  type: 'bullish' | 'bearish';
  startTime: string;
  endTime: string;
  highPrice: number;
  lowPrice: number;
  mitigated: boolean;
  mitigationTime?: string;
  strength: number; // 0-100%
}

export interface LiquidityLevel {
  id: string;
  type: 'supply' | 'demand';
  price: number;
  strength: number; // 0-100%
  swept: boolean;
  sweepTime?: string;
}

export interface MarketStructurePoint {
  id: string;
  type: 'high' | 'low' | 'equal';
  time: string;
  price: number;
  broken: boolean;
  breakTime?: string;
}

export interface VolumeProfile {
  valueArea: {
    high: number;
    low: number;
    volume: number;
  };
  pointOfControl: number;
  volumeNodes: {
    price: number;
    volume: number;
    delta: number; // positive = buying, negative = selling
  }[];
}

export interface TradePosition {
  id: string;
  asset: string;
  direction: 'long' | 'short';
  entryPrice: number;
  entryTime: string;
  size: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number[];
  currentPrice: number;
  currentPnl: number;
  currentPnlPercentage: number;
  status: 'open' | 'closed';
  exitPrice?: number;
  exitTime?: string;
  finalPnl?: number;
  finalPnlPercentage?: number;
  fees: number;
  setupId?: string;
  notes?: string;
}

export interface TradingStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  expectancy: number;
  largestWin: number;
  largestLoss: number;
  totalProfit: number;
  maxDrawdown: number;
  maxDrawdownPercentage: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  averageHoldingTime: number; // in minutes
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  assets: string[];
  timeframes: string[];
  entryRules: string[];
  exitRules: string[];
  riskManagement: {
    maxRiskPerTrade: number; // percentage
    maxOpenTrades: number;
    maxDailyRisk: number; // percentage
    defaultStopLossPercentage: number;
    defaultTakeProfitPercentage: number;
  };
  performance: {
    winRate: number;
    profitFactor: number;
    expectancy: number;
    sharpeRatio: number;
  };
  backtestResults: {
    startDate: string;
    endDate: string;
    totalTrades: number;
    netProfit: number;
    netProfitPercentage: number;
    maxDrawdown: number;
    maxDrawdownPercentage: number;
  }[];
}
