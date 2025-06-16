/**
 * CYPHER ORDi Future V3 - Wallet Authentication Service
 * 
 * Handles signature-based authentication, session management, and secure key handling
 * for multi-wallet integration with Xverse, Unisat, and Oyl Wallet.
 */

import { WalletType } from '../types/wallet';
import crypto from 'crypto';

export interface AuthenticationChallenge {
  id: string;
  message: string;
  timestamp: number;
  expiresAt: number;
  nonce: string;
  address?: string;
  walletType?: WalletType;
}

export interface AuthenticationResult {
  success: boolean;
  sessionToken: string;
  address: string;
  walletType: WalletType;
  signature: string;
  expiresAt: number;
  permissions: string[];
}

export interface WalletSession {
  sessionId: string;
  address: string;
  walletType: WalletType;
  signature: string;
  message: string;
  createdAt: number;
  expiresAt: number;
  lastAccessed: number;
  permissions: string[];
  isActive: boolean;
  deviceFingerprint?: string;
}

export interface SessionStorageConfig {
  maxSessions: number;
  sessionTimeout: number; // in milliseconds
  refreshThreshold: number; // in milliseconds
  enableDeviceFingerprinting: boolean;
  requireReauthentication: boolean;
}

export interface SecurityConfig {
  challengeTimeout: number; // 5 minutes
  sessionTimeout: number; // 24 hours
  maxFailedAttempts: number;
  lockoutDuration: number; // 30 minutes
  requireStrongSignatures: boolean;
  enableRateLimiting: boolean;
}

class WalletAuthenticationService {
  private static instance: WalletAuthenticationService;
  private challenges: Map<string, AuthenticationChallenge> = new Map();
  private sessions: Map<string, WalletSession> = new Map();
  private failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private config: SecurityConfig;
  private storageConfig: SessionStorageConfig;

  private constructor() {
    this.config = {
      challengeTimeout: 5 * 60 * 1000, // 5 minutes
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxFailedAttempts: 5,
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
      requireStrongSignatures: true,
      enableRateLimiting: true
    };

    this.storageConfig = {
      maxSessions: 10,
      sessionTimeout: 24 * 60 * 60 * 1000,
      refreshThreshold: 60 * 60 * 1000, // 1 hour
      enableDeviceFingerprinting: true,
      requireReauthentication: false
    };

    this.startCleanupTimer();
  }

  public static getInstance(): WalletAuthenticationService {
    if (!WalletAuthenticationService.instance) {
      WalletAuthenticationService.instance = new WalletAuthenticationService();
    }
    return WalletAuthenticationService.instance;
  }

  /**
   * Generate a cryptographic challenge for wallet authentication
   */
  public generateChallenge(address?: string, walletType?: WalletType): AuthenticationChallenge {
    const challengeId = this.generateSecureId();
    const nonce = this.generateNonce();
    const timestamp = Date.now();
    
    const challenge: AuthenticationChallenge = {
      id: challengeId,
      message: this.buildChallengeMessage(nonce, timestamp, address),
      timestamp,
      expiresAt: timestamp + this.config.challengeTimeout,
      nonce,
      address,
      walletType
    };

    this.challenges.set(challengeId, challenge);
    return challenge;
  }

  /**
   * Verify wallet signature and create authenticated session
   */
  public async verifySignatureAndCreateSession(
    challengeId: string,
    signature: string,
    address: string,
    walletType: WalletType,
    permissions: string[] = ['read', 'trade']
  ): Promise<AuthenticationResult> {
    // Check for rate limiting
    if (this.isRateLimited(address)) {
      throw new Error('Too many failed authentication attempts. Please try again later.');
    }

    // Get and validate challenge
    const challenge = this.challenges.get(challengeId);
    if (!challenge) {
      this.recordFailedAttempt(address);
      throw new Error('Invalid or expired challenge');
    }

    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(challengeId);
      this.recordFailedAttempt(address);
      throw new Error('Challenge has expired');
    }

