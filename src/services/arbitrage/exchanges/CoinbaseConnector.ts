import WebSocket from 'ws';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { ExchangeConnector, OrderResult, PriceData, OrderBookData, TickerData } from './ExchangeConnector';
import { logger } from '../utils/logger';

interface CoinbaseCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  sandbox?: boolean;
}

interface CoinbaseWebSocketMessage {
  type: string;
  product_id?: string;
  product_ids?: string[];
  price?: string;
  size?: string;
  time?: string;
  sequence?: number;
  order_id?: string;
  order_type?: string;
  side?: string;
  changes?: any[];
  open_24h?: string;
  volume_24h?: string;
  low_24h?: string;
  high_24h?: string;
  volume_30d?: string;
  best_bid?: string;
  best_ask?: string;
}

export class CoinbaseConnector extends ExchangeConnector {
  private baseURL: string;
  private wsURL: string;
  protected credentials: CoinbaseCredentials | null = null;
  private productInfo: Map<string, any> = new Map();
  private wsChannel: string = 'ticker';

  constructor(credentials?: CoinbaseCredentials) {
    super('coinbase');
    
    this.credentials = credentials || null;
    this.baseURL = credentials?.sandbox ? 
      'https://api-public.sandbox.pro.coinbase.com' : 
      'https://api.pro.coinbase.com';
    this.wsURL = credentials?.sandbox ? 
      'wss://ws-feed-public.sandbox.pro.coinbase.com' : 
      'wss://ws-feed.pro.coinbase.com';
  }

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to Coinbase Pro...');
      
      // Load product info
      await this.loadProductInfo();
      
