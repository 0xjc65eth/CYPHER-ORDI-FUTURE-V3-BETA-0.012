/**
 * 🔄 Advanced Cache System
 * Memory-only cache for build compatibility
 */

export interface CacheConfig {
  redisUrl?: string;
  ttl: number; // seconds
  namespace: string;
}

class AdvancedCache {
  private memoryCache: Map<string, { value: any; expires: number }> = new Map();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  private getKey(key: string): string {
    return `${this.config.namespace}:${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);
    const cached = this.memoryCache.get(fullKey);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(fullKey);
      return null;
    }
    
    return cached.value as T;
  }

  async set(key: string, value: any, ttlOverride?: number): Promise<void> {
    const fullKey = this.getKey(key);
    const ttl = ttlOverride || this.config.ttl;
    const expires = Date.now() + (ttl * 1000);
    
    this.memoryCache.set(fullKey, { value, expires });
  }

  async del(key: string): Promise<void> {
    const fullKey = this.getKey(key);
    this.memoryCache.delete(fullKey);
  }

  async clear(): Promise<void> {
    // Clear only keys with our namespace
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(`${this.config.namespace}:`)) {
        this.memoryCache.delete(key);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    const cached = this.memoryCache.get(fullKey);
    
    if (!cached) return false;
    
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(fullKey);
      return false;
    }
    
    return true;
  }

  async ttl(key: string): Promise<number> {
    const fullKey = this.getKey(key);
    const cached = this.memoryCache.get(fullKey);
    
    if (!cached) return -1;
    
    const remaining = cached.expires - Date.now();
    return remaining > 0 ? Math.floor(remaining / 1000) : -1;
  }

  disconnect(): void {
    // Memory cache cleanup
    this.memoryCache.clear();
  }
}

// Export instance
export const advancedCache = new AdvancedCache({
  ttl: 300, // 5 minutes
  namespace: 'cypher'
});

// Cache instances for different purposes
export const cacheInstances = {
  default: advancedCache,
  portfolio: new AdvancedCache({
    ttl: 180, // 3 minutes
    namespace: 'portfolio'
  }),
  market: new AdvancedCache({
    ttl: 60, // 1 minute
    namespace: 'market'
  }),
  inscriptions: new AdvancedCache({
    ttl: 600, // 10 minutes
    namespace: 'inscriptions'
  }),
  api: new AdvancedCache({
    ttl: 120, // 2 minutes
    namespace: 'api'
  })
};

export default advancedCache;