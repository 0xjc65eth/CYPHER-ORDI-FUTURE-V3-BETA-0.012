import crypto from 'crypto';
import { VaultApi } from '@hashicorp/vault-client';
import Redis from 'ioredis';
import { z } from 'zod';

const ApiKeySchema = z.object({
  key: z.string(),
  secret: z.string(),
  expiresAt: z.date().optional(),
  permissions: z.array(z.string()).optional(),
  ipWhitelist: z.array(z.string()).optional()
});

export class SecureVault {
  private vault: VaultApi;
  private redis: Redis;
  private encryptionKey: Buffer;
  private algorithm = 'aes-256-gcm';
  private keyRotationInterval = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor(config: {
    vaultUrl: string;
    vaultToken: string;
    redisUrl: string;
    masterKey: string;
  }) {
    this.vault = new VaultApi({
      apiUrl: config.vaultUrl,
      token: config.vaultToken
    });
    
    this.redis = new Redis(config.redisUrl);
    this.encryptionKey = crypto.scryptSync(config.masterKey, 'salt', 32);
    
    this.startKeyRotation();
  }

  // Encrypt sensitive data
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

  // Decrypt sensitive data
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

  // Store API key securely
  async storeApiKey(
    exchange: string,
    apiKey: z.infer<typeof ApiKeySchema>
  ): Promise<void> {
    const validated = ApiKeySchema.parse(apiKey);
    
    // Encrypt sensitive parts
    const encryptedKey = this.encrypt(validated.key);
    const encryptedSecret = this.encrypt(validated.secret);
    
    // Store in Vault
    await this.vault.write(`secret/data/exchanges/${exchange}`, {
      data: {
        key: encryptedKey,
        secret: encryptedSecret,
        expiresAt: validated.expiresAt?.toISOString(),
        permissions: validated.permissions,
        ipWhitelist: validated.ipWhitelist,
        createdAt: new Date().toISOString(),
        rotatedAt: new Date().toISOString()
      }
    });
    
    // Cache in Redis with TTL
    const ttl = validated.expiresAt
      ? Math.floor((validated.expiresAt.getTime() - Date.now()) / 1000)
      : 86400; // 24 hours default
      
    await this.redis.setex(
      `apikey:${exchange}`,
      ttl,
      JSON.stringify({ encryptedKey, encryptedSecret })
    );
  }

