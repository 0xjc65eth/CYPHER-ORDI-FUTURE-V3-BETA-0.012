/**
 * 🧠 useCypherAIv2 Hook - Enhanced React Integration
 * Gemini-like capabilities with streaming, advanced NLU, and dialog management
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { CypherAI } from '@/ai/cypher-v2/index';
import type { 
  ConversationMessage, 
  CypherAIConfig, 
  EmotionType,
  AIPersonality 
} from '@/ai/cypher-v2/types';

interface StreamChunk {
  content: string;
  progress: number;
  emotion?: EmotionType;
  isComplete: boolean;
}

interface DialogState {
  phase: 'greeting' | 'exploration' | 'deep_dive' | 'action' | 'conclusion' | 'idle';
  topic?: string;
  confidence: number;
  pendingActions: string[];
}

interface UseCypherAIv2State {
  // Core states
  isInitialized: boolean;
  isProcessing: boolean;
  isThinking: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isStreaming: boolean;
  
  // Conversation states
  messages: ConversationMessage[];
  currentMessage: string;
  suggestions: string[];
  
  // Dialog states
  dialogState: DialogState;
  conversationInsights: any;
  
  // Voice states
  voiceEnabled: boolean;
  voiceAmplitude: number;
  
  // Market data
  marketData: any;
  
  // Advanced features
  userExpertise: 'beginner' | 'intermediate' | 'expert';
  personality: AIPersonality;
  
  // Streaming
  activeStreams: number;
  streamingProgress: number;
}

interface UseCypherAIv2Actions {
  // Core actions
  sendMessage: (text: string) => Promise<void>;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  toggleVoice: () => void;
  
  // Advanced actions
  setPersonality: (personality: AIPersonality) => void;
  setUserExpertise: (level: 'beginner' | 'intermediate' | 'expert') => void;
  addUserInterest: (interest: string) => void;
  
  // Dialog management
  selectSuggestion: (suggestion: string) => Promise<void>;
  resetConversation: () => void;
  
  // Utility
  clearMessages: () => void;
  getConversationInsights: () => any;
}

interface UseCypherAIv2Return extends UseCypherAIv2State, UseCypherAIv2Actions {
  ai: CypherAI | null;
  error: string | null;
}

const defaultConfig: CypherAIConfig = {
  apiKeys: {
    openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    elevenlabs: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
    coingecko: process.env.NEXT_PUBLIC_COINGECKO_API_KEY || '',
    coinmarketcap: process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY || '',
    binance: process.env.NEXT_PUBLIC_BINANCE_API_KEY || '',
    google: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
    assemblyai: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || ''
  },
  personality: 'professional',
  language: 'pt-BR',
  voiceEnabled: true,
  debug: process.env.NODE_ENV === 'development'
};

export function useCypherAIv2(config?: Partial<CypherAIConfig>): UseCypherAIv2Return {
  const [state, setState] = useState<UseCypherAIv2State>({
    // Core states
    isInitialized: false,
    isProcessing: false,
    isThinking: false,
    isListening: false,
    isSpeaking: false,
    isStreaming: false,
    
    // Conversation states
    messages: [],
    currentMessage: '',
    suggestions: [],
    
    // Dialog states
    dialogState: {
      phase: 'idle',
      confidence: 0.5,
      pendingActions: []
    },
    conversationInsights: null,
    
    // Voice states
    voiceEnabled: true,
    voiceAmplitude: 0,
    
    // Market data
    marketData: null,
    
    // Advanced features
    userExpertise: 'intermediate',
    personality: 'professional',
    
    // Streaming
    activeStreams: 0,
    streamingProgress: 0
  });

  const [error, setError] = useState<string | null>(null);
  const ai = useRef<CypherAI | null>(null);
  const finalConfig = { ...defaultConfig, ...config };

  // Initialize CYPHER AI v2
  useEffect(() => {
    const initializeAI = async () => {
      try {
        console.log('🚀 Inicializando CYPHER AI v2...');
        
        ai.current = new CypherAI(finalConfig);
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize AI
        await ai.current.initialize();
        
        setState(prev => ({
          ...prev,
          isInitialized: true,
          personality: finalConfig.personality,
          voiceEnabled: finalConfig.voiceEnabled || true
        }));
        
        // Add welcome message
        addSystemMessage('🤖 CYPHER AI v2 inicializada! Como posso ajudar você hoje?', 'happy');
        
        console.log('✅ CYPHER AI v2 pronta para uso!');
        
      } catch (error) {
        console.error('❌ Erro ao inicializar CYPHER AI v2:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      }
    };

    initializeAI();

    return () => {
      if (ai.current) {
        ai.current.destroy();
      }
    };
  }, []);

  // Setup comprehensive event listeners
  const setupEventListeners = useCallback(() => {
    if (!ai.current) return;

    // Core events
    ai.current.on('initialized', (data) => {
      console.log('🎯 AI inicializada:', data);
    });

    ai.current.on('message', (message: ConversationMessage) => {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
    });

    ai.current.on('messageUpdate', (message: ConversationMessage) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === message.id ? message : msg
        )
      }));
    });

    // State changes
    ai.current.on('stateChange', (newState: any) => {
      setState(prev => ({
        ...prev,
        isProcessing: newState.isProcessing || false,
        isThinking: newState.isThinking || false,
        isListening: newState.isListening || false,
        isSpeaking: newState.isSpeaking || false,
        isStreaming: newState.isStreaming || false
      }));
    });

    // Streaming events
    ai.current.on('streamChunk', (chunk: StreamChunk) => {
      setState(prev => ({
        ...prev,
        currentMessage: chunk.content,
        streamingProgress: chunk.progress
      }));
    });

    ai.current.on('streamComplete', (data: any) => {
      setState(prev => ({
        ...prev,
        currentMessage: '',
        streamingProgress: 0
      }));
    });

    ai.current.on('streamMarketData', (data: any) => {
      // Handle streamed market data
      console.log('📊 Market data streamed:', data);
    });

    // Suggestions
    ai.current.on('suggestions', (suggestions: string[]) => {
      setState(prev => ({
        ...prev,
        suggestions
      }));
    });

    // Voice events
    ai.current.on('voiceAmplitude', (amplitude: number) => {
      setState(prev => ({
        ...prev,
        voiceAmplitude: amplitude
      }));
    });

    // Dialog state changes
    ai.current.on('dialogStateChange', (dialogState: any) => {
      setState(prev => ({
        ...prev,
        dialogState: {
          phase: dialogState.phase || 'idle',
          topic: dialogState.topic,
          confidence: dialogState.confidence || 0.5,
          pendingActions: dialogState.pendingActions || []
        }
      }));
    });

    // Market updates
    ai.current.on('marketUpdate', (marketData: any) => {
      setState(prev => ({
        ...prev,
        marketData
      }));
    });

    // Intent detection
    ai.current.on('intentDetected', (intent: any) => {
      console.log('🎯 Intent detectado:', intent.name, 'Confiança:', intent.confidence);
    });

    // Errors
    ai.current.on('error', (error: Error) => {
      console.error('❌ Erro na AI:', error);
      setError(error.message);
      addSystemMessage(`Erro: ${error.message}`, 'concerned');
    });

  }, []);

  // Core actions
  const sendMessage = useCallback(async (text: string) => {
    if (!ai.current || !state.isInitialized) {
      throw new Error('CYPHER AI não está inicializada');
    }

    try {
      setError(null);
      await ai.current.processText(text);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }, [state.isInitialized]);

  const startListening = useCallback(async () => {
    if (!ai.current || !state.isInitialized) {
      throw new Error('CYPHER AI não está inicializada');
    }

    try {
      await ai.current.startListening();
    } catch (error) {
      console.error('Erro ao iniciar escuta:', error);
      setError(error instanceof Error ? error.message : 'Erro no reconhecimento de voz');
    }
  }, [state.isInitialized]);

  const stopListening = useCallback(async () => {
    if (!ai.current) return;

    try {
      await ai.current.stopListening();
    } catch (error) {
      console.error('Erro ao parar escuta:', error);
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (!ai.current) return;

    const newVoiceEnabled = !state.voiceEnabled;
    ai.current.setVoiceConfig({ enabled: newVoiceEnabled });
    
    setState(prev => ({
      ...prev,
      voiceEnabled: newVoiceEnabled
    }));

    addSystemMessage(
      newVoiceEnabled ? '🔊 Voz ativada' : '🔇 Voz desativada', 
      'neutral'
    );
  }, [state.voiceEnabled]);

  // Advanced actions
  const setPersonality = useCallback((personality: AIPersonality) => {
    if (!ai.current) return;

    ai.current.setPersonality(personality);
    setState(prev => ({
      ...prev,
      personality
    }));

    addSystemMessage(`🎭 Personalidade alterada para: ${personality}`, 'neutral');
  }, []);

  const setUserExpertise = useCallback(async (level: 'beginner' | 'intermediate' | 'expert') => {
    if (!ai.current) return;

    try {
      await ai.current.setUserExpertise(level);
      setState(prev => ({
        ...prev,
        userExpertise: level
      }));

      addSystemMessage(`🎓 Nível de expertise: ${level}`, 'neutral');
    } catch (error) {
      console.error('Erro ao definir expertise:', error);
    }
  }, []);

  const addUserInterest = useCallback(async (interest: string) => {
    if (!ai.current) return;

    try {
      await ai.current.addUserInterest(interest);
      addSystemMessage(`💡 Interesse adicionado: ${interest}`, 'neutral');
    } catch (error) {
      console.error('Erro ao adicionar interesse:', error);
    }
  }, []);

  // Dialog management
  const selectSuggestion = useCallback(async (suggestion: string) => {
    await sendMessage(suggestion);
    setState(prev => ({
      ...prev,
      suggestions: []
    }));
  }, [sendMessage]);

  const resetConversation = useCallback(() => {
    if (!ai.current) return;

    ai.current.dialogManager?.resetConversation();
    setState(prev => ({
      ...prev,
      messages: [],
      suggestions: [],
      dialogState: {
        phase: 'idle',
        confidence: 0.5,
        pendingActions: []
      }
    }));

    addSystemMessage('🔄 Conversa reiniciada', 'neutral');
  }, []);

  // Utility functions
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: []
    }));
  }, []);

  const getConversationInsights = useCallback(() => {
    if (!ai.current) return null;
    return ai.current.getConversationInsights();
  }, []);

  const addSystemMessage = useCallback((content: string, emotion: EmotionType = 'neutral') => {
    const message: ConversationMessage = {
      id: Date.now().toString(),
      role: 'system',
      content,
      timestamp: new Date(),
      emotion
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }));
  }, []);

  // Update streaming stats
  useEffect(() => {
    if (!ai.current) return;

    const updateStreamingStats = () => {
      const stats = ai.current?.streamingStats;
      if (stats) {
        setState(prev => ({
          ...prev,
          activeStreams: stats.activeStreams
        }));
      }
    };

    const interval = setInterval(updateStreamingStats, 1000);
    return () => clearInterval(interval);
  }, [state.isInitialized]);

  // Update conversation insights
  useEffect(() => {
    if (!ai.current || !state.isInitialized) return;

    const updateInsights = () => {
      const insights = ai.current?.getConversationInsights();
      setState(prev => ({
        ...prev,
        conversationInsights: insights
      }));
    };

    const interval = setInterval(updateInsights, 5000);
    updateInsights(); // Initial update

    return () => clearInterval(interval);
  }, [state.isInitialized]);

  return {
    // State
    ...state,
    
    // Actions
    sendMessage,
    startListening,
    stopListening,
    toggleVoice,
    setPersonality,
    setUserExpertise,
    addUserInterest,
    selectSuggestion,
    resetConversation,
    clearMessages,
    getConversationInsights,
    
    // Instances and error
    ai: ai.current,
    error
  };
}

export default useCypherAIv2;