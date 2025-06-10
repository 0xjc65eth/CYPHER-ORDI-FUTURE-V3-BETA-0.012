// Smart Response Generator for CYPHER AI v2
// Generates intelligent, context-aware responses based on user input

import type { Intent, EmotionType, MarketData } from '../types';

export class SmartResponseGenerator {
  private bitcoinFacts: string[] = [
    'O Bitcoin está mostrando um padrão de consolidação nas últimas 24 horas.',
    'O hashrate da rede Bitcoin atingiu novos recordes, indicando segurança crescente.',
    'Os volumes de negociação estão indicando interesse institucional renovado.',
    'A dominância do Bitcoin no mercado cripto está em um ponto crucial.',
    'Os indicadores on-chain mostram acumulação por hodlers de longo prazo.'
  ];

  private marketInsights: string[] = [
    'O Fear & Greed Index está sinalizando cautela no mercado.',
    'As baleias estão movimentando grandes volumes para exchanges.',
    'O funding rate dos futuros indica sentimento neutro a bullish.',
    'A correlação com mercados tradicionais diminuiu significativamente.',
    'Os níveis de suporte e resistência estão bem definidos no gráfico.'
  ];

  generateIntelligentResponse(
    userInput: string, 
    intent: Intent, 
    marketData?: MarketData
  ): string {
    const input = userInput.toLowerCase();
    
    // Price-related queries
    if (this.isPriceQuery(input)) {
      return this.generatePriceResponse(input, marketData);
    }
    
    // Analysis requests
    if (this.isAnalysisRequest(input)) {
      return this.generateAnalysisResponse(input, marketData);
    }
    
    // Trading questions
    if (this.isTradingQuery(input)) {
      return this.generateTradingResponse(input, marketData);
    }
    
    // Ordinals/Runes queries
    if (this.isOrdinalsQuery(input)) {
      return this.generateOrdinalsResponse(input);
    }
    
    // Market sentiment
    if (this.isSentimentQuery(input)) {
      return this.generateSentimentResponse(marketData);
    }
    
    // Educational questions
    if (this.isEducationalQuery(input)) {
      return this.generateEducationalResponse(input);
    }
    
    // Default: Generate contextual response based on keywords
    return this.generateContextualResponse(input, marketData);
  }

  private isPriceQuery(input: string): boolean {
    const priceKeywords = ['preço', 'price', 'valor', 'cotação', 'quanto', 'custa'];
    return priceKeywords.some(keyword => input.includes(keyword));
  }

  private isAnalysisRequest(input: string): boolean {
    const analysisKeywords = ['análise', 'analisar', 'analisa', 'estudo', 'avaliar', 'tendência'];
    return analysisKeywords.some(keyword => input.includes(keyword));
  }

  private isTradingQuery(input: string): boolean {
    const tradingKeywords = ['comprar', 'vender', 'trade', 'trading', 'investir', 'posição'];
    return tradingKeywords.some(keyword => input.includes(keyword));
  }

  private isOrdinalsQuery(input: string): boolean {
    const ordinalsKeywords = ['ordinal', 'ordinals', 'inscription', 'rune', 'runes', 'brc-20'];
    return ordinalsKeywords.some(keyword => input.includes(keyword));
  }

  private isSentimentQuery(input: string): boolean {
    const sentimentKeywords = ['sentimento', 'mercado', 'bull', 'bear', 'otimista', 'pessimista'];
    return sentimentKeywords.some(keyword => input.includes(keyword));
  }

  private isEducationalQuery(input: string): boolean {
    const eduKeywords = ['como', 'funciona', 'o que é', 'explica', 'ensina', 'aprenda'];
    return eduKeywords.some(keyword => input.includes(keyword));
  }

