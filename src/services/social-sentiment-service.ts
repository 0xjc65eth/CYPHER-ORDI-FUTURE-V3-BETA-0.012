// Serviço para análise de sentimento social de múltiplas fontes
import { EventEmitter } from 'events';

// Interface para dados de sentimento social
export interface SocialSentimentData {
  source: string;
  timestamp: string;
  sentiment: number; // -1 a 1, onde -1 é muito negativo, 0 é neutro e 1 é muito positivo
  volume: number; // Volume de menções/posts
  topics: string[]; // Tópicos relacionados
  hashtags: string[]; // Hashtags populares
  influencers: string[]; // Influenciadores relevantes
  keywords: string[]; // Palavras-chave relevantes
}

// Interface para tendências sociais
export interface SocialTrend {
  topic: string;
  sentiment: number;
  volume: number;
  change24h: number; // Mudança percentual nas últimas 24h
  sources: string[]; // Fontes onde a tendência aparece
  timestamp: string;
}

// Interface para insights de sentimento
export interface SentimentInsight {
  id: string;
  timestamp: string;
  source: string;
  insight: string;
  sentiment: number;
  confidence: number;
  topics: string[];
  relatedAssets: string[];
}

// Classe principal do serviço de sentimento social
export class SocialSentimentService extends EventEmitter {
  private static instance: SocialSentimentService;
  private sentimentData: SocialSentimentData[] = [];
  private trends: SocialTrend[] = [];
  private insights: SentimentInsight[] = [];
  private lastUpdate: string = new Date().toISOString();
  private isCollecting: boolean = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  private apiKey: string = 'c045d2a9-6f2d-44e9-8297-a88ab83b463b'; // CoinMarketCap API key (também usada para outras APIs)

  // Construtor privado para implementar Singleton
  private constructor() {
    super();
    this.initializeData();
    console.log('Social Sentiment Service initialized');
  }

  // Método para obter a instância única
  public static getInstance(): SocialSentimentService {
    if (!SocialSentimentService.instance) {
      SocialSentimentService.instance = new SocialSentimentService();
    }
    return SocialSentimentService.instance;
  }

  // Inicializar dados simulados
  private initializeData(): void {
    // Dados simulados de sentimento social
    this.generateSimulatedData();
  }

  // Gerar dados simulados de sentimento social
  private generateSimulatedData(): void {
    const sources = ['Twitter', 'Reddit', 'Telegram', 'Bloomberg', 'CoinDesk', 'Discord', 'YouTube'];
    const topics = ['Bitcoin', 'Ordinals', 'Runes', 'NFTs', 'Crypto Market', 'BRC-20', 'Mining', 'Arbitrage'];
    const hashtags = ['#Bitcoin', '#Ordinals', '#Runes', '#BTC', '#NFTs', '#Crypto', '#Web3', '#DeFi'];
    const influencers = ['@elonmusk', '@saylor', '@VitalikButerin', '@cz_binance', '@SBF_FTX', '@aantonop', '@CryptoHayes'];
    const keywords = ['bull market', 'bear market', 'halving', 'adoption', 'regulation', 'institutional', 'volatility', 'arbitrage'];
    
    // Gerar dados para cada fonte
    this.sentimentData = [];
    
    for (const source of sources) {
      // Gerar entre 3 e 7 entradas para cada fonte
      const entries = 3 + Math.floor(Math.random() * 5);
      
      for (let i = 0; i < entries; i++) {
        // Timestamp nas últimas 24 horas
        const timestamp = new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString();
        
        // Sentimento entre -1 e 1, com tendência para positivo para Bitcoin
        const sentiment = (Math.random() * 2 - 0.5) * (source === 'Bloomberg' ? 0.7 : 1);
        
        // Volume entre 100 e 10000
        const volume = 100 + Math.floor(Math.random() * 9900);
        
        // Selecionar tópicos aleatórios (2-4)
        const selectedTopics = this.getRandomItems(topics, 2 + Math.floor(Math.random() * 3));
        
        // Selecionar hashtags aleatórias (3-6)
        const selectedHashtags = this.getRandomItems(hashtags, 3 + Math.floor(Math.random() * 4));
        
        // Selecionar influenciadores aleatórios (1-3)
        const selectedInfluencers = this.getRandomItems(influencers, 1 + Math.floor(Math.random() * 3));
        
        // Selecionar palavras-chave aleatórias (2-5)
        const selectedKeywords = this.getRandomItems(keywords, 2 + Math.floor(Math.random() * 4));
        
        this.sentimentData.push({
          source,
          timestamp,
          sentiment,
          volume,
          topics: selectedTopics,
          hashtags: selectedHashtags,
          influencers: selectedInfluencers,
          keywords: selectedKeywords
        });
      }
    }
    
    // Ordenar por timestamp (mais recente primeiro)
    this.sentimentData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Gerar tendências com base nos dados de sentimento
    this.generateTrends();
    
    // Gerar insights com base nos dados de sentimento
    this.generateInsights();
    
    this.lastUpdate = new Date().toISOString();
  }
  
