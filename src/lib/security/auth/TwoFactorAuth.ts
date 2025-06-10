import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { z } from 'zod';
import crypto from 'crypto';
import { SecureVault } from '../vault/SimpleVault';
import { logger } from '@/lib/logger';

// Schemas
const UserTwoFactorSchema = z.object({
  userId: z.string(),
  secret: z.string(),
  backupCodes: z.array(z.string()),
  enabled: z.boolean(),
  createdAt: z.date(),
  lastUsedAt: z.date().optional(),
});

const TOTPTokenSchema = z.object({
  token: z.string().length(6),
});

export type UserTwoFactor = z.infer<typeof UserTwoFactorSchema>;

export class TwoFactorAuth {
  private vault: SecureVault;
  private appName: string;

  constructor(appName: string = 'Cypher AI') {
    this.vault = SecureVault.getInstance();
    this.appName = appName;
  }

  // Gerar secret para 2FA
  async generateSecret(userId: string, userEmail: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    try {
      // Gerar secret
      const secret = speakeasy.generateSecret({
        name: `${this.appName} (${userEmail})`,
        issuer: this.appName,
        length: 32,
      });

      // Gerar backup codes
      const backupCodes = this.generateBackupCodes(8);

      // Salvar no vault
      const twoFactorData: UserTwoFactor = {
        userId,
        secret: secret.base32,
        backupCodes: backupCodes.map(code => this.hashBackupCode(code)),
        enabled: false,
        createdAt: new Date(),
      };

      await this.vault.storeSecret(`2fa/${userId}`, twoFactorData);

      // Gerar QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      logger.info(`2FA secret generated for user: ${userId}`);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      logger.error('Failed to generate 2FA secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  // Verificar token TOTP
  async verifyToken(userId: string, token: string): Promise<boolean> {
    try {
      // Validar formato do token
      TOTPTokenSchema.parse({ token });

      const twoFactorData = await this.getTwoFactorData(userId);
      
      if (!twoFactorData) {
        return false;
      }

      // Verificar token
      const verified = speakeasy.totp.verify({
        secret: twoFactorData.secret,
        encoding: 'base32',
        token,
        window: 2, // Permitir 2 intervalos de tempo de tolerância
      });

      if (verified) {
        // Atualizar último uso
        await this.updateLastUsed(userId);
        logger.info(`2FA token verified for user: ${userId}`);
      }

      return verified;
    } catch (error) {
      logger.error('Failed to verify 2FA token:', error);
      return false;
    }
  }

  // Habilitar 2FA após verificação inicial
  async enable2FA(userId: string, token: string): Promise<boolean> {
    try {
      const verified = await this.verifyToken(userId, token);
      
      if (!verified) {
        return false;
      }

      const twoFactorData = await this.getTwoFactorData(userId);
      
      if (!twoFactorData) {
        return false;
      }

      twoFactorData.enabled = true;
      await this.vault.storeSecret(`2fa/${userId}`, twoFactorData);

      logger.info(`2FA enabled for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Failed to enable 2FA:', error);
      return false;
    }
  }

  // Desabilitar 2FA
  async disable2FA(userId: string): Promise<boolean> {
    try {
      const twoFactorData = await this.getTwoFactorData(userId);
      
      if (!twoFactorData) {
        return false;
      }

      twoFactorData.enabled = false;
      await this.vault.storeSecret(`2fa/${userId}`, twoFactorData);

      logger.info(`2FA disabled for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Failed to disable 2FA:', error);
      return false;
    }
  }

  // Verificar backup code
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const twoFactorData = await this.getTwoFactorData(userId);
      
      if (!twoFactorData || !twoFactorData.enabled) {
        return false;
      }

      const hashedCode = this.hashBackupCode(code);
      const codeIndex = twoFactorData.backupCodes.indexOf(hashedCode);

      if (codeIndex === -1) {
        return false;
      }

      // Remover código usado
      twoFactorData.backupCodes.splice(codeIndex, 1);
      await this.vault.storeSecret(`2fa/${userId}`, twoFactorData);

      logger.info(`Backup code used for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Failed to verify backup code:', error);
      return false;
    }
  }

  // Regenerar backup codes
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      const twoFactorData = await this.getTwoFactorData(userId);
      
      if (!twoFactorData) {
        throw new Error('2FA not configured');
      }

      const newCodes = this.generateBackupCodes(8);
      twoFactorData.backupCodes = newCodes.map(code => this.hashBackupCode(code));
      
      await this.vault.storeSecret(`2fa/${userId}`, twoFactorData);

      logger.info(`Backup codes regenerated for user: ${userId}`);
      return newCodes;
    } catch (error) {
      logger.error('Failed to regenerate backup codes:', error);
      throw error;
    }
  }

  // Verificar se 2FA está habilitado
  async is2FAEnabled(userId: string): Promise<boolean> {
    try {
      const twoFactorData = await this.getTwoFactorData(userId);
      return twoFactorData?.enabled || false;
    } catch (error) {
      logger.error('Failed to check 2FA status:', error);
      return false;
    }
  }

  // Multi-Factor Authentication (MFA) com múltiplos métodos
  async setupMFA(userId: string, methods: {
    totp?: boolean;
    sms?: { phoneNumber: string };
    email?: { address: string };
    webauthn?: { credentialId: string };
  }): Promise<void> {
    try {
      const mfaConfig = {
        userId,
        methods: {
          totp: methods.totp || false,
          sms: methods.sms ? { ...methods.sms, verified: false } : null,
          email: methods.email ? { ...methods.email, verified: false } : null,
          webauthn: methods.webauthn || null,
        },
        requiredFactors: 2, // Padrão: 2 fatores
        createdAt: new Date(),
      };

      await this.vault.storeSecret(`mfa/${userId}`, mfaConfig);
      logger.info(`MFA configured for user: ${userId}`);
    } catch (error) {
      logger.error('Failed to setup MFA:', error);
      throw error;
    }
  }

  // Enviar código por SMS/Email
  async sendVerificationCode(userId: string, method: 'sms' | 'email'): Promise<void> {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

      await this.vault.storeSecret(`verification/${userId}/${method}`, {
        code,
        expiresAt,
        attempts: 0,
      });

      // Aqui você integraria com serviços de SMS/Email
      logger.info(`Verification code sent via ${method} for user: ${userId}`);
    } catch (error) {
      logger.error('Failed to send verification code:', error);
      throw error;
    }
  }

  // Verificar código de verificação
  async verifyCode(userId: string, method: 'sms' | 'email', code: string): Promise<boolean> {
    try {
      const verificationData = await this.vault.getSecret(`verification/${userId}/${method}`);
      
      if (!verificationData) {
        return false;
      }

      // Verificar expiração
      if (new Date(verificationData.expiresAt) < new Date()) {
        return false;
      }

      // Verificar tentativas
      if (verificationData.attempts >= 3) {
        return false;
      }

      if (verificationData.code !== code) {
        verificationData.attempts++;
        await this.vault.storeSecret(`verification/${userId}/${method}`, verificationData);
        return false;
      }

      // Código válido - limpar
      await this.vault.storeSecret(`verification/${userId}/${method}`, null);
      return true;
    } catch (error) {
      logger.error('Failed to verify code:', error);
      return false;
    }
  }

  // Helpers privados
  private async getTwoFactorData(userId: string): Promise<UserTwoFactor | null> {
    const data = await this.vault.getSecret(`2fa/${userId}`);
    return data ? UserTwoFactorSchema.parse(data) : null;
  }

  private async updateLastUsed(userId: string): Promise<void> {
    const twoFactorData = await this.getTwoFactorData(userId);
    if (twoFactorData) {
      twoFactorData.lastUsedAt = new Date();
      await this.vault.storeSecret(`2fa/${userId}`, twoFactorData);
    }
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }

  private hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }
}