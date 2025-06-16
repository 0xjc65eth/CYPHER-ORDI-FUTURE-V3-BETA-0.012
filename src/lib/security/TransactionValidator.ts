/**
 * CYPHER ORDI FUTURE - Transaction Validator
 * Advanced Bitcoin transaction validation and security checks
 * Agent 8 - Security and Validation Implementation
 */

import { securityLogger } from '../../utils/security.js';
import { z } from 'zod';

// ===========================================
// TRANSACTION VALIDATION SCHEMAS
// ===========================================

const BitcoinAddressSchema = z.string().regex(
  /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}$/,
  'Invalid Bitcoin address format'
);

const AmountSchema = z.number()
  .positive('Amount must be positive')
  .max(21000000, 'Amount exceeds maximum Bitcoin supply')
  .refine(val => val >= 0.00000001, 'Amount too small (minimum 1 satoshi)');

const FeeSchema = z.number()
  .nonnegative('Fee must be non-negative')
  .max(1, 'Fee too high (maximum 1 BTC)');

const TransactionSchema = z.object({
  from: BitcoinAddressSchema,
  to: BitcoinAddressSchema,
  amount: AmountSchema,
  fee: FeeSchema.optional(),
  memo: z.string().max(80, 'Memo must be 80 characters or less').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  rbf: z.boolean().default(true), // Replace-by-fee
});

const OrdinalsTransactionSchema = TransactionSchema.extend({
  inscriptionId: z.string().optional(),
  ordinalsData: z.object({
    contentType: z.string(),
    content: z.string(),
    receiver: BitcoinAddressSchema
  }).optional()
});

const RunesTransactionSchema = TransactionSchema.extend({
  runeName: z.string().min(1, 'Rune name required'),
  runeAmount: z.number().positive('Rune amount must be positive'),
  runeDecimals: z.number().int().min(0).max(18).default(0)
});

// ===========================================
// TRANSACTION VALIDATOR CLASS
// ===========================================

export class TransactionValidator {
  private static instance: TransactionValidator;
  private validationCache: Map<string, any> = new Map();
  private blacklistedAddresses: Set<string> = new Set();
  private maxTransactionValue = 10; // BTC
  private dailyLimits: Map<string, { amount: number; timestamp: number }> = new Map();

  constructor() {
    this.loadBlacklistedAddresses();
    this.setupCleanupInterval();
  }

  public static getInstance(): TransactionValidator {
    if (!TransactionValidator.instance) {
      TransactionValidator.instance = new TransactionValidator();
    }
    return TransactionValidator.instance;
  }

  // ===========================================
  // MAIN VALIDATION METHODS
  // ===========================================

  /**
   * Validates a standard Bitcoin transaction
   */
  public async validateBitcoinTransaction(transaction: any): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Basic schema validation
      const schemaResult = this.validateSchema(transaction, TransactionSchema);
      if (!schemaResult.isValid) {
        return schemaResult;
      }

      // Advanced security checks
      const securityChecks = await this.performSecurityChecks(transaction);
      if (!securityChecks.isValid) {
        return securityChecks;
      }

