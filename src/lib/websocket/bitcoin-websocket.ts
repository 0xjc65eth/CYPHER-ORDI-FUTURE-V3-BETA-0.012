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

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...config
    };
  }

  connect() {
    if (this.isConnected) return;

    try {
      // Only connect in browser environment
      if (typeof window === 'undefined') {
        console.log('WebSocket connection skipped - server environment');
        return;
      }
      
      // Binance WebSocket para BTC/USDT
      this.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

      this.ws.onopen = () => {
        console.log('🔗 WebSocket conectado ao Binance');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const price = this.parseBinanceData(data);
          
          if (price) {
            this.lastPrice = price;
            this.emit('price', price);
          }
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket erro:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.isConnected = false;
        this.emit('disconnected');
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      this.handleReconnect();
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
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      console.error('Máximo de tentativas de reconexão atingido');
      this.emit('max_reconnect_attempts');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Tentando reconectar... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
  }

  getLastPrice(): BitcoinPrice | null {
    return this.lastPrice;
  }

  isActive(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let instance: BitcoinWebSocketManager | null = null;

export function getBitcoinWebSocket(): BitcoinWebSocketManager {
  if (!instance) {
    instance = new BitcoinWebSocketManager({
      url: 'wss://stream.binance.com:9443/ws/btcusdt@ticker'
    });
  }
  return instance;
}