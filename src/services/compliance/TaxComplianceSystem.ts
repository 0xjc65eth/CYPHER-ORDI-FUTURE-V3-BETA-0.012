/**
 * Tax Compliance System for CYPHER ORDi Future V3
 * Automated fiscal compliance for cryptocurrency trading across multiple jurisdictions
 */

import { EventEmitter } from 'events';
import { EnhancedLogger } from '@/lib/enhanced-logger';

// Tax System Types
export interface TaxJurisdiction {
  code: string;
  name: string;
  currency: string;
  taxYear: {
    start: string; // MM-DD format
    end: string; // MM-DD format
  };
  rates: {
    shortTermCapitalGains: number; // percentage
    longTermCapitalGains: number; // percentage
    ordinaryIncome: number; // percentage
    corporateRate?: number; // percentage
  };
  rules: {
    longTermHoldingPeriod: number; // days
    lifoFifoMethod: 'FIFO' | 'LIFO' | 'SPECIFIC_ID' | 'AVERAGE_COST';
    allowsLikeKindExchange: boolean;
    requiresReporting: {
      minAmount: number;
      allTransactions: boolean;
    };
    deMinimisThreshold?: number;
  };
  forms: {
    capitalGains: string;
    cryptoSchedule: string;
    foreignAssets?: string;
  };
}

export interface TaxEvent {
  id: string;
  type: 'trade' | 'mining' | 'staking' | 'airdrop' | 'fork' | 'gift' | 'donation' | 'fee';
  subtype?: 'buy' | 'sell' | 'swap' | 'send' | 'receive';
  timestamp: number;
  asset: string;
  amount: number;
  fiatValue: number;
  fiatCurrency: string;
  costBasis?: number;
  proceeds?: number;
  fees: number;
  txHash?: string;
  exchange?: string;
  address?: string;
  description: string;
  tags: string[];
  isWash?: boolean;
  isLikeKind?: boolean;
}

export interface TaxLot {
  id: string;
  asset: string;
  amount: number;
  costBasis: number;
  acquiredDate: number;
  method: 'FIFO' | 'LIFO' | 'SPECIFIC_ID' | 'AVERAGE_COST';
  isShortTerm: boolean;
  isDisposed: boolean;
  disposedDate?: number;
  disposedAmount?: number;
  remainingAmount: number;
}

export interface CapitalGain {
  id: string;
  asset: string;
  buyDate: number;
  sellDate: number;
  buyPrice: number;
  sellPrice: number;
  amount: number;
  costBasis: number;
  proceeds: number;
  gainLoss: number;
  isShortTerm: boolean;
  fees: number;
  washSale: boolean;
  description: string;
}

export interface TaxReport {
  id: string;
  jurisdiction: string;
  taxYear: number;
  userId: string;
  generatedAt: number;
  summary: {
    totalGains: number;
    totalLosses: number;
    netGainLoss: number;
    shortTermGains: number;
    longTermGains: number;
    totalFees: number;
    totalIncome: number;
    taxableEvents: number;
  };
  capitalGains: CapitalGain[];
  incomeEvents: TaxEvent[];
  deductions: {
    fees: number;
    donations: number;
    losses: number;
  };
  carryForwardLosses: number;
  estimatedTax: {
    federal: number;
    state?: number;
    total: number;
  };
  forms: {
    form8949: any;
    scheduleD: any;
    form1040: any;
    custom?: any;
  };
  recommendations: string[];
  warnings: string[];
}

export interface TaxOptimization {
  strategies: {
    name: string;
    description: string;
    potentialSaving: number;
    riskLevel: 'low' | 'medium' | 'high';
    applicability: string;
    deadline?: number;
  }[];
  harvestingOpportunities: {
    asset: string;
    unrealizedLoss: number;
    potentialSaving: number;
    washSaleRisk: boolean;
    recommendedAction: string;
  }[];
  timing: {
    optimalSellDates: {
      asset: string;
      amount: number;
      currentDate: number;
      optimalDate: number;
      reason: string;
      savings: number;
    }[];
  };
}

