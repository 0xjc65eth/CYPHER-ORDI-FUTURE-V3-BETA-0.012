/**
 * 🌐 CYPHER FEE DISTRIBUTION SYSTEM
 * Sistema de distribuição de taxas por rede
 * Gerencia e distribui taxas coletadas automaticamente
 */

import { NetworkType, CalculatedFee } from './feeManager';
import { WALLET_ADDRESSES } from '@/config/feeRecipients';

// Interface para distribuição de taxa
export interface FeeDistribution {
  network: NetworkType;
  totalCollected: number;
  totalTransactions: number;
  pendingDistribution: number;
  lastDistribution: Date | null;
  recipientAddress: string;
  status: 'active' | 'pending' | 'error';
}

// Interface para transação de distribuição
export interface DistributionTransaction {
  id: string;
  network: NetworkType;
  amount: number;
  recipientAddress: string;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  gasUsed?: number;
  gasCost?: number;
}

// Interface para configuração de distribuição
export interface DistributionConfig {
  minimumAmount: number; // Valor mínimo para distribuir
  distributionFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  autoDistribution: boolean;
  gasOptimization: boolean;
}

/**
 * Classe principal do sistema de distribuição
 */
export class CypherFeeDistributor {
  private static instance: CypherFeeDistributor;
  private distributions: Map<NetworkType, FeeDistribution>;
  private config: DistributionConfig;

  private constructor() {
    this.distributions = new Map();
    this.config = {
      minimumAmount: 10, // $10 USD mínimo
      distributionFrequency: 'daily',
      autoDistribution: true,
      gasOptimization: true
    };
    this.initializeDistributions();
  }

  public static getInstance(): CypherFeeDistributor {
    if (!CypherFeeDistributor.instance) {
      CypherFeeDistributor.instance = new CypherFeeDistributor();
    }
    return CypherFeeDistributor.instance;
  }

  /**
   * Inicializa distribuições para todas as redes
   */
  private initializeDistributions(): void {
    const networks: NetworkType[] = [
      'bitcoin',
      'ethereum',
      'polygon',
      'bsc',
      'arbitrum',
      'optimism',
      'base',
      'avalanche',
      'solana'
    ];

    networks.forEach(network => {
      this.distributions.set(network, {
        network,
        totalCollected: 0,
        totalTransactions: 0,
        pendingDistribution: 0,
        lastDistribution: null,
        recipientAddress: this.getRecipientAddress(network),
        status: 'active'
      });
    });
  }

  /**
   * Obtém endereço de destinatário por rede
   */
  private getRecipientAddress(network: NetworkType): string {
    switch (network) {
      case 'bitcoin':
        return WALLET_ADDRESSES.BITCOIN;
      case 'solana':
        return WALLET_ADDRESSES.SOLANA;
      default:
        return WALLET_ADDRESSES.EVM;
    }
  }

  /**
   * Adiciona taxa coletada ao sistema de distribuição
   */
  public async addCollectedFee(calculatedFee: CalculatedFee): Promise<void> {
    const distribution = this.distributions.get(calculatedFee.network);
    
    if (!distribution) {
      console.error(`❌ Network ${calculatedFee.network} not found in distributions`);
      return;
    }

    // Atualiza dados da distribuição
    distribution.totalCollected += calculatedFee.feeAmountUSD;
    distribution.totalTransactions += 1;
    distribution.pendingDistribution += calculatedFee.feeAmountUSD;

    this.distributions.set(calculatedFee.network, distribution);

    console.log('📊 FEE ADDED TO DISTRIBUTION:', {
      network: calculatedFee.network,
      feeAmount: calculatedFee.feeAmountUSD,
      totalCollected: distribution.totalCollected,
      pendingDistribution: distribution.pendingDistribution,
      timestamp: new Date().toISOString()
    });

    // Verifica se precisa distribuir automaticamente
    if (this.config.autoDistribution) {
      await this.checkAutoDistribution(calculatedFee.network);
    }
  }

  /**
   * Verifica se deve distribuir automaticamente
   */
  private async checkAutoDistribution(network: NetworkType): Promise<void> {
    const distribution = this.distributions.get(network);
    
    if (!distribution) return;

    // Verifica se atende ao valor mínimo
    if (distribution.pendingDistribution >= this.config.minimumAmount) {
      // Verifica frequência
      const shouldDistribute = this.shouldDistributeByFrequency(distribution);
      
      if (shouldDistribute) {
        await this.distributeNetworkFees(network);
      }
    }
  }

  /**
   * Verifica se deve distribuir baseado na frequência configurada
   */
  private shouldDistributeByFrequency(distribution: FeeDistribution): boolean {
    if (!distribution.lastDistribution) return true;

    const now = new Date();
    const lastDistribution = distribution.lastDistribution;
    const timeDiff = now.getTime() - lastDistribution.getTime();

    switch (this.config.distributionFrequency) {
      case 'hourly':
        return timeDiff >= 60 * 60 * 1000; // 1 hora
      case 'daily':
        return timeDiff >= 24 * 60 * 60 * 1000; // 1 dia
      case 'weekly':
        return timeDiff >= 7 * 24 * 60 * 60 * 1000; // 1 semana
      case 'manual':
        return false;
      default:
        return false;
    }
  }

