// Enhanced API Client with Retry Logic and Circuit Breaker

import { devLogger } from '@/lib/logger'

interface RetryOptions {
  maxRetries: number
  backoffMs: number
  backoffMultiplier: number
}

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

class APIClient {
  private requestCount = 0
  private resetTime = Date.now() + 60000
  private circuitBreakers = new Map<string, CircuitBreakerState>()
  
  private defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    backoffMs: 1000,
    backoffMultiplier: 2
  }

  async fetch(url: string, options?: RequestInit, retryOptions?: Partial<RetryOptions>): Promise<any> {
    const opts = { ...this.defaultRetryOptions, ...retryOptions }
    const domain = new URL(url).hostname
    
    // Check circuit breaker
    if (this.isCircuitOpen(domain)) {
      devLogger.log('API', `Circuit breaker OPEN for ${domain}, returning fallback`)
      throw new Error(`Circuit breaker open for ${domain}`)
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded')
    }

    return this.fetchWithRetry(url, options, opts, domain)
  }

  private async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    retryOptions: RetryOptions,
    domain: string,
    attempt = 1
  ): Promise<any> {
    try {
      devLogger.log('API', `Tentativa ${attempt} para ${url}`)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CYPHER-ORDI-FUTURE/3.1.0',
          ...options.headers,
        }
      })
      
      clearTimeout(timeoutId)
      this.requestCount++

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Success - reset circuit breaker
      this.resetCircuitBreaker(domain)
      
      const data = await response.json()
      devLogger.performance(`API Success: ${url}`, 0)
      return data
      
    } catch (error: any) {
      devLogger.error(error, `API Error (tentativa ${attempt}): ${url}`)
      
      // Record failure for circuit breaker
      this.recordFailure(domain)
      
      // Retry logic
      if (attempt < retryOptions.maxRetries && this.shouldRetry(error)) {
        const delay = retryOptions.backoffMs * Math.pow(retryOptions.backoffMultiplier, attempt - 1)
        devLogger.log('API', `Retry em ${delay}ms...`)
        
        await this.sleep(delay)
        return this.fetchWithRetry(url, options, retryOptions, domain, attempt + 1)
      }
      
      throw error
    }
  }

  private checkRateLimit(): boolean {
    if (Date.now() > this.resetTime) {
      this.requestCount = 0
      this.resetTime = Date.now() + 60000
    }

    return this.requestCount < 100
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx errors
    return (
      error.name === 'AbortError' ||
      error.name === 'TypeError' ||
      error.message.includes('5') ||
      error.message.includes('timeout') ||
      error.message.includes('network')
    )
  }

  private isCircuitOpen(domain: string): boolean {
    const breaker = this.circuitBreakers.get(domain)
    if (!breaker) return false

    const now = Date.now()
    
    if (breaker.state === 'OPEN') {
      // Check if we should move to half-open
      if (now - breaker.lastFailureTime > 30000) { // 30s timeout
        breaker.state = 'HALF_OPEN'
        devLogger.log('API', `Circuit breaker HALF_OPEN for ${domain}`)
        return false
      }
      return true
    }
    
    return false
  }

  private recordFailure(domain: string): void {
    const breaker = this.circuitBreakers.get(domain) || {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED' as const
    }

    breaker.failures++
    breaker.lastFailureTime = Date.now()

    // Open circuit after 3 failures
    if (breaker.failures >= 3) {
      breaker.state = 'OPEN'
      devLogger.log('API', `Circuit breaker OPENED for ${domain}`)
    }

    this.circuitBreakers.set(domain, breaker)
  }

  private resetCircuitBreaker(domain: string): void {
    const breaker = this.circuitBreakers.get(domain)
    if (breaker) {
      breaker.failures = 0
      breaker.state = 'CLOSED'
      this.circuitBreakers.set(domain, breaker)
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Método para fallback de dados
  async fetchWithFallback<T>(url: string, fallbackData: T, options?: RequestInit): Promise<T> {
    try {
      return await this.fetch(url, options)
    } catch (error) {
      devLogger.log('API', `Usando fallback data para ${url}`)
      return fallbackData
    }
  }

  // Status do cliente
  getStatus() {
    return {
      requestCount: this.requestCount,
      resetTime: this.resetTime,
      circuitBreakers: Object.fromEntries(this.circuitBreakers)
    }
  }
}

export const apiClient = new APIClient()