export class TaxComplianceSystem extends EventEmitter {
  private logger: EnhancedLogger;
  private jurisdictions: Map<string, TaxJurisdiction> = new Map();
  private userEvents: Map<string, TaxEvent[]> = new Map();
  private taxLots: Map<string, TaxLot[]> = new Map();
  private reports: Map<string, TaxReport> = new Map();
  private priceHistory: Map<string, Map<number, number>> = new Map();

  // Supported jurisdictions
  private readonly JURISDICTIONS: TaxJurisdiction[] = [
    {
      code: 'US',
      name: 'United States',
      currency: 'USD',
      taxYear: { start: '01-01', end: '12-31' },
      rates: {
        shortTermCapitalGains: 37, // top marginal rate
        longTermCapitalGains: 20, // top rate
        ordinaryIncome: 37,
        corporateRate: 21
      },
      rules: {
        longTermHoldingPeriod: 365,
        lifoFifoMethod: 'FIFO',
        allowsLikeKindExchange: false, // after 2017
        requiresReporting: {
          minAmount: 0,
          allTransactions: true
        },
        deMinimisThreshold: 200
      },
      forms: {
        capitalGains: 'Form 8949',
        cryptoSchedule: 'Schedule D',
        foreignAssets: 'Form 8938'
      }
    },
    {
      code: 'UK',
      name: 'United Kingdom',
      currency: 'GBP',
      taxYear: { start: '04-06', end: '04-05' },
      rates: {
        shortTermCapitalGains: 20,
        longTermCapitalGains: 20,
        ordinaryIncome: 45
      },
      rules: {
        longTermHoldingPeriod: 0, // no distinction
        lifoFifoMethod: 'FIFO',
        allowsLikeKindExchange: false,
        requiresReporting: {
          minAmount: 12300, // annual allowance
          allTransactions: false
        }
      },
      forms: {
        capitalGains: 'SA108',
        cryptoSchedule: 'SA100'
      }
    },
    {
      code: 'EU',
      name: 'European Union (General)',
      currency: 'EUR',
      taxYear: { start: '01-01', end: '12-31' },
      rates: {
        shortTermCapitalGains: 26, // average
        longTermCapitalGains: 26,
        ordinaryIncome: 42
      },
      rules: {
        longTermHoldingPeriod: 365,
        lifoFifoMethod: 'FIFO',
        allowsLikeKindExchange: false,
        requiresReporting: {
          minAmount: 600,
          allTransactions: true
        }
      },
      forms: {
        capitalGains: 'Various',
        cryptoSchedule: 'Country-specific'
      }
    },
    {
      code: 'BR',
      name: 'Brazil',
      currency: 'BRL',
      taxYear: { start: '01-01', end: '12-31' },
      rates: {
        shortTermCapitalGains: 15, // day trading
        longTermCapitalGains: 15, // swing trading
        ordinaryIncome: 27.5
      },
      rules: {
        longTermHoldingPeriod: 0,
        lifoFifoMethod: 'AVERAGE_COST',
        allowsLikeKindExchange: false,
        requiresReporting: {
          minAmount: 5000, // BRL
          allTransactions: true
        },
        deMinimisThreshold: 35000 // BRL per month
      },
      forms: {
        capitalGains: 'GCAP',
        cryptoSchedule: 'DIRPF'
      }
    }
  ];

  constructor() {
    super();
    this.logger = new EnhancedLogger();
    
    // Initialize jurisdictions
    this.JURISDICTIONS.forEach(jurisdiction => {
      this.jurisdictions.set(jurisdiction.code, jurisdiction);
    });

    this.logger.info('Tax Compliance System initialized', {
      component: 'TaxComplianceSystem',
      jurisdictions: this.JURISDICTIONS.length
    });
  }

