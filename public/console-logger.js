/**
 * 🔍 CYPHER AI Console Logger v3.0
 * Advanced client-side logging and debugging system
 */

class CypherConsoleLogger {
  constructor() {
    this.isProduction = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? false : true;
    this.logLevel = this.isProduction ? 'error' : 'debug';
    this.logs = [];
    this.maxLogs = 1000;
    
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // Override console methods for better logging
    this.interceptConsoleMethods();
    
    // Add performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup error tracking
    this.setupErrorTracking();
    
    console.log('🔍 CYPHER AI Console Logger initialized');
  }

  interceptConsoleMethods() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      this.addLog('log', args);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      this.addLog('error', args);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.addLog('warn', args);
      originalWarn.apply(console, args);
    };
  }

  addLog(type, args) {
    let seen = new WeakSet();
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      message: args.map(arg => {
        try {
          if (typeof arg === 'object' && arg !== null) {
            // Check for circular references and HTML elements
            if (arg.nodeType || arg instanceof Element || arg instanceof Node) {
              return '[DOM Element]';
            }
            if (arg.constructor && arg.constructor.name === 'HTMLElement') {
              return '[HTML Element]';
            }
            return JSON.stringify(arg, (key, value) => {
              if (value instanceof Element || value instanceof Node) {
                return '[DOM Element]';
              }
              if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                  return '[Circular Reference]';
                }
                seen.add(value);
              }
              return value;
            });
          }
          return String(arg);
        } catch (error) {
          return '[Object - Could not stringify]';
        }
      }).join(' '),
      stack: new Error().stack
    };

    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  setupPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('📊 Page Performance:', {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstByte: perfData.responseStart - perfData.requestStart
        });
      }, 0);
    });

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 1000) { // Log slow resources (>1s)
          console.warn('🐌 Slow resource detected:', entry.name, `${entry.duration}ms`);
        }
      });
    });
    
    if (window.PerformanceObserver) {
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  setupErrorTracking() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.addLog('error', [`Global Error: ${event.message}`, event.filename, event.lineno]);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.addLog('error', [`Unhandled Promise Rejection: ${event.reason}`]);
    });

    // React error boundary support
    window.cypherErrorHandler = (error, errorInfo) => {
      this.addLog('error', [`React Error: ${error.message}`, errorInfo]);
    };
  }

  // Public API for components
  logTradingEvent(event, data) {
    console.log(`🔄 Trading Event: ${event}`, data);
  }

  logAPICall(endpoint, duration, success) {
    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} API Call: ${endpoint} (${duration}ms)`);
  }

  logWalletEvent(event, wallet) {
    console.log(`👛 Wallet Event: ${event}`, wallet);
  }

  exportLogs() {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cypher-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearLogs() {
    this.logs = [];
    console.log('🧹 Logs cleared');
  }
}

// Initialize logger
window.cypherLogger = new CypherConsoleLogger();

// Make it globally available
if (typeof window !== 'undefined') {
  window.logTradingEvent = window.cypherLogger.logTradingEvent.bind(window.cypherLogger);
  window.logAPICall = window.cypherLogger.logAPICall.bind(window.cypherLogger);
  window.logWalletEvent = window.cypherLogger.logWalletEvent.bind(window.cypherLogger);
}