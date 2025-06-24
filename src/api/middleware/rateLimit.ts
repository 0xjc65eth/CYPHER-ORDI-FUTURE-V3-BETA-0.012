/**
 * Rate Limiting Middleware
 * Advanced rate limiting with Redis backend and user-based quotas
 */

import { Request, Response, NextFunction } from 'express';
import { EnhancedLogger } from '@/lib/enhanced-logger';


interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  statusCode?: number;
  headers?: boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

interface RateLimitStore {
  get(key: string): Promise<number | null>;
  set(key: string, value: number, ttl: number): Promise<void>;
  increment(key: string, ttl: number): Promise<number>;
  reset(key: string): Promise<void>;
}

/**
 * In-memory rate limit store (would use Redis in production)
 */
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async get(key: string): Promise<number | null> {
    const record = this.store.get(key);
    if (!record || Date.now() > record.resetTime) {
      this.store.delete(key);
      return null;
    }
    return record.count;
  }

  async set(key: string, value: number, ttl: number): Promise<void> {
    this.store.set(key, {
      count: value,
      resetTime: Date.now() + ttl
    });
  }

  async increment(key: string, ttl: number): Promise<number> {
    const record = this.store.get(key);
    const now = Date.now();

    if (!record || now > record.resetTime) {
      const newRecord = { count: 1, resetTime: now + ttl };
      this.store.set(key, newRecord);
      return 1;
    }

    record.count++;
    this.store.set(key, record);
    return record.count;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const memoryStore = new MemoryStore();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  memoryStore.cleanup();
}, 5 * 60 * 1000);

/**
 * Create rate limiting middleware
 */
export const rateLimit = (config: RateLimitConfig) => {
  const {
    maxRequests,
    windowMs,
    keyGenerator = (req) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later',
    statusCode = 429,
    headers = true,
    onLimitReached
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      const current = await memoryStore.increment(key, windowMs);

      if (headers) {
        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, maxRequests - current).toString(),
          'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
        });
      }

      if (current > maxRequests) {
        EnhancedLogger.warn('Rate limit exceeded', {
          key,
          current,
          limit: maxRequests,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        if (onLimitReached) {
          onLimitReached(req, res);
        }

        return res.status(statusCode).json({
          success: false,
          error: message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      // Track response status for conditional counting
      const originalSend = res.send;
      res.send = function(data) {
        const shouldSkip = 
          (skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400);

        if (shouldSkip) {
          memoryStore.increment(key, windowMs).then(count => {
            // Decrement if we shouldn't count this request
            if (count > 1) {
              memoryStore.set(key, count - 1, windowMs);
            }
          });
        }

        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      EnhancedLogger.error('Rate limiting error:', error);
      next(); // Continue on error to avoid blocking requests
    }
  };
};

/**
 * User-based rate limiting
 */
export const userRateLimit = (config: Omit<RateLimitConfig, 'keyGenerator'>) => {
  return rateLimit({
    ...config,
    keyGenerator: (req) => {
      const userId = req.body?.userId || req.params?.userId || req.query?.userId;
      return userId ? `user:${userId}` : `ip:${req.ip}`;
    }
  });
};

/**
 * API endpoint rate limiting
 */
export const endpointRateLimit = (config: Omit<RateLimitConfig, 'keyGenerator'>) => {
  return rateLimit({
    ...config,
    keyGenerator: (req) => {
      const endpoint = req.route ? req.route.path : req.path;
      const method = req.method;
      return `endpoint:${method}:${endpoint}:${req.ip}`;
    }
  });
};

/**
 * Sliding window rate limiter
 */
export const slidingWindowRateLimit = (config: RateLimitConfig) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `sliding:${config.keyGenerator ? config.keyGenerator(req) : req.ip}`;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // This would use Redis ZSET in production for better performance
      const requests = await getSlidingWindowCount(key, windowStart, now);

      if (requests >= config.maxRequests) {
        EnhancedLogger.warn('Sliding window rate limit exceeded', {
          key,
          requests,
          limit: config.maxRequests
        });

        return res.status(config.statusCode || 429).json({
          success: false,
          error: config.message || 'Rate limit exceeded',
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
      }

      // Record this request
      await recordSlidingWindowRequest(key, now);

      if (config.headers) {
        res.set({
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, config.maxRequests - requests - 1).toString(),
          'X-RateLimit-Window': config.windowMs.toString()
        });
      }

      next();
    } catch (error) {
      EnhancedLogger.error('Sliding window rate limiting error:', error);
      next();
    }
  };
};

// Mock sliding window functions (would use Redis in production)
const slidingWindows = new Map<string, number[]>();

async function getSlidingWindowCount(key: string, windowStart: number, now: number): Promise<number> {
  const requests = slidingWindows.get(key) || [];
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  slidingWindows.set(key, validRequests);
  return validRequests.length;
}

async function recordSlidingWindowRequest(key: string, timestamp: number): Promise<void> {
  const requests = slidingWindows.get(key) || [];
  requests.push(timestamp);
  slidingWindows.set(key, requests);
}

/**
 * Predefined rate limiters
 */
export const rateLimiters = {
  // Strict limits for sensitive operations
  strict: rateLimit({
    maxRequests: 10,
    windowMs: 60000, // 1 minute
    message: 'Too many requests for sensitive operation'
  }),

  // Standard API limits
  standard: rateLimit({
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    message: 'API rate limit exceeded'
  }),

  // Generous limits for public endpoints
  generous: rateLimit({
    maxRequests: 1000,
    windowMs: 60000, // 1 minute
    message: 'Rate limit exceeded'
  }),

  // Trading-specific limits
  trading: userRateLimit({
    maxRequests: 500,
    windowMs: 60000, // 1 minute
    message: 'Trading rate limit exceeded',
    skipSuccessfulRequests: false
  }),

  // Authentication limits
  auth: rateLimit({
    maxRequests: 5,
    windowMs: 15 * 60000, // 15 minutes
    keyGenerator: (req) => `auth:${req.ip}`,
    message: 'Too many authentication attempts'
  })
};

export default {
  rateLimit,
  userRateLimit,
  endpointRateLimit,
  slidingWindowRateLimit,
  rateLimiters
};