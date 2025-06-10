/**
 * 🎤 Voice Command Visual Component
 * Enhanced voice command interface with visual feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';

interface VoiceCommandVisualProps {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  onToggle: () => void;
  isSupported: boolean;
}

export function VoiceCommandVisual({
  isListening,
  isProcessing,
  transcript,
  confidence,
  onToggle,
  isSupported
}: VoiceCommandVisualProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    if (isListening) {
      setPulseAnimation(true);
    } else {
      setPulseAnimation(false);
    }
  }, [isListening]);

  if (!isSupported) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
        <MicOff className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-400">Voice commands not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="text-center">
        {/* Microphone Button */}
        <button
          onClick={onToggle}
          disabled={isProcessing}
          className={`relative w-24 h-24 mx-auto mb-4 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' 
              : 'bg-gray-700 hover:bg-gray-600'
          } ${isProcessing ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className={`absolute inset-0 rounded-full ${
            pulseAnimation ? 'animate-ping' : ''
          } bg-cyan-400 opacity-25`} />
          
          {isProcessing ? (
            <Loader2 className="w-10 h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
          ) : isListening ? (
            <Volume2 className="w-10 h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          ) : (
            <Mic className="w-10 h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </button>

        {/* Status Text */}
        <h3 className="text-lg font-semibold text-white mb-2">
          {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Click to speak'}
        </h3>

        {/* Transcript Display */}
        {transcript && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg">
            <p className="text-gray-300 text-sm mb-2">"{transcript}"</p>
            {confidence > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xs text-gray-500">Confidence:</span>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{(confidence * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Voice Commands Help */}
        <div className="mt-4 text-xs text-gray-400">
          <p className="mb-1">Example commands:</p>
          <p>"Buy Bitcoin with 5% of portfolio"</p>
          <p>"Show market analysis"</p>
          <p>"Stop all trading"</p>
        </div>
      </div>
    </div>
  );
}
