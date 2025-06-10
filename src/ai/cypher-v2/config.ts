// CYPHER AI v2 - Configuration
// Default configuration for all AI modules

import type { CypherAIConfig } from './types';

export const CypherConfig = {
  defaultConfig: {
    apiKeys: {
      openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
      elevenlabs: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
      coingecko: process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '',
      coinmarketcap: process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY || '',
      binance: process.env.NEXT_PUBLIC_BINANCE_API_KEY || '',
      google: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
      assemblyai: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || '',
      gemini: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
    },
    personality: 'professional' as const,
    language: 'pt-BR',
    voiceEnabled: true,
    debug: process.env.NODE_ENV === 'development'
  } as CypherAIConfig,

  // Voice configuration
  voice: {
    enabled: true,
    language: 'pt-BR',
    wakeWord: 'cypher',
    speechRecognition: {
      continuous: true,
      interimResults: true
    },
    speechSynthesis: {
      rate: 1.0,
      pitch: 1.0,
      volume: 0.8
    }
  },

  // Conversation configuration
  conversation: {
    contextWindow: 20,
    maxResponseLength: 500,
    personalities: {
      professional: {
        tone: 'formal',
        language: 'technical'
      },
      friendly: {
        tone: 'casual',
        language: 'simple'
      },
      analytical: {
        tone: 'data-driven',
        language: 'detailed'
      },
      casual: {
        tone: 'informal',
        language: 'colloquial'
      },
      expert: {
        tone: 'authoritative',
        language: 'expert'
      }
    }
  },

  // Knowledge configuration
  knowledge: {
    updateInterval: 30000, // 30 seconds
    cacheTimeout: 60000, // 1 minute
    dataSources: {
      coingecko: true,
      binance: true,
      localCache: true
    }
  },

  // Actions configuration
  actions: {
    confirmationRequired: true,
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    defaultValues: {
      maxPositionSize: 0.1, // 10% of portfolio
      slippageTolerance: 0.02 // 2%
    }
  },

  // Services configuration
  services: {
    healthCheckInterval: 60000, // 1 minute
    retryAttempts: 3,
    timeout: 10000 // 10 seconds
  }
};

// Export types
export type VoiceConfig = typeof CypherConfig.voice;
export type ConversationConfig = typeof CypherConfig.conversation;
export type KnowledgeConfig = typeof CypherConfig.knowledge;
export type ActionsConfig = typeof CypherConfig.actions;
export type ServicesConfig = typeof CypherConfig.services;