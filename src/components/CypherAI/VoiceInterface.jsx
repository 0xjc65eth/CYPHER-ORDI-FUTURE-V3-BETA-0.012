'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, MicOff, Volume2, VolumeX, Brain, 
  Sparkles, Zap, TrendingUp, DollarSign,
  Play, Pause, Settings, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Hook personalizado para Speech Recognition
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'pt-BR';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event) => {
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
            setTranscript(finalTranscript);
            setConfidence(confidence);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setConfidence(0);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    supported: !!recognitionRef.current
  };
};

// Componente de Visualização de Ondas Sonoras
const SoundWave = ({ isActive, amplitude = 0.5 }) => {
  const [waves, setWaves] = useState([]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setWaves(prev => [
          ...prev.slice(-20),
          Math.random() * amplitude + 0.1
        ]);
      }, 50);

      return () => clearInterval(interval);
    } else {
      setWaves([]);
    }
  }, [isActive, amplitude]);

  return (
    <div className="flex items-center justify-center h-16 gap-1">
      {Array.from({ length: 20 }, (_, i) => {
        const height = waves[i] ? waves[i] * 40 : 4;
        return (
          <div
            key={i}
            className={cn(
              "w-1 bg-gradient-to-t transition-all duration-100",
              isActive 
                ? "from-purple-400 to-purple-600" 
                : "from-gray-300 to-gray-400"
            )}
            style={{ 
              height: `${height}px`,
              opacity: isActive ? 0.8 : 0.3
            }}
          />
        );
      })}
    </div>
  );
};

// Sistema de Comandos de Voz Inteligente
class VoiceCommandSystem {
  constructor() {
    this.wakeWords = ['cypher', 'ei cypher', 'hey cypher', 'oi cypher'];
    this.commands = {
      // Comandos de análise
      'analise oportunidades': { action: 'analyze_opportunities', category: 'analysis' },
      'analise bitcoin': { action: 'analyze_bitcoin', category: 'analysis' },
      'como está o mercado': { action: 'market_status', category: 'analysis' },
      'tendência do bitcoin': { action: 'bitcoin_trend', category: 'analysis' },
      
      // Comandos de trading
      'execute trades': { action: 'execute_trades', category: 'trading' },
      'comprar bitcoin': { action: 'buy_bitcoin', category: 'trading' },
      'vender bitcoin': { action: 'sell_bitcoin', category: 'trading' },
      'mostrar portfolio': { action: 'show_portfolio', category: 'portfolio' },
      
      // Comandos de preço
      'preço do bitcoin': { action: 'bitcoin_price', category: 'price' },
      'preço do ethereum': { action: 'ethereum_price', category: 'price' },
      'alertas de preço': { action: 'price_alerts', category: 'alerts' },
      
      // Comandos de ajuda
      'ajuda': { action: 'help', category: 'help' },
      'o que você pode fazer': { action: 'capabilities', category: 'help' },
      'comandos disponíveis': { action: 'list_commands', category: 'help' }
    };
  }

  detectWakeWord(text) {
    const lowerText = text.toLowerCase();
    return this.wakeWords.some(word => lowerText.includes(word));
  }

  parseCommand(text) {
    const lowerText = text.toLowerCase();
    
    // Procurar comando exato
    for (const [command, config] of Object.entries(this.commands)) {
      if (lowerText.includes(command)) {
        return {
          command,
          action: config.action,
          category: config.category,
          confidence: 0.9,
          originalText: text
        };
      }
    }

    // Procurar comando similar (fuzzy matching simples)
    const words = lowerText.split(' ');
    for (const [command, config] of Object.entries(this.commands)) {
      const commandWords = command.split(' ');
      const matchCount = commandWords.filter(word => words.includes(word)).length;
      const similarity = matchCount / commandWords.length;
      
      if (similarity > 0.6) {
        return {
          command,
          action: config.action,
          category: config.category,
          confidence: similarity,
          originalText: text
        };
      }
    }

    return {
      command: 'unknown',
      action: 'unknown',
      category: 'unknown',
      confidence: 0,
      originalText: text
    };
  }
}

