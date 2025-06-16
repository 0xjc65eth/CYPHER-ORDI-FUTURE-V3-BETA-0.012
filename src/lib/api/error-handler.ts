import { logger } from '@/lib/enhanced-logger'

export interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
  retryable?: boolean
  timestamp: string
  endpoint?: string
  method?: string
}

export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableStatuses: number[]
}

export interface ApiErrorContext {
  endpoint: string
  method: string
  requestId?: string
  userId?: string
  sessionId?: string
  requestBody?: any
  headers?: Record<string, string>
}

export class ApiErrorHandler {
  private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableStatuses: [408, 429, 500, 502, 503, 504]
  }

  private static readonly ERROR_MESSAGES: Record<number, string> = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Authentication required. Please log in and try again.',
    403: 'Access denied. You don\'t have permission to perform this action.',
    404: 'Resource not found. The requested data may have been moved or deleted.',
    408: 'Request timeout. Please check your connection and try again.',
    409: 'Conflict. The resource has been modified by another request.',
    422: 'Invalid data. Please review your input and correct any errors.',
    429: 'Too many requests. Please wait a moment before trying again.',
    500: 'Server error. Our team has been notified and is working on a fix.',
    502: 'Service temporarily unavailable. Please try again in a few moments.',
    503: 'Service maintenance in progress. Please try again shortly.',
    504: 'Request timeout. The service is taking longer than expected to respond.'
  }

  /**
   * Handle API errors with context and user-friendly messaging
   */
  static handleError(
    error: any,
    context: ApiErrorContext,
    options: Partial<RetryConfig> = {}
  ): ApiError {
    const config = { ...this.DEFAULT_RETRY_CONFIG, ...options }
    
    let apiError: ApiError
    
    if (error.response) {
      // HTTP error response
      apiError = this.createHttpError(error.response, context)
    } else if (error.request) {
      // Network error
      apiError = this.createNetworkError(error, context)
    } else {
      // Other error
      apiError = this.createGenericError(error, context)
    }

    // Determine if error is retryable
    apiError.retryable = this.isRetryable(apiError, config)

    // Log error with context
    this.logError(apiError, context)

    return apiError
  }

  /**
   * Create HTTP error from response
   */
  private static createHttpError(response: any, context: ApiErrorContext): ApiError {
    const status = response.status
    const data = response.data
    
    const error = new Error(
      data?.message || 
      this.ERROR_MESSAGES[status] || 
      `HTTP ${status} error`
    ) as ApiError

    error.name = 'ApiError'
    error.status = status
    error.code = data?.code || `HTTP_${status}`
    error.details = data?.details || data
    error.timestamp = new Date().toISOString()
    error.endpoint = context.endpoint
    error.method = context.method

    return error
  }

  /**
   * Create network error
   */
  private static createNetworkError(error: any, context: ApiErrorContext): ApiError {
    const apiError = new Error(
      'Network error. Please check your internet connection and try again.'
    ) as ApiError

    apiError.name = 'NetworkError'
    apiError.code = 'NETWORK_ERROR'
    apiError.retryable = true
    apiError.timestamp = new Date().toISOString()
    apiError.endpoint = context.endpoint
    apiError.method = context.method
    apiError.details = {
      originalError: error.message,
      timeout: error.code === 'ECONNABORTED'
    }

    return apiError
  }

  /**
   * Create generic error
   */
  private static createGenericError(error: any, context: ApiErrorContext): ApiError {
    const apiError = new Error(
      error.message || 'An unexpected error occurred. Please try again.'
    ) as ApiError

    apiError.name = 'UnknownError'
    apiError.code = 'UNKNOWN_ERROR'
    apiError.timestamp = new Date().toISOString()
    apiError.endpoint = context.endpoint
    apiError.method = context.method
    apiError.details = {
      originalError: error.toString(),
      stack: error.stack
    }

    return apiError
  }

  /**
   * Determine if error is retryable
   */
  private static isRetryable(error: ApiError, config: RetryConfig): boolean {
    // Network errors are usually retryable
    if (error.name === 'NetworkError') {
      return true
    }

    // Check HTTP status codes
    if (error.status && config.retryableStatuses.includes(error.status)) {
      return true
    }

    // Specific error codes that are retryable
    const retryableCodes = ['TIMEOUT', 'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED']
    if (error.code && retryableCodes.includes(error.code)) {
      return true
    }

    return false
  }

  /**
   * Log error with context
   */
  private static logError(error: ApiError, context: ApiErrorContext): void {
    const logLevel = this.getLogLevel(error)
    const logData = {
      error: {
        name: error.name,
        message: error.message,
        status: error.status,
        code: error.code,
        retryable: error.retryable
      },
      context: {
        endpoint: context.endpoint,
        method: context.method,
        requestId: context.requestId,
        userId: context.userId,
        sessionId: context.sessionId
      },
      timestamp: error.timestamp
    }

    switch (logLevel) {
      case 'error':
        logger.error('API Error', logData)
        break
      case 'warn':
        logger.warn('API Warning', logData)
        break
      default:
        logger.info('API Info', logData)
    }
  }

  /**
   * Get appropriate log level for error
   */
  private static getLogLevel(error: ApiError): 'error' | 'warn' | 'info' {
    if (error.status && error.status >= 500) {
      return 'error'
    }
    if (error.status && (error.status === 429 || error.status === 408)) {
      return 'warn'
    }
    if (error.name === 'NetworkError') {
      return 'warn'
    }
    return 'info'
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: ApiError): string {
    if (error.status && this.ERROR_MESSAGES[error.status]) {
      return this.ERROR_MESSAGES[error.status]
    }

    if (error.name === 'NetworkError') {
      return 'Network connection error. Please check your internet connection and try again.'
    }

    return error.message || 'An unexpected error occurred. Please try again.'
  }

  /**
   * Check if error should trigger a notification
   */
  static shouldNotifyUser(error: ApiError): boolean {
    // Don't notify for client errors (4xx) except specific ones
    if (error.status && error.status >= 400 && error.status < 500) {
      const notifiableClientErrors = [401, 403, 429]
      return notifiableClientErrors.includes(error.status)
    }

    // Always notify for server errors and network errors
    return true
  }

  /**
   * Get suggested action for error
   */
  static getSuggestedAction(error: ApiError): string {
    if (error.status === 401) {
      return 'Please log in again to continue.'
    }

    if (error.status === 403) {
      return 'Contact support if you believe you should have access.'
    }

    if (error.status === 429) {
      return 'Please wait a moment before making another request.'
    }

    if (error.retryable) {
      return 'This appears to be a temporary issue. Please try again.'
    }

    if (error.status && error.status >= 500) {
      return 'Our team has been notified and is working on a fix.'
    }

    return 'Please review your request and try again.'
  }
}