  /**
   * Distribui taxas de uma rede específica
   */
  public async distributeNetworkFees(network: NetworkType): Promise<DistributionTransaction> {
    const distribution = this.distributions.get(network);
    
    if (!distribution || distribution.pendingDistribution <= 0) {
      throw new Error(`No pending distribution for network ${network}`);
    }

    try {
      // Simula a distribuição (aqui seria a lógica real de transferência)
      const transaction: DistributionTransaction = {
        id: `dist_${Date.now()}_${network}`,
        network,
        amount: distribution.pendingDistribution,
        recipientAddress: distribution.recipientAddress,
        status: 'pending',
        timestamp: new Date()
      };

      // Simula processamento
      await this.simulateDistribution(transaction);

      // Atualiza distribuição
      distribution.pendingDistribution = 0;
      distribution.lastDistribution = new Date();
      distribution.status = 'active';
      
      this.distributions.set(network, distribution);

      console.log('💸 FEE DISTRIBUTION COMPLETED:', {
        transactionId: transaction.id,
        network,
        amount: transaction.amount,
        recipientAddress: transaction.recipientAddress,
        timestamp: transaction.timestamp
      });

      return transaction;
    } catch (error) {
      const distribution = this.distributions.get(network)!;
      distribution.status = 'error';
      this.distributions.set(network, distribution);

      console.error('❌ FEE DISTRIBUTION ERROR:', error);
      throw error;
    }
  }

  /**
   * Simula a distribuição de taxa (placeholder para integração real)
   */
  private async simulateDistribution(transaction: DistributionTransaction): Promise<void> {
    // Simula delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simula sucesso (95% das vezes)
    if (Math.random() > 0.05) {
      transaction.status = 'confirmed';
      transaction.txHash = `dist_${Date.now()}_${transaction.network}`;
      
      // Simula custos de gas (apenas para EVMs)
      if (transaction.network !== 'bitcoin' && transaction.network !== 'solana') {
        transaction.gasUsed = Math.floor(Math.random() * 50000) + 21000;
        transaction.gasCost = transaction.gasUsed * 0.00001; // Simula gas price
      }
    } else {
      transaction.status = 'failed';
      throw new Error('Distribution simulation failed');
    }
  }

  /**
   * Obtém todas as distribuições
   */
  public getAllDistributions(): FeeDistribution[] {
    return Array.from(this.distributions.values());
  }

  /**
   * Obtém distribuição de uma rede específica
   */
  public getNetworkDistribution(network: NetworkType): FeeDistribution | undefined {
    return this.distributions.get(network);
  }

  /**
   * Obtém estatísticas gerais de distribuição
   */
  public getDistributionStats(): {
    totalCollected: number;
    totalPending: number;
    totalNetworks: number;
    activeNetworks: number;
    lastDistribution: Date | null;
  } {
    const distributions = Array.from(this.distributions.values());
    
    return {
      totalCollected: distributions.reduce((sum, dist) => sum + dist.totalCollected, 0),
      totalPending: distributions.reduce((sum, dist) => sum + dist.pendingDistribution, 0),
      totalNetworks: distributions.length,
      activeNetworks: distributions.filter(dist => dist.status === 'active').length,
      lastDistribution: distributions
        .map(dist => dist.lastDistribution)
        .filter(date => date !== null)
        .sort((a, b) => (b?.getTime() || 0) - (a?.getTime() || 0))[0] || null
    };
  }

  /**
   * Atualiza configuração de distribuição
   */
  public updateConfig(newConfig: Partial<DistributionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    console.log('⚙️ DISTRIBUTION CONFIG UPDATED:', this.config);
  }

  /**
   * Obtém configuração atual
   */
  public getConfig(): DistributionConfig {
    return { ...this.config };
  }

  /**
   * Distribui todas as taxas pendentes manualmente
   */
  public async distributeAllPendingFees(): Promise<DistributionTransaction[]> {
    const distributions = Array.from(this.distributions.values())
      .filter(dist => dist.pendingDistribution >= this.config.minimumAmount);

    const results: DistributionTransaction[] = [];

    for (const distribution of distributions) {
      try {
        const result = await this.distributeNetworkFees(distribution.network);
        results.push(result);
      } catch (error) {
        console.error(`Failed to distribute ${distribution.network} fees:`, error);
      }
    }

    return results;
  }

  /**
   * Força distribuição de uma rede específica (ignora mínimos)
   */
  public async forceDistributeNetwork(network: NetworkType): Promise<DistributionTransaction> {
    const distribution = this.distributions.get(network);
    
    if (!distribution || distribution.pendingDistribution <= 0) {
      throw new Error(`No funds to distribute for network ${network}`);
    }

    return await this.distributeNetworkFees(network);
  }
}

// Instância singleton para uso global
export const cypherFeeDistributor = CypherFeeDistributor.getInstance();

// Funções utilitárias exportadas
export function formatDistributionAmount(amount: number): string {
  return `$${amount.toFixed(4)}`;
}

export function getNetworkDisplayName(network: NetworkType): string {
  const names: Record<NetworkType, string> = {
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    bsc: 'BNB Chain',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
    base: 'Base',
    avalanche: 'Avalanche',
    solana: 'Solana'
  };
  
  return names[network] || network.toUpperCase();
}

export function getDistributionFrequencyText(frequency: DistributionConfig['distributionFrequency']): string {
  const texts = {
    hourly: 'Every Hour',
    daily: 'Daily',
    weekly: 'Weekly',
    manual: 'Manual Only'
  };
  
  return texts[frequency];
}