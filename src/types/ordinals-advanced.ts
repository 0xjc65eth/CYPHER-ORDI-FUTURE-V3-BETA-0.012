/**
 * Advanced Ordinals Marketplace Types
 * Comprehensive TypeScript definitions for all Ordinals marketplace integrations
 */

import { OrdinalsMarketplace } from '@/services/ordinals/integrations';

// Core Ordinals Types
export interface OrdinalsInscription {
  id: string;
  number: number;
  address: string;
  contentType: string;
  contentLength: number;
  timestamp: number;
  genesisHeight: number;
  genesisTransaction: string;
  location: string;
  owner: string;
  preview?: string;
  content?: string;
  satoshi?: number;
  offset?: number;
}

export interface OrdinalsCollection {
  id: string;
  name: string;
  symbol?: string;
  description: string;
  image: string;
  totalSupply: number;
  floorPrice: number;
  volume24h: number;
  volume7d?: number;
  volume30d?: number;
  holdersCount: number;
  listedCount: number;
  listedPercentage: number;
  verified?: boolean;
  website?: string;
  twitter?: string;
  discord?: string;
  royalty?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Market Data Types
export interface MarketListing {
  inscriptionId: string;
  price: number;
  priceUnit: 'BTC' | 'sats';
  seller: string;
  marketplace: OrdinalsMarketplace;
  listedAt: number;
  expiresAt?: number;
  isActive: boolean;
}

export interface MarketSale {
  inscriptionId: string;
  price: number;
  priceUnit: 'BTC' | 'sats';
  buyer: string;
  seller: string;
  marketplace: OrdinalsMarketplace;
  timestamp: number;
  txHash: string;
  blockHeight?: number;
}

export interface MarketActivity {
  id: string;
  type: 'mint' | 'list' | 'delist' | 'sale' | 'transfer';
  inscriptionId: string;
  fromAddress?: string;
  toAddress?: string;
  price?: number;
  priceUnit?: 'BTC' | 'sats';
  marketplace?: OrdinalsMarketplace;
  timestamp: number;
  txHash: string;
  collectionId?: string;
}

// Analytics Types
export interface RarityMetrics {
  rank: number;
  score: number;
  percentile: number;
  category: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  traits: TraitRarity[];
  methodology: 'trait_count' | 'statistical' | 'harmonic_mean' | 'composite';
}

export interface TraitRarity {
  traitType: string;
  value: string;
  frequency: number;
  rarity: number;
  contribution: number;
  percentile: number;
}

export interface CollectionMetrics {
  floorPrice: number;
  avgPrice: number;
  medianPrice: number;
  maxPrice: number;
  priceStandardDeviation: number;
  priceVolatility: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  volumeChange24h: number;
  volumeChange7d: number;
  salesCount24h: number;
  salesCount7d: number;
  salesCount30d: number;
  uniqueBuyers24h: number;
  uniqueSellers24h: number;
  avgSalePrice24h: number;
  medianSalePrice24h: number;
}

export interface HolderAnalytics {
  totalHolders: number;
  whales: number; // 100+ items
  large: number; // 10-99 items
  medium: number; // 5-9 items
  small: number; // 1-4 items
  concentration: number; // Gini coefficient
  topHolderPercentage: number;
  holderGrowth24h: number;
  holderGrowth7d: number;
}

export interface LiquidityMetrics {
  listedPercentage: number;
  turnoverRate: number;
  liquidityScore: number;
  bidAskSpread: number;
  marketDepth: number;
  priceImpact1BTC: number;
  priceImpact5BTC: number;
  averageTimeToSale: number; // in hours
}

// Advanced Analytics Types
export interface MarketDepthData {
  timestamp: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercentage: number;
  midPrice: number;
  liquidityScore: number;
  depthScore: number;
  imbalanceRatio: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  totalValue: number;
  cumulativeQuantity: number;
  cumulativeValue: number;
  orders: number;
}

export interface TradingSignal {
  id: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
  timeframe: 'short' | 'medium' | 'long';
  reasoning: string[];
  targetPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskLevel: 'low' | 'medium' | 'high';
  generatedAt: number;
  expiresAt?: number;
}

export interface ArbitrageOpportunity {
  id: string;
  inscriptionId?: string;
  collectionId: string;
  buyMarketplace: OrdinalsMarketplace;
  sellMarketplace: OrdinalsMarketplace;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercentage: number;
  confidence: number;
  riskScore: number;
  executionTime: number; // estimated time in seconds
  liquidity: {
    buyLiquidity: number;
    sellLiquidity: number;
  };
  fees: {
    buyFees: number;
    sellFees: number;
    networkFees: number;
  };
  discoveredAt: number;
  expiresAt: number;
}

// Portfolio Types
export interface PortfolioHolding {
  inscriptionId: string;
  inscriptionNumber: number;
  collectionId: string;
  collectionName: string;
  acquiredAt: number;
  acquiredPrice: number;
  currentPrice: number;
  lastPriceUpdate: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  rarityRank?: number;
  rarityScore?: number;
  traits?: TraitRarity[];
  marketplace: OrdinalsMarketplace;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  realizedPnL: number;
  totalPnL: number;
  totalPnLPercentage: number;
  bestPerformer: {
    inscriptionId: string;
    pnlPercentage: number;
  };
  worstPerformer: {
    inscriptionId: string;
    pnlPercentage: number;
  };
  diversificationScore: number;
  concentrationRisk: number;
  volatilityScore: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  averageHoldingPeriod: number; // in days
}

export interface PortfolioAllocation {
  collectionId: string;
  collectionName: string;
  holdings: number;
  value: number;
  percentage: number;
  avgPrice: number;
  pnl: number;
  pnlPercentage: number;
  riskScore: number;
}

// Trading Types
export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  type: 'arbitrage' | 'momentum' | 'mean_reversion' | 'value' | 'breakout' | 'trend_following';
  enabled: boolean;
  parameters: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'scalping' | 'short' | 'medium' | 'long';
  expectedReturn: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  lastUpdated: number;
}

