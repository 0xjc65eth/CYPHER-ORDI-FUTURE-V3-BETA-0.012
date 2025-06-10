/**
 * Development Utilities for Dashboard Debugging
 * Comprehensive debugging tools for identifying component rendering issues
 */

export interface ComponentDebugInfo {
  name: string;
  props: Record<string, any>;
  state?: Record<string, any>;
  renderCount: number;
  lastRender: Date;
  errors: Error[];
  warnings: string[];
  performance: {
    renderTime: number;
    memoryUsage?: number;
  };
}

export interface RenderContext {
  componentStack: string;
  errorBoundary?: string;
  renderPhase: 'mount' | 'update' | 'unmount';
}

class DevelopmentDebugger {
  private static instance: DevelopmentDebugger;
  private componentRegistry = new Map<string, ComponentDebugInfo>();
  private renderStack: string[] = [];
  private errorLog: Array<{ error: Error; context: RenderContext; timestamp: Date }> = [];
  private performanceEntries: Array<{ name: string; duration: number; timestamp: Date }> = [];
  private isDebugMode = process.env.NODE_ENV === 'development';

  static getInstance(): DevelopmentDebugger {
    if (!DevelopmentDebugger.instance) {
      DevelopmentDebugger.instance = new DevelopmentDebugger();
    }
    return DevelopmentDebugger.instance;
  }

  /**
   * Track component render with debugging information
   */
  trackComponentRender(
    componentName: string,
    props: Record<string, any> = {},
    state?: Record<string, any>
  ): void {
    if (!this.isDebugMode) return;

    const startTime = performance.now();
    const existingInfo = this.componentRegistry.get(componentName);

    const debugInfo: ComponentDebugInfo = {
      name: componentName,
      props: this.sanitizeProps(props),
      state: state ? this.sanitizeProps(state) : undefined,
      renderCount: existingInfo ? existingInfo.renderCount + 1 : 1,
      lastRender: new Date(),
      errors: existingInfo?.errors || [],
      warnings: existingInfo?.warnings || [],
      performance: {
        renderTime: performance.now() - startTime,
        memoryUsage: this.getMemoryUsage(),
      },
    };

    this.componentRegistry.set(componentName, debugInfo);
    this.logRender(componentName, debugInfo);
  }

  /**
   * Track component errors with context
   */
  trackComponentError(
    componentName: string,
    error: Error,
    context: Partial<RenderContext> = {}
  ): void {
    if (!this.isDebugMode) return;

    const fullContext: RenderContext = {
      componentStack: this.getComponentStack(),
      renderPhase: 'update',
      ...context,
    };

    // Add to error log
    this.errorLog.push({
      error,
      context: fullContext,
      timestamp: new Date(),
    });

    // Update component registry
    const componentInfo = this.componentRegistry.get(componentName);
    if (componentInfo) {
      componentInfo.errors.push(error);
      this.componentRegistry.set(componentName, componentInfo);
    }

    this.logError(componentName, error, fullContext);
  }

  /**
   * Track component warnings
   */
  trackComponentWarning(componentName: string, warning: string): void {
    if (!this.isDebugMode) return;

    const componentInfo = this.componentRegistry.get(componentName);
    if (componentInfo) {
      componentInfo.warnings.push(warning);
      this.componentRegistry.set(componentName, componentInfo);
    }

    console.warn(`🟡 [${componentName}] Warning:`, warning);
  }

  /**
   * Start performance tracking for a component
   */
  startPerformanceTrack(name: string): () => void {
    if (!this.isDebugMode) return () => {};

    const startTime = performance.now();
    const markName = `${name}-start`;
    
    if (performance.mark) {
      performance.mark(markName);
    }

    return () => {
      const duration = performance.now() - startTime;
      this.performanceEntries.push({
        name,
        duration,
        timestamp: new Date(),
      });

      if (duration > 16) { // More than one frame
        console.warn(`🐌 [Performance] ${name} took ${duration.toFixed(2)}ms`);
      }

      if (performance.mark && performance.measure) {
        const endMarkName = `${name}-end`;
        performance.mark(endMarkName);
        performance.measure(name, markName, endMarkName);
      }
    };
  }

