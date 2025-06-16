export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp?: number;
}

export interface Intent {
  name: string;
  category: string;
  entities: Record<string, any>;
  confidence?: number;
  action?: string;
  subIntent?: string;
}

export type EmotionType = 'happy' | 'sad' | 'neutral' | 'excited' | 'concerned' | 'confident' | 'uncertain' | 'analytical' | 'confused';

export interface AdvancedIntent extends Intent {
  parameters?: Record<string, any>;
  context?: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    analysis?: any;
    voice?: boolean;
    emotion?: EmotionType;
    intent?: AdvancedIntent;
    marketContext?: any;
  };
}

export interface MarketData {
  symbol?: string;
  price?: number;
  change24h?: number;
  volume24h?: number;
  marketCap?: number;
  bitcoin: {
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    dominance: number;
    source?: string;
    lastUpdated?: Date;
  };
  ethereum: {
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    source?: string;
    lastUpdated?: Date;
  };
  indicators?: {
    rsi?: number;
    macd?: number;
    bb?: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  market?: any;
  ordinals?: any;
  runes?: any;
  source?: string;
  lastUpdated?: Date;
}

export interface VoiceConfig {
  enabled: boolean;
  language: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
  emotionLevel?: number;
  continuousListening?: boolean;
}

export interface AIPersonality {
  name: string;
  style: 'formal' | 'casual' | 'slang' | 'professional';
  traits: string[];
  language: string;
  emotionalRange: number; // 0-1
  humorLevel: number; // 0-1
  technicalLevel: number; // 0-1
  responsePatterns: {
    greeting: string[];
    analysis: string[];
    suggestion: string[];
    error: string[];
    success: string[];
  };
}

export interface CypherAIConfig {
  personality: AIPersonality;
  voice: VoiceConfig;
  analysis: {
    depth: 'basic' | 'advanced' | 'expert';
    includeTechnicals: boolean;
    includeSentiment: boolean;
    includeOnChain: boolean;
    enableSentiment: boolean;
    enableTechnical: boolean;
    enableNews: boolean;
    updateInterval: number;
  };
  trading: {
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    preferredStrategies: string[];
    maxPositionSize: number;
    stopLossPercentage: number;
    enableRecommendations: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
    enableAutoTrade: boolean;
  };
  apiKeys?: {
    gemini?: string;
    openai?: string;
    elevenlabs?: string;
    [key: string]: string | undefined;
  };
  language?: string;
  voiceEnabled?: boolean;
}

export interface AnalysisResult {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  signals: TradingSignal[];
  risks: string[];
  opportunities: string[];
  technicalIndicators?: any;
  onChainMetrics?: any;
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  asset: string;
  strength: number; // 0-1
  reason: string;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  timeframe: string;
}

// Additional types for dialog and conversation system
export interface DialogState {
  isActive: boolean;
  currentStep?: number;
  context?: any;
  metadata?: any;
}

export interface ConversationPlan {
  id: string;
  steps?: any[];
  context?: any;
  metadata?: any;
}

export interface ConversationPrompt {
  content: string;
  context?: string;
  metadata?: any;
}

// Voice command and response types
export interface VoiceCommand {
  id: string;
  command?: string;
  timestamp: Date;
  confidence?: number;
  rawText?: string;
  intent?: Intent;
  entities?: any[];
  language?: string;
}

export interface VoiceResponse {
  id: string;
  text: string;
  audio?: ArrayBuffer;
  emotion?: EmotionType;
  timestamp: Date;
}