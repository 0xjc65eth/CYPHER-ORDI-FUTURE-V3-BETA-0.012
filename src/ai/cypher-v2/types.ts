/**
 * CYPHER AI v2 - Type Definitions
 * Core TypeScript interfaces and types
 */

// Main Config Interface
export interface CypherAIConfig {
  apiKeys: {
    openai?: string;
    elevenlabs?: string;
    coingecko?: string;
    coinmarketcap?: string;
    binance?: string;
    google?: string;
    assemblyai?: string;
    gemini?: string;
  };
  personality: AIPersonality;
  language: string;
  voiceEnabled: boolean;
  debug: boolean;
}

export type AIPersonality = 
  | 'professional' 
  | 'friendly' 
  | 'analytical' 
  | 'casual' 
  | 'expert';

// Conversation Types
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  emotion?: EmotionType;
  confidence?: number;
  data?: any;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    sources?: string[];
  };
}

export type EmotionType = 
  | 'neutral' 
  | 'happy' 
  | 'excited' 
  | 'concerned' 
  | 'analytical' 
  | 'confident' 
  | 'surprised' 
  | 'thoughtful';

export interface VoiceConfig {
  enabled: boolean;
  language: string;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  wakeWord: string;
  continuousListening: boolean;
}

export interface Intent {
  name: string;
  confidence: number;
  entities: Record<string, any>;
  action?: string;
  category: 'trading' | 'analysis' | 'portfolio' | 'market' | 'general';
}

export interface MarketData {
  bitcoin?: {
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    dominance: number;
  };
  ethereum?: {
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
  };
  market?: {
    totalMarketCap: number;
    totalVolume: number;
    fearGreedIndex: number;
    activeCryptocurrencies: number;
  };
  ordinals?: {
    floorPrice: number;
    volume24h: number;
    sales24h: number;
  };
  runes?: {
    totalSupply: number;
    holders: number;
    transactions24h: number;
  };
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  executionTime: number;
  requiresConfirmation?: boolean;
  confirmationId?: string;
}

// Voice Module Types
export interface VoiceCommand {
  id: string;
  timestamp: Date;
  rawText: string;
  intent: VoiceIntent;
  entities: VoiceEntity[];
  confidence: number;
  language: string;
  userId?: string;
}

export interface VoiceIntent {
  name: string;
  category: 'trading' | 'analysis' | 'portfolio' | 'market' | 'help' | 'general';
  confidence: number;
  parameters?: Record<string, any>;
}

export interface VoiceEntity {
  type: string;
  value: string | number;
  originalText: string;
  position: [number, number];
  confidence: number;
}

export interface VoiceResponse {
  text: string;
  ssml?: string;
  emotion?: 'neutral' | 'positive' | 'negative' | 'excited' | 'calm';
  actions?: AIAction[];
  visualData?: any;
}

// Conversation Module Types
export interface Conversation {
  id: string;
  userId: string;
  startedAt: Date;
  lastActivity: Date;
  context: ConversationContext;
  messages: ConversationMessage[];
  state: ConversationState;
}

export interface ConversationContext {
  topic?: string;
  goals: string[];
  preferences: UserPreferences;
  history: MessageHistory[];
  activeData?: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  intent?: VoiceIntent;
  emotions?: EmotionAnalysis;
  actions?: AIAction[];
  references?: DataReference[];
}

export interface ConversationState {
  active: boolean;
  mode: 'voice' | 'text' | 'hybrid';
  waitingForResponse: boolean;
  currentTopic?: string;
  pendingActions: AIAction[];
}

// Knowledge Module Types
export interface KnowledgeBase {
  bitcoin: BitcoinKnowledge;
  market: MarketKnowledge;
  technical: TechnicalKnowledge;
  news: NewsKnowledge;
  user: UserKnowledge;
}

export interface BitcoinKnowledge {
  price: PriceData;
  blockchain: BlockchainData;
  ordinals: OrdinalsData;
  runes: RunesData;
  lightning: LightningData;
  mining: MiningData;
}

export interface MarketKnowledge {
  trends: MarketTrend[];
  sentiment: SentimentData;
  volumes: VolumeData;
  orderbooks: OrderbookData;
  whaleActivity: WhaleData[];
}

export interface TechnicalKnowledge {
  indicators: TechnicalIndicator[];
  patterns: ChartPattern[];
  signals: TradingSignal[];
  predictions: PricePrediction[];
}

export interface NewsKnowledge {
  articles: NewsArticle[];
  sentiment: NewsSentiment;
  events: MarketEvent[];
  alerts: NewsAlert[];
}

export interface UserKnowledge {
  portfolio: PortfolioData;
  preferences: UserPreferences;
  tradingHistory: Trade[];
  performance: PerformanceMetrics;
}

// Actions Module Types
export interface AIAction {
  id: string;
  type: ActionType;
  status: ActionStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  parameters: Record<string, any>;
  validation?: ActionValidation;
  result?: ActionResult;
}

export enum ActionType {
  // Trading Actions
  PLACE_ORDER = 'place_order',
  CANCEL_ORDER = 'cancel_order',
  MODIFY_ORDER = 'modify_order',
  
  // Analysis Actions
  ANALYZE_MARKET = 'analyze_market',
  GENERATE_REPORT = 'generate_report',
  PREDICT_PRICE = 'predict_price',
  
  // Alert Actions
  CREATE_ALERT = 'create_alert',
  SEND_NOTIFICATION = 'send_notification',
  
  // Portfolio Actions
  REBALANCE_PORTFOLIO = 'rebalance_portfolio',
  CALCULATE_RISK = 'calculate_risk',
  
  // Data Actions
  FETCH_DATA = 'fetch_data',
  UPDATE_CACHE = 'update_cache',
}

export enum ActionStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface ActionValidation {
  required: boolean;
  rules: ValidationRule[];
  userConfirmation?: boolean;
  riskLevel?: number;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: Error;
  timestamp: Date;
  executionTime: number;
}

// Services Module Types
export interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  lastCheck: Date;
  errors: ServiceError[];
}

export interface ServiceError {
  code: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface APIRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface WebSocketMessage {
  type: string;
  channel: string;
  data: any;
  timestamp: Date;
  sequence: number;
}

// Data Types
export interface PriceData {
  current: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: Date;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number;
  timeframe: string;
}

export interface TradingSignal {
  id: string;
  type: 'entry' | 'exit' | 'stop-loss' | 'take-profit';
  direction: 'long' | 'short';
  price: number;
  confidence: number;
  reason: string;
  timestamp: Date;
}

export interface Trade {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  fee: number;
  timestamp: Date;
  status: 'pending' | 'filled' | 'cancelled';
}

// User Types
export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  tradingStyle: 'scalping' | 'day-trading' | 'swing' | 'position' | 'hodl';
  notifications: NotificationPreferences;
  voice: VoicePreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  voice: boolean;
  telegram: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  tradeConfirmations: boolean;
}

export interface VoicePreferences {
  enabled: boolean;
  wakeWord: string;
  voice: string;
  speed: number;
  volume: number;
  confirmActions: boolean;
}

// Helper Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: Error;
}>;

// Event Types
export interface CypherEvent {
  type: string;
  timestamp: Date;
  data: any;
  source: string;
  userId?: string;
}

export interface ErrorEvent extends CypherEvent {
  type: 'error';
  error: Error;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
}

// Validation Types
export interface ValidationRule {
  field: string;
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    version: string;
    requestId: string;
  };
}