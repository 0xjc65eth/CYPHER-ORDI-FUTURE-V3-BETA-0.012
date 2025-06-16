/**
 * 🧠 CYPHER AI INTERFACE - CYPHER ORDi FUTURE V3
 * Interface moderna com texto e áudio
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Brain, 
  Sparkles,
  MessageCircle,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Download,
  Zap
} from 'lucide-react';
import { enhancedCypherAI, CypherAIResponse, CypherAIContext } from '@/services/enhanced-cypher-ai';
import { EnhancedLogger } from '@/lib/enhanced-logger';
import { ErrorReporter } from '@/lib/ErrorReporter';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  mood?: string;
  emojis?: string[];
  action?: string;
}

export function CypherAIInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensagem inicial
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'ai',
      content: 'E aí, mano! 👋 Sou a Cypher AI, tua parceira nas crypto! Como posso te ajudar hoje? Quer saber sobre preços, análises, ou configurar um bot maneiro? 🚀',
      timestamp: new Date(),
      mood: 'excited',
      emojis: ['👋', '🚀', '💰'],
      action: 'greeting'
    };
    
    setMessages([welcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      const context: CypherAIContext = {
        conversationHistory: messages.map(m => `${m.type}: ${m.content}`),
        timestamp: Date.now()
      };

      const response = await enhancedCypherAI.processTextInput(inputText, context);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.text,
        audioUrl: response.audioUrl,
        timestamp: new Date(),
        mood: response.mood,
        emojis: response.emojis,
        action: response.action
      };

      setMessages(prev => [...prev, aiMessage]);

      // Reproduzir áudio automaticamente se habilitado
      if (audioEnabled && response.audioUrl) {
        playAudio(response.audioUrl);
      }

      EnhancedLogger.info('Cypher AI message sent successfully', {
        component: 'CypherAIInterface',
        responseConfidence: response.confidence,
        hasAudio: !!response.audioUrl
      });

    } catch (error) {
      ErrorReporter.report(error as Error, {
        component: 'CypherAIInterface',
        action: 'sendMessage',
        message: inputText
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Opa, deu um rolê aqui! 😅 Tenta de novo, mano!',
        timestamp: new Date(),
        mood: 'neutral',
        emojis: ['😅', '⚠️']
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      EnhancedLogger.info('Audio recording started', {
        component: 'CypherAIInterface'
      });

    } catch (error) {
      ErrorReporter.report(error as Error, {
        component: 'CypherAIInterface',
        action: 'startRecording'
      });
      
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    try {
      const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
      
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: '🎤 Mensagem de áudio',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      const context: CypherAIContext = {
        conversationHistory: messages.map(m => `${m.type}: ${m.content}`),
        timestamp: Date.now()
      };

      const response = await enhancedCypherAI.processAudioInput(audioFile);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.text,
        audioUrl: response.audioUrl,
        timestamp: new Date(),
        mood: response.mood,
        emojis: response.emojis,
        action: response.action
      };

      setMessages(prev => [...prev, aiMessage]);

      if (audioEnabled && response.audioUrl) {
        playAudio(response.audioUrl);
      }

    } catch (error) {
      ErrorReporter.report(error as Error, {
        component: 'CypherAIInterface',
        action: 'processAudioInput'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    try {
      if (currentAudio) {
        currentAudio.pause();
      }

      const audio = new Audio(audioUrl);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      setCurrentAudio(audio);
      audio.play();
    } catch (error) {
      EnhancedLogger.warn('Failed to play audio', {
        component: 'CypherAIInterface',
        error: error.message
      });
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    enhancedCypherAI.clearHistory();
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'bullish':
      case 'excited':
        return 'text-green-400';
      case 'bearish':
      case 'cautious':
        return 'text-red-400';
      case 'confident':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'trade':
        return <Zap className="w-4 h-4" />;
      case 'analyze':
        return <Brain className="w-4 h-4" />;
      case 'command':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-black min-h-screen pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="bg-gray-900 border-orange-500/30 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Cypher AI</h1>
                  <p className="text-sm text-gray-400">Sua IA parceira em crypto</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="text-orange-500 hover:bg-orange-500/10"
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearChat}
                  className="text-orange-500 hover:bg-orange-500/10"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Badge className="bg-green-500/20 text-green-400">
                  ONLINE
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Chat Messages */}
        <Card className="bg-gray-900 border-gray-700 mb-6">
          <div className="p-4 h-96 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-800 text-white border border-gray-700'
                }`}>
                  {message.type === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      {getActionIcon(message.action)}
                      <span className={`text-xs font-medium ${getMoodColor(message.mood)}`}>
                        {message.mood?.toUpperCase()}
                      </span>
                      {message.emojis && (
                        <span className="text-xs">
                          {message.emojis.slice(0, 3).join(' ')}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-60">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {message.audioUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => isPlaying ? stopAudio() : playAudio(message.audioUrl!)}
                          className="h-6 w-6 p-0"
                        >
                          {isPlaying ? 
                            <Pause className="w-3 h-3" /> : 
                            <Play className="w-3 h-3" />
                          }
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMessage(message.content)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-400">Cypher pensando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {/* Input Area */}
        <Card className="bg-gray-900 border-gray-700">
          <div className="p-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Fala aí, mano! Pergunta sobre preços, trading, ou qualquer coisa de crypto..."
                  className="bg-gray-800 border-gray-600 text-white resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isProcessing}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  variant={isRecording ? "destructive" : "outline"}
                  className={isRecording ? "animate-pulse" : ""}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
              <span>
                {isRecording ? '🎤 Gravando...' : 'Digite sua mensagem ou clique no mic para falar'}
              </span>
              
              <div className="flex items-center gap-2">
                {audioEnabled && <span>🔊 Áudio ativo</span>}
                <span>💬 {messages.length} mensagens</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CypherAIInterface;