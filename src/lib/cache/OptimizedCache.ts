/**
 * Optimized Cache System for CYPHER ORDi Future V3
 * Multi-layer caching with TTL, LRU eviction, and performance monitoring
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  itemCount: number;
  hitRate: number;
}

export class OptimizedCache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    itemCount: 0,
    hitRate: 0
  };

  private maxSize: number;
  private maxMemory: number; // bytes
  private defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    maxSize: number = 1000,
    maxMemory: number = 50 * 1024 * 1024, // 50MB
    defaultTTL: number = 300000 // 5 minutes
  ) {
    this.maxSize = maxSize;
    this.maxMemory = maxMemory;
    this.defaultTTL = defaultTTL;

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get item from cache with automatic TTL checking
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check TTL
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      this.updateStats();
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;
    this.updateHitRate();

    return item.data;
  }

  /**
   * Set item in cache with automatic eviction
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const itemTTL = ttl || this.defaultTTL;
    const size = this.calculateSize(data);

    // Check if we need to evict items
    this.evictIfNeeded(size);

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: itemTTL,
      accessCount: 1,
      lastAccessed: now,
      size
    };

    // Remove existing item if updating
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.stats.totalSize -= existing.size;
    } else {
      this.stats.itemCount++;
    }

    this.cache.set(key, cacheItem);
    this.stats.totalSize += size;
  }

  /**
   * Get or set with factory function
   */
  async getOrSet<K>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    let item = this.get(key);
    
    if (item !== null) {
      return item;
    }

    // Factory function to get fresh data
    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Batch get multiple keys
   */
  getBatch(keys: string[]): Map<string, T> {
    const results = new Map<string, T>();
    
    for (const key of keys) {
      const item = this.get(key);
      if (item !== null) {
        results.set(key, item);
      }
    }

    return results;
  }

  /**
   * Batch set multiple items
   */
  setBatch(items: Map<string, T>, ttl?: number): void {
    for (const [key, data] of items) {
      this.set(key, data, ttl);
    }
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.cache.delete(key);
      this.stats.totalSize -= item.size;
      this.stats.itemCount--;
      return true;
    }
    return false;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      itemCount: 0,
      hitRate: 0
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache size info
   */
  getSizeInfo() {
    return {
      itemCount: this.cache.size,
      totalSize: this.stats.totalSize,
      maxSize: this.maxSize,
      maxMemory: this.maxMemory,
      memoryUsagePercent: (this.stats.totalSize / this.maxMemory) * 100,
      itemUsagePercent: (this.cache.size / this.maxSize) * 100
    };
  }

  /**
   * Get top accessed items
   */
  getTopItems(limit: number = 10): Array<{ key: string; accessCount: number; size: number }> {
    const items: Array<{ key: string; accessCount: number; size: number }> = [];
    
    for (const [key, item] of this.cache) {
      items.push({
        key,
        accessCount: item.accessCount,
        size: item.size
      });
    }

    return items
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Prune expired items manually
   */
  prune(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, item] of this.cache) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        this.stats.totalSize -= item.size;
        this.stats.itemCount--;
        this.stats.evictions++;
        pruned++;
      }
    }

    return pruned;
  }

  /**
   * Private: Calculate size of data
   */
  private calculateSize(data: T): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback for non-serializable data
      return 1024; // 1KB default
    }
  }

  /**
   * Private: Evict items if needed (LRU strategy)
   */
  private evictIfNeeded(newItemSize: number): void {
    // Check size limits
    while (
      this.cache.size >= this.maxSize ||
      this.stats.totalSize + newItemSize > this.maxMemory
    ) {
      this.evictLRU();
    }
  }

  /**
   * Private: Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const item = this.cache.get(oldestKey)!;
      this.cache.delete(oldestKey);
      this.stats.totalSize -= item.size;
      this.stats.itemCount--;
      this.stats.evictions++;
    }
  }

  /**
   * Private: Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Private: Update general stats
   */
  private updateStats(): void {
    this.stats.itemCount = this.cache.size;
    this.updateHitRate();
  }

  /**
   * Private: Start automatic cleanup
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.prune();
    }, 60000); // Clean every minute
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Global cache instances for different data types
export const marketDataCache = new OptimizedCache<any>(500, 20 * 1024 * 1024, 30000); // 30s TTL
export const portfolioCache = new OptimizedCache<any>(100, 5 * 1024 * 1024, 60000); // 1min TTL
export const apiResponseCache = new OptimizedCache<any>(1000, 30 * 1024 * 1024, 300000); // 5min TTL
export const userPreferencesCache = new OptimizedCache<any>(50, 1 * 1024 * 1024, 3600000); // 1hr TTL

// Cache manager for monitoring all caches
export class CacheManager {
  private caches: Map<string, OptimizedCache<any>> = new Map();

  constructor() {
    this.caches.set('marketData', marketDataCache);
    this.caches.set('portfolio', portfolioCache);
    this.caches.set('apiResponse', apiResponseCache);
    this.caches.set('userPreferences', userPreferencesCache);
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    
    for (const [name, cache] of this.caches) {
      stats[name] = {
        ...cache.getStats(),
        ...cache.getSizeInfo(),
        topItems: cache.getTopItems(5)
      };
    }

    return stats;
  }

  getOverallStats() {
    let totalHits = 0;
    let totalMisses = 0;
    let totalSize = 0;
    let totalItems = 0;

    for (const cache of this.caches.values()) {
      const stats = cache.getStats();
      totalHits += stats.hits;
      totalMisses += stats.misses;
      totalSize += stats.totalSize;
      totalItems += stats.itemCount;
    }

    return {
      totalHits,
      totalMisses,
      totalSize,
      totalItems,
      overallHitRate: totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0,
      cacheCount: this.caches.size
    };
  }

  pruneAll(): number {
    let totalPruned = 0;
    for (const cache of this.caches.values()) {
      totalPruned += cache.prune();
    }
    return totalPruned;
  }

  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }
}

export const cacheManager = new CacheManager();