// Personalidade de Trader Brasileiro
class BrazilianTraderPersonality {
  constructor() {
    this.responses = {
      greeting: [
        "E aí, parceiro! Beleza? Sou a Cypher AI, sua parceira nos trades! 🚀",
        "Salve, meu chapa! Pronto pra fazer uns trades insanos hoje? 💰",
        "Opa, e aí? Tô aqui pra te ajudar a lucrar muito! Bora pro trade! 📈"
      ],
      
      bitcoin_price: [
        "Olha só, o Bitcoin tá ${price}! Movimento interessante, hein? 👀",
        "Bitcoin em ${price}, meu parceiro! Tá vendo alguma oportunidade aí? 🔥",
        "O pai dos bitcoins tá ${price} agora! E aí, tá pensando em entrar? 💎"
      ],
      
      market_bullish: [
        "Cara, o mercado tá MUITO VERDE hoje! Hora de surfar a onda! 🌊",
        "Mercado bombando, parceiro! Os touros tão dominando! 🐂",
        "Que movimento lindo! Tá chovendo dinheiro hoje! 💸"
      ],
      
      market_bearish: [
        "Opa, cuidado aí! Mercado meio vermelho, mas sempre tem oportunidade! 📉",
        "Mercado corrigindo, mas calma! Trader raiz não se desespera! 😎",
        "Mercado em queda, mas lembra: compra no medo, vende na euforia! 💪"
      ],
      
      trading_advice: [
        "Minha dica: sempre use stop loss, meu parceiro! Protege o patrimônio! 🛡️",
        "Lembra da regra de ouro: nunca invista mais do que pode perder! 💡",
        "Análise técnica + gerenciamento de risco = sucesso garantido! 📊"
      ],
      
      opportunities: [
        "Opa! Tô vendo umas oportunidades bacanas aqui! Quer que eu analise? 🎯",
        "Movimento interessante no ${asset}! Vale a pena dar uma olhada! 👁️",
        "Sinal de entrada aparecendo no radar! Bora analisar juntos? 🚨"
      ],
      
      encouragement: [
        "Vai com tudo, parceiro! Você tem potencial pra ser um trader foda! 💪",
        "Confia no processo! Todo grande trader passou por essa jornada! 🌟",
        "Cada trade é um aprendizado! Foco na disciplina! 🎓"
      ],
      
      errors: [
        "Ops, deu ruim aqui! Mas relaxa, já vou resolver! 😅",
        "Eita, bugou! Mas tô aqui pra te ajudar sempre! 🔧",
        "Falha técnica, parceiro! Mas a gente não desiste! 💻"
      ]
    };

    this.gírias = [
      'véi', 'parceiro', 'meu chapa', 'cara', 'brother', 'mano',
      'irmão', 'foca', 'tá ligado', 'massa', 'top', 'insano',
      'absurdo', 'mitou', 'mandou bem', 'arrasou', 'quebrou tudo'
    ];
  }

  getResponse(category, data = {}) {
    const responses = this.responses[category] || this.responses.greeting;
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Substituir variáveis na resposta
    return response.replace(/\${(\w+)}/g, (match, key) => {
      return data[key] || match;
    });
  }

  addGíria(text) {
    const gíria = this.gírias[Math.floor(Math.random() * this.gírias.length)];
    return `${text}, ${gíria}!`;
  }
}

