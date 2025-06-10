'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, MicOff, Volume2, Bot, Send, Sparkles, Brain, 
  Settings, Globe, TrendingUp, AlertTriangle, 
  BarChart3, Zap, Target, BookOpen, Sidebar,
  DollarSign, ChartBar, Activity
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Tipos de dados
interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  confidence?: number;
  metadata?: {
    intent?: string;
    entities?: any;
    marketData?: any;
    tradingSignal?: any;
  };
}

interface VoiceConfig {
  language: string;
  pitch: number;
  rate: number;
  volume: number;
  voiceName?: string;
  elevenLabsApiKey?: string;
  useElevenLabs: boolean;
}

interface MarketInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  confidence: number;
  timestamp: Date;
  action?: string;
}

interface TradingOpportunity {
  id: string;
  asset: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  price: number;
  target: number;
  stopLoss: number;
  reason: string;
  timeframe: string;
}

// Configurações de idiomas
const LANGUAGES = {
  'pt-BR': {
    name: 'Português (Brasil)',
    flag: '🇧🇷',
    voice: 'pt-BR',
    elevenLabsVoice: 'Rachel' // Voice ID para ElevenLabs
  },
  'en-US': {
    name: 'English (US)',
    flag: '🇺🇸',
    voice: 'en-US',
    elevenLabsVoice: 'Bella'
  },
  'es-ES': {
    name: 'Español',
    flag: '🇪🇸',
    voice: 'es-ES',
    elevenLabsVoice: 'Domi'
  },
  'fr-FR': {
    name: 'Français',
    flag: '🇫🇷',
    voice: 'fr-FR',
    elevenLabsVoice: 'Charlotte'
  }
};

// Traduções
const TRANSLATIONS = {
  'pt-BR': {
    greeting: 'Olá! Sou a CYPHER AI. Como posso ajudar com seus investimentos hoje?',
    listening: 'Ouvindo...',
    speaking: 'Falando...',
    processing: 'Processando...',
    online: 'Online',
    voiceOn: 'Voz ON',
    voiceOff: 'Voz OFF',
    placeholder: 'Digite ou use o microfone...',
    quickCommands: {
      portfolio: 'Ver Portfolio',
      price: 'Preço do Bitcoin',
      buy: 'Comprar $10 em ETH',
      analysis: 'Análise de mercado'
    },
    insights: {
      title: 'Market Insights',
      opportunities: 'Oportunidades',
      learningHub: 'Learning Hub'
    }
  },
  'en-US': {
    greeting: 'Hello! I\'m CYPHER AI. How can I help with your investments today?',
    listening: 'Listening...',
    speaking: 'Speaking...',
    processing: 'Processing...',
    online: 'Online',
    voiceOn: 'Voice ON',
    voiceOff: 'Voice OFF',
    placeholder: 'Type or use microphone...',
    quickCommands: {
      portfolio: 'View Portfolio',
      price: 'Bitcoin Price',
      buy: 'Buy $10 ETH',
      analysis: 'Market Analysis'
    },
    insights: {
      title: 'Market Insights',
      opportunities: 'Opportunities',
      learningHub: 'Learning Hub'
    }
  },
  'es-ES': {
    greeting: '¡Hola! Soy CYPHER AI. ¿Cómo puedo ayudarte con tus inversiones hoy?',
    listening: 'Escuchando...',
    speaking: 'Hablando...',
    processing: 'Procesando...',
    online: 'En línea',
    voiceOn: 'Voz ON',
    voiceOff: 'Voz OFF',
    placeholder: 'Escribe o usa el micrófono...',
    quickCommands: {
      portfolio: 'Ver Portafolio',
      price: 'Precio Bitcoin',
      buy: 'Comprar $10 ETH',
      analysis: 'Análisis de mercado'
    },
    insights: {
      title: 'Insights del Mercado',
      opportunities: 'Oportunidades',
      learningHub: 'Centro de Aprendizaje'
    }
  },
  'fr-FR': {
    greeting: 'Bonjour! Je suis CYPHER AI. Comment puis-je vous aider avec vos investissements aujourd\'hui?',
    listening: 'Écoute...',
    speaking: 'Parlant...',
    processing: 'Traitement...',
    online: 'En ligne',
    voiceOn: 'Voix ON',
    voiceOff: 'Voix OFF',
    placeholder: 'Tapez ou utilisez le microphone...',
    quickCommands: {
      portfolio: 'Voir Portfolio',
      price: 'Prix Bitcoin',
      buy: 'Acheter $10 ETH',
      analysis: 'Analyse du marché'
    },
    insights: {
      title: 'Insights du Marché',
      opportunities: 'Opportunités',
      learningHub: 'Centre d\'Apprentissage'
    }
  }
};

