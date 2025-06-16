/**
 * HMAC Security System for CYPHER ORDi Future V3
 * Advanced cryptographic security layer for all API communications
 */

import crypto from 'crypto';
import { EnhancedLogger } from '@/lib/enhanced-logger';

export interface SecurityConfig {
  hmacSecret: string;
  encryptionKey: string;
  algorithm: 'sha256' | 'sha512';
  timestampWindow: number; // seconds
  nonceExpiry: number; // seconds
  maxRequestsPerMinute: number;
  enableEncryption: boolean;
  enableSignatureValidation: boolean;
}

export interface SecurityCredentials {
  apiKey: string;
  secretKey: string;
  accountId?: string;
  permissions: string[];
  ipWhitelist?: string[];
  rateLimits?: {
    requests: number;
    window: number;
  };
}

export interface SecurityContext {
  timestamp: number;
  nonce: string;
  signature: string;
  apiKey: string;
  requestId: string;
  clientInfo: {
    userAgent: string;
    ip: string;
    fingerprint?: string;
  };
}

export interface SecureRequest {
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  signature: string;
  nonce: string;
}

export interface SecurityAuditLog {
  timestamp: number;
  event: 'request' | 'validation' | 'breach' | 'rate_limit' | 'auth_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: {
    apiKey?: string;
    endpoint?: string;
    ip?: string;
    reason?: string;
    metadata?: Record<string, any>;
  };
}

export class HMACSecuritySystem {
  private config: SecurityConfig;
  private logger: EnhancedLogger;
  private credentials: Map<string, SecurityCredentials> = new Map();
  private usedNonces: Set<string> = new Set();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();
  private auditLogs: SecurityAuditLog[] = [];
  private encryptionCache: Map<string, { data: string; timestamp: number }> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
    this.logger = new EnhancedLogger();
    
    // Clean up expired nonces and rate limiters periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
    
