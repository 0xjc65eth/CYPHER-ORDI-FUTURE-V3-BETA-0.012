import { EnhancedLogger } from '@/lib/enhanced-logger'

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerOptions {
  failureThreshold: number // Number of failures before opening
  recoveryTimeout: number // Time in ms before attempting recovery
  timeout: number // Request timeout in ms
  name: string // Circuit breaker identifier
  resetTimeout?: number // Time in ms to reset failure count
  monitoringWindow?: number // Time window for failure tracking in ms
}

export interface CircuitBreakerStats {
  state: CircuitBreakerState
  failureCount: number
  successCount: number
  lastFailureTime: number | null
  lastSuccessTime: number | null
  totalRequests: number
  totalFailures: number
  totalSuccesses: number
  uptime: number
  lastStateChange: number
}

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED'
  private failureCount = 0
  private successCount = 0
  private lastFailureTime: number | null = null
  private lastSuccessTime: number | null = null
  private nextAttempt = 0
  private totalRequests = 0
  private totalFailures = 0
  private totalSuccesses = 0
  private lastStateChange = Date.now()
  private readonly createdAt = Date.now()

  constructor(private options: CircuitBreakerOptions) {
    EnhancedLogger.info('Circuit Breaker initialized', {
      component: 'CircuitBreaker',
      name: options.name,
      config: options
    })
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++

    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const error = new Error(`Circuit breaker is OPEN for ${this.options.name}`)
        EnhancedLogger.warn('Circuit breaker blocked request', {
          component: 'CircuitBreaker',
          name: this.options.name,
          state: this.state,
          nextAttempt: new Date(this.nextAttempt).toISOString()
        })
        throw error
      } else {
        // Transition to HALF_OPEN for recovery attempt
        this.state = 'HALF_OPEN'
        this.lastStateChange = Date.now()
        EnhancedLogger.info('Circuit breaker transitioning to HALF_OPEN', {
          component: 'CircuitBreaker',
          name: this.options.name,
          state: this.state
        })
      }
    }

    try {
      // Execute operation with timeout
      const result = await this.executeWithTimeout(operation)
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.options.timeout}ms for ${this.options.name}`))
      }, this.options.timeout)

      operation()
        .then(result => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  private onSuccess(): void {
    this.successCount++
    this.totalSuccesses++
    this.lastSuccessTime = Date.now()

    if (this.state === 'HALF_OPEN') {
      // Recovery successful, close the circuit
      this.reset()
      EnhancedLogger.info('Circuit breaker recovered, transitioning to CLOSED', {
        component: 'CircuitBreaker',
        name: this.options.name,
        state: this.state
      })
    }

    // Reset failure count after successful operations
    if (this.state === 'CLOSED' && this.options.resetTimeout) {
      const timeSinceLastFailure = this.lastFailureTime ? Date.now() - this.lastFailureTime : Infinity
      if (timeSinceLastFailure > this.options.resetTimeout) {
        this.failureCount = 0
      }
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.totalFailures++
    this.lastFailureTime = Date.now()

    EnhancedLogger.warn('Circuit breaker recorded failure', {
      component: 'CircuitBreaker',
      name: this.options.name,
      failureCount: this.failureCount,
      threshold: this.options.failureThreshold,
      state: this.state
    })

    if (this.state === 'HALF_OPEN') {
      // Recovery failed, go back to OPEN
      this.open()
    } else if (this.failureCount >= this.options.failureThreshold) {
      // Threshold reached, open the circuit
      this.open()
    }
  }

  private open(): void {
    this.state = 'OPEN'
    this.lastStateChange = Date.now()
    this.nextAttempt = Date.now() + this.options.recoveryTimeout

    EnhancedLogger.error('Circuit breaker OPENED', {
      component: 'CircuitBreaker',
      name: this.options.name,
      state: this.state,
      failureCount: this.failureCount,
      nextAttempt: new Date(this.nextAttempt).toISOString()
    })
  }

  private reset(): void {
    this.state = 'CLOSED'
    this.lastStateChange = Date.now()
    this.failureCount = 0
    this.nextAttempt = 0

    EnhancedLogger.info('Circuit breaker RESET', {
      component: 'CircuitBreaker',
      name: this.options.name,
      state: this.state
    })
  }

  // Public methods for monitoring
  getState(): CircuitBreakerState {
    return this.state
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      uptime: Date.now() - this.createdAt,
      lastStateChange: this.lastStateChange
    }
  }

  getFailureRate(): number {
    if (this.totalRequests === 0) return 0
    return this.totalFailures / this.totalRequests
  }

  getSuccessRate(): number {
    if (this.totalRequests === 0) return 0
    return this.totalSuccesses / this.totalRequests
  }

  // Manual controls
  forceOpen(): void {
    this.open()
    EnhancedLogger.warn('Circuit breaker manually FORCED OPEN', {
      component: 'CircuitBreaker',
      name: this.options.name
    })
  }

  forceClose(): void {
    this.reset()
    EnhancedLogger.info('Circuit breaker manually FORCED CLOSED', {
      component: 'CircuitBreaker',
      name: this.options.name
    })
  }

  // Health check
  isHealthy(): boolean {
    const stats = this.getStats()
    const recentFailureRate = this.getRecentFailureRate()
    
    return (
      stats.state !== 'OPEN' &&
      recentFailureRate < 0.5 &&
      (stats.lastSuccessTime === null || Date.now() - stats.lastSuccessTime < 60000)
    )
  }

  private getRecentFailureRate(): number {
    const windowMs = this.options.monitoringWindow || 300000 // 5 minutes default
    const cutoff = Date.now() - windowMs
    
    // In a production environment, you'd track timestamped failures
    // For now, we'll use a simplified calculation
    if (this.lastFailureTime && this.lastFailureTime > cutoff) {
      return this.failureCount / Math.max(this.totalRequests, 1)
    }
    
    return 0
  }
}

// Circuit Breaker Manager
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager
  private breakers = new Map<string, CircuitBreaker>()

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager()
    }
    return CircuitBreakerManager.instance
  }

  createBreaker(name: string, options: Omit<CircuitBreakerOptions, 'name'>): CircuitBreaker {
    const breaker = new CircuitBreaker({ ...options, name })
    this.breakers.set(name, breaker)
    
    EnhancedLogger.info('Circuit breaker registered', {
      component: 'CircuitBreakerManager',
      name,
      totalBreakers: this.breakers.size
    })
    
    return breaker
  }

  getBreaker(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name)
  }

  getAllBreakers(): Map<string, CircuitBreaker> {
    return new Map(this.breakers)
  }

  getHealthStatus(): Record<string, { healthy: boolean; stats: CircuitBreakerStats }> {
    const status: Record<string, { healthy: boolean; stats: CircuitBreakerStats }> = {}
    
    for (const [name, breaker] of this.breakers) {
      status[name] = {
        healthy: breaker.isHealthy(),
        stats: breaker.getStats()
      }
    }
    
    return status
  }

  // Emergency controls
  openAll(): void {
    EnhancedLogger.warn('Opening ALL circuit breakers', {
      component: 'CircuitBreakerManager',
      count: this.breakers.size
    })
    
    for (const breaker of this.breakers.values()) {
      breaker.forceOpen()
    }
  }

  closeAll(): void {
    EnhancedLogger.info('Closing ALL circuit breakers', {
      component: 'CircuitBreakerManager',
      count: this.breakers.size
    })
    
    for (const breaker of this.breakers.values()) {
      breaker.forceClose()
    }
  }
}

// Convenience function for creating breakers with common configurations
export const createAPICircuitBreaker = (apiName: string, customOptions?: Partial<CircuitBreakerOptions>): CircuitBreaker => {
  const manager = CircuitBreakerManager.getInstance()
  
  const defaultOptions: Omit<CircuitBreakerOptions, 'name'> = {
    failureThreshold: 5,
    recoveryTimeout: 30000, // 30 seconds
    timeout: 10000, // 10 seconds
    resetTimeout: 60000, // 1 minute
    monitoringWindow: 300000 // 5 minutes
  }
  
  return manager.createBreaker(apiName, { ...defaultOptions, ...customOptions })
}

export default CircuitBreaker