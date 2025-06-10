import { NextRequest } from 'next/server';
import { redis } from '@/lib/cache/redis.config';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipFailedRequests?: boolean; // Don't count failed requests
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  message?: string; // Custom error message
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      skipFailedRequests: false,
      skipSuccessfulRequests: false,
      message: 'Too many requests, please try again later.',
      ...config
    };
  }

  async check(req: NextRequest): Promise<RateLimitResult> {
    const key = this.generateKey(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current requests in the window
      const requests = await this.getRequestsInWindow(key, windowStart, now);
      
      // Check if limit exceeded
      if (requests >= this.config.maxRequests) {
        const resetTime = await this.getWindowResetTime(key);
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime - now) / 1000)
        };
      }

      // Increment counter
      await this.incrementCounter(key, now);

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - requests - 1,
        resetTime: now + this.config.windowMs
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // In case of error, allow the request
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
  }

  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }

    // Default key generation based on IP and path
    const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const path = req.nextUrl.pathname;
    return `rate_limit:${ip}:${path}`;
  }

  private async getRequestsInWindow(key: string, windowStart: number, now: number): Promise<number> {
    const windowKey = `${key}:${Math.floor(now / this.config.windowMs)}`;
    const count = await redis.get(windowKey);
    return count ? parseInt(count) : 0;
  }

  private async incrementCounter(key: string, now: number): Promise<void> {
    const windowKey = `${key}:${Math.floor(now / this.config.windowMs)}`;
    const current = await redis.get(windowKey);
    const newValue = current ? parseInt(current) + 1 : 1;
    
    await redis.set(windowKey, newValue.toString(), { 
      ex: Math.ceil(this.config.windowMs / 1000) 
    });
  }

  private async getWindowResetTime(key: string): Promise<number> {
    const now = Date.now();
    const currentWindow = Math.floor(now / this.config.windowMs);
    return (currentWindow + 1) * this.config.windowMs;
  }
}

// Pre-configured rate limiters for different API endpoints
export const apiRateLimiters = {
  // Standard API endpoints - 100 requests per minute
  standard: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many API requests, please try again later.'
  }),

  // Price data endpoints - 300 requests per minute (higher for real-time data)
  prices: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 300,
    message: 'Too many price requests, please try again later.'
  }),

  // Market data endpoints - 200 requests per minute
  market: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    message: 'Too many market data requests, please try again later.'
  }),

  // Portfolio endpoints - 50 requests per minute (more resource intensive)
  portfolio: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
    message: 'Too many portfolio requests, please try again later.'
  }),

  // WebSocket endpoints - 10 connections per minute per IP
  websocket: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many WebSocket connection attempts, please try again later.'
  }),

  // AI endpoints - 20 requests per minute (resource intensive)
  ai: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many AI requests, please try again later.'
  }),

  // Heavy computation endpoints - 5 requests per minute
  heavy: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many computation requests, please try again later.'
  }),

  // Auth endpoints - 10 requests per minute per IP
  auth: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyGenerator: (req) => {
      const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
      return `auth_limit:${ip}`;
    },
    message: 'Too many authentication attempts, please try again later.'
  })
};

// Helper function to apply rate limiting middleware
export async function applyRateLimit(
  req: NextRequest,
  limiter: RateLimiter
): Promise<{ success: true } | { success: false; response: Response }> {
  const result = await limiter.check(req);

  if (!result.success) {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later.',
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          'Retry-After': result.retryAfter?.toString() || '60'
        }
      }
    );

    return { success: false, response };
  }

  return { success: true };
}

// Export the RateLimiter class for custom configurations
export { RateLimiter };