export interface TradingPosition {
  id: string;
  inscriptionId: string;
  collectionId: string;
  strategy: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  entryTime: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: number;
  status: 'open' | 'closed' | 'cancelled';
  marketplace: OrdinalsMarketplace;
  fees: number;
  slippage: number;
}

export interface TradingOrder {
  id: string;
  inscriptionId: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  price?: number;
  stopPrice?: number;
  quantity: number;
  filled: number;
  remaining: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled' | 'rejected';
  marketplace: OrdinalsMarketplace;
  createdAt: number;
  updatedAt: number;
  filledAt?: number;
  avgFillPrice?: number;
  fees: number;
  error?: string;
}

// Automation Types
export interface TradingBot {
  id: string;
  name: string;
  description: string;
  strategies: string[];
  riskParameters: RiskParameters;
  status: 'active' | 'paused' | 'stopped' | 'error';
  balance: number;
  allocatedCapital: number;
  performance: BotPerformance;
  lastActivity: number;
  createdAt: number;
  updatedAt: number;
}

export interface RiskParameters {
  maxPositionSize: number; // % of portfolio
  maxDailyLoss: number; // % of portfolio
  maxDrawdown: number; // % of portfolio
  stopLossPercentage: number;
  takeProfitPercentage: number;
  maxOpenPositions: number;
  minLiquidityScore: number;
  maxSlippage: number;
  cooldownPeriod: number; // minutes after loss
  allowedMarketplaces: OrdinalsMarketplace[];
  allowedCollections: string[];
  blacklistedCollections: string[];
}

export interface BotPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  totalPnL: number;
  totalPnLPercentage: number;
  maxDrawdown: number;
  currentDrawdown: number;
  sharpeRatio: number;
  calmarRatio: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageHoldTime: number; // minutes
  totalFees: number;
  slippageCost: number;
  tradesPerDay: number;
  activeDays: number;
  lastUpdate: number;
}

