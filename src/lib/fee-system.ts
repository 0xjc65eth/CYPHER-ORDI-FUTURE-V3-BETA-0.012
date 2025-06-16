/**
 * 💰 FEE SYSTEM - CYPHER ORDi FUTURE V3
 * Sistema de taxas de redirecionamento de 0.35% sem smart contracts
 */

import { EnhancedLogger } from './enhanced-logger';
import { ErrorReporter } from './ErrorReporter';

export interface FeeCalculation {
  originalAmount: number;
  feeAmount: number;
  netAmount: number;
  feePercentage: number;
  exchange: string;
  timestamp: number;
  transactionId: string;
}

export interface FeeRecord {
  id: string;
  amount: number;
  percentage: number;
  exchange: string;
  tradingPair: string;
  userId?: string;
  timestamp: number;
  status: 'pending' | 'collected' | 'failed';
  metadata: {
    originalTrade: number;
    netTrade: number;
    feeType: 'redirect' | 'platform' | 'arbitrage';
  };
}

export class FeeSystem {
  private static instance: FeeSystem;
  private readonly FEE_PERCENTAGE = 0.0035; // 0.35%
  private feeRecords: Map<string, FeeRecord> = new Map();
  private totalFeesCollected = 0;
  private readonly MIN_FEE_AMOUNT = 0.00001; // Minimum fee amount

  static getInstance(): FeeSystem {
    if (!FeeSystem.instance) {
      FeeSystem.instance = new FeeSystem();
    }
    return FeeSystem.instance;
  }

  /**
   * Calcula a taxa para um trade redirecionado
   */
  calculateFee(
    tradeAmount: number,
    exchange: string,
    tradingPair: string = 'BTC/USDT',
    feeType: 'redirect' | 'platform' | 'arbitrage' = 'redirect'
  ): FeeCalculation {
    try {
      const feeAmount = tradeAmount * this.FEE_PERCENTAGE;
      const netAmount = tradeAmount - feeAmount;
      const transactionId = this.generateTransactionId();

      // Log fee calculation
      EnhancedLogger.info('Fee calculated for redirected trade', {
        component: 'FeeSystem',
        tradeAmount,
        feeAmount,
        netAmount,
        exchange,
        tradingPair,
        feeType,
        transactionId
      });

      return {
        originalAmount: tradeAmount,
        feeAmount,
        netAmount,
        feePercentage: this.FEE_PERCENTAGE,
        exchange,
        timestamp: Date.now(),
        transactionId
      };
    } catch (error) {
      ErrorReporter.report(error as Error, {
        component: 'FeeSystem',
        action: 'calculateFee',
        tradeAmount,
        exchange
      });
      
      throw new Error('Failed to calculate fee');
    }
  }

  /**
   * Registra uma taxa coletada
   */
  async collectFee(
    feeCalculation: FeeCalculation,
    tradingPair: string,
    userId?: string,
    feeType: 'redirect' | 'platform' | 'arbitrage' = 'redirect'
  ): Promise<FeeRecord> {
    try {
      // Verificar valor mínimo
      if (feeCalculation.feeAmount < this.MIN_FEE_AMOUNT) {
        throw new Error('Fee amount below minimum threshold');
      }

      const feeRecord: FeeRecord = {
        id: feeCalculation.transactionId,
        amount: feeCalculation.feeAmount,
        percentage: this.FEE_PERCENTAGE,
        exchange: feeCalculation.exchange,
        tradingPair,
        userId,
        timestamp: feeCalculation.timestamp,
        status: 'pending',
        metadata: {
          originalTrade: feeCalculation.originalAmount,
          netTrade: feeCalculation.netAmount,
          feeType
        }
      };

      // Salvar no registry
      this.feeRecords.set(feeRecord.id, feeRecord);

      // Simular coleta (em produção, integraria com sistema de pagamento)
      await this.processFeeCollection(feeRecord);

      EnhancedLogger.info('Fee collected successfully', {
        component: 'FeeSystem',
        feeId: feeRecord.id,
        amount: feeRecord.amount,
        exchange: feeRecord.exchange,
        tradingPair,
        feeType
      });

      return feeRecord;
    } catch (error) {
      ErrorReporter.report(error as Error, {
        component: 'FeeSystem',
        action: 'collectFee',
        amount: feeCalculation.feeAmount,
        exchange: feeCalculation.exchange
      });
      
      throw new Error('Failed to collect fee');
    }
  }

