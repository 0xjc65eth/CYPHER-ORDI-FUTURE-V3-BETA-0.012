import axios, { AxiosResponse } from 'axios';
import { ExchangeConnector, OrderResult, PriceData, OrderBookData, TickerData } from './ExchangeConnector';
import { logger } from '@/lib/logger';

interface CoinAPICredentials {
  apiKey: string;
  sandbox?: boolean;
}

interface CoinAPIExchangeRate {
  time: string;
  asset_id_base: string;
  asset_id_quote: string;
  rate: number;
  src_side_base: any[];
  src_side_quote: any[];
}

interface CoinAPIOrderBook {
  symbol_id: string;
  time_exchange: string;
  time_coinapi: string;
  asks: Array<{
    price: number;
    size: number;
  }>;
  bids: Array<{
    price: number;
    size: number;
  }>;
}

export class CoinAPIConnector extends ExchangeConnector {
  private baseURL: string;
  protected credentials: CoinAPICredentials | null = null;
  private supportedExchanges: string[] = [];
  private exchangeSymbols: Map<string, string[]> = new Map();
  private priceCache: Map<string, PriceData> = new Map();
  private cacheTimeout: number = 10000; // 10 seconds

  constructor(credentials?: CoinAPICredentials) {
    super('coinapi');
    
    this.credentials = credentials || null;
    this.baseURL = credentials?.sandbox ? 
      'https://rest-sandbox.coinapi.io/v1' : 
      'https://rest.coinapi.io/v1';
  }

  async connect(): Promise<void> {
    try {
      logger.info('Connecting to CoinAPI...');
      
      if (!this.credentials?.apiKey) {
        throw new Error('CoinAPI key required');
      }
      
      // Load supported exchanges and symbols
      await this.loadExchanges();
      await this.loadSymbols();
      
      // CoinAPI doesn't have WebSocket, so we'll use polling
      this.startPolling();
      
      this.emit('connected');
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to connect to CoinAPI:');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      this.stopPolling();
      this.subscriptions.clear();
      this.priceCache.clear();
      this.emit('disconnected');
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error disconnecting from CoinAPI:');
    }
  }

  protected handleWebSocketMessage(data: any): void {
    // CoinAPI doesn't use WebSocket, this method is not used
  }

  private startPolling(): void {
    // Poll for price updates every 5 seconds for subscribed symbols
    setInterval(async () => {
      if (this.subscriptions.size > 0) {
        await this.updatePrices();
      }
    }, 5000);
  }

  private stopPolling(): void {
    // Polling will stop when interval is cleared (handled by disconnect)
  }

  private async updatePrices(): Promise<void> {
    try {
      for (const symbol of this.subscriptions) {
        await this.fetchPriceUpdate(symbol);
      }
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error updating prices from CoinAPI:');
    }
  }

  private async fetchPriceUpdate(symbol: string): Promise<void> {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol);
      if (cached && (Date.now() - cached.lastUpdate) < this.cacheTimeout) {
        return;
      }
      
      const [base, quote] = symbol.split('/');
      if (!base || !quote) return;
      
      // Get exchange rates from multiple sources
      const rates = await this.getExchangeRates(base, quote);
      
