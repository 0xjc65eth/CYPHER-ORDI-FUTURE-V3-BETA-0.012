/**
 * Enhanced Console Logging Helpers for Component Debugging
 * Provides structured logging with render tracking and visual formatting
 */

interface LoggerConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  timestamp: boolean;
  stack: boolean;
  colors: boolean;
  persist: boolean;
}

interface RenderLog {
  componentName: string;
  renderCount: number;
  props: any;
  state?: any;
  timestamp: Date;
  renderTime: number;
}

interface ErrorLog {
  componentName: string;
  error: Error;
  context: any;
  timestamp: Date;
  stack: string;
}

class ConsoleLogger {
  private static instance: ConsoleLogger;
  private config: LoggerConfig;
  private renderLogs: RenderLog[] = [];
  private errorLogs: ErrorLog[] = [];
  private componentColors = new Map<string, string>();
  private renderCounts = new Map<string, number>();

  // Console colors for different component types
  private readonly colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  private constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      level: 'debug',
      timestamp: true,
      stack: false,
      colors: true,
      persist: false
    };
  }

  static getInstance(): ConsoleLogger {
    if (!ConsoleLogger.instance) {
      ConsoleLogger.instance = new ConsoleLogger();
    }
    return ConsoleLogger.instance;
  }

  /**
   * Configure logger settings
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log component render with enhanced formatting
   */
  logRender(
    componentName: string,
    props: any = {},
    state?: any,
    renderTime: number = 0
  ): void {
    if (!this.config.enabled) return;

    const renderCount = (this.renderCounts.get(componentName) || 0) + 1;
    this.renderCounts.set(componentName, renderCount);

    const color = this.getComponentColor(componentName);
    const timestamp = this.config.timestamp ? new Date().toLocaleTimeString() : '';
    
    const renderLog: RenderLog = {
      componentName,
      renderCount,
      props: this.sanitizeForLogging(props),
      state: state ? this.sanitizeForLogging(state) : undefined,
      timestamp: new Date(),
      renderTime
    };

    if (this.config.persist) {
      this.renderLogs.push(renderLog);
      this.trimLogs();
    }

    // Enhanced console output
    console.group(
      `%c🔄 [${componentName}] Render #${renderCount} ${timestamp}`,
      `color: ${color}; font-weight: bold;`
    );

    if (renderTime > 0) {
      const performanceColor = renderTime > 16 ? '#ff4757' : renderTime > 8 ? '#ffa726' : '#26de81';
      console.log(
        `%c⏱️ Render Time: ${renderTime.toFixed(2)}ms`,
        `color: ${performanceColor}; font-weight: bold;`
      );
    }

    // Render count warnings
    if (renderCount > 10 && renderCount % 5 === 0) {
      console.warn(
        `%c🔄 High render count detected: ${renderCount} renders`,
        'color: #ff9500; font-weight: bold;'
      );
    }

    // Props logging
    if (Object.keys(props).length > 0) {
      console.log('%cProps:', 'color: #74b9ff; font-weight: bold;', props);
    }

    // State logging
    if (state && Object.keys(state).length > 0) {
      console.log('%cState:', 'color: #fd79a8; font-weight: bold;', state);
    }

    console.groupEnd();
  }

  /**
   * Log component errors with stack trace
   */
  logError(
    componentName: string,
    error: Error,
    context: any = {},
    showStack: boolean = true
  ): void {
    if (!this.config.enabled) return;

    const color = this.getComponentColor(componentName);
    const timestamp = this.config.timestamp ? new Date().toLocaleTimeString() : '';
    
    const errorLog: ErrorLog = {
      componentName,
      error,
      context: this.sanitizeForLogging(context),
      timestamp: new Date(),
      stack: error.stack || ''
    };

    if (this.config.persist) {
      this.errorLogs.push(errorLog);
      this.trimLogs();
    }

    console.group(
      `%c❌ [${componentName}] Error ${timestamp}`,
      `color: ${color}; background: #ff4757; padding: 2px 4px; border-radius: 3px; font-weight: bold;`
    );

    console.error('%cError Message:', 'color: #ff4757; font-weight: bold;', error.message);
    
    if (Object.keys(context).length > 0) {
      console.log('%cError Context:', 'color: #ff6348; font-weight: bold;', context);
    }

    if ((showStack || this.config.stack) && error.stack) {
      console.log('%cStack Trace:', 'color: #ff7675; font-weight: bold;');
      console.log(error.stack);
    }

    console.groupEnd();

    // Additional error analysis
    this.analyzeError(componentName, error);
  }

  /**
   * Log component warnings
   */
  logWarning(
    componentName: string,
    message: string,
    data?: any
  ): void {
    if (!this.config.enabled) return;

    const color = this.getComponentColor(componentName);
    const timestamp = this.config.timestamp ? new Date().toLocaleTimeString() : '';

    console.warn(
      `%c⚠️ [${componentName}] Warning ${timestamp}`,
      `color: ${color}; background: #ffa726; padding: 2px 4px; border-radius: 3px; font-weight: bold;`
    );
    
    console.warn('%cMessage:', 'color: #ffa726; font-weight: bold;', message);
    
    if (data) {
      console.warn('%cData:', 'color: #ffb74d; font-weight: bold;', data);
    }
  }

  /**
   * Log component lifecycle events
   */
  logLifecycle(
    componentName: string,
    event: 'mount' | 'update' | 'unmount',
    data?: any
  ): void {
    if (!this.config.enabled) return;

    const color = this.getComponentColor(componentName);
    const icons = { mount: '🆕', update: '🔄', unmount: '🗑️' };
    const timestamp = this.config.timestamp ? new Date().toLocaleTimeString() : '';

    console.log(
      `%c${icons[event]} [${componentName}] ${event.toUpperCase()} ${timestamp}`,
      `color: ${color}; font-weight: bold;`
    );

    if (data) {
      console.log('%cData:', 'color: #6c5ce7; font-weight: bold;', data);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformance(
    componentName: string,
    metric: string,
    value: number,
    unit: string = 'ms'
  ): void {
    if (!this.config.enabled) return;

    const color = this.getComponentColor(componentName);
    const performanceColor = this.getPerformanceColor(value, unit);
    
    console.log(
      `%c⚡ [${componentName}] ${metric}: %c${value.toFixed(2)}${unit}`,
      `color: ${color}; font-weight: bold;`,
      `color: ${performanceColor}; font-weight: bold;`
    );
  }

  /**
   * Log API calls and responses
   */
  logAPI(
    componentName: string,
    method: string,
    url: string,
    status?: number,
    duration?: number,
    data?: any
  ): void {
    if (!this.config.enabled) return;

    const color = this.getComponentColor(componentName);
    const statusColor = status ? this.getStatusColor(status) : '#74b9ff';
    
    console.group(
      `%c🌐 [${componentName}] API ${method.toUpperCase()} ${url}`,
      `color: ${color}; font-weight: bold;`
    );

    if (status) {
      console.log(
        `%cStatus: ${status}`,
        `color: ${statusColor}; font-weight: bold;`
      );
    }

    if (duration) {
      console.log(
        `%cDuration: ${duration.toFixed(2)}ms`,
        `color: ${this.getPerformanceColor(duration)}; font-weight: bold;`
      );
    }

    if (data) {
      console.log('%cResponse Data:', 'color: #00b894; font-weight: bold;', data);
    }

    console.groupEnd();
  }

  /**
   * Create a debug table for component data
   */
  logTable(
    componentName: string,
    title: string,
    data: any[]
  ): void {
    if (!this.config.enabled || !Array.isArray(data)) return;

    const color = this.getComponentColor(componentName);
    
    console.log(
      `%c📊 [${componentName}] ${title}`,
      `color: ${color}; font-weight: bold;`
    );
    
    console.table(data);
  }

  /**
   * Group related logs together
   */
  logGroup(
    componentName: string,
    title: string,
    callback: () => void
  ): void {
    if (!this.config.enabled) return;

    const color = this.getComponentColor(componentName);
    
    console.group(
      `%c📁 [${componentName}] ${title}`,
      `color: ${color}; font-weight: bold;`
    );
    
    callback();
    console.groupEnd();
  }

  /**
   * Get render statistics for a component
   */
  getRenderStats(componentName?: string): any {
    if (componentName) {
      const renders = this.renderLogs.filter(log => log.componentName === componentName);
      return {
        totalRenders: renders.length,
        averageRenderTime: renders.reduce((acc, log) => acc + log.renderTime, 0) / renders.length,
        lastRender: renders[renders.length - 1]?.timestamp
      };
    }

    return {
      totalComponents: this.renderCounts.size,
      totalRenders: Array.from(this.renderCounts.values()).reduce((acc, count) => acc + count, 0),
      renderLogs: this.renderLogs.length,
      errorLogs: this.errorLogs.length
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.renderLogs = [];
    this.errorLogs = [];
    this.renderCounts.clear();
    console.clear();
    console.log('%c🧹 Debug logs cleared', 'color: #00b894; font-weight: bold;');
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify({
      renderLogs: this.renderLogs,
      errorLogs: this.errorLogs,
      renderCounts: Array.from(this.renderCounts.entries()),
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Get a consistent color for a component
   */
  private getComponentColor(componentName: string): string {
    if (!this.componentColors.has(componentName)) {
      const colorIndex = this.componentColors.size % this.colors.length;
      this.componentColors.set(componentName, this.colors[colorIndex]);
    }
    return this.componentColors.get(componentName)!;
  }

  /**
   * Get color based on performance value
   */
  private getPerformanceColor(value: number, unit: string = 'ms'): string {
    if (unit === 'ms') {
      return value > 50 ? '#ff4757' : value > 16 ? '#ffa726' : '#26de81';
    }
    return '#74b9ff';
  }

  /**
   * Get color based on HTTP status
   */
  private getStatusColor(status: number): string {
    if (status >= 500) return '#ff4757';
    if (status >= 400) return '#ffa726';
    if (status >= 300) return '#74b9ff';
    return '#26de81';
  }

  /**
   * Sanitize data for logging (remove functions, etc.)
   */
  private sanitizeForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) return data;

    const sanitized: any = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
      } else if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          sanitized[key] = `[Array(${value.length})]`;
        } else {
          sanitized[key] = '[Object]';
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Analyze errors for common patterns
   */
  private analyzeError(componentName: string, error: Error): void {
    const message = error.message.toLowerCase();
    
    if (message.includes('element type is invalid')) {
      console.log(
        '%c💡 Tip: Check your component imports/exports. This usually happens when:',
        'color: #0984e3; font-weight: bold;'
      );
      console.log('   • Component is undefined or null');
      console.log('   • Missing default export');
      console.log('   • Circular import dependency');
      console.log('   • Component not properly exported');
    }
    
    if (message.includes('cannot read prop') || message.includes('undefined')) {
      console.log(
        '%c💡 Tip: Add prop validation or default values',
        'color: #0984e3; font-weight: bold;'
      );
    }
    
    if (message.includes('maximum update depth')) {
      console.log(
        '%c💡 Tip: Infinite render loop detected. Check useEffect dependencies',
        'color: #0984e3; font-weight: bold;'
      );
    }
  }

  /**
   * Trim logs to prevent memory issues
   */
  private trimLogs(): void {
    const maxLogs = 1000;
    if (this.renderLogs.length > maxLogs) {
      this.renderLogs = this.renderLogs.slice(-maxLogs);
    }
    if (this.errorLogs.length > maxLogs) {
      this.errorLogs = this.errorLogs.slice(-maxLogs);
    }
  }
}

// Export singleton instance
export const consoleLogger = ConsoleLogger.getInstance();

// Convenience hooks for React components
export function useRenderLogger(componentName: string) {
  const logRender = React.useCallback((props?: any, state?: any, renderTime?: number) => {
    consoleLogger.logRender(componentName, props, state, renderTime);
  }, [componentName]);

  const logError = React.useCallback((error: Error, context?: any) => {
    consoleLogger.logError(componentName, error, context);
  }, [componentName]);

  const logWarning = React.useCallback((message: string, data?: any) => {
    consoleLogger.logWarning(componentName, message, data);
  }, [componentName]);

  const logLifecycle = React.useCallback((event: 'mount' | 'update' | 'unmount', data?: any) => {
    consoleLogger.logLifecycle(componentName, event, data);
  }, [componentName]);

  return { logRender, logError, logWarning, logLifecycle };
}

// Higher-order component for automatic render logging
export function withRenderLogger<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string
): React.ComponentType<P> {
  const componentName = displayName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';

  return function RenderLoggedComponent(props: P) {
    const renderStart = performance.now();
    
    React.useEffect(() => {
      consoleLogger.logLifecycle(componentName, 'mount');
      return () => consoleLogger.logLifecycle(componentName, 'unmount');
    }, []);

    React.useEffect(() => {
      const renderTime = performance.now() - renderStart;
      consoleLogger.logRender(componentName, props, undefined, renderTime);
    });

    return React.createElement(WrappedComponent, props);
  };
}

import React from 'react';

export default consoleLogger;