      // Create WebSocket connection
      this.webSocket = this.createWebSocket(this.wsURL);
      
    } catch (error) {
      logger.error('Failed to connect to Coinbase Pro:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.webSocket) {
        // Send unsubscribe message before closing
        const unsubscribeMessage = {
          type: 'unsubscribe',
          product_ids: Array.from(this.subscriptions),
          channels: [this.wsChannel]
        };
        
        if (this.webSocket.readyState === WebSocket.OPEN) {
          this.webSocket.send(JSON.stringify(unsubscribeMessage));
        }
        
        this.webSocket.close();
        this.webSocket = null;
      }
      
      this.subscriptions.clear();
      this.emit('disconnected');
      
    } catch (error) {
      logger.error('Error disconnecting from Coinbase Pro:', error);
    }
  }

  protected handleWebSocketMessage(data: any): void {
    try {
      const message: CoinbaseWebSocketMessage = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'ticker':
          this.handleTickerUpdate(message);
          break;
        case 'l2update':
          this.handleL2Update(message);
          break;
        case 'match':
          this.handleMatchUpdate(message);
          break;
        case 'received':
        case 'open':
        case 'done':
        case 'change':
          this.handleOrderUpdate(message);
          break;
        case 'error':
          logger.error('Coinbase WebSocket error:', message);
          break;
        case 'subscriptions':
          logger.debug('Coinbase subscription confirmation:', message);
          break;
        default:
          logger.debug(`Unhandled Coinbase message type: ${message.type}`);
      }
      
    } catch (error) {
      logger.error('Error handling Coinbase WebSocket message:', error);
    }
  }

  private handleTickerUpdate(message: CoinbaseWebSocketMessage): void {
    if (!message.product_id || !message.price) return;
    
    const priceData: PriceData = {
      symbol: this.parseSymbol(message.product_id),
      price: parseFloat(message.price),
      volume: parseFloat(message.volume_24h || '0'),
      timestamp: new Date(message.time || '').getTime() || Date.now(),
      bid: parseFloat(message.best_bid || '0'),
      ask: parseFloat(message.best_ask || '0'),
      lastUpdate: Date.now()
    };
    
    this.emit('priceUpdate', priceData);
  }

  private handleL2Update(message: CoinbaseWebSocketMessage): void {
    if (!message.product_id || !message.changes) return;
    
    this.emit('depthUpdate', {
      symbol: this.parseSymbol(message.product_id),
      changes: message.changes,
      timestamp: new Date(message.time || '').getTime() || Date.now()
    });
  }

  private handleMatchUpdate(message: CoinbaseWebSocketMessage): void {
    if (!message.product_id) return;
    
    this.emit('trade', {
      symbol: this.parseSymbol(message.product_id),
      price: parseFloat(message.price || '0'),
      size: parseFloat(message.size || '0'),
      side: message.side,
      timestamp: new Date(message.time || '').getTime() || Date.now()
    });
  }

  private handleOrderUpdate(message: CoinbaseWebSocketMessage): void {
    this.emit('orderUpdate', {
      type: message.type,
      orderId: message.order_id,
      productId: message.product_id,
      side: message.side,
      orderType: message.order_type,
      price: message.price ? parseFloat(message.price) : undefined,
      size: message.size ? parseFloat(message.size) : undefined,
      timestamp: new Date(message.time || '').getTime() || Date.now()
    });
  }

  async subscribeToPriceUpdates(symbol: string): Promise<void> {
    try {
      const coinbaseSymbol = this.formatSymbol(symbol);
      
      if (this.subscriptions.has(coinbaseSymbol)) {
        return; // Already subscribed
      }
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const subscribeMessage = {
          type: 'subscribe',
          product_ids: [coinbaseSymbol],
          channels: [
            this.wsChannel,
            {
              name: 'level2',
              product_ids: [coinbaseSymbol]
            }
          ]
        };
        
        this.webSocket.send(JSON.stringify(subscribeMessage));
        this.subscriptions.add(coinbaseSymbol);
        
        logger.debug(`Subscribed to Coinbase price updates for ${symbol}`);
      }
      
    } catch (error) {
      logger.error(`Failed to subscribe to Coinbase price updates for ${symbol}:`, error);
      throw error;
    }
  }

  async unsubscribeFromPriceUpdates(symbol: string): Promise<void> {
    try {
      const coinbaseSymbol = this.formatSymbol(symbol);
      
      if (!this.subscriptions.has(coinbaseSymbol)) {
        return; // Not subscribed
      }
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const unsubscribeMessage = {
          type: 'unsubscribe',
          product_ids: [coinbaseSymbol],
          channels: [this.wsChannel, 'level2']
        };
        
        this.webSocket.send(JSON.stringify(unsubscribeMessage));
        this.subscriptions.delete(coinbaseSymbol);
        
        logger.debug(`Unsubscribed from Coinbase price updates for ${symbol}`);
      }
      
    } catch (error) {
      logger.error(`Failed to unsubscribe from Coinbase price updates for ${symbol}:`, error);
    }
  }

  async placeBuyOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return this.placeOrder(symbol, 'buy', quantity, price);
  }

  async placeSellOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return this.placeOrder(symbol, 'sell', quantity, price);
  }

  private async placeOrder(symbol: string, side: 'buy' | 'sell', size: number, price?: number): Promise<OrderResult> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for placing orders');
      }
      
      const coinbaseSymbol = this.formatSymbol(symbol);
      
      const orderParams: any = {
        product_id: coinbaseSymbol,
        side,
        size: size.toString()
      };
      
      if (price) {
        orderParams.type = 'limit';
        orderParams.price = price.toString();
        orderParams.time_in_force = 'GTC';
      } else {
        orderParams.type = 'market';
      }
      
      const response = await this.makeAuthenticatedRequest('POST', '/orders', orderParams);
      
      return {
        success: true,
        orderId: response.id,
        price: parseFloat(response.price || price?.toString() || '0'),
        quantity: parseFloat(response.size),
        timestamp: new Date(response.created_at).getTime()
      };
      
    } catch (error: any) {
      logger.error(`Failed to place ${side} order on Coinbase:`, error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        timestamp: Date.now()
      };
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for cancelling orders');
      }
      
      await this.makeAuthenticatedRequest('DELETE', `/orders/${orderId}`);
      return true;
      
    } catch (error) {
      logger.error(`Failed to cancel order ${orderId} on Coinbase:`, error);
      return false;
    }
  }

  async getOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      const coinbaseSymbol = this.formatSymbol(symbol);
      const response = await this.makePublicRequest('GET', `/products/${coinbaseSymbol}/book`, {
        level: 2
      });
      
      return {
        symbol: this.parseSymbol(coinbaseSymbol),
        bids: response.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: response.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
        timestamp: Date.now()
      };
      
    } catch (error) {
      logger.error(`Failed to get order book for ${symbol} from Coinbase:`, error);
      throw error;
    }
  }

  async getTicker(symbol: string): Promise<TickerData> {
    try {
      const coinbaseSymbol = this.formatSymbol(symbol);
      const [ticker, stats] = await Promise.all([
        this.makePublicRequest('GET', `/products/${coinbaseSymbol}/ticker`),
        this.makePublicRequest('GET', `/products/${coinbaseSymbol}/stats`)
      ]);
      
      return {
        symbol: this.parseSymbol(coinbaseSymbol),
        price: parseFloat(ticker.price),
        change24h: ((parseFloat(ticker.price) - parseFloat(stats.open)) / parseFloat(stats.open)) * 100,
        volume24h: parseFloat(stats.volume),
        high24h: parseFloat(stats.high),
        low24h: parseFloat(stats.low),
        timestamp: new Date(ticker.time).getTime()
      };
      
    } catch (error) {
      logger.error(`Failed to get ticker for ${symbol} from Coinbase:`, error);
      throw error;
    }
  }

  async getBalance(asset: string): Promise<number> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for getting balance');
      }
      
      const accounts = await this.makeAuthenticatedRequest('GET', '/accounts');
      const account = accounts.find((acc: any) => acc.currency === asset.toUpperCase());
      
      return account ? parseFloat(account.available) : 0;
      
    } catch (error) {
      logger.error(`Failed to get balance for ${asset} from Coinbase:`, error);
      return 0;
    }
  }

  async getTradingFee(symbol: string): Promise<number> {
    try {
      if (!this.credentials) {
        return 0.005; // Default Coinbase Pro fee
      }
      
      const fees = await this.makeAuthenticatedRequest('GET', '/fees');
      return parseFloat(fees.taker_fee_rate);
      
    } catch (error) {
      logger.error(`Failed to get trading fee for ${symbol} from Coinbase:`, error);
      return 0.005; // Default fee
    }
  }

  protected async makeAuthenticatedRequest(method: string, path: string, body?: any): Promise<any> {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }
    
    const timestamp = Date.now() / 1000;
    const bodyString = body ? JSON.stringify(body) : '';
    const message = timestamp + method.toUpperCase() + path + bodyString;
    
    const signature = crypto
      .createHmac('sha256', Buffer.from(this.credentials.apiSecret, 'base64'))
      .update(message)
      .digest('base64');
    
    const config = {
      method,
      url: `${this.baseURL}${path}`,
      headers: {
        'CB-ACCESS-KEY': this.credentials.apiKey,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp.toString(),
        'CB-ACCESS-PASSPHRASE': this.credentials.passphrase,
        'Content-Type': 'application/json'
      },
      data: body
    };
    
    const response: AxiosResponse = await axios(config);
    return response.data;
  }

  protected async makePublicRequest(method: string, path: string, params: any = {}): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}${path}${queryString ? `?${queryString}` : ''}`;
    
    const response: AxiosResponse = await axios({
      method,
      url
    });
    
    return response.data;
  }

  private async loadProductInfo(): Promise<void> {
    try {
      const products = await this.makePublicRequest('GET', '/products');
      
      products.forEach((product: any) => {
        this.productInfo.set(product.id, product);
      });
      
      logger.debug(`Loaded info for ${products.length} Coinbase products`);
      
    } catch (error) {
      logger.error('Failed to load Coinbase product info:', error);
      throw error;
    }
  }

  protected formatSymbol(symbol: string): string {
    return symbol.replace('/', '-').toUpperCase();
  }

  protected parseSymbol(coinbaseSymbol: string): string {
    return coinbaseSymbol.replace('-', '/');
  }

  // Required abstract method implementations
  async getExchangeInfo(): Promise<any> {
    return this.makePublicRequest('GET', '/products');
  }

  async getSymbols(): Promise<string[]> {
    const products = await this.getExchangeInfo();
    return products.map((p: any) => this.parseSymbol(p.id));
  }

  async getMinTradeSize(symbol: string): Promise<number> {
    const coinbaseSymbol = this.formatSymbol(symbol);
    const product = this.productInfo.get(coinbaseSymbol);
    return product ? parseFloat(product.base_min_size) : 0;
  }

  async getMaxTradeSize(symbol: string): Promise<number> {
    const coinbaseSymbol = this.formatSymbol(symbol);
    const product = this.productInfo.get(coinbaseSymbol);
    return product ? parseFloat(product.base_max_size) : 0;
  }

  async getStepSize(symbol: string): Promise<number> {
    const coinbaseSymbol = this.formatSymbol(symbol);
    const product = this.productInfo.get(coinbaseSymbol);
    return product ? parseFloat(product.base_increment) : 0;
  }

  async getTickSize(symbol: string): Promise<number> {
    const coinbaseSymbol = this.formatSymbol(symbol);
    const product = this.productInfo.get(coinbaseSymbol);
    return product ? parseFloat(product.quote_increment) : 0;
  }
}

export default CoinbaseConnector;