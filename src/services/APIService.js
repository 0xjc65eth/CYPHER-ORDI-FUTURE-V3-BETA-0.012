/**
 * Enterprise API Service
 * Advanced API management with interceptors, authentication, and comprehensive error handling
 * Professional-grade service for managing all API communications
 */

import { 
  securityLogger, 
  checkRateLimit, 
  sanitizeInput, 
  validateApiKey, 
  getSecureHeaders,
  encryptData,
  decryptData 
} from '../utils/security.js';

// ===========================================
// CONFIGURATION AND CONSTANTS
// ===========================================

const API_CONFIG = {
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  MAX_RETRY_DELAY: 10000,
  CACHE_SIZE_LIMIT: 1000,
  QUEUE_SIZE_LIMIT: 100,
  
  // Retry strategies
  RETRY_STRATEGIES: {
    EXPONENTIAL: 'exponential',
    LINEAR: 'linear',
    FIXED: 'fixed'
  },
  
  // Cache TTL presets
  CACHE_TTL: {
    SHORT: 30000,     // 30 seconds
    MEDIUM: 300000,   // 5 minutes
    LONG: 3600000,    // 1 hour
    PERSISTENT: 86400000 // 24 hours
  },
  
  // Request priorities
  PRIORITY: {
    LOW: 1,
    NORMAL: 2,
    HIGH: 3,
    CRITICAL: 4
  }
};

const HTTP_STATUS_CODES = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
};

// ===========================================
// ENTERPRISE API SERVICE CLASS
// ===========================================

export class APIService {
  constructor(config = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || API_CONFIG.DEFAULT_TIMEOUT,
      retries: config.retries || API_CONFIG.MAX_RETRIES,
      retryDelay: config.retryDelay || API_CONFIG.RETRY_DELAY,
      retryStrategy: config.retryStrategy || API_CONFIG.RETRY_STRATEGIES.EXPONENTIAL,
      enableCache: config.enableCache !== false,
      enableQueue: config.enableQueue !== false,
      enableEncryption: config.enableEncryption || false,
      authToken: config.authToken || null,
      ...config
    };

