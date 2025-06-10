// lib/websocket-client.ts - Enhanced WebSocket Manager for Real-time Data
'use client';

import { useEffect, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
}

export interface ConnectionStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastHeartbeat?: number;
  reconnectAttempts?: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

export interface OrderBookUpdate {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export interface TradeUpdate {
  symbol: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

type WebSocketCallback = (data: any) => void;
type UnsubscribeFunction = () => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private subscribers: Map<string, Set<WebSocketCallback>> = new Map();
  private isConnected: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;
  private url: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      this.url = this.getWebSocketUrl();
    }
  }

  private getWebSocketUrl(): string {
    // For demo purposes, we'll simulate WebSocket connection
    // In production, this would be a real WebSocket server
    return 'mock://websocket';
  }

  connect(): void {
    if (typeof window === 'undefined') return;
    
    // For demo purposes, simulate a successful WebSocket connection
    console.log('🔌 Simulating WebSocket connection for demo...');
    
    setTimeout(() => {
      console.log('✅ Demo WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.notifySubscribers('connection', { 
        status: 'connected',
        timestamp: Date.now()
      });
      
      // Start mock data simulation
      this.startMockDataBroadcast();
    }, 1000);
  }

  private handleMessage(message: WebSocketMessage): void {
    // Update last heartbeat if it's a heartbeat message
    if (message.type === 'heartbeat') {
      this.lastHeartbeat = Date.now();
      return;
    }

    // Notify specific channel subscribers
    this.notifySubscribers(message.type, message.payload);
    
    // Also notify 'all' channel subscribers
    this.notifySubscribers('all', message);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  subscribe(channel: string, callback: WebSocketCallback): UnsubscribeFunction {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    // Auto-connect if not connected
    if (!this.isConnected && !this.ws) {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  private notifySubscribers(channel: string, data: any): void {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error in WebSocket callback:', error);
        }
      });
    }
  }

  send(data: any): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ WebSocket not connected, message queued');
    }
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus(): ConnectionStatus {
    return {
      status: this.isConnected ? 'connected' : 'disconnected',
      lastHeartbeat: this.lastHeartbeat,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Convenience methods for specific data types
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): UnsubscribeFunction {
    return this.subscribe(`market.${symbol}`, callback);
  }

  subscribeToOrderBook(symbol: string, callback: (data: OrderBookUpdate) => void): UnsubscribeFunction {
    return this.subscribe(`orderbook.${symbol}`, callback);
  }

  subscribeToTrades(symbol: string, callback: (data: TradeUpdate) => void): UnsubscribeFunction {
    return this.subscribe(`trades.${symbol}`, callback);
  }

  subscribeToAlerts(callback: (data: any) => void): UnsubscribeFunction {
    return this.subscribe('alerts', callback);
  }

  subscribeToNotifications(callback: (data: any) => void): UnsubscribeFunction {
    return this.subscribe('notifications', callback);
  }

  // Mock data broadcasting for demo purposes
  private startMockDataBroadcast(): void {
    // Mock market data updates every 5 seconds
    setInterval(() => {
      const marketData: MarketData = {
        symbol: 'BTC',
        price: 67000 + (Math.random() - 0.5) * 2000,
        change24h: (Math.random() - 0.5) * 10,
        volume24h: 25000000000 + Math.random() * 5000000000,
        timestamp: Date.now()
      };

      this.notifySubscribers('market.BTC', marketData);
    }, 5000);

    // Mock ETH data
    setInterval(() => {
      const marketData: MarketData = {
        symbol: 'ETH',
        price: 3200 + (Math.random() - 0.5) * 200,
        change24h: (Math.random() - 0.5) * 8,
        volume24h: 15000000000 + Math.random() * 3000000000,
        timestamp: Date.now()
      };

      this.notifySubscribers('market.ETH', marketData);
    }, 6000);

    // Mock order book updates every 2 seconds
    setInterval(() => {
      const orderBookUpdate: OrderBookUpdate = {
        symbol: 'BTC',
        bids: Array.from({ length: 5 }, (_, i) => [
          67000 - i * 10 + Math.random() * 5,
          Math.random() * 2
        ]),
        asks: Array.from({ length: 5 }, (_, i) => [
          67000 + i * 10 + Math.random() * 5,
          Math.random() * 2
        ]),
        timestamp: Date.now()
      };

      this.notifySubscribers('orderbook.BTC', orderBookUpdate);
    }, 2000);

    // Mock trade updates every 3 seconds
    setInterval(() => {
      const tradeUpdate: TradeUpdate = {
        symbol: 'BTC',
        price: 67000 + (Math.random() - 0.5) * 100,
        size: Math.random() * 0.5,
        side: Math.random() > 0.5 ? 'buy' : 'sell',
        timestamp: Date.now()
      };

      this.notifySubscribers('trades.BTC', tradeUpdate);
    }, 3000);

    // Mock price alerts every 30 seconds
    setInterval(() => {
      const alerts = [
        {
          type: 'price_alert',
          title: 'BTC Price Alert',
          message: `Bitcoin ${Math.random() > 0.5 ? 'crossed $67,000!' : 'dropped below $66,000!'}`,
          symbol: 'BTC',
          price: 67000 + (Math.random() - 0.5) * 1000,
          timestamp: Date.now()
        },
        {
          type: 'price_alert',
          title: 'ETH Volume Alert',
          message: 'Ethereum volume spike detected (+15%)',
          symbol: 'ETH',
          volume: 18000000000,
          change: '+15%',
          timestamp: Date.now()
        }
      ];

      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      this.notifySubscribers('alerts', randomAlert);
    }, 30000);

    // Mock notifications every 20 seconds
    setInterval(() => {
      const notifications = [
        {
          type: 'system',
          title: 'System Update',
          message: 'New features have been added to the platform',
          timestamp: Date.now()
        },
        {
          type: 'trade_completed',
          title: 'Trade Executed',
          message: 'Your BTC swap has been completed successfully',
          timestamp: Date.now()
        },
        {
          type: 'market_update',
          title: 'Market Movement',
          message: 'High volatility detected in the Bitcoin market',
          timestamp: Date.now()
        },
        {
          type: 'success',
          title: 'Connection Stable',
          message: 'Real-time data stream is working perfectly',
          timestamp: Date.now()
        }
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      this.notifySubscribers('notifications', {
        ...randomNotification,
        id: Date.now().toString(),
      });
    }, 20000);

    console.log('📊 Started broadcasting mock data for demo');
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();

// React hook for WebSocket connection
export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected'
  });

  useEffect(() => {
    const unsubscribe = wsManager.subscribe('connection', (status) => {
      setConnectionStatus(status);
    });

    // Get initial status
    setConnectionStatus(wsManager.getConnectionStatus());

    return unsubscribe;
  }, []);

  return { connectionStatus, wsManager };
}

