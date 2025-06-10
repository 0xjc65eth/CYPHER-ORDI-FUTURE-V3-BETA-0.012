/**
 * Professional CoinMarketCap API Service
 * Enterprise-level cryptocurrency market data integration with advanced features
 * Comprehensive API wrapper for CoinMarketCap with security, caching, and reliability
 */

import { securityLogger, checkRateLimit, sanitizeInput, validateApiKey } from '../utils/security.js';

// ===========================================
// CONFIGURATION AND CONSTANTS
// ===========================================

const API_CONFIG = {
  BASE_URL: 'https://pro-api.coinmarketcap.com',
  SANDBOX_URL: 'https://sandbox-api.coinmarketcap.com',
  VERSION: 'v1',
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Rate limiting (conservative approach)
  RATE_LIMITS: {
    BASIC: { requests: 10, window: 60000 }, // 10 per minute
    PROFESSIONAL: { requests: 30, window: 60000 }, // 30 per minute
    ENTERPRISE: { requests: 100, window: 60000 } // 100 per minute
  },
  
  // Cache TTL settings
  CACHE_TTL: {
    LISTINGS: 300000, // 5 minutes
    QUOTES: 60000, // 1 minute
    HISTORICAL: 3600000, // 1 hour
    GLOBAL_METRICS: 300000, // 5 minutes
    METADATA: 86400000 // 24 hours
  }
};

const ERROR_CODES = {
  400: 'Bad Request - Invalid parameters',
  401: 'Unauthorized - Invalid API key',
  402: 'Payment Required - Insufficient credits',
  403: 'Forbidden - Access denied',
  429: 'Too Many Requests - Rate limit exceeded',
  500: 'Internal Server Error - CMC server error',
  503: 'Service Unavailable - CMC maintenance'
};

// ===========================================
// COINMARKETCAP API SERVICE CLASS
// ===========================================

