// Error Boundaries Types for Production System
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

export interface ErrorContextInfo {
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId: string;
  buildVersion?: string;
  environment: 'development' | 'production' | 'staging';
  component?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  errorInfo: ErrorInfo;
  context: ErrorContextInfo;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 
    | 'ui_render' 
    | 'api_call' 
    | 'wallet_interaction' 
    | 'trading_operation' 
    | 'ai_processing' 
    | 'async_operation'
    | 'blockchain_interaction'
    | 'data_processing'
    | 'network_error'
    | 'authentication'
    | 'validation'
    | 'unknown';
}

export interface ErrorBoundaryConfig {
  name: string;
  level: 'global' | 'page' | 'component' | 'feature';
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (report: ErrorReport) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableRecovery?: boolean;
  enableReporting?: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  captureUserActions?: boolean;
  captureStateSnapshot?: boolean;
}

export interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  retry?: () => void;
  reset?: () => void;
  report?: ErrorReport;
  config?: ErrorBoundaryConfig;
  componentName?: string;
  canRecover?: boolean;
  hasNetworkError?: boolean;
  isBlockchainError?: boolean;
  isWalletError?: boolean;
  isTradingError?: boolean;
  isAIError?: boolean;
}

export interface RecoveryAction {
  type: 'retry' | 'reload' | 'navigate' | 'reset_state' | 'fallback_mode';
  label: string;
  action: () => void | Promise<void>;
  icon?: React.ComponentType<any>;
  primary?: boolean;
  destructive?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
  lastErrorTime?: Date;
  isRecovering: boolean;
  recoveryActions?: RecoveryAction[];
  errorReport?: ErrorReport;
}

export interface ErrorLogger {
  error: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
  report: (report: ErrorReport) => Promise<void>;
}

export interface ErrorMonitoringService {
  captureException: (error: Error, context?: Partial<ErrorContextInfo>) => void;
  captureMessage: (message: string, level?: string, context?: any) => void;
  setUser: (user: { id: string; email?: string }) => void;
  setTag: (key: string, value: string) => void;
  setContext: (key: string, context: any) => void;
  addBreadcrumb: (breadcrumb: { message: string; category?: string; level?: string; data?: any }) => void;
}

// Enhanced Error Types for specific domains
export interface WalletError extends Error {
  code?: string | number;
  walletType?: 'xverse' | 'unisat' | 'okx' | 'metamask' | 'phantom';
  operation?: 'connect' | 'sign' | 'send' | 'balance' | 'switch_network';
  chainId?: string;
  address?: string;
}

export interface TradingError extends Error {
  code?: string | number;
  exchange?: string;
  pair?: string;
  operation?: 'buy' | 'sell' | 'swap' | 'estimate' | 'approve';
  amount?: string;
  slippage?: number;
  gasEstimate?: string;
}

export interface AIError extends Error {
  model?: string;
  operation?: 'prediction' | 'analysis' | 'training' | 'inference';
  inputData?: any;
  modelVersion?: string;
  processingTime?: number;
}

export interface APIError extends Error {
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status?: number;
  response?: any;
  requestId?: string;
  retryable?: boolean;
}

export interface BlockchainError extends Error {
  network?: 'bitcoin' | 'ethereum' | 'solana';
  type?: 'rpc' | 'mempool' | 'confirmation' | 'validation';
  txHash?: string;
  blockHeight?: number;
  gasUsed?: string;
}