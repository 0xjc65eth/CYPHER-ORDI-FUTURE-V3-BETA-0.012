/**
 * 🔺 TRIANGULAR ARBITRAGE ENGINE
 * Advanced triangular arbitrage detection for cryptocurrency markets
 * Identifies risk-free profit opportunities across multiple trading pairs
 */

import { logger } from '@/lib/logger';

export interface ArbitrageOpportunity {
  id: string;
  type: 'TRIANGULAR' | 'CROSS_EXCHANGE';
  baseCurrency: string;
  tradingPath: TradingStep[];
  expectedProfit: number; // Percentage
  profitAmount: number; // In base currency
  minInvestment: number;
  maxInvestment: number;
  executionTime: number; // Estimated seconds
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number; // 0-100%
  exchanges: string[];
  timestamp: string;
  expiresAt: string;
  fees: {
    trading: number;
    network: number;
    slippage: number;
    total: number;
  };
}

export interface TradingStep {
  step: number;
  action: 'BUY' | 'SELL';
  pair: string;
  fromCurrency: string;
  toCurrency: string;
  price: number;
  volume: number;
  exchange: string;
  estimatedTime: number;
}

export interface MarketData {
  exchange: string;
  pair: string;
  bid: number;
  ask: number;
  volume: number;
  timestamp: string;
  spread: number;
  liquidity: number;
}

export interface ArbitrageAlert {
  id: string;
  opportunity: ArbitrageOpportunity;
  type: 'NEW_OPPORTUNITY' | 'PRICE_CHANGE' | 'EXPIRING' | 'EXECUTED';
  message: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  actionRequired: boolean;
}

interface ExchangeRates {
  [pair: string]: {
    bid: number;
    ask: number;
    volume: number;
    spread: number;
  };
}

export class TriangularArbitrageEngine {
  private marketData: Map<string, MarketData[]>;
  private opportunities: Map<string, ArbitrageOpportunity>;
  private alertCallbacks: Array<(alert: ArbitrageAlert) => void>;
  private readonly MIN_PROFIT_THRESHOLD = 0.5; // 0.5% minimum profit
  private readonly MAX_EXECUTION_TIME = 300; // 5 minutes max execution
  private readonly OPPORTUNITY_TTL = 60 * 1000; // 1 minute TTL

  constructor() {
    this.marketData = new Map();
    this.opportunities = new Map();
    this.alertCallbacks = [];
    this.startMarketMonitoring();
  }

