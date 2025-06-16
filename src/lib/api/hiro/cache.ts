// Intelligent Cache System for Hiro APIs

import { CacheConfig, CacheEntry } from './types'
import { logger } from '@/lib/logger'

export class HiroCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private config: Required<CacheConfig>
  private accessOrder: string[] = []

  constructor(config: CacheConfig) {
    this.config = {
      ttl: config.ttl,
      maxSize: config.maxSize || 1000,
      strategy: config.strategy || 'LRU'
    }
  }

  // Get cached data
  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key)
      return null
    }

    // Update access order for LRU
    if (this.config.strategy === 'LRU') {
      this.updateAccessOrder(key)
    }

    // Increment hit count
    entry.hits++

    logger.debug(`Cache hit for key: ${key}`)
    return entry.data
  }

  // Set cache data
  set(key: string, data: T, customTTL?: number): void {
    // Check cache size limit
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evict()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTTL || this.config.ttl,
      hits: 0
    }

    this.cache.set(key, entry)
    this.updateAccessOrder(key)

    logger.debug(`Cache set for key: ${key}`)
  }

  // Delete specific entry
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.accessOrder = this.accessOrder.filter(k => k !== key)
    }
    return deleted
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    logger.info('Cache cleared')
  }

  // Get cache size
  size(): number {
    return this.cache.size
  }

  // Get cache stats
  getStats(): {
    size: number
    hits: number
    misses: number
    hitRate: number
    entries: Array<{ key: string; hits: number; age: number }>
  } {
    let totalHits = 0
    const entries: Array<{ key: string; hits: number; age: number }> = []

    this.cache.forEach((entry, key) => {
      totalHits += entry.hits
      entries.push({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp
      })
    })

    const totalRequests = totalHits + entries.length // Approximate
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0

    return {
      size: this.cache.size,
      hits: totalHits,
      misses: entries.length, // Approximate
      hitRate,
      entries: entries.sort((a, b) => b.hits - a.hits).slice(0, 10) // Top 10
    }
  }

  // Check if entry is expired
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000
  }

  // Update access order for LRU
  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key)
    this.accessOrder.push(key)
  }

  // Evict entries based on strategy
  private evict(): void {
    if (this.config.strategy === 'LRU') {
      // Remove least recently used
      if (this.accessOrder.length > 0) {
        const keyToRemove = this.accessOrder[0]
        this.delete(keyToRemove)
        logger.debug(`Evicted LRU key: ${keyToRemove}`)
      }
    } else if (this.config.strategy === 'FIFO') {
      // Remove oldest entry
      let oldestKey: string | null = null
      let oldestTime = Infinity

      this.cache.forEach((entry, key) => {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp
          oldestKey = key
        }
      })

      if (oldestKey) {
        this.delete(oldestKey)
        logger.debug(`Evicted FIFO key: ${oldestKey}`)
      }
    }
  }

  // Batch get multiple keys
  getMany(keys: string[]): Map<string, T> {
    const results = new Map<string, T>()
    
    keys.forEach(key => {
      const data = this.get(key)
      if (data !== null) {
        results.set(key, data)
      }
    })

    return results
  }

  // Batch set multiple entries
  setMany(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl)
    })
  }

  // Invalidate entries matching pattern
  invalidatePattern(pattern: RegExp): number {
    let invalidated = 0
    
    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        this.delete(key)
        invalidated++
      }
    })

    logger.info(`Invalidated ${invalidated} cache entries matching pattern`)
    return invalidated
  }

  // Prune expired entries
  prune(): number {
    let pruned = 0
    
    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.delete(key)
        pruned++
      }
    })

    logger.info(`Pruned ${pruned} expired cache entries`)
    return pruned
  }
}

// Cache Manager for different API endpoints
export class HiroCacheManager {
  private caches: Map<string, HiroCache> = new Map()

  constructor() {
    // Initialize caches for different endpoints with specific configs
    this.initializeCaches()
    
    // Start periodic pruning
    this.startPruning()
  }

  private initializeCaches(): void {
    // Runes cache - 5 minutes TTL
    this.caches.set('runes', new HiroCache({
      ttl: 300,
      maxSize: 500,
      strategy: 'LRU'
    }))

    // Ordinals cache - 2 minutes TTL
    this.caches.set('ordinals', new HiroCache({
      ttl: 120,
      maxSize: 1000,
      strategy: 'LRU'
    }))

    // BRC-20 cache - 5 minutes TTL
    this.caches.set('brc20', new HiroCache({
      ttl: 300,
      maxSize: 500,
      strategy: 'LRU'
    }))

    // Stats cache - 1 minute TTL
    this.caches.set('stats', new HiroCache({
      ttl: 60,
      maxSize: 100,
      strategy: 'FIFO'
    }))

    // Activity cache - 30 seconds TTL
    this.caches.set('activity', new HiroCache({
      ttl: 30,
      maxSize: 200,
      strategy: 'FIFO'
    }))
  }

  private startPruning(): void {
    // Prune expired entries every 5 minutes
    setInterval(() => {
      this.caches.forEach((cache, name) => {
        const pruned = cache.prune()
        if (pruned > 0) {
          logger.debug(`Pruned ${pruned} entries from ${name} cache`)
        }
      })
    }, 5 * 60 * 1000)
  }

  getCache(name: string): HiroCache | undefined {
    return this.caches.get(name)
  }

  clearAll(): void {
    this.caches.forEach(cache => cache.clear())
  }

  getStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    this.caches.forEach((cache, name) => {
      stats[name] = cache.getStats()
    })

    return stats
  }
}

// Singleton instance
export const hiroCacheManager = new HiroCacheManager()