    // Initialize systems
    this.cache = new Map();
    this.requestQueue = new Map(); // Priority-based queue
    this.interceptors = {
      request: [],
      response: []
    };
    this.authHandlers = new Map();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      lastRequestTime: null
    };

    // Bind methods
    this.request = this.request.bind(this);
    this.processQueue = this.processQueue.bind(this);
    this.setupPeriodicCleanup();

    securityLogger({
      event: 'API_SERVICE_INITIALIZED',
      timestamp: new Date().toISOString(),
      config: {
        enableCache: this.config.enableCache,
        enableQueue: this.config.enableQueue,
        enableEncryption: this.config.enableEncryption
      },
      success: true
    });
  }

  // ===========================================
  // CORE REQUEST METHODS
  // ===========================================

  /**
   * Make HTTP request with full feature support
   */
  async request(config) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    try {
      // Validate and prepare request
      const processedConfig = await this.processRequestConfig(config, requestId);
      
      // Check cache first
      if (this.config.enableCache && processedConfig.method === 'GET') {
        const cached = this.getFromCache(processedConfig);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // Check rate limiting
      if (processedConfig.rateLimit) {
        await this.checkRateLimit(processedConfig.rateLimit);
      }

      // Queue request if needed
      if (this.config.enableQueue && processedConfig.priority < API_CONFIG.PRIORITY.CRITICAL) {
        return this.queueRequest(processedConfig);
      }

      // Execute request with retries
      const response = await this.executeRequest(processedConfig);
      
      // Process response
      const processedResponse = await this.processResponse(response, processedConfig);
      
      // Cache successful GET requests
      if (this.config.enableCache && 
          processedConfig.method === 'GET' && 
          processedConfig.cacheTTL && 
          response.ok) {
        this.setCache(processedConfig, processedResponse, processedConfig.cacheTTL);
      }

      // Update metrics
      this.updateMetrics(startTime, true);
      
      securityLogger({
        event: 'API_REQUEST_SUCCESS',
        timestamp: new Date().toISOString(),
        requestId,
        url: processedConfig.url,
        method: processedConfig.method,
        responseTime: Date.now() - startTime,
        success: true
      });

      return processedResponse;

    } catch (error) {
      this.updateMetrics(startTime, false);
      
      securityLogger({
        event: 'API_REQUEST_FAILED',
        timestamp: new Date().toISOString(),
        requestId,
        error: error.message,
        success: false
      });

      throw this.handleError(error, config);
    }
  }

  /**
   * GET request
   */
  async get(url, config = {}) {
    return this.request({
      method: 'GET',
      url,
      ...config
    });
  }

  /**
   * POST request
   */
  async post(url, data = null, config = {}) {
    return this.request({
      method: 'POST',
      url,
      data,
      ...config
    });
  }

  /**
   * PUT request
   */
  async put(url, data = null, config = {}) {
    return this.request({
      method: 'PUT',
      url,
      data,
      ...config
    });
  }

  /**
   * DELETE request
   */
  async delete(url, config = {}) {
    return this.request({
      method: 'DELETE',
      url,
      ...config
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data = null, config = {}) {
    return this.request({
      method: 'PATCH',
      url,
      data,
      ...config
    });
  }

  // ===========================================
  // REQUEST PROCESSING
  // ===========================================

  /**
   * Process and validate request configuration
   */
  async processRequestConfig(config, requestId) {
    if (!config.url) {
      throw new Error('URL is required');
    }

    // Sanitize URL
    const url = sanitizeInput(config.url);
    
    // Build complete configuration
    const processedConfig = {
      method: (config.method || 'GET').toUpperCase(),
      url: this.buildURL(url, config.params),
      headers: await this.buildHeaders(config.headers),
      data: config.data,
      timeout: config.timeout || this.config.timeout,
      retries: config.retries || this.config.retries,
      retryDelay: config.retryDelay || this.config.retryDelay,
      retryStrategy: config.retryStrategy || this.config.retryStrategy,
      cacheTTL: config.cacheTTL,
      rateLimit: config.rateLimit,
      priority: config.priority || API_CONFIG.PRIORITY.NORMAL,
      requestId,
      ...config
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      await interceptor(processedConfig);
    }

    return processedConfig;
  }

  /**
   * Execute HTTP request with retry logic
   */
  async executeRequest(config) {
    let lastError;
    
    for (let attempt = 0; attempt < config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        // Prepare request options
        const requestOptions = {
          method: config.method,
          headers: config.headers,
          signal: controller.signal
        };

        // Add body for non-GET requests
        if (config.data && config.method !== 'GET') {
          if (config.headers['Content-Type']?.includes('application/json')) {
            requestOptions.body = JSON.stringify(config.data);
          } else if (config.data instanceof FormData) {
            requestOptions.body = config.data;
          } else {
            requestOptions.body = config.data;
          }
        }

        const response = await fetch(config.url, requestOptions);
        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${HTTP_STATUS_CODES[response.status] || 'Unknown error'}`);
        }

        return response;

      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // Calculate retry delay
        const delay = this.calculateRetryDelay(attempt, config);
        
        // Log retry attempt
        securityLogger({
          event: 'API_REQUEST_RETRY',
          timestamp: new Date().toISOString(),
          requestId: config.requestId,
          attempt: attempt + 1,
          maxRetries: config.retries,
          delay,
          error: error.message
        });

        // Wait before retry
        if (attempt < config.retries - 1) {
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Process response data
   */
  async processResponse(response, config) {
    let data;

    // Parse response based on content type
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = await response.text();
    } else {
      data = await response.arrayBuffer();
    }

    // Create response object
    const processedResponse = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      config
    };

    // Apply response interceptors
    for (const interceptor of this.interceptors.response) {
      await interceptor(processedResponse);
    }

    // Decrypt data if needed
    if (this.config.enableEncryption && config.encrypt && data.encrypted) {
      try {
        processedResponse.data = decryptData(data, config.encryptionKey);
      } catch (error) {
        securityLogger({
          event: 'RESPONSE_DECRYPTION_FAILED',
          timestamp: new Date().toISOString(),
          error: error.message,
          success: false
        });
      }
    }

    return processedResponse;
  }

  // ===========================================
  // AUTHENTICATION HANDLING
  // ===========================================

  /**
   * Set authentication token
   */
  setAuthToken(token, type = 'Bearer') {
    this.config.authToken = { token, type };
    
    securityLogger({
      event: 'AUTH_TOKEN_SET',
      timestamp: new Date().toISOString(),
      type,
      success: true
    });
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    this.config.authToken = null;
    
    securityLogger({
      event: 'AUTH_TOKEN_CLEARED',
      timestamp: new Date().toISOString(),
      success: true
    });
  }

  /**
   * Register authentication handler
   */
  registerAuthHandler(name, handler) {
    this.authHandlers.set(name, handler);
  }

  /**
   * Handle authentication refresh
   */
  async refreshAuth(config) {
    const authHandler = this.authHandlers.get('refresh');
    if (authHandler) {
      try {
        const newToken = await authHandler();
        this.setAuthToken(newToken);
        return true;
      } catch (error) {
        securityLogger({
          event: 'AUTH_REFRESH_FAILED',
          timestamp: new Date().toISOString(),
          error: error.message,
          success: false
        });
        return false;
      }
    }
    return false;
  }

  // ===========================================
  // INTERCEPTORS
  // ===========================================

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    if (typeof interceptor === 'function') {
      this.interceptors.request.push(interceptor);
    }
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    if (typeof interceptor === 'function') {
      this.interceptors.response.push(interceptor);
    }
  }

  /**
   * Remove request interceptor
   */
  removeRequestInterceptor(interceptor) {
    const index = this.interceptors.request.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.request.splice(index, 1);
    }
  }

  /**
   * Remove response interceptor
   */
  removeResponseInterceptor(interceptor) {
    const index = this.interceptors.response.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.response.splice(index, 1);
    }
  }

  // ===========================================
  // CACHING SYSTEM
  // ===========================================

  /**
   * Get data from cache
   */
  getFromCache(config) {
    const key = this.getCacheKey(config);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set data in cache
   */
  setCache(config, data, ttl) {
    const key = this.getCacheKey(config);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      url: config.url,
      method: config.method
    });

    // Cleanup if cache is too large
    if (this.cache.size > API_CONFIG.CACHE_SIZE_LIMIT) {
      this.cleanupCache();
    }
  }

  /**
   * Generate cache key
   */
  getCacheKey(config) {
    const url = config.url;
    const method = config.method;
    const data = config.data ? JSON.stringify(config.data) : '';
    
    return `${method}:${url}:${data}`;
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    });

    // If still too large, remove oldest entries
    if (this.cache.size > API_CONFIG.CACHE_SIZE_LIMIT) {
      const sortedEntries = entries
        .filter(([key, entry]) => now <= entry.expiresAt)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - API_CONFIG.CACHE_SIZE_LIMIT);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  // ===========================================
  // REQUEST QUEUE MANAGEMENT
  // ===========================================

  /**
   * Queue request based on priority
   */
  async queueRequest(config) {
    return new Promise((resolve, reject) => {
      const priority = config.priority || API_CONFIG.PRIORITY.NORMAL;
      
      if (!this.requestQueue.has(priority)) {
        this.requestQueue.set(priority, []);
      }
      
      const queue = this.requestQueue.get(priority);
      
      if (queue.length >= API_CONFIG.QUEUE_SIZE_LIMIT) {
        reject(new Error('Request queue is full'));
        return;
      }
      
      queue.push({
        config,
        resolve,
        reject,
        timestamp: Date.now()
      });

      // Process queue
      this.processQueue();
    });
  }

  /**
   * Process queued requests by priority
   */
  async processQueue() {
    if (this.processingQueue) return;
    
    this.processingQueue = true;

    try {
      // Process by priority (highest first)
      const priorities = Array.from(this.requestQueue.keys()).sort((a, b) => b - a);
      
      for (const priority of priorities) {
        const queue = this.requestQueue.get(priority);
        
        while (queue.length > 0) {
          const { config, resolve, reject } = queue.shift();
          
          try {
            const response = await this.executeRequest(config);
            const processedResponse = await this.processResponse(response, config);
            resolve(processedResponse);
          } catch (error) {
            reject(error);
          }

          // Small delay between requests
          await this.sleep(100);
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  /**
   * Build complete URL with base URL and parameters
   */
  buildURL(url, params = {}) {
    let completeURL = url;
    
    // Add base URL if relative
    if (this.config.baseURL && !url.startsWith('http')) {
      completeURL = `${this.config.baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    }

    // Add query parameters
    if (params && Object.keys(params).length > 0) {
      const urlObj = new URL(completeURL);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, value.toString());
        }
      });
      completeURL = urlObj.toString();
    }

    return completeURL;
  }

  /**
   * Build request headers
   */
  async buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...getSecureHeaders(),
      ...customHeaders
    };

    // Add authentication header
    if (this.config.authToken) {
      headers.Authorization = `${this.config.authToken.type} ${this.config.authToken.token}`;
    }

    return headers;
  }

  /**
   * Check rate limiting
   */
  async checkRateLimit(rateLimitConfig) {
    if (!rateLimitConfig) return;
    
    return checkRateLimit(rateLimitConfig.identifier || 'api-service', {
      maxRequests: rateLimitConfig.maxRequests || 100,
      windowMs: rateLimitConfig.windowMs || 60000,
      strategy: rateLimitConfig.strategy || 'sliding-window'
    });
  }

  /**
   * Calculate retry delay based on strategy
   */
  calculateRetryDelay(attempt, config) {
    const baseDelay = config.retryDelay;
    
    switch (config.retryStrategy) {
      case API_CONFIG.RETRY_STRATEGIES.EXPONENTIAL:
        return Math.min(baseDelay * Math.pow(2, attempt), API_CONFIG.MAX_RETRY_DELAY);
      
      case API_CONFIG.RETRY_STRATEGIES.LINEAR:
        return Math.min(baseDelay * (attempt + 1), API_CONFIG.MAX_RETRY_DELAY);
      
      case API_CONFIG.RETRY_STRATEGIES.FIXED:
      default:
        return baseDelay;
    }
  }

  /**
   * Check if error is non-retryable
   */
  isNonRetryableError(error) {
    const message = error.message.toLowerCase();
    
    // Don't retry on client errors (4xx)
    if (message.includes('400') || message.includes('401') || 
        message.includes('403') || message.includes('404')) {
      return true;
    }
    
    // Don't retry on certain network errors
    if (message.includes('network error') || message.includes('cors')) {
      return true;
    }
    
    return false;
  }

  /**
   * Handle and categorize errors
   */
  handleError(error, config) {
    const errorMessage = error.message || 'Unknown error';
    
    // Create enhanced error object
    const enhancedError = new Error(errorMessage);
    enhancedError.config = config;
    enhancedError.timestamp = new Date().toISOString();
    enhancedError.requestId = config?.requestId;
    
    // Categorize error
    if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
      enhancedError.type = 'TIMEOUT';
      enhancedError.retryable = true;
    } else if (errorMessage.includes('network')) {
      enhancedError.type = 'NETWORK';
      enhancedError.retryable = true;
    } else if (errorMessage.includes('401')) {
      enhancedError.type = 'AUTHENTICATION';
      enhancedError.retryable = false;
    } else if (errorMessage.includes('403')) {
      enhancedError.type = 'AUTHORIZATION';
      enhancedError.retryable = false;
    } else if (errorMessage.includes('429')) {
      enhancedError.type = 'RATE_LIMIT';
      enhancedError.retryable = true;
    } else {
      enhancedError.type = 'UNKNOWN';
      enhancedError.retryable = false;
    }

    return enhancedError;
  }

  /**
   * Update performance metrics
   */
  updateMetrics(startTime, success) {
    this.metrics.totalRequests++;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    const responseTime = Date.now() - startTime;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / 
      this.metrics.totalRequests;
    
    this.metrics.lastRequestTime = new Date().toISOString();
  }

  /**
   * Generate unique request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Setup periodic cleanup tasks
   */
  setupPeriodicCleanup() {
    // Cleanup cache every 5 minutes
    setInterval(() => {
      this.cleanupCache();
    }, 300000);

    // Clear old queue entries every minute
    setInterval(() => {
      const now = Date.now();
      const maxAge = 300000; // 5 minutes
      
      for (const [priority, queue] of this.requestQueue.entries()) {
        const filteredQueue = queue.filter(item => now - item.timestamp < maxAge);
        this.requestQueue.set(priority, filteredQueue);
      }
    }, 60000);
  }

  // ===========================================
  // PUBLIC UTILITY METHODS
  // ===========================================

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
    securityLogger({
      event: 'API_SERVICE_CACHE_CLEARED',
      timestamp: new Date().toISOString(),
      success: true
    });
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      queueSize: Array.from(this.requestQueue.values()).reduce((sum, queue) => sum + queue.length, 0),
      interceptorCount: this.interceptors.request.length + this.interceptors.response.length
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      totalSize += JSON.stringify(entry).length;
      
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      memoryUsage: totalSize,
      hitRate: this.metrics.totalRequests > 0 ? 
        (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100 : 0
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      
      // Make a simple request to test connectivity
      const response = await this.get('/health', {
        timeout: 5000,
        retries: 1
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        metrics: this.getMetrics()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        metrics: this.getMetrics()
      };
    }
  }
}

// ===========================================
// EXPORT AND CONVENIENCE FUNCTIONS
// ===========================================

// Create default instance
export const apiService = new APIService();

// Convenience functions for quick usage
export const api = {
  get: (url, config) => apiService.get(url, config),
  post: (url, data, config) => apiService.post(url, data, config),
  put: (url, data, config) => apiService.put(url, data, config),
  delete: (url, config) => apiService.delete(url, config),
  patch: (url, data, config) => apiService.patch(url, data, config)
};

// Safe API call wrapper
export async function safeAPICall(apiCall, fallback = null, errorHandler = null) {
  try {
    return await apiCall();
  } catch (error) {
    securityLogger({
      event: 'SAFE_API_CALL_FAILED',
      timestamp: new Date().toISOString(),
      error: error.message,
      success: false
    });

    if (errorHandler && typeof errorHandler === 'function') {
      errorHandler(error);
    }

    return fallback;
  }
}

export default APIService;