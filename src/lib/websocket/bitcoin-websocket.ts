/**
 * 📡 Bitcoin WebSocket Manager
 * Real-time price updates from multiple sources
 */

import { EventEmitter } from 'events';

export interface BitcoinPrice {
  symbol: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: Date;
  source: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class BitcoinWebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private lastPrice: BitcoinPrice | null = null;
  private isConnected = false;
  private isDestroyed = false;
  private abortController: AbortController | null = null;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...config
    };
  }

  connect() {
    if (this.isConnected || this.isDestroyed) return;

    try {
      // Only connect in browser environment
      if (typeof window === 'undefined') {
        console.log('WebSocket connection skipped - server environment');
        return;
      }
      
      // Criar novo AbortController para esta conexão
      this.abortController = new AbortController();
      const { signal } = this.abortController;
      
      // Binance WebSocket para BTC/USDT
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

      this.ws.onopen = () => {
        if (this.isDestroyed || signal.aborted) {
          this.ws?.close();
          return;
        }
        
        console.log('🔗 WebSocket conectado ao Binance');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        if (this.isDestroyed || signal.aborted) return;
        
        try {
          const data = JSON.parse(event.data);
          const price = this.parseBinanceData(data);
          
          if (price && !this.isDestroyed) {
            this.lastPrice = price;
            this.emit('price', price);
          }
        } catch (error) {
          if (!this.isDestroyed) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        }
      };

      this.ws.onerror = (error) => {
        if (!this.isDestroyed) {
          console.error('WebSocket erro:', error);
          this.emit('error', error);
        }
      };

      this.ws.onclose = () => {
        if (this.isDestroyed) return;
        
        console.log('WebSocket desconectado');
        this.isConnected = false;
        this.emit('disconnected');
        this.handleReconnect();
      };
    } catch (error) {
      if (!this.isDestroyed) {
        console.error('Erro ao conectar WebSocket:', error);
        this.handleReconnect();
      }
    }
  }

  private parseBinanceData(data: any): BitcoinPrice | null {
    try {
      return {
        symbol: 'BTC/USDT',
        price: parseFloat(data.c),
        change24h: parseFloat(data.p),
        change24hPercent: parseFloat(data.P),
        volume24h: parseFloat(data.v),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        timestamp: new Date(),
        source: 'Binance'
      };
    } catch (error) {
      return null;
    }
  }

  private handleReconnect() {
    if (this.isDestroyed) return;
    
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('Máximo de tentativas de reconexão atingido');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Tentando reconectar... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    // Limpar timer anterior se existir
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect();
      }
    }, this.config.reconnectInterval);
  }

  disconnect() {
    this.isDestroyed = true;
    
    // Abortar operações pendentes
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    // Limpar timer de reconexão
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Fechar WebSocket
    if (this.ws) {
      // Remover listeners antes de fechar
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
    
    // Remover todos os listeners
    this.removeAllListeners();
  }

  getLastPrice(): BitcoinPrice | null {
    return this.lastPrice;
  }

  isActive(): boolean {
    return this.isConnected;
  }
}

// Singleton instance com cleanup melhorado
let instance: BitcoinWebSocketManager | null = null;

export function getBitcoinWebSocket(): BitcoinWebSocketManager {
  if (!instance) {
    instance = new BitcoinWebSocketManager({
      url: 'wss://stream.binance.com:9443/ws/btcusdt@ticker'
    });
    
    // Auto-conectar na criação
    instance.connect();
  }
  return instance;
}

// Função para cleanup global (usar em desenvolvimento)
export function destroyBitcoinWebSocket() {
  if (instance) {
    instance.disconnect();
    instance = null;
  }
}

// Cleanup automático quando a página é fechada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    destroyBitcoinWebSocket();
  });
  
  // Cleanup em visíbilidade da página
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && instance) {
      // Pausar conexão quando a página não está visível
      instance.disconnect();
    } else if (document.visibilityState === 'visible' && instance) {
      // Reconectar quando a página volta a ficar visível
      setTimeout(() => {
        if (instance && !instance.isActive()) {
          instance.connect();
        }
      }, 1000);
    }
  });
}