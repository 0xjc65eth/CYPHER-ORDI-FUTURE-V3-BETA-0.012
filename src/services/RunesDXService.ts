/**
 * RUNESDX.IO Integration Service
 * Provides order placement, tracking, and trading functionality for Bitcoin Runes
 */

import { logger } from '@/lib/logger';

// Order Types and Interfaces
export interface RunesDXOrder {
  id: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  runeSymbol: string;
  runeName: string;
  amount: string;
  price?: string;
  totalValue: string;
  status: 'pending' | 'placed' | 'partial' | 'filled' | 'cancelled' | 'failed';
  createdAt: string;
  updatedAt: string;
  txHash?: string;
  executedPrice?: string;
  executedAmount?: string;
  fees: {
    networkFee: string;
    tradingFee: string;
    total: string;
  };
  slippage?: number;
  userAddress: string;
  expiresAt?: string;
  metadata?: {
    userAgent?: string;
    referral?: string;
    source: 'cypher-terminal';
  };
}

export interface RunesDXOrderRequest {
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  runeSymbol: string;
  amount: string;
  price?: string;
  slippageTolerance?: number;
  walletAddress: string;
  signature: string;
  publicKey: string;
  orderExpiry?: number; // seconds from now
  clientId?: string;
}

export interface RunesDXOrderResponse {
  success: boolean;
  orderId?: string;
  order?: RunesDXOrder;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  estimatedFees?: {
    networkFee: string;
    tradingFee: string;
    total: string;
  };
}

export interface RunesDXMarketData {
  symbol: string;
  name: string;
  currentPrice: string;
  priceChange24h: string;
  priceChangePercent24h: number;
  volume24h: string;
  high24h: string;
  low24h: string;
  marketCap?: string;
  circulatingSupply: string;
  totalSupply: string;
  liquidity: string;
  spread: string;
  lastUpdated: string;
}

export interface RunesDXOrderBook {
  symbol: string;
  bids: Array<{
    price: string;
    quantity: string;
    total: string;
    address?: string;
  }>;
  asks: Array<{
    price: string;
    quantity: string;
    total: string;
    address?: string;
  }>;
  spread: string;
  lastUpdated: string;
}

export interface RunesDXTradeHistory {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: string;
  quantity: string;
  total: string;
  timestamp: string;
  txHash: string;
  buyer?: string;
  seller?: string;
}

export interface RunesDXWalletBalance {
  address: string;
  runes: Array<{
    symbol: string;
    name: string;
    balance: string;
    value: string;
    price: string;
  }>;
  bitcoin: {
    balance: string;
    unconfirmed: string;
  };
  totalValue: string;
  lastUpdated: string;
}

export interface RunesDXConfig {
  baseUrl?: string;
  apiKey?: string;
  websocketUrl?: string;
  network?: 'mainnet' | 'testnet';
  timeout?: number;
  enableWebsocket?: boolean;
  maxRetries?: number;
}

export class RunesDXService {
  private config: RunesDXConfig;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private websocket?: WebSocket;
  private orderCallbacks = new Map<string, (order: RunesDXOrder) => void>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private defaultTTL = 10000; // 10 seconds for trading data

  constructor(config: RunesDXConfig = {}) {
    this.config = {
      baseUrl: 'https://api.runesdx.io/v1', // Hypothetical API endpoint
      websocketUrl: 'wss://ws.runesdx.io/v1',
      network: 'mainnet',
      timeout: 15000,
      enableWebsocket: true,
      maxRetries: 3,
      ...config,
    };

    // Initialize WebSocket connection if enabled
    if (this.config.enableWebsocket) {
      this.initializeWebSocket();
    }
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket(): void {
    try {
      if (!this.config.websocketUrl) return;

      this.websocket = new WebSocket(this.config.websocketUrl);

      this.websocket.onopen = () => {
        logger.info('RunesDX WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to parse WebSocket message');
        }
      };

      this.websocket.onclose = () => {
        logger.warn('RunesDX WebSocket disconnected');
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        logger.error(error instanceof Error ? error : new Error(String(error)), 'RunesDX WebSocket error');
      };
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to initialize WebSocket');
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'order_update':
        if (data.orderId && this.orderCallbacks.has(data.orderId)) {
          const callback = this.orderCallbacks.get(data.orderId);
          callback?.(data.order);
        }
        break;
      case 'market_data':
        // Cache real-time market data
        this.setCachedData(`market_${data.symbol}`, data.data, 5000);
        break;
      case 'orderbook_update':
        // Cache real-time order book data
        this.setCachedData(`orderbook_${data.symbol}`, data.data, 5000);
        break;
      default:
        logger.debug('Unhandled WebSocket message type:', data.type);
    }
  }

