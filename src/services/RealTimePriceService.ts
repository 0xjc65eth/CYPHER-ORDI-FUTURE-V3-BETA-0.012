/**
 * Real-Time Price Service with WebSocket Support
 * Provides live price updates for cryptocurrencies using multiple data sources
 */

import { logger } from '@/lib/logger';
import { coinMarketCapService } from './CoinMarketCapService';
// Lazy import to avoid import order issues
let _intervalOptimizer: any = null;
const getIntervalOptimizer = () => {
  if (!_intervalOptimizer) {
    try {
      const { intervalOptimizer } = require('@/lib/performance/IntervalOptimizer');
      _intervalOptimizer = intervalOptimizer;
    } catch (error) {
      console.error('Failed to load IntervalOptimizer:', error);
      // Fallback implementation
      _intervalOptimizer = {
        registerTask: () => {},
        removeTask: () => {},
        start: () => {},
        getStats: () => ({ isRunning: false })
      };
    }
  }
  return _intervalOptimizer;
};

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: string;
  source: string;
}

export interface PriceSubscription {
  symbol: string;
  callback: (update: PriceUpdate) => void;
}

class RealTimePriceService {
  private subscriptions = new Map<string, PriceSubscription[]>();
  private priceCache = new Map<string, PriceUpdate>();
  private isRunning = false;
  private updateFrequency = 30000; // 30 seconds
  private readonly TASK_ID = 'real-time-price-service';

  constructor() {
    // Don't start automatically to avoid import order issues
    // startPriceUpdates() will be called when first subscription is made
  }

  /**
   * Subscribe to real-time price updates for a symbol
   */
  subscribe(symbol: string, callback: (update: PriceUpdate) => void): () => void {
    const subscription: PriceSubscription = { symbol, callback };
    
    if (!this.subscriptions.has(symbol)) {
      this.subscriptions.set(symbol, []);
    }
    
    this.subscriptions.get(symbol)!.push(subscription);
    
    // Start price updates if not already running and this is the first subscription
    if (!this.isRunning && this.getTotalSubscriptions() === 1) {
      try {
        this.startPriceUpdates();
      } catch (error) {
        console.error('Failed to start price updates:', error);
      }
    }
    
    // Send cached data immediately if available
    const cachedPrice = this.priceCache.get(symbol);
    if (cachedPrice) {
      callback(cachedPrice);
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(symbol);
      if (subs) {
        const index = subs.indexOf(subscription);
        if (index > -1) {
          subs.splice(index, 1);
        }
        if (subs.length === 0) {
          this.subscriptions.delete(symbol);
        }
      }
    };
  }

  /**
   * Get current price for a symbol
   */
  getCurrentPrice(symbol: string): PriceUpdate | null {
    return this.priceCache.get(symbol) || null;
  }

  /**
   * Get current prices for multiple symbols
   */
  getCurrentPrices(symbols: string[]): Map<string, PriceUpdate> {
    const results = new Map<string, PriceUpdate>();
    symbols.forEach(symbol => {
      const price = this.priceCache.get(symbol);
      if (price) {
        results.set(symbol, price);
      }
    });
    return results;
  }

  /**
   * Start the price update loop
   */
  private startPriceUpdates(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    logger.info('Starting real-time price updates with IntervalOptimizer');
    
    // Register with IntervalOptimizer
    const optimizer = getIntervalOptimizer();
    optimizer.registerTask({
      id: this.TASK_ID,
      callback: () => this.updatePrices(),
      frequency: this.updateFrequency,
      priority: 'high',
      singleton: true,
      maxRetries: 3
    });
    
    // Start the optimizer if not already running
    if (optimizer.start) {
      optimizer.start();
    }
    
    // Initial update
    this.updatePrices();
  }

  /**
   * Stop the price update loop
   */
  stopPriceUpdates(): void {
    const optimizer = getIntervalOptimizer();
    if (optimizer.removeTask) {
      optimizer.removeTask(this.TASK_ID);
    }
    this.isRunning = false;
    logger.info('Stopped real-time price updates');
  }

