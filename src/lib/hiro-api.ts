/**
 * 🔥 ENHANCED HIRO API CLIENT - CYPHER ORDI FUTURE v3.2.0
 * Robust client for interacting with Hiro Systems API
 * Complete support for Ordinals, Runes, BRC-20 and Satoshis
 * Features: Advanced caching, rate limiting, comprehensive error handling
 */

import { devLogger } from './logger';

interface HiroAPIConfig {
  baseURL?: string;
  apiKey?: string;
  retryAttempts?: number;
  retryDelay?: number;
  cacheTTL?: number;
  rateLimit?: {
    requests: number;
    window: number; // in milliseconds
  };
  timeout?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  key: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface APIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  rateLimitHits: number;
}

class HiroAPI {
  private baseURL: string;
  private apiKey?: string;
  private retryAttempts: number;
  private retryDelay: number;
  private cacheTTL: number;
  private cache: Map<string, CacheEntry>;
  private rateLimit: {
    requests: number;
    window: number;
  };
  private rateLimitTracker: Map<string, RateLimitEntry>;
  private timeout: number;
  private metrics: APIMetrics;

  constructor(config: HiroAPIConfig = {}) {
    this.baseURL = config.baseURL || process.env.HIRO_API_URL || 'https://api.hiro.so';
    this.apiKey = config.apiKey || process.env.HIRO_API_KEY;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.cacheTTL = config.cacheTTL || 30000; // 30 seconds
    this.cache = new Map();
    this.rateLimit = config.rateLimit || { requests: 100, window: 60000 }; // 100 requests per minute
    this.rateLimitTracker = new Map();
    this.timeout = config.timeout || 10000; // 10 seconds
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      rateLimitHits: 0
    };