// Market Analysis Types
export interface MarketSentiment {
  score: number; // -100 to 100
  classification: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  confidence: number;
  factors: {
    volumeChange: number;
    priceAction: number;
    socialSentiment: number;
    whaleActivity: number;
    technicalIndicators: number;
  };
  lastUpdated: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    ema20: number;
    ema50: number;
  };
  volume: {
    current: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  support: number[];
  resistance: number[];
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: number;
  rateLimit?: {
    remaining: number;
    reset: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  success: boolean;
  error?: string;
  timestamp: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'price_update' | 'new_listing' | 'sale' | 'delisting' | 'market_data' | 'orderbook_update';
  data: any;
  timestamp: number;
  marketplace?: OrdinalsMarketplace;
}

export interface PriceUpdate {
  inscriptionId: string;
  collectionId: string;
  oldPrice?: number;
  newPrice: number;
  marketplace: OrdinalsMarketplace;
  timestamp: number;
}

export interface OrderBookUpdate {
  collectionId: string;
  marketplace: OrdinalsMarketplace;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

// Aggregation Types
export interface MarketplaceComparison {
  collectionId: string;
  marketplaces: {
    [key in OrdinalsMarketplace]?: {
      floorPrice: number;
      volume24h: number;
      listedCount: number;
      avgPrice: number;
      lastSale: number;
      available: boolean;
    };
  };
  bestFloor: {
    price: number;
    marketplace: OrdinalsMarketplace;
  };
  arbitrageOpportunity?: {
    profitPercentage: number;
    buyOn: OrdinalsMarketplace;
    sellOn: OrdinalsMarketplace;
  };
  consolidatedMetrics: {
    totalVolume24h: number;
    totalListings: number;
    weightedFloorPrice: number;
    priceSpread: number;
    liquidityScore: number;
  };
}

export interface HistoricalData {
  timestamp: number;
  price: number;
  volume: number;
  sales: number;
  listings: number;
  marketCap: number;
  floorPrice: number;
}

// Event Types
export interface MarketEvent {
  id: string;
  type: 'large_sale' | 'new_collection' | 'price_spike' | 'volume_surge' | 'whale_activity';
  collectionId?: string;
  inscriptionId?: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, any>;
  timestamp: number;
  marketplace?: OrdinalsMarketplace;
}

// Configuration Types
export interface AnalyticsConfig {
  enabledMarketplaces: OrdinalsMarketplace[];
  updateIntervals: {
    priceData: number;
    marketDepth: number;
    analytics: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  notifications: {
    priceAlerts: boolean;
    arbitrageAlerts: boolean;
    whaleActivity: boolean;
  };
  apiKeys: {
    [key in OrdinalsMarketplace]?: string;
  };
}

export interface TradingConfig {
  defaultRiskParameters: RiskParameters;
  enabledStrategies: string[];
  backtestingEnabled: boolean;
  paperTradingMode: boolean;
  maxConcurrentBots: number;
  emergencyStop: {
    enabled: boolean;
    maxDrawdown: number;
    maxDailyLoss: number;
  };
}

// Utility Types
export type MarketplaceData<T> = {
  [key in OrdinalsMarketplace]?: T;
};

export type TimeFrame = '1h' | '4h' | '1d' | '7d' | '30d' | '90d' | '1y' | 'all';

export type SortOrder = 'asc' | 'desc';

export type SortBy = 
  | 'price' 
  | 'volume' 
  | 'sales' 
  | 'rarity' 
  | 'listed_date' 
  | 'sale_date' 
  | 'holders' 
  | 'floor_price'
  | 'change_24h'
  | 'change_7d';

// Filter Types
export interface CollectionFilter {
  minFloorPrice?: number;
  maxFloorPrice?: number;
  minVolume24h?: number;
  maxVolume24h?: number;
  minSupply?: number;
  maxSupply?: number;
  verified?: boolean;
  marketplaces?: OrdinalsMarketplace[];
  categories?: string[];
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export interface InscriptionFilter {
  collectionId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRarity?: number;
  maxRarity?: number;
  traits?: Record<string, string[]>;
  listedOnly?: boolean;
  marketplaces?: OrdinalsMarketplace[];
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

// Error Types
export interface OrdinalsError {
  code: string;
  message: string;
  details?: any;
  marketplace?: OrdinalsMarketplace;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Export all types for easy importing
export * from '@/services/ordinals/integrations';