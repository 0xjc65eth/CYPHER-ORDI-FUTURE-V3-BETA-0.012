/**
 * 🌐 API CLIENT - CYPHER ORDi FUTURE V3
 * Cliente HTTP robusto com retry, timeout e error handling
 */

import { API_CONFIG, getServiceHeaders, getEnvironmentConfig } from './api-config';
import { EnhancedLogger } from './enhanced-logger';
import { ErrorReporter } from './ErrorReporter';

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  success: boolean;
  cached?: boolean;
  timestamp: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  retryable: boolean;
}

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
  service?: keyof typeof API_CONFIG;
}

class ApiClient {
  private static instance: ApiClient;
  private cache = new Map<string, { data: any; expires: number }>();
  private rateLimiters = new Map<string, { count: number; resetTime: number }>();
  private config = getEnvironmentConfig();

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  async fetchWithRetry<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_CONFIG.GENERAL.DEFAULT_TIMEOUT,
      retries = API_CONFIG.GENERAL.MAX_RETRIES,
      retryDelay = API_CONFIG.GENERAL.RETRY_DELAY,
      cache = false,
      cacheTTL = API_CONFIG.GENERAL.CACHE_TTL.MARKET_DATA,
      service
    } = config;

    // Check cache first
    if (cache && method === 'GET') {
      const cached = this.getFromCache(url);
      if (cached) {
        EnhancedLogger.debug('Cache hit for request', {
          component: 'ApiClient',
          url,
          cached: true
        });
        return {
          data: cached,
          status: 200,
          headers: {},
          success: true,
          cached: true,
          timestamp: Date.now()
        };
      }
    }

    // Check rate limits
    if (service && !this.checkRateLimit(service)) {
      throw this.createApiError(
        `Rate limit exceeded for service: ${service}`,
        429,
        'RATE_LIMIT_EXCEEDED',
        null,
        false
      );
    }

    let lastError: ApiError | null = null;

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        EnhancedLogger.debug(`API Request attempt ${attempt}`, {
          component: 'ApiClient',
          url,
          method,
          attempt,
          maxAttempts: retries + 1
        });

        const response = await this.makeRequest<T>(url, {
          method,
          headers: {
            ...getServiceHeaders(service || 'GENERAL'),
            ...headers
          },
          body,
          timeout
        });

        // Cache successful GET requests
        if (cache && method === 'GET' && response.success) {
          this.setCache(url, response.data, cacheTTL);
        }

        // Update rate limiter
        if (service) {
          this.updateRateLimit(service);
        }

        const duration = Date.now() - startTime;
        EnhancedLogger.performance(`API Request completed`, duration, {
          component: 'ApiClient',
          url,
          status: response.status,
          attempt,
          cached: false
        });

        return response;

      } catch (error) {
        lastError = error instanceof Error 
          ? this.createApiError(error.message, undefined, undefined, error, true)
          : error as ApiError;

        EnhancedLogger.error(`API Request failed (attempt ${attempt})`, {
          component: 'ApiClient',
          url,
          method,
          attempt,
          error: lastError.message,
          retryable: lastError.retryable
        });

        // Don't retry on non-retryable errors
        if (!lastError.retryable || attempt === retries + 1) {
          break;
        }

        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await this.sleep(delay);
      }
    }

    // Report the final error
    if (lastError) {
      ErrorReporter.reportAPIError(url, lastError.status || 0, lastError.message);
      throw lastError;
    }

    throw this.createApiError('Unknown error occurred', 500, 'UNKNOWN_ERROR', null, false);
  }

  private async makeRequest<T>(
    url: string,
    config: {
      method: string;
      headers: Record<string, string>;
      body?: any;
      timeout: number;
    }
  ): Promise<ApiResponse<T>> {
    const { method, headers, body, timeout } = config;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestInit: RequestInit = {
        method,
        headers,
        signal: controller.signal
      };

      // Add body for non-GET requests
      if (body && method !== 'GET') {
        requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      const response = await fetch(url, requestInit);
      clearTimeout(timeoutId);

      // Parse response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw this.createApiError(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
          response.status,
          'HTTP_ERROR',
          { responseText: errorText },
          this.isRetryableStatus(response.status)
        );
      }

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      return {
        data,
        status: response.status,
        headers: responseHeaders,
        success: true,
        cached: false,
        timestamp: Date.now()
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createApiError(
            'Request timeout',
            408,
            'TIMEOUT',
            error,
            true
          );
        }
        
        if (error.message.includes('fetch')) {
          throw this.createApiError(
            'Network error',
            0,
            'NETWORK_ERROR',
            error,
            true
          );
        }
      }
      
      throw error;
    }
  }

  private createApiError(
    message: string,
    status?: number,
    code?: string,
    details?: any,
    retryable = true
  ): ApiError {
    return {
      message,
      status,
      code,
      details,
      retryable
    };
  }

  private isRetryableStatus(status: number): boolean {
    // Retry on server errors and some client errors
    return status >= 500 || status === 408 || status === 429;
  }

  private checkRateLimit(service: keyof typeof API_CONFIG): boolean {
    const now = Date.now();
    const rateLimit = this.rateLimiters.get(service as string);
    
    if (!rateLimit) {
      this.rateLimiters.set(service as string, { count: 0, resetTime: now + 60000 });
      return true;
    }

    // Reset if time window has passed
    if (now >= rateLimit.resetTime) {
      rateLimit.count = 0;
      rateLimit.resetTime = now + 60000;
      return true;
    }

    // Check if under limit (simplified - real implementation would use service-specific limits)
    const limit = this.getRateLimitForService(service);
    return rateLimit.count < limit;
  }

  private updateRateLimit(service: keyof typeof API_CONFIG): void {
    const rateLimit = this.rateLimiters.get(service as string);
    if (rateLimit) {
      rateLimit.count++;
    }
  }

  private getRateLimitForService(service: keyof typeof API_CONFIG): number {
    const config = API_CONFIG[service];
    if (config && 'RATE_LIMIT' in config) {
      return (config.RATE_LIMIT as any).REQUESTS_PER_MINUTE || 60;
    }
    return 60; // Default limit
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, data: any, ttlSeconds: number): void {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expires });
    
    // Clean up cache if it gets too large
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].expires - b[1].expires);
      
      // Remove oldest 25% of entries
      const toRemove = entries.slice(0, Math.floor(entries.length * 0.25));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public utility methods
  clearCache(): void {
    this.cache.clear();
    EnhancedLogger.info('API cache cleared', { component: 'ApiClient' });
  }

  getCacheStats(): { size: number; entries: number } {
    const now = Date.now();
    let validEntries = 0;
    
    for (const [, cached] of this.cache) {
      if (cached.expires > now) {
        validEntries++;
      }
    }
    
    return {
      size: this.cache.size,
      entries: validEntries
    };
  }

  getRateLimitStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    const now = Date.now();
    
    for (const [service, limiter] of this.rateLimiters) {
      status[service] = {
        count: limiter.count,
        resetTime: limiter.resetTime,
        timeUntilReset: Math.max(0, limiter.resetTime - now),
        blocked: limiter.count >= this.getRateLimitForService(service as keyof typeof API_CONFIG)
      };
    }
    
    return status;
  }
}

// Convenience functions
export const fetchWithRetry = <T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> => {
  return ApiClient.getInstance().fetchWithRetry<T>(url, config);
};

export const apiClient = ApiClient.getInstance();

export default ApiClient;