/**
 * Retry mechanism for API calls
 */
export class ApiRetry {
  static async withRetry<T>(
    apiCall: () => Promise<T>,
    context: ApiErrorContext,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...ApiErrorHandler['DEFAULT_RETRY_CONFIG'], ...config }
    let lastError: ApiError | null = null
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const result = await apiCall()
        
        // Log successful retry
        if (attempt > 0) {
          logger.info('API call succeeded after retry', {
            context,
            attempt,
            previousError: lastError?.message
          })
        }
        
        return result
      } catch (error) {
        lastError = ApiErrorHandler.handleError(error, context, retryConfig)
        
        // Don't retry if error is not retryable or max retries reached
        if (!lastError.retryable || attempt === retryConfig.maxRetries) {
          throw lastError
        }

        // Calculate delay for next retry
        const delay = Math.min(
          retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
          retryConfig.maxDelay
        )

        logger.info('Retrying API call', {
          context,
          attempt: attempt + 1,
          maxRetries: retryConfig.maxRetries,
          delay,
          error: lastError.message
        })

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError!
  }
}

/**
 * Circuit breaker for API calls
 */
export class ApiCircuitBreaker {
  private failures = new Map<string, number>()
  private lastFailureTime = new Map<string, number>()
  private readonly failureThreshold: number
  private readonly recoveryTime: number

  constructor(failureThreshold = 5, recoveryTime = 60000) {
    this.failureThreshold = failureThreshold
    this.recoveryTime = recoveryTime
  }

  /**
   * Execute API call with circuit breaker protection
   */
  async execute<T>(
    key: string,
    apiCall: () => Promise<T>,
    context: ApiErrorContext
  ): Promise<T> {
    // Check if circuit is open
    if (this.isCircuitOpen(key)) {
      const error = new Error('Service temporarily unavailable due to repeated failures') as ApiError
      error.name = 'CircuitBreakerError'
      error.code = 'CIRCUIT_OPEN'
      error.retryable = false
      error.timestamp = new Date().toISOString()
      error.endpoint = context.endpoint
      error.method = context.method
      
      logger.warn('Circuit breaker is open', { key, context })
      throw error
    }

    try {
      const result = await apiCall()
      
      // Reset failure count on success
      this.onSuccess(key)
      return result
    } catch (error) {
      this.onFailure(key)
      throw error
    }
  }

  private isCircuitOpen(key: string): boolean {
    const failures = this.failures.get(key) || 0
    const lastFailure = this.lastFailureTime.get(key) || 0
    
    if (failures >= this.failureThreshold) {
      const timeSinceLastFailure = Date.now() - lastFailure
      return timeSinceLastFailure < this.recoveryTime
    }
    
    return false
  }

  private onSuccess(key: string): void {
    this.failures.delete(key)
    this.lastFailureTime.delete(key)
  }

  private onFailure(key: string): void {
    const failures = (this.failures.get(key) || 0) + 1
    this.failures.set(key, failures)
    this.lastFailureTime.set(key, Date.now())
    
    if (failures >= this.failureThreshold) {
      logger.warn('Circuit breaker opened', { 
        key, 
        failures, 
        threshold: this.failureThreshold 
      })
    }
  }

  /**
   * Get circuit breaker status
   */
  getStatus(key: string): {
    failures: number
    isOpen: boolean
    timeToRecovery?: number
  } {
    const failures = this.failures.get(key) || 0
    const isOpen = this.isCircuitOpen(key)
    const lastFailure = this.lastFailureTime.get(key)
    
    let timeToRecovery: number | undefined
    if (isOpen && lastFailure) {
      timeToRecovery = this.recoveryTime - (Date.now() - lastFailure)
    }

    return { failures, isOpen, timeToRecovery }
  }
}

// Export singleton circuit breaker
export const apiCircuitBreaker = new ApiCircuitBreaker()