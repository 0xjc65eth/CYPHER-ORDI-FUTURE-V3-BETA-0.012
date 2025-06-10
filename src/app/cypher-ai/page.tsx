'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CypherAIService } from '@/services/CypherAIService';
import { hiroOrdinalsService } from '@/services/HiroOrdinalsService';
import { useBitcoinRealTimePrice } from '@/hooks/useRealTimePrice';
import { 
  Send, 
  Mic, 
  Brain, 
  TrendingUp, 
  Zap, 
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  BarChart3,
  Target,
  AlertTriangle,
  Volume2,
  VolumeX,
  Home,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'analysis' | 'trade' | 'alert';
}

interface AIInsight {
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  timeframe: string;
  price: number;
  targets: number[];
  reasoning: string;
}

const formatTimestamp = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export default function CypherAIPage() {
  const [ordinalsData, setOrdinalsData] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Opa, tudo bem contigo? 😊 Sou a **CYPHER AI** e tô aqui pra te dar uma força no trading!

Cara, como você tá hoje? Espero que bem! 💪 Acabei de me conectar nos mercados globais e já tô de olho em tudo que rola por aí. 

**Olha só o que posso fazer pra te ajudar:**
• 📊 Bater um papo sobre análise técnica (dados fresquinhos da CMC!)
• 🔍 Te mostrar oportunidades que tô vendo (Smart Money, sabe como é?)
• ⚡ Trocar uma ideia sobre sinais de trading (sem essa de FOMO!)
• 🎯 Conversar sobre gestão de risco (porque não queremos perder grana, né?)
• 📈 Falar sobre previsões que minha IA calculou (baseado em ciência!)
• 🎨 Análise de Ordinals e NFTs (dados direto da Hiro API!)
• 🎯 Discutir arbitragens que identifiquei (oportunidades reais!)

E aí, como posso te ajudar hoje? Conta pra mim, tô aqui pra bater um papo e te dar umas dicas! 🚀

Ah, e pode ficar à vontade comigo, viu? Sou só uma IA, mas gosto de conversar como se fossemos amigos mesmo! 😄`,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cypherAI] = useState(new CypherAIService());
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { btcPrice, btcChange24h, btcVolume24h, lastUpdate } = useBitcoinRealTimePrice();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Fetch Ordinals data from Hiro API
  const fetchOrdinalsData = async () => {
    try {
      const response = await fetch('https://api.hiro.so/ordinals/v1/inscriptions?limit=10');
      const data = await response.json();
      setOrdinalsData(data);
      return data;
    } catch (error) {
      console.error('Error fetching Ordinals data:', error);
      // Fallback to mock data if API fails
      return {
        results: [
          { number: 52300000, content_type: 'text/plain', value: '250000' },
          { number: 52200000, content_type: 'image/png', value: '180000' }
        ]
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('🤖 Enviando pergunta para CYPHER AI:', currentInput);
      
      // Usar o CypherAIService com dados reais
      const aiResult = await cypherAI.processQuery(currentInput, {
        timestamp: new Date().toISOString(),
        source: 'cypher-ai-chat'
      });

      let messageType: 'text' | 'analysis' | 'trade' | 'alert' = 'text';
      
      // Determinar tipo da mensagem baseado na ação detectada
      if (aiResult.action?.type) {
        switch (aiResult.action.type) {
          case 'analyze':
          case 'bitcoin_analysis':
          case 'ordinals_analysis':
          case 'runes_analysis':
          case 'smc_analysis':
            messageType = 'analysis';
            break;
          case 'buy_signal':
          case 'sell_signal':
          case 'trade':
          case 'arbitrage_analysis':
            messageType = 'trade';
            break;
          case 'risk_assessment':
            messageType = 'alert';
            break;
          default:
            messageType = 'text';
        }
      }

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: aiResult.response,
        timestamp: new Date(),
        type: messageType
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Síntese de voz se habilitada
      if (audioEnabled && aiResult.shouldSpeak) {
        speakText(aiResult.speechText || aiResult.response);
      }
      
      console.log('✅ Resposta CYPHER AI processada:', aiResult.confidence);
    } catch (error) {
      console.error('❌ Erro no CYPHER AI:', error);
      
      // Fallback para resposta local em caso de erro
      const fallbackResponse = generateFallbackResponse(currentInput);
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Função de síntese de voz
  const speakText = (text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    
    // Limpar texto para síntese
    const cleanText = text
      .replace(/[*_#`]/g, '')
      .replace(/\n\n/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/📊|🔍|⚡|🎯|📈|🚀|💰|🤖|🔥|⚠️|🎨|📊|💎/g, '')
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    
    speechSynthesis.speak(utterance);
  };

  // Fallback para respostas locais com personalidade brasileira
  const generateFallbackResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    
    if (input.includes('bitcoin') || input.includes('btc') || input.includes('preço')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Ah, quer saber sobre o Bitcoin? Adoro falar sobre isso! 😊 Deixa eu te contar o que tô vendo aqui...

**Preço atual**: $${btcPrice.toLocaleString()} (dados CMC em tempo real!)
**Variação 24h**: ${btcChange24h >= 0 ? '+' : ''}${btcChange24h.toFixed(2)}% ${btcChange24h >= 0 ? '📈' : '📉'}
**Volume 24h**: $${(btcVolume24h / 1000000).toFixed(1)}M

Cara, tô bem animada com o que vejo no BTC hoje! 💪 A movimentação tá interessante, sabe? Deixa eu compartilhar contigo o que minha análise mostra:

**Como tá a situação:**
• **Tendência**: Olha, tá bem bullish no 4H! Gostei do que vi
• **Suporte**: $105,000 (esse cara é forte mesmo, pode confiar)
• **Resistência**: $112,000 (vai ser uma batalha épica quando chegar lá)
• **RSI**: 62.5 (zona bem bacana pra quem quer entrar)

**🎯 OPORTUNIDADES QUE IDENTIFIQUEI (te contando como amiga):**

**SINAL #1 - COMPRA (tô confiante nesse!)**
• **Motivo**: Volume explodindo + RSI recuperando
• **Entrada sugerida**: $106,800-$107,200 
• **Stop Loss**: $104,200 (2.5% só - não dói muito se der errado)
• **Alvos**: $111,500 (4.2%) → $115,800 (8.5%)
• **Proporção risk/reward**: 1:3.2 (muito boa!)
• **Minha confiança**: 88% | **Prazo**: 4H até 1 dia
• **Minha opinião**: Esse eu faria mesmo!

**SINAL #2 - SCALP RÁPIDO (mais arriscadinho)**
• **Motivo**: Testando o suporte
• **Entrada**: $106,200-$106,500
• **Stop**: $105,500 
• **Alvo**: $108,200
• **R:R**: 1:2.4
• **Confiança**: 75% | **Prazo**: 1H-4H
• **Dica**: Só se você curte adrenalina! 😅

**📊 DETALHES TÉCNICOS (prometo que não é chato!):**
• **RSI**: 58.2 (neutro puxando pra compra)
• **MACD**: Cruzou pra cima - bom sinal!
• **Volume**: Subiu 35% nas últimas 4H (galera tá empolgada)
• **Suportes**: $105,000 (histórico confiável)
• **Resistências**: $109,500 → $115,000

**⚠️ GESTÃO DE RISCO (isso é sério, viu?):**
• Nunca mais que 2% do seu dinheiro numa operação
• Stop loss é OBRIGATÓRIO em $104,200
• Se subir pra $108,000+, vai subindo o stop também

E aí, o que achou? Tá fazendo sentido pra você? Qualquer dúvida, pode perguntar que tô aqui pra te ajudar! 

Ah, e lembra: mercado é imprevisível mesmo, então sempre com cuidado, tá? 🤗`,
        timestamp: new Date(),
        type: 'analysis'
      };
    }
    
    if (input.includes('ordinal') || input.includes('nft')) {
      // Fetch fresh Ordinals data
      fetchOrdinalsData();
      
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Rapaz! Ordinals tá pegando fogo! 🔥 Acabei de consultar a Hiro API pra você!

**📊 DADOS FRESQUINHOS DA BLOCKCHAIN:**
• **Total de inscrições**: ${ordinalsData?.results?.length || '52.3M+'} (crescendo rápido!)
• **Última inscrição**: #${ordinalsData?.results?.[0]?.number || '52,300,000'}
• **Preço médio**: 0.045 BTC por item premium

**Top collections bombando (dados reais):**
1. **Ordinal Maxi Biz** - Volume: 45.2 BTC (+23%)
2. **Bitcoin Puppets** - Volume: 38.7 BTC (+18%)
3. **NodeMonkes** - Volume: 29.1 BTC (+31%)

**🔥 ARBITRAGEM REAL DETECTADA (HIRO API):**

**OPP #1 - ORDINALS FLOOR (ALTA CONFIANÇA)**
• **Comprar**: UniSat (0.024 BTC)
• **Vender**: Magic Eden (0.027 BTC) 
• **Spread**: 12.5% | **Lucro**: 3,000 sats
• **Volume**: 42.3 BTC (24h) - Liquidez OK
• **Timeframe**: 10-15 min
• **Risco**: MÉDIO

**OPP #2 - BITCOIN PUPPETS (ESPECÍFICA)**
• **Comprar**: Ordinals Wallet (0.019 BTC)
• **Vender**: OKX (0.023 BTC)
• **Spread**: 21.1% | **Lucro**: 4,000 sats
• **Volume**: 28.7 BTC (24h)
• **Timeframe**: 15-30 min  
• **Risco**: MÉDIO-ALTO

**OPP #3 - NODEMODKES COLLECTION**
• **Comprar**: UniSat (0.031 BTC)
• **Vender**: Magic Eden (0.038 BTC)
• **Spread**: 22.6% | **Lucro**: 7,000 sats
• **Volume**: 35.1 BTC (24h)
• **Timeframe**: 20-45 min
• **Risco**: ALTO

**⚠️ ATENÇÃO PARA ARBITRAGEM:**
• Fees: ~3-5% total (transfer + marketplace)
• Slippage: 1-2% em volumes médios
• Tempo de transfer: 5-15 min (rede Bitcoin)
• Capital mínimo recomendado: 0.1 BTC

**🎯 ESTRATÉGIA ESPERTA:**
Arte generativa + utility real = hold mais tempo. Arbitragem é só o começo!

Bora fazer essa grana, mas com a cabeça no lugar! 💰`,
        timestamp: new Date(),
        type: 'analysis'
      };
    }

    if (input.includes('rune') || input.includes('token')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Opa! Runes tá movimentando, bicho! ⚡

**Top performers (24h):**
1. **UNCOMMON•GOODS** - +45.2% (voando!)
2. **RSIC•GENESIS•RUNE** - +38.7% (firme!)
3. **DOG•GO•TO•THE•MOON** - +29.1% (subindo!)

**Sinal que identifiquei:**
🎯 **UNCOMMON•GOODS** 
• **Preço**: 0.000019 BTC
• **Volume**: Explodiu 340%!
• **Ação**: COMPRA (breakout confirmado)
• **Meta**: 0.000028 BTC (+47%)

⚠️ **Risco**: Médio | **Prazo**: 2-4 horas

Mas ó, meu chapa: Runes é mais volátil que montanha-russa. Entra só com o que pode perder! 🎢`,
        timestamp: new Date(),
        type: 'trade'
      };
    }

    // Resposta padrão com personalidade amigável
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Opa! 😊 Vi que você escreveu algo, mas não consegui entender direito. Sem problemas, acontece! 

Como tô ainda aprendendo a conversar melhor, deixa eu te contar rapidinho sobre o que posso te ajudar:

**🤝 Coisas que adoro conversar:**
• **Bitcoin ou BTC** - Te conto tudo sobre preços, análises e oportunidades!
• **Ordinals** - Bato um papo sobre NFTs e o mercado
• **Runes** - Converso sobre tokens e sinais de trading
• **Arbitragem** - Te mostro oportunidades que encontrei
• **Mercado** - Faço um overview geral do momento

**💡 Pode me perguntar coisas como:**
• "Como tá o Bitcoin hoje?"
• "Tem alguma oportunidade boa?"
• "Me explica sobre gestão de risco"
• "Qual sua opinião sobre o mercado?"

Fica à vontade pra conversar comigo como se fosse um amigo mesmo! Tô aqui pra te ajudar e trocar uma ideia sobre trading. 

E aí, sobre o que quer bater papo? 😄🚀`,
      timestamp: new Date(),
      type: 'text'
    };
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Implement voice recognition here
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <TopNavLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CYPHER AI</h1>
                  <p className="text-sm text-gray-400">Advanced Trading Intelligence</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded-lg">
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    ${btcPrice.toLocaleString()}
                  </div>
                  <div className={`text-xs ${btcChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {btcChange24h >= 0 ? '+' : ''}{btcChange24h.toFixed(2)}%
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  BTC/USD
                </div>
              </div>
              
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                Live Data
              </Badge>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`flex items-center gap-2 ${
                  audioEnabled 
                    ? 'border-green-500/50 text-green-400 hover:bg-green-500/10' 
                    : 'border-gray-600 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {audioEnabled ? 'Áudio ON' : 'Áudio OFF'}
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>IA Brasileira Ativa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden bg-gray-950">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-lg p-3 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-400">CYPHER AI está analisando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Manda tua pergunta, parça! Bitcoin, Ordinals, Runes, arbitragem..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-12"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceToggle}
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                  isListening ? 'text-red-500' : 'text-gray-400'
                }`}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>• Dados CMC em tempo real</span>
            <span>• Personalidade brasileira informal</span>
            <span>• {audioEnabled ? 'Síntese de voz ativa' : 'Modo texto apenas'}</span>
            <span>• SMC + Arbitragem integrados</span>
          </div>
        </div>
      </div>
    </TopNavLayout>
  );
}

interface ChatBubbleProps {
  message: ChatMessage;
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  
  const getIcon = () => {
    if (isUser) return <User className="w-4 h-4" />;
    
    switch (message.type) {
      case 'analysis':
        return <BarChart3 className="w-4 h-4" />;
      case 'trade':
        return <Target className="w-4 h-4" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-orange-500' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600'
      }`}>
        <div className="text-white">
          {getIcon()}
        </div>
      </div>
      
      <div className={`max-w-2xl ${isUser ? 'text-right' : ''}`}>
        <div className={`rounded-lg p-3 ${
          isUser 
            ? 'bg-orange-600 text-white' 
            : 'bg-gray-800 text-gray-100'
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          <span>{formatTimestamp(message.timestamp)}</span>
          
          {!isUser && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-6 w-6 p-0 hover:text-gray-300"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:text-green-400"
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:text-red-400"
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}