    this.logger.info('HMAC Security System initialized', {
      component: 'HMACSecuritySystem',
      algorithm: config.algorithm,
      timestampWindow: config.timestampWindow
    });
  }

  /**
   * Register API credentials
   */
  registerCredentials(credentials: SecurityCredentials): void {
    this.credentials.set(credentials.apiKey, credentials);
    
    this.logger.info('API credentials registered', {
      apiKey: credentials.apiKey.substring(0, 8) + '***',
      permissions: credentials.permissions
    });
  }

  /**
   * Generate secure request with HMAC signature
   */
  generateSecureRequest(
    method: string,
    endpoint: string,
    body: any,
    apiKey: string
  ): SecureRequest {
    const credentials = this.credentials.get(apiKey);
    if (!credentials) {
      throw new Error('Invalid API key');
    }

    const timestamp = Date.now();
    const nonce = this.generateNonce();
    
    // Create signature
    const signature = this.createSignature(
      method,
      endpoint,
      body,
      timestamp,
      nonce,
      credentials.secretKey
    );

    const headers = {
      'X-API-Key': apiKey,
      'X-Timestamp': timestamp.toString(),
      'X-Nonce': nonce,
      'X-Signature': signature,
      'Content-Type': 'application/json'
    };

    // Encrypt body if enabled
    let processedBody = body;
    if (this.config.enableEncryption && body) {
      processedBody = this.encryptData(JSON.stringify(body));
      headers['X-Encrypted'] = 'true';
    }

    return {
      method,
      endpoint,
      headers,
      body: processedBody,
      timestamp,
      signature,
      nonce
    };
  }

  /**
   * Validate incoming request
   */
  validateRequest(
    method: string,
    endpoint: string,
    headers: Record<string, string>,
    body: any,
    clientInfo: { ip: string; userAgent: string }
  ): SecurityContext {
    const apiKey = headers['x-api-key'] || headers['X-API-Key'];
    const timestamp = parseInt(headers['x-timestamp'] || headers['X-Timestamp']);
    const nonce = headers['x-nonce'] || headers['X-Nonce'];
    const signature = headers['x-signature'] || headers['X-Signature'];

    if (!apiKey || !timestamp || !nonce || !signature) {
      this.logSecurityEvent('auth_failure', 'high', {
        reason: 'Missing security headers',
        ip: clientInfo.ip,
        endpoint
      });
      throw new Error('Missing required security headers');
    }

    // Validate credentials
    const credentials = this.credentials.get(apiKey);
    if (!credentials) {
      this.logSecurityEvent('auth_failure', 'high', {
        apiKey: apiKey.substring(0, 8) + '***',
        reason: 'Invalid API key',
        ip: clientInfo.ip
      });
      throw new Error('Invalid API key');
    }

    // Check IP whitelist
    if (credentials.ipWhitelist && !credentials.ipWhitelist.includes(clientInfo.ip)) {
      this.logSecurityEvent('breach', 'critical', {
        apiKey: apiKey.substring(0, 8) + '***',
        reason: 'IP not whitelisted',
        ip: clientInfo.ip
      });
      throw new Error('IP address not authorized');
    }

    // Check rate limits
    this.checkRateLimit(apiKey, clientInfo.ip);

    // Validate timestamp
    this.validateTimestamp(timestamp);

    // Validate nonce
    this.validateNonce(nonce);

    // Decrypt body if needed
    let processedBody = body;
    const isEncrypted = headers['x-encrypted'] === 'true';
    if (isEncrypted && this.config.enableEncryption) {
      processedBody = JSON.parse(this.decryptData(body));
    }

    // Validate signature
    const expectedSignature = this.createSignature(
      method,
      endpoint,
      processedBody,
      timestamp,
      nonce,
      credentials.secretKey
    );

    if (!this.verifySignature(signature, expectedSignature)) {
      this.logSecurityEvent('breach', 'critical', {
        apiKey: apiKey.substring(0, 8) + '***',
        reason: 'Invalid signature',
        ip: clientInfo.ip,
        endpoint
      });
      throw new Error('Invalid signature');
    }

    // Add nonce to used set
    this.usedNonces.add(nonce);

    // Log successful validation
    this.logSecurityEvent('validation', 'low', {
      apiKey: apiKey.substring(0, 8) + '***',
      endpoint,
      ip: clientInfo.ip
    });

    return {
      timestamp,
      nonce,
      signature,
      apiKey,
      requestId: this.generateRequestId(),
      clientInfo
    };
  }

  /**
   * Create HMAC signature
   */
  createSignature(
    method: string,
    endpoint: string,
    body: any,
    timestamp: number,
    nonce: string,
    secretKey: string
  ): string {
    const bodyString = body ? JSON.stringify(body) : '';
    const message = `${method}|${endpoint}|${bodyString}|${timestamp}|${nonce}`;
    
    return crypto
      .createHmac(this.config.algorithm, secretKey)
      .update(message)
      .digest('hex');
  }

  /**
   * Verify signature
   */
  verifySignature(provided: string, expected: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(provided, 'hex'),
      Buffer.from(expected, 'hex')
    );
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.config.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', this.config.encryptionKey);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate secure API key pair
   */
  generateAPIKeyPair(): { apiKey: string; secretKey: string } {
    const apiKey = 'ck_' + crypto.randomBytes(16).toString('hex');
    const secretKey = 'cs_' + crypto.randomBytes(32).toString('hex');
    
    return { apiKey, secretKey };
  }

  /**
   * Rotate API credentials
   */
  rotateCredentials(apiKey: string): { newApiKey: string; newSecretKey: string } {
    const credentials = this.credentials.get(apiKey);
    if (!credentials) {
      throw new Error('API key not found');
    }

    const newPair = this.generateAPIKeyPair();
    
    // Create new credentials with same permissions
    const newCredentials: SecurityCredentials = {
      ...credentials,
      apiKey: newPair.apiKey,
      secretKey: newPair.secretKey
    };

    // Register new credentials
    this.registerCredentials(newCredentials);
    
    // Schedule old credentials for deletion after grace period
    setTimeout(() => {
      this.credentials.delete(apiKey);
      this.logger.info('Old credentials removed', { oldApiKey: apiKey.substring(0, 8) + '***' });
    }, 24 * 60 * 60 * 1000); // 24 hours grace period

    this.logSecurityEvent('request', 'medium', {
      apiKey: apiKey.substring(0, 8) + '***',
      reason: 'Credentials rotated',
      metadata: { newApiKey: newPair.apiKey.substring(0, 8) + '***' }
    });

    return newPair;
  }

  /**
   * Get security audit logs
   */
  getAuditLogs(
    startTime?: number,
    endTime?: number,
    severity?: string
  ): SecurityAuditLog[] {
    let logs = this.auditLogs;

    if (startTime) {
      logs = logs.filter(log => log.timestamp >= startTime);
    }

    if (endTime) {
      logs = logs.filter(log => log.timestamp <= endTime);
    }

    if (severity) {
      logs = logs.filter(log => log.severity === severity);
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Generate security report
   */
  generateSecurityReport(timeframe: number = 24 * 60 * 60 * 1000): {
    summary: {
      totalRequests: number;
      validRequests: number;
      failedRequests: number;
      securityBreaches: number;
      rateLimitHits: number;
    };
    topApiKeys: Array<{ apiKey: string; requests: number }>;
    threatAnalysis: {
      suspiciousIPs: string[];
      failureReasons: Record<string, number>;
    };
    recommendations: string[];
  } {
    const startTime = Date.now() - timeframe;
    const logs = this.getAuditLogs(startTime);

    const summary = {
      totalRequests: logs.filter(l => l.event === 'request' || l.event === 'validation').length,
      validRequests: logs.filter(l => l.event === 'validation').length,
      failedRequests: logs.filter(l => l.event === 'auth_failure').length,
      securityBreaches: logs.filter(l => l.event === 'breach').length,
      rateLimitHits: logs.filter(l => l.event === 'rate_limit').length
    };

    // Analyze API key usage
    const apiKeyUsage = new Map<string, number>();
    logs.forEach(log => {
      if (log.details.apiKey) {
        const key = log.details.apiKey;
        apiKeyUsage.set(key, (apiKeyUsage.get(key) || 0) + 1);
      }
    });

    const topApiKeys = Array.from(apiKeyUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([apiKey, requests]) => ({ apiKey, requests }));

    // Analyze threats
    const suspiciousIPs = new Set<string>();
    const failureReasons = new Map<string, number>();

    logs.filter(l => l.event === 'breach' || l.event === 'auth_failure').forEach(log => {
      if (log.details.ip) {
        suspiciousIPs.add(log.details.ip);
      }
      if (log.details.reason) {
        const reason = log.details.reason;
        failureReasons.set(reason, (failureReasons.get(reason) || 0) + 1);
      }
    });

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (summary.securityBreaches > 0) {
      recommendations.push('Investigate security breaches and consider IP blocking');
    }
    
    if (summary.failedRequests / summary.totalRequests > 0.1) {
      recommendations.push('High authentication failure rate - review API key management');
    }
    
    if (suspiciousIPs.size > 5) {
      recommendations.push('Multiple suspicious IPs detected - consider enhancing IP filtering');
    }

    return {
      summary,
      topApiKeys,
      threatAnalysis: {
        suspiciousIPs: Array.from(suspiciousIPs),
        failureReasons: Object.fromEntries(failureReasons)
      },
      recommendations
    };
  }

  /**
   * Private helper methods
   */

  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private validateTimestamp(timestamp: number): void {
    const now = Date.now();
    const diff = Math.abs(now - timestamp) / 1000;

    if (diff > this.config.timestampWindow) {
      this.logSecurityEvent('breach', 'high', {
        reason: 'Timestamp outside allowed window',
        metadata: { timestamp, diff, allowedWindow: this.config.timestampWindow }
      });
      throw new Error('Request timestamp is too old or too far in the future');
    }
  }

  private validateNonce(nonce: string): void {
    if (this.usedNonces.has(nonce)) {
      this.logSecurityEvent('breach', 'critical', {
        reason: 'Nonce replay attack',
        metadata: { nonce }
      });
      throw new Error('Nonce has already been used');
    }

    if (nonce.length < 16) {
      this.logSecurityEvent('breach', 'medium', {
        reason: 'Weak nonce',
        metadata: { nonceLength: nonce.length }
      });
      throw new Error('Nonce is too short');
    }
  }

  private checkRateLimit(apiKey: string, ip: string): void {
    const key = `${apiKey}:${ip}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    let limiter = this.rateLimiters.get(key);
    if (!limiter || now > limiter.resetTime) {
      limiter = {
        count: 0,
        resetTime: now + windowMs
      };
      this.rateLimiters.set(key, limiter);
    }

    limiter.count++;

    if (limiter.count > this.config.maxRequestsPerMinute) {
      this.logSecurityEvent('rate_limit', 'medium', {
        apiKey: apiKey.substring(0, 8) + '***',
        ip,
        reason: 'Rate limit exceeded',
        metadata: { count: limiter.count, limit: this.config.maxRequestsPerMinute }
      });
      throw new Error('Rate limit exceeded');
    }
  }

  private logSecurityEvent(
    event: SecurityAuditLog['event'],
    severity: SecurityAuditLog['severity'],
    details: SecurityAuditLog['details']
  ): void {
    const log: SecurityAuditLog = {
      timestamp: Date.now(),
      event,
      severity,
      details
    };

    this.auditLogs.push(log);

    // Keep only last 10000 logs
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }

    // Log to system if high severity
    if (severity === 'high' || severity === 'critical') {
      this.logger.warn('Security event detected', {
        event,
        severity,
        details
      });
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredTime = now - (this.config.nonceExpiry * 1000);

    // This is a simplified cleanup - in production, you'd need to track nonce timestamps
    if (this.usedNonces.size > 10000) {
      this.usedNonces.clear(); // Reset periodically
    }

    // Clean expired rate limiters
    for (const [key, limiter] of this.rateLimiters.entries()) {
      if (now > limiter.resetTime) {
        this.rateLimiters.delete(key);
      }
    }

    // Clean old audit logs (keep last 7 days)
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > sevenDaysAgo);

    // Clean encryption cache
    for (const [key, entry] of this.encryptionCache.entries()) {
      if (now - entry.timestamp > 300000) { // 5 minutes
        this.encryptionCache.delete(key);
      }
    }
  }
}

// Singleton instance
export const hmacSecurity = new HMACSecuritySystem({
  hmacSecret: process.env.HMAC_SECRET || 'default-secret-change-in-production',
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production',
  algorithm: 'sha256',
  timestampWindow: 300, // 5 minutes
  nonceExpiry: 3600, // 1 hour
  maxRequestsPerMinute: 60,
  enableEncryption: true,
  enableSignatureValidation: true
});

// Export middleware for Express
export const hmacMiddleware = (req: any, res: any, next: any) => {
  try {
    const clientInfo = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'unknown'
    };

    const context = hmacSecurity.validateRequest(
      req.method,
      req.path,
      req.headers,
      req.body,
      clientInfo
    );

    req.securityContext = context;
    next();
  } catch (error) {
    res.status(401).json({
      error: 'Security validation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};