  // Função auxiliar para selecionar itens aleatórios de um array
  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  // Gerar tendências com base nos dados de sentimento
  private generateTrends(): void {
    const allTopics = new Set<string>();
    
    // Coletar todos os tópicos
    this.sentimentData.forEach(data => {
      data.topics.forEach(topic => allTopics.add(topic));
    });
    
    this.trends = [];
    
    // Para cada tópico, gerar uma tendência
    allTopics.forEach(topic => {
      // Filtrar dados de sentimento para este tópico
      const topicData = this.sentimentData.filter(data => data.topics.includes(topic));
      
      if (topicData.length > 0) {
        // Calcular sentimento médio
        const avgSentiment = topicData.reduce((sum, data) => sum + data.sentiment, 0) / topicData.length;
        
        // Calcular volume total
        const totalVolume = topicData.reduce((sum, data) => sum + data.volume, 0);
        
        // Calcular mudança nas últimas 24h (simulada)
        const change24h = (Math.random() * 40) - 10; // Entre -10% e +30%
        
        // Coletar fontes únicas
        const sources = [...new Set(topicData.map(data => data.source))];
        
        this.trends.push({
          topic,
          sentiment: avgSentiment,
          volume: totalVolume,
          change24h,
          sources,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Ordenar por volume (maior primeiro)
    this.trends.sort((a, b) => b.volume - a.volume);
  }
  
  // Gerar insights com base nos dados de sentimento
  private generateInsights(): void {
    const assets = ['Bitcoin', 'Ordinals', 'Runes', 'BRC-20', 'NFTs'];
    const insightTemplates = [
      'Aumento significativo no sentimento positivo para {topic} em {source}, indicando possível movimento de preço.',
      'Alta correlação entre menções de {influencer} e volume de trading de {asset}.',
      'Tendência de crescimento para {hashtag} nas últimas 24 horas, com {volume} menções.',
      'Sentimento negativo em {source} para {topic}, contrário à tendência geral do mercado.',
      'Análise de {source} mostra forte interesse em {asset} relacionado a {keyword}.',
      'Padrão de acumulação detectado para {asset} baseado em análise de sentimento de {source}.',
      'Divergência entre sentimento social e preço de mercado para {asset}, potencial indicador de reversão.'
    ];
    
    this.insights = [];
    
    // Gerar 5-10 insights
    const insightCount = 5 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < insightCount; i++) {
      // Selecionar um template aleatório
      const template = insightTemplates[Math.floor(Math.random() * insightTemplates.length)];
      
      // Selecionar dados de sentimento aleatórios
      const sentimentData = this.sentimentData[Math.floor(Math.random() * this.sentimentData.length)];
      
      // Selecionar um tópico aleatório
      const topic = sentimentData.topics[Math.floor(Math.random() * sentimentData.topics.length)];
      
      // Selecionar um hashtag aleatório
      const hashtag = sentimentData.hashtags[Math.floor(Math.random() * sentimentData.hashtags.length)];
      
      // Selecionar um influenciador aleatório
      const influencer = sentimentData.influencers[Math.floor(Math.random() * sentimentData.influencers.length)];
      
      // Selecionar uma palavra-chave aleatória
      const keyword = sentimentData.keywords[Math.floor(Math.random() * sentimentData.keywords.length)];
      
      // Selecionar um ativo aleatório
      const asset = assets[Math.floor(Math.random() * assets.length)];
      
      // Gerar o insight
      let insight = template
        .replace('{topic}', topic)
        .replace('{source}', sentimentData.source)
        .replace('{influencer}', influencer)
        .replace('{asset}', asset)
        .replace('{hashtag}', hashtag)
        .replace('{volume}', sentimentData.volume.toLocaleString())
        .replace('{keyword}', keyword);
      
      // Gerar confiança entre 65% e 95%
      const confidence = 65 + Math.floor(Math.random() * 31);
      
      this.insights.push({
        id: `insight-${i + 1}`,
        timestamp: new Date().toISOString(),
        source: sentimentData.source,
        insight,
        sentiment: sentimentData.sentiment,
        confidence,
        topics: sentimentData.topics,
        relatedAssets: [asset]
      });
    }
    
    // Ordenar por timestamp (mais recente primeiro)
    this.insights.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  // Iniciar coleta de dados
  public startDataCollection(): void {
    if (this.isCollecting) {
      console.log('Social sentiment data collection is already running');
      return;
    }
    
    this.isCollecting = true;
    console.log('Starting social sentiment data collection...');
    
    // Coletar dados imediatamente
    this.collectData();
    
    // Configurar intervalo de coleta (a cada 5 minutos)
    this.collectionInterval = setInterval(() => {
      this.collectData();
    }, 5 * 60 * 1000);
    
    // Emitir evento de início
    this.emit('collection-started', {
      timestamp: new Date().toISOString()
    });
  }
  
  // Parar coleta de dados
  public stopDataCollection(): void {
    if (!this.isCollecting) {
      console.log('Social sentiment data collection is not running');
      return;
    }
    
    this.isCollecting = false;
    console.log('Stopping social sentiment data collection...');
    
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    
    // Emitir evento de parada
    this.emit('collection-stopped', {
      timestamp: new Date().toISOString()
    });
  }
  
  // Coletar dados de sentimento social
  private async collectData(): Promise<void> {
    console.log('Collecting social sentiment data...');
    
    try {
      // Em um ambiente real, aqui faríamos chamadas para APIs de sentimento social
      // Como estamos simulando, vamos gerar novos dados simulados
      this.generateSimulatedData();
      
      // Emitir evento de dados coletados
      this.emit('data-collected', {
        timestamp: new Date().toISOString(),
        dataPoints: this.sentimentData.length,
        trends: this.trends.length,
        insights: this.insights.length
      });
    } catch (error) {
      console.error('Error collecting social sentiment data:', error);
      
      // Emitir evento de erro
      this.emit('collection-error', {
        timestamp: new Date().toISOString(),
        error
      });
    }
  }
  
  // Obter dados de sentimento social
  public getSentimentData(): SocialSentimentData[] {
    return this.sentimentData;
  }
  
  // Obter tendências sociais
  public getTrends(): SocialTrend[] {
    return this.trends;
  }
  
  // Obter insights de sentimento
  public getInsights(): SentimentInsight[] {
    return this.insights;
  }
  
  // Obter insights de sentimento por fonte
  public getInsightsBySource(source: string): SentimentInsight[] {
    return this.insights.filter(insight => insight.source === source);
  }
  
  // Obter insights de sentimento por tópico
  public getInsightsByTopic(topic: string): SentimentInsight[] {
    return this.insights.filter(insight => insight.topics.includes(topic));
  }
  
  // Obter insights de sentimento por ativo
  public getInsightsByAsset(asset: string): SentimentInsight[] {
    return this.insights.filter(insight => insight.relatedAssets.includes(asset));
  }
  
  // Obter status do serviço
  public getStatus(): any {
    return {
      isCollecting: this.isCollecting,
      lastUpdate: this.lastUpdate,
      dataPoints: this.sentimentData.length,
      trends: this.trends.length,
      insights: this.insights.length,
      sources: [...new Set(this.sentimentData.map(data => data.source))],
      topHashtags: this.getTopHashtags(5),
      topInfluencers: this.getTopInfluencers(5)
    };
  }
  
  // Obter as hashtags mais populares
  public getTopHashtags(count: number = 10): { hashtag: string; count: number }[] {
    const hashtagCounts = new Map<string, number>();
    
    // Contar ocorrências de cada hashtag
    this.sentimentData.forEach(data => {
      data.hashtags.forEach(hashtag => {
        const currentCount = hashtagCounts.get(hashtag) || 0;
        hashtagCounts.set(hashtag, currentCount + 1);
      });
    });
    
    // Converter para array e ordenar
    const sortedHashtags = Array.from(hashtagCounts.entries())
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count);
    
    return sortedHashtags.slice(0, count);
  }
  
  // Obter os influenciadores mais mencionados
  public getTopInfluencers(count: number = 10): { influencer: string; count: number }[] {
    const influencerCounts = new Map<string, number>();
    
    // Contar ocorrências de cada influenciador
    this.sentimentData.forEach(data => {
      data.influencers.forEach(influencer => {
        const currentCount = influencerCounts.get(influencer) || 0;
        influencerCounts.set(influencer, currentCount + 1);
      });
    });
    
    // Converter para array e ordenar
    const sortedInfluencers = Array.from(influencerCounts.entries())
      .map(([influencer, count]) => ({ influencer, count }))
      .sort((a, b) => b.count - a.count);
    
    return sortedInfluencers.slice(0, count);
  }
  
  // Forçar atualização dos dados
  public forceUpdate(): void {
    console.log('Forcing social sentiment data update...');
    this.collectData();
  }
}

// Exportar instância única
export const socialSentimentService = SocialSentimentService.getInstance();
