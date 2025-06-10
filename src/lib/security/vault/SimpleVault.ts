import crypto from 'crypto';
import Redis from 'ioredis';

export class SimpleVault {
  private static instance: SimpleVault;
  private redis: Redis;
  private encryptionKey: Buffer;
  private algorithm = 'aes-256-gcm';

  private constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || 'default-key-change-in-production';
    this.encryptionKey = crypto.scryptSync(masterKey, 'cypher-ai-salt', 32);
  }

  static getInstance(): SimpleVault {
    if (!SimpleVault.instance) {
      SimpleVault.instance = new SimpleVault();
    }
    return SimpleVault.instance;
  }

  // Encrypt data
  private encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // Decrypt data
  private decrypt(encrypted: string, iv: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Store encrypted secret
  async storeSecret(key: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    const serialized = JSON.stringify(data);
    const encrypted = this.encrypt(serialized);
    
    await this.redis.setex(
      `vault:${key}`,
      ttlSeconds,
      JSON.stringify(encrypted)
    );
  }

  // Get and decrypt secret
  async getSecret(key: string): Promise<any | null> {
    try {
      const stored = await this.redis.get(`vault:${key}`);
      
      if (!stored) {
        return null;
      }

      const encryptedData = JSON.parse(stored);
      const decrypted = this.decrypt(
        encryptedData.encrypted,
        encryptedData.iv,
        encryptedData.tag
      );
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to get secret:', error);
      return null;
    }
  }

  // Delete secret
  async deleteSecret(key: string): Promise<void> {
    await this.redis.del(`vault:${key}`);
  }

  // List keys with pattern
  async listKeys(pattern: string): Promise<string[]> {
    const keys = await this.redis.keys(`vault:${pattern}`);
    return keys.map(key => key.replace('vault:', ''));
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      
      // Test encryption/decryption
      const testData = { test: 'data' };
      await this.storeSecret('health-check', testData, 10);
      const retrieved = await this.getSecret('health-check');
      await this.deleteSecret('health-check');
      
      return JSON.stringify(testData) === JSON.stringify(retrieved);
    } catch (error) {
      console.error('Vault health check failed:', error);
      return false;
    }
  }
}

// Export singleton
export const SecureVault = SimpleVault;