  /**
   * Processa a coleta da taxa (simula integração com gateway de pagamento)
   */
  private async processFeeCollection(feeRecord: FeeRecord): Promise<void> {
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 100));

      // Atualizar status
      feeRecord.status = 'collected';
      this.totalFeesCollected += feeRecord.amount;

      // Em produção, aqui seria feita a transferência real dos fundos
      this.logFeeToDatabase(feeRecord);

      EnhancedLogger.info('Fee processing completed', {
        component: 'FeeSystem',
        feeId: feeRecord.id,
        status: feeRecord.status,
        totalCollected: this.totalFeesCollected
      });
    } catch (error) {
      feeRecord.status = 'failed';
      ErrorReporter.report(error as Error, {
        component: 'FeeSystem',
        action: 'processFeeCollection',
        feeId: feeRecord.id
      });
      
      throw error;
    }
  }

  /**
   * Log de taxa para database (em produção, seria integrado com BD real)
   */
  private logFeeToDatabase(feeRecord: FeeRecord): void {
    try {
      // Simular insert no database
      const dbRecord = {
        fee_id: feeRecord.id,
        amount: feeRecord.amount,
        percentage: feeRecord.percentage,
        exchange: feeRecord.exchange,
        trading_pair: feeRecord.tradingPair,
        user_id: feeRecord.userId,
        timestamp: new Date(feeRecord.timestamp).toISOString(),
        status: feeRecord.status,
        original_trade: feeRecord.metadata.originalTrade,
        net_trade: feeRecord.metadata.netTrade,
        fee_type: feeRecord.metadata.feeType,
        created_at: new Date().toISOString()
      };

      EnhancedLogger.info('Fee logged to database', {
        component: 'FeeSystem',
        database: 'fees_collection',
        record: dbRecord
      });
    } catch (error) {
      ErrorReporter.report(error as Error, {
        component: 'FeeSystem',
        action: 'logFeeToDatabase',
        feeId: feeRecord.id
      });
    }
  }

  /**
   * Obtém estatísticas de taxas
   */
  getFeeStatistics(): {
    totalFeesCollected: number;
    totalRecords: number;
    successfulCollections: number;
    failedCollections: number;
    pendingCollections: number;
    averageFeeAmount: number;
    feesByExchange: Record<string, number>;
    feesByType: Record<string, number>;
  } {
    const records = Array.from(this.feeRecords.values());
    const successful = records.filter(r => r.status === 'collected');
    const failed = records.filter(r => r.status === 'failed');
    const pending = records.filter(r => r.status === 'pending');

    const feesByExchange: Record<string, number> = {};
    const feesByType: Record<string, number> = {};

    successful.forEach(record => {
      feesByExchange[record.exchange] = (feesByExchange[record.exchange] || 0) + record.amount;
      feesByType[record.metadata.feeType] = (feesByType[record.metadata.feeType] || 0) + record.amount;
    });

    return {
      totalFeesCollected: this.totalFeesCollected,
      totalRecords: records.length,
      successfulCollections: successful.length,
      failedCollections: failed.length,
      pendingCollections: pending.length,
      averageFeeAmount: successful.length > 0 ? this.totalFeesCollected / successful.length : 0,
      feesByExchange,
      feesByType
    };
  }

  /**
   * Obtém histórico de taxas
   */
  getFeeHistory(limit = 50): FeeRecord[] {
    const records = Array.from(this.feeRecords.values());
    return records
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Busca taxa por ID
   */
  getFeeRecord(feeId: string): FeeRecord | null {
    return this.feeRecords.get(feeId) || null;
  }

  /**
   * Calcula taxa para arbitragem
   */
  calculateArbitrageFee(
    buyAmount: number,
    sellAmount: number,
    buyExchange: string,
    sellExchange: string
  ): {
    buyFee: FeeCalculation;
    sellFee: FeeCalculation;
    totalFees: number;
    netProfit: number;
  } {
    const buyFee = this.calculateFee(buyAmount, buyExchange, 'BTC/USDT', 'arbitrage');
    const sellFee = this.calculateFee(sellAmount, sellExchange, 'BTC/USDT', 'arbitrage');
    const totalFees = buyFee.feeAmount + sellFee.feeAmount;
    const grossProfit = sellAmount - buyAmount;
    const netProfit = grossProfit - totalFees;

    EnhancedLogger.info('Arbitrage fees calculated', {
      component: 'FeeSystem',
      buyAmount,
      sellAmount,
      grossProfit,
      totalFees,
      netProfit,
      buyExchange,
      sellExchange
    });

    return {
      buyFee,
      sellFee,
      totalFees,
      netProfit
    };
  }

  /**
   * Gera ID único para transação
   */
  private generateTransactionId(): string {
    return `FEE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Valida se uma taxa deve ser aplicada
   */
  shouldApplyFee(tradeAmount: number, exchange: string): boolean {
    return tradeAmount >= this.MIN_FEE_AMOUNT && exchange !== 'internal';
  }

  /**
   * Obtém a porcentagem de taxa atual
   */
  getFeePercentage(): number {
    return this.FEE_PERCENTAGE;
  }

  /**
   * Limpa registros antigos
   */
  clearOldRecords(olderThanDays = 30): number {
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let removedCount = 0;

    for (const [id, record] of this.feeRecords.entries()) {
      if (record.timestamp < cutoffTime) {
        this.feeRecords.delete(id);
        removedCount++;
      }
    }

    EnhancedLogger.info('Old fee records cleared', {
      component: 'FeeSystem',
      removedCount,
      olderThanDays
    });

    return removedCount;
  }
}

// Singleton instance
export const feeSystem = FeeSystem.getInstance();

// Utility functions
export function calculateRedirectFee(amount: number, exchange: string): FeeCalculation {
  return feeSystem.calculateFee(amount, exchange, 'BTC/USDT', 'redirect');
}

export async function collectRedirectFee(
  amount: number,
  exchange: string,
  tradingPair = 'BTC/USDT',
  userId?: string
): Promise<FeeRecord> {
  const feeCalc = calculateRedirectFee(amount, exchange);
  return await feeSystem.collectFee(feeCalc, tradingPair, userId, 'redirect');
}

export default FeeSystem;