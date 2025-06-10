import Redis from 'ioredis';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = {
      keyPrefix: 'rate_limit:',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };
  }

  /**
   * Generate a unique key for rate limiting
   */
  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyPrefix + this.config.keyGenerator(req);
    }

    // Default key generation based on IP and user ID
    const ip = this.getClientIP(req);
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const endpoint = new URL(req.url).pathname;
    
    return `${this.config.keyPrefix}${ip}:${userId}:${endpoint}`;
  }

  /**
   * Extract client IP from request
   */
  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    // Fallback to a hash of headers for unique identification
    const headers = JSON.stringify({
      'user-agent': req.headers.get('user-agent'),
      'accept-language': req.headers.get('accept-language'),
      'accept-encoding': req.headers.get('accept-encoding')
    });
    
    return crypto.createHash('sha256').update(headers).digest('hex').substring(0, 16);
  }

  /**
   * Check if request is allowed based on rate limit
   */
  async checkLimit(req: NextRequest): Promise<RateLimitResult> {
    const key = this.generateKey(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Use Redis pipeline for atomic operations
    const pipeline = this.redis.pipeline();
    
    // Remove old entries
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    
    // Count current requests in window
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${crypto.randomBytes(4).toString('hex')}`);
    
    // Set expiry
    pipeline.expire(key, Math.ceil(this.config.windowMs / 1000));
    
    // Get the oldest request time
    pipeline.zrange(key, 0, 0, 'WITHSCORES');
    
    const results = await pipeline.exec();
    
    if (!results) {
      throw new Error('Redis pipeline execution failed');
    }
    
    const count = results[1][1] as number;
    const oldestRequest = results[4][1] as string[];
    
    const allowed = count <= this.config.maxRequests;
    const remaining = Math.max(0, this.config.maxRequests - count);
    const resetAt = oldestRequest.length > 1 
      ? new Date(parseInt(oldestRequest[1]) + this.config.windowMs)
      : new Date(now + this.config.windowMs);
    
    const result: RateLimitResult = {
      allowed,
      remaining,
      resetAt
    };
    
    if (!allowed) {
      result.retryAfter = Math.ceil((resetAt.getTime() - now) / 1000);
    }
    
    return result;
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(req: NextRequest): Promise<void> {
    const key = this.generateKey(req);
    await this.redis.del(key);
  }

  /**
   * Create middleware for Express/Next.js
   */
  middleware() {
    return async (req: NextRequest) => {
      const result = await this.checkLimit(req);
      
      // Add rate limit headers
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', this.config.maxRequests.toString());
      headers.set('X-RateLimit-Remaining', result.remaining.toString());
      headers.set('X-RateLimit-Reset', result.resetAt.toISOString());
      
      if (!result.allowed) {
        headers.set('Retry-After', result.retryAfter!.toString());
        
        return new Response(JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: result.retryAfter
        }), {
          status: 429,
          headers
        });
      }
      
      return { headers, allowed: true };
    };
  }
}

/**
 * Create rate limiter instances for different endpoints
 */
export function createRateLimiters(redis: Redis) {
  return {
    // General API rate limit
    api: new RateLimiter(redis, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyPrefix: 'api:'
    }),
    
    // Strict rate limit for authentication
    auth: new RateLimiter(redis, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      keyPrefix: 'auth:'
    }),
    
    // Trading operations rate limit
    trading: new RateLimiter(redis, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
      keyPrefix: 'trading:'
    }),
    
    // Wallet operations rate limit
    wallet: new RateLimiter(redis, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20,
      keyPrefix: 'wallet:'
    }),
    
    // Data export rate limit
    export: new RateLimiter(redis, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      keyPrefix: 'export:'
    })
  };
}

/**
 * Dynamic rate limiting based on user tier
 */
export class TieredRateLimiter extends RateLimiter {
  private tiers: Map<string, { windowMs: number; maxRequests: number }>;
  
  constructor(redis: Redis, tiers: Record<string, { windowMs: number; maxRequests: number }>) {
    super(redis, {
      windowMs: 60 * 1000,
      maxRequests: 10
    });
    
    this.tiers = new Map(Object.entries(tiers));
  }
  
  async checkLimit(req: NextRequest): Promise<RateLimitResult> {
    const userTier = req.headers.get('x-user-tier') || 'free';
    const tierConfig = this.tiers.get(userTier) || this.config;
    
    // Update config based on user tier
    this.config = {
      ...this.config,
      ...tierConfig
    };
    
    return super.checkLimit(req);
  }
}

/**
 * Distributed rate limiting with sliding window
 */
export class DistributedRateLimiter {
  private redis: Redis;
  private script: string;
  
  constructor(redis: Redis) {
    this.redis = redis;
    
    // Lua script for atomic sliding window rate limiting
    this.script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local window = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])
      
      local clearBefore = now - window
      
      redis.call('zremrangebyscore', key, 0, clearBefore)
      
      local current = redis.call('zcard', key)
      if current < limit then
        redis.call('zadd', key, now, now)
        redis.call('expire', key, window)
        return {1, limit - current - 1}
      else
        return {0, 0}
      end
    `;
  }
  
  async isAllowed(key: string, windowMs: number, limit: number): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    const result = await this.redis.eval(
      this.script,
      1,
      key,
      now.toString(),
      windowMs.toString(),
      limit.toString()
    ) as [number, number];
    
    return {
      allowed: result[0] === 1,
      remaining: result[1]
    };
  }
}