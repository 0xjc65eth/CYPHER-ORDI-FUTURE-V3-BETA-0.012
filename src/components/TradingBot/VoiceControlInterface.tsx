'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  Play,
  Pause,
  Square,
  MessageSquare,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface VoiceCommand {
  id: string;
  timestamp: number;
  command: string;
  confidence: number;
  action: string;
  status: 'processing' | 'completed' | 'failed';
  response?: string;
}

interface VoiceControlInterfaceProps {
  className?: string;
  onVoiceCommand?: (command: string) => void;
}

export default function VoiceControlInterface({ 
  className, 
  onVoiceCommand 
}: VoiceControlInterfaceProps) {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [sensitivity, setSensitivity] = useState(0.7);
  const [language, setLanguage] = useState('en-US');
  const [voiceCommands, setVoiceCommands] = useState<VoiceCommand[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Available voice commands
  const commandPatterns = {
    'start bot': { action: 'start_bot', description: 'Start the trading bot' },
    'stop bot': { action: 'stop_bot', description: 'Stop the trading bot' },
    'pause bot': { action: 'pause_bot', description: 'Pause the trading bot' },
    'emergency stop': { action: 'emergency_stop', description: 'Emergency stop all trading' },
    'show performance': { action: 'show_performance', description: 'Display performance metrics' },
    'show positions': { action: 'show_positions', description: 'Display current positions' },
    'scan arbitrage': { action: 'scan_arbitrage', description: 'Scan for arbitrage opportunities' },
    'increase risk': { action: 'increase_risk', description: 'Increase risk tolerance' },
    'decrease risk': { action: 'decrease_risk', description: 'Decrease risk tolerance' },
    'mute alerts': { action: 'mute_alerts', description: 'Mute audio alerts' },
    'unmute alerts': { action: 'unmute_alerts', description: 'Unmute audio alerts' },
    'status report': { action: 'status_report', description: 'Get bot status report' }
  };

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isEnabled) {
          // Auto-restart if enabled
          setTimeout(() => {
            if (isEnabled && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 1000);
        }
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
            processVoiceCommand(transcript.toLowerCase().trim(), confidence);
          } else {
            interimTranscript += transcript;
          }
        }
        
        setCurrentTranscript(finalTranscript || interimTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, isEnabled]);

  const processVoiceCommand = async (transcript: string, confidence: number) => {
    if (confidence < sensitivity) {
      return;
    }

    setIsProcessing(true);

    // Find matching command
    let matchedCommand = null;
    let action = '';

    for (const [pattern, commandInfo] of Object.entries(commandPatterns)) {
      if (transcript.includes(pattern)) {
        matchedCommand = pattern;
        action = commandInfo.action;
        break;
      }
    }

    const command: VoiceCommand = {
      id: `cmd_${Date.now()}`,
      timestamp: Date.now(),
      command: transcript,
      confidence,
      action: action || 'unknown',
      status: 'processing'
    };

    setVoiceCommands(prev => [command, ...prev.slice(0, 9)]);

    try {
      if (matchedCommand && onVoiceCommand) {
        onVoiceCommand(action);
        
        // Update command status
        setVoiceCommands(prev => 
          prev.map(cmd => 
            cmd.id === command.id 
              ? { ...cmd, status: 'completed', response: `Executed: ${matchedCommand}` }
              : cmd
          )
        );

        // Provide audio feedback
        if (audioEnabled) {
          speak(`Command executed: ${matchedCommand}`);
        }
      } else {
        // Unknown command
        setVoiceCommands(prev => 
          prev.map(cmd => 
            cmd.id === command.id 
              ? { ...cmd, status: 'failed', response: 'Command not recognized' }
              : cmd
          )
        );

        if (audioEnabled) {
          speak('Command not recognized');
        }
      }
    } catch (error) {
      console.error('Voice command processing error:', error);
      setVoiceCommands(prev => 
        prev.map(cmd => 
          cmd.id === command.id 
            ? { ...cmd, status: 'failed', response: 'Error processing command' }
            : cmd
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current || !audioEnabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsEnabled(false);
    } else {
      recognitionRef.current.start();
      setIsEnabled(true);
    }
  };

  const VoiceControlPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Control
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? 'Active' : 'Inactive'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className="flex-1"
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </>
            )}
          </Button>
          
          <Button
            onClick={() => setAudioEnabled(!audioEnabled)}
            variant="outline"
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </Button>
        </div>

        {isListening && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Listening...</span>
              <span className="text-green-600">
                {isProcessing ? 'Processing' : 'Ready'}
              </span>
            </div>
            
            {currentTranscript && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium">Current:</div>
                <div className="text-blue-600">{currentTranscript}</div>
                {confidence > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs">Confidence:</span>
                    <Progress value={confidence * 100} className="flex-1 h-2" />
                    <span className="text-xs">{(confidence * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="voice-enabled">Voice Commands</Label>
            <Switch
              id="voice-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="audio-feedback">Audio Feedback</Label>
            <Switch
              id="audio-feedback"
              checked={audioEnabled}
              onCheckedChange={setAudioEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sensitivity">Sensitivity</Label>
            <div className="flex items-center gap-2">
              <input
                id="sensitivity"
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm w-12">{(sensitivity * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CommandHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Command History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {voiceCommands.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No voice commands yet
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {voiceCommands.map((cmd) => (
              <div key={cmd.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{cmd.command}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(cmd.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        cmd.status === 'completed' ? 'default' :
                        cmd.status === 'failed' ? 'destructive' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {cmd.status === 'processing' ? (
                        <Activity className="w-3 h-3 mr-1 animate-spin" />
                      ) : cmd.status === 'completed' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {cmd.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span>Action: {cmd.action}</span>
                  <span>Confidence: {(cmd.confidence * 100).toFixed(0)}%</span>
                </div>
                
                {cmd.response && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {cmd.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AvailableCommands = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Available Commands
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.entries(commandPatterns).map(([command, info]) => (
            <div key={command} className="border rounded-lg p-3">
              <div className="font-medium text-sm">"{command}"</div>
              <div className="text-xs text-gray-600 mt-1">{info.description}</div>
              <Badge variant="outline" className="text-xs mt-2">
                {info.action}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const VoiceStatus = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Voice Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {voiceCommands.filter(cmd => cmd.status === 'completed').length}
            </div>
            <div className="text-sm text-blue-600">Executed</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {voiceCommands.filter(cmd => cmd.status === 'failed').length}
            </div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Recognition Status:</span>
            <Badge variant={isListening ? "default" : "secondary"}>
              {isListening ? 'Listening' : 'Stopped'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Audio Feedback:</span>
            <Badge variant={audioEnabled ? "default" : "secondary"}>
              {audioEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Language:</span>
            <span>{language}</span>
          </div>
          <div className="flex justify-between">
            <span>Sensitivity:</span>
            <span>{(sensitivity * 100).toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Voice Control Interface</h2>
        <div className="flex items-center gap-2">
          {isListening && (
            <Badge variant="default" className="animate-pulse">
              <Mic className="w-3 h-3 mr-1" />
              Listening
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary">
              <Activity className="w-3 h-3 mr-1 animate-spin" />
              Processing
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <VoiceControlPanel />
          <VoiceStatus />
        </div>
        <div className="space-y-6">
          <CommandHistory />
          <AvailableCommands />
        </div>
      </div>
    </div>
  );
}