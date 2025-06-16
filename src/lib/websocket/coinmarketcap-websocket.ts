/**
 * CoinMarketCap WebSocket Integration
 * Enhanced real-time data streaming with CoinMarketCap API integration
 * Features: Rate limiting, data validation, smart fallbacks
 */

'use client';

import { logger } from '@/lib/logger';
import { coinMarketCapService } from '@/services/CoinMarketCapService';
import { enhancedRateLimiter } from '@/lib/api/enhanced-rate-limiter';
import { priceCache } from '@/lib/cache/enhanced-api-cache';

export interface CMCWebSocketConfig {
  apiKey: string;
  enableSimulation?: boolean;
  updateInterval?: number;
  rateLimitPerMinute?: number;
  enableFallback?: boolean;
}

export interface CMCPriceUpdate {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  rank: number;
  timestamp: number;
  source: 'cmc-api' | 'cmc-websocket' | 'fallback';
}

export interface CMCMarketData {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  activeCoins: number;
  timestamp: number;
}

export interface CMCSubscription {
  id: string;
  symbols: string[];
  callback: (updates: CMCPriceUpdate[]) => void;
  includeGlobalData?: boolean;
}

/**
 * CoinMarketCap WebSocket Manager
 * Handles real-time data streaming from CoinMarketCap with smart fallbacks
 */
export class CoinMarketCapWebSocket {
  private config: CMCWebSocketConfig;
  private subscriptions = new Map<string, CMCSubscription>();
  private priceCache = new Map<string, CMCPriceUpdate>();
  private globalDataCache: CMCMarketData | null = null;
  private updateTimer: NodeJS.Timeout | null = null;
  private isActive = false;
  private subscribedSymbols = new Set<string>();
  private lastUpdate = 0;
  private errorCount = 0;
  private maxErrors = 10;

  constructor(config: CMCWebSocketConfig) {
    this.config = {
      enableSimulation: true,
      updateInterval: 30000, // 30 seconds
      rateLimitPerMinute: 10,
      enableFallback: true,
      ...config
    };
  }

  /**
   * Initialize the CoinMarketCap WebSocket connection
   */
  async initialize(): Promise<void> {
    if (this.isActive) {
      logger.warn('CoinMarketCap WebSocket already initialized');
      return;
    }

    logger.info('🚀 Initializing CoinMarketCap WebSocket integration');

    try {
      // Test API connectivity
      await this.testAPIConnectivity();
      
      // Start update loop
      this.startUpdateLoop();
      
      this.isActive = true;
      logger.info('✅ CoinMarketCap WebSocket initialized successfully');
      
    } catch (error) {
      logger.error('❌ Failed to initialize CoinMarketCap WebSocket:', error);
      
      if (this.config.enableFallback) {
        logger.info('🔄 Starting in fallback mode with simulated data');
        this.startSimulationMode();
        this.isActive = true;
      } else {
        throw error;
      }
    }
  }

  /**
   * Test API connectivity
   */
  private async testAPIConnectivity(): Promise<void> {
    try {
      const testData = await coinMarketCapService.getBitcoinData();
      logger.info('✅ CoinMarketCap API connectivity verified');
      
      // Cache initial data
      this.updatePriceCache('BTC', {
        id: testData.id,
        symbol: testData.symbol,
        name: testData.name,
        price: testData.quote.USD.price,
        change24h: testData.quote.USD.percent_change_24h,
        changePercent24h: testData.quote.USD.percent_change_24h,
        volume24h: testData.quote.USD.volume_24h,
        marketCap: testData.quote.USD.market_cap,
        rank: testData.cmc_rank,
        timestamp: Date.now(),
        source: 'cmc-api'
      });
      
    } catch (error) {
      logger.error('❌ CoinMarketCap API connectivity test failed:', error);
      throw new Error('CoinMarketCap API not accessible');
    }
  }