// Sistema de voz avançado com ElevenLabs
class AdvancedVoiceSystem {
  private recognition: any;
  private synthesis: SpeechSynthesis;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private voiceConfig: VoiceConfig;
  
  constructor(config: VoiceConfig) {
    this.voiceConfig = config;
    
    // Configurar reconhecimento de voz
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
    
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }
  
  private setupRecognition() {
    if (!this.recognition) return;
    
    this.recognition.lang = this.voiceConfig.language;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
  }
  
  private loadVoices() {
    // Aguardar carregamento das vozes
    if (this.synthesis.getVoices().length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.loadVoices();
      });
    }
  }
  
  async startListening(
    onResult: (text: string, confidence: number) => void,
    onEnd: () => void,
    onError: (error: any) => void
  ) {
    if (!this.recognition || this.isListening) return;
    
    this.isListening = true;
    
    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let confidence = 0;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        onResult(finalTranscript, confidence);
      }
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };
    
    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error);
    };
    
    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      onError(error);
    }
  }
  
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
  
  async speak(text: string, onEnd?: () => void) {
    if (this.voiceConfig.useElevenLabs && this.voiceConfig.elevenLabsApiKey) {
      await this.speakWithElevenLabs(text, onEnd);
    } else {
      this.speakWithNative(text, onEnd);
    }
  }
  
  private async speakWithElevenLabs(text: string, onEnd?: () => void) {
    try {
      this.isSpeaking = true;
      
      const voiceId = LANGUAGES[this.voiceConfig.language as keyof typeof LANGUAGES]?.elevenLabsVoice || 'Rachel';
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.voiceConfig.elevenLabsApiKey!
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          this.isSpeaking = false;
          URL.revokeObjectURL(audioUrl);
          onEnd?.();
        };
        
        audio.onerror = () => {
          this.isSpeaking = false;
          URL.revokeObjectURL(audioUrl);
          this.speakWithNative(text, onEnd); // Fallback
        };
        
        await audio.play();
      } else {
        throw new Error('ElevenLabs API error');
      }
    } catch (error) {
      console.error('ElevenLabs error:', error);
      this.speakWithNative(text, onEnd); // Fallback para voz nativa
    }
  }
  
  private speakWithNative(text: string, onEnd?: () => void) {
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.voiceConfig.language;
    utterance.pitch = this.voiceConfig.pitch;
    utterance.rate = this.voiceConfig.rate;
    utterance.volume = this.voiceConfig.volume;
    
    // Encontrar melhor voz disponível
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(this.voiceConfig.language.split('-')[0])
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      onEnd?.();
    };
    
    utterance.onerror = () => {
      this.isSpeaking = false;
      onEnd?.();
    };
    
    this.synthesis.speak(utterance);
  }
  
  getIsListening() {
    return this.isListening;
  }
  
  getIsSpeaking() {
    return this.isSpeaking;
  }
  
  updateConfig(config: Partial<VoiceConfig>) {
    this.voiceConfig = { ...this.voiceConfig, ...config };
    this.setupRecognition();
  }
}

// Sistema de processamento de comandos com IA
class SmartCommandProcessor {
  private language: string;
  
  constructor(language: string) {
    this.language = language;
  }
  
