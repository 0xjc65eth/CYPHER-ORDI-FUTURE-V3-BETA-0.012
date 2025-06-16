// Global error handler for application-wide error management

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler | null = null;
  private errorCallbacks: Array<(error: Error, context?: string) => void> = [];

  private constructor() {}

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  public static init(): void {
    const handler = GlobalErrorHandler.getInstance();
    
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        handler.handleError(new Error(event.reason), 'unhandledrejection');
        event.preventDefault();
      });

      // Handle global errors
      window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        handler.handleError(event.error, 'global');
      });
    }
  }

  public handleError(error: Error, context?: string): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context || 'Unknown'}] Error:`, error);
    }

    // Call registered callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error, context);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });

    // In production, you might want to send errors to a service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { tags: { context } });
    }
  }

  public onError(callback: (error: Error, context?: string) => void): void {
    this.errorCallbacks.push(callback);
  }

  public removeErrorCallback(callback: (error: Error, context?: string) => void): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  public clearErrorCallbacks(): void {
    this.errorCallbacks = [];
  }
}

// Convenience function for error handling
export function handleError(error: Error, context?: string): void {
  GlobalErrorHandler.getInstance().handleError(error, context);
}

// Error boundary component props
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export default GlobalErrorHandler;