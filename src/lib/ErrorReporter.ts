/**
 * 🚨 ERROR REPORTER - CYPHER ORDi FUTURE V3
 * Sistema centralizado de relatório de erros com contexto detalhado
 */

import { EnhancedLogger, LogContext } from './enhanced-logger';

export interface ErrorContext extends LogContext {
  url?: string;
  userAgent?: string;
  stackTrace?: string;
  errorBoundary?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  apiEndpoint?: string;
  httpStatus?: number;
  walletProvider?: string;
  tradingPair?: string;
  orderType?: string;
}

export interface ErrorReport {
  id: string;
  timestamp: Date;
  message: string;
  level: 'warning' | 'error' | 'critical';
  context: ErrorContext;
  resolved: boolean;
  stackTrace?: string;
}

export class ErrorReporter {
  private static instance: ErrorReporter;
  private errorQueue: ErrorReport[] = [];
  private isProduction = process.env.NODE_ENV === 'production';
  private maxQueueSize = 100;

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  static report(error: Error | string, context?: ErrorContext): string {
    const instance = ErrorReporter.getInstance();
    return instance.reportError(error, context);
  }

  static reportError(error: Error | string, context?: ErrorContext): string {
    return ErrorReporter.report(error, context);
  }

  static reportWarning(message: string, context?: ErrorContext): string {
    const instance = ErrorReporter.getInstance();
    return instance.reportWarning(message, context);
  }

  static reportCritical(error: Error | string, context?: ErrorContext): string {
    const instance = ErrorReporter.getInstance();
    return instance.reportCritical(error, context);
  }

  static getErrors(): ErrorReport[] {
    const instance = ErrorReporter.getInstance();
    return instance.getErrorQueue();
  }

  static clearErrors(): void {
    const instance = ErrorReporter.getInstance();
    instance.clearErrorQueue();
  }

  private reportError(error: Error | string, context: ErrorContext = {}): string {
    return this.createReport(error, 'error', context);
  }

  private reportWarning(message: string, context: ErrorContext = {}): string {
    return this.createReport(message, 'warning', context);
  }

  private reportCritical(error: Error | string, context: ErrorContext = {}): string {
    return this.createReport(error, 'critical', context);
  }

  private createReport(
    error: Error | string, 
    level: 'warning' | 'error' | 'critical', 
    context: ErrorContext = {}
  ): string {
    const id = this.generateErrorId();
    const timestamp = new Date();
    const message = error instanceof Error ? error.message : error;
    const stackTrace = error instanceof Error ? error.stack : undefined;

    // Enhanced context with browser information
    const enhancedContext: ErrorContext = {
      ...context,
      url: typeof window !== 'undefined' ? window.location.href : context.url,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : context.userAgent,
      stackTrace: stackTrace || context.stackTrace,
      sessionId: this.getSessionId(),
    };

    const errorReport: ErrorReport = {
      id,
      timestamp,
      message,
      level,
      context: enhancedContext,
      resolved: false,
      stackTrace,
    };

    // Add to queue
    this.errorQueue.push(errorReport);

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize / 2);
    }

    // Log with appropriate level
    switch (level) {
      case 'warning':
        EnhancedLogger.warn(`[${id}] ${message}`, enhancedContext);
        break;
      case 'error':
        EnhancedLogger.error(`[${id}] ${message}`, enhancedContext);
        break;
      case 'critical':
        EnhancedLogger.error(`[CRITICAL-${id}] ${message}`, enhancedContext);
        this.handleCriticalError(errorReport);
        break;
    }

    // Send to external service in production (if configured)
    if (this.isProduction) {
      this.sendToExternalService(errorReport).catch(err => {
        console.error('Failed to send error to external service:', err);
      });
    }

    return id;
  }

  private generateErrorId(): string {
    return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('cypher_session_id');
      if (!sessionId) {
        sessionId = `SES_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('cypher_session_id', sessionId);
      }
      return sessionId;
    }
    return 'SSR_SESSION';
  }

  private handleCriticalError(errorReport: ErrorReport): void {
    // For critical errors, we might want to:
    // 1. Show user notification
    // 2. Save to localStorage for later analysis
    // 3. Trigger emergency fallback modes

    if (typeof window !== 'undefined') {
      try {
        const criticalErrors = JSON.parse(localStorage.getItem('cypher_critical_errors') || '[]');
        criticalErrors.push({
          id: errorReport.id,
          timestamp: errorReport.timestamp,
          message: errorReport.message,
          context: errorReport.context
        });
        
        // Keep only last 10 critical errors
        if (criticalErrors.length > 10) {
          criticalErrors.splice(0, criticalErrors.length - 10);
        }
        
        localStorage.setItem('cypher_critical_errors', JSON.stringify(criticalErrors));
      } catch (err) {
        console.error('Failed to save critical error to localStorage:', err);
      }
    }
  }

  private async sendToExternalService(errorReport: ErrorReport): Promise<void> {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just log that it would be sent
    EnhancedLogger.debug('Error report would be sent to external service', {
      errorId: errorReport.id,
      level: errorReport.level
    });
  }

  private getErrorQueue(): ErrorReport[] {
    return [...this.errorQueue];
  }

  private clearErrorQueue(): void {
    this.errorQueue = [];
  }

  // Utility methods for specific error types
  static reportAPIError(endpoint: string, status: number, message: string): string {
    return ErrorReporter.report(new Error(message), {
      apiEndpoint: endpoint,
      httpStatus: status,
      component: 'API_CLIENT'
    });
  }

  static reportWalletError(provider: string, operation: string, error: Error): string {
    return ErrorReporter.report(error, {
      walletProvider: provider,
      action: operation,
      component: 'WALLET_CONNECTOR'
    });
  }

  static reportTradingError(pair: string, orderType: string, error: Error): string {
    return ErrorReporter.report(error, {
      tradingPair: pair,
      orderType: orderType,
      component: 'TRADING_ENGINE'
    });
  }

  static reportComponentError(componentName: string, props: any, error: Error): string {
    return ErrorReporter.report(error, {
      component: componentName,
      props: props,
      errorBoundary: 'REACT_ERROR_BOUNDARY'
    });
  }
}

// Default export for ES6 compatibility
export default ErrorReporter;