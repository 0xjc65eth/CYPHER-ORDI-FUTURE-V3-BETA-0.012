import WebSocket from 'ws';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { ExchangeConnector, OrderResult, PriceData, OrderBookData, TickerData } from './ExchangeConnector';
import { logger } from '../utils/logger';

interface OKXCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  sandbox?: boolean;
}

interface OKXWebSocketMessage {
  event?: string;
  arg?: {
    channel: string;
    instId: string;
  };
  data?: any[];
  code?: string;
  msg?: string;
}

export class OKXConnector extends ExchangeConnector {
  private baseURL: string;
  private wsURL: string;
  protected credentials: OKXCredentials | null = null;
  private instruments: Map<string, any> = new Map();
  private subscriptionMap: Map<string, string> = new Map();

  constructor(credentials?: OKXCredentials) {
    super('okx');
    
    this.credentials = credentials || null;
    this.baseURL = credentials?.sandbox ? 
      'https://www.okx.com/api/v5' : 
      'https://www.okx.com/api/v5';
    this.wsURL = credentials?.sandbox ? 
      'wss://wspap.okx.com:8443/ws/v5/public?brokerId=9999' : 
      'wss://ws.okx.com:8443/ws/v5/public';
  }

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to OKX...');
      
      // Load instruments info
      await this.loadInstruments();
      
