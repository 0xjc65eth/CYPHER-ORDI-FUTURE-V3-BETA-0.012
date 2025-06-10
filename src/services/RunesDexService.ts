/**
 * RunesDEX API Service
 * Provides access to Bitcoin Runes trading data, market analytics, and DEX functionality
 */

import { logger } from '@/lib/logger';

export interface RunesToken {
  id: string;
  name: string;
  symbol: string;
  totalSupply: string;
  circulatingSupply: string;
  maxSupply?: string;
  decimals: number;
  mintingBlock?: number;
  mintingTimestamp?: string;
  isComplete: boolean;
  mintProgress?: number;
  description?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  telegram?: string;
  imageUrl?: string;
  holders: number;
  transactions: number;
  volume24h: number;
  volumeTotal: number;
  marketCap?: number;
  price?: number;
  priceChange24h?: number;
  priceChange7d?: number;
  floorPrice?: number;
  listings: number;
  lastSale?: {
    price: number;
    timestamp: string;
    txid: string;
    seller: string;
    buyer: string;
  };
}

export interface RunesMarketData {
  token: RunesToken;
  priceHistory: Array<{
    timestamp: string;
    price: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
  }>;
  orderBook: {
    bids: Array<{
      price: number;
      quantity: string;
      total: number;
      address: string;
      timestamp: string;
    }>;
    asks: Array<{
      price: number;
      quantity: string;
      total: number;
      address: string;
      timestamp: string;
    }>;
  };
  recentTrades: Array<{
    id: string;
    type: 'buy' | 'sell';
    price: number;
    quantity: string;
    total: number;
    timestamp: string;
    txid: string;
    buyer?: string;
    seller?: string;
  }>;
}