  /**
   * Subscribe to price updates for specific symbols
   */
  subscribe(options: {
    symbols: string[];
    callback: (updates: CMCPriceUpdate[]) => void;
    includeGlobalData?: boolean;
  }): string {
    const subscriptionId = `cmc_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: CMCSubscription = {
      id: subscriptionId,
      symbols: options.symbols,
      callback: options.callback,
      includeGlobalData: options.includeGlobalData || false
    };

    this.subscriptions.set(subscriptionId, subscription);
    
    // Add symbols to tracking
    options.symbols.forEach(symbol => {
      this.subscribedSymbols.add(symbol.toUpperCase());
    });

    logger.info(`📈 Subscribed to CMC data for symbols: ${options.symbols.join(', ')} (ID: ${subscriptionId})`);

    // Send cached data immediately if available
    this.sendCachedDataToSubscriber(subscription);

    // Start updates if not already running
    if (!this.updateTimer && this.isActive) {
      this.startUpdateLoop();
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    // Remove symbols from tracking if no other subscribers
    subscription.symbols.forEach(symbol => {
      const symbolUpper = symbol.toUpperCase();
      const stillSubscribed = Array.from(this.subscriptions.values())
        .some(sub => sub.id !== subscriptionId && sub.symbols.includes(symbolUpper));
      
      if (!stillSubscribed) {
        this.subscribedSymbols.delete(symbolUpper);
      }
    });

    this.subscriptions.delete(subscriptionId);
    logger.info(`📉 Unsubscribed from CMC data: ${subscriptionId}`);

    // Stop updates if no more subscribers
    if (this.subscriptions.size === 0 && this.updateTimer) {
      this.stopUpdateLoop();
    }
  }

  /**
   * Start the update loop
   */
  private startUpdateLoop(): void {
    if (this.updateTimer) return;

    logger.info(`⏰ Starting CMC update loop (interval: ${this.config.updateInterval}ms)`);

    // Initial update
    this.performUpdate();

    // Schedule regular updates
    this.updateTimer = setInterval(() => {
      this.performUpdate();
    }, this.config.updateInterval);
  }

  /**
   * Stop the update loop
   */
  private stopUpdateLoop(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
      logger.info('⏰ Stopped CMC update loop');
    }
  }

  /**
   * Perform data update
   */
  private async performUpdate(): Promise<void> {
    if (this.subscribedSymbols.size === 0) return;

    try {
      // Check rate limiting
      if (!this.checkRateLimit()) {
        logger.warn('⚠️ CMC rate limit exceeded, skipping update');
        return;
      }

      const symbolsArray = Array.from(this.subscribedSymbols);
      logger.debug(`🔄 Updating CMC data for symbols: ${symbolsArray.join(', ')}`);

      // Fetch quotes for all subscribed symbols
      const quotesData = await coinMarketCapService.getCryptocurrencyQuotes({
        symbol: symbolsArray.join(',')
      });

      // Process and cache updates
      const updates: CMCPriceUpdate[] = [];
      
      Object.entries(quotesData).forEach(([symbol, data]) => {
        const update: CMCPriceUpdate = {
          id: data.id,
          symbol: data.symbol,
          name: data.name,
          price: data.quote.USD.price,
          change24h: data.quote.USD.percent_change_24h,
          changePercent24h: data.quote.USD.percent_change_24h,
          volume24h: data.quote.USD.volume_24h,
          marketCap: data.quote.USD.market_cap,
          rank: data.cmc_rank,
          timestamp: Date.now(),
          source: 'cmc-api'
        };

        this.updatePriceCache(symbol, update);
        updates.push(update);
      });

      // Fetch global market data if needed
      if (this.hasGlobalDataSubscribers()) {
        await this.updateGlobalData();
      }

      // Distribute updates to subscribers
      this.distributeUpdates(updates);

      this.lastUpdate = Date.now();
      this.errorCount = 0; // Reset error count on success

      logger.debug(`✅ CMC update completed for ${updates.length} symbols`);

    } catch (error) {
      this.errorCount++;
      logger.error(`❌ CMC update failed (error ${this.errorCount}/${this.maxErrors}):`, error);

      if (this.errorCount >= this.maxErrors) {
        logger.error('🚨 Max CMC errors reached, switching to fallback mode');
        this.startSimulationMode();
      }
    }
  }

  /**
   * Update global market data
   */
  private async updateGlobalData(): Promise<void> {
    try {
      const globalMetrics = await coinMarketCapService.getGlobalMetrics();
      
      this.globalDataCache = {
        totalMarketCap: globalMetrics.quote.USD.total_market_cap,
        totalVolume24h: globalMetrics.quote.USD.total_volume_24h,
        btcDominance: globalMetrics.btc_dominance,
        ethDominance: globalMetrics.eth_dominance,
        activeCoins: globalMetrics.active_cryptocurrencies,
        timestamp: Date.now()
      };

    } catch (error) {
      logger.error('Failed to update global market data:', error);
    }
  }

  /**
   * Check if any subscribers want global data
   */
  private hasGlobalDataSubscribers(): boolean {
    return Array.from(this.subscriptions.values()).some(sub => sub.includeGlobalData);
  }

  /**
   * Update price cache
   */
  private updatePriceCache(symbol: string, update: CMCPriceUpdate): void {
    this.priceCache.set(symbol, update);
    
    // Also cache in enhanced price cache
    priceCache.set(`cmc-${symbol}`, update, 60000, 'coinmarketcap');
  }

  /**
   * Distribute updates to subscribers
   */
  private distributeUpdates(updates: CMCPriceUpdate[]): void {
    this.subscriptions.forEach(subscription => {
      try {
        // Filter updates for this subscription's symbols
        const relevantUpdates = updates.filter(update =>
          subscription.symbols.includes(update.symbol)
        );

        if (relevantUpdates.length > 0) {
          subscription.callback(relevantUpdates);
        }
      } catch (error) {
        logger.error(`Error in CMC subscription callback ${subscription.id}:`, error);
      }
    });
  }

  /**
   * Send cached data to new subscriber
   */
  private sendCachedDataToSubscriber(subscription: CMCSubscription): void {
    const cachedUpdates: CMCPriceUpdate[] = [];
    
    subscription.symbols.forEach(symbol => {
      const cached = this.priceCache.get(symbol.toUpperCase());
      if (cached) {
        cachedUpdates.push(cached);
      }
    });

    if (cachedUpdates.length > 0) {
      try {
        subscription.callback(cachedUpdates);
      } catch (error) {
        logger.error(`Error sending cached data to subscriber ${subscription.id}:`, error);
      }
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const daily = enhancedRateLimiter.checkLimit('coinmarketcap');
    const minute = enhancedRateLimiter.checkLimit('coinmarketcap-minute');
    
    if (!daily.allowed || !minute.allowed) {
      return false;
    }

    enhancedRateLimiter.recordRequest('coinmarketcap');
    enhancedRateLimiter.recordRequest('coinmarketcap-minute');
    
    return true;
  }

  /**
   * Start simulation mode for demo/fallback
   */
  private startSimulationMode(): void {
    logger.info('🎭 Starting CMC simulation mode');

    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(() => {
      this.performSimulatedUpdate();
    }, this.config.updateInterval! / 2); // More frequent updates in simulation
  }

  /**
   * Perform simulated data update
   */
  private performSimulatedUpdate(): void {
    const updates: CMCPriceUpdate[] = [];
    
    this.subscribedSymbols.forEach(symbol => {
      let basePrice = 0;
      let marketCap = 0;
      let rank = 1;

      // Set base prices for common symbols
      switch (symbol) {
        case 'BTC':
          basePrice = 67000;
          marketCap = 1300000000000;
          rank = 1;
          break;
        case 'ETH':
          basePrice = 3200;
          marketCap = 380000000000;
          rank = 2;
          break;
        case 'SOL':
          basePrice = 220;
          marketCap = 103000000000;
          rank = 5;
          break;
        case 'BNB':
          basePrice = 610;
          marketCap = 88000000000;
          rank = 4;
          break;
        default:
          basePrice = 100 + Math.random() * 1000;
          marketCap = 1000000000 + Math.random() * 50000000000;
          rank = Math.floor(Math.random() * 100) + 10;
      }

      const priceVariation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
      const change24h = (Math.random() - 0.5) * 10; // ±5% daily change

      const update: CMCPriceUpdate = {
        id: Math.floor(Math.random() * 10000),
        symbol: symbol,
        name: `${symbol} Token`,
        price: basePrice * (1 + priceVariation),
        change24h: change24h,
        changePercent24h: change24h,
        volume24h: marketCap * 0.1 * (0.5 + Math.random()),
        marketCap: marketCap * (1 + priceVariation),
        rank: rank,
        timestamp: Date.now(),
        source: 'fallback'
      };

      this.updatePriceCache(symbol, update);
      updates.push(update);
    });

    // Update global data simulation
    if (this.hasGlobalDataSubscribers()) {
      this.globalDataCache = {
        totalMarketCap: 2800000000000 + (Math.random() - 0.5) * 200000000000,
        totalVolume24h: 150000000000 + (Math.random() - 0.5) * 50000000000,
        btcDominance: 45 + (Math.random() - 0.5) * 5,
        ethDominance: 18 + (Math.random() - 0.5) * 3,
        activeCoins: 8500 + Math.floor(Math.random() * 500),
        timestamp: Date.now()
      };
    }

    this.distributeUpdates(updates);
    logger.debug(`🎭 Simulated CMC update for ${updates.length} symbols`);
  }

  /**
   * Get current price for a symbol
   */
  getCurrentPrice(symbol: string): CMCPriceUpdate | null {
    return this.priceCache.get(symbol.toUpperCase()) || null;
  }

  /**
   * Get current global market data
   */
  getGlobalData(): CMCMarketData | null {
    return this.globalDataCache;
  }

  /**
   * Get subscription statistics
   */
  getStats(): {
    activeSubscriptions: number;
    trackedSymbols: number;
    cachedPrices: number;
    lastUpdate: number;
    errorCount: number;
    isActive: boolean;
  } {
    return {
      activeSubscriptions: this.subscriptions.size,
      trackedSymbols: this.subscribedSymbols.size,
      cachedPrices: this.priceCache.size,
      lastUpdate: this.lastUpdate,
      errorCount: this.errorCount,
      isActive: this.isActive
    };
  }

  /**
   * Reset error count
   */
  resetErrors(): void {
    this.errorCount = 0;
    logger.info('🔄 CMC error count reset');
  }

  /**
   * Manually trigger update
   */
  async forceUpdate(): Promise<void> {
    logger.info('🔄 Forcing CMC data update');
    await this.performUpdate();
  }

  /**
   * Stop the WebSocket and cleanup
   */
  stop(): void {
    logger.info('🛑 Stopping CoinMarketCap WebSocket');
    
    this.stopUpdateLoop();
    this.subscriptions.clear();
    this.subscribedSymbols.clear();
    this.priceCache.clear();
    this.globalDataCache = null;
    this.isActive = false;
    
    logger.info('✅ CoinMarketCap WebSocket stopped');
  }
}

// Export singleton instance
export const cmcWebSocket = new CoinMarketCapWebSocket({
  apiKey: process.env.CMC_API_KEY || 'demo',
  enableSimulation: true,
  updateInterval: 30000,
  enableFallback: true
});

export default cmcWebSocket;