/**
 * Validation Utilities
 * Comprehensive validation functions for security and data integrity
 * 
 * @version 1.0.0
 * @author CYPHER ORDI FUTURE - Enhanced Security Module
 */

export class ValidationUtils {
  private readonly BITCOIN_ADDRESS_REGEX = {
    P2PKH_MAINNET: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    P2SH_MAINNET: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    BECH32_MAINNET: /^bc1[a-z0-9]{39,59}$/,
    P2PKH_TESTNET: /^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    P2SH_TESTNET: /^2[a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    BECH32_TESTNET: /^tb1[a-z0-9]{39,59}$/
  };

  private readonly SIGNATURE_FORMATS = {
    BITCOIN_MESSAGE: /^[A-Za-z0-9+/]{87,88}=?$/,
    ECDSA_DER: /^30[0-9a-fA-F]{68,140}$/,
    ECDSA_COMPACT: /^[0-9a-fA-F]{128,130}$/
  };

  /**
   * Validate Bitcoin signature format
   */
  isValidSignature(signature: string): boolean {
    if (!signature || typeof signature !== 'string') {
      return false;
    }

    // Remove whitespace
    signature = signature.trim();

    // Check for common signature formats
    return Object.values(this.SIGNATURE_FORMATS).some(regex => regex.test(signature));
  }

  /**
   * Validate Bitcoin address format
   */
  isValidBitcoinAddress(address: string, network: 'mainnet' | 'testnet' | 'any' = 'any'): boolean {
    if (!address || typeof address !== 'string') {
      return false;
    }

    address = address.trim();

    if (network === 'mainnet' || network === 'any') {
      if (this.BITCOIN_ADDRESS_REGEX.P2PKH_MAINNET.test(address) ||
          this.BITCOIN_ADDRESS_REGEX.P2SH_MAINNET.test(address) ||
          this.BITCOIN_ADDRESS_REGEX.BECH32_MAINNET.test(address)) {
        return true;
      }
    }

    if (network === 'testnet' || network === 'any') {
      if (this.BITCOIN_ADDRESS_REGEX.P2PKH_TESTNET.test(address) ||
          this.BITCOIN_ADDRESS_REGEX.P2SH_TESTNET.test(address) ||
          this.BITCOIN_ADDRESS_REGEX.BECH32_TESTNET.test(address)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate transaction amount
   */
  isValidAmount(amount: number | string): boolean {
    try {
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (isNaN(numAmount) || !isFinite(numAmount)) {
        return false;
      }

      // Must be positive
      if (numAmount <= 0) {
        return false;
      }

      // Check reasonable bounds (max 21 million BTC in satoshis)
      if (numAmount > 2100000000000000) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate fee rate
   */
  isValidFeeRate(feeRate: number | string): boolean {
    try {
      const numFeeRate = typeof feeRate === 'string' ? parseFloat(feeRate) : feeRate;
      
      if (isNaN(numFeeRate) || !isFinite(numFeeRate)) {
        return false;
      }

      // Must be positive
      if (numFeeRate < 0) {
        return false;
      }

      // Reasonable upper bound (1000 sat/vB)
      if (numFeeRate > 1000) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate session ID format
   */
  isValidSessionId(sessionId: string): boolean {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }

    // Expected format: session_timestamp_randomstring
    const sessionPattern = /^session_\d+_[a-z0-9]{9}$/;
    return sessionPattern.test(sessionId);
  }

  /**
   * Validate wallet provider
   */
  isValidWalletProvider(provider: string): boolean {
    const validProviders = ['unisat', 'xverse', 'magiceden', 'oyl', 'leather', 'phantom'];
    return validProviders.includes(provider?.toLowerCase());
  }

  /**
   * Validate transaction hash
   */
  isValidTransactionHash(hash: string): boolean {
    if (!hash || typeof hash !== 'string') {
      return false;
    }

    // Bitcoin transaction hash is 64 hex characters
    const hashPattern = /^[a-fA-F0-9]{64}$/;
    return hashPattern.test(hash);
  }

  /**
   * Validate public key format
   */
  isValidPublicKey(publicKey: string): boolean {
    if (!publicKey || typeof publicKey !== 'string') {
      return false;
    }

    publicKey = publicKey.trim();

    // Compressed public key (33 bytes = 66 hex chars)
    const compressedPattern = /^[023][a-fA-F0-9]{64}$/;
    
    // Uncompressed public key (65 bytes = 130 hex chars)
    const uncompressedPattern = /^04[a-fA-F0-9]{128}$/;

    return compressedPattern.test(publicKey) || uncompressedPattern.test(publicKey);
  }

  /**
   * Validate PSBT format
   */
  isValidPSBT(psbt: string): boolean {
    if (!psbt || typeof psbt !== 'string') {
      return false;
    }

    // PSBT should be base64 encoded and start with specific magic bytes
    try {
      // Basic base64 validation
      const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
      if (!base64Pattern.test(psbt)) {
        return false;
      }

      // Decode and check magic bytes (cHNidP8= is base64 for PSBT magic)
      const decoded = atob(psbt);
      return decoded.startsWith('psbt\xff');
    } catch {
      return false;
    }
  }

  /**
   * Validate URL format
   */
  isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Validate timestamp
   */
  isValidTimestamp(timestamp: number | string | Date): boolean {
    try {
      const date = new Date(timestamp);
      return !isNaN(date.getTime()) && date.getTime() > 0;
    } catch {
      return false;
    }
  }

  /**
   * Validate JSON string
   */
  isValidJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate network type
   */
  isValidNetwork(network: string): boolean {
    const validNetworks = ['mainnet', 'testnet', 'regtest'];
    return validNetworks.includes(network?.toLowerCase());
  }

  /**
   * Validate hex string
   */
  isValidHex(hex: string, expectedLength?: number): boolean {
    if (!hex || typeof hex !== 'string') {
      return false;
    }

    const hexPattern = /^[a-fA-F0-9]+$/;
    
    if (!hexPattern.test(hex)) {
      return false;
    }

    if (expectedLength && hex.length !== expectedLength) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize input string
   */
  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
      .substring(0, 1000); // Limit length
  }

  /**
   * Validate and sanitize user agent
   */
  sanitizeUserAgent(userAgent: string): string {
    if (!userAgent || typeof userAgent !== 'string') {
      return 'Unknown';
    }

    return userAgent
      .trim()
      .substring(0, 500) // Limit length
      .replace(/[<>'"]/g, ''); // Remove dangerous characters
  }

  /**
   * Validate IP address format
   */
  isValidIPAddress(ip: string): boolean {
    if (!ip || typeof ip !== 'string') {
      return false;
    }

    // IPv4 pattern
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }

  /**
   * Validate ordinal inscription ID
   */
  isValidInscriptionId(inscriptionId: string): boolean {
    if (!inscriptionId || typeof inscriptionId !== 'string') {
      return false;
    }

    // Inscription ID format: txid + 'i' + index
    const inscriptionPattern = /^[a-fA-F0-9]{64}i\d+$/;
    return inscriptionPattern.test(inscriptionId);
  }

  /**
   * Validate rune ID
   */
  isValidRuneId(runeId: string): boolean {
    if (!runeId || typeof runeId !== 'string') {
      return false;
    }

    // Rune ID format: block:tx
    const runePattern = /^\d+:\d+$/;
    return runePattern.test(runeId);
  }

  /**
   * Validate BRC-20 token identifier
   */
  isValidBRC20Ticker(ticker: string): boolean {
    if (!ticker || typeof ticker !== 'string') {
      return false;
    }

    // BRC-20 tickers are typically 1-4 characters
    return ticker.length >= 1 && ticker.length <= 4 && /^[a-zA-Z0-9]+$/.test(ticker);
  }

  /**
   * Comprehensive input validation
   */
  validateInput(input: any, rules: ValidationRule[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    for (const rule of rules) {
      const ruleResult = this.applyValidationRule(input, rule);
      
      if (!ruleResult.isValid) {
        result.isValid = false;
        result.errors.push(...ruleResult.errors);
      }
      
      result.warnings.push(...ruleResult.warnings);
    }

    return result;
  }

  /**
   * Apply a single validation rule
   */
  private applyValidationRule(input: any, rule: ValidationRule): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    switch (rule.type) {
      case 'required':
        if (input === null || input === undefined || input === '') {
          result.isValid = false;
          result.errors.push(rule.message || 'Field is required');
        }
        break;

      case 'string':
        if (typeof input !== 'string') {
          result.isValid = false;
          result.errors.push(rule.message || 'Value must be a string');
        }
        break;

      case 'number':
        if (typeof input !== 'number' || isNaN(input)) {
          result.isValid = false;
          result.errors.push(rule.message || 'Value must be a number');
        }
        break;

      case 'bitcoin-address':
        if (!this.isValidBitcoinAddress(input, rule.network)) {
          result.isValid = false;
          result.errors.push(rule.message || 'Invalid Bitcoin address');
        }
        break;

      case 'signature':
        if (!this.isValidSignature(input)) {
          result.isValid = false;
          result.errors.push(rule.message || 'Invalid signature format');
        }
        break;

      case 'amount':
        if (!this.isValidAmount(input)) {
          result.isValid = false;
          result.errors.push(rule.message || 'Invalid amount');
        }
        break;

      case 'length':
        if (typeof input === 'string' && rule.min !== undefined && input.length < rule.min) {
          result.isValid = false;
          result.errors.push(rule.message || `Minimum length is ${rule.min}`);
        }
        if (typeof input === 'string' && rule.max !== undefined && input.length > rule.max) {
          result.isValid = false;
          result.errors.push(rule.message || `Maximum length is ${rule.max}`);
        }
        break;

      case 'range':
        if (typeof input === 'number') {
          if (rule.min !== undefined && input < rule.min) {
            result.isValid = false;
            result.errors.push(rule.message || `Minimum value is ${rule.min}`);
          }
          if (rule.max !== undefined && input > rule.max) {
            result.isValid = false;
            result.errors.push(rule.message || `Maximum value is ${rule.max}`);
          }
        }
        break;

      case 'regex':
        if (rule.pattern && typeof input === 'string' && !rule.pattern.test(input)) {
          result.isValid = false;
          result.errors.push(rule.message || 'Invalid format');
        }
        break;

      case 'custom':
        if (rule.validator) {
          const customResult = rule.validator(input);
          if (!customResult) {
            result.isValid = false;
            result.errors.push(rule.message || 'Custom validation failed');
          }
        }
        break;
    }

    return result;
  }
}

// Validation rule interface
export interface ValidationRule {
  type: 'required' | 'string' | 'number' | 'bitcoin-address' | 'signature' | 'amount' | 'length' | 'range' | 'regex' | 'custom';
  message?: string;
  network?: 'mainnet' | 'testnet' | 'any';
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Export singleton instance
export const validationUtils = new ValidationUtils();