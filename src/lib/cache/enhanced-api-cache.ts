/**
 * Enhanced API Cache System for CoinMarketCap Integration
 * Provides intelligent caching with TTL, compression, and cache warming
 */

import { logger } from '@/lib/logger';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
  hitCount: number;
  lastAccessed: number;
  source: string;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  compressionThreshold: number;
  enableCompression: boolean;
  enableMetrics: boolean;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  totalSize: number;
  hitRate: number;
}

export class EnhancedAPICache {
  private cache = new Map<string, CacheEntry>();
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
    totalSize: 0,
    hitRate: 0
  };
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300000,           // 5 minutes
      maxSize: 1000,                // Max 1000 entries
      compressionThreshold: 1024,   // Compress data > 1KB
      enableCompression: false,     // Disabled for now (could use LZ-string)
      enableMetrics: true,
      ...config
    };

    this.startCleanupProcess();
    logger.info('Enhanced API cache initialized', this.config);
  }

  private startCleanupProcess(): void {
    // Clean expired entries every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    let evicted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        evicted++;
      }
    }

    if (evicted > 0) {
      this.metrics.evictions += evicted;
      this.updateMetrics();
      logger.debug(`Cache cleanup: evicted ${evicted} expired entries`);
    }

    // Evict least recently used items if cache is too large
    if (this.cache.size > this.config.maxSize) {
      this.evictLRU();
    }
  }

  private evictLRU(): void {
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    const toEvict = this.cache.size - this.config.maxSize + Math.floor(this.config.maxSize * 0.1);
    
    for (let i = 0; i < toEvict && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
      this.metrics.evictions++;
    }

    logger.debug(`Cache LRU eviction: removed ${toEvict} least recently used entries`);
  }

  private updateMetrics(): void {
    this.metrics.totalSize = this.cache.size;
    this.metrics.hitRate = this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      this.updateMetrics();
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.metrics.misses++;
      this.updateMetrics();
      return null;
    }

    // Update access statistics
    entry.hitCount++;
    entry.lastAccessed = now;
    
    this.metrics.hits++;
    this.updateMetrics();

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl?: number, source = 'unknown'): void {
    const now = Date.now();
    const entryTTL = ttl || this.config.defaultTTL;

    // Create cache entry
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: entryTTL,
      hitCount: 0,
      lastAccessed: now,
      source
    };

    // Compression logic (placeholder for future implementation)
    if (this.config.enableCompression) {
      const dataSize = JSON.stringify(data).length;
      if (dataSize > this.config.compressionThreshold) {
        // Could implement compression here with LZ-string
        entry.compressed = true;
      }
    }

    this.cache.set(key, entry);
    this.metrics.sets++;
    this.updateMetrics();

    logger.debug(`Cached data for key: ${key}, TTL: ${entryTTL}ms, Source: ${source}`);
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.resetMetrics();
    logger.info('Cache cleared');
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      totalSize: 0,
      hitRate: 0
    };
  }

  getMetrics(): CacheMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  getEntry(key: string): CacheEntry | null {
    return this.cache.get(key) || null;
  }

  getAllEntries(): Map<string, CacheEntry> {
    return new Map(this.cache);
  }

  // Warm cache with predefined data
  warm(warmupData: Array<{ key: string; data: any; ttl?: number; source?: string }>): void {
    logger.info(`Warming cache with ${warmupData.length} entries`);
    
    for (const item of warmupData) {
      this.set(item.key, item.data, item.ttl, item.source || 'warmup');
    }
  }

  // Get cache statistics
  getStats(): {
    metrics: CacheMetrics;
    topKeys: Array<{ key: string; hitCount: number; source: string }>;
    sizeMB: number;
  } {
    const metrics = this.getMetrics();
    
    // Get top accessed keys
    const topKeys = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        hitCount: entry.hitCount,
        source: entry.source
      }))
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, 10);

    // Estimate size in MB
    const sizeMB = JSON.stringify(Array.from(this.cache.values())).length / (1024 * 1024);

    return {
      metrics,
      topKeys,
      sizeMB
    };
  }

  // Specific cache keys for CoinMarketCap data
  static createKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  // Destroy the cache and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
    logger.info('Enhanced API cache destroyed');
  }
}

// Create specialized caches for different types of data
export const priceCache = new EnhancedAPICache({
  defaultTTL: 30000,      // 30 seconds for price data
  maxSize: 500,
  enableMetrics: true
});

export const marketCache = new EnhancedAPICache({
  defaultTTL: 300000,     // 5 minutes for market data
  maxSize: 200,
  enableMetrics: true
});

export const historicalCache = new EnhancedAPICache({
  defaultTTL: 3600000,    // 1 hour for historical data
  maxSize: 100,
  enableMetrics: true
});

// Export main cache instance
export const enhancedAPICache = new EnhancedAPICache();
export default enhancedAPICache;