  // Retrieve API key
  async getApiKey(exchange: string): Promise<z.infer<typeof ApiKeySchema> | null> {
    // Try Redis cache first
    const cached = await this.redis.get(`apikey:${exchange}`);
    
    if (cached) {
      const { encryptedKey, encryptedSecret } = JSON.parse(cached);
      
      return {
        key: this.decrypt(encryptedKey.encrypted, encryptedKey.iv, encryptedKey.tag),
        secret: this.decrypt(encryptedSecret.encrypted, encryptedSecret.iv, encryptedSecret.tag)
      };
    }
    
    // Fallback to Vault
    try {
      const response = await this.vault.read(`secret/data/exchanges/${exchange}`);
      const data = response.data.data;
      
      // Check expiration
      if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        await this.revokeApiKey(exchange);
        return null;
      }
      
      const key = this.decrypt(data.key.encrypted, data.key.iv, data.key.tag);
      const secret = this.decrypt(data.secret.encrypted, data.secret.iv, data.secret.tag);
      
      // Re-cache
      await this.redis.setex(
        `apikey:${exchange}`,
        86400,
        JSON.stringify({ encryptedKey: data.key, encryptedSecret: data.secret })
      );
      
      return {
        key,
        secret,
        permissions: data.permissions,
        ipWhitelist: data.ipWhitelist
      };
    } catch (error) {
      console.error(`Failed to retrieve API key for ${exchange}:`, error);
      return null;
    }
  }

  // Rotate API keys
  async rotateApiKey(exchange: string): Promise<void> {
    const current = await this.getApiKey(exchange);
    if (!current) return;
    
    // Mark old key for deletion after grace period
    await this.vault.write(`secret/data/exchanges/${exchange}/old`, {
      data: await this.vault.read(`secret/data/exchanges/${exchange}`)
    });
    
    // Generate new encryption for the same keys
    // In production, you'd request new keys from the exchange
    await this.storeApiKey(exchange, current);
    
    // Invalidate cache
    await this.redis.del(`apikey:${exchange}`);
  }

  // Revoke API key
  async revokeApiKey(exchange: string): Promise<void> {
    await this.vault.delete(`secret/data/exchanges/${exchange}`);
    await this.redis.del(`apikey:${exchange}`);
    
    // Add to revocation list
    await this.redis.zadd(
      'revoked_keys',
      Date.now(),
      exchange
    );
  }

  // Start automatic key rotation
  private startKeyRotation(): void {
    setInterval(async () => {
      try {
        // List all exchanges
        const list = await this.vault.list('secret/data/exchanges');
        
        for (const exchange of list.data.keys) {
          const data = await this.vault.read(`secret/data/exchanges/${exchange}`);
          const rotatedAt = new Date(data.data.data.rotatedAt);
          
          // Check if rotation is needed
          if (Date.now() - rotatedAt.getTime() > this.keyRotationInterval) {
            await this.rotateApiKey(exchange);
          }
        }
      } catch (error) {
        console.error('Key rotation failed:', error);
      }
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  // Verify IP whitelist
  async verifyIpWhitelist(exchange: string, ip: string): Promise<boolean> {
    const apiKey = await this.getApiKey(exchange);
    if (!apiKey || !apiKey.ipWhitelist) return true;
    
    return apiKey.ipWhitelist.includes(ip);
  }

  // Check permissions
  async checkPermission(
    exchange: string,
    permission: string
  ): Promise<boolean> {
    const apiKey = await this.getApiKey(exchange);
    if (!apiKey || !apiKey.permissions) return false;
    
    return apiKey.permissions.includes(permission);
  }

  // Audit log
  async logAccess(exchange: string, action: string, metadata?: any): Promise<void> {
    await this.redis.zadd(
      `audit:${exchange}`,
      Date.now(),
      JSON.stringify({
        action,
        timestamp: new Date().toISOString(),
        metadata
      })
    );
  }

  // Get audit logs
  async getAuditLogs(
    exchange: string,
    startTime: number,
    endTime: number
  ): Promise<any[]> {
    const logs = await this.redis.zrangebyscore(
      `audit:${exchange}`,
      startTime,
      endTime
    );
    
    return logs.map(log => JSON.parse(log));
  }

  // Health check
  async healthCheck(): Promise<{
    vault: boolean;
    redis: boolean;
    encryption: boolean;
  }> {
    const results = {
      vault: false,
      redis: false,
      encryption: false
    };
    
    try {
      // Test Vault connection
      await this.vault.read('sys/health');
      results.vault = true;
    } catch (error) {
      console.error('Vault health check failed:', error);
    }
    
    try {
      // Test Redis connection
      await this.redis.ping();
      results.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }
    
    try {
      // Test encryption
      const test = 'test';
      const encrypted = this.encrypt(test);
      const decrypted = this.decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);
      results.encryption = test === decrypted;
    } catch (error) {
      console.error('Encryption health check failed:', error);
    }
    
    return results;
  }
}

// Singleton instance
let vaultInstance: SecureVault | null = null;

export function getVault(): SecureVault {
  if (!vaultInstance) {
    vaultInstance = new SecureVault({
      vaultUrl: process.env.VAULT_URL || 'http://localhost:8200',
      vaultToken: process.env.VAULT_TOKEN || '',
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      masterKey: process.env.MASTER_ENCRYPTION_KEY || ''
    });
  }
  
  return vaultInstance;
}