export class CoinMarketCapAPI {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.COINMARKETCAP_API_KEY || process.env.NEXT_PUBLIC_CMC_API_KEY,
      baseURL: config.sandbox ? API_CONFIG.SANDBOX_URL : API_CONFIG.BASE_URL,
      timeout: config.timeout || API_CONFIG.DEFAULT_TIMEOUT,
      retries: config.retries || API_CONFIG.MAX_RETRIES,
      retryDelay: config.retryDelay || API_CONFIG.RETRY_DELAY,
      plan: config.plan || 'BASIC', // BASIC, PROFESSIONAL, ENTERPRISE
      ...config
    };

    // Validate API key
    if (!this.config.apiKey || !validateApiKey(this.config.apiKey)) {
      throw new Error('Invalid or missing CoinMarketCap API key');
    }

    // Initialize cache and rate limiting
    this.cache = new Map();
    this.requestQueue = [];
    this.processingQueue = false;
    this.rateLimitConfig = API_CONFIG.RATE_LIMITS[this.config.plan];

    // Bind methods
    this.makeRequest = this.makeRequest.bind(this);
    this.processQueue = this.processQueue.bind(this);

    securityLogger({
      event: 'CMC_API_INITIALIZED',
      timestamp: new Date().toISOString(),
      plan: this.config.plan,
      success: true
    });
  }

  // ===========================================
  // CORE REQUEST HANDLING
  // ===========================================

  /**
   * Make authenticated request to CoinMarketCap API
   */
  async makeRequest(endpoint, params = {}, options = {}) {
    try {
      // Validate and sanitize inputs
      if (typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint');
      }

      endpoint = sanitizeInput(endpoint);
      
      // Check rate limiting
      await this.checkRateLimit();

      // Build request URL
      const url = this.buildURL(endpoint, params);
      
      // Check cache first
      const cacheKey = this.getCacheKey(endpoint, params);
      if (options.useCache !== false) {
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Make HTTP request with retries
      const response = await this.makeHTTPRequest(url, options);
      
      // Cache successful response
      if (options.cacheTTL && response.status?.error_code === 0) {
        this.setCache(cacheKey, response.data, options.cacheTTL);
      }

      securityLogger({
        event: 'CMC_API_REQUEST_SUCCESS',
        timestamp: new Date().toISOString(),
        endpoint,
        responseSize: JSON.stringify(response).length,
        success: true
      });

      return response.data;

    } catch (error) {
      securityLogger({
        event: 'CMC_API_REQUEST_FAILED',
        timestamp: new Date().toISOString(),
        endpoint,
        error: error.message,
        success: false
      });

      throw this.handleAPIError(error);
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  async makeHTTPRequest(url, options = {}) {
    let lastError;
    
    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-CMC_PRO_API_KEY': this.config.apiKey,
            'Accept': 'application/json',
            'Accept-Encoding': 'deflate, gzip',
            'User-Agent': 'Cypher-Ordi-Future/1.0',
            ...options.headers
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${ERROR_CODES[response.status] || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (data.status && data.status.error_code !== 0) {
          throw new Error(`CMC API Error ${data.status.error_code}: ${data.status.error_message}`);
        }

        return data;

      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.message.includes('401') || error.message.includes('403')) {
          throw error;
        }

        // Wait before retry with exponential backoff
        if (attempt < this.config.retries - 1) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Build complete API URL with parameters
   */
  buildURL(endpoint, params = {}) {
    const url = new URL(`${this.config.baseURL}/${API_CONFIG.VERSION}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });

    return url.toString();
  }

  /**
   * Handle API errors with proper categorization
   */
  handleAPIError(error) {
    const errorMessage = error.message || 'Unknown error';
    
    // Categorize errors
    if (errorMessage.includes('401')) {
      return new Error('Invalid API key or unauthorized access');
    }
    
    if (errorMessage.includes('402')) {
      return new Error('Insufficient API credits - upgrade your plan');
    }
    
    if (errorMessage.includes('429')) {
      return new Error('Rate limit exceeded - please wait before making more requests');
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      return new Error('Request timeout - please try again');
    }
    
    return new Error(`CoinMarketCap API error: ${errorMessage}`);
  }

  // ===========================================
  // RATE LIMITING AND QUEUE MANAGEMENT
  // ===========================================

  /**
   * Check and enforce rate limiting
   */
  async checkRateLimit() {
    try {
      return checkRateLimit('coinmarketcap-api', {
        maxRequests: this.rateLimitConfig.requests,
        windowMs: this.rateLimitConfig.window,
        strategy: 'sliding-window'
      });
    } catch (error) {
      // If rate limited, add to queue
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ resolve, reject, timestamp: Date.now() });
        this.processQueue();
      });
    }
  }

  /**
   * Process queued requests
   */
  async processQueue() {
    if (this.processingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (this.requestQueue.length > 0) {
      const { resolve, reject } = this.requestQueue.shift();
      
      try {
        // Wait for rate limit window
        await this.sleep(Math.ceil(this.rateLimitConfig.window / this.rateLimitConfig.requests));
        
        // Check rate limit again
        const result = checkRateLimit('coinmarketcap-api', {
          maxRequests: this.rateLimitConfig.requests,
          windowMs: this.rateLimitConfig.window,
          strategy: 'sliding-window'
        });
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processingQueue = false;
  }

  // ===========================================
  // CACHING SYSTEM
  // ===========================================

  /**
   * Get cached data
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set data in cache
   */
  setCache(key, data, ttl) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    });

    // Cleanup expired entries periodically
    if (this.cache.size > 1000) {
      this.cleanupCache();
    }
  }

  /**
   * Generate cache key
   */
  getCacheKey(endpoint, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // ===========================================
  // PUBLIC API METHODS
  // ===========================================

  /**
   * Get cryptocurrency listings with comprehensive filtering
   */
  async getCryptocurrencyListings(options = {}) {
    const params = {
      start: options.start || 1,
      limit: Math.min(options.limit || 100, 5000),
      sort: options.sort || 'market_cap',
      sort_dir: options.sort_dir || 'desc',
      cryptocurrency_type: options.cryptocurrency_type || 'all',
      convert: options.convert || 'USD',
      aux: options.aux || 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply'
    };

    if (options.tag) params.tag = options.tag;
    if (options.price_min) params.price_min = options.price_min;
    if (options.price_max) params.price_max = options.price_max;
    if (options.market_cap_min) params.market_cap_min = options.market_cap_min;
    if (options.market_cap_max) params.market_cap_max = options.market_cap_max;
    if (options.volume_24h_min) params.volume_24h_min = options.volume_24h_min;
    if (options.volume_24h_max) params.volume_24h_max = options.volume_24h_max;

    return this.makeRequest('/cryptocurrency/listings/latest', params, {
      cacheTTL: API_CONFIG.CACHE_TTL.LISTINGS,
      useCache: options.useCache
    });
  }

  /**
   * Get specific cryptocurrency quotes
   */
  async getCryptocurrencyQuotes(options = {}) {
    if (!options.id && !options.symbol && !options.slug) {
      throw new Error('Must provide either id, symbol, or slug');
    }

    const params = {
      convert: options.convert || 'USD',
      aux: options.aux || 'num_market_pairs,cmc_rank,date_added,tags,platform,max_supply,circulating_supply,total_supply'
    };

    if (options.id) params.id = options.id;
    if (options.symbol) params.symbol = options.symbol;
    if (options.slug) params.slug = options.slug;

    return this.makeRequest('/cryptocurrency/quotes/latest', params, {
      cacheTTL: API_CONFIG.CACHE_TTL.QUOTES,
      useCache: options.useCache
    });
  }

  /**
   * Get global cryptocurrency market metrics
   */
  async getGlobalMetrics(convert = 'USD') {
    return this.makeRequest('/global-metrics/quotes/latest', { convert }, {
      cacheTTL: API_CONFIG.CACHE_TTL.GLOBAL_METRICS
    });
  }

  /**
   * Get cryptocurrency metadata
   */
  async getCryptocurrencyInfo(options = {}) {
    if (!options.id && !options.symbol && !options.slug) {
      throw new Error('Must provide either id, symbol, or slug');
    }

    const params = {
      aux: options.aux || 'urls,logo,description,tags,platform,date_added,notice,status'
    };

    if (options.id) params.id = options.id;
    if (options.symbol) params.symbol = options.symbol;
    if (options.slug) params.slug = options.slug;

    return this.makeRequest('/cryptocurrency/info', params, {
      cacheTTL: API_CONFIG.CACHE_TTL.METADATA
    });
  }

  /**
   * Get historical OHLCV data
   */
  async getHistoricalData(options = {}) {
    if (!options.id && !options.symbol) {
      throw new Error('Must provide either id or symbol');
    }

    const params = {
      interval: options.interval || 'daily',
      convert: options.convert || 'USD',
      count: options.count || 365,
      time_period: options.time_period || 'yearly'
    };

    if (options.id) params.id = options.id;
    if (options.symbol) params.symbol = options.symbol;
    if (options.time_start) params.time_start = options.time_start;
    if (options.time_end) params.time_end = options.time_end;

    return this.makeRequest('/cryptocurrency/quotes/historical', params, {
      cacheTTL: API_CONFIG.CACHE_TTL.HISTORICAL
    });
  }

  /**
   * Get price conversion between cryptocurrencies and fiat
   */
  async convertPrice(options = {}) {
    if (!options.amount || (!options.id && !options.symbol)) {
      throw new Error('Must provide amount and either id or symbol');
    }

    const params = {
      amount: options.amount,
      convert: options.convert || 'USD'
    };

    if (options.id) params.id = options.id;
    if (options.symbol) params.symbol = options.symbol;
    if (options.time) params.time = options.time;

    return this.makeRequest('/tools/price-conversion', params, {
      cacheTTL: API_CONFIG.CACHE_TTL.QUOTES
    });
  }

  /**
   * Get trending cryptocurrencies
   */
  async getTrendingCryptocurrencies(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 10,
      time_period: options.time_period || '24h',
      convert: options.convert || 'USD'
    };

    return this.makeRequest('/cryptocurrency/trending/latest', params, {
      cacheTTL: API_CONFIG.CACHE_TTL.LISTINGS
    });
  }

  /**
   * Get top gaining cryptocurrencies
   */
  async getTopGainers(options = {}) {
    const params = {
      start: options.start || 1,
      limit: options.limit || 10,
      time_period: options.time_period || '24h',
      convert: options.convert || 'USD'
    };

    return this.makeRequest('/cryptocurrency/trending/gainers-losers', params, {
      cacheTTL: API_CONFIG.CACHE_TTL.LISTINGS
    });
  }

  /**
   * Get top losing cryptocurrencies
   */
  async getTopLosers(options = {}) {
    const gainersLosers = await this.getTopGainers(options);
    return gainersLosers.losers || [];
  }

  /**
   * Search cryptocurrencies by name or symbol
   */
  async searchCryptocurrencies(query, options = {}) {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required');
    }

    query = sanitizeInput(query);

    // Get comprehensive listings for search
    const listings = await this.getCryptocurrencyListings({
      limit: 5000,
      ...options
    });

    // Client-side search filtering
    const queryLower = query.toLowerCase();
    return listings.filter(crypto => 
      crypto.name.toLowerCase().includes(queryLower) ||
      crypto.symbol.toLowerCase().includes(queryLower) ||
      crypto.slug.toLowerCase().includes(queryLower)
    ).slice(0, options.limit || 20);
  }

  /**
   * Get Bitcoin-specific data
   */
  async getBitcoinData(convert = 'USD') {
    const data = await this.getCryptocurrencyQuotes({
      symbol: 'BTC',
      convert
    });
    return data.BTC;
  }

  /**
   * Get Ethereum-specific data
   */
  async getEthereumData(convert = 'USD') {
    const data = await this.getCryptocurrencyQuotes({
      symbol: 'ETH',
      convert
    });
    return data.ETH;
  }

  /**
   * Get top cryptocurrencies by market cap
   */
  async getTopCryptocurrencies(limit = 10, convert = 'USD') {
    return this.getCryptocurrencyListings({
      limit,
      convert,
      sort: 'market_cap',
      sort_dir: 'desc'
    });
  }

  /**
   * Get DeFi cryptocurrencies
   */
  async getDeFiCryptocurrencies(options = {}) {
    return this.getCryptocurrencyListings({
      start: options.start || 1,
      limit: options.limit || 50,
      convert: options.convert || 'USD',
      tag: 'defi'
    });
  }

  /**
   * Get NFT-related cryptocurrencies
   */
  async getNFTCryptocurrencies(options = {}) {
    return this.getCryptocurrencyListings({
      start: options.start || 1,
      limit: options.limit || 50,
      convert: options.convert || 'USD',
      tag: 'nft'
    });
  }

  /**
   * Get meme cryptocurrencies
   */
  async getMemeCryptocurrencies(options = {}) {
    return this.getCryptocurrencyListings({
      start: options.start || 1,
      limit: options.limit || 50,
      convert: options.convert || 'USD',
      tag: 'memes'
    });
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Get API usage statistics
   */
  async getAPIUsage() {
    try {
      return this.makeRequest('/key/info', {}, { useCache: false });
    } catch (error) {
      // Some plans don't have access to this endpoint
      return null;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    securityLogger({
      event: 'CMC_API_CACHE_CLEARED',
      timestamp: new Date().toISOString(),
      success: true
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      memoryUsage: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }

  /**
   * Sleep utility for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check for API connectivity
   */
  async healthCheck() {
    try {
      await this.getGlobalMetrics();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        latency: Date.now()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// ===========================================
// EXPORT AND DEFAULT INSTANCE
// ===========================================

// Create default instance with environment configuration
export const coinMarketCapAPI = new CoinMarketCapAPI({
  apiKey: process.env.COINMARKETCAP_API_KEY || process.env.NEXT_PUBLIC_CMC_API_KEY,
  plan: process.env.CMC_PLAN || 'BASIC',
  sandbox: process.env.NODE_ENV === 'development'
});

// Export utility functions
export const CoinMarketCapUtils = {
  /**
   * Format price with appropriate decimal places
   */
  formatPrice(price, currency = 'USD') {
    if (typeof price !== 'number' || isNaN(price)) return '0';
    
    if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 6,
        maximumFractionDigits: 6
      }).format(price);
    }
  },

  /**
   * Format percentage change
   */
  formatPercentChange(change) {
    if (typeof change !== 'number' || isNaN(change)) return '0.00%';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  },

  /**
   * Format market cap
   */
  formatMarketCap(marketCap) {
    if (typeof marketCap !== 'number' || isNaN(marketCap)) return '0';
    
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  },

  /**
   * Calculate price change color
   */
  getPriceChangeColor(change) {
    if (typeof change !== 'number' || isNaN(change)) return 'gray';
    return change >= 0 ? 'green' : 'red';
  }
};

export default coinMarketCapAPI;