export interface RunesListing {
  id: string;
  token: string;
  tokenName: string;
  seller: string;
  quantity: string;
  price: number;
  totalPrice: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  listedAt: string;
  expiresAt?: string;
  txid?: string;
  inscriptionId?: string;
  metadata?: {
    description?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

export interface RunesCollection {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  totalSupply: string;
  holders: number;
  floorPrice?: number;
  volume24h: number;
  volumeTotal: number;
  listings: number;
  sales: number;
  avgPrice24h?: number;
  marketCap?: number;
  createdAt: string;
  verified: boolean;
  featured: boolean;
  trending: boolean;
  stats: {
    totalVolume: number;
    totalSales: number;
    avgPrice: number;
    uniqueHolders: number;
    transactions: number;
  };
}

export interface RunesTradingPair {
  id: string;
  baseToken: string;
  quoteToken: string;
  baseSymbol: string;
  quoteSymbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  volumeChange24h: number;
  high24h: number;
  low24h: number;
  liquidity: number;
  spread: number;
  lastTradeTime: string;
  isActive: boolean;
}

export interface RunesPortfolioItem {
  token: RunesToken;
  balance: string;
  value: number;
  costBasis?: number;
  unrealizedPnl?: number;
  realizedPnl?: number;
  avgBuyPrice?: number;
  lastPurchaseDate?: string;
  transactions: Array<{
    type: 'buy' | 'sell' | 'transfer' | 'mint';
    quantity: string;
    price?: number;
    timestamp: string;
    txid: string;
    counterparty?: string;
  }>;
}

export interface RunesDexConfig {
  baseUrl?: string;
  apiKey?: string;
  network?: 'mainnet' | 'testnet';
  timeout?: number;
}

export class RunesDexService {
  private config: RunesDexConfig;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private defaultTTL = 30000; // 30 seconds for real-time trading data
  private rateLimitCount = 0;
  private rateLimitResetTime = 0;
  private readonly rateLimitPerMinute = 60; // More generous for DEX data

  constructor(config: RunesDexConfig = {}) {
    this.config = {
      baseUrl: 'https://api.runesdex.io', // Hypothetical API endpoint
      network: 'mainnet',
      timeout: 10000,
      ...config,
    };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    if (now >= this.rateLimitResetTime) {
      this.rateLimitCount = 0;
      this.rateLimitResetTime = now + 60000;
    }

    if (this.rateLimitCount >= this.rateLimitPerMinute) {
      logger.warn('RunesDEX rate limit reached');
      return false;
    }

    this.rateLimitCount++;
    return true;
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
   * Make API request with error handling and caching
   */
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}, ttl = this.defaultTTL): Promise<T> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    
    // Check cache first
    const cachedData = this.getCachedData<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check rate limiting
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(this.config.timeout || 10000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`RunesDEX API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // Cache successful response
      this.setCachedData(cacheKey, data, ttl);
      
      return data as T;
    } catch (error) {
      logger.error('RunesDEX API request failed:', error);
      
      // Try to return cached data if request fails
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        logger.warn('Returning stale cached data due to API failure');
        return staleData.data as T;
      }
      
      throw error;
    }
  }

  /**
   * Get all Runes tokens with market data
   */
  async getRunesTokens(options: {
    page?: number;
    limit?: number;
    sort?: 'marketCap' | 'volume' | 'price' | 'name' | 'created';
    order?: 'asc' | 'desc';
    status?: 'all' | 'minting' | 'complete';
    search?: string;
  } = {}): Promise<{ tokens: RunesToken[]; total: number; page: number; limit: number }> {
    const params = {
      page: options.page || 1,
      limit: options.limit || 50,
      sort: options.sort || 'marketCap',
      order: options.order || 'desc',
      status: options.status || 'all',
      ...(options.search && { search: options.search }),
    };

    return this.makeRequest<{ tokens: RunesToken[]; total: number; page: number; limit: number }>('/tokens', params, 60000);
  }

  /**
   * Get specific Runes token data
   */
  async getRunesToken(tokenId: string): Promise<RunesToken> {
    return this.makeRequest<RunesToken>(`/tokens/${tokenId}`, {}, 30000);
  }

  /**
   * Get Runes token market data including order book and recent trades
   */
  async getRunesMarketData(tokenId: string): Promise<RunesMarketData> {
    return this.makeRequest<RunesMarketData>(`/tokens/${tokenId}/market`, {}, 10000); // 10 seconds for market data
  }

  /**
   * Get Runes token price history
   */
  async getRunesPriceHistory(tokenId: string, options: {
    period?: '1h' | '24h' | '7d' | '30d' | '90d' | '1y';
    interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  } = {}): Promise<Array<{
    timestamp: string;
    price: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
  }>> {
    const params = {
      period: options.period || '24h',
      interval: options.interval || '1h',
    };

    return this.makeRequest<Array<{
      timestamp: string;
      price: number;
      volume: number;
      high: number;
      low: number;
      open: number;
      close: number;
    }>>(`/tokens/${tokenId}/price-history`, params, 300000); // 5 minutes for historical data
  }

  /**
   * Get active Runes listings
   */
  async getRunesListings(options: {
    token?: string;
    page?: number;
    limit?: number;
    sort?: 'price' | 'quantity' | 'total' | 'listed';
    order?: 'asc' | 'desc';
    minPrice?: number;
    maxPrice?: number;
    seller?: string;
  } = {}): Promise<{ listings: RunesListing[]; total: number; page: number; limit: number }> {
    const params = {
      page: options.page || 1,
      limit: options.limit || 50,
      sort: options.sort || 'price',
      order: options.order || 'asc',
      ...(options.token && { token: options.token }),
      ...(options.minPrice && { minPrice: options.minPrice }),
      ...(options.maxPrice && { maxPrice: options.maxPrice }),
      ...(options.seller && { seller: options.seller }),
    };

    return this.makeRequest<{ listings: RunesListing[]; total: number; page: number; limit: number }>('/listings', params, 30000);
  }

  /**
   * Get Runes collections
   */
  async getRunesCollections(options: {
    page?: number;
    limit?: number;
    sort?: 'volume' | 'floorPrice' | 'marketCap' | 'holders';
    order?: 'asc' | 'desc';
    featured?: boolean;
    verified?: boolean;
  } = {}): Promise<{ collections: RunesCollection[]; total: number; page: number; limit: number }> {
    const params = {
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'volume',
      order: options.order || 'desc',
      ...(options.featured !== undefined && { featured: options.featured }),
      ...(options.verified !== undefined && { verified: options.verified }),
    };

    return this.makeRequest<{ collections: RunesCollection[]; total: number; page: number; limit: number }>('/collections', params, 300000);
  }

  /**
   * Get trading pairs data
   */
  async getTradingPairs(options: {
    baseToken?: string;
    quoteToken?: string;
    active?: boolean;
  } = {}): Promise<RunesTradingPair[]> {
    const params = {
      ...(options.baseToken && { baseToken: options.baseToken }),
      ...(options.quoteToken && { quoteToken: options.quoteToken }),
      ...(options.active !== undefined && { active: options.active }),
    };

    return this.makeRequest<RunesTradingPair[]>('/trading-pairs', params, 60000);
  }

  /**
   * Get portfolio data for a specific address
   */
  async getPortfolio(address: string): Promise<{
    address: string;
    totalValue: number;
    totalTokens: number;
    tokens: RunesPortfolioItem[];
    performance: {
      totalPnl: number;
      realizedPnl: number;
      unrealizedPnl: number;
      roi: number;
    };
  }> {
    return this.makeRequest<{
      address: string;
      totalValue: number;
      totalTokens: number;
      tokens: RunesPortfolioItem[];
      performance: {
        totalPnl: number;
        realizedPnl: number;
        unrealizedPnl: number;
        roi: number;
      };
    }>(`/portfolio/${address}`, {}, 60000);
  }

  /**
   * Get trending Runes tokens
   */
  async getTrendingTokens(options: {
    period?: '1h' | '24h' | '7d';
    limit?: number;
  } = {}): Promise<RunesToken[]> {
    const params = {
      period: options.period || '24h',
      limit: options.limit || 10,
    };

    return this.makeRequest<RunesToken[]>('/trending', params, 300000);
  }

  /**
   * Get newly minted or listed Runes tokens
   */
  async getNewTokens(options: {
    limit?: number;
    type?: 'minted' | 'listed' | 'all';
  } = {}): Promise<RunesToken[]> {
    const params = {
      limit: options.limit || 20,
      type: options.type || 'all',
    };

    return this.makeRequest<RunesToken[]>('/new-tokens', params, 300000);
  }

  /**
   * Search Runes tokens
   */
  async searchTokens(query: string, options: {
    limit?: number;
    sort?: 'relevance' | 'marketCap' | 'volume';
  } = {}): Promise<RunesToken[]> {
    const params = {
      q: query,
      limit: options.limit || 20,
      sort: options.sort || 'relevance',
    };

    return this.makeRequest<RunesToken[]>('/search', params, 300000);
  }

  /**
   * Get market statistics
   */
  async getMarketStats(): Promise<{
    totalMarketCap: number;
    totalVolume24h: number;
    totalTokens: number;
    activeTokens: number;
    totalHolders: number;
    totalTransactions: number;
    avgPrice: number;
    topGainers: RunesToken[];
    topLosers: RunesToken[];
    mostActive: RunesToken[];
  }> {
    return this.makeRequest<{
      totalMarketCap: number;
      totalVolume24h: number;
      totalTokens: number;
      activeTokens: number;
      totalHolders: number;
      totalTransactions: number;
      avgPrice: number;
      topGainers: RunesToken[];
      topLosers: RunesToken[];
      mostActive: RunesToken[];
    }>('/market-stats', {}, 300000);
  }

  /**
   * Get token holder analytics
   */
  async getTokenHolders(tokenId: string, options: {
    page?: number;
    limit?: number;
    sort?: 'balance' | 'transactions' | 'firstPurchase';
    order?: 'asc' | 'desc';
  } = {}): Promise<{
    holders: Array<{
      address: string;
      balance: string;
      percentage: number;
      value: number;
      transactions: number;
      firstPurchase: string;
      lastActivity: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const params = {
      page: options.page || 1,
      limit: options.limit || 50,
      sort: options.sort || 'balance',
      order: options.order || 'desc',
    };

    return this.makeRequest<{
      holders: Array<{
        address: string;
        balance: string;
        percentage: number;
        value: number;
        transactions: number;
        firstPurchase: string;
        lastActivity: string;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(`/tokens/${tokenId}/holders`, params, 300000);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Default instance
export const runesDexService = new RunesDexService();

export default runesDexService;