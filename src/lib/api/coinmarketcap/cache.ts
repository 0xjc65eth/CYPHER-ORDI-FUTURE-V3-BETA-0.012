// CoinMarketCap API Cache Manager
import { getCacheKey, getCacheTTL } from './config';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.cache = new Map();
    this.startCleanupInterval();
  }

  // Set cache item
  set<T>(key: string, data: T, ttl?: number): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 300, // Default 5 minutes
    };
    this.cache.set(key, cacheItem);
  }

  // Get cache item
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if cache has expired
    const now = Date.now();
    const expirationTime = item.timestamp + (item.ttl * 1000);
    
    if (now > expirationTime) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Check if cache has valid item
  has(key: string): boolean {
    const item = this.get(key);
    return item !== null;
  }

  // Delete cache item
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Clear expired items
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      const expirationTime = item.timestamp + (item.ttl * 1000);
      if (now > expirationTime) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Start cleanup interval
  private startCleanupInterval(): void {
    // Clear expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.clearExpired();
    }, 60000);
  }

  // Stop cleanup interval
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  // Get cache stats
  getStats(): {
    size: number;
    items: Array<{ key: string; ttl: number; remainingTime: number }>;
  } {
    const now = Date.now();
    const items = Array.from(this.cache.entries()).map(([key, item]) => {
      const remainingTime = Math.max(0, (item.timestamp + (item.ttl * 1000) - now) / 1000);
      return {
        key,
        ttl: item.ttl,
        remainingTime: Math.round(remainingTime),
      };
    });

    return {
      size: this.cache.size,
      items,
    };
  }
}

// Singleton instance
let cacheInstance: CacheManager | null = null;

// Get cache instance
export function getCache(): CacheManager {
  if (!cacheInstance) {
    cacheInstance = new CacheManager();
  }
  return cacheInstance;
}

// Helper function to cache API response
export async function withCache<T>(
  endpoint: string,
  params: Record<string, any> | undefined,
  fetcher: () => Promise<T>,
  customTTL?: number
): Promise<T> {
  const cache = getCache();
  const cacheKey = getCacheKey(endpoint, params);
  
  // Check cache first
  const cachedData = cache.get<T>(cacheKey);
  if (cachedData !== null) {
    return cachedData;
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Cache the result
  const ttl = customTTL || getCacheTTL(endpoint);
  cache.set(cacheKey, data, ttl);

  return data;
}

// Helper function to invalidate cache by pattern
export function invalidateCache(pattern: string): void {
  const cache = getCache();
  const stats = cache.getStats();
  
  stats.items.forEach(({ key }) => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
}

// Helper function to get cache key for specific operations
export function getCacheKeys() {
  return {
    listings: (params?: Record<string, any>) => getCacheKey('/cryptocurrency/listings/latest', params),
    quotes: (params?: Record<string, any>) => getCacheKey('/cryptocurrency/quotes/latest', params),
    globalMetrics: (params?: Record<string, any>) => getCacheKey('/global-metrics/quotes/latest', params),
    trending: (params?: Record<string, any>) => getCacheKey('/cryptocurrency/trending/latest', params),
    fearGreed: () => getCacheKey('/fear-greed-index', {}),
    altcoinSeason: () => getCacheKey('/altcoin-season-index', {}),
  };
}