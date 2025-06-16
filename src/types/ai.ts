/**
 * 🤖 AI TYPES - CYPHER ORDi FUTURE V3
 * Definições de tipos para sistema de AI
 */

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp?: number;
  executionTime?: number;
}

export type Intent = 
  | 'trade'
  | 'analyze' 
  | 'configure'
  | 'query'
  | 'portfolio'
  | 'market'
  | 'help'
  | 'greet'
  | 'goodbye';

export type EmotionType = 
  | 'neutral'
  | 'positive' 
  | 'negative'
  | 'excited'
  | 'concerned'
  | 'happy'
  | 'sad'
  | 'confident'
  | 'uncertain'
  | 'analytical';

export interface AdvancedIntent {
  name: Intent;
  category: string;
  confidence: number;
  entities: Record<string, any>;
  parameters?: Record<string, any>;
  context?: string;
}

export interface VoiceConfig {
  recognition: 'continuous' | 'single' | 'push-to-talk';
  synthesis: 'elevenlabs' | 'browser' | 'disabled';
  language: string;
  voiceId?: string;
  settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface CypherAIConfig {
  personality: {
    name: string;
    description: string;
    traits: string[];
    responseStyle: 'formal' | 'casual' | 'brazilian_slang';
  };
  voice: VoiceConfig;
  analysis: {
    enableSentiment: boolean;
    enableTechnical: boolean;
    enableNews: boolean;
    updateInterval: number;
  };
  trading: {
    enableRecommendations: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
    maxPositionSize: number;
    enableAutoTrade: boolean;
  };
  limits: {
    maxTokens: number;
    requestsPerMinute: number;
    responseTimeout: number;
  };
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: AdvancedIntent;
    emotion?: EmotionType;
    entities?: Record<string, any>;
    processingTime?: number;
    voiceInput?: boolean;
    confidence?: number;
    marketContext?: any;
  };
}

export interface AIResponse {
  text: string;
  intent: AdvancedIntent;
  emotion: EmotionType;
  confidence: number;
  suggestions?: string[];
  actions?: ActionResult[];
  metadata?: Record<string, any>;
}

export interface ActionResult {
  type: 'trade' | 'analysis' | 'portfolio' | 'market_data' | 'notification';
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface MarketAnalysis {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  signals: {
    technical: Array<{
      indicator: string;
      value: number;
      signal: 'buy' | 'sell' | 'hold';
      strength: number;
    }>;
    fundamental: Array<{
      factor: string;
      impact: 'positive' | 'negative' | 'neutral';
      weight: number;
    }>;
  };
  recommendations: Array<{
    action: 'buy' | 'sell' | 'hold';
    reason: string;
    confidence: number;
    timeframe: string;
  }>;
}

export interface TradingRecommendation {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  entry: number;
  target: number;
  stopLoss: number;
  confidence: number;
  reasoning: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AIPerformanceMetrics {
  totalInteractions: number;
  successfulResponses: number;
  averageResponseTime: number;
  accuracyScore: number;
  userSatisfaction: number;
  topIntents: Array<{
    intent: Intent;
    count: number;
    percentage: number;
  }>;
  errorRate: number;
  uptime: number;
}

// Types are already exported via individual export statements above
// No need for additional export block