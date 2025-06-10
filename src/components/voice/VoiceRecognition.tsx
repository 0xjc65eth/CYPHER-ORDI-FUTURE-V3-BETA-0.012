'use client';

import React, { useState, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

export const VoiceRecognition: React.FC<{
  onTranscript?: (transcript: string) => void;
  className?: string;
}> = ({ onTranscript, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if ('webkitSpeechRecognition' in window) {
      if (!recognitionRef.current) {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'pt-BR';
        
        recognition.onresult = (event: any) => {
          let result = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              result += event.results[i][0].transcript;
            }
          }
          if (result) onTranscript?.(result);
        };
        
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }

      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };
  return (
    <button
      onClick={toggleListening}
      className={`p-3 rounded-full transition-all ${
        isListening 
          ? 'bg-green-500/20 border-2 border-green-400' 
          : 'bg-gray-800 border-2 border-orange-500/30'
      } ${className}`}
    >
      {isListening ? <Mic className="w-5 h-5 text-green-400" /> : <MicOff className="w-5 h-5 text-gray-400" />}
    </button>
  );
};

export default VoiceRecognition;