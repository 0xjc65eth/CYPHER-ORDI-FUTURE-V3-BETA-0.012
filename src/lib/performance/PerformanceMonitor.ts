import { EnhancedLogger } from '@/lib/enhanced-logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage' | 'custom'
  timestamp: number
  tags?: Record<string, string | number>
  category: 'render' | 'api' | 'memory' | 'network' | 'user' | 'system'
}

export interface PerformanceBudget {
  name: string
  threshold: number
  unit: string
  severity: 'info' | 'warning' | 'error'
}

export interface PerformanceReport {
  timestamp: number
  metrics: PerformanceMetric[]
  budgetViolations: BudgetViolation[]
  summary: {
    totalMetrics: number
    avgRenderTime: number
    avgApiTime: number
    memoryUsage: number
    errorRate: number
  }
}

export interface BudgetViolation {
  budget: PerformanceBudget
  actualValue: number
  exceedancePercentage: number
  severity: 'info' | 'warning' | 'error'
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private budgets: PerformanceBudget[] = []
  private observers: PerformanceObserver[] = []
  private isEnabled = true
  private maxMetrics = 1000 // Limit memory usage
  
  // Performance budgets (default values)
  private defaultBudgets: PerformanceBudget[] = [
    { name: 'First Contentful Paint', threshold: 1500, unit: 'ms', severity: 'warning' },
    { name: 'Largest Contentful Paint', threshold: 2500, unit: 'ms', severity: 'error' },
    { name: 'Cumulative Layout Shift', threshold: 0.1, unit: 'score', severity: 'warning' },
    { name: 'First Input Delay', threshold: 100, unit: 'ms', severity: 'warning' },
    { name: 'API Response Time', threshold: 2000, unit: 'ms', severity: 'warning' },
    { name: 'Memory Usage', threshold: 100, unit: 'MB', severity: 'error' },
    { name: 'Bundle Size', threshold: 5, unit: 'MB', severity: 'warning' },
    { name: 'Time to Interactive', threshold: 3000, unit: 'ms', severity: 'error' }
  ]

