'use client';
import { useState, useCallback } from 'react';

export const useAdvancedVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [latency, setLatency] = useState(0);

  const voiceCommands = [
    { pattern: /preço|price/i, navigation: '/' },
    { pattern: /portfólio|portfolio/i, navigation: '/portfolio' },
    { pattern: /ordinals/i, navigation: '/ordinals' },
    { pattern: /runes/i, navigation: '/runes' },
    { pattern: /rare.*sats/i, navigation: '/rare-sats' },
    { pattern: /dashboard/i, navigation: '/' }
  ];

  const processCommand = useCallback((text: string) => {
    const command = voiceCommands.find(cmd => cmd.pattern.test(text));
    if (command?.navigation) window.location.href = command.navigation;
  }, []);

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      const startTime = performance.now();
      recognition.continuous = false;
      recognition.lang = 'pt-BR';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const endTime = performance.now();
        setLatency(endTime - startTime);
        const result = event.results[0][0].transcript;
        setTranscript(result);
        processCommand(result);
        setTimeout(() => setTranscript(''), 3000);
      };
      recognition.start();
    }
  }, [processCommand]);

  const stopListening = () => setIsListening(false);

  return {
    isListening, transcript, latency, startListening, stopListening,
    isSupported: 'webkitSpeechRecognition' in window
  };
};