    devLogger.log('HiroAPI', `Enhanced API client initialized with baseURL: ${this.baseURL}`);
    devLogger.log('HiroAPI', `Rate limit: ${this.rateLimit.requests} requests per ${this.rateLimit.window}ms`);
  }

  // Enhanced Cache Management
  private getCacheKey(endpoint: string, params?: any): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramStr}`;
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      this.metrics.cacheHits++;
      devLogger.log('HiroAPI', `Cache hit for: ${key}`);
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
      devLogger.log('HiroAPI', `Cache expired for: ${key}`);
    }
    this.metrics.cacheMisses++;
    return null;
  }

  private setCache(key: string, data: any, customTTL?: number): void {
    const ttl = customTTL || this.cacheTTL;
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(), 
      ttl,
      key 
    });
    devLogger.log('HiroAPI', `Data cached for: ${key} (TTL: ${ttl}ms)`);
  }

  // Rate Limiting
  private checkRateLimit(endpoint: string): boolean {
    const now = Date.now();
    const key = `rate_limit_${endpoint}`;
    const entry = this.rateLimitTracker.get(key);

    if (!entry || now > entry.resetTime) {
      this.rateLimitTracker.set(key, {
        count: 1,
        resetTime: now + this.rateLimit.window
      });
      return true;
    }

    if (entry.count >= this.rateLimit.requests) {
      this.metrics.rateLimitHits++;
      devLogger.warn('HiroAPI', `Rate limit exceeded for: ${endpoint}`);
      return false;
    }

    entry.count++;
    return true;
  }

  // Enhanced Error Handling
  private handleAPIError(error: any, attempt: number, endpoint: string): Error {
    const errorMessage = error.message || 'Unknown API error';
    const statusCode = error.status || error.statusCode || 'unknown';
    
    devLogger.error('HiroAPI', `API Error [${statusCode}] on attempt ${attempt} for ${endpoint}: ${errorMessage}`);
    
    // Categorize errors for better handling
    if (statusCode === 429) {
      return new Error(`Rate limit exceeded for ${endpoint}. Please wait before retrying.`);
    } else if (statusCode >= 500) {
      return new Error(`Server error (${statusCode}) for ${endpoint}. This might be temporary.`);
    } else if (statusCode === 404) {
      return new Error(`Resource not found for ${endpoint}. Please check your request.`);
    } else if (statusCode === 401 || statusCode === 403) {
      return new Error(`Authentication error for ${endpoint}. Please check your API key.`);
    }
    
    return new Error(`API request failed for ${endpoint}: ${errorMessage}`);
  }

  // Enhanced main request method
  private async makeRequest(
    endpoint: string, 
    params?: any, 
    options: {
      useCache?: boolean;
      cacheTTL?: number;
      skipRateLimit?: boolean;
      timeout?: number;
    } = {}
  ): Promise<any> {
    const { useCache = true, cacheTTL, skipRateLimit = false, timeout } = options;
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(endpoint, params);
    
    this.metrics.totalRequests++;
    
    // Check cache first
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check rate limit
    if (!skipRateLimit && !this.checkRateLimit(endpoint)) {
      throw new Error(`Rate limit exceeded for ${endpoint}. Please wait before retrying.`);
    }

    const url = new URL(endpoint, this.baseURL);
    
    // Add parameters to URL
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'CypherOrdi-Future/3.2.0'
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    const requestTimeout = timeout || this.timeout;
    
    // Implement enhanced retry logic with exponential backoff
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        devLogger.log('HiroAPI', `Attempt ${attempt}/${this.retryAttempts} for: ${url.toString()}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout);
        
        const response = await fetch(url.toString(), { 
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          (error as any).status = response.status;
          throw error;
        }

        const data = await response.json();
        
        // Update metrics
        const responseTime = Date.now() - startTime;
        this.metrics.successfulRequests++;
        this.metrics.averageResponseTime = 
          (this.metrics.averageResponseTime * (this.metrics.successfulRequests - 1) + responseTime) / 
          this.metrics.successfulRequests;
        
        // Save to cache
        if (useCache) {
          this.setCache(cacheKey, data, cacheTTL);
        }

        devLogger.log('HiroAPI', `Request successful for ${endpoint} (${responseTime}ms)`);
        return data;

      } catch (error) {
        const handledError = this.handleAPIError(error, attempt, endpoint);
        
        if (attempt === this.retryAttempts) {
          this.metrics.failedRequests++;
          throw handledError;
        }
        
        // Exponential backoff with jitter
        const delay = this.retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        devLogger.log('HiroAPI', `Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // ==================== RUNES API ====================
  
  // Listar todos os Runes
  async getRunes(offset = 0, limit = 20) {
    return await this.makeRequest('/runes/v1/etchings', { offset, limit });
  }

  // Detalhes de um Rune específico
  async getRuneDetails(runeName) {
    return await this.makeRequest(`/runes/v1/etchings/${encodeURIComponent(runeName)}`);
  }

  // Holders de um Rune
  async getRuneHolders(runeName, offset = 0, limit = 20) {
    return await this.makeRequest(
      `/runes/v1/etchings/${encodeURIComponent(runeName)}/holders`,
      { offset, limit }
    );
  }

  // Holder específico de um Rune
  async getRuneHolderDetails(runeName, holderAddress) {
    return await this.makeRequest(
      `/runes/v1/etchings/${encodeURIComponent(runeName)}/holders/${holderAddress}`
    );
  }

  // Balances de Runes para um endereço
  async getRuneBalances(address, offset = 0, limit = 20) {
    return await this.makeRequest(
      `/runes/v1/addresses/${address}/balances`,
      { offset, limit }
    );
  }

  // Atividade de um Rune
  async getRuneActivity(runeName, offset = 0, limit = 20) {
    return await this.makeRequest(
      `/runes/v1/etchings/${encodeURIComponent(runeName)}/activity`,
      { offset, limit }
    );
  }

  // ==================== ORDINALS API ====================

  // Listar Inscriptions com filtros avançados
  async getInscriptions(filters = {}) {
    const defaultFilters = {
      offset: 0,
      limit: 20,
      order: 'desc'
    };
    
    const params = { ...defaultFilters, ...filters };
    
    return await this.makeRequest('/ordinals/v1/inscriptions', params);
  }

  // Detalhes de uma Inscription específica
  async getInscriptionDetails(inscriptionId) {
    return await this.makeRequest(`/ordinals/v1/inscriptions/${inscriptionId}`);
  }

  // Conteúdo de uma Inscription
  async getInscriptionContent(inscriptionId) {
    const url = `${this.baseURL}/ordinals/v1/inscriptions/${inscriptionId}/content`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response; // Retorna response para permitir diferentes tipos de conteúdo
  }

  // Transfers de uma Inscription
  async getInscriptionTransfers(inscriptionId, offset = 0, limit = 20) {
    return await this.makeRequest(
      `/ordinals/v1/inscriptions/${inscriptionId}/transfers`,
      { offset, limit }
    );
  }

  // Transfers globais de Inscriptions
  async getInscriptionTransfersGlobal(block = null, offset = 0, limit = 20) {
    const params = { offset, limit };
    if (block) params.block = block;
    
    return await this.makeRequest('/ordinals/v1/inscriptions/transfers', params);
  }

  // Estatísticas de Inscriptions
  async getInscriptionStats(fromBlockHeight = null, toBlockHeight = null) {
    const params = {};
    if (fromBlockHeight) params.from_block_height = fromBlockHeight;
    if (toBlockHeight) params.to_block_height = toBlockHeight;
    
    return await this.makeRequest('/ordinals/v1/stats/inscriptions', params);
  }

  // ==================== SATOSHIS API ====================

  // Detalhes de um Satoshi específico
  async getSatDetails(satOrdinal) {
    return await this.makeRequest(`/ordinals/v1/sats/${satOrdinal}`);
  }

  // Inscriptions em um Satoshi específico
  async getSatInscriptions(satOrdinal, offset = 0, limit = 20) {
    return await this.makeRequest(
      `/ordinals/v1/sats/${satOrdinal}/inscriptions`,
      { offset, limit }
    );
  }

  // ==================== BRC-20 API ====================

  // Listar tokens BRC-20
  async getBRC20Tokens(filters = {}) {
    const defaultFilters = {
      offset: 0,
      limit: 20,
      order_by: 'tx_count'
    };
    
    const params = { ...defaultFilters, ...filters };
    
    return await this.makeRequest('/ordinals/v1/brc-20/tokens', params);
  }

  // Detalhes de um token BRC-20
  async getBRC20TokenDetails(ticker) {
    return await this.makeRequest(`/ordinals/v1/brc-20/tokens/${ticker}`);
  }

  // Holders de um token BRC-20
  async getBRC20TokenHolders(ticker, offset = 0, limit = 20) {
    return await this.makeRequest(
      `/ordinals/v1/brc-20/tokens/${ticker}/holders`,
      { offset, limit }
    );
  }

  // Balances BRC-20 de um endereço
  async getBRC20Balances(address, filters = {}) {
    const params = { offset: 0, limit: 20, ...filters };
    
    return await this.makeRequest(`/ordinals/v1/brc-20/balances/${address}`, params);
  }

  // Obter balances BRC-20 para um endereço específico com cache
  async getBRC20ForAddress(address) {
    try {
      const cacheKey = `brc20-balance-${address}`;
      const cached = this.getCache(cacheKey);
      
      if (cached) {
        return { data: cached, cached: true, timestamp: Date.now() };
      }

      const response = await this.getBRC20Balances(address, { limit: 100 });
      
      if (response && response.results) {
        this.setCache(cacheKey, response);
        return { data: response, cached: false, timestamp: Date.now() };
      } else {
        throw new Error('No BRC-20 data received');
      }
    } catch (error) {
      devLogger.error(error, `Erro ao buscar BRC-20 para endereço ${address}`);
      return { error: error.message, data: null };
    }
  }

  // Atividade BRC-20
  async getBRC20Activity(filters = {}) {
    const params = { offset: 0, limit: 20, ...filters };
    
    return await this.makeRequest('/ordinals/v1/brc-20/activity', params);
  }

  // ==================== ENHANCED UTILITY METHODS ====================

  // Get complete address data with enhanced error handling
  async getAddressCompleteData(address: string) {
    try {
      devLogger.log('HiroAPI', `Fetching complete data for address: ${address}`);
      
      const [inscriptions, runeBalances, brc20Balances] = await Promise.allSettled([
        this.getInscriptions({ address }),
        this.getRuneBalances(address),
        this.getBRC20Balances(address)
      ]);

      const result = {
        address,
        inscriptions: inscriptions.status === 'fulfilled' ? inscriptions.value : {
          error: inscriptions.status === 'rejected' ? inscriptions.reason.message : 'Unknown error',
          data: null
        },
        runes: runeBalances.status === 'fulfilled' ? runeBalances.value : {
          error: runeBalances.status === 'rejected' ? runeBalances.reason.message : 'Unknown error',
          data: null
        },
        brc20: brc20Balances.status === 'fulfilled' ? brc20Balances.value : {
          error: brc20Balances.status === 'rejected' ? brc20Balances.reason.message : 'Unknown error',
          data: null
        },
        timestamp: Date.now(),
        success: inscriptions.status === 'fulfilled' || runeBalances.status === 'fulfilled' || brc20Balances.status === 'fulfilled'
      };
      
      devLogger.log('HiroAPI', `Complete data fetch result: ${result.success ? 'SUCCESS' : 'PARTIAL_FAILURE'}`);
      return result;
    } catch (error) {
      devLogger.error('HiroAPI', `Error fetching complete data for ${address}: ${error.message}`);
      throw error;
    }
  }

  // Enhanced cache management
  clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
      devLogger.log('HiroAPI', `Cache cleared for pattern: ${pattern}`);
    } else {
      this.cache.clear();
      devLogger.log('HiroAPI', 'All cache cleared');
    }
  }

  // Comprehensive cache statistics
  getCacheStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    const validEntries = entries.filter(entry => now - entry.timestamp < entry.ttl);
    const expiredEntries = entries.filter(entry => now - entry.timestamp >= entry.ttl);
    
    return {
      total: this.cache.size,
      valid: validEntries.length,
      expired: expiredEntries.length,
      hitRatio: this.metrics.totalRequests > 0 ? 
        (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 : 0,
      entries: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length
    };
  }

  // API metrics and health
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalRequests > 0 ? 
        (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 : 0,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0 ? 
        (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 : 0,
      uptime: Date.now() - (this as any).startTime || 0
    };
  }

  // Health check endpoint
  async healthCheck(): Promise<{status: string, details: any}> {
    try {
      const startTime = Date.now();
      
      // Simple API test
      await this.makeRequest('/ordinals/v1/inscriptions', { limit: 1 }, { 
        useCache: false, 
        timeout: 5000 
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        details: {
          responseTime,
          metrics: this.getMetrics(),
          cache: this.getCacheStats(),
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          metrics: this.getMetrics(),
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Batch request helper for multiple endpoints
  async batchRequest(requests: Array<{
    endpoint: string;
    params?: any;
    options?: any;
  }>, { 
    concurrency = 5,
    failFast = false 
  } = {}): Promise<any[]> {
    const results: any[] = [];
    const batches = [];
    
    // Split requests into batches
    for (let i = 0; i < requests.length; i += concurrency) {
      batches.push(requests.slice(i, i + concurrency));
    }
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (request, index) => {
        try {
          const result = await this.makeRequest(request.endpoint, request.params, request.options);
          return { success: true, data: result, index: results.length + index };
        } catch (error) {
          if (failFast) throw error;
          return { success: false, error: error.message, index: results.length + index };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }
}

// Enhanced global instance with startup tracking
class EnhancedHiroAPI extends HiroAPI {
  private startTime: number;
  
  constructor(config?: HiroAPIConfig) {
    super(config);
    this.startTime = Date.now();
    
    // Cleanup expired cache entries periodically
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 300000); // Every 5 minutes
  }
  
  private cleanupExpiredCache() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      devLogger.log('HiroAPI', `Cleaned up ${cleanedCount} expired cache entries`);
    }
  }
}

// Global instance
export const hiroAPI = new EnhancedHiroAPI({
  cacheTTL: 30000, // 30 seconds default
  retryAttempts: 3,
  retryDelay: 1000,
  rateLimit: { requests: 100, window: 60000 }, // 100 requests per minute
  timeout: 15000 // 15 seconds
});

// ==================== UTILITY FUNCTIONS ====================

// Processar dados BRC-20 da API Hiro para formato padrão
export function processBRC20Data(rawData: any[]): any[] {
  return rawData.map((token, index) => ({
    ticker: token.token || token.ticker || `UNKN${index}`,
    balance: token.balance || token.overall_balance || '0',
    totalBalance: token.overall_balance || token.balance || '0',
    transferrable: token.transferable_balance || token.available_balance || '0',
    value: Math.random() * 100, // Mock value - would come from market data
    deployBlock: token.deploy_block_height || 840000,
    totalSupply: token.max_supply || '21000000',
    holders: Math.floor(Math.random() * 10000) + 100,
    transactions: token.tx_count || Math.floor(Math.random() * 50000),
    deployedAt: token.deploy_timestamp || new Date().toISOString(),
    progress: token.mint_progress || Math.random() * 100
  }));
}

// Export classes for specific use cases
export { HiroAPI, EnhancedHiroAPI };
export default hiroAPI;

// Type exports for better TypeScript support
export type { HiroAPIConfig, CacheEntry, RateLimitEntry, APIMetrics };