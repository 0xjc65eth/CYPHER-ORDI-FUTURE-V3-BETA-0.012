/**
 * CYPHER ORDI FUTURE - Private Key Vault
 * Secure private key encryption and management system
 * Agent 8 - Security and Validation Implementation
 */

import crypto from 'crypto';
import { securityLogger } from '../../utils/security.js';

// ===========================================
// ENCRYPTION CONFIGURATION
// ===========================================

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_DERIVATION_ALGORITHM = 'scrypt';
const HASH_ALGORITHM = 'sha256';
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_DERIVATION_OPTIONS = {
  N: 32768, // CPU/memory cost
  r: 8,     // Block size
  p: 1,     // Parallelization
  maxmem: 64 * 1024 * 1024 // 64MB
};

// ===========================================
// INTERFACES AND TYPES
// ===========================================

export interface EncryptedKeyData {
  encrypted: string;
  salt: string;
  iv: string;
  tag: string;
  algorithm: string;
  keyDerivation: string;
  version: string;
  timestamp: number;
  checksum: string;
}

export interface KeyVaultOptions {
  compressionLevel?: number;
  additionalAuth?: string;
  keyStrength?: 'standard' | 'high' | 'maximum';
}

export interface KeyMetadata {
  id: string;
  label: string;
  created: number;
  lastAccessed: number;
  accessCount: number;
  keyType: 'bitcoin' | 'ethereum' | 'generic';
  network: 'mainnet' | 'testnet';
}

// ===========================================
// PRIVATE KEY VAULT CLASS
// ===========================================

export class PrivateKeyVault {
  private static instance: PrivateKeyVault;
  private encryptedKeys: Map<string, EncryptedKeyData> = new Map();
  private keyMetadata: Map<string, KeyMetadata> = new Map();
  private accessLog: Array<{ keyId: string; timestamp: number; action: string }> = [];

  private constructor() {
    this.setupCleanupInterval();
  }

  public static getInstance(): PrivateKeyVault {
    if (!PrivateKeyVault.instance) {
      PrivateKeyVault.instance = new PrivateKeyVault();
    }
    return PrivateKeyVault.instance;
  }

  // ===========================================
  // ENCRYPTION METHODS
  // ===========================================

