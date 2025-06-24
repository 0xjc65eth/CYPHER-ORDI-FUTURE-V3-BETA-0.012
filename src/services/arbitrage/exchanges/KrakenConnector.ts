import WebSocket from 'ws';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { ExchangeConnector, OrderResult, PriceData, OrderBookData, TickerData } from './ExchangeConnector';
import { logger } from '../utils/logger';

interface KrakenCredentials {
  apiKey: string;
  apiSecret: string;
  sandbox?: boolean;
}

interface KrakenWebSocketMessage {
  channelID?: number;
  channelName?: string;
  event?: string;
  status?: string;
  pair?: string;
  subscription?: {
    name: string;
    interval?: number;
  };
  errorMessage?: string;
}

export class KrakenConnector extends ExchangeConnector {
  private baseURL: string;
  private wsURL: string;
  protected credentials: KrakenCredentials | null = null;
  private assetPairs: Map<string, any> = new Map();
  private channelMap: Map<number, string> = new Map();
  private nonce: number = Date.now();

  constructor(credentials?: KrakenCredentials) {
    super('kraken');
    
    this.credentials = credentials || null;
    this.baseURL = 'https://api.kraken.com';
    this.wsURL = 'wss://ws.kraken.com';
  }

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to Kraken...');
      
      // Load asset pairs info
      await this.loadAssetPairs();
      
      // Create WebSocket connection
      this.webSocket = this.createWebSocket(this.wsURL);
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to connect to Kraken:');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.webSocket) {
        // Send unsubscribe messages for all active subscriptions
        for (const symbol of this.subscriptions) {
          const unsubscribeMessage = {
            event: 'unsubscribe',
            pair: [symbol],
            subscription: {
              name: 'ticker'
            }
          };
          
          if (this.webSocket.readyState === WebSocket.OPEN) {
            this.webSocket.send(JSON.stringify(unsubscribeMessage));
          }
        }
        