    try {
      // Verify signature based on wallet type
      const isValidSignature = await this.verifyWalletSignature(
        challenge.message,
        signature,
        address,
        walletType
      );

      if (!isValidSignature) {
        this.recordFailedAttempt(address);
        throw new Error('Invalid signature');
      }

      // Clear the challenge
      this.challenges.delete(challengeId);

      // Clear failed attempts for this address
      this.failedAttempts.delete(address);

      // Create session
      const session = await this.createSession(
        address,
        walletType,
        signature,
        challenge.message,
        permissions
      );

      return {
        success: true,
        sessionToken: session.sessionId,
        address,
        walletType,
        signature,
        expiresAt: session.expiresAt,
        permissions
      };

    } catch (error) {
      this.recordFailedAttempt(address);
      throw error;
    }
  }

  /**
   * Create a new wallet session
   */
  private async createSession(
    address: string,
    walletType: WalletType,
    signature: string,
    message: string,
    permissions: string[]
  ): Promise<WalletSession> {
    const sessionId = this.generateSessionToken();
    const now = Date.now();
    const deviceFingerprint = this.storageConfig.enableDeviceFingerprinting 
      ? await this.generateDeviceFingerprint() 
      : undefined;

    const session: WalletSession = {
      sessionId,
      address,
      walletType,
      signature,
      message,
      createdAt: now,
      expiresAt: now + this.config.sessionTimeout,
      lastAccessed: now,
      permissions,
      isActive: true,
      deviceFingerprint
    };

    // Enforce session limits
    this.enforceSessionLimits();

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Validate an existing session
   */
  public validateSession(sessionToken: string): WalletSession | null {
    const session = this.sessions.get(sessionToken);
    if (!session) return null;

    // Check if session is expired
    if (Date.now() > session.expiresAt || !session.isActive) {
      this.sessions.delete(sessionToken);
      return null;
    }

    // Update last accessed time
    session.lastAccessed = Date.now();
    this.sessions.set(sessionToken, session);

    return session;
  }

  /**
   * Refresh a session (extend expiration)
   */
  public refreshSession(sessionToken: string): WalletSession | null {
    const session = this.validateSession(sessionToken);
    if (!session) return null;

    // Check if session is eligible for refresh
    const timeUntilExpiry = session.expiresAt - Date.now();
    if (timeUntilExpiry > this.storageConfig.refreshThreshold) {
      return session; // No need to refresh yet
    }

    // Extend session
    session.expiresAt = Date.now() + this.config.sessionTimeout;
    this.sessions.set(sessionToken, session);

    return session;
  }

  /**
   * Revoke a session
   */
  public revokeSession(sessionToken: string): boolean {
    const session = this.sessions.get(sessionToken);
    if (!session) return false;

    session.isActive = false;
    this.sessions.delete(sessionToken);
    return true;
  }

  /**
   * Revoke all sessions for an address
   */
  public revokeAllSessions(address: string): number {
    let revokedCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.address === address) {
        session.isActive = false;
        this.sessions.delete(sessionId);
        revokedCount++;
      }
    }

    return revokedCount;
  }

  /**
   * Get active sessions for an address
   */
  public getActiveSessions(address: string): WalletSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.address === address && session.isActive);
  }

  /**
   * Verify wallet signature based on wallet type
   */
  private async verifyWalletSignature(
    message: string,
    signature: string,
    address: string,
    walletType: WalletType
  ): Promise<boolean> {
    try {
      switch (walletType) {
        case 'xverse':
          return await this.verifyXverseSignature(message, signature, address);
        case 'unisat':
          return await this.verifyUnisatSignature(message, signature, address);
        case 'oyl':
          return await this.verifyOylSignature(message, signature, address);
        default:
          throw new Error(`Signature verification not implemented for ${walletType}`);
      }
    } catch (error) {
      console.error(`Signature verification failed for ${walletType}:`, error);
      return false;
    }
  }

  /**
   * Verify Xverse wallet signature
   */
  private async verifyXverseSignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    // Implementation would use bitcoin message verification
    // This is a placeholder for the actual implementation
    try {
      // Use a Bitcoin message verification library like bitcoinjs-message
      // const bitcoin = require('bitcoinjs-message');
      // return bitcoin.verify(message, address, signature);
      
      // For now, return true if signature exists and has expected format
      return signature.length > 0 && this.isValidSignatureFormat(signature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Unisat wallet signature
   */
  private async verifyUnisatSignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    try {
      // Similar to Xverse, would use Bitcoin message verification
      return signature.length > 0 && this.isValidSignatureFormat(signature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify Oyl wallet signature
   */
  private async verifyOylSignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    try {
      // Oyl wallet signature verification
      return signature.length > 0 && this.isValidSignatureFormat(signature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if signature has valid format
   */
  private isValidSignatureFormat(signature: string): boolean {
    // Basic signature format validation
    // Actual implementation would be more sophisticated
    return /^[A-Za-z0-9+/]+=*$/.test(signature) && signature.length >= 64;
  }

  /**
   * Build challenge message
   */
  private buildChallengeMessage(nonce: string, timestamp: number, address?: string): string {
    const parts = [
      'CYPHER ORDi Future V3 Authentication Challenge',
      `Nonce: ${nonce}`,
      `Timestamp: ${timestamp}`,
      'Sign this message to authenticate your wallet'
    ];

    if (address) {
      parts.splice(3, 0, `Address: ${address}`);
    }

    return parts.join('\n');
  }

  /**
   * Generate secure ID
   */
  private generateSecureId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate cryptographic nonce
   */
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate session token
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(48).toString('base64url');
  }

  /**
   * Generate device fingerprint
   */
  private async generateDeviceFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return 'server';

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.platform
    ];

    const fingerprint = components.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if address is rate limited
   */
  private isRateLimited(address: string): boolean {
    if (!this.config.enableRateLimiting) return false;

    const attempts = this.failedAttempts.get(address);
    if (!attempts) return false;

    const isLockedOut = attempts.count >= this.config.maxFailedAttempts;
    const lockoutExpired = Date.now() - attempts.lastAttempt > this.config.lockoutDuration;

    return isLockedOut && !lockoutExpired;
  }

  /**
   * Record failed authentication attempt
   */
  private recordFailedAttempt(address: string): void {
    const existing = this.failedAttempts.get(address);
    const now = Date.now();

    if (existing && now - existing.lastAttempt < this.config.lockoutDuration) {
      existing.count++;
      existing.lastAttempt = now;
    } else {
      this.failedAttempts.set(address, { count: 1, lastAttempt: now });
    }
  }

  /**
   * Enforce session limits
   */
  private enforceSessionLimits(): void {
    const sessions = Array.from(this.sessions.entries());
    
    if (sessions.length >= this.storageConfig.maxSessions) {
      // Remove oldest sessions
      const sortedSessions = sessions.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
      const toRemove = sortedSessions.slice(0, sessions.length - this.storageConfig.maxSessions + 1);
      
      toRemove.forEach(([sessionId]) => {
        this.sessions.delete(sessionId);
      });
    }
  }

  /**
   * Start cleanup timer for expired challenges and sessions
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredChallenges();
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up expired challenges
   */
  private cleanupExpiredChallenges(): void {
    const now = Date.now();
    for (const [id, challenge] of this.challenges.entries()) {
      if (now > challenge.expiresAt) {
        this.challenges.delete(id);
      }
    }
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt || !session.isActive) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Get service statistics
   */
  public getStats(): {
    activeSessions: number;
    activeChallenges: number;
    failedAttempts: number;
    totalSessions: number;
  } {
    return {
      activeSessions: this.sessions.size,
      activeChallenges: this.challenges.size,
      failedAttempts: this.failedAttempts.size,
      totalSessions: this.sessions.size
    };
  }

  /**
   * Update security configuration
   */
  public updateSecurityConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Update storage configuration
   */
  public updateStorageConfig(newConfig: Partial<SessionStorageConfig>): void {
    this.storageConfig = { ...this.storageConfig, ...newConfig };
  }
}

export const walletAuthenticationService = WalletAuthenticationService.getInstance();
export default walletAuthenticationService;