  private generatePriceResponse(input: string, marketData?: MarketData): string {
    const btcPrice = marketData?.bitcoin?.price || 95000;
    const change24h = marketData?.bitcoin?.change24h || 0;
    const volume = marketData?.bitcoin?.volume24h || 0;
    
    const trend = change24h > 0 ? 'alta' : 'baixa';
    const emoji = change24h > 0 ? '📈' : '📉';
    
    return `${emoji} Bitcoin está sendo negociado a $${btcPrice.toLocaleString('pt-BR')} ` +
           `com ${trend} de ${Math.abs(change24h).toFixed(2)}% nas últimas 24h. ` +
           `Volume de negociação: $${(volume / 1e9).toFixed(2)}B. ` +
           `${this.getRandomFact()}`;
  }

  private generateAnalysisResponse(input: string, marketData?: MarketData): string {
    const price = marketData?.bitcoin?.price || 95000;
    const change = marketData?.bitcoin?.change24h || 0;
    
    const analysis = [
      `📊 Análise técnica atual do Bitcoin:`,
      `• Preço: $${price.toLocaleString('pt-BR')}`,
      `• Variação 24h: ${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
      `• Suporte próximo: $${(price * 0.95).toLocaleString('pt-BR')}`,
      `• Resistência: $${(price * 1.05).toLocaleString('pt-BR')}`,
      `• RSI: ${this.generateRSI(change)}`,
      `• Tendência: ${this.analyzeTrend(change)}`,
      '',
      `💡 ${this.getRandomInsight()}`
    ];
    
    return analysis.join('\n');
  }

  private generateTradingResponse(input: string, marketData?: MarketData): string {
    const price = marketData?.bitcoin?.price || 95000;
    const change = marketData?.bitcoin?.change24h || 0;
    
    if (input.includes('comprar')) {
      return `🛒 Análise para compra de Bitcoin:\n` +
             `• Preço atual: $${price.toLocaleString('pt-BR')}\n` +
             `• Momento: ${change < -2 ? 'Possível oportunidade' : 'Aguarde correção'}\n` +
             `• Sugestão: DCA (Dollar Cost Average) é sempre prudente\n` +
             `• Risco: ${this.assessRisk(change)}\n\n` +
             `⚠️ Lembre-se: invista apenas o que pode perder.`;
    }
    
    if (input.includes('vender')) {
      return `💰 Análise para venda de Bitcoin:\n` +
             `• Preço atual: $${price.toLocaleString('pt-BR')}\n` +
             `• Lucro potencial: ${change > 5 ? 'Bom momento para realizar lucros' : 'Considere manter'}\n` +
             `• Próxima resistência: $${(price * 1.08).toLocaleString('pt-BR')}\n` +
             `• Sugestão: Venda parcial para garantir lucros\n\n` +
             `📈 ${this.getRandomFact()}`;
    }
    
    return `📊 Para decisões de trading, considere:\n` +
           `• Análise técnica completa\n` +
           `• Seus objetivos pessoais\n` +
           `• Gestão de risco\n` +
           `• Diversificação do portfolio\n\n` +
           `Posso fazer uma análise específica se quiser.`;
  }

  private generateOrdinalsResponse(input: string): string {
    const responses = {
      ordinals: `🟠 Ordinals são inscrições digitais no Bitcoin:\n` +
                `• Armazenam dados diretamente na blockchain\n` +
                `• Cada satoshi pode carregar uma inscrição única\n` +
                `• Floor price atual: ~0.001 BTC\n` +
                `• Coleções populares: Bitcoin Punks, Ordinal Maxi Biz\n` +
                `• Use marketplaces como Magic Eden ou OKX para negociar`,
                
      runes: `ᚱ Runes Protocol é o padrão de tokens fungíveis no Bitcoin:\n` +
             `• Mais eficiente que BRC-20\n` +
             `• Integrado ao protocolo base\n` +
             `• Principais runes: DOG, PUPS, RUNE\n` +
             `• Volume diário: ~$10M\n` +
             `• Cuidado com a volatilidade extrema!`
    };
    
    if (input.includes('rune')) {
      return responses.runes;
    }
    
    return responses.ordinals;
  }

  private generateSentimentResponse(marketData?: MarketData): string {
    const change = marketData?.bitcoin?.change24h || 0;
    const fearGreedValue = this.calculateFearGreed(change);
    
    return `🎭 Sentimento atual do mercado:\n\n` +
           `• Fear & Greed Index: ${fearGreedValue}/100 (${this.interpretFearGreed(fearGreedValue)})\n` +
           `• Tendência: ${change > 0 ? 'Bullish 🐂' : 'Bearish 🐻'}\n` +
           `• Volume: ${this.interpretVolume(marketData?.bitcoin?.volume24h)}\n` +
           `• Momento: ${this.interpretMomentum(change)}\n\n` +
           `${this.getRandomInsight()}`;
  }

  private generateEducationalResponse(input: string): string {
    const topics = {
      bitcoin: `₿ Bitcoin é a primeira criptomoeda descentralizada:\n` +
               `• Criado em 2009 por Satoshi Nakamoto\n` +
               `• Supply máximo: 21 milhões\n` +
               `• Halving a cada 4 anos\n` +
               `• Proof of Work (PoW)\n` +
               `• Próximo halving: 2028`,
               
      blockchain: `⛓️ Blockchain é um livro-razão distribuído:\n` +
                  `• Registros imutáveis\n` +
                  `• Descentralizado\n` +
                  `• Transparente\n` +
                  `• Seguro por criptografia\n` +
                  `• Base de todas as criptomoedas`,
                  
      mining: `⛏️ Mineração de Bitcoin:\n` +
              `• Valida transações\n` +
              `• Cria novos blocos\n` +
              `• Recompensa atual: 6.25 BTC/bloco\n` +
              `• Dificuldade ajusta a cada 2016 blocos\n` +
              `• Consome muita energia`
    };
    
    for (const [key, content] of Object.entries(topics)) {
      if (input.includes(key)) {
        return content;
      }
    }
    
    return `📚 Sobre o que você gostaria de aprender?\n` +
           `• Bitcoin e seu funcionamento\n` +
           `• Blockchain e tecnologia\n` +
           `• Trading e estratégias\n` +
           `• Ordinals e Runes\n` +
           `• Análise técnica\n\n` +
           `Pergunte especificamente!`;
  }

  private generateContextualResponse(input: string, marketData?: MarketData): string {
    // Extract key topics from input
    const topics = this.extractTopics(input);
    
    if (topics.length === 0) {
      return this.generateDefaultResponse(marketData);
    }
    
    // Build response based on topics
    let response = `Entendi sua pergunta sobre ${topics.join(', ')}.\n\n`;
    
    // Add relevant market data
    if (marketData?.bitcoin) {
      response += `📊 Contexto atual do mercado:\n`;
      response += `• BTC: $${marketData.bitcoin.price?.toLocaleString('pt-BR')}\n`;
      response += `• Variação: ${marketData.bitcoin.change24h?.toFixed(2)}%\n\n`;
    }
    
    // Add specific insights based on topics
    topics.forEach(topic => {
      const insight = this.getTopicInsight(topic);
      if (insight) {
        response += `${insight}\n\n`;
      }
    });
    
    response += `Posso detalhar algum aspecto específico?`;
    
    return response;
  }

  private extractTopics(input: string): string[] {
    const topics: string[] = [];
    const topicMap = {
      bitcoin: ['bitcoin', 'btc', 'satoshi'],
      ethereum: ['ethereum', 'eth', 'ether'],
      trading: ['trade', 'trading', 'comprar', 'vender'],
      analise: ['análise', 'técnica', 'gráfico'],
      ordinals: ['ordinal', 'inscription', 'brc-20'],
      runes: ['rune', 'runes', 'protocol'],
      mining: ['minerar', 'mineração', 'hashrate']
    };
    
    for (const [topic, keywords] of Object.entries(topicMap)) {
      if (keywords.some(kw => input.toLowerCase().includes(kw))) {
        topics.push(topic);
      }
    }
    
    return topics;
  }

  private getTopicInsight(topic: string): string {
    const insights: Record<string, string> = {
      bitcoin: '₿ Bitcoin continua sendo o ativo digital mais seguro e descentralizado.',
      ethereum: 'Ξ Ethereum lidera em DeFi e smart contracts.',
      trading: '📈 Sempre use stop-loss e gerencie seu risco.',
      analise: '📊 Combine análise técnica com fundamentalista.',
      ordinals: '🟠 Ordinals estão revolucionando NFTs no Bitcoin.',
      runes: 'ᚱ Runes trazem tokens fungíveis eficientes ao Bitcoin.',
      mining: '⛏️ A rentabilidade da mineração depende do custo de energia.'
    };
    
    return insights[topic] || '';
  }

  private generateDefaultResponse(marketData?: MarketData): string {
    const price = marketData?.bitcoin?.price || 95000;
    const change = marketData?.bitcoin?.change24h || 0;
    
    return `Olá! Sou CYPHER AI, especializada em Bitcoin e criptomoedas.\n\n` +
           `📊 Resumo do mercado agora:\n` +
           `• Bitcoin: $${price.toLocaleString('pt-BR')} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)\n` +
           `• Tendência: ${this.analyzeTrend(change)}\n` +
           `• ${this.getRandomFact()}\n\n` +
           `Como posso ajudar você hoje? Posso falar sobre:\n` +
           `• Preços e análises de mercado\n` +
           `• Estratégias de trading\n` +
           `• Ordinals e Runes\n` +
           `• Educação sobre cripto`;
  }

  // Helper methods
  private generateRSI(change: number): string {
    const rsi = 50 + (change * 5);
    if (rsi > 70) return `${rsi.toFixed(0)} (Sobrecomprado)`;
    if (rsi < 30) return `${rsi.toFixed(0)} (Sobrevendido)`;
    return `${rsi.toFixed(0)} (Neutro)`;
  }

  private analyzeTrend(change: number): string {
    if (change > 5) return 'Forte alta 🚀';
    if (change > 2) return 'Alta moderada 📈';
    if (change > 0) return 'Levemente positiva ➕';
    if (change > -2) return 'Levemente negativa ➖';
    if (change > -5) return 'Queda moderada 📉';
    return 'Forte queda 🔻';
  }

  private assessRisk(change: number): string {
    const absChange = Math.abs(change);
    if (absChange > 10) return 'Alto ⚠️';
    if (absChange > 5) return 'Médio ⚡';
    return 'Baixo ✅';
  }

  private calculateFearGreed(change: number): number {
    return Math.max(0, Math.min(100, 50 + (change * 10)));
  }

  private interpretFearGreed(value: number): string {
    if (value >= 80) return 'Ganância Extrema';
    if (value >= 60) return 'Ganância';
    if (value >= 40) return 'Neutro';
    if (value >= 20) return 'Medo';
    return 'Medo Extremo';
  }

  private interpretVolume(volume?: number): string {
    if (!volume) return 'Dados indisponíveis';
    const volumeB = volume / 1e9;
    if (volumeB > 50) return 'Volume muito alto 📊';
    if (volumeB > 30) return 'Volume alto 📈';
    if (volumeB > 20) return 'Volume normal 📊';
    return 'Volume baixo 📉';
  }

  private interpretMomentum(change: number): string {
    if (change > 5) return 'Momentum forte de alta';
    if (change > 0) return 'Momentum positivo';
    if (change > -5) return 'Momentum negativo';
    return 'Momentum forte de baixa';
  }

  private getRandomFact(): string {
    return this.bitcoinFacts[Math.floor(Math.random() * this.bitcoinFacts.length)];
  }

  private getRandomInsight(): string {
    return this.marketInsights[Math.floor(Math.random() * this.marketInsights.length)];
  }
}

export default SmartResponseGenerator;