        this.webSocket.close();
        this.webSocket = null;
      }
      
      this.subscriptions.clear();
      this.channelMap.clear();
      this.emit('disconnected');
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error disconnecting from Kraken:');
    }
  }

  protected handleWebSocketMessage(data: any): void {
    try {
      const message = JSON.parse(data.toString());
      
      // Handle different message types
      if (message.event) {
        this.handleEventMessage(message as KrakenWebSocketMessage);
      } else if (Array.isArray(message)) {
        // Handle data messages
        this.handleDataMessage(message);
      }
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error handling Kraken WebSocket message:');
    }
  }

  private handleEventMessage(message: KrakenWebSocketMessage): void {
    switch (message.event) {
      case 'systemStatus':
        logger.debug('Kraken system status:', message.status);
        break;
      case 'subscriptionStatus':
        if (message.status === 'subscribed' && message.channelID && message.pair) {
          this.channelMap.set(message.channelID, message.pair);
          logger.debug(`Subscribed to Kraken channel ${message.channelID} for ${message.pair}`);
        }
        break;
      case 'error':
        logger.error('Kraken WebSocket error:', message.errorMessage);
        break;
      default:
        logger.debug(`Unhandled Kraken event: ${message.event}`);
    }
  }

  private handleDataMessage(message: any[]): void {
    if (message.length < 3) return;
    
    const channelID = message[0];
    const data = message[1];
    const channelName = message[2];
    const pair = message[3];
    
    if (channelName === 'ticker') {
      this.handleTickerUpdate(channelID, data, pair);
    } else if (channelName === 'book') {
      this.handleBookUpdate(channelID, data, pair);
    } else if (channelName === 'trade') {
      this.handleTradeUpdate(channelID, data, pair);
    }
  }

  private handleTickerUpdate(channelId: number, data: any, pair: string): void {
    try {
      // Kraken ticker format: [a, b, c, v, p, t, l, h, o]
      // a = ask array, b = bid array, c = close array, v = volume array
      // p = volume weighted average price array, t = trades array
      // l = low array, h = high array, o = open array
      
      const [ask, bid, close, volume, , , low, high] = data;
      
      const priceData: PriceData = {
        symbol: this.parseSymbol(pair),
        price: parseFloat(close[0]),
        volume: parseFloat(volume[1]), // 24h volume
        timestamp: Date.now(),
        bid: parseFloat(bid[0]),
        ask: parseFloat(ask[0]),
        lastUpdate: Date.now()
      };
      
      this.emit('priceUpdate', priceData);
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error handling Kraken ticker update:');
    }
  }

  private handleBookUpdate(channelId: number, data: any, pair: string): void {
    try {
      const symbol = this.parseSymbol(pair);
      
      if (data.bs) { // Bids
        this.emit('depthUpdate', {
          symbol,
          bids: data.bs.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
          timestamp: Date.now()
        });
      }
      
      if (data.as) { // Asks
        this.emit('depthUpdate', {
          symbol,
          asks: data.as.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
          timestamp: Date.now()
        });
      }
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error handling Kraken book update:');
    }
  }

  private handleTradeUpdate(channelId: number, data: any, pair: string): void {
    try {
      const symbol = this.parseSymbol(pair);
      
      data.forEach((trade: any[]) => {
        this.emit('trade', {
          symbol,
          price: parseFloat(trade[0]),
          volume: parseFloat(trade[1]),
          time: parseFloat(trade[2]),
          side: trade[3] === 'b' ? 'buy' : 'sell',
          orderType: trade[4] === 'm' ? 'market' : 'limit',
          timestamp: parseFloat(trade[2]) * 1000
        });
      });
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error handling Kraken trade update:');
    }
  }

  async subscribeToPriceUpdates(symbol: string): Promise<void> {
    try {
      const krakenSymbol = this.formatSymbol(symbol);
      
      if (this.subscriptions.has(krakenSymbol)) {
        return; // Already subscribed
      }
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const subscribeMessage = {
          event: 'subscribe',
          pair: [krakenSymbol],
          subscription: {
            name: 'ticker'
          }
        };
        
        this.webSocket.send(JSON.stringify(subscribeMessage));
        this.subscriptions.add(krakenSymbol);
        
        logger.debug(`Subscribed to Kraken price updates for ${symbol}`);
      }
      
    } catch (error) {
      logger.error(`Failed to subscribe to Kraken price updates for ${symbol}:`, error);
      throw error;
    }
  }

  async unsubscribeFromPriceUpdates(symbol: string): Promise<void> {
    try {
      const krakenSymbol = this.formatSymbol(symbol);
      
      if (!this.subscriptions.has(krakenSymbol)) {
        return; // Not subscribed
      }
      
      if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
        const unsubscribeMessage = {
          event: 'unsubscribe',
          pair: [krakenSymbol],
          subscription: {
            name: 'ticker'
          }
        };
        
        this.webSocket.send(JSON.stringify(unsubscribeMessage));
        this.subscriptions.delete(krakenSymbol);
        
        logger.debug(`Unsubscribed from Kraken price updates for ${symbol}`);
      }
      
    } catch (error) {
      logger.error(`Failed to unsubscribe from Kraken price updates for ${symbol}:`, error);
    }
  }

  async placeBuyOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return this.placeOrder(symbol, 'buy', quantity, price);
  }

  async placeSellOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return this.placeOrder(symbol, 'sell', quantity, price);
  }

  private async placeOrder(symbol: string, side: 'buy' | 'sell', volume: number, price?: number): Promise<OrderResult> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for placing orders');
      }
      
      const krakenSymbol = this.formatSymbol(symbol);
      const orderType = price ? 'limit' : 'market';
      
      const params: any = {
        pair: krakenSymbol,
        type: side,
        ordertype: orderType,
        volume: volume.toString()
      };
      
      if (price) {
        params.price = price.toString();
      }
      
      const response = await this.makeAuthenticatedRequest('POST', '/0/private/AddOrder', params);
      
      if (response.error && response.error.length > 0) {
        throw new Error(response.error.join(', '));
      }
      
      return {
        success: true,
        orderId: response.result.txid[0],
        price: price || 0,
        quantity: volume,
        timestamp: Date.now()
      };
      
    } catch (error: any) {
      logger.error(`Failed to place ${side} order on Kraken:`, error);
      
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
      
      const response = await this.makeAuthenticatedRequest('POST', '/0/private/CancelOrder', {
        txid: orderId
      });
      
      if (response.error && response.error.length > 0) {
        throw new Error(response.error.join(', '));
      }
      
      return true;
      
    } catch (error) {
      logger.error(`Failed to cancel order ${orderId} on Kraken:`, error);
      return false;
    }
  }

  async getOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      const krakenSymbol = this.formatSymbol(symbol);
      const response = await this.makePublicRequest('GET', '/0/public/Depth', {
        pair: krakenSymbol,
        count: 100
      });
      
      if (response.error && response.error.length > 0) {
        throw new Error(response.error.join(', '));
      }
      
      const bookData = response.result[krakenSymbol];
      
      return {
        symbol: this.parseSymbol(krakenSymbol),
        bids: bookData.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: bookData.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
        timestamp: Date.now()
      };
      
    } catch (error) {
      logger.error(`Failed to get order book for ${symbol} from Kraken:`, error);
      throw error;
    }
  }

  async getTicker(symbol: string): Promise<TickerData> {
    try {
      const krakenSymbol = this.formatSymbol(symbol);
      const response = await this.makePublicRequest('GET', '/0/public/Ticker', {
        pair: krakenSymbol
      });
      
      if (response.error && response.error.length > 0) {
        throw new Error(response.error.join(', '));
      }
      
      const tickerData = response.result[krakenSymbol];
      
      return {
        symbol: this.parseSymbol(krakenSymbol),
        price: parseFloat(tickerData.c[0]),
        change24h: ((parseFloat(tickerData.c[0]) - parseFloat(tickerData.o)) / parseFloat(tickerData.o)) * 100,
        volume24h: parseFloat(tickerData.v[1]),
        high24h: parseFloat(tickerData.h[1]),
        low24h: parseFloat(tickerData.l[1]),
        timestamp: Date.now()
      };
      
    } catch (error) {
      logger.error(`Failed to get ticker for ${symbol} from Kraken:`, error);
      throw error;
    }
  }

  async getBalance(asset: string): Promise<number> {
    try {
      if (!this.credentials) {
        throw new Error('Credentials required for getting balance');
      }
      
      const response = await this.makeAuthenticatedRequest('POST', '/0/private/Balance');
      
      if (response.error && response.error.length > 0) {
        throw new Error(response.error.join(', '));
      }
      
      // Kraken uses different asset names (e.g., XXBT for BTC)
      const krakenAsset = this.formatAsset(asset);
      return response.result[krakenAsset] ? parseFloat(response.result[krakenAsset]) : 0;
      
    } catch (error) {
      logger.error(`Failed to get balance for ${asset} from Kraken:`, error);
      return 0;
    }
  }

  async getTradingFee(symbol: string): Promise<number> {
    try {
      if (!this.credentials) {
        return 0.0026; // Default Kraken fee
      }
      
      const response = await this.makeAuthenticatedRequest('POST', '/0/private/TradeVolume');
      
      if (response.error && response.error.length > 0) {
        return 0.0026; // Default fee on error
      }
      
      // Use maker fee as default
      return parseFloat(response.result.fees_maker['0,0'] || '0.0026');
      
    } catch (error) {
      logger.error(`Failed to get trading fee for ${symbol} from Kraken:`, error);
      return 0.0026; // Default fee
    }
  }

  protected async makeAuthenticatedRequest(method: string, path: string, params: any = {}): Promise<any> {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }
    
    const nonce = this.generateNonce();
    const postData = new URLSearchParams({ ...params, nonce: nonce.toString() }).toString();
    
    const message = path + crypto.createHash('sha256').update(nonce + postData).digest();
    const signature = crypto
      .createHmac('sha512', Buffer.from(this.credentials.apiSecret, 'base64'))
      .update(message)
      .digest('base64');
    
    const config = {
      method,
      url: `${this.baseURL}${path}`,
      headers: {
        'API-Key': this.credentials.apiKey,
        'API-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: postData
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

  private async loadAssetPairs(): Promise<void> {
    try {
      const response = await this.makePublicRequest('GET', '/0/public/AssetPairs');
      
      if (response.error && response.error.length > 0) {
        throw new Error(response.error.join(', '));
      }
      
      Object.entries(response.result).forEach(([pair, info]) => {
        this.assetPairs.set(pair, info);
      });
      
      logger.debug(`Loaded info for ${Object.keys(response.result).length} Kraken asset pairs`);
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to load Kraken asset pairs:');
      throw error;
    }
  }

  private generateNonce(): number {
    return ++this.nonce;
  }

  private formatAsset(asset: string): string {
    // Kraken uses different asset naming conventions
    const assetMap: { [key: string]: string } = {
      'BTC': 'XXBT',
      'ETH': 'XETH',
      'USD': 'ZUSD',
      'EUR': 'ZEUR'
    };
    
    return assetMap[asset.toUpperCase()] || asset.toUpperCase();
  }

  protected formatSymbol(symbol: string): string {
    // Convert symbols like BTC/USD to XBTUSD for Kraken
    const [base, quote] = symbol.split('/');
    const krakenBase = this.formatAsset(base);
    const krakenQuote = this.formatAsset(quote);
    return krakenBase + krakenQuote;
  }

  protected parseSymbol(krakenSymbol: string): string {
    // This is a simplified conversion
    // In practice, you'd need to use the asset pairs mapping
    if (krakenSymbol.includes('XXBT')) {
      return krakenSymbol.replace('XXBT', 'BTC/').replace('ZUSD', 'USD').replace('ZEUR', 'EUR');
    }
    if (krakenSymbol.includes('XETH')) {
      return krakenSymbol.replace('XETH', 'ETH/').replace('ZUSD', 'USD').replace('ZEUR', 'EUR');
    }
    return krakenSymbol;
  }

  // Required abstract method implementations
  async getExchangeInfo(): Promise<any> {
    return this.makePublicRequest('GET', '/0/public/AssetPairs');
  }

  async getSymbols(): Promise<string[]> {
    const response = await this.getExchangeInfo();
    if (response.error && response.error.length > 0) {
      throw new Error(response.error.join(', '));
    }
    
    return Object.keys(response.result).map(pair => this.parseSymbol(pair));
  }

  async getMinTradeSize(symbol: string): Promise<number> {
    const krakenSymbol = this.formatSymbol(symbol);
    const pairInfo = this.assetPairs.get(krakenSymbol);
    return pairInfo ? parseFloat(pairInfo.ordermin) : 0;
  }

  async getMaxTradeSize(symbol: string): Promise<number> {
    // Kraken doesn't have explicit max trade sizes in the same way
    return Number.MAX_SAFE_INTEGER;
  }

  async getStepSize(symbol: string): Promise<number> {
    const krakenSymbol = this.formatSymbol(symbol);
    const pairInfo = this.assetPairs.get(krakenSymbol);
    return pairInfo ? Math.pow(10, -pairInfo.lot_decimals) : 0;
  }

  async getTickSize(symbol: string): Promise<number> {
    const krakenSymbol = this.formatSymbol(symbol);
    const pairInfo = this.assetPairs.get(krakenSymbol);
    return pairInfo ? Math.pow(10, -pairInfo.pair_decimals) : 0;
  }
}

export default KrakenConnector;