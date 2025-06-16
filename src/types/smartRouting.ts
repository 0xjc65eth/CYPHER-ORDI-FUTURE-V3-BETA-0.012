/**
 * Smart Routing System Types for CYPHER TRADE
 * Version: 1.0.0
 * 
 * Defines interfaces and types for the intelligent routing system
 * that compares prices across DEXs, calculates fees, and optimizes routes.
 */

import { Token, DEXType, Quote, RouteStep } from './quickTrade';

// Core Smart Routing Types
export interface SmartRoute {
  id: string;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  netAmountOut: string; // Amount after all fees
  dexPath: DEXType[];
  steps: RouteStep[];
  totalFees: FeeBreakdown;
  priceImpact: number;
  slippage: SlippageAnalysis;
  confidence: number; // 0-100
  executionTime: number; // estimated seconds
  liquidityCheck: LiquidityValidation;
  crossChain?: CrossChainRoute;
  timestamp: number;
  isOptimal: boolean;
}

export interface FeeBreakdown {
  cypherFee: {
    amount: string;
    amountUSD: number;
    percentage: number; // 0.34% = 0.0034
    recipient: string;
  };
  dexFees: Array<{
    dex: DEXType;
    amount: string;
    amountUSD: number;
    percentage: number;
  }>;
  gasFees: {
    estimatedGas: string;
    gasPrice: string;
    gasCostUSD: number;
    chainId: number;
  };
  bridgeFees?: {
    amount: string;
    amountUSD: number;
    fromChain: number;
    toChain: number;
  };
  totalFeeUSD: number;
  totalFeePercentage: number;
}

export interface SlippageAnalysis {
  expected: number; // Expected slippage percentage
  maximum: number; // Maximum acceptable slippage
  priceImpact: number; // Price impact percentage
  liquidityDepth: number; // Available liquidity depth
  confidenceLevel: number; // Confidence in slippage estimate (0-100)
  historicalAverage: number; // Historical average slippage for this pair
}

export interface LiquidityValidation {
  isValid: boolean;
  availableLiquidity: string;
  requiredLiquidity: string;
  liquidityRatio: number; // available/required
  warnings: string[];
  recommendations: string[];
  pools: Array<{
    dex: DEXType;
    poolAddress: string;
    tvl: string;
    volume24h: string;
    utilization: number; // percentage of pool being used
  }>;
}

export interface CrossChainRoute {
  fromChain: number;
  toChain: number;
  bridge: BridgeType;
  bridgeTime: number; // estimated minutes
  bridgeFee: string;
  bridgeFeeUSD: number;
  steps: CrossChainStep[];
  totalTime: number; // total execution time in minutes
  confirmations: {
    source: number;
    destination: number;
  };
}

export enum BridgeType {
  STARGATE = 'stargate',
  LAYERZERO = 'layerzero',
  WORMHOLE = 'wormhole',
  MULTICHAIN = 'multichain',
  ALLBRIDGE = 'allbridge',
  CBRIDGE = 'cbridge'
}

export interface CrossChainStep {
  type: 'swap' | 'bridge';
  fromToken: Token;
  toToken: Token;
  amountIn: string;
  amountOut: string;
  platform: DEXType | BridgeType;
  estimatedTime: number; // seconds
  fee: string;
  feeUSD: number;
}

// Route Analysis and Comparison
export interface RouteComparison {
  routes: SmartRoute[];
  bestRoute: SmartRoute;
  savings: {
    amount: string;
    amountUSD: number;
    percentage: number;
  };
  ranking: RouteRanking[];
  analysis: RouteAnalysis;
  timestamp: number;
}

