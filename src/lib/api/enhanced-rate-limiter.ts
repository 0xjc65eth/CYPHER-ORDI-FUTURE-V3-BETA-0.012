/**
 * Enhanced Rate Limiter for CoinMarketCap API Integration
 * Provides intelligent rate limiting with backoff, caching, and quota management
 */

import { logger } from '@/lib/logger';

export interface RateLimitConfig {
  name: string;
  maxRequests: number;
  windowMs: number;
  backoffMs?: number;
  burstLimit?: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class EnhancedRateLimiter {
  private requests = new Map<string, number[]>();
  private backoffUntil = new Map<string, number>();
  private configs = new Map<string, RateLimitConfig>();
  private burstTokens = new Map<string, number>();

  constructor() {
    this.setupDefaultLimits();
  }

  private setupDefaultLimits(): void {
    // CoinMarketCap Rate Limits (Conservative for Safety)
    this.setLimit({
      name: 'coinmarketcap',
      maxRequests: 25,     // 333/month = ~25/day for safety
      windowMs: 86400000,  // 24 hours (daily limit)
      backoffMs: 300000,   // 5 minute backoff on rate limit
      burstLimit: 5        // Allow 5 burst requests per hour
    });

    this.setLimit({
      name: 'coinmarketcap-minute',
      maxRequests: 10,     // Max 10 per minute
      windowMs: 60000,     // 1 minute
      backoffMs: 60000,    // 1 minute backoff
      burstLimit: 3
    });

    // Fallback APIs
    this.setLimit({
      name: 'coingecko',
      maxRequests: 50,
      windowMs: 60000,     // 1 minute
      backoffMs: 30000,    // 30 second backoff
      burstLimit: 10
    });

    this.setLimit({
      name: 'binance',
      maxRequests: 1200,
      windowMs: 60000,     // 1 minute (Binance allows 1200/min)
      backoffMs: 10000,    // 10 second backoff
      burstLimit: 100
    });

    logger.info('Enhanced rate limiter initialized with CoinMarketCap optimizations');
  }

  setLimit(config: RateLimitConfig): void {
    this.configs.set(config.name, config);
    // Initialize burst tokens
    if (config.burstLimit) {
      this.burstTokens.set(config.name, config.burstLimit);
    }
  }

  checkLimit(apiName: string): RateLimitStatus {
    const config = this.configs.get(apiName);
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }

    const now = Date.now();

    // Check if we're in backoff period
    const backoffUntil = this.backoffUntil.get(apiName);
    if (backoffUntil && now < backoffUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: backoffUntil,
        retryAfter: backoffUntil - now
      };
    }

    // Clean old requests
    const requests = this.requests.get(apiName) || [];
    const validRequests = requests.filter(timestamp => now - timestamp < config.windowMs);
    this.requests.set(apiName, validRequests);

    const remaining = config.maxRequests - validRequests.length;

    // Check main limit
    if (remaining <= 0) {
      // Set backoff if configured
      if (config.backoffMs) {
        this.backoffUntil.set(apiName, now + config.backoffMs);
      }
      
      const resetTime = now + config.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: config.backoffMs || config.windowMs
      };
    }

    // Check burst limit
    if (config.burstLimit) {
      const burstTokens = this.burstTokens.get(apiName) || 0;
      if (burstTokens <= 0) {
        // Regenerate burst tokens over time
        const lastRequest = validRequests[validRequests.length - 1] || 0;
        const timeSinceLastRequest = now - lastRequest;
        const tokensToAdd = Math.floor(timeSinceLastRequest / (config.windowMs / config.burstLimit));
        const newTokens = Math.min(config.burstLimit, burstTokens + tokensToAdd);
        this.burstTokens.set(apiName, newTokens);
        
        if (newTokens <= 0) {
          return {
            allowed: false,
            remaining,
            resetTime: now + (config.windowMs / config.burstLimit),
            retryAfter: config.windowMs / config.burstLimit
          };
        }
      }
    }

    return {
      allowed: true,
      remaining,
      resetTime: now + config.windowMs
    };
  }

  recordRequest(apiName: string): boolean {
    const status = this.checkLimit(apiName);
    if (!status.allowed) {
      return false;
    }

    const now = Date.now();
    const requests = this.requests.get(apiName) || [];
    requests.push(now);
    this.requests.set(apiName, requests);

    // Consume burst token if applicable
    const config = this.configs.get(apiName);
    if (config?.burstLimit) {
      const currentTokens = this.burstTokens.get(apiName) || 0;
      this.burstTokens.set(apiName, Math.max(0, currentTokens - 1));
    }

    logger.debug(`Rate limit recorded for ${apiName}, remaining: ${status.remaining - 1}`);
    return true;
  }

  getStatus(apiName: string): RateLimitStatus {
    return this.checkLimit(apiName);
  }

  getAllStatus(): Map<string, RateLimitStatus> {
    const status = new Map<string, RateLimitStatus>();
    for (const [name] of this.configs) {
      status.set(name, this.getStatus(name));
    }
    return status;
  }

  clearBackoff(apiName: string): void {
    this.backoffUntil.delete(apiName);
    logger.info(`Cleared backoff for ${apiName}`);
  }

  clearAllBackoffs(): void {
    this.backoffUntil.clear();
    logger.info('Cleared all rate limit backoffs');
  }

  reset(apiName?: string): void {
    if (apiName) {
      this.requests.delete(apiName);
      this.backoffUntil.delete(apiName);
      // Reset burst tokens
      const config = this.configs.get(apiName);
      if (config?.burstLimit) {
        this.burstTokens.set(apiName, config.burstLimit);
      }
      logger.info(`Reset rate limiter for ${apiName}`);
    } else {
      this.requests.clear();
      this.backoffUntil.clear();
      // Reset all burst tokens
      for (const [name, config] of this.configs) {
        if (config.burstLimit) {
          this.burstTokens.set(name, config.burstLimit);
        }
      }
      logger.info('Reset all rate limiters');
    }
  }

  getStats(): {
    apis: Array<{
      name: string;
      config: RateLimitConfig;
      status: RateLimitStatus;
      requestCount: number;
      burstTokens?: number;
    }>;
  } {
    const stats: any[] = [];
    
    for (const [name, config] of this.configs) {
      const status = this.getStatus(name);
      const requests = this.requests.get(name) || [];
      const burstTokens = this.burstTokens.get(name);
      
      stats.push({
        name,
        config,
        status,
        requestCount: requests.length,
        ...(burstTokens !== undefined && { burstTokens })
      });
    }

    return { apis: stats };
  }
}

// Export singleton instance
export const enhancedRateLimiter = new EnhancedRateLimiter();
export default enhancedRateLimiter;