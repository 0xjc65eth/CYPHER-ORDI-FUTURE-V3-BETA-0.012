// CYPHER AI v2 - Streaming Response System
// Gemini-like streaming responses for real-time conversation

import EventEmitter from 'events';
import type { EmotionType } from '../types';

export interface StreamChunk {
  id: string;
  timestamp: Date;
  content: string;
  isComplete: boolean;
  emotion?: EmotionType;
  metadata?: {
    type: 'text' | 'data' | 'action' | 'suggestion';
    source?: string;
    confidence?: number;
  };
}

export interface StreamingConfig {
  chunkSize: number;
  delayBetweenChunks: number;
  enableTypewriterEffect: boolean;
  adaptiveSpeed: boolean;
  maxConcurrentStreams: number;
}

export class StreamingResponse extends EventEmitter {
  private config: StreamingConfig;
  private activeStreams: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private streamCounter: number = 0;

  constructor(config: Partial<StreamingConfig> = {}) {
    super();
    this.config = {
      chunkSize: 15, // words per chunk
      delayBetweenChunks: 100, // ms
      enableTypewriterEffect: true,
      adaptiveSpeed: true,
      maxConcurrentStreams: 3,
      ...config
    };
  }

  async streamResponse(
    content: string,
    emotion: EmotionType = 'neutral',
    metadata: any = {}
  ): Promise<string> {
    const streamId = this.generateStreamId();
    
    // Check concurrent streams limit
    if (this.activeStreams.size >= this.config.maxConcurrentStreams) {
      // Cancel oldest stream
      const oldestStream = this.activeStreams.keys().next().value;
      if (oldestStream) {
        this.cancelStream(oldestStream);
      }
    }

    return new Promise((resolve, reject) => {
      try {
        const chunks = this.createChunks(content, emotion, metadata);
        this.processChunks(streamId, chunks, resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private generateStreamId(): string {
    return `stream_${++this.streamCounter}_${Date.now()}`;
  }

  private createChunks(
    content: string, 
    emotion: EmotionType, 
    metadata: any
  ): StreamChunk[] {
    const chunks: StreamChunk[] = [];
    
    // Split content into sentences first
    const sentences = this.splitIntoSentences(content);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const words = sentence.split(/\s+/).filter(word => word.length > 0);
      
      // Create chunks from words
      const sentenceChunks = this.createSentenceChunks(words, i === 0);
      
      sentenceChunks.forEach((chunk, chunkIndex) => {
        chunks.push({
          id: `chunk_${chunks.length}`,
          timestamp: new Date(),
          content: chunk,
          isComplete: false,
          emotion: emotion,
          metadata: {
            type: this.determineChunkType(chunk, metadata),
            confidence: metadata.confidence || 0.8
          }
        });
      });
    }

    // Mark last chunk as complete
    if (chunks.length > 0) {
      chunks[chunks.length - 1].isComplete = true;
    }

    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    // Smart sentence splitting that preserves formatting
    return text
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim());
  }

  private createSentenceChunks(words: string[], isFirstSentence: boolean): string[] {
    const chunks: string[] = [];
    const chunkSize = this.config.chunkSize;
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunkWords = words.slice(i, i + chunkSize);
      let chunk = chunkWords.join(' ');
      
      // Add continuation indicator if not last chunk of sentence
      if (i + chunkSize < words.length) {
        chunk += ' ';
      }
      
      chunks.push(chunk);
    }
    
    return chunks;
  }

  private determineChunkType(content: string, metadata: any): 'text' | 'data' | 'action' | 'suggestion' {
    if (content.includes('$') || /\d+([.,]\d+)?/.test(content)) {
      return 'data';
    }
    
    if (content.includes('?') && (content.includes('quer') || content.includes('gostaria'))) {
      return 'suggestion';
    }
    
    if (content.includes('vou') || content.includes('executar') || content.includes('fazer')) {
      return 'action';
    }
    
    return 'text';
  }

  private processChunks(
    streamId: string,
    chunks: StreamChunk[],
    resolve: (value: string) => void,
    reject: (error: any) => void
  ): void {
    let currentChunkIndex = 0;
    let accumulatedContent = '';
    
    const processNextChunk = () => {
      if (currentChunkIndex >= chunks.length) {
        // Stream complete
        this.activeStreams.delete(streamId);
        this.emit('streamComplete', {
          streamId,
          totalChunks: chunks.length,
          content: accumulatedContent
        });
        resolve(accumulatedContent);
        return;
      }

      const chunk = chunks[currentChunkIndex];
      accumulatedContent += chunk.content;
      
      // Emit chunk
      this.emit('chunk', {
        streamId,
        chunk,
        progress: (currentChunkIndex + 1) / chunks.length,
        accumulatedContent
      });

      currentChunkIndex++;
      
      // Calculate adaptive delay
      const delay = this.calculateDelay(chunk, currentChunkIndex, chunks.length);
      
      // Schedule next chunk
      const timeout = setTimeout(processNextChunk, delay);
      this.activeStreams.set(streamId, timeout);
    };

    // Start processing
    processNextChunk();
  }

  private calculateDelay(
    chunk: StreamChunk, 
    index: number, 
    totalChunks: number
  ): number {
    let delay = this.config.delayBetweenChunks;
    
    if (this.config.adaptiveSpeed) {
      // Adjust speed based on content type
      switch (chunk.metadata?.type) {
        case 'data':
          delay *= 1.5; // Slower for data to let user process
          break;
        case 'action':
          delay *= 0.8; // Faster for actions
          break;
        case 'suggestion':
          delay *= 1.2; // Slightly slower for suggestions
          break;
      }
      
      // Adjust based on emotion
      switch (chunk.emotion) {
        case 'excited':
          delay *= 0.7; // Faster when excited
          break;
        case 'concerned':
          delay *= 1.3; // Slower when concerned
          break;
        case 'analytical':
          delay *= 1.1; // Slightly slower for analysis
          break;
      }
      
      // Slow down near end for emphasis
      if (index > totalChunks * 0.8) {
        delay *= 1.2;
      }
      
      // Add slight randomness for natural feel
      delay += (Math.random() - 0.5) * 20;
    }
    
    return Math.max(delay, 50); // Minimum 50ms delay
  }

  streamMarketData(data: any): Promise<void> {
    return new Promise((resolve) => {
      const dataPoints = this.formatMarketData(data);
      let currentIndex = 0;
      
      const streamNextDataPoint = () => {
        if (currentIndex >= dataPoints.length) {
          resolve();
          return;
        }
        
        const dataPoint = dataPoints[currentIndex];
        this.emit('marketData', {
          type: 'data_point',
          content: dataPoint,
          index: currentIndex,
          total: dataPoints.length
        });
        
        currentIndex++;
        setTimeout(streamNextDataPoint, 200);
      };
      
      streamNextDataPoint();
    });
  }

  private formatMarketData(data: any): string[] {
    const points: string[] = [];
    
    if (data.bitcoin?.price) {
      points.push(`💰 Bitcoin: $${data.bitcoin.price.toLocaleString()}`);
    }
    
    if (data.bitcoin?.change24h !== undefined) {
      const emoji = data.bitcoin.change24h > 0 ? '📈' : '📉';
      points.push(`${emoji} 24h: ${data.bitcoin.change24h.toFixed(2)}%`);
    }
    
    if (data.bitcoin?.volume24h) {
      points.push(`📊 Volume: $${(data.bitcoin.volume24h / 1e9).toFixed(1)}B`);
    }
    
    if (data.bitcoin?.marketCap) {
      points.push(`🏦 Market Cap: $${(data.bitcoin.marketCap / 1e9).toFixed(1)}B`);
    }
    
    if (data.market?.fearGreedIndex) {
      points.push(`😱😤 Fear & Greed: ${data.market.fearGreedIndex}`);
    }
    
    return points;
  }

  streamTradingAnalysis(analysis: any): Promise<void> {
    return new Promise((resolve) => {
      const analysisPoints = this.formatTradingAnalysis(analysis);
      let currentIndex = 0;
      
      const streamNextPoint = () => {
        if (currentIndex >= analysisPoints.length) {
          resolve();
          return;
        }
        
        const point = analysisPoints[currentIndex];
        this.emit('tradingAnalysis', {
          type: 'analysis_point',
          content: point,
          index: currentIndex,
          total: analysisPoints.length,
          priority: this.getAnalysisPriority(point)
        });
        
        currentIndex++;
        
        // Variable delay based on importance
        const delay = point.includes('⚠️') ? 500 : 250;
        setTimeout(streamNextPoint, delay);
      };
      
      streamNextPoint();
    });
  }

  private formatTradingAnalysis(analysis: any): string[] {
    const points: string[] = [];
    
    if (analysis.trend) {
      const trendEmoji = analysis.trend === 'bullish' ? '🐂' : analysis.trend === 'bearish' ? '🐻' : '➡️';
      points.push(`${trendEmoji} Tendência: ${analysis.trend}`);
    }
    
    if (analysis.support) {
      points.push(`🛡️ Suporte: $${analysis.support.toLocaleString()}`);
    }
    
    if (analysis.resistance) {
      points.push(`🚧 Resistência: $${analysis.resistance.toLocaleString()}`);
    }
    
    if (analysis.recommendation) {
      const recEmoji = analysis.recommendation === 'BUY' ? '✅' : 
                       analysis.recommendation === 'SELL' ? '❌' : '⏸️';
      points.push(`${recEmoji} Recomendação: ${analysis.recommendation}`);
    }
    
    if (analysis.riskLevel) {
      const riskEmoji = analysis.riskLevel === 'high' ? '⚠️' : 
                        analysis.riskLevel === 'medium' ? '🟡' : '🟢';
      points.push(`${riskEmoji} Risco: ${analysis.riskLevel}`);
    }
    
    return points;
  }

  private getAnalysisPriority(point: string): 'high' | 'medium' | 'low' {
    if (point.includes('⚠️') || point.includes('❌')) {
      return 'high';
    }
    if (point.includes('✅') || point.includes('📈') || point.includes('📉')) {
      return 'medium';
    }
    return 'low';
  }

  cancelStream(streamId: string): void {
    const timeout = this.activeStreams.get(streamId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeStreams.delete(streamId);
      this.emit('streamCancelled', { streamId });
    }
  }

  cancelAllStreams(): void {
    for (const [streamId] of this.activeStreams) {
      this.cancelStream(streamId);
    }
  }

  getActiveStreamsCount(): number {
    return this.activeStreams.size;
  }

  updateConfig(newConfig: Partial<StreamingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // React hook for easy integration
  createStreamingHook() {
    return {
      onChunk: (callback: (data: any) => void) => {
        this.on('chunk', callback);
        return () => this.off('chunk', callback);
      },
      
      onMarketData: (callback: (data: any) => void) => {
        this.on('marketData', callback);
        return () => this.off('marketData', callback);
      },
      
      onTradingAnalysis: (callback: (data: any) => void) => {
        this.on('tradingAnalysis', callback);
        return () => this.off('tradingAnalysis', callback);
      },
      
      onStreamComplete: (callback: (data: any) => void) => {
        this.on('streamComplete', callback);
        return () => this.off('streamComplete', callback);
      }
    };
  }
}