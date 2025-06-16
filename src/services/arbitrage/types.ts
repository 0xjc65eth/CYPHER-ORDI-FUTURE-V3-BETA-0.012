// Central type definitions for the arbitrage system

export interface ArbitrageOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  spreadPercentage: number;
  estimatedProfit: number;
  profitPercentage: number;
  volume: number;
  timestamp: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  executionTime: number;
  confidence: number;
}

export interface ArbitrageConfig {
  minSpreadPercentage: number;
  maxPositionSize: number;
  enabledExchanges: string[];
  enabledPairs: string[];
  autoExecute: boolean;
  riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  latencyThreshold: number;
}

export interface RiskLimits {
  maxDailyLoss: number;
  maxPositionSize: number;
  maxConcurrentTrades: number;
  maxExposurePerExchange: number;
  maxDrawdown: number;
  volatilityThreshold: number;
}

export interface TradeMetrics {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: number;
  totalLoss: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  currentDrawdown: number;
  maxDrawdown: number;
  winRate: number;
}

export interface ExposureData {
  exchange: string;
  symbol: string;
  position: number;
  value: number;
  timestamp: number;
}

export interface SecurityConfig {
  enableSignatureValidation: boolean;
  enableIPWhitelisting: boolean;
  enableAPIKeyRotation: boolean;
  enable2FA: boolean;
  maxAPICallsPerMinute: number;
  encryptionKey: string;
}

export interface APICredentials {
  exchange: string;
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  sandbox: boolean;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
}

export interface SecurityAlert {
  id: string;
  type: 'SUSPICIOUS_ACTIVITY' | 'FAILED_AUTHENTICATION' | 'RATE_LIMIT_EXCEEDED' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: number;
  metadata: any;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  price?: number;
  quantity?: number;
  timestamp: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  bid?: number;
  ask?: number;
  lastUpdate: number;
}

export interface OrderBookData {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export interface TickerData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface ExchangeCredentials {
  binance?: {
    apiKey: string;
    apiSecret: string;
    sandbox?: boolean;
  };
  coinbase?: {
    apiKey: string;
    apiSecret: string;
    passphrase: string;
    sandbox?: boolean;
  };
  kraken?: {
    apiKey: string;
    apiSecret: string;
    sandbox?: boolean;
  };
  okx?: {
    apiKey: string;
    apiSecret: string;
    passphrase: string;
    sandbox?: boolean;
  };
  coinapi?: {
    apiKey: string;
    sandbox?: boolean;
  };
}

export interface ArbitrageSystemStatus {
  isRunning: boolean;
  connectedExchanges: string[];
  activeOpportunities: number;
  lastUpdate: number;
  config: ArbitrageConfig;
  uptime: number;
  totalOpportunitiesFound: number;
  totalExecutions: number;
  successRate: number;
}

export interface PerformanceMetrics {
  latency: {
    min: number;
    max: number;
    avg: number;
    p95: number;
  };
  throughput: {
    messagesPerSecond: number;
    opportunitiesPerMinute: number;
    executionsPerHour: number;
  };
  reliability: {
    uptime: number;
    errorRate: number;
    reconnectionCount: number;
  };
}

export interface RiskAssessment {
  opportunityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  marketRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  liquidityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  executionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  recommendations: string[];
}

export interface ExecutionReport {
  opportunityId: string;
  executionTime: number;
  actualProfit: number;
  slippage: number;
  fees: number;
  success: boolean;
  errors?: string[];
  trades: {
    exchange: string;
    side: 'BUY' | 'SELL';
    symbol: string;
    quantity: number;
    price: number;
    orderId: string;
    timestamp: number;
  }[];
}

export interface MarketCondition {
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  liquidity: 'LOW' | 'MEDIUM' | 'HIGH';
  spread: 'TIGHT' | 'NORMAL' | 'WIDE';
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  confidence: number;
}

export interface ArbitrageStrategy {
  name: string;
  description: string;
  minSpread: number;
  maxRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  preferredExchanges: string[];
  preferredPairs: string[];
  conditions: {
    minVolume: number;
    maxLatency: number;
    requiredConfidence: number;
  };
}

export interface ComplianceRule {
  id: string;
  name: string;
  type: 'VOLUME_LIMIT' | 'FREQUENCY_LIMIT' | 'JURISDICTION' | 'KYC' | 'AML';
  enabled: boolean;
  parameters: Record<string, any>;
  exchanges: string[];
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  action: string;
  user: string;
  details: Record<string, any>;
  ipAddress: string;
  success: boolean;
}

export interface SystemHealth {
  overall: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  components: {
    arbitrageEngine: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    riskManager: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    securityManager: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    exchanges: Record<string, 'HEALTHY' | 'WARNING' | 'CRITICAL'>;
  };
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    errorRate: number;
  };
  alerts: SecurityAlert[];
}

export interface BacktestResult {
  strategy: string;
  timeRange: {
    start: number;
    end: number;
  };
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  totalLoss: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  avgProfit: number;
  avgLoss: number;
  profitFactor: number;
  trades: ExecutionReport[];
}

export type ArbitrageEventType = 
  | 'OPPORTUNITY_FOUND'
  | 'OPPORTUNITY_EXECUTED'
  | 'OPPORTUNITY_EXPIRED'
  | 'RISK_LIMIT_EXCEEDED'
  | 'SECURITY_ALERT'
  | 'SYSTEM_ERROR'
  | 'CONNECTION_LOST'
  | 'CONNECTION_RESTORED';

export interface ArbitrageEvent {
  id: string;
  type: ArbitrageEventType;
  timestamp: number;
  data: any;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
}