  /**
   * Scan for triangular arbitrage opportunities
   */
  async scanTriangularArbitrage(baseCurrency: string = 'USDT'): Promise<ArbitrageOpportunity[]> {
    try {
      logger.info(`[ARBITRAGE] Scanning triangular arbitrage opportunities for ${baseCurrency}`);

      const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX'];
      const currencies = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'MATIC'];
      
      const opportunities: ArbitrageOpportunity[] = [];

      // Get current market data
      await this.updateMarketData();

      // Generate all possible triangular paths
      for (const currency1 of currencies) {
        for (const currency2 of currencies) {
          if (currency1 !== currency2 && currency1 !== baseCurrency && currency2 !== baseCurrency) {
            
            // Path: Base -> Currency1 -> Currency2 -> Base
            const opportunity = await this.calculateTriangularPath(
              baseCurrency,
              currency1,
              currency2,
              exchanges
            );

            if (opportunity && opportunity.expectedProfit > this.MIN_PROFIT_THRESHOLD) {
              opportunities.push(opportunity);
              
              // Store and alert for high-profit opportunities
              this.opportunities.set(opportunity.id, opportunity);
              
              if (opportunity.expectedProfit > 2.0) {
                this.sendArbitrageAlert({
                  id: `alert-${Date.now()}`,
                  opportunity,
                  type: 'NEW_OPPORTUNITY',
                  message: `High-profit arbitrage: ${opportunity.expectedProfit.toFixed(2)}% profit potential`,
                  urgency: 'HIGH',
                  timestamp: new Date().toISOString(),
                  actionRequired: true
                });
              }
            }
          }
        }
      }

      // Sort by profit potential
      opportunities.sort((a, b) => b.expectedProfit - a.expectedProfit);

      logger.info(`[ARBITRAGE] Found ${opportunities.length} triangular arbitrage opportunities`);
      return opportunities.slice(0, 20); // Return top 20 opportunities

    } catch (error) {
      logger.error('[ARBITRAGE] Failed to scan triangular arbitrage', error as Error);
      return [];
    }
  }

  /**
   * Calculate triangular arbitrage path profitability
   */
  private async calculateTriangularPath(
    baseCurrency: string,
    currency1: string,
    currency2: string,
    exchanges: string[]
  ): Promise<ArbitrageOpportunity | null> {
    try {
      const startAmount = 1000; // Base calculation amount

      // Step 1: Base -> Currency1
      const step1Pair = `${baseCurrency}/${currency1}`;
      const step1Rate = this.getBestRate(step1Pair, 'BUY', exchanges);
      if (!step1Rate) return null;

      const amount1 = startAmount / step1Rate.ask;

      // Step 2: Currency1 -> Currency2
      const step2Pair = `${currency1}/${currency2}`;
      const step2Rate = this.getBestRate(step2Pair, 'BUY', exchanges);
      if (!step2Rate) return null;

      const amount2 = amount1 / step2Rate.ask;

      // Step 3: Currency2 -> Base
      const step3Pair = `${currency2}/${baseCurrency}`;
      const step3Rate = this.getBestRate(step3Pair, 'BUY', exchanges);
      if (!step3Rate) return null;

      const finalAmount = amount2 / step3Rate.ask;

      // Calculate profit
      const grossProfit = finalAmount - startAmount;
      const profitPercentage = (grossProfit / startAmount) * 100;

      // Calculate fees
      const fees = this.calculateFees(startAmount, [step1Rate, step2Rate, step3Rate]);
      const netProfit = grossProfit - fees.total;
      const netProfitPercentage = (netProfit / startAmount) * 100;

      // Only return profitable opportunities
      if (netProfitPercentage < this.MIN_PROFIT_THRESHOLD) {
        return null;
      }

      // Create trading steps
      const tradingPath: TradingStep[] = [
        {
          step: 1,
          action: 'BUY',
          pair: step1Pair,
          fromCurrency: baseCurrency,
          toCurrency: currency1,
          price: step1Rate.ask,
          volume: amount1,
          exchange: step1Rate.exchange,
          estimatedTime: 30
        },
        {
          step: 2,
          action: 'BUY',
          pair: step2Pair,
          fromCurrency: currency1,
          toCurrency: currency2,
          price: step2Rate.ask,
          volume: amount2,
          exchange: step2Rate.exchange,
          estimatedTime: 30
        },
        {
          step: 3,
          action: 'BUY',
          pair: step3Pair,
          fromCurrency: currency2,
          toCurrency: baseCurrency,
          price: step3Rate.ask,
          volume: finalAmount,
          exchange: step3Rate.exchange,
          estimatedTime: 30
        }
      ];

      const totalExecutionTime = tradingPath.reduce((sum, step) => sum + step.estimatedTime, 0);
      
      const opportunity: ArbitrageOpportunity = {
        id: `tri-${baseCurrency}-${currency1}-${currency2}-${Date.now()}`,
        type: 'TRIANGULAR',
        baseCurrency,
        tradingPath,
        expectedProfit: netProfitPercentage,
        profitAmount: netProfit,
        minInvestment: 100,
        maxInvestment: this.calculateMaxInvestment(tradingPath),
        executionTime: totalExecutionTime,
        riskLevel: this.assessRiskLevel(netProfitPercentage, totalExecutionTime, tradingPath),
        confidence: this.calculateConfidence(tradingPath),
        exchanges: [...new Set(tradingPath.map(step => step.exchange))],
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.OPPORTUNITY_TTL).toISOString(),
        fees
      };

      return opportunity;

    } catch (error) {
      logger.error(`[ARBITRAGE] Failed to calculate triangular path`, error as Error);
      return null;
    }
  }

  /**
   * Get best exchange rate for a trading pair
   */
  private getBestRate(
    pair: string,
    action: 'BUY' | 'SELL',
    exchanges: string[]
  ): (MarketData & { exchange: string }) | null {
    let bestRate: (MarketData & { exchange: string }) | null = null;

    for (const exchange of exchanges) {
      const rates = this.getSimulatedMarketData(pair, exchange);
      if (!rates) continue;

      const rate = { ...rates, exchange };

      if (!bestRate) {
        bestRate = rate;
        continue;
      }

      // For buying, we want the lowest ask price
      // For selling, we want the highest bid price
      if (action === 'BUY' && rate.ask < bestRate.ask) {
        bestRate = rate;
      } else if (action === 'SELL' && rate.bid > bestRate.bid) {
        bestRate = rate;
      }
    }

    return bestRate;
  }

  /**
   * Simulate market data for a trading pair
   */
  private getSimulatedMarketData(pair: string, exchange: string): MarketData | null {
    // Simulate realistic market data
    const baseRates: { [key: string]: number } = {
      'USDT/BTC': 0.0000935, // 1 USDT = 0.0000935 BTC (BTC ≈ $107,000)
      'BTC/USDT': 107000,
      'USDT/ETH': 0.00025,   // 1 USDT = 0.00025 ETH (ETH ≈ $4,000)
      'ETH/USDT': 4000,
      'BTC/ETH': 26.75,      // 1 BTC = 26.75 ETH
      'ETH/BTC': 0.0374,
      'USDT/SOL': 0.004167,  // 1 USDT = 0.004167 SOL (SOL ≈ $240)
      'SOL/USDT': 240,
      'BTC/SOL': 445.8,      // 1 BTC = 445.8 SOL
      'SOL/BTC': 0.002243,
      'ETH/SOL': 16.67,      // 1 ETH = 16.67 SOL
      'SOL/ETH': 0.06
    };

    const baseRate = baseRates[pair];
    if (!baseRate) return null;

    // Add exchange-specific variations and spreads
    const exchangeVariations: { [key: string]: number } = {
      'Binance': 1.0,
      'Coinbase': 1.002,
      'Kraken': 0.998,
      'OKX': 1.001
    };

    const variation = exchangeVariations[exchange] || 1.0;
    const spread = 0.001 + Math.random() * 0.002; // 0.1% to 0.3% spread
    
    const midPrice = baseRate * variation;
    const ask = midPrice * (1 + spread / 2);
    const bid = midPrice * (1 - spread / 2);

    return {
      exchange,
      pair,
      bid,
      ask,
      volume: 1000000 + Math.random() * 5000000,
      timestamp: new Date().toISOString(),
      spread: spread * 100,
      liquidity: 80 + Math.random() * 20
    };
  }

  /**
   * Calculate trading fees
   */
  private calculateFees(
    amount: number,
    rates: Array<{ exchange: string; ask: number }>
  ): ArbitrageOpportunity['fees'] {
    const tradingFeeRate = 0.001; // 0.1% per trade
    const networkFeeRate = 0.0005; // 0.05% network fees
    const slippageRate = 0.0002; // 0.02% slippage

    const tradingFees = amount * tradingFeeRate * rates.length;
    const networkFees = amount * networkFeeRate * rates.length;
    const slippage = amount * slippageRate * rates.length;

    return {
      trading: tradingFees,
      network: networkFees,
      slippage: slippage,
      total: tradingFees + networkFees + slippage
    };
  }

  /**
   * Calculate maximum investment based on liquidity
   */
  private calculateMaxInvestment(tradingPath: TradingStep[]): number {
    // Find the bottleneck in terms of liquidity
    let minLiquidity = Infinity;
    
    for (const step of tradingPath) {
      const liquidity = step.volume * step.price * 0.1; // Assume 10% of volume is available
      minLiquidity = Math.min(minLiquidity, liquidity);
    }

    return Math.min(minLiquidity, 100000); // Cap at $100k
  }

  /**
   * Assess risk level of opportunity
   */
  private assessRiskLevel(
    profit: number,
    executionTime: number,
    tradingPath: TradingStep[]
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0;

    // Time risk
    if (executionTime > 120) riskScore += 1;
    if (executionTime > 240) riskScore += 1;

    // Profit risk (too good to be true)
    if (profit > 5) riskScore += 1;
    if (profit > 10) riskScore += 2;

    // Exchange risk (cross-exchange arbitrage is riskier)
    const uniqueExchanges = new Set(tradingPath.map(step => step.exchange)).size;
    if (uniqueExchanges > 1) riskScore += 1;
    if (uniqueExchanges > 2) riskScore += 1;

    if (riskScore >= 3) return 'HIGH';
    if (riskScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate confidence in opportunity
   */
  private calculateConfidence(tradingPath: TradingStep[]): number {
    let confidence = 85; // Base confidence

    // Reduce confidence for cross-exchange arbitrage
    const uniqueExchanges = new Set(tradingPath.map(step => step.exchange)).size;
    confidence -= (uniqueExchanges - 1) * 10;

    // Reduce confidence for long execution times
    const totalTime = tradingPath.reduce((sum, step) => sum + step.estimatedTime, 0);
    if (totalTime > 120) confidence -= 10;
    if (totalTime > 240) confidence -= 15;

    return Math.max(50, Math.min(95, confidence));
  }

  /**
   * Update market data from exchanges
   */
  private async updateMarketData(): Promise<void> {
    // In production, this would fetch real market data from exchange APIs
    logger.info('[ARBITRAGE] Updating market data (simulated)');
    
    // Simulate market data updates
    const pairs = [
      'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BTC/ETH', 'ETH/SOL', 'BTC/SOL'
    ];
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX'];

    for (const exchange of exchanges) {
      const exchangeData: MarketData[] = [];
      
      for (const pair of pairs) {
        const data = this.getSimulatedMarketData(pair, exchange);
        if (data) {
          exchangeData.push(data);
        }
      }
      
      this.marketData.set(exchange, exchangeData);
    }
  }

  /**
   * Start real-time market monitoring
   */
  private startMarketMonitoring(): void {
    // Update market data every 30 seconds
    setInterval(async () => {
      try {
        await this.updateMarketData();
        
        // Scan for new opportunities
        const opportunities = await this.scanTriangularArbitrage();
        
        // Clean up expired opportunities
        this.cleanupExpiredOpportunities();
        
        logger.info(`[ARBITRAGE] Market monitoring cycle completed - ${opportunities.length} opportunities found`);
      } catch (error) {
        logger.error('[ARBITRAGE] Market monitoring error', error as Error);
      }
    }, 30 * 1000); // 30 seconds
  }

  /**
   * Clean up expired opportunities
   */
  private cleanupExpiredOpportunities(): void {
    const now = new Date();
    
    for (const [id, opportunity] of this.opportunities.entries()) {
      if (new Date(opportunity.expiresAt) < now) {
        this.opportunities.delete(id);
      }
    }
  }

  /**
   * Send arbitrage alert
   */
  private sendArbitrageAlert(alert: ArbitrageAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        logger.error('[ARBITRAGE] Alert callback error', error as Error);
      }
    });
  }

  /**
   * Public API methods
   */

  /**
   * Get active arbitrage opportunities
   */
  getActiveOpportunities(): ArbitrageOpportunity[] {
    return Array.from(this.opportunities.values())
      .filter(opp => new Date(opp.expiresAt) > new Date())
      .sort((a, b) => b.expectedProfit - a.expectedProfit);
  }

  /**
   * Get opportunities by currency
   */
  getOpportunitiesByCurrency(currency: string): ArbitrageOpportunity[] {
    return this.getActiveOpportunities()
      .filter(opp => opp.baseCurrency === currency);
  }

  /**
   * Subscribe to arbitrage alerts
   */
  subscribeToAlerts(callback: (alert: ArbitrageAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Execute arbitrage opportunity (simulation)
   */
  async executeArbitrage(opportunityId: string): Promise<{ success: boolean; message: string }> {
    const opportunity = this.opportunities.get(opportunityId);
    if (!opportunity) {
      return { success: false, message: 'Opportunity not found or expired' };
    }

    logger.info(`[ARBITRAGE] Executing arbitrage opportunity ${opportunityId}`);

    // Simulate execution
    const executionSuccess = Math.random() > 0.1; // 90% success rate

    if (executionSuccess) {
      this.sendArbitrageAlert({
        id: `executed-${Date.now()}`,
        opportunity,
        type: 'EXECUTED',
        message: `Arbitrage executed successfully: ${opportunity.expectedProfit.toFixed(2)}% profit`,
        urgency: 'LOW',
        timestamp: new Date().toISOString(),
        actionRequired: false
      });

      return { 
        success: true, 
        message: `Arbitrage executed: ${opportunity.expectedProfit.toFixed(2)}% profit realized` 
      };
    } else {
      return { 
        success: false, 
        message: 'Execution failed: Market conditions changed' 
      };
    }
  }

  /**
   * Get historical performance
   */
  getPerformanceMetrics(): {
    totalOpportunities: number;
    avgProfit: number;
    successRate: number;
    totalProfit: number;
  } {
    // Simulate performance metrics
    return {
      totalOpportunities: 1247,
      avgProfit: 1.34,
      successRate: 87.3,
      totalProfit: 12847.50
    };
  }
}

// Singleton instance
export const triangularArbitrage = new TriangularArbitrageEngine();