  /**
   * Validate component element type to catch "Element type is invalid" errors
   */
  validateElementType(element: any, componentName: string): boolean {
    if (!this.isDebugMode) return true;

    try {
      // Check for undefined/null components
      if (element === undefined || element === null) {
        this.trackComponentError(
          componentName,
          new Error(`Component is ${element}. Check your imports and exports.`),
          { renderPhase: 'mount' }
        );
        return false;
      }

      // Check for invalid element types
      if (typeof element !== 'function' && typeof element !== 'object') {
        this.trackComponentError(
          componentName,
          new Error(`Invalid element type: ${typeof element}. Expected function or object.`),
          { renderPhase: 'mount' }
        );
        return false;
      }

      // Check for common import issues
      if (element && element.default && typeof element.default === 'function') {
        this.trackComponentWarning(
          componentName,
          'Component might be a default export wrapped in an object. Try destructuring or using .default'
        );
      }

      return true;
    } catch (error) {
      this.trackComponentError(componentName, error as Error, { renderPhase: 'mount' });
      return false;
    }
  }

  /**
   * Check for common React patterns that cause issues
   */
  validateReactPatterns(componentName: string, props: any = {}): string[] {
    if (!this.isDebugMode) return [];

    const issues: string[] = [];

    // Check for key prop in lists
    if (Array.isArray(props.children)) {
      const hasKeys = props.children.every((child: any) => 
        child && typeof child === 'object' && 'key' in child
      );
      if (!hasKeys) {
        issues.push('Missing key props in list items');
      }
    }

    // Check for direct object rendering
    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && !React.isValidElement(value)) {
        issues.push(`Prop '${key}' is an object that might be rendered directly`);
      }
    });

    // Check for async components
    if (typeof props.children === 'function') {
      issues.push('Children as function detected - ensure proper error handling');
    }

    issues.forEach(issue => this.trackComponentWarning(componentName, issue));
    return issues;
  }

  /**
   * Get component debugging information
   */
  getComponentInfo(componentName?: string): ComponentDebugInfo | Map<string, ComponentDebugInfo> {
    if (componentName) {
      return this.componentRegistry.get(componentName) || {} as ComponentDebugInfo;
    }
    return this.componentRegistry;
  }

  /**
   * Get error log
   */
  getErrorLog(): Array<{ error: Error; context: RenderContext; timestamp: Date }> {
    return this.errorLog;
  }

  /**
   * Get performance entries
   */
  getPerformanceEntries(): Array<{ name: string; duration: number; timestamp: Date }> {
    return this.performanceEntries;
  }

  /**
   * Clear debugging data
   */
  clearDebugData(): void {
    this.componentRegistry.clear();
    this.errorLog.length = 0;
    this.performanceEntries.length = 0;
  }

  /**
   * Generate debugging report
   */
  generateReport(): string {
    const components = Array.from(this.componentRegistry.values());
    const errorCount = this.errorLog.length;
    const warningCount = components.reduce((acc, comp) => acc + comp.warnings.length, 0);
    
    const slowComponents = this.performanceEntries
      .filter(entry => entry.duration > 16)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const frequentlyRenderingComponents = components
      .filter(comp => comp.renderCount > 10)
      .sort((a, b) => b.renderCount - a.renderCount)
      .slice(0, 10);

    return `
🔍 Dashboard Debug Report
========================
📊 Components Tracked: ${components.length}
❌ Errors: ${errorCount}
⚠️  Warnings: ${warningCount}

🐌 Slow Components (>16ms):
${slowComponents.map(comp => `  - ${comp.name}: ${comp.duration.toFixed(2)}ms`).join('\n')}

🔄 Frequently Rendering Components:
${frequentlyRenderingComponents.map(comp => `  - ${comp.name}: ${comp.renderCount} renders`).join('\n')}

💾 Memory Usage: ${this.getMemoryUsage()?.toFixed(2) || 'N/A'} MB
    `;
  }

  /**
   * Enhanced logging for component renders
   */
  private logRender(componentName: string, debugInfo: ComponentDebugInfo): void {
    if (debugInfo.renderCount === 1) {
      console.log(`🆕 [${componentName}] First render`, debugInfo);
    } else if (debugInfo.renderCount > 10 && debugInfo.renderCount % 10 === 0) {
      console.warn(`🔄 [${componentName}] Rendered ${debugInfo.renderCount} times`, debugInfo);
    }

    if (debugInfo.performance.renderTime > 16) {
      console.warn(`🐌 [${componentName}] Slow render: ${debugInfo.performance.renderTime.toFixed(2)}ms`);
    }
  }

  /**
   * Enhanced error logging
   */
  private logError(componentName: string, error: Error, context: RenderContext): void {
    console.group(`❌ [${componentName}] Component Error`);
    console.error('Error:', error);
    console.log('Context:', context);
    console.log('Component Stack:', context.componentStack);
    console.groupEnd();
  }

  /**
   * Sanitize props for logging (remove functions and large objects)
   */
  private sanitizeProps(props: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.entries(props).forEach(([key, value]) => {
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
    });

    return sanitized;
  }

  /**
   * Get current component stack
   */
  private getComponentStack(): string {
    return this.renderStack.join(' -> ') || 'Unknown';
  }

  /**
   * Get memory usage if available
   */
  private getMemoryUsage(): number | undefined {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      return (window.performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    return undefined;
  }
}

