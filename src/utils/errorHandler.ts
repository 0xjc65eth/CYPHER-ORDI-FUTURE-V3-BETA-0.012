export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

export class CustomError extends Error {
  public code: string;
  public details?: any;
  public timestamp: Date;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class APIError extends CustomError {
  constructor(message: string, details?: any) {
    super('API_ERROR', message, details);
    this.name = 'APIError';
  }
}

export class NetworkError extends CustomError {
  constructor(message: string, details?: any) {
    super('NETWORK_ERROR', message, details);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class WalletError extends CustomError {
  constructor(message: string, details?: any) {
    super('WALLET_ERROR', message, details);
    this.name = 'WalletError';
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string, details?: any) {
    super('RATE_LIMIT_ERROR', message, details);
    this.name = 'RateLimitError';
  }
}

export class ErrorHandler {
  private static logs: ErrorDetails[] = [];
  private static maxLogs = 1000;

  public static handle(error: unknown): ErrorDetails {
    const errorDetails = this.parseError(error);
    this.logError(errorDetails);
    return errorDetails;
  }

  private static parseError(error: unknown): ErrorDetails {
    if (error instanceof CustomError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
        stack: error.stack
      };
    }

    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        timestamp: new Date(),
        stack: error.stack
      };
    }

    if (typeof error === 'string') {
      return {
        code: 'STRING_ERROR',
        message: error,
        timestamp: new Date()
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
      timestamp: new Date()
    };
  }

  private static logError(errorDetails: ErrorDetails): void {
    this.logs.unshift(errorDetails);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', errorDetails);
    }
  }

  public static getLogs(): ErrorDetails[] {
    return [...this.logs];
  }

  public static clearLogs(): void {
    this.logs = [];
  }

  public static getLogsByCode(code: string): ErrorDetails[] {
    return this.logs.filter(log => log.code === code);
  }

  public static getRecentLogs(minutes: number = 60): ErrorDetails[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.logs.filter(log => log.timestamp > cutoff);
  }
}

// Utility functions for common error scenarios
export function handleAPIResponse(response: Response): void {
  if (!response.ok) {
    throw new APIError(
      `API request failed: ${response.status} ${response.statusText}`,
      { status: response.status, statusText: response.statusText }
    );
  }
}

export function handleNetworkError(error: any): never {
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    throw new NetworkError('Network connection failed', error);
  }
  
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    throw new NetworkError('Unable to connect to server', error);
  }
  
  throw new NetworkError('Network error occurred', error);
}

export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}

export function validateAddress(address: string, type: 'bitcoin' | 'ethereum' | 'solana' = 'bitcoin'): void {
  let isValid = false;
  
  switch (type) {
    case 'bitcoin':
      // Bitcoin address validation (simplified)
      isValid = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(address);
      break;
    case 'ethereum':
      // Ethereum address validation
      isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
      break;
    case 'solana':
      // Solana address validation (base58, 32-44 chars)
      isValid = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      break;
  }
  
  if (!isValid) {
    throw new ValidationError(`Invalid ${type} address format`);
  }
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => R
): (...args: T) => R {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      ErrorHandler.handle(error);
      throw error;
    }
  };
}

export function withAsyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorHandler.handle(error);
      throw error;
    }
  };
}

// Rate limiting helper
export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests: number[] = [];
  
  return function checkRateLimit(): void {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove old requests
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    
    if (requests.length >= maxRequests) {
      throw new RateLimitError(
        `Rate limit exceeded: ${maxRequests} requests per ${windowMs}ms`,
        { maxRequests, windowMs, currentRequests: requests.length }
      );
    }
    
    requests.push(now);
  };
}

export default ErrorHandler;