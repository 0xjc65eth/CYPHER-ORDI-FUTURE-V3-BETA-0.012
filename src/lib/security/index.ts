// Exportar todas as classes e funções de segurança
export { SecureVault } from './vault/SecureVault';
export type { APIKey, EncryptedData } from './vault/SecureVault';

export { RateLimiter } from './rateLimit/RateLimiter';
export type { RateLimitConfig } from './rateLimit/RateLimiter';

export { TwoFactorAuth } from './auth/TwoFactorAuth';
export type { UserTwoFactor } from './auth/TwoFactorAuth';

export { InputValidator, CommonSchemas, APISchemas } from './validation/InputValidator';

export {
  securityMiddleware,
  generateCSRFToken,
  generateJWT,
  blacklistJWT,
  createInputValidator,
} from '@/middleware/security';

// Wallet Security System - AGENT 5 Implementation
export {
  WalletSecurityManager,
  walletSecurity,
  SecurityLevel,
  WalletProvider,
  type SecurityConfig,
  type SecurityContext,
  type WalletConnectionResult
} from '../walletSecurity';

export {
  AddressValidator,
  addressValidator,
  AddressType,
  type AddressValidationResult
} from '../addressValidation';

export {
  WalletDetector,
  walletDetector,
  WalletCapability,
  SecurityFeature,
  type WalletDetectionResult
} from '../walletDetection';

export {
  SecurityLogger,
  securityLogger,
  LogLevel,
  SecurityEventType,
  type SecurityLogEntry,
  type LogConfig,
  type LogSummary
} from '../securityLogs';

export {
  ValidationUtils,
  validationUtils,
  type ValidationResult,
  type SanitizationOptions
} from '../../utils/validation';

// Sistema integrado de segurança
import { SecureVault } from './vault/SecureVault';
import { RateLimiter } from './rateLimit/RateLimiter';
import { TwoFactorAuth } from './auth/TwoFactorAuth';
import { InputValidator } from './validation/InputValidator';
import { WalletSecurityManager, walletSecurity } from '../walletSecurity';
import { AddressValidator, addressValidator } from '../addressValidation';
import { WalletDetector, walletDetector } from '../walletDetection';
import { SecurityLogger, securityLogger } from '../securityLogs';
import { ValidationUtils, validationUtils } from '../../utils/validation';
import { logger } from '@/lib/logger';

export class SecuritySystem {
  private static instance: SecuritySystem;
  
  public vault: SecureVault;
  public rateLimiter: RateLimiter;
  public twoFactorAuth: TwoFactorAuth;
  public inputValidator: typeof InputValidator;
  
  // Wallet Security Components - AGENT 5
  public walletSecurity: WalletSecurityManager;
  public addressValidator: AddressValidator;
  public walletDetector: WalletDetector;
  public securityLogger: SecurityLogger;
  public validationUtils: ValidationUtils;
  
  private constructor() {
    this.vault = SecureVault.getInstance();
    this.rateLimiter = new RateLimiter();
    this.twoFactorAuth = new TwoFactorAuth();
    this.inputValidator = InputValidator;
    
    // Initialize wallet security components
    this.walletSecurity = walletSecurity;
    this.addressValidator = addressValidator;
    this.walletDetector = walletDetector;
    this.securityLogger = securityLogger;
    this.validationUtils = validationUtils;
    
    logger.info('Security system initialized with wallet security');
  }
  
  public static getInstance(): SecuritySystem {
    if (!SecuritySystem.instance) {
      SecuritySystem.instance = new SecuritySystem();
    }
    return SecuritySystem.instance;
  }
  
  // Métodos de conveniência
  async checkSecurity(request: {
    userId?: string;
    ip: string;
    endpoint: string;
    data?: unknown;
  }): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // 1. Verificar blacklist
    if (await this.rateLimiter.isBlacklisted(request.ip)) {
      return { allowed: false, reason: 'IP blacklisted' };
    }
    
    // 2. Verificar rate limit
    const rateLimit = await this.rateLimiter.checkIPLimit(request.ip, {
      windowMs: 60000,
      maxRequests: 100,
    });
    
    if (!rateLimit.allowed) {
      return { allowed: false, reason: 'Rate limit exceeded' };
    }
    
    // 3. Verificar 2FA se necessário
    if (request.userId && this.isSensitiveEndpoint(request.endpoint)) {
      const is2FAEnabled = await this.twoFactorAuth.is2FAEnabled(request.userId);
      if (is2FAEnabled) {
        return { allowed: false, reason: '2FA verification required' };
      }
    }
    
    return { allowed: true };
  }
  
  private isSensitiveEndpoint(endpoint: string): boolean {
    const sensitive = ['/trading', '/wallet', '/admin'];
    return sensitive.some(path => endpoint.startsWith(path));
  }
  
  // Wallet Security Methods - AGENT 5
  async secureWalletConnection(walletProvider?: string, timeout?: number) {
    return await this.walletSecurity.secureWalletConnection(
      walletProvider as any,
      timeout
    );
  }
  
  async validateBitcoinAddress(address: string, allowedNetworks?: string[]) {
    return this.addressValidator.validateBitcoinAddress(address, allowedNetworks);
  }
  
  async detectAvailableWallets() {
    return await this.walletDetector.detectWallets();
  }
  
  async validateTransactionSignature(
    sessionId: string,
    message: string,
    signature: string,
    address: string
  ) {
    return await this.walletSecurity.validateTransactionSignature(
      sessionId,
      message,
      signature,
      address
    );
  }
  
  getWalletSecurityAuditReport() {
    return this.walletSecurity.getSecurityAuditReport();
  }
  
  getSecurityLogSummary(timeframe?: { start: Date; end: Date }) {
    return this.securityLogger.getLogSummary(timeframe);
  }
  
  // Auditoria de segurança
  async logSecurityEvent(event: {
    type: 'access' | 'violation' | 'auth' | 'error';
    user?: string;
    action: string;
    resource: string;
    result: 'success' | 'failure';
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.vault.logSecurityEvent(event);
  }
  
  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, boolean>;
  }> {
    const components: Record<string, boolean> = {};
    
    try {
      // Testar Vault
      await this.vault.getSecret('health-check');
      components.vault = true;
    } catch {
      components.vault = false;
    }
    
    try {
      // Testar Redis
      await this.rateLimiter.checkLimit('health-check', {
        windowMs: 1000,
        maxRequests: 1,
      });
      components.redis = true;
    } catch {
      components.redis = false;
    }
    
    const allHealthy = Object.values(components).every(v => v);
    const anyHealthy = Object.values(components).some(v => v);
    
    return {
      status: allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy',
      components,
    };
  }
}