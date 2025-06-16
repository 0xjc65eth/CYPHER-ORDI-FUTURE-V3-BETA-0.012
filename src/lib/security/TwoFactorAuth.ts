import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { createHash } from 'crypto';

interface TwoFactorSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface VerifyResult {
  valid: boolean;
  error?: string;
}

interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

export class TwoFactorAuth {
  private appName: string;
  private issuer: string;
  private backupCodeLength: number;
  private backupCodeCount: number;
  private window: number;

  constructor(config?: {
    appName?: string;
    issuer?: string;
    backupCodeLength?: number;
    backupCodeCount?: number;
    window?: number;
  }) {
    this.appName = config?.appName || 'Cypher AI';
    this.issuer = config?.issuer || 'CypherAI';
    this.backupCodeLength = config?.backupCodeLength || 8;
    this.backupCodeCount = config?.backupCodeCount || 10;
    this.window = config?.window || 1; // Time window for TOTP validation
    
    // Configure authenticator
    authenticator.options = {
      window: this.window,
      step: 30 // 30 seconds per token
    };
  }

  /**
   * Generate a new 2FA secret for a user
   */
  async generateSecret(userId: string, email: string): Promise<TwoFactorSecret> {
    // Generate secret
    const secret = authenticator.generateSecret();
    
    // Generate QR code
    const otpauth = authenticator.keyuri(email, this.issuer, secret);
    const qrCode = await QRCode.toDataURL(otpauth);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    return {
      secret,
      qrCode,
      backupCodes
    };
  }

  /**
   * Verify a TOTP token
   */
  verifyToken(token: string, secret: string): VerifyResult {
    try {
      const isValid = authenticator.verify({
        token,
        secret
      });
      
      return {
        valid: isValid,
        error: isValid ? undefined : 'Invalid token'
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Token verification failed'
      };
    }
  }

  /**
   * Generate backup codes
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.backupCodeCount; i++) {
      const code = this.generateSecureCode(this.backupCodeLength);
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Generate a secure random code
   */
  private generateSecureCode(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomBytes = crypto.randomBytes(length);
    let code = '';
    
    for (let i = 0; i < length; i++) {
      code += charset[randomBytes[i] % charset.length];
    }
    
    // Format with dashes for readability (e.g., ABCD-EFGH)
    const mid = Math.floor(length / 2);
    return code.slice(0, mid) + '-' + code.slice(mid);
  }

  /**
   * Hash a backup code for storage
   */
  hashBackupCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify a backup code
   */
  verifyBackupCode(inputCode: string, hashedCode: string): boolean {
    const inputHash = this.hashBackupCode(inputCode.toUpperCase().replace(/-/g, ''));
    return inputHash === hashedCode;
  }

  /**
   * Generate a time-based challenge for additional security
   */
  generateChallenge(secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000 / 30);
    const hash = createHash('sha256')
      .update(`${secret}:${timestamp}`)
      .digest('hex');
    return hash.substring(0, 6);
  }

  /**
   * Validate 2FA setup with initial token
   */
  validateSetup(token: string, secret: string): VerifyResult {
    // For setup, we allow a slightly larger time window
    const originalWindow = authenticator.options.window;
    authenticator.options = { ...authenticator.options, window: 2 };
    
    const result = this.verifyToken(token, secret);
    
    // Restore original window
    authenticator.options = { ...authenticator.options, window: originalWindow };
    
    return result;
  }

  /**
   * Generate recovery key for account recovery
   */
  generateRecoveryKey(userId: string, secret: string): string {
    const data = `${userId}:${secret}:${Date.now()}`;
    const hash = createHash('sha256').update(data).digest('hex');
    return `REC-${hash.substring(0, 32).toUpperCase()}`;
  }

  /**
   * Check if 2FA is properly configured
   */
  isConfigured(secret?: string): boolean {
    return !!secret && secret.length > 0;
  }

  /**
   * Get remaining time for current token
   */
  getTimeRemaining(): number {
    return authenticator.timeRemaining();
  }

  /**
   * Generate a new token (for testing/display)
   */
  generateToken(secret: string): string {
    return authenticator.generate(secret);
  }
}

/**
 * Enhanced 2FA manager with database integration
 */
export class TwoFactorAuthManager {
  private twoFactorAuth: TwoFactorAuth;
  private redis: any; // Redis client for session management
  
  constructor(redis: any, config?: any) {
    this.twoFactorAuth = new TwoFactorAuth(config);
    this.redis = redis;
  }

  /**
   * Enable 2FA for a user
   */
  async enableTwoFactor(userId: string, email: string) {
    // Generate secret and QR code
    const setup = await this.twoFactorAuth.generateSecret(userId, email);
    
    // Store temporarily in Redis for verification
    const tempKey = `2fa_setup:${userId}`;
    await this.redis.setex(
      tempKey,
      300, // 5 minutes to complete setup
      JSON.stringify({
        secret: setup.secret,
        backupCodes: setup.backupCodes.map(code => ({
          code: this.twoFactorAuth.hashBackupCode(code),
          used: false
        }))
      })
    );
    
    return {
      qrCode: setup.qrCode,
      backupCodes: setup.backupCodes,
      setupKey: tempKey
    };
  }