      // Create WebSocket connection
      this.webSocket = this.createWebSocket(this.wsURL);
      
    } catch (error) {
      logger.error('Failed to connect to OKX:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.webSocket) {
        // Send unsubscribe messages for all active subscriptions
        for (const [channel, instId] of this.subscriptionMap.entries()) {
          const unsubscribeMessage = {
            op: 'unsubscribe',
            args: [{
              channel,
              instId
            }]
          };
          
          if (this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(JSON.stringify(unsubscribeMessage));
          }
        }
        
        this.webSocket.close();
        this.webSocket = null;
      }
      
      this.subscriptions.clear();
      this.subscriptionMap.clear();
      this.emit('disconnected');
      
    } catch (error) {
      logger.error('Error disconnecting from OKX:', error);
    }
  }

  protected handleWebSocketMessage(data: any): void {
    try {
      const message: OKXWebSocketMessage = JSON.parse(data.toString());
      
      if (message.event) {
        this.handleEventMessage(message);
      } else if (message.arg && message.data) {
        this.handleDataMessage(message);
      }
      
    } catch (error) {
      logger.error('Error handling OKX WebSocket message:', error);
    }
  }

  private handleEventMessage(message: OKXWebSocketMessage): void {
    switch (message.event) {
      case 'subscribe':
        if (message.arg) {
          logger.debug(`Subscribed to OKX ${message.arg.channel} for ${message.arg.instId}`);
        }
        break;
      case 'unsubscribe':
        if (message.arg) {
          logger.debug(`Unsubscribed from OKX ${message.arg.channel} for ${message.arg.instId}`);
        }
        break;
      case 'error':
        logger.error('OKX WebSocket error:', message.msg);
        break;
      default:
        logger.debug(`Unhandled OKX event: ${message.event}`);
    }
  }

  private handleDataMessage(message: OKXWebSocketMessage): void {
    if (!message.arg || !message.data) return;
    
    const { channel, instId } = message.arg;
    
    switch (channel) {
      case 'tickers':
        this.handleTickerUpdate(message.data, instId);
        break;
      case 'books':
      case 'books5':
        this.handleBookUpdate(message.data, instId);
        break;
      case 'trades':
        this.handleTradeUpdate(message.data, instId);
        break;
      case 'orders':
        this.handleOrderUpdate(message.data, instId);
        break;
      default:
        logger.debug(`Unhandled OKX channel: ${channel}`);
    }
  }

  private handleTickerUpdate(data: any[], instId: string): void {
    try {
      data.forEach(ticker => {
        const priceData: PriceData = {
          symbol: this.parseSymbol(instId),
          price: parseFloat(ticker.last),
          volume: parseFloat(ticker.vol24h),
          timestamp: parseInt(ticker.ts),
          bid: parseFloat(ticker.bidPx),
          ask: parseFloat(ticker.askPx),
          lastUpdate: Date.now()
        };
        
        this.emit('priceUpdate', priceData);
      });
      
    } catch (error) {
      logger.error('Error handling OKX ticker update:', error);
    }
  }

  private handleBookUpdate(data: any[], instId: string): void {
    try {
      data.forEach(book => {
        this.emit('depthUpdate', {
          symbol: this.parseSymbol(instId),
          bids: book.bids?.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]) || [],
          asks: book.asks?.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]) || [],
          timestamp: parseInt(book.ts)
        });
      });
      
    } catch (error) {
      logger.error('Error handling OKX book update:', error);
    }
  }

  private handleTradeUpdate(data: any[], instId: string): void {
    try {
      data.forEach(trade => {
        this.emit('trade', {
          symbol: this.parseSymbol(instId),
          price: parseFloat(trade.px),
          size: parseFloat(trade.sz),
          side: trade.side,
          timestamp: parseInt(trade.ts)
        });
      });
      
    } catch (error) {
      logger.error('Error handling OKX trade update:', error);
    }
  }

  private handleOrderUpdate(data: any[], instId: string): void {
    try {
      data.forEach(order => {
        this.emit('orderUpdate', {
          orderId: order.ordId,
          instId: order.instId,
          side: order.side,
          orderType: order.ordType,
          size: parseFloat(order.sz),
          price: parseFloat(order.px),
          state: order.state,
          timestamp: parseInt(order.uTime)
        });
      });
      
    } catch (error) {
      logger.error('Error handling OKX order update:', error);
    }
  }

  async subscribeToPriceUpdates(symbol: string): Promise<void> {
    try {
      const okxSymbol = this.formatSymbol(symbol);
      
      if (this.subscriptions.has(okxSymbol)) {
        return; // Already subscribed
      }
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const subscribeMessage = {
          op: 'subscribe',
          args: [
            {
              channel: 'tickers',
              instId: okxSymbol
            },
            {
              channel: 'books5',
              instId: okxSymbol
            }
          ]
        };
        
        this.webSocket.send(JSON.stringify(subscribeMessage));
        this.subscriptions.add(okxSymbol);
        this.subscriptionMap.set('tickers', okxSymbol);
        this.subscriptionMap.set('books5', okxSymbol);
        
        logger.debug(`Subscribed to OKX price updates for ${symbol}`);
      }
      
    } catch (error) {
      logger.error(`Failed to subscribe to OKX price updates for ${symbol}:`, error);
      throw error;
    }
  }

  async unsubscribeFromPriceUpdates(symbol: string): Promise<void> {
    try {
      const okxSymbol = this.formatSymbol(symbol);
      
      if (!this.subscriptions.has(okxSymbol)) {
        return; // Not subscribed
      }
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const unsubscribeMessage = {
          op: 'unsubscribe',
          args: [
            {
              channel: 'tickers',
              instId: okxSymbol
            },
            {
              channel: 'books5',
              instId: okxSymbol
            }
          ]
        };
        
        this.webSocket.send(JSON.stringify(unsubscribeMessage));
        this.subscriptions.delete(okxSymbol);
        this.subscriptionMap.delete('tickers');
        this.subscriptionMap.delete('books5');
        
        logger.debug(`Unsubscribed from OKX price updates for ${symbol}`);
      }
      
    } catch (error) {
      logger.error(`Failed to unsubscribe from OKX price updates for ${symbol}:`, error);
    }
  }

  async placeBuyOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return this.placeOrder(symbol, 'buy', quantity, price);
  }

  async placeSellOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return this.placeOrder(symbol, 'sell', quantity, price);
  }

  private async placeOrder(symbol: string, side: 'buy' | 'sell', sz: number, price?: number): Promise<OrderResult> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for placing orders');
      }
      
      const okxSymbol = this.formatSymbol(symbol);
      const orderType = price ? 'limit' : 'market';
      
      const params: any = {
        instId: okxSymbol,
        tdMode: 'cash', // Trade mode
        side,
        ordType: orderType,
        sz: sz.toString()
      };
      
      if (price) {
        params.px = price.toString();
      }
      
      const response = await this.makeAuthenticatedRequest('POST', '/trade/order', [params]);
      
      if (response.code !== '0') {
        throw new Error(response.msg || 'Order placement failed');
      }
      
      const orderResult = response.data[0];
      
      return {
        success: true,
        orderId: orderResult.ordId,
        price: price || 0,
        quantity: sz,
        timestamp: Date.now()
      };
      
    } catch (error: any) {
      logger.error(`Failed to place ${side} order on OKX:`, error);
      
      return {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for cancelling orders');
      }
      
      const response = await this.makeAuthenticatedRequest('POST', '/trade/cancel-order', [{
        ordId: orderId
      }]);
      
      if (response.code !== '0') {
        throw new Error(response.msg || 'Order cancellation failed');
      }
      
      return true;
      
    } catch (error) {
      logger.error(`Failed to cancel order ${orderId} on OKX:`, error);
      return false;
    }
  }

  async getOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      const okxSymbol = this.formatSymbol(symbol);
      const response = await this.makePublicRequest('GET', '/market/books', {
        instId: okxSymbol,
        sz: 100
      });
      
      if (response.code !== '0') {
        throw new Error(response.msg || 'Failed to get order book');
      }
      
      const bookData = response.data[0];
      
      return {
        symbol: this.parseSymbol(okxSymbol),
        bids: bookData.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: bookData.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
        timestamp: parseInt(bookData.ts)
      };
      
    } catch (error) {
      logger.error(`Failed to get order book for ${symbol} from OKX:`, error);
      throw error;
    }
  }

  async getTicker(symbol: string): Promise<TickerData> {
    try {
      const okxSymbol = this.formatSymbol(symbol);
      const response = await this.makePublicRequest('GET', '/market/ticker', {
        instId: okxSymbol
      });
      
      if (response.code !== '0') {
        throw new Error(response.msg || 'Failed to get ticker');
      }
      
      const tickerData = response.data[0];
      
      return {
        symbol: this.parseSymbol(okxSymbol),
        price: parseFloat(tickerData.last),
        change24h: parseFloat(tickerData.change24h),
        volume24h: parseFloat(tickerData.vol24h),
        high24h: parseFloat(tickerData.high24h),
        low24h: parseFloat(tickerData.low24h),
        timestamp: parseInt(tickerData.ts)
      };
      
    } catch (error) {
      logger.error(`Failed to get ticker for ${symbol} from OKX:`, error);
      throw error;
    }
  }

  async getBalance(asset: string): Promise<number> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for getting balance');
      }
      
      const response = await this.makeAuthenticatedRequest('GET', '/account/balance', {
        ccy: asset.toUpperCase()
      });
      
      if (response.code !== '0') {
        throw new Error(response.msg || 'Failed to get balance');
      }
      
      const balanceData = response.data[0];
      const assetBalance = balanceData.details.find((detail: any) => detail.ccy === asset.toUpperCase());
      
      return assetBalance ? parseFloat(assetBalance.availBal) : 0;
      
    } catch (error) {
      logger.error(`Failed to get balance for ${asset} from OKX:`, error);
      return 0;
    }
  }

  async getTradingFee(symbol: string): Promise<number> {
    try {
      if (!this.credentials) {
        return 0.001; // Default OKX fee
      }
      
      const okxSymbol = this.formatSymbol(symbol);
      const response = await this.makeAuthenticatedRequest('GET', '/account/trade-fee', {
        instType: 'SPOT',
        instId: okxSymbol
      });
      
      if (response.code !== '0') {
        return 0.001; // Default fee on error
      }
      
      return parseFloat(response.data[0].takerU);
      
    } catch (error) {
      logger.error(`Failed to get trading fee for ${symbol} from OKX:`, error);
      return 0.001; // Default fee
    }
  }

  protected async makeAuthenticatedRequest(method: string, path: string, params?: any): Promise<any> {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }
    
    const timestamp = new Date().toISOString();
    const body = params ? JSON.stringify(params) : '';
    const message = timestamp + method.toUpperCase() + path + body;
    
    const signature = crypto
      .createHmac('sha256', this.credentials.apiSecret)
      .update(message)
      .digest('base64');
    
    const config = {
      method,
      url: `${this.baseURL}${path}`,
      headers: {
        'OK-ACCESS-KEY': this.credentials.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.credentials.passphrase,
        'Content-Type': 'application/json'
      },
      data: params
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

  private async loadInstruments(): Promise<void> {
    try {
      const response = await this.makePublicRequest('GET', '/public/instruments', {
        instType: 'SPOT'
      });
      
      if (response.code !== '0') {
        throw new Error(response.msg || 'Failed to load instruments');
      }
      
      response.data.forEach((instrument: any) => {
        this.instruments.set(instrument.instId, instrument);
      });
      
      logger.debug(`Loaded info for ${response.data.length} OKX instruments`);
      
    } catch (error) {
      logger.error('Failed to load OKX instruments:', error);
      throw error;
    }
  }

  protected formatSymbol(symbol: string): string {
    return symbol.replace('/', '-').toUpperCase();
  }

  protected parseSymbol(okxSymbol: string): string {
    return okxSymbol.replace('-', '/');
  }

  // Required abstract method implementations
  async getExchangeInfo(): Promise<any> {
    return this.makePublicRequest('GET', '/public/instruments', {
      instType: 'SPOT'
    });
  }

  async getSymbols(): Promise<string[]> {
    const response = await this.getExchangeInfo();
    if (response.code !== '0') {
      throw new Error(response.msg || 'Failed to get symbols');
    }
    
    return response.data.map((instrument: any) => this.parseSymbol(instrument.instId));
  }

  async getMinTradeSize(symbol: string): Promise<number> {
    const okxSymbol = this.formatSymbol(symbol);
    const instrument = this.instruments.get(okxSymbol);
    return instrument ? parseFloat(instrument.minSz) : 0;
  }

  async getMaxTradeSize(symbol: string): Promise<number> {
    const okxSymbol = this.formatSymbol(symbol);
    const instrument = this.instruments.get(okxSymbol);
    return instrument ? parseFloat(instrument.maxMktSz) : 0;
  }

  async getStepSize(symbol: string): Promise<number> {
    const okxSymbol = this.formatSymbol(symbol);
    const instrument = this.instruments.get(okxSymbol);
    return instrument ? parseFloat(instrument.lotSz) : 0;
  }

  async getTickSize(symbol: string): Promise<number> {
    const okxSymbol = this.formatSymbol(symbol);
    const instrument = this.instruments.get(okxSymbol);
    return instrument ? parseFloat(instrument.tickSz) : 0;
  }
}

export default OKXConnector;