      if (rates.length > 0) {
        // Use the most recent rate
        const latestRate = rates[0];
        
        const priceData: PriceData = {
          symbol,
          price: latestRate.rate,
          volume: 0, // CoinAPI doesn't provide volume in exchange rates
          timestamp: new Date(latestRate.time).getTime(),
          lastUpdate: Date.now()
        };
        
        this.priceCache.set(symbol, priceData);
        this.emit('priceUpdate', priceData);
      }
      
    } catch (error) {
      logger.error(`Error fetching price update for ${symbol}:`, error);
    }
  }

  async subscribeToPriceUpdates(symbol: string): Promise<void> {
    try {
      if (this.subscriptions.has(symbol)) {
        return; // Already subscribed
      }
      
      this.subscriptions.add(symbol);
      
      // Immediately fetch current price
      await this.fetchPriceUpdate(symbol);
      
      logger.debug(`Subscribed to CoinAPI price updates for ${symbol}`);
      
    } catch (error) {
      logger.error(`Failed to subscribe to CoinAPI price updates for ${symbol}:`, error);
      throw error;
    }
  }

  async unsubscribeFromPriceUpdates(symbol: string): Promise<void> {
    try {
      this.subscriptions.delete(symbol);
      this.priceCache.delete(symbol);
      
      logger.debug(`Unsubscribed from CoinAPI price updates for ${symbol}`);
      
    } catch (error) {
      logger.error(`Failed to unsubscribe from CoinAPI price updates for ${symbol}:`, error);
    }
  }

  // CoinAPI is read-only, trading operations are not supported
  async placeBuyOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return {
      success: false,
      error: 'CoinAPI does not support trading operations',
      timestamp: Date.now()
    };
  }

  async placeSellOrder(symbol: string, quantity: number, price?: number): Promise<OrderResult> {
    return {
      success: false,
      error: 'CoinAPI does not support trading operations',
      timestamp: Date.now()
    };
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    logger.warn('CoinAPI does not support trading operations');
    return false;
  }

  async getOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      const [base, quote] = symbol.split('/');
      if (!base || !quote) {
        throw new Error('Invalid symbol format');
      }
      
      // Try to get order book from major exchanges
      const exchanges = ['BINANCE', 'COINBASE', 'KRAKEN'];
      
      for (const exchange of exchanges) {
        try {
          const symbolId = `${exchange}_SPOT_${base}_${quote}`;
          const response = await this.makePublicRequest('GET', `/orderbooks/${symbolId}/current`);
          
          return {
            symbol,
            bids: response.bids.map((bid: any) => [bid.price, bid.size]),
            asks: response.asks.map((ask: any) => [ask.price, ask.size]),
            timestamp: new Date(response.time_coinapi).getTime()
          };
          
        } catch (error) {
          // Try next exchange if this one fails
          continue;
        }
      }
      
      throw new Error('No order book data available');
      
    } catch (error) {
      logger.error(`Failed to get order book for ${symbol} from CoinAPI:`, error);
      throw error;
    }
  }

  async getTicker(symbol: string): Promise<TickerData> {
    try {
      const [base, quote] = symbol.split('/');
      if (!base || !quote) {
        throw new Error('Invalid symbol format');
      }
      
      const rate = await this.getExchangeRate(base, quote);
      
      return {
        symbol,
        price: rate.rate,
        change24h: 0, // CoinAPI doesn't provide 24h change in exchange rates
        volume24h: 0, // CoinAPI doesn't provide volume in exchange rates
        high24h: 0,
        low24h: 0,
        timestamp: new Date(rate.time).getTime()
      };
      
    } catch (error) {
      logger.error(`Failed to get ticker for ${symbol} from CoinAPI:`, error);
      throw error;
    }
  }

  async getBalance(asset: string): Promise<number> {
    logger.warn('CoinAPI does not support account operations');
    return 0;
  }

  async getTradingFee(symbol: string): Promise<number> {
    // Return 0 since CoinAPI doesn't charge trading fees (it's data-only)
    return 0;
  }

  private async getExchangeRate(base: string, quote: string): Promise<CoinAPIExchangeRate> {
    const response = await this.makePublicRequest('GET', `/exchangerate/${base}/${quote}`);
    return response;
  }

  private async getExchangeRates(base: string, quote: string): Promise<CoinAPIExchangeRate[]> {
    try {
      const response = await this.makePublicRequest('GET', `/exchangerate/${base}/${quote}/history`, {
        period_id: '1MIN',
        time_start: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Last 5 minutes
        limit: 5
      });
      
      return response;
    } catch (error) {
      // Fallback to current rate if history is not available
      const currentRate = await this.getExchangeRate(base, quote);
      return [currentRate];
    }
  }

  private async loadExchanges(): Promise<void> {
    try {
      const response = await this.makePublicRequest('GET', '/exchanges');
      this.supportedExchanges = response.map((exchange: any) => exchange.exchange_id);
      
      logger.debug(`Loaded ${this.supportedExchanges.length} exchanges from CoinAPI`);
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to load exchanges from CoinAPI:');
      // Use default exchanges if loading fails
      this.supportedExchanges = ['BINANCE', 'COINBASE', 'KRAKEN', 'OKX'];
    }
  }

  private async loadSymbols(): Promise<void> {
    try {
      const response = await this.makePublicRequest('GET', '/symbols');
      
      // Group symbols by exchange
      response.forEach((symbol: any) => {
        const exchangeId = symbol.exchange_id;
        if (!this.exchangeSymbols.has(exchangeId)) {
          this.exchangeSymbols.set(exchangeId, []);
        }
        this.exchangeSymbols.get(exchangeId)!.push(symbol.symbol_id);
      });
      
      logger.debug(`Loaded symbols for ${this.exchangeSymbols.size} exchanges from CoinAPI`);
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to load symbols from CoinAPI:');
    }
  }

  protected async makePublicRequest(method: string, path: string, params: any = {}): Promise<any> {
    if (!this.credentials?.apiKey) {
      throw new Error('CoinAPI key required');
    }
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}${path}${queryString ? `?${queryString}` : ''}`;
    
    const response: AxiosResponse = await axios({
      method,
      url,
      headers: {
        'X-CoinAPI-Key': this.credentials.apiKey
      }
    });
    
    return response.data;
  }

  protected formatSymbol(symbol: string): string {
    return symbol; // CoinAPI uses standard format
  }

  protected parseSymbol(coinapiSymbol: string): string {
    return coinapiSymbol; // CoinAPI uses standard format
  }

  // Required abstract method implementations
  async getExchangeInfo(): Promise<any> {
    return {
      exchanges: this.supportedExchanges,
      symbols: Object.fromEntries(this.exchangeSymbols)
    };
  }

  async getSymbols(): Promise<string[]> {
    const allSymbols: string[] = [];
    
    for (const symbols of this.exchangeSymbols.values()) {
      allSymbols.push(...symbols);
    }
    
    // Convert to standard format and deduplicate
    const standardSymbols = new Set<string>();
    
    allSymbols.forEach(symbol => {
      // Parse CoinAPI symbol format: EXCHANGE_SPOT_BASE_QUOTE
      const parts = symbol.split('_');
      if (parts.length >= 4) {
        const base = parts[2];
        const quote = parts[3];
        standardSymbols.add(`${base}/${quote}`);
      }
    });
    
    return Array.from(standardSymbols);
  }

  async getMinTradeSize(symbol: string): Promise<number> {
    return 0; // CoinAPI doesn't provide trading constraints
  }

  async getMaxTradeSize(symbol: string): Promise<number> {
    return 0; // CoinAPI doesn't provide trading constraints
  }

  async getStepSize(symbol: string): Promise<number> {
    return 0; // CoinAPI doesn't provide trading constraints
  }

  async getTickSize(symbol: string): Promise<number> {
    return 0; // CoinAPI doesn't provide trading constraints
  }

  // Additional CoinAPI-specific methods
  async getHistoricalRates(
    base: string,
    quote: string,
    periodId: string = '1HRS',
    timeStart?: Date,
    timeEnd?: Date,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const params: any = {
        period_id: periodId,
        limit
      };
      
      if (timeStart) {
        params.time_start = timeStart.toISOString();
      }
      
      if (timeEnd) {
        params.time_end = timeEnd.toISOString();
      }
      
      return await this.makePublicRequest('GET', `/exchangerate/${base}/${quote}/history`, params);
      
    } catch (error) {
      logger.error(`Failed to get historical rates for ${base}/${quote}:`, error);
      return [];
    }
  }

  async getExchangeRatesByExchange(base: string, quote: string): Promise<any[]> {
    try {
      // Get rates from all exchanges
      const rates: any[] = [];
      
      for (const exchange of this.supportedExchanges) {
        try {
          const symbolId = `${exchange}_SPOT_${base}_${quote}`;
          const symbols = this.exchangeSymbols.get(exchange) || [];
          
          if (symbols.includes(symbolId)) {
            const rate = await this.makePublicRequest('GET', `/exchangerate/${base}/${quote}/${exchange}`);
            rates.push({
              exchange,
              ...rate
            });
          }
        } catch (error) {
          // Skip this exchange if it doesn't have the symbol
          continue;
        }
      }
      
      return rates;
      
    } catch (error) {
      logger.error(`Failed to get exchange rates by exchange for ${base}/${quote}:`, error);
      return [];
    }
  }

  getSupportedExchanges(): string[] {
    return [...this.supportedExchanges];
  }

  getExchangeSymbols(exchange: string): string[] {
    return this.exchangeSymbols.get(exchange) || [];
  }
}

export default CoinAPIConnector;