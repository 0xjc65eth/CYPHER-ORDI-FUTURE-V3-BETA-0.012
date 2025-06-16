/**
 * 🎤 Voice Commands Hook
 * Processamento de comandos de voz em PT/EN
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceCommand {
  text: string;
  language: 'pt' | 'en';
  confidence: number;
  timestamp: Date;
}

export interface VoiceCommandConfig {
  language?: 'pt-BR' | 'en-US';
  continuous?: boolean;
  interimResults?: boolean;
}

const VOICE_COMMANDS = {
  pt: {
    // Trading
    'comprar bitcoin': { action: 'buy', asset: 'bitcoin' },
    'vender bitcoin': { action: 'sell', asset: 'bitcoin' },
    'parar trading': { action: 'stop_trading' },
    'iniciar trading': { action: 'start_trading' },
    'mostrar portfolio': { action: 'show_portfolio' },
    'analisar mercado': { action: 'analyze_market' },
    'parada de emergência': { action: 'emergency_stop' },
    'gerar sinais': { action: 'generate_signals' }
  },
  en: {
    // Trading
    'buy bitcoin': { action: 'buy', asset: 'bitcoin' },
    'sell bitcoin': { action: 'sell', asset: 'bitcoin' },
    'stop trading': { action: 'stop_trading' },
    'start trading': { action: 'start_trading' },
    'show portfolio': { action: 'show_portfolio' },
    'analyze market': { action: 'analyze_market' },
    'emergency stop': { action: 'emergency_stop' },
    'generate signals': { action: 'generate_signals' }
  }
};

export function useVoiceCommands(config: VoiceCommandConfig = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = config.continuous ?? false;
      recognition.interimResults = config.interimResults ?? false;
      recognition.lang = config.language ?? 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        const confidence = event.results[last][0].confidence;

        setTranscript(text);
        
        const command: VoiceCommand = {
          text,
          language: config.language?.startsWith('pt') ? 'pt' : 'en',
          confidence,
          timestamp: new Date()
        };

        setLastCommand(command);
      };

      recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setIsSupported(true);
    }
  }, [config]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
      }
    }
  }, [isListening]);

  const parseCommand = useCallback((text: string) => {
    const normalizedText = text.toLowerCase().trim();
    const commands = config.language?.startsWith('pt') ? VOICE_COMMANDS.pt : VOICE_COMMANDS.en;
    
    for (const [key, value] of Object.entries(commands)) {
      if (normalizedText.includes(key)) {
        return value;
      }
    }
    
    return null;
  }, [config.language]);

  return {
    isListening,
    isSupported,
    lastCommand,
    transcript,
    startListening,
    stopListening,
    parseCommand
  };
}