  /**
   * Record a tax event
   */
  async recordTaxEvent(userId: string, event: Omit<TaxEvent, 'id'>): Promise<string> {
    const taxEvent: TaxEvent = {
      id: `tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...event
    };

    // Get user events
    if (!this.userEvents.has(userId)) {
      this.userEvents.set(userId, []);
    }
    
    const events = this.userEvents.get(userId)!;
    events.push(taxEvent);
    events.sort((a, b) => a.timestamp - b.timestamp);

    // Update tax lots if it's a buy/sell transaction
    if (event.type === 'trade') {
      await this.updateTaxLots(userId, taxEvent);
    }

    // Check for wash sale rules
    if (event.type === 'trade' && event.subtype === 'sell') {
      await this.checkWashSaleRules(userId, taxEvent);
    }

    this.logger.info('Tax event recorded', {
      userId,
      eventId: taxEvent.id,
      type: event.type,
      asset: event.asset,
      amount: event.amount
    });

    this.emit('taxEventRecorded', { userId, event: taxEvent });
    return taxEvent.id;
  }

  /**
   * Generate comprehensive tax report
   */
  async generateTaxReport(
    userId: string,
    taxYear: number,
    jurisdiction: string = 'US'
  ): Promise<TaxReport> {
    try {
      const jurisdictionData = this.jurisdictions.get(jurisdiction);
      if (!jurisdictionData) {
        throw new Error(`Unsupported jurisdiction: ${jurisdiction}`);
      }

      const events = this.userEvents.get(userId) || [];
      const taxYearEvents = this.filterEventsByTaxYear(events, taxYear, jurisdictionData);

      // Calculate capital gains
      const capitalGains = await this.calculateCapitalGains(userId, taxYearEvents, jurisdictionData);
      
      // Calculate income events
      const incomeEvents = taxYearEvents.filter(e => 
        ['mining', 'staking', 'airdrop', 'fork'].includes(e.type)
      );

      // Calculate summary
      const summary = this.calculateTaxSummary(capitalGains, incomeEvents);

      // Calculate deductions
      const deductions = this.calculateDeductions(taxYearEvents);

      // Estimate tax liability
      const estimatedTax = this.estimateTaxLiability(summary, jurisdictionData);

      // Generate forms
      const forms = await this.generateTaxForms(
        capitalGains,
        incomeEvents,
        summary,
        jurisdictionData
      );

      // Generate recommendations and warnings
      const { recommendations, warnings } = this.generateRecommendations(
        capitalGains,
        summary,
        jurisdictionData
      );

      const report: TaxReport = {
        id: `report_${userId}_${taxYear}_${jurisdiction}`,
        jurisdiction,
        taxYear,
        userId,
        generatedAt: Date.now(),
        summary,
        capitalGains,
        incomeEvents,
        deductions,
        carryForwardLosses: this.calculateCarryForwardLosses(userId, taxYear),
        estimatedTax,
        forms,
        recommendations,
        warnings
      };

      this.reports.set(report.id, report);

      this.logger.info('Tax report generated', {
        reportId: report.id,
        userId,
        taxYear,
        jurisdiction,
        totalGains: summary.totalGains,
        totalLosses: summary.totalLosses
      });

      this.emit('taxReportGenerated', report);
      return report;

    } catch (error) {
      this.logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to generate tax report:');
      throw error;
    }
  }

  /**
   * Get tax optimization strategies
   */
  async getTaxOptimization(
    userId: string,
    jurisdiction: string = 'US'
  ): Promise<TaxOptimization> {
    const jurisdictionData = this.jurisdictions.get(jurisdiction);
    if (!jurisdictionData) {
      throw new Error(`Unsupported jurisdiction: ${jurisdiction}`);
    }

    const events = this.userEvents.get(userId) || [];
    const taxLots = this.taxLots.get(userId) || [];
    const currentYear = new Date().getFullYear();

    // Find tax loss harvesting opportunities
    const harvestingOpportunities = await this.findHarvestingOpportunities(
      userId,
      taxLots,
      jurisdictionData
    );

    // Find optimal timing strategies
    const timing = await this.findOptimalTiming(userId, taxLots, jurisdictionData);

    // General strategies
    const strategies = [
      {
        name: 'Tax Loss Harvesting',
        description: 'Sell assets at a loss to offset gains',
        potentialSaving: harvestingOpportunities.reduce((sum, opp) => sum + opp.potentialSaving, 0),
        riskLevel: 'low' as const,
        applicability: 'Available year-round, but most effective near year-end'
      },
      {
        name: 'Long-term Capital Gains',
        description: 'Hold assets for more than one year for preferential tax rates',
        potentialSaving: this.calculateLongTermSavings(taxLots, jurisdictionData),
        riskLevel: 'low' as const,
        applicability: 'Assets held for more than 365 days'
      },
      {
        name: 'Strategic Rebalancing',
        description: 'Rebalance portfolio in tax-advantaged accounts',
        potentialSaving: 0,
        riskLevel: 'medium' as const,
        applicability: 'If you have retirement accounts'
      }
    ];

    if (jurisdiction === 'BR') {
      strategies.push({
        name: 'Monthly De Minimis',
        description: 'Keep monthly crypto gains under R$ 35,000 for tax exemption',
        potentialSaving: this.calculateDeMinimisOpportunity(events, jurisdictionData),
        riskLevel: 'low' as const,
        applicability: 'Monthly gains management'
      });
    }

    return {
      strategies,
      harvestingOpportunities,
      timing
    };
  }

  /**
   * Import transactions from exchange APIs
   */
  async importTransactions(
    userId: string,
    source: 'binance' | 'coinbase' | 'kraken' | 'hyperliquid' | 'csv',
    data: any
  ): Promise<number> {
    let importedCount = 0;

    try {
      let transactions: any[] = [];

      switch (source) {
        case 'csv':
          transactions = this.parseCsvTransactions(data);
          break;
        case 'binance':
          transactions = await this.fetchBinanceTransactions(data.apiKey, data.apiSecret);
          break;
        case 'coinbase':
          transactions = await this.fetchCoinbaseTransactions(data.apiKey, data.apiSecret);
          break;
        case 'hyperliquid':
          transactions = await this.fetchHyperliquidTransactions(data.address);
          break;
        default:
          throw new Error(`Unsupported source: ${source}`);
      }

      // Convert to tax events
      for (const tx of transactions) {
        const taxEvent = this.convertToTaxEvent(tx, source);
        await this.recordTaxEvent(userId, taxEvent);
        importedCount++;
      }

      this.logger.info('Transactions imported', {
        userId,
        source,
        count: importedCount
      });

    } catch (error) {
      this.logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to import transactions:');
      throw error;
    }

    return importedCount;
  }

  /**
   * Get real-time tax liability
   */
  async getRealTimeTaxLiability(
    userId: string,
    jurisdiction: string = 'US'
  ): Promise<{
    currentYearGains: number;
    estimatedTax: number;
    nextTradeTax: Record<string, number>;
  }> {
    const jurisdictionData = this.jurisdictions.get(jurisdiction);
    if (!jurisdictionData) {
      throw new Error(`Unsupported jurisdiction: ${jurisdiction}`);
    }

    const currentYear = new Date().getFullYear();
    const events = this.userEvents.get(userId) || [];
    const currentYearEvents = this.filterEventsByTaxYear(events, currentYear, jurisdictionData);
    
    const capitalGains = await this.calculateCapitalGains(userId, currentYearEvents, jurisdictionData);
    const currentYearGains = capitalGains.reduce((sum, gain) => sum + gain.gainLoss, 0);
    
    const estimatedTax = this.calculateTaxOnGains(currentYearGains, jurisdictionData);

    // Calculate tax impact of next potential trades
    const taxLots = this.taxLots.get(userId) || [];
    const nextTradeTax: Record<string, number> = {};
    
    for (const lot of taxLots) {
      if (lot.remainingAmount > 0) {
        const currentPrice = await this.getCurrentPrice(lot.asset);
        const potentialGain = (currentPrice - lot.costBasis) * lot.remainingAmount;
        nextTradeTax[lot.asset] = this.calculateTaxOnGains(potentialGain, jurisdictionData);
      }
    }

    return {
      currentYearGains,
      estimatedTax,
      nextTradeTax
    };
  }

  /**
   * Private helper methods
   */

  private async updateTaxLots(userId: string, event: TaxEvent): Promise<void> {
    if (!this.taxLots.has(userId)) {
      this.taxLots.set(userId, []);
    }

    const lots = this.taxLots.get(userId)!;

    if (event.subtype === 'buy') {
      // Create new tax lot
      const newLot: TaxLot = {
        id: `lot_${event.id}`,
        asset: event.asset,
        amount: event.amount,
        costBasis: event.fiatValue / event.amount,
        acquiredDate: event.timestamp,
        method: 'FIFO',
        isShortTerm: true,
        isDisposed: false,
        remainingAmount: event.amount
      };

      lots.push(newLot);
    } else if (event.subtype === 'sell') {
      // Dispose of tax lots using FIFO
      let remainingToSell = event.amount;
      
      for (const lot of lots) {
        if (lot.asset === event.asset && lot.remainingAmount > 0 && remainingToSell > 0) {
          const sellAmount = Math.min(lot.remainingAmount, remainingToSell);
          
          lot.remainingAmount -= sellAmount;
          if (lot.remainingAmount === 0) {
            lot.isDisposed = true;
            lot.disposedDate = event.timestamp;
            lot.disposedAmount = lot.amount;
          }

          remainingToSell -= sellAmount;
        }
      }
    }
  }

  private async checkWashSaleRules(userId: string, sellEvent: TaxEvent): Promise<void> {
    const events = this.userEvents.get(userId) || [];
    const thirtyDaysBefore = sellEvent.timestamp - (30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAfter = sellEvent.timestamp + (30 * 24 * 60 * 60 * 1000);

    // Check for purchases of the same asset within 30 days
    const potentialWashSales = events.filter(e =>
      e.asset === sellEvent.asset &&
      e.type === 'trade' &&
      e.subtype === 'buy' &&
      e.timestamp >= thirtyDaysBefore &&
      e.timestamp <= thirtyDaysAfter &&
      e.id !== sellEvent.id
    );

    if (potentialWashSales.length > 0) {
      sellEvent.isWash = true;
      this.logger.warn('Potential wash sale detected', {
        userId,
        sellEvent: sellEvent.id,
        asset: sellEvent.asset
      });
    }
  }

  private filterEventsByTaxYear(
    events: TaxEvent[],
    taxYear: number,
    jurisdiction: TaxJurisdiction
  ): TaxEvent[] {
    const startDate = new Date(`${taxYear}-${jurisdiction.taxYear.start}`);
    const endDate = new Date(`${taxYear + 1}-${jurisdiction.taxYear.end}`);
    
    if (jurisdiction.taxYear.start.startsWith('04')) {
      // UK tax year adjustment
      startDate.setFullYear(taxYear - 1);
    }

    return events.filter(e =>
      e.timestamp >= startDate.getTime() && e.timestamp <= endDate.getTime()
    );
  }

  private async calculateCapitalGains(
    userId: string,
    events: TaxEvent[],
    jurisdiction: TaxJurisdiction
  ): Promise<CapitalGain[]> {
    const gains: CapitalGain[] = [];
    const lots = this.taxLots.get(userId) || [];

    const sellEvents = events.filter(e => e.type === 'trade' && e.subtype === 'sell');

    for (const sellEvent of sellEvents) {
      const relevantLots = lots.filter(l =>
        l.asset === sellEvent.asset &&
        l.acquiredDate <= sellEvent.timestamp &&
        l.isDisposed
      );

      for (const lot of relevantLots) {
        const holdingPeriod = sellEvent.timestamp - lot.acquiredDate;
        const isShortTerm = holdingPeriod < jurisdiction.rules.longTermHoldingPeriod * 24 * 60 * 60 * 1000;

        const gain: CapitalGain = {
          id: `gain_${sellEvent.id}_${lot.id}`,
          asset: sellEvent.asset,
          buyDate: lot.acquiredDate,
          sellDate: sellEvent.timestamp,
          buyPrice: lot.costBasis,
          sellPrice: sellEvent.fiatValue / sellEvent.amount,
          amount: lot.amount,
          costBasis: lot.costBasis * lot.amount,
          proceeds: (sellEvent.fiatValue / sellEvent.amount) * lot.amount,
          gainLoss: ((sellEvent.fiatValue / sellEvent.amount) - lot.costBasis) * lot.amount,
          isShortTerm,
          fees: sellEvent.fees,
          washSale: sellEvent.isWash || false,
          description: `${sellEvent.asset} ${isShortTerm ? 'short-term' : 'long-term'} capital gain`
        };

        gains.push(gain);
      }
    }

    return gains;
  }

  private calculateTaxSummary(
    capitalGains: CapitalGain[],
    incomeEvents: TaxEvent[]
  ): TaxReport['summary'] {
    const totalGains = capitalGains
      .filter(g => g.gainLoss > 0)
      .reduce((sum, g) => sum + g.gainLoss, 0);

    const totalLosses = Math.abs(capitalGains
      .filter(g => g.gainLoss < 0)
      .reduce((sum, g) => sum + g.gainLoss, 0));

    const shortTermGains = capitalGains
      .filter(g => g.isShortTerm && g.gainLoss > 0)
      .reduce((sum, g) => sum + g.gainLoss, 0);

    const longTermGains = capitalGains
      .filter(g => !g.isShortTerm && g.gainLoss > 0)
      .reduce((sum, g) => sum + g.gainLoss, 0);

    const totalFees = capitalGains.reduce((sum, g) => sum + g.fees, 0);
    const totalIncome = incomeEvents.reduce((sum, e) => sum + e.fiatValue, 0);

    return {
      totalGains,
      totalLosses,
      netGainLoss: totalGains - totalLosses,
      shortTermGains,
      longTermGains,
      totalFees,
      totalIncome,
      taxableEvents: capitalGains.length + incomeEvents.length
    };
  }

  private calculateDeductions(events: TaxEvent[]): TaxReport['deductions'] {
    const fees = events.reduce((sum, e) => sum + e.fees, 0);
    const donations = events
      .filter(e => e.type === 'donation')
      .reduce((sum, e) => sum + e.fiatValue, 0);
    const losses = events
      .filter(e => e.type === 'trade' && e.proceeds && e.proceeds < (e.costBasis || 0))
      .reduce((sum, e) => sum + ((e.costBasis || 0) - (e.proceeds || 0)), 0);

    return { fees, donations, losses };
  }

  private estimateTaxLiability(
    summary: TaxReport['summary'],
    jurisdiction: TaxJurisdiction
  ): TaxReport['estimatedTax'] {
    const shortTermTax = summary.shortTermGains * jurisdiction.rates.shortTermCapitalGains / 100;
    const longTermTax = (summary.totalGains - summary.shortTermGains) * jurisdiction.rates.longTermCapitalGains / 100;
    const incomeTax = summary.totalIncome * jurisdiction.rates.ordinaryIncome / 100;

    const federal = shortTermTax + longTermTax + incomeTax;
    const total = federal; // Simplified - would need state/local rates

    return { federal, total };
  }

  private async generateTaxForms(
    capitalGains: CapitalGain[],
    incomeEvents: TaxEvent[],
    summary: TaxReport['summary'],
    jurisdiction: TaxJurisdiction
  ): Promise<TaxReport['forms']> {
    // Generate Form 8949 (US) or equivalent
    const form8949 = {
      shortTermTransactions: capitalGains.filter(g => g.isShortTerm),
      longTermTransactions: capitalGains.filter(g => !g.isShortTerm),
      totals: {
        shortTermGain: summary.shortTermGains,
        longTermGain: summary.totalGains - summary.shortTermGains
      }
    };

    const scheduleD = {
      shortTermCapitalGainLoss: summary.shortTermGains,
      longTermCapitalGainLoss: summary.totalGains - summary.shortTermGains,
      netCapitalGainLoss: summary.netGainLoss
    };

    return {
      form8949,
      scheduleD,
      form1040: {
        capitalGains: summary.netGainLoss,
        otherIncome: summary.totalIncome
      }
    };
  }

  private generateRecommendations(
    capitalGains: CapitalGain[],
    summary: TaxReport['summary'],
    jurisdiction: TaxJurisdiction
  ): { recommendations: string[]; warnings: string[] } {
    const recommendations: string[] = [];
    const warnings: string[] = [];

    // Tax loss harvesting recommendation
    if (summary.totalLosses > 0) {
      recommendations.push('Consider tax loss harvesting to offset gains');
    }

    // Long-term holding recommendation
    const shortTermRatio = summary.shortTermGains / summary.totalGains;
    if (shortTermRatio > 0.5) {
      recommendations.push('Consider holding assets longer to benefit from long-term capital gains rates');
    }

    // Wash sale warning
    const washSales = capitalGains.filter(g => g.washSale);
    if (washSales.length > 0) {
      warnings.push(`${washSales.length} potential wash sales detected - losses may be disallowed`);
    }

    // High tax liability warning
    if (summary.netGainLoss > 100000) {
      warnings.push('High capital gains may require quarterly estimated tax payments');
    }

    return { recommendations, warnings };
  }

  private calculateCarryForwardLosses(userId: string, taxYear: number): number {
    // Simplified calculation - would need to track across years
    return 0;
  }

  private async findHarvestingOpportunities(
    userId: string,
    taxLots: TaxLot[],
    jurisdiction: TaxJurisdiction
  ): Promise<TaxOptimization['harvestingOpportunities']> {
    const opportunities: TaxOptimization['harvestingOpportunities'] = [];

    for (const lot of taxLots) {
      if (lot.remainingAmount > 0) {
        const currentPrice = await this.getCurrentPrice(lot.asset);
        const unrealizedLoss = (lot.costBasis - currentPrice) * lot.remainingAmount;

        if (unrealizedLoss > 0) {
          const potentialSaving = unrealizedLoss * jurisdiction.rates.shortTermCapitalGains / 100;
          
          opportunities.push({
            asset: lot.asset,
            unrealizedLoss,
            potentialSaving,
            washSaleRisk: false, // Would need to check recent purchases
            recommendedAction: `Sell ${lot.remainingAmount} ${lot.asset} to harvest ${unrealizedLoss.toFixed(2)} loss`
          });
        }
      }
    }

    return opportunities;
  }

  private async findOptimalTiming(
    userId: string,
    taxLots: TaxLot[],
    jurisdiction: TaxJurisdiction
  ): Promise<TaxOptimization['timing']> {
    const optimalSellDates: TaxOptimization['timing']['optimalSellDates'] = [];

    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (const lot of taxLots) {
      if (lot.remainingAmount > 0) {
        const holdingPeriod = now - lot.acquiredDate;
        
        if (holdingPeriod < oneYear) {
          const optimalDate = lot.acquiredDate + oneYear;
          const currentPrice = await this.getCurrentPrice(lot.asset);
          const gain = (currentPrice - lot.costBasis) * lot.remainingAmount;
          
          if (gain > 0) {
            const shortTermTax = gain * jurisdiction.rates.shortTermCapitalGains / 100;
            const longTermTax = gain * jurisdiction.rates.longTermCapitalGains / 100;
            const savings = shortTermTax - longTermTax;

            optimalSellDates.push({
              asset: lot.asset,
              amount: lot.remainingAmount,
              currentDate: now,
              optimalDate,
              reason: 'Wait for long-term capital gains treatment',
              savings
            });
          }
        }
      }
    }

    return { optimalSellDates };
  }

  private calculateLongTermSavings(
    taxLots: TaxLot[],
    jurisdiction: TaxJurisdiction
  ): number {
    // Calculate potential savings from long-term vs short-term rates
    const rateDifference = jurisdiction.rates.shortTermCapitalGains - jurisdiction.rates.longTermCapitalGains;
    
    // Simplified calculation
    return taxLots.length * 1000 * rateDifference / 100;
  }

  private calculateDeMinimisOpportunity(
    events: TaxEvent[],
    jurisdiction: TaxJurisdiction
  ): number {
    if (!jurisdiction.rules.deMinimisThreshold) return 0;

    // For Brazil - calculate potential savings from staying under monthly limit
    const monthlyGains = new Map<string, number>();
    
    events.forEach(event => {
      const month = new Date(event.timestamp).toISOString().substring(0, 7);
      if (event.type === 'trade' && event.subtype === 'sell') {
        const gain = (event.proceeds || 0) - (event.costBasis || 0);
        monthlyGains.set(month, (monthlyGains.get(month) || 0) + gain);
      }
    });

    let potentialSaving = 0;
    monthlyGains.forEach(gain => {
      if (gain > 0 && gain < jurisdiction.rules.deMinimisThreshold!) {
        potentialSaving += gain * jurisdiction.rates.shortTermCapitalGains / 100;
      }
    });

    return potentialSaving;
  }

  private calculateTaxOnGains(gains: number, jurisdiction: TaxJurisdiction): number {
    if (gains <= 0) return 0;
    return gains * jurisdiction.rates.shortTermCapitalGains / 100;
  }

  private async getCurrentPrice(asset: string): Promise<number> {
    // Mock implementation - would fetch from market data service
    const mockPrices: Record<string, number> = {
      'BTC': 45000,
      'ETH': 3000,
      'SOL': 100
    };
    
    return mockPrices[asset] || 1;
  }

  private parseCsvTransactions(csvData: string): any[] {
    // Parse CSV format transactions
    return [];
  }

  private async fetchBinanceTransactions(apiKey: string, apiSecret: string): Promise<any[]> {
    // Fetch from Binance API
    return [];
  }

  private async fetchCoinbaseTransactions(apiKey: string, apiSecret: string): Promise<any[]> {
    // Fetch from Coinbase API
    return [];
  }

  private async fetchHyperliquidTransactions(address: string): Promise<any[]> {
    // Fetch from Hyperliquid API
    return [];
  }

  private convertToTaxEvent(transaction: any, source: string): Omit<TaxEvent, 'id'> {
    // Convert exchange-specific transaction to TaxEvent format
    return {
      type: 'trade',
      subtype: transaction.side === 'buy' ? 'buy' : 'sell',
      timestamp: transaction.timestamp,
      asset: transaction.asset,
      amount: transaction.amount,
      fiatValue: transaction.fiatValue,
      fiatCurrency: transaction.fiatCurrency || 'USD',
      fees: transaction.fees || 0,
      txHash: transaction.txHash,
      exchange: source,
      description: `${transaction.side} ${transaction.amount} ${transaction.asset} on ${source}`,
      tags: [source, transaction.side]
    };
  }
}

// Singleton instance
export const taxComplianceSystem = new TaxComplianceSystem();

// Export helper functions
export const TaxUtils = {
  /**
   * Calculate holding period
   */
  calculateHoldingPeriod(buyDate: number, sellDate: number): number {
    return Math.floor((sellDate - buyDate) / (24 * 60 * 60 * 1000));
  },

  /**
   * Format tax amount
   */
  formatTaxAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  /**
   * Calculate effective tax rate
   */
  calculateEffectiveRate(tax: number, income: number): number {
    if (income === 0) return 0;
    return (tax / income) * 100;
  },

  /**
   * Check if transaction qualifies for like-kind exchange
   */
  isLikeKindExchange(fromAsset: string, toAsset: string, date: number): boolean {
    // US: No like-kind exchanges for crypto after 2017
    const jan2018 = new Date('2018-01-01').getTime();
    return date < jan2018 && fromAsset !== toAsset;
  }
};