export interface RouteRanking {
  route: SmartRoute;
  rank: number;
  score: number; // Composite score (0-100)
  scoreBreakdown: {
    price: number;
    speed: number;
    reliability: number;
    liquidity: number;
    gas: number;
  };
  pros: string[];
  cons: string[];
  recommendation: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface RouteAnalysis {
  priceVariance: number; // Variance between best and worst price
  averageExecutionTime: number;
  averageSlippage: number;
  liquidityScore: number; // Overall liquidity score (0-100)
  riskAssessment: RiskAssessment;
  marketConditions: MarketConditions;
}

export interface RiskAssessment {
  overall: 'low' | 'medium' | 'high';
  factors: {
    priceVolatility: number;
    liquidityRisk: number;
    slippageRisk: number;
    executionRisk: number;
    bridgeRisk?: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface MarketConditions {
  volatility: number; // 24h volatility percentage
  volume24h: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  liquidityTrend: 'increasing' | 'decreasing' | 'stable';
  gasPriceLevel: 'low' | 'medium' | 'high';
  networkCongestion: number; // 0-100
}

// Routing Configuration
export interface SmartRoutingConfig {
  maxSlippage: number; // Maximum acceptable slippage
  maxPriceImpact: number; // Maximum acceptable price impact
  maxExecutionTime: number; // Maximum execution time in seconds
  minLiquidity: number; // Minimum required liquidity in USD
  maxHops: number; // Maximum number of hops in a route
  cypherFeeRate: number; // 0.34% = 0.0034
  maxFeeUSD: number; // Maximum fee cap in USD
  enableCrossChain: boolean;
  prioritizePrice: boolean; // Prioritize best price over speed
  prioritizeSpeed: boolean; // Prioritize speed over price
  prioritizeReliability: boolean; // Prioritize reliable DEXs
  enabledDEXs: DEXType[];
  enabledChains: number[];
  enabledBridges: BridgeType[];
  fallbackEnabled: boolean;
  fallbackThreshold: number; // If best route fails, try next N routes
}

// Price and Quote Management
export interface PriceQuote {
  dex: DEXType;
  chainId: number;
  tokenIn: Token;
  tokenOut: Token;
  amountIn: string;
  amountOut: string;
  price: number; // Price per token
  priceUSD: number;
  timestamp: number;
  source: 'api' | 'contract' | 'cache';
  confidence: number;
  isStale: boolean;
}

export interface AggregatedQuote {
  tokenPair: string; // "ETH-USDC"
  quotes: PriceQuote[];
  bestQuote: PriceQuote;
  worstQuote: PriceQuote;
  averagePrice: number;
  priceSpread: number; // Difference between best and worst
  timestamp: number;
  quotesCount: number;
  validQuotes: number;
}

// Error Handling and Fallbacks
export interface RoutingError {
  type: 'network' | 'liquidity' | 'slippage' | 'timeout' | 'bridge' | 'unknown';
  message: string;
  dex?: DEXType;
  chainId?: number;
  retryable: boolean;
  fallbackAvailable: boolean;
  timestamp: number;
}

export interface FallbackStrategy {
  primaryRoute: SmartRoute;
  fallbackRoutes: SmartRoute[];
  currentAttempt: number;
  maxAttempts: number;
  fallbackReason: string;
  autoFallback: boolean;
}

// Minimum Value Validation
export interface MinimumValueCheck {
  isValid: boolean;
  requiredMinimumUSD: number;
  providedAmountUSD: number;
  tokenPrice: number;
  reason?: string;
  suggestions?: string[];
}

// API Response Types
export interface SmartRoutingResponse {
  success: boolean;
  data?: {
    comparison: RouteComparison;
    bestRoute: SmartRoute;
    allRoutes: SmartRoute[];
    minimumValueCheck: MinimumValueCheck;
  };
  error?: RoutingError;
  fallback?: FallbackStrategy;
  timestamp: number;
  executionTime: number; // API response time in ms
}

// DEX Health and Status
export interface DEXHealth {
  dex: DEXType;
  chainId: number;
  isOnline: boolean;
  responseTime: number; // ms
  successRate: number; // 0-100
  lastCheck: number;
  apiStatus: 'operational' | 'degraded' | 'down';
  liquidityStatus: 'high' | 'medium' | 'low';
  errors: RoutingError[];
}

// Historical Performance
export interface RoutePerformance {
  routeId: string;
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  averageSlippage: number;
  averageGasCost: number;
  lastUsed: number;
  userRating: number; // 1-5 stars
  issues: string[];
}

// Real-time Monitoring
export interface RoutingMetrics {
  totalRoutes: number;
  successfulRoutes: number;
  failedRoutes: number;
  averageResponseTime: number;
  totalVolumeUSD: number;
  totalFeesCollected: number;
  activeUsers: number;
  topPerformingDEXs: Array<{
    dex: DEXType;
    volume: number;
    successRate: number;
  }>;
  timestamp: number;
}

// Configuration Constants
export const SMART_ROUTING_CONSTANTS = {
  CYPHER_FEE_RATE: 0.0034, // 0.34%
  MIN_TRANSACTION_USD: 10,
  MAX_FEE_USD: 100,
  DEFAULT_SLIPPAGE: 0.005, // 0.5%
  MAX_SLIPPAGE: 0.05, // 5%
  DEFAULT_DEADLINE: 20 * 60, // 20 minutes
  MAX_HOPS: 3,
  API_TIMEOUT: 10000, // 10 seconds
  CACHE_TTL: 30000, // 30 seconds
  CONFIDENCE_THRESHOLD: 80, // Minimum confidence score
  LIQUIDITY_THRESHOLD: 10000, // Minimum $10k liquidity
} as const;

export type SmartRoutingConstants = typeof SMART_ROUTING_CONSTANTS;