  async processCommand(text: string): Promise<{ intent: string; entities: any; confidence: number }> {
    const lowerText = text.toLowerCase();
    
    // Detectar intenção com base no idioma
    const patterns = this.getLanguagePatterns();
    
    for (const [intent, keywords] of Object.entries(patterns)) {
      const match = keywords.find(keyword => lowerText.includes(keyword));
      if (match) {
        const entities = this.extractEntities(lowerText, intent);
        const confidence = this.calculateConfidence(lowerText, match);
        
        return { intent, entities, confidence };
      }
    }
    
    return { intent: 'unknown', entities: {}, confidence: 0 };
  }
  
  private getLanguagePatterns(): Record<string, string[]> {
    const patterns: Record<string, Record<string, string[]>> = {
      'pt-BR': {
        price: ['preço', 'valor', 'cotação', 'quanto está', 'quanto vale', 'custo'],
        portfolio: ['portfolio', 'carteira', 'saldo', 'balanço', 'patrimônio', 'investimentos'],
        buy: ['comprar', 'compre', 'quero comprar', 'adquirir', 'investir em'],
        sell: ['vender', 'venda', 'quero vender', 'liquidar'],
        analysis: ['análise', 'analisar', 'analise', 'relatório', 'estudar'],
        help: ['ajuda', 'comandos', 'o que você pode fazer', 'como usar'],
        market: ['mercado', 'tendência', 'notícias', 'situação'],
        risk: ['risco', 'volatilidade', 'perigo', 'segurança'],
        trading: ['trading', 'negociar', 'operar', 'trade']
      },
      'en-US': {
        price: ['price', 'value', 'quote', 'how much', 'cost', 'worth'],
        portfolio: ['portfolio', 'wallet', 'balance', 'holdings', 'investments'],
        buy: ['buy', 'purchase', 'acquire', 'invest in', 'get'],
        sell: ['sell', 'liquidate', 'dump', 'exit position'],
        analysis: ['analysis', 'analyze', 'report', 'study', 'examine'],
        help: ['help', 'commands', 'what can you do', 'how to use'],
        market: ['market', 'trend', 'news', 'situation', 'condition'],
        risk: ['risk', 'volatility', 'danger', 'safety', 'secure'],
        trading: ['trading', 'trade', 'operate', 'execute']
      },
      'es-ES': {
        price: ['precio', 'valor', 'cotización', 'cuánto está', 'cuánto vale', 'costo'],
        portfolio: ['portafolio', 'cartera', 'saldo', 'balance', 'inversiones'],
        buy: ['comprar', 'adquirir', 'invertir en', 'conseguir'],
        sell: ['vender', 'liquidar', 'salir de posición'],
        analysis: ['análisis', 'analizar', 'reporte', 'estudiar'],
        help: ['ayuda', 'comandos', 'qué puedes hacer', 'cómo usar'],
        market: ['mercado', 'tendencia', 'noticias', 'situación'],
        risk: ['riesgo', 'volatilidad', 'peligro', 'seguridad'],
        trading: ['trading', 'comercio', 'operar', 'negociar']
      },
      'fr-FR': {
        price: ['prix', 'valeur', 'cotation', 'combien', 'coût'],
        portfolio: ['portefeuille', 'solde', 'investissements', 'avoirs'],
        buy: ['acheter', 'acquérir', 'investir dans', 'obtenir'],
        sell: ['vendre', 'liquider', 'sortir de position'],
        analysis: ['analyse', 'analyser', 'rapport', 'étudier'],
        help: ['aide', 'commandes', 'que pouvez-vous faire', 'comment utiliser'],
        market: ['marché', 'tendance', 'nouvelles', 'situation'],
        risk: ['risque', 'volatilité', 'danger', 'sécurité'],
        trading: ['trading', 'commerce', 'opérer', 'négocier']
      }
    };
    
    return patterns[this.language] || patterns['en-US'];
  }
  
  private extractEntities(text: string, intent: string): any {
    const entities: any = {};
    
    // Extrair criptomoedas
    const cryptos = ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'cardano', 'ada'];
    for (const crypto of cryptos) {
      if (text.includes(crypto)) {
        entities.asset = crypto.toUpperCase();
        break;
      }
    }
    
