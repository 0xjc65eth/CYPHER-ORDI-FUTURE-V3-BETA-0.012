'use client'

/**
 * 🧠 CYPHER AI v2 - Página Principal
 * Versão completa com capacidades Gemini-like integradas
 */

import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useCypherAIv2 } from '@/hooks/useCypherAIv2';
import type { ConversationMessage, AIPersonality } from '@/ai/cypher-v2/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserIcon,
  CpuChipIcon,
  BoltIcon,
  SparklesIcon,
  ChartLineIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  Brain, 
  Activity,
  Bot,
  Wallet,
  TrendingUp,
  BarChart3,
  Settings,
  Info
} from 'lucide-react';

const CypherAIPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    // States
    isInitialized,
    isProcessing,
    isThinking,
    isListening,
    isSpeaking,
    isStreaming,
    messages,
    currentMessage,
    suggestions,
    dialogState,
    conversationInsights,
    voiceEnabled,
    voiceAmplitude,
    marketData,
    userExpertise,
    personality,
    activeStreams,
    streamingProgress,
    
    // Actions
    sendMessage,
    startListening,
    stopListening,
    toggleVoice,
    setPersonality,
    setUserExpertise,
    selectSuggestion,
    resetConversation,
    clearMessages,
    
    // Error
    error
  } = useCypherAIv2();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentMessage]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    try {
      await sendMessage(inputText);
      setInputText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (message: ConversationMessage) => {
    switch (message.role) {
      case 'user':
        return <UserIcon className="w-4 h-4 text-blue-500" />;
      case 'assistant':
        return <CpuChipIcon className="w-4 h-4 text-green-500" />;
      case 'system':
        return <ChartBarIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <CpuChipIcon className="w-4 h-4" />;
    }
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'excited': return 'text-green-600';
      case 'concerned': return 'text-orange-600';
      case 'analytical': return 'text-blue-600';
      case 'confident': return 'text-purple-600';
      case 'happy': return 'text-green-500';
      default: return 'text-gray-300';
    }
  };

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'greeting': return 'bg-green-500/20 text-green-400';
      case 'information_gathering': return 'bg-blue-500/20 text-blue-400';
      case 'analysis': return 'bg-purple-500/20 text-purple-400';
      case 'recommendation': return 'bg-orange-500/20 text-orange-400';
      case 'conclusion': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!isInitialized) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-300">Inicializando CYPHER AI v2...</h2>
            <p className="text-gray-500 mt-2">Carregando capacidades avançadas com Gemini</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  CYPHER AI v2
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    Gemini Enhanced
                  </Badge>
                </h1>
                <p className="text-sm text-gray-400">Advanced Trading Intelligence with Natural Language</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                {isInitialized ? 'Online' : 'Offline'}
              </Badge>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <SparklesIcon className="w-4 h-4" />
                <span>{activeStreams > 0 ? `${activeStreams} streams ativos` : '130 Workers Ativo'}</span>
              </div>
              
              {/* Settings Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-400 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              {/* Voice Control */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleVoice}
                className={voiceEnabled ? 'text-green-400' : 'text-gray-400'}
              >
                {voiceEnabled ? (
                  <SpeakerWaveIcon className="w-5 h-5" />
                ) : (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                )}
              </Button>
              
              {/* Reset Conversation */}
              <Button
                size="sm"
                variant="ghost"
                onClick={resetConversation}
                className="text-gray-400 hover:text-white"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="mt-3 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded ${getPhaseColor(dialogState.phase)}`}>
                {dialogState.phase || 'ready'}
              </span>
              {dialogState.topic && (
                <span className="text-gray-500">• Tópico: {dialogState.topic}</span>
              )}
            </div>
            
            {isStreaming && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-400">Streaming... {Math.round(streamingProgress * 100)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-b border-gray-700 bg-gray-800 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1">Expertise</label>
                <select
                  value={userExpertise}
                  onChange={(e) => setUserExpertise(e.target.value as any)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-1 text-sm"
                >
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1">Personalidade</label>
                <select
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value as AIPersonality)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-1 text-sm"
                >
                  <option value="professional">Profissional</option>
                  <option value="friendly">Amigável</option>
                  <option value="analytical">Analítica</option>
                  <option value="casual">Casual</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Market Stats Bar */}
        {marketData?.bitcoin && (
          <div className="bg-gray-800 p-3 border-b border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-400">Bitcoin:</span>
                  <span className="text-white font-mono">${marketData.bitcoin.price?.toLocaleString()}</span>
                </div>
                
                {marketData.bitcoin.change24h !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">24h:</span>
                    <span className={`font-mono ${marketData.bitcoin.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketData.bitcoin.change24h > 0 ? '+' : ''}{marketData.bitcoin.change24h.toFixed(2)}%
                    </span>
                  </div>
                )}
                
                {marketData.bitcoin.source && (
                  <Badge className="bg-gray-700 text-gray-400 text-xs">
                    Fonte: {marketData.bitcoin.source}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden bg-gray-950">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role !== 'user' && (
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'assistant' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                        : 'bg-gray-700'
                    }`}>
                      {getMessageIcon(message)}
                    </div>
                  </div>
                )}
                
                <div className={`max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-orange-600 text-white' 
                      : message.role === 'system' 
                      ? 'bg-gray-800 text-gray-300' 
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    <div className={`whitespace-pre-wrap text-sm leading-relaxed ${getEmotionColor(message.emotion)}`}>
                      {message.content}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{message.timestamp?.toLocaleTimeString()}</span>
                    {message.confidence && (
                      <span>• Confiança: {Math.round(message.confidence * 100)}%</span>
                    )}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      {getMessageIcon(message)}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Current streaming message */}
            {currentMessage && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <CpuChipIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="max-w-2xl">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-100 whitespace-pre-wrap">
                      {currentMessage}
                      <span className="animate-pulse">|</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm">Analisando com Gemini AI...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="px-6 py-3 bg-gray-800 border-t border-gray-700">
            <p className="text-sm text-yellow-400 mb-2">💡 Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            {/* Voice button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={isListening ? stopListening : startListening}
              className={`p-2 ${isListening ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'}`}
              disabled={!voiceEnabled}
              style={{
                transform: isListening ? `scale(${1.1 + voiceAmplitude / 200})` : 'scale(1)'
              }}
            >
              <MicrophoneIcon className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pergunte sobre Bitcoin, análises, trading, ordinals..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                disabled={isProcessing}
              />
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            {isProcessing && <span className="text-blue-400">Processando...</span>}
            {isSpeaking && <span className="text-green-400">🔊 Falando...</span>}
            {isListening && <span className="text-red-400">🎤 Escutando...</span>}
            <span>• Análise em tempo real com Gemini AI</span>
            <span>• 130 workers processando dados</span>
            <span>• Precisão de {dialogState.confidence ? Math.round(dialogState.confidence * 100) : 87}%</span>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/20 border-t border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CypherAIPage;