  /**
   * Encrypt a private key with advanced security
   */
  public async encryptPrivateKey(
    privateKey: string,
    password: string,
    options: KeyVaultOptions = {}
  ): Promise<{ keyId: string; encryptedData: EncryptedKeyData }> {
    const startTime = Date.now();

    try {
      // Validate inputs
      this.validatePrivateKey(privateKey);
      this.validatePassword(password);

      // Generate unique key ID
      const keyId = this.generateKeyId();

      // Prepare encryption data
      const salt = crypto.randomBytes(SALT_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH);
      const additionalAuth = options.additionalAuth || 'cypher-ordi-vault';

      // Derive encryption key from password
      const derivedKey = await this.deriveKey(password, salt, options.keyStrength);

      // Compress private key if needed
      const keyToEncrypt = options.compressionLevel ? 
        this.compressData(privateKey, options.compressionLevel) : 
        privateKey;

      // Create cipher
      const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, derivedKey);
      cipher.setAAD(Buffer.from(additionalAuth, 'utf8'));

      // Encrypt private key
      let encrypted = cipher.update(keyToEncrypt, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Create checksum for integrity verification
      const checksum = this.createChecksum(privateKey, salt, iv);

      // Prepare encrypted data
      const encryptedData: EncryptedKeyData = {
        encrypted,
        salt: salt.toString('hex'),
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: ENCRYPTION_ALGORITHM,
        keyDerivation: KEY_DERIVATION_ALGORITHM,
        version: '1.0.0',
        timestamp: Date.now(),
        checksum
      };

      // Store encrypted key
      this.encryptedKeys.set(keyId, encryptedData);

      // Create metadata
      const metadata: KeyMetadata = {
        id: keyId,
        label: `Key_${Date.now()}`,
        created: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        keyType: this.detectKeyType(privateKey),
        network: this.detectNetwork(privateKey)
      };
      this.keyMetadata.set(keyId, metadata);

      // Log encryption
      this.logKeyOperation(keyId, 'ENCRYPT', {
        processingTime: Date.now() - startTime,
        keyLength: privateKey.length,
        algorithm: ENCRYPTION_ALGORITHM
      });

      securityLogger({
        event: 'PRIVATE_KEY_ENCRYPTED',
        timestamp: new Date().toISOString(),
        keyId,
        keyType: metadata.keyType,
        network: metadata.network,
        processingTime: Date.now() - startTime,
        success: true
      });

      return { keyId, encryptedData };

    } catch (error) {
      securityLogger({
        event: 'PRIVATE_KEY_ENCRYPTION_FAILED',
        timestamp: new Date().toISOString(),
        error: error.message,
        processingTime: Date.now() - startTime,
        success: false
      });

      throw new Error(`Private key encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt a private key
   */
  public async decryptPrivateKey(
    keyId: string,
    password: string,
    additionalAuth?: string
  ): Promise<string> {
    const startTime = Date.now();

    try {
      // Get encrypted data
      const encryptedData = this.encryptedKeys.get(keyId);
      if (!encryptedData) {
        throw new Error('Key not found');
      }

      // Get metadata
      const metadata = this.keyMetadata.get(keyId);
      if (!metadata) {
        throw new Error('Key metadata not found');
      }

      // Derive decryption key
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const derivedKey = await this.deriveKey(password, salt);

      // Prepare decryption
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      const authData = additionalAuth || 'cypher-ordi-vault';

      // Create decipher
      const decipher = crypto.createDecipher(encryptedData.algorithm, derivedKey);
      decipher.setAAD(Buffer.from(authData, 'utf8'));
      decipher.setAuthTag(tag);

      // Decrypt private key
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Decompress if needed (check if data looks compressed)
      let privateKey = decrypted;
      try {
        if (this.isCompressedData(decrypted)) {
          privateKey = this.decompressData(decrypted);
        }
      } catch {
        // If decompression fails, use original data
      }

      // Verify integrity
      const computedChecksum = this.createChecksum(
        privateKey,
        salt,
        Buffer.from(encryptedData.iv, 'hex')
      );

      if (computedChecksum !== encryptedData.checksum) {
        throw new Error('Key integrity verification failed');
      }

      // Update metadata
      metadata.lastAccessed = Date.now();
      metadata.accessCount++;

      // Log decryption
      this.logKeyOperation(keyId, 'DECRYPT', {
        processingTime: Date.now() - startTime,
        accessCount: metadata.accessCount
      });

      securityLogger({
        event: 'PRIVATE_KEY_DECRYPTED',
        timestamp: new Date().toISOString(),
        keyId,
        keyType: metadata.keyType,
        accessCount: metadata.accessCount,
        processingTime: Date.now() - startTime,
        success: true
      });

      return privateKey;

    } catch (error) {
      securityLogger({
        event: 'PRIVATE_KEY_DECRYPTION_FAILED',
        timestamp: new Date().toISOString(),
        keyId,
        error: error.message,
        processingTime: Date.now() - startTime,
        success: false
      });

      throw new Error(`Private key decryption failed: ${error.message}`);
    }
  }

  // ===========================================
  // KEY MANAGEMENT METHODS
  // ===========================================

  /**
   * List all stored keys (metadata only)
   */
  public listKeys(): KeyMetadata[] {
    return Array.from(this.keyMetadata.values());
  }

  /**
   * Delete a key from the vault
   */
  public deleteKey(keyId: string, password: string): boolean {
    try {
      // Verify access by attempting to decrypt
      this.decryptPrivateKey(keyId, password);

      // Remove key and metadata
      this.encryptedKeys.delete(keyId);
      this.keyMetadata.delete(keyId);

      // Log deletion
      this.logKeyOperation(keyId, 'DELETE', {});

      securityLogger({
        event: 'PRIVATE_KEY_DELETED',
        timestamp: new Date().toISOString(),
        keyId,
        success: true
      });

      return true;

    } catch (error) {
      securityLogger({
        event: 'PRIVATE_KEY_DELETE_FAILED',
        timestamp: new Date().toISOString(),
        keyId,
        error: error.message,
        success: false
      });

      return false;
    }
  }

  /**
   * Change password for a key
   */
  public async changeKeyPassword(
    keyId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      // Decrypt with old password
      const privateKey = await this.decryptPrivateKey(keyId, oldPassword);

      // Re-encrypt with new password
      const { encryptedData } = await this.encryptPrivateKey(privateKey, newPassword);

      // Update stored data
      this.encryptedKeys.set(keyId, encryptedData);

      // Log password change
      this.logKeyOperation(keyId, 'PASSWORD_CHANGE', {});

      securityLogger({
        event: 'PRIVATE_KEY_PASSWORD_CHANGED',
        timestamp: new Date().toISOString(),
        keyId,
        success: true
      });

      return true;

    } catch (error) {
      securityLogger({
        event: 'PRIVATE_KEY_PASSWORD_CHANGE_FAILED',
        timestamp: new Date().toISOString(),
        keyId,
        error: error.message,
        success: false
      });

      return false;
    }
  }

  /**
   * Export key data (encrypted)
   */
  public exportKey(keyId: string): { encryptedData: EncryptedKeyData; metadata: KeyMetadata } | null {
    const encryptedData = this.encryptedKeys.get(keyId);
    const metadata = this.keyMetadata.get(keyId);

    if (!encryptedData || !metadata) {
      return null;
    }

    this.logKeyOperation(keyId, 'EXPORT', {});

    return { encryptedData, metadata };
  }

  /**
   * Import key data
   */
  public importKey(
    keyId: string,
    encryptedData: EncryptedKeyData,
    metadata: KeyMetadata
  ): boolean {
    try {
      // Validate imported data
      if (!this.validateEncryptedData(encryptedData)) {
        throw new Error('Invalid encrypted data format');
      }

      // Store imported data
      this.encryptedKeys.set(keyId, encryptedData);
      this.keyMetadata.set(keyId, {
        ...metadata,
        lastAccessed: Date.now()
      });

      this.logKeyOperation(keyId, 'IMPORT', {});

      securityLogger({
        event: 'PRIVATE_KEY_IMPORTED',
        timestamp: new Date().toISOString(),
        keyId,
        success: true
      });

      return true;

    } catch (error) {
      securityLogger({
        event: 'PRIVATE_KEY_IMPORT_FAILED',
        timestamp: new Date().toISOString(),
        keyId,
        error: error.message,
        success: false
      });

      return false;
    }
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  private async deriveKey(
    password: string,
    salt: Buffer,
    strength: 'standard' | 'high' | 'maximum' = 'standard'
  ): Promise<Buffer> {
    const options = { ...KEY_DERIVATION_OPTIONS };

    // Adjust strength
    switch (strength) {
      case 'high':
        options.N = 65536;
        break;
      case 'maximum':
        options.N = 131072;
        options.r = 16;
        break;
    }

    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 32, options, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
  }

  private validatePrivateKey(privateKey: string): void {
    if (!privateKey || typeof privateKey !== 'string') {
      throw new Error('Private key must be a non-empty string');
    }

    if (privateKey.length < 32) {
      throw new Error('Private key too short');
    }

    // Check for obvious patterns that indicate weak keys
    if (/^(.)\1+$/.test(privateKey)) {
      throw new Error('Private key appears to be weak (repeated characters)');
    }
  }

  private validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }

    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters long');
    }

    // Check password strength
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasLower && hasUpper && hasNumber && hasSpecial)) {
      throw new Error('Password must contain uppercase, lowercase, number and special character');
    }
  }

  private generateKeyId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private createChecksum(privateKey: string, salt: Buffer, iv: Buffer): string {
    const hash = crypto.createHash(HASH_ALGORITHM);
    hash.update(privateKey);
    hash.update(salt);
    hash.update(iv);
    return hash.digest('hex');
  }

  private detectKeyType(privateKey: string): 'bitcoin' | 'ethereum' | 'generic' {
    // Simple heuristics for key type detection
    if (privateKey.length === 64 && /^[a-fA-F0-9]+$/.test(privateKey)) {
      return 'bitcoin';
    }
    if (privateKey.startsWith('0x') && privateKey.length === 66) {
      return 'ethereum';
    }
    return 'generic';
  }

  private detectNetwork(privateKey: string): 'mainnet' | 'testnet' {
    // In practice, this would involve more sophisticated detection
    // For now, default to mainnet
    return 'mainnet';
  }

  private compressData(data: string, level: number): string {
    // Simple compression placeholder
    // In production, use a real compression library
    return Buffer.from(data).toString('base64');
  }

  private decompressData(data: string): string {
    // Simple decompression placeholder
    return Buffer.from(data, 'base64').toString('utf8');
  }

  private isCompressedData(data: string): boolean {
    try {
      // Check if data looks like base64
      return Buffer.from(data, 'base64').toString('base64') === data;
    } catch {
      return false;
    }
  }

  private validateEncryptedData(data: EncryptedKeyData): boolean {
    const requiredFields = ['encrypted', 'salt', 'iv', 'tag', 'algorithm', 'checksum'];
    return requiredFields.every(field => field in data && data[field]);
  }

  private logKeyOperation(keyId: string, action: string, metadata: any): void {
    this.accessLog.push({
      keyId,
      timestamp: Date.now(),
      action
    });

    // Keep only last 1000 entries
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(-1000);
    }
  }

  private setupCleanupInterval(): void {
    // Clean up old access logs every hour
    setInterval(() => {
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      this.accessLog = this.accessLog.filter(entry => entry.timestamp > oneWeekAgo);
    }, 60 * 60 * 1000);
  }

  // ===========================================
  // SECURITY AUDIT METHODS
  // ===========================================

  /**
   * Get vault statistics
   */
  public getVaultStats(): {
    totalKeys: number;
    keysByType: Record<string, number>;
    keysByNetwork: Record<string, number>;
    totalAccesses: number;
    recentActivity: Array<{ keyId: string; timestamp: number; action: string }>;
  } {
    const keys = Array.from(this.keyMetadata.values());
    
    const keysByType = keys.reduce((acc, key) => {
      acc[key.keyType] = (acc[key.keyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const keysByNetwork = keys.reduce((acc, key) => {
      acc[key.network] = (acc[key.network] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalAccesses = keys.reduce((sum, key) => sum + key.accessCount, 0);

    return {
      totalKeys: keys.length,
      keysByType,
      keysByNetwork,
      totalAccesses,
      recentActivity: this.accessLog.slice(-10)
    };
  }

  /**
   * Generate security report
   */
  public generateSecurityReport(): {
    vaultHealth: 'good' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    stats: any;
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const stats = this.getVaultStats();

    // Check for security issues
    if (stats.totalKeys > 100) {
      issues.push('Large number of keys stored');
      recommendations.push('Consider implementing key rotation policy');
    }

    const oldKeys = Array.from(this.keyMetadata.values())
      .filter(key => Date.now() - key.lastAccessed > 30 * 24 * 60 * 60 * 1000);

    if (oldKeys.length > 0) {
      issues.push(`${oldKeys.length} keys haven't been accessed in 30+ days`);
      recommendations.push('Review and archive unused keys');
    }

    const vaultHealth = issues.length === 0 ? 'good' : 
                      issues.length <= 2 ? 'warning' : 'critical';

    return {
      vaultHealth,
      issues,
      recommendations,
      stats
    };
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Quick encrypt function for simple use cases
 */
export async function quickEncryptKey(privateKey: string, password: string): Promise<string> {
  const vault = PrivateKeyVault.getInstance();
  const { keyId } = await vault.encryptPrivateKey(privateKey, password);
  return keyId;
}

/**
 * Quick decrypt function for simple use cases
 */
export async function quickDecryptKey(keyId: string, password: string): Promise<string> {
  const vault = PrivateKeyVault.getInstance();
  return await vault.decryptPrivateKey(keyId, password);
}

// ===========================================
// EXPORT DEFAULT INSTANCE
// ===========================================

export default PrivateKeyVault.getInstance();