    // Extrair valores monetários
    const amountPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:dólares?|dollars?|usd|R\$|reais?|€|euros?)/i,
      /\$(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:mil|thousand|k)/i
    ];
    
    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        entities.amount = parseFloat(match[1]);
        if (text.includes('mil') || text.includes('thousand') || text.includes('k')) {
          entities.amount *= 1000;
        }
        break;
      }
    }
    
    // Extrair percentuais
    const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percentMatch) {
      entities.percentage = parseFloat(percentMatch[1]);
    }
    
    return entities;
  }
  
  private calculateConfidence(text: string, matchedKeyword: string): number {
    const textLength = text.length;
    const keywordLength = matchedKeyword.length;
    
    // Confiança baseada na relevância da palavra-chave
    let confidence = (keywordLength / textLength) * 100;
    
    // Ajustar baseado na posição da palavra-chave
    const position = text.indexOf(matchedKeyword);
    if (position === 0 || position < textLength * 0.2) {
      confidence *= 1.2; // Boost se palavra-chave está no início
    }
    
    return Math.min(confidence, 95); // Máximo 95%
  }
  
  updateLanguage(language: string) {
    this.language = language;
  }
}

// Componente de Sidebar com Market Insights
const MarketInsightsSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  language: string;
}> = ({ isOpen, onClose, language }) => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [opportunities, setOpportunities] = useState<TradingOpportunity[]>([]);
  const [activeTab, setActiveTab] = useState<'insights' | 'opportunities' | 'learning'>('insights');
  
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS['en-US'];
  
  // Simular dados de market insights
  useEffect(() => {
    const sampleInsights: MarketInsight[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Bitcoin Bullish Breakout',
        description: 'BTC breaking above key resistance at $104,000. Volume confirms move.',
        confidence: 85,
        timestamp: new Date(),
        action: 'Consider long position'
      },
      {
        id: '2',
        type: 'warning',
        title: 'High Volatility Alert',
        description: 'Increased market volatility detected. Risk management recommended.',
        confidence: 92,
        timestamp: new Date(),
        action: 'Reduce position size'
      }
    ];
    
    const sampleOpportunities: TradingOpportunity[] = [
      {
        id: '1',
        asset: 'BTC',
        type: 'buy',
        confidence: 78,
        price: 104390,
        target: 108000,
        stopLoss: 102000,
        reason: 'Technical breakout with volume confirmation',
        timeframe: '4H'
      }
    ];
    
    setInsights(sampleInsights);
    setOpportunities(sampleOpportunities);
  }, []);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-lg z-50 overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.insights.title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>
        
        <div className="flex mt-3 space-x-1">
          <Button
            variant={activeTab === 'insights' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('insights')}
          >
            <Activity className="h-4 w-4 mr-1" />
            Insights
          </Button>
          <Button
            variant={activeTab === 'opportunities' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('opportunities')}
          >
            <Target className="h-4 w-4 mr-1" />
            {t.insights.opportunities}
          </Button>
          <Button
            variant={activeTab === 'learning' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('learning')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Learn
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-full pb-20">
        <div className="p-4">
          {activeTab === 'insights' && (
            <div className="space-y-3">
              {insights.map(insight => (
                <Card key={insight.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {insight.type === 'opportunity' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        <span className="font-medium text-sm">{insight.title}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600">{insight.action}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {insight.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {activeTab === 'opportunities' && (
            <div className="space-y-3">
              {opportunities.map(opportunity => (
                <Card key={opportunity.id} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{opportunity.asset}</span>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      opportunity.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {opportunity.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span>${opportunity.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span>${opportunity.target.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stop Loss:</span>
                      <span>${opportunity.stopLoss.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span>{opportunity.confidence}%</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2">{opportunity.reason}</p>
                </Card>
              ))}
            </div>
          )}
          
          {activeTab === 'learning' && (
            <div className="space-y-3">
              <Card className="p-3">
                <h4 className="font-semibold text-sm mb-2">Smart Money Concepts</h4>
                <p className="text-xs text-gray-600 mb-2">
                  Learn about market structure, liquidity zones, and institutional trading patterns.
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Start Learning
                </Button>
              </Card>
              
              <Card className="p-3">
                <h4 className="font-semibold text-sm mb-2">Risk Management</h4>
                <p className="text-xs text-gray-600 mb-2">
                  Master position sizing, stop losses, and portfolio management strategies.
                </p>
                <Button size="sm" variant="outline" className="w-full text-xs">
                  View Lessons
                </Button>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Componente principal
const CypherAIInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>('pt-BR');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    language: 'pt-BR',
    pitch: 1.0,
    rate: 0.9,
    volume: 1.0,
    useElevenLabs: false,
    elevenLabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
  });
  
  const voiceSystem = useRef<AdvancedVoiceSystem | null>(null);
  const commandProcessor = useRef<SmartCommandProcessor | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const t = TRANSLATIONS[currentLanguage as keyof typeof TRANSLATIONS] || TRANSLATIONS['en-US'];
  
  // Inicializar sistemas
  useEffect(() => {
    voiceSystem.current = new AdvancedVoiceSystem(voiceConfig);
    commandProcessor.current = new SmartCommandProcessor(currentLanguage);
    
    // Mensagem inicial
    const initialMessage: Message = {
      id: '1',
      type: 'assistant',
      content: t.greeting,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    
    // Falar mensagem inicial se voz estiver habilitada
    if (voiceConfig.volume > 0) {
      setTimeout(() => {
        voiceSystem.current?.speak(t.greeting);
      }, 1000);
    }
    
    return () => {
      voiceSystem.current?.stopListening();
    };
  }, []);
  
  // Atualizar configurações quando idioma muda
  useEffect(() => {
    const newConfig = { ...voiceConfig, language: currentLanguage };
    setVoiceConfig(newConfig);
    voiceSystem.current?.updateConfig(newConfig);
    commandProcessor.current?.updateLanguage(currentLanguage);
  }, [currentLanguage]);
  
  // Auto-scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Processar comando do usuário
  const processUserInput = async (text: string, confidence?: number) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      confidence
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Processar comando com IA
      const result = await commandProcessor.current?.processCommand(text);
      
      // Simular chamada para API de IA
      const response = await fetch('/api/cypher-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: currentLanguage,
          intent: result?.intent,
          entities: result?.entities,
          confidence: result?.confidence
        })
      });
      
      let aiResponse = '';
      
      if (response.ok) {
        const data = await response.json();
        aiResponse = data.response;
      } else {
        // Fallback para resposta local
        aiResponse = generateFallbackResponse(text, result?.intent, result?.entities);
      }
      
      // Adicionar resposta da IA
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        metadata: {
          intent: result?.intent,
          entities: result?.entities,
          confidence: result?.confidence
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Falar resposta
      if (voiceConfig.volume > 0) {
        setIsSpeaking(true);
        await voiceSystem.current?.speak(aiResponse, () => {
          setIsSpeaking(false);
        });
      }
      
    } catch (error) {
      console.error('Error processing input:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Gerar resposta fallback
  const generateFallbackResponse = (text: string, intent?: string, entities?: any): string => {
    switch (intent) {
      case 'price':
        const asset = entities?.asset || 'BTC';
        return `O ${asset} está sendo negociado a $${Math.floor(Math.random() * 10000 + 100000).toLocaleString()} agora.`;
        
      case 'portfolio':
        return 'Seu portfolio está avaliado em $56.88M com um lucro de 17.65% hoje.';
        
      case 'analysis':
        return 'Análise do mercado: Bitcoin em tendência de alta, volume crescente. Recomendo cautela com posições alavancadas.';
        
      default:
        return 'Entendi sua solicitação. Como posso ajudá-lo melhor com suas operações?';
    }
  };
  
  // Controlar gravação de voz
  const toggleVoiceRecording = async () => {
    if (!voiceSystem.current) {
      alert('Reconhecimento de voz não suportado');
      return;
    }
    
    if (isListening) {
      voiceSystem.current.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      
      await voiceSystem.current.startListening(
        (text, confidence) => {
          setIsListening(false);
          processUserInput(text, confidence);
        },
        () => setIsListening(false),
        (error) => {
          console.error('Voice recognition error:', error);
          setIsListening(false);
          alert('Erro no reconhecimento de voz. Verifique as permissões.');
        }
      );
    }
  };
  
  // Enviar mensagem
  const handleSendMessage = () => {
    if (inputValue.trim() && !isProcessing) {
      processUserInput(inputValue.trim());
      setInputValue('');
    }
  };
  
  const quickCommands = [
    { icon: '📊', text: t.quickCommands.portfolio },
    { icon: '💰', text: t.quickCommands.price },
    { icon: '💱', text: t.quickCommands.buy },
    { icon: '📈', text: t.quickCommands.analysis }
  ];
  
  return (
    <TooltipProvider>
      <div className="flex h-screen">
        {/* Interface principal */}
        <div className="flex-1 flex flex-col">
          <Card className="flex-1 m-4 flex flex-col">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Brain className="h-8 w-8 text-purple-600" />
                    <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">CYPHER AI</h2>
                    <p className="text-sm text-gray-600">Advanced Trading Intelligence</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Seletor de idioma */}
                  <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LANGUAGES).map(([code, lang]) => (
                        <SelectItem key={code} value={code}>
                          <span className="mr-2">{lang.flag}</span>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Configurações de voz */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={voiceConfig.volume > 0 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setVoiceConfig(prev => ({ ...prev, volume: prev.volume > 0 ? 0 : 1 }))}
                      >
                        <Volume2 className="h-4 w-4 mr-1" />
                        {voiceConfig.volume > 0 ? t.voiceOn : t.voiceOff}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Toggle voice responses</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  {/* Sidebar toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                  >
                    <Sidebar className="h-4 w-4 mr-1" />
                    Insights
                  </Button>
                  
                  {/* Status indicator */}
                  <div className="flex items-center gap-1 text-sm">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      isProcessing ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                    )} />
                    <span className="text-gray-600">
                      {isProcessing ? t.processing : t.online}
                    </span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Área de mensagens */}
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2",
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 border'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString(currentLanguage, {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {message.confidence && (
                            <span className="text-xs bg-white bg-opacity-20 px-1 rounded">
                              {Math.round(message.confidence * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg px-4 py-2 border">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Comandos rápidos */}
              <div className="border-t p-3 bg-gray-50">
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {quickCommands.map((cmd, index) => (
                    <Button
                      key={index}
                      onClick={() => processUserInput(cmd.text)}
                      disabled={isProcessing}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      <span className="mr-1">{cmd.icon}</span>
                      {cmd.text}
                    </Button>
                  ))}
                </div>
                
                {/* Input area */}
                <div className="flex gap-2">
                  <Button
                    onClick={toggleVoiceRecording}
                    disabled={isProcessing}
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    className={cn(
                      "transition-all",
                      isListening && "animate-pulse"
                    )}
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                  
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.placeholder}
                    disabled={isProcessing || isListening}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isProcessing}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Status bar */}
              {(isListening || isSpeaking) && (
                <div className="border-t px-4 py-2 bg-blue-50">
                  <div className="flex items-center gap-2 text-sm">
                    {isListening && (
                      <>
                        <Mic className="h-4 w-4 text-red-500 animate-pulse" />
                        <span className="text-red-500">{t.listening}</span>
                      </>
                    )}
                    {isSpeaking && (
                      <>
                        <Volume2 className="h-4 w-4 text-blue-500 animate-pulse" />
                        <span className="text-blue-500">{t.speaking}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Market Insights Sidebar */}
        <MarketInsightsSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          language={currentLanguage}
        />
      </div>
    </TooltipProvider>
  );
};

export default CypherAIInterface;