  /**
   * Update all subscribed prices
   */
  private async updatePrices(): Promise<void> {
    try {
      const subscribedSymbols = Array.from(this.subscriptions.keys());
      if (subscribedSymbols.length === 0) {
        return; // No active subscriptions
      }

      logger.debug(`Updating prices for ${subscribedSymbols.length} symbols`);
      
      // Fetch data from CoinMarketCap
      const symbolsQuery = subscribedSymbols.join(',');
      const quotes = await coinMarketCapService.getCryptocurrencyQuotes({
        symbol: symbolsQuery
      });

      // Process each symbol
      for (const symbol of subscribedSymbols) {
        const cryptoData = quotes[symbol];
        if (cryptoData && cryptoData.quote.USD) {
          const priceUpdate: PriceUpdate = {
            symbol,
            price: cryptoData.quote.USD.price,
            change24h: cryptoData.quote.USD.percent_change_24h,
            volume24h: cryptoData.quote.USD.volume_24h,
            marketCap: cryptoData.quote.USD.market_cap,
            timestamp: new Date().toISOString(),
            source: 'coinmarketcap'
          };

          // Update cache
          this.priceCache.set(symbol, priceUpdate);

          // Notify subscribers
          const subscribers = this.subscriptions.get(symbol);
          if (subscribers) {
            subscribers.forEach(sub => {
              try {
                sub.callback(priceUpdate);
              } catch (error) {
                logger.error(`Error in price subscription callback for ${symbol}:`, error);
              }
            });
          }
        }
      }

    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to update prices');
      
      // Fallback to individual symbol updates
      await this.fallbackPriceUpdates();
    }
  }

  /**
   * Fallback price updates using alternative methods
   */
  private async fallbackPriceUpdates(): Promise<void> {
    const subscribedSymbols = Array.from(this.subscriptions.keys());
    
    for (const symbol of subscribedSymbols) {
      try {
        // Try Binance for major cryptos
        if (['BTC', 'ETH', 'BNB', 'SOL'].includes(symbol)) {
          const binanceSymbol = symbol === 'BTC' ? 'BTCUSDT' : 
                               symbol === 'ETH' ? 'ETHUSDT' :
                               symbol === 'BNB' ? 'BNBUSDT' :
                               symbol === 'SOL' ? 'SOLUSDT' : null;
          
          if (binanceSymbol) {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
            if (response.ok) {
              const data = await response.json();
              const priceUpdate: PriceUpdate = {
                symbol,
                price: parseFloat(data.lastPrice),
                change24h: parseFloat(data.priceChangePercent),
                volume24h: parseFloat(data.volume) * parseFloat(data.lastPrice),
                marketCap: 0, // Not available from Binance
                timestamp: new Date().toISOString(),
                source: 'binance-fallback'
              };

              this.priceCache.set(symbol, priceUpdate);
              
              const subscribers = this.subscriptions.get(symbol);
              if (subscribers) {
                subscribers.forEach(sub => sub.callback(priceUpdate));
              }
            }
          }
        }
      } catch (error) {
        logger.warn(`Failed to update price for ${symbol} via fallback:`, error);
      }
    }
  }

  /**
   * Set update frequency in milliseconds
   */
  setUpdateFrequency(frequency: number): void {
    if (frequency < 10000) { // Minimum 10 seconds
      logger.warn('Update frequency too low, setting to minimum 10 seconds');
      frequency = 10000;
    }
    
    this.updateFrequency = frequency;
    
    // Update frequency in IntervalOptimizer
    if (this.isRunning) {
      const optimizer = getIntervalOptimizer();
      if (optimizer.removeTask) {
        optimizer.removeTask(this.TASK_ID);
      }
      if (optimizer.registerTask) {
        optimizer.registerTask({
          id: this.TASK_ID,
          callback: () => this.updatePrices(),
          frequency: this.updateFrequency,
          priority: 'high',
          maxRetries: 3
        });
      }
    }
  }

  /**
   * Get total number of active subscriptions
   */
  private getTotalSubscriptions(): number {
    return Array.from(this.subscriptions.values()).reduce((sum, subs) => sum + subs.length, 0);
  }

  /**
   * Get subscription statistics
   */
  getStats(): {
    activeSubscriptions: number;
    uniqueSymbols: number;
    cacheSize: number;
    isRunning: boolean;
    updateFrequency: number;
  } {
    return {
      activeSubscriptions: Array.from(this.subscriptions.values()).reduce((sum, subs) => sum + subs.length, 0),
      uniqueSymbols: this.subscriptions.size,
      cacheSize: this.priceCache.size,
      isRunning: this.isRunning,
      updateFrequency: this.updateFrequency
    };
  }

  /**
   * Clear all subscriptions and cache
   */
  clearAll(): void {
    this.stopPriceUpdates();
    this.subscriptions.clear();
    this.priceCache.clear();
  }
}

// Lazy initialization to avoid import order issues
let _realTimePriceService: RealTimePriceService | null = null;

export const getRealTimePriceService = (): RealTimePriceService => {
  if (!_realTimePriceService) {
    _realTimePriceService = new RealTimePriceService();
  }
  return _realTimePriceService;
};

// Export singleton instance with lazy loading
export const realTimePriceService = new Proxy({} as RealTimePriceService, {
  get(target, prop) {
    const service = getRealTimePriceService();
    const value = (service as any)[prop];
    return typeof value === 'function' ? value.bind(service) : value;
  }
});

export default realTimePriceService;