      // Network and fee validation
      const networkChecks = await this.validateNetworkConditions(transaction);
      if (!networkChecks.isValid) {
        return networkChecks;
      }

      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        riskLevel: this.calculateRiskLevel(transaction),
        estimatedFee: await this.estimateOptimalFee(transaction),
        validationTime: Date.now() - startTime,
        metadata: {
          transactionType: 'bitcoin',
          validated: true,
          timestamp: new Date().toISOString()
        }
      };

      this.logValidation('BITCOIN_TRANSACTION_VALIDATED', transaction, result);
      return result;

    } catch (error) {
      const errorResult: ValidationResult = {
        isValid: false,
        errors: [`Validation failed: ${error.message}`],
        warnings: [],
        riskLevel: 'high',
        validationTime: Date.now() - startTime,
        metadata: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };

      this.logValidation('BITCOIN_TRANSACTION_VALIDATION_FAILED', transaction, errorResult);
      return errorResult;
    }
  }

  /**
   * Validates an Ordinals transaction
   */
  public async validateOrdinalsTransaction(transaction: any): Promise<ValidationResult> {
    try {
      // Schema validation
      const schemaResult = this.validateSchema(transaction, OrdinalsTransactionSchema);
      if (!schemaResult.isValid) {
        return schemaResult;
      }

      // Ordinals-specific validation
      const ordinalsChecks = await this.validateOrdinalsSpecific(transaction);
      if (!ordinalsChecks.isValid) {
        return ordinalsChecks;
      }

      // Standard security checks
      const securityChecks = await this.performSecurityChecks(transaction);
      
      const result: ValidationResult = {
        isValid: securityChecks.isValid,
        errors: securityChecks.errors,
        warnings: securityChecks.warnings,
        riskLevel: this.calculateRiskLevel(transaction, 'ordinals'),
        estimatedFee: await this.estimateOrdinalsFee(transaction),
        validationTime: 0,
        metadata: {
          transactionType: 'ordinals',
          validated: true,
          timestamp: new Date().toISOString()
        }
      };

      this.logValidation('ORDINALS_TRANSACTION_VALIDATED', transaction, result);
      return result;

    } catch (error) {
      return this.createErrorResult(error, 'ordinals');
    }
  }

  /**
   * Validates a Runes transaction
   */
  public async validateRunesTransaction(transaction: any): Promise<ValidationResult> {
    try {
      // Schema validation
      const schemaResult = this.validateSchema(transaction, RunesTransactionSchema);
      if (!schemaResult.isValid) {
        return schemaResult;
      }

      // Runes-specific validation
      const runesChecks = await this.validateRunesSpecific(transaction);
      if (!runesChecks.isValid) {
        return runesChecks;
      }

      // Standard security checks
      const securityChecks = await this.performSecurityChecks(transaction);

      const result: ValidationResult = {
        isValid: securityChecks.isValid,
        errors: securityChecks.errors,
        warnings: securityChecks.warnings,
        riskLevel: this.calculateRiskLevel(transaction, 'runes'),
        estimatedFee: await this.estimateRunesFee(transaction),
        validationTime: 0,
        metadata: {
          transactionType: 'runes',
          runeName: transaction.runeName,
          validated: true,
          timestamp: new Date().toISOString()
        }
      };

      this.logValidation('RUNES_TRANSACTION_VALIDATED', transaction, result);
      return result;

    } catch (error) {
      return this.createErrorResult(error, 'runes');
    }
  }

  // ===========================================
  // SECURITY VALIDATION METHODS
  // ===========================================

  private async performSecurityChecks(transaction: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check blacklisted addresses
    if (this.isBlacklistedAddress(transaction.from) || this.isBlacklistedAddress(transaction.to)) {
      errors.push('Transaction involves blacklisted address');
    }

    // Check daily limits
    const dailyCheck = this.checkDailyLimits(transaction.from, transaction.amount);
    if (!dailyCheck.valid) {
      errors.push(dailyCheck.message);
    }

    // Check transaction value limits
    if (transaction.amount > this.maxTransactionValue) {
      errors.push(`Transaction amount exceeds maximum allowed (${this.maxTransactionValue} BTC)`);
    }

    // Check for round amounts (potential indicator of automated/bot transactions)
    if (this.isRoundAmount(transaction.amount)) {
      warnings.push('Round amount detected - review for potential automation');
    }

    // Check address reuse
    if (transaction.from === transaction.to) {
      errors.push('Cannot send to same address');
    }

    // Check fee reasonableness
    if (transaction.fee) {
      const feeCheck = this.validateFeeReasonableness(transaction.amount, transaction.fee);
      if (feeCheck.errors.length > 0) {
        errors.push(...feeCheck.errors);
      }
      if (feeCheck.warnings.length > 0) {
        warnings.push(...feeCheck.warnings);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel: 'medium',
      validationTime: 0,
      metadata: {
        securityChecksPerformed: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  private validateSchema(transaction: any, schema: z.ZodSchema): ValidationResult {
    try {
      schema.parse(transaction);
      return {
        isValid: true,
        errors: [],
        warnings: [],
        riskLevel: 'low',
        validationTime: 0,
        metadata: { schemaValid: true }
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return {
          isValid: false,
          errors,
          warnings: [],
          riskLevel: 'high',
          validationTime: 0,
          metadata: { schemaValid: false }
        };
      }
      throw error;
    }
  }

  // ===========================================
  // SPECIFIC VALIDATION METHODS
  // ===========================================

  private async validateOrdinalsSpecific(transaction: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (transaction.ordinalsData) {
      // Validate content type
      const allowedTypes = ['text/plain', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(transaction.ordinalsData.contentType)) {
        warnings.push(`Uncommon content type: ${transaction.ordinalsData.contentType}`);
      }

      // Check content size
      const contentSize = Buffer.byteLength(transaction.ordinalsData.content, 'utf8');
      if (contentSize > 400000) { // 400KB limit
        errors.push('Ordinals content too large (max 400KB)');
      }

      // Validate receiver address
      if (transaction.ordinalsData.receiver !== transaction.to) {
        warnings.push('Ordinals receiver differs from transaction recipient');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel: 'medium',
      validationTime: 0,
      metadata: { ordinalsValidated: true }
    };
  }

  private async validateRunesSpecific(transaction: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate rune name format
    if (!/^[A-Z]+$/.test(transaction.runeName)) {
      errors.push('Rune name must contain only uppercase letters');
    }

    // Check rune name length
    if (transaction.runeName.length < 1 || transaction.runeName.length > 28) {
      errors.push('Rune name must be 1-28 characters');
    }

    // Validate rune amount with decimals
    const maxAmount = Math.pow(10, 18); // Max amount considering decimals
    if (transaction.runeAmount > maxAmount) {
      errors.push('Rune amount too large');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      riskLevel: 'medium',
      validationTime: 0,
      metadata: { runesValidated: true }
    };
  }

  private async validateNetworkConditions(transaction: any): Promise<ValidationResult> {
    const warnings: string[] = [];

    // Check if network is congested (simulated)
    const isNetworkCongested = await this.checkNetworkCongestion();
    if (isNetworkCongested) {
      warnings.push('Network congestion detected - consider higher fee or delay');
    }

    // Check mempool status
    const mempoolStatus = await this.checkMempoolStatus();
    if (mempoolStatus.backlog > 100000) {
      warnings.push('High mempool backlog - transaction may take longer to confirm');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      riskLevel: 'low',
      validationTime: 0,
      metadata: { networkChecked: true }
    };
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  private calculateRiskLevel(transaction: any, type: string = 'bitcoin'): RiskLevel {
    let riskScore = 0;

    // High amount
    if (transaction.amount > 1) riskScore += 2;
    if (transaction.amount > 5) riskScore += 3;

    // Low fee (relative to amount)
    if (transaction.fee && (transaction.fee / transaction.amount) < 0.001) {
      riskScore += 1;
    }

    // Special handling for different transaction types
    if (type === 'ordinals' && transaction.ordinalsData) {
      riskScore += 1; // Ordinals inherently more complex
    }

    if (type === 'runes') {
      riskScore += 1; // Runes also more complex
    }

    if (riskScore >= 5) return 'high';
    if (riskScore >= 3) return 'medium';
    return 'low';
  }

  private async estimateOptimalFee(transaction: any): Promise<number> {
    // Simulate fee estimation based on network conditions
    const baseRate = 20; // sats per vbyte
    const txSize = this.estimateTransactionSize(transaction);
    return Math.ceil(baseRate * txSize);
  }

  private async estimateOrdinalsFee(transaction: any): Promise<number> {
    const baseFee = await this.estimateOptimalFee(transaction);
    const inscriptionSize = transaction.ordinalsData ? 
      Buffer.byteLength(transaction.ordinalsData.content, 'utf8') : 0;
    return baseFee + Math.ceil(inscriptionSize * 1.5); // Higher rate for inscription data
  }

  private async estimateRunesFee(transaction: any): Promise<number> {
    const baseFee = await this.estimateOptimalFee(transaction);
    return baseFee + 5000; // Additional fee for Runes protocol overhead
  }

  private estimateTransactionSize(transaction: any): number {
    // Simplified transaction size estimation
    const inputSize = 148; // Average input size
    const outputSize = 34; // Average output size
    const overhead = 10; // Transaction overhead
    
    return inputSize + (outputSize * 2) + overhead; // Assume 1 input, 2 outputs
  }

  private isBlacklistedAddress(address: string): boolean {
    return this.blacklistedAddresses.has(address);
  }

  private checkDailyLimits(address: string, amount: number): { valid: boolean; message?: string } {
    const today = new Date().toDateString();
    const key = `${address}_${today}`;
    const limit = this.dailyLimits.get(key);

    if (!limit) {
      this.dailyLimits.set(key, { amount, timestamp: Date.now() });
      return { valid: true };
    }

    const dailyLimit = 50; // 50 BTC daily limit
    const newTotal = limit.amount + amount;

    if (newTotal > dailyLimit) {
      return {
        valid: false,
        message: `Daily limit exceeded (${dailyLimit} BTC)`
      };
    }

    limit.amount = newTotal;
    return { valid: true };
  }

  private isRoundAmount(amount: number): boolean {
    return amount === Math.floor(amount) && amount >= 1;
  }

  private validateFeeReasonableness(amount: number, fee: number): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const feePercentage = (fee / amount) * 100;

    if (feePercentage > 10) {
      errors.push('Fee exceeds 10% of transaction amount');
    } else if (feePercentage > 5) {
      warnings.push('High fee percentage (>5% of amount)');
    }

    if (fee < 1000) { // Less than 1000 sats
      warnings.push('Very low fee - transaction may not confirm quickly');
    }

    return { errors, warnings };
  }

  private async checkNetworkCongestion(): Promise<boolean> {
    // Simulate network congestion check
    return Math.random() > 0.8; // 20% chance of congestion
  }

  private async checkMempoolStatus(): Promise<{ backlog: number }> {
    // Simulate mempool status check
    return { backlog: Math.floor(Math.random() * 200000) };
  }

  private createErrorResult(error: any, type: string): ValidationResult {
    return {
      isValid: false,
      errors: [`${type} validation failed: ${error.message}`],
      warnings: [],
      riskLevel: 'high',
      validationTime: 0,
      metadata: {
        error: error.message,
        transactionType: type,
        timestamp: new Date().toISOString()
      }
    };
  }

  private logValidation(event: string, transaction: any, result: ValidationResult): void {
    securityLogger({
      event,
      timestamp: new Date().toISOString(),
      success: result.isValid,
      riskLevel: result.riskLevel,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      validationTime: result.validationTime,
      metadata: {
        amount: transaction.amount,
        transactionType: result.metadata?.transactionType
      }
    });
  }

  private loadBlacklistedAddresses(): void {
    // In production, load from external source
    const knownBadAddresses = [
      // Add known malicious addresses here
    ];
    
    knownBadAddresses.forEach(addr => this.blacklistedAddresses.add(addr));
  }

  private setupCleanupInterval(): void {
    // Clean up old daily limits every hour
    setInterval(() => {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      for (const [key, value] of this.dailyLimits.entries()) {
        if (value.timestamp < oneDayAgo) {
          this.dailyLimits.delete(key);
        }
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

// ===========================================
// TYPES AND INTERFACES
// ===========================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskLevel: RiskLevel;
  estimatedFee?: number;
  validationTime: number;
  metadata: Record<string, any>;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface TransactionValidationOptions {
  skipBlacklistCheck?: boolean;
  skipDailyLimitCheck?: boolean;
  skipNetworkCheck?: boolean;
  customFeeRate?: number;
}

// ===========================================
// EXPORT DEFAULT INSTANCE
// ===========================================

export default TransactionValidator.getInstance();