import WebSocket from 'ws';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { ExchangeConnector, OrderResult, PriceData, OrderBookData, TickerData } from './ExchangeConnector';
import { logger } from '../utils/logger';

interface BinanceCredentials {
  apiKey: string;
  apiSecret: string;
  sandbox?: boolean;
}

interface BinanceWebSocketMessage {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // First trade(F)-1 price (first trade before the 24hr rolling window)
  c: string; // Last price
  Q: string; // Last quantity
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

export class BinanceConnector extends ExchangeConnector {
  private baseURL: string;
  private wsBaseURL: string;
  protected credentials: BinanceCredentials | null = null;
  private listenKey: string | null = null;
  private symbolInfo: Map<string, any> = new Map();

  constructor(credentials?: BinanceCredentials) {
    super('binance');
    
    this.credentials = credentials || null;
    this.baseURL = credentials?.sandbox ? 
      'https://testnet.binance.vision/api' : 
      'https://api.binance.com/api';
    this.wsBaseURL = credentials?.sandbox ? 
      'wss://testnet.binance.vision/ws' : 
      'wss://stream.binance.com:9443/ws';
  }

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to Binance...');
      
      // Load exchange info
      await this.loadExchangeInfo();
      
      // Create WebSocket connection for market data
      const wsUrl = `${this.wsBaseURL}/!ticker@arr`;
      this.webSocket = this.createWebSocket(wsUrl);
      