// Componente Principal
const VoiceInterface = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentCommand, setCurrentCommand] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const voiceSystem = useRef(new VoiceCommandSystem());
  const personality = useRef(new BrazilianTraderPersonality());
  
  const {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    supported
  } = useSpeechRecognition();

  // Text-to-Speech
  const speak = useCallback((text) => {
    if (!isVoiceEnabled || isSpeaking) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Encontrar voz feminina em português
    const voices = speechSynthesis.getVoices();
    const ptVoice = voices.find(voice => 
      voice.lang.includes('pt') && voice.name.includes('female')
    ) || voices.find(voice => voice.lang.includes('pt'));
    
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  }, [isVoiceEnabled, isSpeaking]);

  // Processar comando de voz
  const processVoiceCommand = useCallback(async (text) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    // Detectar wake word
    const hasWakeWord = voiceSystem.current.detectWakeWord(text);
    const command = voiceSystem.current.parseCommand(text);
    
    // Adicionar ao histórico
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      confidence,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    setCurrentCommand(command);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let response = '';
    
    if (hasWakeWord || command.confidence > 0.6) {
      switch (command.action) {
        case 'analyze_opportunities':
          response = "Analisando oportunidades no mercado... Bitcoin subindo, Ethereum consolidando, várias altcoins com movimento interessante! Quer que eu detalhe alguma específica?";
          break;
          
        case 'bitcoin_price':
          response = personality.current.getResponse('bitcoin_price', { 
            price: '$104,390' 
          });
          break;
          
        case 'market_status':
          response = personality.current.getResponse('market_bullish');
          break;
          
        case 'execute_trades':
          response = "Pra executar trades, preciso que você confirme! Qual ativo quer negociar e qual valor? Sempre com responsabilidade, né parceiro!";
          break;
          
        case 'show_portfolio':
          response = "Seu portfólio tá assim: BTC: 0.5 ($52,195), ETH: 2.3 ($7,820), Total: $60,015. Rendimento de +12.3% no mês! Mandou bem!";
          break;
          
        case 'help':
          response = "Posso te ajudar com análises de mercado, preços, executar trades, mostrar portfolio e muito mais! Só falar 'Cypher' antes do comando!";
          break;
          
        default:
          response = "Entendi sua solicitação! Como posso ajudar melhor com seus trades hoje?";
      }
    } else {
      response = "Não entendi bem, parceiro! Tenta falar 'Cypher' antes do comando. Ou diz 'ajuda' pra ver o que posso fazer!";
    }
    
    // Adicionar resposta da IA
    const aiMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      command: command.action
    };
    
    setConversationHistory(prev => [...prev, aiMessage]);
    
    // Falar resposta
    if (isVoiceEnabled) {
      speak(response);
    }
    
    setIsProcessing(false);
  }, [confidence, isVoiceEnabled, speak]);

  // Efeito para processar transcript
  useEffect(() => {
    if (transcript && !isListening && !isProcessing) {
      processVoiceCommand(transcript);
    }
  }, [transcript, isListening, isProcessing, processVoiceCommand]);

  // Comandos rápidos
  const quickCommands = [
    { text: "Analise oportunidades", icon: "🎯", action: () => processVoiceCommand("Cypher analise oportunidades") },
    { text: "Preço do Bitcoin", icon: "₿", action: () => processVoiceCommand("Cypher preço do bitcoin") },
    { text: "Mostrar portfolio", icon: "📊", action: () => processVoiceCommand("Cypher mostrar portfolio") },
    { text: "Status do mercado", icon: "📈", action: () => processVoiceCommand("Cypher como está o mercado") }
  ];

  if (!supported) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <Alert>
            <AlertDescription>
              Reconhecimento de voz não suportado neste navegador. 
              Tente usar Chrome, Edge ou Safari mais recentes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-purple-600" />
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                CYPHER AI VOICE
              </h2>
              <p className="text-sm text-gray-600">Seu Parceiro de Trading Brasileiro</p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant={isListening ? "destructive" : "secondary"}>
                {isListening ? "🎤 Ouvindo" : "⏸️ Parado"}
              </Badge>
              <Badge variant={isSpeaking ? "default" : "outline"}>
                {isSpeaking ? "🗣️ Falando" : "🔇 Silêncio"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Interface Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Controles de Voz */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Controle de Voz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visualização de Ondas */}
            <div className="bg-gray-50 rounded-lg p-4">
              <SoundWave isActive={isListening || isSpeaking} amplitude={0.7} />
            </div>
            
            {/* Controles */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing || isSpeaking}
                size="lg"
                variant={isListening ? "destructive" : "default"}
                className={cn(
                  "h-16 w-16 rounded-full transition-all",
                  isListening && "animate-pulse scale-110"
                )}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
              
              <Button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                variant="outline"
                size="lg"
                className="h-16 w-16 rounded-full"
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-6 w-6" />
                ) : (
                  <VolumeX className="h-6 w-6" />
                )}
              </Button>
            </div>
            
            {/* Status */}
            <div className="text-center space-y-2">
              {isProcessing && (
                <p className="text-sm text-blue-600">
                  🤖 Processando comando...
                </p>
              )}
              
              {transcript && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">Última transcrição:</p>
                  <p className="text-blue-700">"{transcript}"</p>
                  {confidence > 0 && (
                    <p className="text-xs text-gray-500">
                      Confiança: {Math.round(confidence * 100)}%
                    </p>
                  )}
                </div>
              )}
              
              {currentCommand && currentCommand.confidence > 0.6 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium">Comando detectado:</p>
                  <p className="text-green-700">{currentCommand.command}</p>
                  <Badge variant="default" className="mt-1">
                    {currentCommand.category}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Comandos Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Comandos Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickCommands.map((cmd, index) => (
                <Button
                  key={index}
                  onClick={cmd.action}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <span className="mr-2">{cmd.icon}</span>
                  {cmd.text}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                💡 <strong>Dica:</strong> Fale "Cypher" antes do comando para ativar!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Conversação */}
      {conversationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Conversa com Cypher AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {conversationHistory.slice(-6).map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg",
                    message.type === 'user' 
                      ? "bg-blue-50 border-l-4 border-blue-400" 
                      : "bg-purple-50 border-l-4 border-purple-400"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={message.type === 'user' ? "default" : "secondary"}>
                      {message.type === 'user' ? '👤 Você' : '🤖 Cypher'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.confidence && (
                      <Badge variant="outline" className="text-xs">
                        {Math.round(message.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceInterface;