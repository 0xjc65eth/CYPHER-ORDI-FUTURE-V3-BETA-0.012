/**
 * 🎤 AGENT_011: Advanced Voice Command Interface v3.1.0
 * Optimized voice recognition with multi-agent integration
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Brain, Loader2, Zap } from 'lucide-react';
import VoiceRecognition from './VoiceRecognition';
import useMultiAgent from '@/hooks/useMultiAgent';

interface VoiceCommandInterfaceProps {
  className?: string;
}

export const VoiceCommandInterface: React.FC<VoiceCommandInterfaceProps> = ({ 
  className = '' 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [response, setResponse] = useState('');
  
  const { processVoice, isLoading } = useMultiAgent();

  const handleVoiceTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    setLastCommand(transcript);
    
    try {
      // Process voice command through multi-agent system
      const taskId = await processVoice(transcript);
      setResponse('Command processed successfully!');
      
      // Auto-execute common commands
      if (transcript.toLowerCase().includes('preço') || transcript.toLowerCase().includes('price')) {
        // Navigate to price info or update display
        setResponse('Showing Bitcoin price information...');
      } else if (transcript.toLowerCase().includes('portfolio')) {
        setResponse('Opening portfolio view...');
      } else if (transcript.toLowerCase().includes('ordinals')) {
        setResponse('Opening Ordinals page...');
        window.location.href = '/ordinals';
      } else if (transcript.toLowerCase().includes('wallet')) {
        setResponse('Opening wallet connection...');
      }
      
    } catch (error) {
      setResponse('Sorry, I didn\'t understand that command.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setResponse(''), 3000);
    }
  }, [processVoice]);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-3">
        <VoiceRecognition 
          onTranscript={handleVoiceTranscript}
          className="voice-button"
        />
        
        {/* Status Indicator */}
        {(isProcessing || response) && (
          <div className="bg-gray-800 border border-orange-500/20 rounded-lg p-2 min-w-[200px]">
            {isProcessing ? (
              <div className="flex items-center space-x-2 text-yellow-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Processing...</span>
              </div>
            ) : (
              <div className="text-sm text-green-400">{response}</div>
            )}
            {lastCommand && (
              <div className="text-xs text-gray-400 mt-1">"{lastCommand}"</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCommandInterface;