      // If we have credentials, also connect to user data stream
      if (this.credentials) {
        await this.connectUserDataStream();
      }
      
    } catch (error) {
      logger.error('Failed to connect to Binance:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.webSocket) {
        this.webSocket.close();
        this.webSocket = null;
      }
      
      if (this.listenKey && this.credentials) {
        await this.closeUserDataStream();
      }
      
      this.subscriptions.clear();
      this.emit('disconnected');
      
    } catch (error) {
      logger.error('Error disconnecting from Binance:', error);
    }
  }

  protected handleWebSocketMessage(data: any): void {
    try {
      const message = JSON.parse(data.toString());
      
      if (Array.isArray(message)) {
        // Handle ticker array
        message.forEach((ticker: BinanceWebSocketMessage) => {
          this.handleTickerUpdate(ticker);
        });
      } else if (message.e) {
        // Handle individual message
        switch (message.e) {
          case '24hrTicker':
            this.handleTickerUpdate(message as BinanceWebSocketMessage);
            break;
          case 'depthUpdate':
            this.handleDepthUpdate(message);
            break;
          case 'executionReport':
            this.handleExecutionReport(message);
            break;
          default:
            logger.debug(`Unhandled Binance message type: ${message.e}`);
        }
      }
      
    } catch (error) {
      logger.error('Error handling Binance WebSocket message:', error);
    }
  }

  private handleTickerUpdate(ticker: BinanceWebSocketMessage): void {
    const priceData: PriceData = {
      symbol: this.parseSymbol(ticker.s),
      price: parseFloat(ticker.c),
      volume: parseFloat(ticker.v),
      timestamp: ticker.C,
      bid: parseFloat(ticker.b),
      ask: parseFloat(ticker.a),
      lastUpdate: Date.now()
    };
    
    this.emit('priceUpdate', priceData);
  }

  private handleDepthUpdate(message: any): void {
    // Handle order book updates
    this.emit('depthUpdate', {
      symbol: this.parseSymbol(message.s),
      bids: message.b,
      asks: message.a,
      timestamp: message.E
    });
  }

  private handleExecutionReport(message: any): void {
    // Handle order execution reports
    this.emit('executionReport', {
      orderId: message.i,
      symbol: this.parseSymbol(message.s),
      side: message.S,
      orderType: message.o,
      quantity: parseFloat(message.q),
      price: parseFloat(message.p),
      status: message.X,
      timestamp: message.E
    });
  }

  async subscribeToPriceUpdates(symbol: string): Promise<void> {
    try {
      const binanceSymbol = this.formatSymbol(symbol);
      
      if (this.subscriptions.has(binanceSymbol)) {
        return; // Already subscribed
      }
      
      // Subscribe via WebSocket stream
      const streamName = `${binanceSymbol.toLowerCase()}@ticker`;
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const subscribeMessage = {
          method: 'SUBSCRIBE',
          params: [streamName],
          id: Date.now()
        };
        
        this.webSocket.send(JSON.stringify(subscribeMessage));
        this.subscriptions.add(binanceSymbol);
        
        logger.debug(`Subscribed to Binance price updates for ${symbol}`);
      }
      
    } catch (error) {
      logger.error(`Failed to subscribe to Binance price updates for ${symbol}:`, error);
      throw error;
    }
  }

  async unsubscribeFromPriceUpdates(symbol: string): Promise<void> {
    try {
      const binanceSymbol = this.formatSymbol(symbol);
      
      if (!this.subscriptions.has(binanceSymbol)) {
        return; // Not subscribed
      }
      
      const streamName = `${binanceSymbol.toLowerCase()}@ticker`;
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const unsubscribeMessage = {
          method: 'UNSUBSCRIBE',
          params: [streamName],
          id: Date.now()
        };
        
        this.webSocket.send(JSON.stringify(unsubscribeMessage));
        this.subscriptions.delete(binanceSymbol);
        
        logger.debug(`Unsubscribed from Binance price updates for ${symbol}`);
      }
      
    } catch (error) {
      logger.error(`Failed to unsubscribe from Binance price updates for ${symbol}:`, error);
    }
  }

  async placeBuyOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return this.placeOrder(symbol, 'BUY', quantity, price);
  }

  async placeSellOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return this.placeOrder(symbol, 'SELL', quantity, price);
  }

  private async placeOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price?: number): Promise<OrderResult> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for placing orders');
      }
      
      const binanceSymbol = this.formatSymbol(symbol);
      const orderType = price ? 'LIMIT' : 'MARKET';
      
      const params: any = {
        symbol: binanceSymbol,
        side,
        type: orderType,
        quantity: quantity.toString(),
        timestamp: Date.now()
      };
      
      if (price) {
        params.price = price.toString();
        params.timeInForce = 'GTC'; // Good Till Cancelled
      }
      
      const response = await this.makeAuthenticatedRequest('POST', '/v3/order', params);
      
      return {
        success: true,
        orderId: response.orderId.toString(),
        price: parseFloat(response.price || price?.toString() || '0'),
        quantity: parseFloat(response.origQty),
        timestamp: response.transactTime
      };
      
    } catch (error: any) {
      logger.error(`Failed to place ${side} order on Binance:`, error);
      
      return {
        success: false,
        error: error.response?.data?.msg || error.message,
        timestamp: Date.now()
      };
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for cancelling orders');
      }
      
      const params = {
        orderId: orderId,
        timestamp: Date.now()
      };
      
      await this.makeAuthenticatedRequest('DELETE', '/v3/order', params);
      return true;
      
    } catch (error) {
      logger.error(`Failed to cancel order ${orderId} on Binance:`, error);
      return false;
    }
  }

  async getOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      const binanceSymbol = this.formatSymbol(symbol);
      const response = await this.makePublicRequest('GET', '/v3/depth', {
        symbol: binanceSymbol,
        limit: 100
      });
      
      return {
        symbol: this.parseSymbol(binanceSymbol),
        bids: response.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: response.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
        timestamp: Date.now()
      };
      
    } catch (error) {
      logger.error(`Failed to get order book for ${symbol} from Binance:`, error);
      throw error;
    }
  }

  async getTicker(symbol: string): Promise<TickerData> {
    try {
      const binanceSymbol = this.formatSymbol(symbol);
      const response = await this.makePublicRequest('GET', '/v3/ticker/24hr', {
        symbol: binanceSymbol
      });
      
      return {
        symbol: this.parseSymbol(binanceSymbol),
        price: parseFloat(response.lastPrice),
        change24h: parseFloat(response.priceChangePercent),
        volume24h: parseFloat(response.volume),
        high24h: parseFloat(response.highPrice),
        low24h: parseFloat(response.lowPrice),
        timestamp: response.closeTime
      };
      
    } catch (error) {
      logger.error(`Failed to get ticker for ${symbol} from Binance:`, error);
      throw error;
    }
  }

  async getBalance(asset: string): Promise<number> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for getting balance');
      }
      
      const response = await this.makeAuthenticatedRequest('GET', '/v3/account', {
        timestamp: Date.now()
      });
      
      const balance = response.balances.find((b: any) => b.asset === asset.toUpperCase());
      return balance ? parseFloat(balance.free) : 0;
      
    } catch (error) {
      logger.error(`Failed to get balance for ${asset} from Binance:`, error);
      return 0;
    }
  }

  async getTradingFee(symbol: string): Promise<number> {
    try {
      if (!this.credentials) {
        return 0.001; // Default Binance fee
      }
      
      const binanceSymbol = this.formatSymbol(symbol);
      const response = await this.makeAuthenticatedRequest('GET', '/v3/tradeFee', {
        symbol: binanceSymbol,
        timestamp: Date.now()
      });
      
      return response.tradeFee ? parseFloat(response.tradeFee[0].takerCommission) : 0.001;
      
    } catch (error) {
      logger.error(`Failed to get trading fee for ${symbol} from Binance:`, error);
      return 0.001; // Default fee
    }
  }

  protected async makeAuthenticatedRequest(method: string, endpoint: string, params: any = {}): Promise<any> {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }
    
    const timestamp = Date.now();
    const queryString = new URLSearchParams({ ...params, timestamp: timestamp.toString() }).toString();
    const signature = crypto.createHmac('sha256', this.credentials.apiSecret).update(queryString).digest('hex');
    
    const config = {
      method,
      url: `${this.baseURL}${endpoint}?${queryString}&signature=${signature}`,
      headers: {
        'X-MBX-APIKEY': this.credentials.apiKey
      }
    };
    
    const response: AxiosResponse = await axios(config);
    return response.data;
  }

  protected async makePublicRequest(method: string, endpoint: string, params: any = {}): Promise<any> {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response: AxiosResponse = await axios({
      method,
      url
    });
    
    return response.data;
  }

  private async loadExchangeInfo(): Promise<void> {
    try {
      const exchangeInfo = await this.makePublicRequest('GET', '/v3/exchangeInfo');
      
      exchangeInfo.symbols.forEach((symbol: any) => {
        this.symbolInfo.set(symbol.symbol, symbol);
      });
      
      logger.debug(`Loaded info for ${exchangeInfo.symbols.length} Binance symbols`);
      
    } catch (error) {
      logger.error('Failed to load Binance exchange info:', error);
      throw error;
    }
  }

  private async connectUserDataStream(): Promise<void> {
    if (!this.credentials) return;
    
    try {
      // Get listen key for user data stream
      const response = await this.makeAuthenticatedRequest('POST', '/v3/userDataStream');
      this.listenKey = response.listenKey;
      
      // Keep alive the listen key
      setInterval(() => {
        if (this.listenKey && this.credentials) {
          this.makeAuthenticatedRequest('PUT', '/v3/userDataStream', {
            listenKey: this.listenKey
          }).catch((error) => {
            logger.error('Failed to keep alive Binance user data stream:', error);
          });
        }
      }, 30 * 60 * 1000); // Every 30 minutes
      
    } catch (error) {
      logger.error('Failed to connect to Binance user data stream:', error);
    }
  }

  private async closeUserDataStream(): Promise<void> {
    if (!this.listenKey || !this.credentials) return;
    
    try {
      await this.makeAuthenticatedRequest('DELETE', '/v3/userDataStream', {
        listenKey: this.listenKey
      });
      this.listenKey = null;
      
    } catch (error) {
      logger.error('Failed to close Binance user data stream:', error);
    }
  }

  protected formatSymbol(symbol: string): string {
    return symbol.replace('/', '').toUpperCase();
  }

  protected parseSymbol(binanceSymbol: string): string {
    // This is a simplified conversion - in practice, you'd need a proper mapping
    if (binanceSymbol.endsWith('USDT')) {
      return `${binanceSymbol.slice(0, -4)}/USDT`;
    }
    if (binanceSymbol.endsWith('BTC')) {
      return `${binanceSymbol.slice(0, -3)}/BTC`;
    }
    if (binanceSymbol.endsWith('ETH')) {
      return `${binanceSymbol.slice(0, -3)}/ETH`;
    }
    return binanceSymbol;
  }

  // Required abstract method implementations
  async getExchangeInfo(): Promise<any> {
    return this.makePublicRequest('GET', '/v3/exchangeInfo');
  }

  async getSymbols(): Promise<string[]> {
    const exchangeInfo = await this.getExchangeInfo();
    return exchangeInfo.symbols.map((s: any) => this.parseSymbol(s.symbol));
  }

  async getMinTradeSize(symbol: string): Promise<number> {
    const binanceSymbol = this.formatSymbol(symbol);
    const symbolInfo = this.symbolInfo.get(binanceSymbol);
    
    if (!symbolInfo) return 0;
    
    const lotSizeFilter = symbolInfo.filters.find((f: any) => f.filterType === 'LOT_SIZE');
    return lotSizeFilter ? parseFloat(lotSizeFilter.minQty) : 0;
  }

  async getMaxTradeSize(symbol: string): Promise<number> {
    const binanceSymbol = this.formatSymbol(symbol);
    const symbolInfo = this.symbolInfo.get(binanceSymbol);
    
    if (!symbolInfo) return 0;
    
    const lotSizeFilter = symbolInfo.filters.find((f: any) => f.filterType === 'LOT_SIZE');
    return lotSizeFilter ? parseFloat(lotSizeFilter.maxQty) : 0;
  }

  async getStepSize(symbol: string): Promise<number> {
    const binanceSymbol = this.formatSymbol(symbol);
    const symbolInfo = this.symbolInfo.get(binanceSymbol);
    
    if (!symbolInfo) return 0;
    
    const lotSizeFilter = symbolInfo.filters.find((f: any) => f.filterType === 'LOT_SIZE');
    return lotSizeFilter ? parseFloat(lotSizeFilter.stepSize) : 0;
  }

  async getTickSize(symbol: string): Promise<number> {
    const binanceSymbol = this.formatSymbol(symbol);
    const symbolInfo = this.symbolInfo.get(binanceSymbol);
    
    if (!symbolInfo) return 0;
    
    const priceFilter = symbolInfo.filters.find((f: any) => f.filterType === 'PRICE_FILTER');
    return priceFilter ? parseFloat(priceFilter.tickSize) : 0;
  }
}

export default BinanceConnector;