  /**
   * Schedule WebSocket reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max WebSocket reconnection attempts reached');
      return;
    }

    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    this.reconnectAttempts++;

    setTimeout(() => {
      logger.info(`Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.initializeWebSocket();
    }, delay);
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Cache data with TTL
   */
  private setCachedData(key: string, data: any, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      requireAuth?: boolean;
    } = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true,
    } = options;

    const url = `${this.config.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'CypherTerminal/1.0',
      ...headers,
    };

    if (requireAuth && this.config.apiKey) {
      requestHeaders['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    let attempt = 0;
    const maxRetries = this.config.maxRetries || 3;

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(this.config.timeout || 15000),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`RunesDX API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          logger.error(`RunesDX API request failed after ${maxRetries} retries:`, error);
          throw error;
        }
        
        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Request failed after all retry attempts');
  }

  /**
   * Place a new order on RUNESDX.IO
   */
  async placeOrder(orderRequest: RunesDXOrderRequest): Promise<RunesDXOrderResponse> {
    try {
      logger.info('Placing order on RunesDX:', orderRequest);

      // Validate order request
      this.validateOrderRequest(orderRequest);

      // Prepare order payload
      const orderPayload = {
        ...orderRequest,
        timestamp: Date.now(),
        clientId: orderRequest.clientId || `cypher_${Date.now()}`,
        source: 'cypher-terminal',
      };

      const response = await this.makeRequest<RunesDXOrderResponse>('/orders', {
        method: 'POST',
        body: orderPayload,
      });

      // Set up order tracking if successful
      if (response.success && response.orderId) {
        this.trackOrder(response.orderId);
      }

      logger.info('Order placement response:', response);
      return response;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to place order');
      return {
        success: false,
        error: {
          code: 'ORDER_PLACEMENT_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      };
    }
  }

  /**
   * Validate order request before submission
   */
  private validateOrderRequest(orderRequest: RunesDXOrderRequest): void {
    if (!orderRequest.runeSymbol?.trim()) {
      throw new Error('Rune symbol is required');
    }
    
    if (!orderRequest.amount || parseFloat(orderRequest.amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (orderRequest.type === 'limit' && (!orderRequest.price || parseFloat(orderRequest.price) <= 0)) {
      throw new Error('Price is required for limit orders');
    }

    if (!orderRequest.walletAddress?.trim()) {
      throw new Error('Wallet address is required');
    }

    if (!orderRequest.signature?.trim()) {
      throw new Error('Order signature is required');
    }

    if (!orderRequest.publicKey?.trim()) {
      throw new Error('Public key is required');
    }
  }

  /**
   * Track order status updates
   */
  private trackOrder(orderId: string): void {
    if (this.isConnected && this.websocket) {
      // Subscribe to order updates via WebSocket
      this.websocket.send(JSON.stringify({
        type: 'subscribe',
        channel: 'orders',
        orderId,
      }));
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<RunesDXOrder | null> {
    try {
      const response = await this.makeRequest<{ order: RunesDXOrder }>(`/orders/${orderId}`);
      return response.order;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to get order status');
      return null;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, signature: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest<{ success: boolean; message?: string }>(`/orders/${orderId}`, {
        method: 'DELETE',
        body: { signature },
      });

      return { success: response.success };
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to cancel order');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get user's order history
   */
  async getOrderHistory(
    walletAddress: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      symbol?: string;
    } = {}
  ): Promise<RunesDXOrder[]> {
    try {
      const params = new URLSearchParams({
        address: walletAddress,
        limit: (options.limit || 50).toString(),
        offset: (options.offset || 0).toString(),
        ...(options.status && { status: options.status }),
        ...(options.symbol && { symbol: options.symbol }),
      });

      const response = await this.makeRequest<{ orders: RunesDXOrder[] }>(`/orders?${params}`);
      return response.orders;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to get order history');
      return [];
    }
  }

  /**
   * Get market data for a specific rune
   */
  async getMarketData(symbol: string): Promise<RunesDXMarketData | null> {
    const cacheKey = `market_${symbol}`;
    const cached = this.getCachedData<RunesDXMarketData>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<RunesDXMarketData>(`/market/${symbol}`, {
        requireAuth: false,
      });
      
      this.setCachedData(cacheKey, response, 30000); // Cache for 30 seconds
      return response;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to get market data');
      return null;
    }
  }

  /**
   * Get order book for a specific rune
   */
  async getOrderBook(symbol: string): Promise<RunesDXOrderBook | null> {
    const cacheKey = `orderbook_${symbol}`;
    const cached = this.getCachedData<RunesDXOrderBook>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.makeRequest<RunesDXOrderBook>(`/orderbook/${symbol}`, {
        requireAuth: false,
      });
      
      this.setCachedData(cacheKey, response, 5000); // Cache for 5 seconds
      return response;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to get order book');
      return null;
    }
  }

  /**
   * Get trade history for a specific rune
   */
  async getTradeHistory(symbol: string, limit = 50): Promise<RunesDXTradeHistory[]> {
    try {
      const response = await this.makeRequest<{ trades: RunesDXTradeHistory[] }>(
        `/trades/${symbol}?limit=${limit}`,
        { requireAuth: false }
      );
      return response.trades;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to get trade history');
      return [];
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string): Promise<RunesDXWalletBalance | null> {
    try {
      const response = await this.makeRequest<RunesDXWalletBalance>(`/wallet/${address}`);
      return response;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to get wallet balance');
      return null;
    }
  }

  /**
   * Estimate order fees
   */
  async estimateOrderFees(orderRequest: Omit<RunesDXOrderRequest, 'signature' | 'publicKey'>): Promise<{
    networkFee: string;
    tradingFee: string;
    total: string;
  } | null> {
    try {
      const response = await this.makeRequest<{
        fees: {
          networkFee: string;
          tradingFee: string;
          total: string;
        };
      }>('/orders/estimate-fees', {
        method: 'POST',
        body: orderRequest,
      });
      
      return response.fees;
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to estimate order fees');
      return null;
    }
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrderUpdates(orderId: string, callback: (order: RunesDXOrder) => void): void {
    this.orderCallbacks.set(orderId, callback);
  }

  /**
   * Unsubscribe from order updates
   */
  unsubscribeFromOrderUpdates(orderId: string): void {
    this.orderCallbacks.delete(orderId);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    websocketConnected: boolean;
    lastPing?: number;
  } {
    return {
      connected: true, // API connection is always available
      websocketConnected: this.isConnected,
      lastPing: Date.now(),
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }
    this.orderCallbacks.clear();
    this.clearCache();
  }
}

// Default service instance
export const runesDXService = new RunesDXService();

export default runesDXService;