// React hook for real-time data subscription
export function useRealTimeData<T>(channel: string): {
  data: T | null;
  isConnected: boolean;
  error: string | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { connectionStatus } = useWebSocket();

  useEffect(() => {
    const unsubscribeData = wsManager.subscribe(channel, (newData: T) => {
      setData(newData);
      setError(null);
    });

    const unsubscribeError = wsManager.subscribe('error', (errorData) => {
      setError(errorData.error || 'Unknown error');
    });

    return () => {
      unsubscribeData();
      unsubscribeError();
    };
  }, [channel]);

  return {
    data,
    isConnected: connectionStatus.status === 'connected',
    error
  };
}

// React hook for market data
export function useMarketData(symbol: string): {
  marketData: MarketData | null;
  isConnected: boolean;
} {
  const { data, isConnected } = useRealTimeData<MarketData>(`market.${symbol}`);
  
  return {
    marketData: data,
    isConnected
  };
}

// React hook for order book data
export function useOrderBook(symbol: string): {
  orderBook: OrderBookUpdate | null;
  isConnected: boolean;
} {
  const { data, isConnected } = useRealTimeData<OrderBookUpdate>(`orderbook.${symbol}`);
  
  return {
    orderBook: data,
    isConnected
  };
}

// Export default instance
export default wsManager;