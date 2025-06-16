// CYPHER AI v2 - Configuration
// Default configuration for all AI modules

import type { CypherAIConfig } from './types';

export const CypherConfig = {
  defaultConfig: {
    personality: {
      name: 'professional',
      style: 'professional' as const,
      traits: ['analytical', 'precise', 'reliable'],
      language: 'pt-BR',
      emotionalRange: 0.5,
      humorLevel: 0.3,
      technicalLevel: 0.8,
      responsePatterns: {
        greeting: ['Olá! Como posso ajudar com suas análises cripto hoje?'],
        analysis: ['Baseado nos dados atuais...', 'A análise indica que...'],
        suggestion: ['Recomendo considerar...', 'Sugiro que você...'],
        error: ['Desculpe, ocorreu um erro...', 'Não foi possível processar...'],
        success: ['Operação realizada com sucesso!', 'Concluído!']
      }
    },
    voice: {
      enabled: true,
      language: 'pt-BR',
      voiceId: 'default',
      speed: 1.0,
      pitch: 1.0,
      emotionLevel: 0.5
    },
    analysis: {
      depth: 'advanced' as const,
      includeTechnicals: true,
      includeSentiment: true,
      includeOnChain: true,
      enableSentiment: true,
      enableTechnical: true,
      enableNews: true,
      updateInterval: 30000
    },
    trading: {
      riskLevel: 'moderate' as const,
      preferredStrategies: ['swing', 'momentum', 'mean-reversion'],
      maxPositionSize: 0.1,
      stopLossPercentage: 0.05,
      enableRecommendations: true,
      riskTolerance: 'medium' as const,
      enableAutoTrade: false
    },
    limits: {
      maxTokens: 2000,
      requestsPerMinute: 60,
      responseTimeout: 30000
    }
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