  /**
   * Confirm 2FA setup with initial token
   */
  async confirmTwoFactor(userId: string, token: string) {
    const tempKey = `2fa_setup:${userId}`;
    const setupData = await this.redis.get(tempKey);
    
    if (!setupData) {
      return { success: false, error: 'Setup session expired' };
    }
    
    const { secret, backupCodes } = JSON.parse(setupData);
    
    // Validate token
    const validation = this.twoFactorAuth.validateSetup(token, secret);
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Setup confirmed, save to user account
    // This would typically save to database
    await this.redis.del(tempKey);
    
    return {
      success: true,
      secret, // This should be encrypted before storing
      backupCodes
    };
  }

  /**
   * Verify 2FA during login
   */
  async verifyLogin(userId: string, token: string, secret: string) {
    // Check if token is a backup code
    if (token.includes('-')) {
      return this.verifyBackupCode(userId, token);
    }
    
    // Verify TOTP token
    const result = this.twoFactorAuth.verifyToken(token, secret);
    
    if (result.valid) {
      // Log successful 2FA
      await this.logAuthEvent(userId, 'totp_success');
    } else {
      // Log failed attempt
      await this.logAuthEvent(userId, 'totp_failed');
      
      // Check for brute force attempts
      const attempts = await this.getFailedAttempts(userId);
      if (attempts > 5) {
        // Lock account temporarily
        await this.lockAccount(userId, 15 * 60); // 15 minutes
        return { valid: false, error: 'Account locked due to multiple failed attempts' };
      }
    }
    
    return result;
  }

  /**
   * Verify backup code
   */
  private async verifyBackupCode(userId: string, code: string) {
    // This would typically check against database
    // For now, we'll simulate with Redis
    const backupKey = `backup_codes:${userId}`;
    const codes = await this.redis.get(backupKey);
    
    if (!codes) {
      return { valid: false, error: 'No backup codes found' };
    }
    
    const backupCodes: BackupCode[] = JSON.parse(codes);
    const hashedInput = this.twoFactorAuth.hashBackupCode(code);
    
    const codeIndex = backupCodes.findIndex(
      bc => bc.code === hashedInput && !bc.used
    );
    
    if (codeIndex === -1) {
      await this.logAuthEvent(userId, 'backup_code_failed');
      return { valid: false, error: 'Invalid or already used backup code' };
    }
    
    // Mark code as used
    backupCodes[codeIndex].used = true;
    backupCodes[codeIndex].usedAt = new Date();
    
    await this.redis.set(backupKey, JSON.stringify(backupCodes));
    await this.logAuthEvent(userId, 'backup_code_success');
    
    return { valid: true };
  }

  /**
   * Log authentication events
   */
  private async logAuthEvent(userId: string, event: string) {
    const key = `auth_log:${userId}`;
    const log = {
      event,
      timestamp: new Date().toISOString(),
      ip: 'system' // This would typically include request IP
    };
    
    await this.redis.lpush(key, JSON.stringify(log));
    await this.redis.ltrim(key, 0, 99); // Keep last 100 events
    await this.redis.expire(key, 30 * 24 * 60 * 60); // 30 days
  }

  /**
   * Get failed login attempts
   */
  private async getFailedAttempts(userId: string): Promise<number> {
    const key = `failed_attempts:${userId}`;
    const attempts = await this.redis.get(key);
    return parseInt(attempts || '0');
  }

  /**
   * Lock account temporarily
   */
  private async lockAccount(userId: string, seconds: number) {
    const key = `account_lock:${userId}`;
    await this.redis.setex(key, seconds, '1');
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(userId: string): Promise<boolean> {
    const key = `account_lock:${userId}`;
    const locked = await this.redis.get(key);
    return !!locked;
  }

  /**
   * Disable 2FA (requires current token)
   */
  async disableTwoFactor(userId: string, token: string, secret: string) {
    // Verify token first
    const verification = this.twoFactorAuth.verifyToken(token, secret);
    
    if (!verification.valid) {
      return { success: false, error: 'Invalid token' };
    }
    
    // Clear 2FA data
    // This would typically update database
    await this.logAuthEvent(userId, '2fa_disabled');
    
    return { success: true };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, token: string, secret: string) {
    // Verify token first
    const verification = this.twoFactorAuth.verifyToken(token, secret);
    
    if (!verification.valid) {
      return { success: false, error: 'Invalid token' };
    }
    
    // Generate new codes
    const newCodes = this.twoFactorAuth['generateBackupCodes']();
    const hashedCodes = newCodes.map(code => ({
      code: this.twoFactorAuth.hashBackupCode(code),
      used: false
    }));
    
    // Store new codes
    const backupKey = `backup_codes:${userId}`;
    await this.redis.set(backupKey, JSON.stringify(hashedCodes));
    
    await this.logAuthEvent(userId, 'backup_codes_regenerated');
    
    return { success: true, codes: newCodes };
  }
}