import { useState, useEffect, useRef, useCallback } from 'react';
import { getCypherAI } from '@/services/CypherAIService';

interface VoiceAssistantConfig {
  language: string;
  autoStart: boolean;
  confidenceThreshold: number;
  wakeWords: string[];
  enableContinuousListening: boolean;
}

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  category: string;
  confidence: number;
  timestamp: Date;
  response?: string;
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  lastTranscript: string;
  lastConfidence: number;
  error: string | null;
  supported: boolean;
}

const useVoiceAssistant = (config: Partial<VoiceAssistantConfig> = {}) => {
  const defaultConfig: VoiceAssistantConfig = {
    language: 'pt-BR',
    autoStart: false,
    confidenceThreshold: 0.7,
    wakeWords: ['cypher', 'ei cypher', 'hey cypher', 'oi cypher'],
    enableContinuousListening: false,
    ...config
  };

  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    lastTranscript: '',
    lastConfidence: 0,
    error: null,
    supported: false
  });

  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const cypherAI = useRef(getCypherAI());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      synthRef.current = window.speechSynthesis;

      setupRecognition();
      setState(prev => ({ ...prev, supported: true }));

      if (defaultConfig.autoStart) {
        startListening();
      }
    } else {
      setState(prev => ({ 
        ...prev, 
        supported: false, 
        error: 'Speech recognition not supported in this browser' 
      }));
    }

    return cleanup;
  }, []);

  const setupRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.lang = defaultConfig.language;
    recognition.continuous = defaultConfig.enableContinuousListening;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          confidence = result[0].confidence;
        }
      }

      if (finalTranscript) {
        setState(prev => ({
          ...prev,
          lastTranscript: finalTranscript,
          lastConfidence: confidence
        }));

        processVoiceInput(finalTranscript, confidence);
      }
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
      
      if (defaultConfig.enableContinuousListening && !state.error) {
        // Restart listening after a short delay
        timeoutRef.current = setTimeout(() => {
          if (!state.isProcessing) {
            startListening();
          }
        }, 1000);
      }
    };

    recognition.onerror = (event: any) => {
      setState(prev => ({ 
        ...prev, 
        isListening: false, 
        error: `Speech recognition error: ${event.error}` 
      }));
    };
  }, [defaultConfig]);

  const processVoiceInput = useCallback(async (transcript: string, confidence: number) => {
    if (confidence < defaultConfig.confidenceThreshold) {
      return;
    }

    // Check for wake words
    const hasWakeWord = defaultConfig.wakeWords.some(word => 
      transcript.toLowerCase().includes(word.toLowerCase())
    );

    if (!hasWakeWord && !defaultConfig.enableContinuousListening) {
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const command: VoiceCommand = {
        id: Date.now().toString(),
        command: transcript,
        action: 'unknown',
        category: 'general',
        confidence,
        timestamp: new Date()
      };

      // Process with CypherAI
      const aiResponse = await cypherAI.current.processCommand(transcript, {
        conversationHistory: commandHistory.slice(-5)
      });

      command.action = aiResponse.intent || 'general';
      command.category = getCategoryFromIntent(aiResponse.intent || 'general');
      command.response = aiResponse.content;

      setCurrentCommand(command);
      setCommandHistory(prev => [...prev.slice(-19), command]);

      // Speak response if enabled
      if (aiResponse.content) {
        await speakText(aiResponse.content);
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Processing error: ${error}` 
      }));
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [defaultConfig, commandHistory]);

  const getCategoryFromIntent = (intent: string): string => {
    const categoryMap: Record<string, string> = {
      'bitcoin_price': 'price',
      'market_analysis': 'analysis',
      'trading_opportunities': 'trading',
      'portfolio_analysis': 'portfolio',
      'execute_trade': 'trading',
      'help': 'help',
      'general': 'general'
    };

    return categoryMap[intent] || 'general';
  };

  const speakText = useCallback(async (text: string): Promise<void> => {
    if (!synthRef.current || state.isSpeaking) return;

    return new Promise((resolve) => {
      setState(prev => ({ ...prev, isSpeaking: true }));

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = defaultConfig.language;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      // Find best voice for Portuguese
      const voices = synthRef.current!.getVoices();
      const ptVoice = voices.find(voice => 
        voice.lang.includes('pt') && 
        (voice.name.includes('female') || voice.name.includes('Luciana'))
      ) || voices.find(voice => voice.lang.includes('pt'));

      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        resolve();
      };

      utterance.onerror = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        resolve();
      };

      synthRef.current!.speak(utterance);
    });
  }, [defaultConfig.language, state.isSpeaking]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || state.isListening) return;

    setState(prev => ({ ...prev, error: null }));

    try {
      recognitionRef.current.start();
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to start listening: ${error}` 
      }));
    }
  }, [state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [state.isListening]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current && state.isSpeaking) {
      synthRef.current.cancel();
      setState(prev => ({ ...prev, isSpeaking: false }));
    }
  }, [state.isSpeaking]);

  const executeVoiceCommand = useCallback(async (commandText: string) => {
    await processVoiceInput(commandText, 1.0);
  }, [processVoiceInput]);

  const clearHistory = useCallback(() => {
    setCommandHistory([]);
    setCurrentCommand(null);
  }, []);

  const cleanup = useCallback(() => {
    stopListening();
    stopSpeaking();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [stopListening, stopSpeaking]);

  // Trading-specific voice commands
  const tradingCommands = {
    analyzeBitcoin: () => executeVoiceCommand('Cypher analise oportunidades do Bitcoin'),
    checkPrice: (asset = 'Bitcoin') => executeVoiceCommand(`Cypher preço do ${asset}`),
    showPortfolio: () => executeVoiceCommand('Cypher mostrar portfolio'),
    marketStatus: () => executeVoiceCommand('Cypher como está o mercado'),
    executeTrade: (action: string, asset: string, amount?: number) => {
      const command = amount 
        ? `Cypher ${action} ${amount} de ${asset}`
        : `Cypher ${action} ${asset}`;
      return executeVoiceCommand(command);
    },
    getHelp: () => executeVoiceCommand('Cypher ajuda')
  };

  return {
    // State
    state,
    currentCommand,
    commandHistory,

    // Controls
    startListening,
    stopListening,
    stopSpeaking,
    executeVoiceCommand,
    speakText,

    // Utils
    clearHistory,
    cleanup,

    // Trading Commands
    tradingCommands,

    // Config
    config: defaultConfig
  };
};

export default useVoiceAssistant;