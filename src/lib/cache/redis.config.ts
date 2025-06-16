// import { Redis } from '@upstash/redis'

/**
 * Simple in-memory cache implementation as a Redis replacement
 */
class SimpleCache {
  private cache: Map<string, { value: any; expires: number }> = new Map()

  async get(key: string): Promise<any> {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    const expires = options?.ex ? Date.now() + (options.ex * 1000) : 0
    this.cache.set(key, { value, expires })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  async expire(key: string, seconds: number): Promise<void> {
    const item = this.cache.get(key)
    if (item) {
      item.expires = Date.now() + (seconds * 1000)
    }
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    return Array.from(this.cache.keys()).filter(key => regex.test(key))
  }

  async flushall(): Promise<void> {
    this.cache.clear()
  }
}

// Create cache instance
export const redis = new SimpleCache()

// Cache configuration
export const CACHE_CONFIG = {
  TTL: {
    DEFAULT: 300, // 5 minutes
    PRICE: 60, // 1 minute
    MARKET_DATA: 300, // 5 minutes
    ORDINALS: 600, // 10 minutes
    RUNES: 600, // 10 minutes
    USER_DATA: 1800, // 30 minutes
  },
  KEYS: {
    BITCOIN_PRICE: 'bitcoin:price',
    MARKET_DATA: 'market:data',
    ORDINALS_LIST: 'ordinals:list',
    RUNES_LIST: 'runes:list',
    USER_PORTFOLIO: 'user:portfolio',
  }
}

export default redis