  private constructor() {
    this.budgets = [...this.defaultBudgets]
    this.initializeWebAPIs()
    this.startMemoryMonitoring()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeWebAPIs(): void {
    if (typeof window === 'undefined') return

    try {
      // Navigation Timing API
      this.observeNavigationTiming()
      
      // Performance Observer API
      this.observeResourceTiming()
      this.observePaintTiming()
      this.observeLayoutShift()
      this.observeLongTasks()
      
      // Web Vitals
      this.observeWebVitals()
      
      EnhancedLogger.info('Performance monitoring initialized', {
        component: 'PerformanceMonitor',
        observers: this.observers.length
      })
    } catch (error) {
      EnhancedLogger.error('Failed to initialize performance monitoring', {
        component: 'PerformanceMonitor',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private observeNavigationTiming(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        if (navigation) {
          this.recordMetric({
            name: 'DOM Content Loaded',
            value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'render'
          })

          this.recordMetric({
            name: 'Page Load Time',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'render'
          })

          this.recordMetric({
            name: 'DNS Lookup Time',
            value: navigation.domainLookupEnd - navigation.domainLookupStart,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'network'
          })
        }
      })
    }
  }

  private observeResourceTiming(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resource = entry as PerformanceResourceTiming
              
              this.recordMetric({
                name: 'Resource Load Time',
                value: resource.responseEnd - resource.requestStart,
                unit: 'ms',
                timestamp: Date.now(),
                category: 'network',
                tags: {
                  resource: resource.name,
                  type: this.getResourceType(resource.name)
                }
              })
            }
          }
        })
        
        observer.observe({ entryTypes: ['resource'] })
        this.observers.push(observer)
      } catch (error) {
        EnhancedLogger.warn('Resource timing observer not supported', {
          component: 'PerformanceMonitor'
        })
      }
    }
  }

  private observePaintTiming(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: entry.name,
              value: entry.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'render'
            })
          }
        })
        
        observer.observe({ entryTypes: ['paint'] })
        this.observers.push(observer)
      } catch (error) {
        EnhancedLogger.warn('Paint timing observer not supported', {
          component: 'PerformanceMonitor'
        })
      }
    }
  }

  private observeLayoutShift(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        let clsValue = 0
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutShift = entry as any // LayoutShift interface may not be available
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value
              
              this.recordMetric({
                name: 'Cumulative Layout Shift',
                value: clsValue,
                unit: 'custom',
                timestamp: Date.now(),
                category: 'render'
              })
            }
          }
        })
        
        observer.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(observer)
      } catch (error) {
        EnhancedLogger.warn('Layout shift observer not supported', {
          component: 'PerformanceMonitor'
        })
      }
    }
  }

  private observeLongTasks(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'Long Task',
              value: entry.duration,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'system'
            })
          }
        })
        
        observer.observe({ entryTypes: ['longtask'] })
        this.observers.push(observer)
      } catch (error) {
        EnhancedLogger.warn('Long task observer not supported', {
          component: 'PerformanceMonitor'
        })
      }
    }
  }

  private observeWebVitals(): void {
    // Implement Web Vitals measurement
    this.measureLCP()
    this.measureFID()
    this.measureCLS()
  }

  private measureLCP(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          
          this.recordMetric({
            name: 'Largest Contentful Paint',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'render'
          })
        })
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(observer)
      } catch (error) {
        EnhancedLogger.warn('LCP observer not supported', {
          component: 'PerformanceMonitor'
        })
      }
    }
  }

  private measureFID(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const firstInput = entry as any
            
            this.recordMetric({
              name: 'First Input Delay',
              value: firstInput.processingStart - firstInput.startTime,
              unit: 'ms',
              timestamp: Date.now(),
              category: 'user'
            })
          }
        })
        
        observer.observe({ entryTypes: ['first-input'] })
        this.observers.push(observer)
      } catch (error) {
        EnhancedLogger.warn('FID observer not supported', {
          component: 'PerformanceMonitor'
        })
      }
    }
  }

  private measureCLS(): void {
    // CLS is measured in observeLayoutShift()
  }

  private startMemoryMonitoring(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      setInterval(() => {
        const memory = (window.performance as any).memory
        
        this.recordMetric({
          name: 'JS Heap Size',
          value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
          unit: 'bytes',
          timestamp: Date.now(),
          category: 'memory'
        })

        this.recordMetric({
          name: 'JS Heap Limit',
          value: memory.totalJSHeapSize / 1024 / 1024, // Convert to MB
          unit: 'bytes',
          timestamp: Date.now(),
          category: 'memory'
        })
      }, 5000) // Every 5 seconds
    }
  }

  // Public API
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'> & { timestamp?: number }): void {
    if (!this.isEnabled) return

    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: metric.timestamp || Date.now()
    }

    this.metrics.push(fullMetric)
    
    // Limit memory usage
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2)
    }

    // Check budget violations
    this.checkBudgetViolations(fullMetric)

    EnhancedLogger.debug('Performance metric recorded', {
      component: 'PerformanceMonitor',
      metric: fullMetric
    })
  }

  measureAPICall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now()
    
    return apiCall()
      .then(result => {
        const duration = performance.now() - startTime
        
        this.recordMetric({
          name: `API: ${name}`,
          value: duration,
          unit: 'ms',
          category: 'api',
          tags: { status: 'success' }
        })
        
        return result
      })
      .catch(error => {
        const duration = performance.now() - startTime
        
        this.recordMetric({
          name: `API: ${name}`,
          value: duration,
          unit: 'ms',
          category: 'api',
          tags: { status: 'error' }
        })
        
        throw error
      })
  }

  measureRender<T>(componentName: string, renderFn: () => T): T {
    const startTime = performance.now()
    const result = renderFn()
    const duration = performance.now() - startTime
    
    this.recordMetric({
      name: `Render: ${componentName}`,
      value: duration,
      unit: 'ms',
      category: 'render'
    })
    
    return result
  }

  private checkBudgetViolations(metric: PerformanceMetric): void {
    for (const budget of this.budgets) {
      if (this.isMetricApplicable(metric, budget)) {
        if (metric.value > budget.threshold) {
          const violation: BudgetViolation = {
            budget,
            actualValue: metric.value,
            exceedancePercentage: ((metric.value - budget.threshold) / budget.threshold) * 100,
            severity: budget.severity
          }

          this.handleBudgetViolation(violation, metric)
        }
      }
    }
  }

  private isMetricApplicable(metric: PerformanceMetric, budget: PerformanceBudget): boolean {
    return metric.name.toLowerCase().includes(budget.name.toLowerCase()) ||
           budget.name.toLowerCase().includes(metric.name.toLowerCase())
  }

  private handleBudgetViolation(violation: BudgetViolation, metric: PerformanceMetric): void {
    const logMethod = violation.severity === 'error' ? 'error' : 'warn'
    
    EnhancedLogger[logMethod]('Performance budget violation', {
      component: 'PerformanceMonitor',
      budget: violation.budget.name,
      threshold: violation.budget.threshold,
      actual: violation.actualValue,
      exceedance: `${violation.exceedancePercentage.toFixed(1)}%`,
      metric: metric.name,
      severity: violation.severity
    })
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'js': return 'script'
      case 'css': return 'stylesheet'
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp': return 'image'
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'eot': return 'font'
      default: return 'other'
    }
  }

  // Reporting and analysis
  generateReport(timeRange?: { start: number; end: number }): PerformanceReport {
    const filteredMetrics = timeRange
      ? this.metrics.filter(m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end)
      : this.metrics

    const budgetViolations = this.getBudgetViolations(filteredMetrics)
    
    return {
      timestamp: Date.now(),
      metrics: filteredMetrics,
      budgetViolations,
      summary: this.generateSummary(filteredMetrics)
    }
  }

  private getBudgetViolations(metrics: PerformanceMetric[]): BudgetViolation[] {
    const violations: BudgetViolation[] = []
    
    for (const budget of this.budgets) {
      const relevantMetrics = metrics.filter(m => this.isMetricApplicable(m, budget))
      const maxValue = Math.max(...relevantMetrics.map(m => m.value))
      
      if (maxValue > budget.threshold) {
        violations.push({
          budget,
          actualValue: maxValue,
          exceedancePercentage: ((maxValue - budget.threshold) / budget.threshold) * 100,
          severity: budget.severity
        })
      }
    }
    
    return violations
  }

  private generateSummary(metrics: PerformanceMetric[]): PerformanceReport['summary'] {
    const renderMetrics = metrics.filter(m => m.category === 'render')
    const apiMetrics = metrics.filter(m => m.category === 'api')
    const memoryMetrics = metrics.filter(m => m.category === 'memory' && m.name === 'JS Heap Size')
    const errorMetrics = metrics.filter(m => m.tags?.status === 'error')
    
    return {
      totalMetrics: metrics.length,
      avgRenderTime: renderMetrics.length > 0 
        ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length 
        : 0,
      avgApiTime: apiMetrics.length > 0 
        ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
        : 0,
      memoryUsage: memoryMetrics.length > 0 
        ? memoryMetrics[memoryMetrics.length - 1].value 
        : 0,
      errorRate: metrics.length > 0 
        ? errorMetrics.length / metrics.length 
        : 0
    }
  }

  // Configuration
  setBudget(budget: PerformanceBudget): void {
    const existingIndex = this.budgets.findIndex(b => b.name === budget.name)
    
    if (existingIndex >= 0) {
      this.budgets[existingIndex] = budget
    } else {
      this.budgets.push(budget)
    }
  }

  enable(): void {
    this.isEnabled = true
  }

  disable(): void {
    this.isEnabled = false
  }

  clear(): void {
    this.metrics = []
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics = []
    this.isEnabled = false
  }
}

// Export singleton instance and utilities
export const performanceMonitor = PerformanceMonitor.getInstance()

// Decorators and HOCs for easy integration
export function measurePerformance(name: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measureAPICall(
        `${name || target.constructor.name}.${propertyKey}`,
        () => originalMethod.apply(this, args)
      )
    }

    return descriptor
  }
}

export default PerformanceMonitor