// Export singleton instance
export const devDebugger = DevelopmentDebugger.getInstance();
export const debuggerInstance = DevelopmentDebugger.getInstance();

// React import for type checking
import React from 'react';

/**
 * Higher-order component for debugging
 */
export function withDebugTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  displayName?: string
): React.ComponentType<P> {
  const componentName = displayName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';

  return function DebugTrackedComponent(props: P) {
    const endTracking = devDebugger.startPerformanceTrack(componentName);
    
    React.useEffect(() => {
      devDebugger.trackComponentRender(componentName, props);
      return endTracking;
    });

    try {
      devDebugger.validateElementType(WrappedComponent, componentName);
      devDebugger.validateReactPatterns(componentName, props);
      
      return React.createElement(WrappedComponent, props);
    } catch (error) {
      devDebugger.trackComponentError(componentName, error as Error);
      throw error;
    }
  };
}

/**
 * Hook for component debugging
 */
export function useDebugTracking(componentName: string, props?: any, state?: any) {
  React.useEffect(() => {
    devDebugger.trackComponentRender(componentName, props, state);
  });

  const trackError = React.useCallback((error: Error, context?: Partial<RenderContext>) => {
    devDebugger.trackComponentError(componentName, error, context);
  }, [componentName]);

  const trackWarning = React.useCallback((warning: string) => {
    devDebugger.trackComponentWarning(componentName, warning);
  }, [componentName]);

  return { trackError, trackWarning };
}

/**
 * Console logging helpers
 */
export const logger = {
  component: (name: string, action: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 [${name}] ${action}`, data || '');
    }
  },
  error: (component: string, error: Error, context?: any) => {
    console.group(`❌ [${component}] Error`);
    console.error(error);
    if (context) console.log('Context:', context);
    console.groupEnd();
  },
  warning: (component: string, message: string, data?: any) => {
    console.warn(`⚠️ [${component}] ${message}`, data || '');
  },
  performance: (name: string, duration: number) => {
    const emoji = duration > 16 ? '🐌' : duration > 8 ? '⏱️' : '⚡';
    console.log(`${emoji} [Performance] ${name}: ${duration.toFixed(2)}ms`);
  },
  render: (component: string, count: number) => {
    if (count > 5) {
      console.log(`🔄 [${component}] Render #${count}`);
    }
  }
};

export default devDebugger;