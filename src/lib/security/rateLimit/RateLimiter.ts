import Redis from 'ioredis';
import { createHash } from 'crypto';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

type UserTier = 'free' | 'pro' | 'enterprise';

const TIER_LIMITS: Record<UserTier, number> = {
  free: 100,
  pro: 1000,
  enterprise: 10000
};

export class RateLimiter {
  private redis: Redis;
  private luaScript: string;
  private sha: string | null = null;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3
    });

    // Lua script for atomic rate limiting
    this.luaScript = `
      local key = KEYS[1]
      local window = tonumber(ARGV[1])
      local max_requests = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local clear_before = now - window

      -- Remove old entries
      redis.call('ZREMRANGEBYSCORE', key, 0, clear_before)

      -- Count current requests
      local current = redis.call('ZCARD', key)
      
      if current < max_requests then
        -- Add new request
        redis.call('ZADD', key, now, now)
        redis.call('EXPIRE', key, window)
        return {1, max_requests - current - 1, 0}
      else
        -- Get oldest entry
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local reset_time = oldest[2] + window
        return {0, 0, reset_time}
      end
    `;

    this.loadScript();
  }

  private async loadScript(): Promise<void> {
    try {
      this.sha = await this.redis.script('LOAD', this.luaScript);
    } catch (error) {
      console.error('Failed to load Lua script:', error);
    }
  }

  // Standard rate limiting
  async limit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = `${config.keyPrefix || 'ratelimit'}:${identifier}`;
    const now = Date.now();

    try {
      let result;
      
      if (this.sha) {
        try {
          result = await this.redis.evalsha(
            this.sha,
            1,
            key,
            config.windowMs.toString(),
            config.maxRequests.toString(),
            now.toString()
          );
        } catch (error: any) {
          if (error.message.includes('NOSCRIPT')) {
            await this.loadScript();
            result = await this.redis.eval(
              this.luaScript,
              1,
              key,
              config.windowMs.toString(),
              config.maxRequests.toString(),
              now.toString()
            );
          } else {
            throw error;
          }
        }
      } else {
        result = await this.redis.eval(
          this.luaScript,
          1,
          key,
          config.windowMs.toString(),
          config.maxRequests.toString(),
          now.toString()
        );
      }

      const [allowed, remaining, resetTime] = result as [number, number, number];

      return {
        allowed: allowed === 1,
        remaining,
        resetTime,
        retryAfter: allowed === 0 ? Math.ceil((resetTime - now) / 1000) : undefined
      };
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open in case of Redis issues
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs
      };
    }
  }

  // IP-based rate limiting
  async limitByIP(
    ip: string,
    endpoint: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const defaultConfig: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
      keyPrefix: `ip:${endpoint}`,
      ...config
    };

    return this.limit(this.hashIP(ip), defaultConfig);
  }

  // User-based rate limiting with tiers
  async limitByUser(
    userId: string,
    tier: UserTier,
    endpoint: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const tierLimit = TIER_LIMITS[tier];
    
    const defaultConfig: RateLimitConfig = {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: tierLimit,
      keyPrefix: `user:${endpoint}`,
      ...config
    };

    return this.limit(userId, defaultConfig);
  }

  // API key rate limiting
  async limitByApiKey(
    apiKey: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const defaultConfig: RateLimitConfig = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 1000,
      keyPrefix: 'apikey',
      ...config
    };

    return this.limit(this.hashApiKey(apiKey), defaultConfig);
  }

  // Global rate limiting (for DDoS protection)
  async globalLimit(
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const defaultConfig: RateLimitConfig = {
      windowMs: 1000, // 1 second
      maxRequests: 10000,
      keyPrefix: 'global'
    };

    return this.limit('all', { ...defaultConfig, ...config });
  }

  // Dynamic rate limiting based on endpoint
  async limitByEndpoint(
    identifier: string,
    endpoint: string
  ): Promise<RateLimitResult> {
    const endpointConfigs: Record<string, RateLimitConfig> = {
      '/api/trading/execute': {
        windowMs: 1000,
        maxRequests: 10
      },
      '/api/auth/login': {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5
      },
      '/api/data/historical': {
        windowMs: 60 * 1000,
        maxRequests: 100
      },
      '/api/voice/command': {
        windowMs: 60 * 1000,
        maxRequests: 30
      }
    };

    const config = endpointConfigs[endpoint] || {
      windowMs: 60 * 1000,
      maxRequests: 100
    };

    return this.limit(`${endpoint}:${identifier}`, config);
  }

  // Distributed rate limiting with token bucket
  async tokenBucket(
    identifier: string,
    capacity: number,
    refillRate: number
  ): Promise<{ allowed: boolean; tokens: number }> {
    const key = `bucket:${identifier}`;
    const now = Date.now();

    const script = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local requested = tonumber(ARGV[4]) or 1

      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now

      -- Calculate tokens to add
      local elapsed = math.max(0, now - last_refill)
      local tokens_to_add = elapsed * refill_rate / 1000
      tokens = math.min(capacity, tokens + tokens_to_add)

      if tokens >= requested then
        tokens = tokens - requested
        redis.call('HSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, 3600)
        return {1, tokens}
      else
        redis.call('HSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, 3600)
        return {0, tokens}
      end
    `;

    const result = await this.redis.eval(
      script,
      1,
      key,
      capacity.toString(),
      refillRate.toString(),
      now.toString(),
      '1'
    ) as [number, number];

    return {
      allowed: result[0] === 1,
      tokens: result[1]
    };
  }

  // Blacklist management
  async blacklistIP(ip: string, duration: number): Promise<void> {
    const key = `blacklist:ip:${this.hashIP(ip)}`;
    await this.redis.setex(key, duration, '1');
  }

  async isBlacklisted(ip: string): Promise<boolean> {
    const key = `blacklist:ip:${this.hashIP(ip)}`;
    const result = await this.redis.get(key);
    return result === '1';
  }

  // Whitelist management
  async whitelistIP(ip: string): Promise<void> {
    const key = `whitelist:ip:${this.hashIP(ip)}`;
    await this.redis.set(key, '1');
  }

  async isWhitelisted(ip: string): Promise<boolean> {
    const key = `whitelist:ip:${this.hashIP(ip)}`;
    const result = await this.redis.get(key);
    return result === '1';
  }

  // Analytics
  async getStats(identifier: string, window: number): Promise<{
    requests: number;
    blocked: number;
    averageResponseTime: number;
  }> {
    const requestKey = `stats:requests:${identifier}`;
    const blockedKey = `stats:blocked:${identifier}`;
    const responseKey = `stats:response:${identifier}`;

    const now = Date.now();
    const windowStart = now - window;

    const [requests, blocked, responseTimes] = await Promise.all([
      this.redis.zcount(requestKey, windowStart, now),
      this.redis.zcount(blockedKey, windowStart, now),
      this.redis.zrangebyscore(responseKey, windowStart, now)
    ]);

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + parseFloat(time), 0) / responseTimes.length
      : 0;

    return {
      requests,
      blocked,
      averageResponseTime: avgResponseTime
    };
  }

  // Reset limits for testing
  async reset(identifier: string, prefix?: string): Promise<void> {
    const key = `${prefix || 'ratelimit'}:${identifier}`;
    await this.redis.del(key);
  }

  // Hash functions for privacy
  private hashIP(ip: string): string {
    return createHash('sha256')
      .update(ip + (process.env.RATE_LIMIT_SALT || ''))
      .digest('hex')
      .substring(0, 16);
  }

  private hashApiKey(apiKey: string): string {
    return createHash('sha256')
      .update(apiKey)
      .digest('hex')
      .substring(0, 16);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Rate limiter health check failed:', error);
      return false;
    }
  }

  // Cleanup old data
  async cleanup(olderThan: number): Promise<void> {
    const patterns = [
      'ratelimit:*',
      'ip:*',
      'user:*',
      'apikey:*',
      'bucket:*',
      'stats:*'
    ];

    const cutoff = Date.now() - olderThan;

    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      
      for (const key of keys) {
        const type = await this.redis.type(key);
        
        if (type === 'zset') {
          await this.redis.zremrangebyscore(key, 0, cutoff);
          const remaining = await this.redis.zcard(key);
          if (remaining === 0) {
            await this.redis.del(key);
          }
        }
      }
    }
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter(
      process.env.REDIS_URL || 'redis://localhost:6379'
    );
  }
  return rateLimiterInstance;
}