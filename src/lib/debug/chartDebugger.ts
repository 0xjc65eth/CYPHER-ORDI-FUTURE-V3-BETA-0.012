// Chart Debugging Utilities
export class ChartDebugger {
  private static instance: ChartDebugger;
  private errors: Array<{
    timestamp: Date;
    component: string;
    error: string;
    context?: any;
  }> = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandler();
    }
  }

  static getInstance(): ChartDebugger {
    if (!ChartDebugger.instance) {
      ChartDebugger.instance = new ChartDebugger();
    }
    return ChartDebugger.instance;
  }

  private setupGlobalErrorHandler() {
    // Intercept console errors
    const originalError = console.error;
    console.error = (...args) => {
      this.logError('console', args.join(' '));
      originalError.apply(console, args);
    };

    // Global error handler
    window.addEventListener('error', (event) => {
      if (event.message.includes('chart') || event.message.includes('Chart')) {
        this.logError('window', event.message, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }
    });

    // Unhandled promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.toString().includes('chart') || 
          event.reason?.toString().includes('Chart')) {
        this.logError('promise', event.reason?.toString() || 'Unknown promise rejection');
      }
    });
  }

  logError(component: string, error: string, context?: any) {
    const errorEntry = {
      timestamp: new Date(),
      component,
      error,
      context,
    };
    
    this.errors.push(errorEntry);
    
    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Chart Debug:', errorEntry);
    }
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }

  // Chart-specific debugging
  debugChartData(symbol: string, data: any) {
    console.log(`📊 Chart Data Debug for ${symbol}:`, {
      dataLength: data?.length || 0,
      firstPoint: data?.[0],
      lastPoint: data?.[data?.length - 1],
      hasValidData: this.validateChartData(data),
    });
  }

  private validateChartData(data: any): boolean {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    const firstPoint = data[0];
    return (
      firstPoint &&
      typeof firstPoint === 'object' &&
      'time' in firstPoint &&
      ('close' in firstPoint || 'price' in firstPoint)
    );
  }

  // Performance monitoring
  measureChartRender(chartId: string, callback: () => void) {
    const startTime = performance.now();
    
    try {
      callback();
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`📊 Chart ${chartId} rendered in ${renderTime.toFixed(2)}ms`);
      
      if (renderTime > 1000) {
        this.logError('performance', `Slow chart render: ${chartId} took ${renderTime.toFixed(2)}ms`);
      }
    } catch (error) {
      this.logError('render', `Chart render failed: ${chartId}`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const chartDebugger = ChartDebugger.getInstance();