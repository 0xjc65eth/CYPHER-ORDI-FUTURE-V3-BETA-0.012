export interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  conditionalValueAtRisk: number;
  betaToMarket: number;
  correlationToMarket: number;
  diversificationRatio: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export interface PositionRisk {
  symbol: string;
  allocation: number;
  concentrationRisk: number;
  liquidityRisk: number;
  correlationRisk: number;
  individualVaR: number;
  contributionToPortfolioRisk: number;
}

export interface RiskAlert {
  id: string;
  type: 'CONCENTRATION' | 'VOLATILITY' | 'DRAWDOWN' | 'CORRELATION' | 'LIQUIDITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  recommendation: string;
  timestamp: Date;
  resolved: boolean;
}

export class AdvancedRiskManagement {
  private riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' = 'MODERATE';
  private maxPositionSize: number = 0.2; // 20% max allocation per asset
  private maxDrawdownThreshold: number = 0.15; // 15% max portfolio drawdown
  private volatilityThreshold: number = 0.3; // 30% annualized volatility
  private correlationThreshold: number = 0.7; // 70% correlation warning

  constructor(riskTolerance?: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE') {
    if (riskTolerance) {
      this.riskTolerance = riskTolerance;
      this.setRiskParameters();
    }
  }

  private setRiskParameters(): void {
    switch (this.riskTolerance) {
      case 'CONSERVATIVE':
        this.maxPositionSize = 0.15;
        this.maxDrawdownThreshold = 0.1;
        this.volatilityThreshold = 0.2;
        this.correlationThreshold = 0.6;
        break;
      case 'AGGRESSIVE':
        this.maxPositionSize = 0.3;
        this.maxDrawdownThreshold = 0.25;
        this.volatilityThreshold = 0.5;
        this.correlationThreshold = 0.8;
        break;
      default: // MODERATE
        break;
    }
  }

  public calculatePortfolioRisk(
    positions: Array<{ symbol: string; allocation: number; returns: number[]; price: number; volume: number }>,
    marketReturns: number[]
  ): RiskMetrics {
    const portfolioReturns = this.calculatePortfolioReturns(positions);
    
    const volatility = this.calculateVolatility(portfolioReturns);
    const sharpeRatio = this.calculateSharpeRatio(portfolioReturns);
    const maxDrawdown = this.calculateMaxDrawdown(portfolioReturns);
    const valueAtRisk = this.calculateVaR(portfolioReturns, 0.05); // 95% confidence
    const conditionalValueAtRisk = this.calculateCVaR(portfolioReturns, 0.05);
    const betaToMarket = this.calculateBeta(portfolioReturns, marketReturns);
    const correlationToMarket = this.calculateCorrelation(portfolioReturns, marketReturns);
    const diversificationRatio = this.calculateDiversificationRatio(positions);
    
    const riskScore = this.calculateOverallRiskScore({
      volatility,
      maxDrawdown,
      valueAtRisk,
      diversificationRatio,
      betaToMarket
    });

    const riskLevel = this.determineRiskLevel(riskScore);

    return {
      volatility,
      sharpeRatio,
      maxDrawdown,
      valueAtRisk,
      conditionalValueAtRisk,
      betaToMarket,
      correlationToMarket,
      diversificationRatio,
      riskScore,
      riskLevel
    };
  }

  private calculatePortfolioReturns(
    positions: Array<{ symbol: string; allocation: number; returns: number[] }>
  ): number[] {
    if (positions.length === 0) return [];
    
    const maxLength = Math.max(...positions.map(p => p.returns.length));
    const portfolioReturns: number[] = [];

    for (let i = 0; i < maxLength; i++) {
      let weightedReturn = 0;
      let totalWeight = 0;

      positions.forEach(position => {
        if (i < position.returns.length) {
          weightedReturn += position.returns[i] * position.allocation;
          totalWeight += position.allocation;
        }
      });

      if (totalWeight > 0) {
        portfolioReturns.push(weightedReturn / totalWeight);
      }
    }

    return portfolioReturns;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    
    // Annualized volatility (assuming daily returns)
    return Math.sqrt(variance * 252);
  }

  private calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    if (returns.length === 0) return 0;

    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const annualizedReturn = meanReturn * 252; // Daily to annual
    const volatility = this.calculateVolatility(returns);

    if (volatility === 0) return 0;
    return (annualizedReturn - riskFreeRate) / volatility;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    if (returns.length === 0) return 0;

    let peak = 1;
    let maxDrawdown = 0;
    let currentValue = 1;

    returns.forEach(ret => {
      currentValue *= (1 + ret);
      if (currentValue > peak) {
        peak = currentValue;
      }
      const drawdown = (peak - currentValue) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown;
  }

  private calculateVaR(returns: number[], confidence: number): number {
    if (returns.length === 0) return 0;

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return Math.abs(sortedReturns[index] || 0);
  }

  private calculateCVaR(returns: number[], confidence: number): number {
    if (returns.length === 0) return 0;

    const sortedReturns = [...returns].sort((a, b) => a - b);
    const cutoff = Math.floor((1 - confidence) * sortedReturns.length);
    const tailReturns = sortedReturns.slice(0, cutoff);
    
    if (tailReturns.length === 0) return 0;
    return Math.abs(tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length);
  }

  private calculateBeta(portfolioReturns: number[], marketReturns: number[]): number {
    if (portfolioReturns.length === 0 || marketReturns.length === 0) return 1;

    const minLength = Math.min(portfolioReturns.length, marketReturns.length);
    const portReturns = portfolioReturns.slice(0, minLength);
    const mktReturns = marketReturns.slice(0, minLength);

    const marketMean = mktReturns.reduce((sum, r) => sum + r, 0) / mktReturns.length;
    const portfolioMean = portReturns.reduce((sum, r) => sum + r, 0) / portReturns.length;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < minLength; i++) {
      covariance += (portReturns[i] - portfolioMean) * (mktReturns[i] - marketMean);
      marketVariance += Math.pow(mktReturns[i] - marketMean, 2);
    }

    if (marketVariance === 0) return 1;
    return covariance / marketVariance;
  }

  private calculateCorrelation(returns1: number[], returns2: number[]): number {
    if (returns1.length === 0 || returns2.length === 0) return 0;

    const minLength = Math.min(returns1.length, returns2.length);
    const r1 = returns1.slice(0, minLength);
    const r2 = returns2.slice(0, minLength);

    const mean1 = r1.reduce((sum, r) => sum + r, 0) / r1.length;
    const mean2 = r2.reduce((sum, r) => sum + r, 0) / r2.length;

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < minLength; i++) {
      const diff1 = r1[i] - mean1;
      const diff2 = r2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  private calculateDiversificationRatio(
    positions: Array<{ symbol: string; allocation: number; returns: number[] }>
  ): number {
    if (positions.length <= 1) return 0;

    const weights = positions.map(p => p.allocation);
    const volatilities = positions.map(p => this.calculateVolatility(p.returns));
    
    // Weighted average of individual volatilities
    const weightedAvgVol = weights.reduce((sum, w, i) => sum + w * volatilities[i], 0);
    
    // Portfolio volatility (simplified - assumes zero correlation for demo)
    const portfolioVol = Math.sqrt(
      weights.reduce((sum, w, i) => sum + Math.pow(w * volatilities[i], 2), 0)
    );

    if (portfolioVol === 0) return 0;
    return weightedAvgVol / portfolioVol;
  }

  private calculateOverallRiskScore(metrics: {
    volatility: number;
    maxDrawdown: number;
    valueAtRisk: number;
    diversificationRatio: number;
    betaToMarket: number;
  }): number {
    // Normalize metrics to 0-100 scale and weight them
    const volScore = Math.min(metrics.volatility * 100, 100) * 0.25;
    const drawdownScore = Math.min(metrics.maxDrawdown * 100, 100) * 0.25;
    const varScore = Math.min(metrics.valueAtRisk * 100, 100) * 0.2;
    const diversificationScore = (1 - Math.min(metrics.diversificationRatio, 1)) * 100 * 0.15;
    const betaScore = Math.min(Math.abs(metrics.betaToMarket) * 50, 100) * 0.15;

    return volScore + drawdownScore + varScore + diversificationScore + betaScore;
  }

  private determineRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    if (riskScore < 25) return 'LOW';
    if (riskScore < 50) return 'MEDIUM';
    if (riskScore < 75) return 'HIGH';
    return 'EXTREME';
  }

  public generateRiskAlerts(
    positions: Array<{ symbol: string; allocation: number; returns: number[]; volume: number }>,
    riskMetrics: RiskMetrics
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];

    // Concentration risk alerts
    positions.forEach(position => {
      if (position.allocation > this.maxPositionSize) {
        alerts.push({
          id: `concentration-${position.symbol}-${Date.now()}`,
          type: 'CONCENTRATION',
          severity: position.allocation > this.maxPositionSize * 1.5 ? 'HIGH' : 'MEDIUM',
          message: `High concentration in ${position.symbol}: ${(position.allocation * 100).toFixed(1)}%`,
          recommendation: `Consider reducing ${position.symbol} position to below ${(this.maxPositionSize * 100).toFixed(0)}%`,
          timestamp: new Date(),
          resolved: false
        });
      }
    });

    // Volatility alerts
    if (riskMetrics.volatility > this.volatilityThreshold) {
      alerts.push({
        id: `volatility-${Date.now()}`,
        type: 'VOLATILITY',
        severity: riskMetrics.volatility > this.volatilityThreshold * 1.5 ? 'HIGH' : 'MEDIUM',
        message: `High portfolio volatility: ${(riskMetrics.volatility * 100).toFixed(1)}%`,
        recommendation: 'Consider adding more stable assets or reducing position sizes',
        timestamp: new Date(),
        resolved: false
      });
    }

    // Drawdown alerts
    if (riskMetrics.maxDrawdown > this.maxDrawdownThreshold) {
      alerts.push({
        id: `drawdown-${Date.now()}`,
        type: 'DRAWDOWN',
        severity: riskMetrics.maxDrawdown > this.maxDrawdownThreshold * 1.5 ? 'CRITICAL' : 'HIGH',
        message: `High maximum drawdown: ${(riskMetrics.maxDrawdown * 100).toFixed(1)}%`,
        recommendation: 'Implement stop-loss strategies and review risk management',
        timestamp: new Date(),
        resolved: false
      });
    }

    return alerts;
  }

  public calculateOptimalPositionSize(
    symbol: string,
    expectedReturn: number,
    volatility: number,
    portfolioValue: number,
    riskBudget: number = 0.02 // 2% risk budget
  ): number {
    // Kelly Criterion with safety factor
    const riskFreeRate = 0.02; // 2% risk-free rate
    const excessReturn = expectedReturn - riskFreeRate;
    
    if (volatility === 0 || excessReturn <= 0) return 0;
    
    const kellyFraction = excessReturn / (volatility * volatility);
    
    // Apply safety factor (25% of Kelly)
    const safetyFactor = 0.25;
    const adjustedFraction = kellyFraction * safetyFactor;
    
    // Respect maximum position size
    const maxFraction = this.maxPositionSize;
    
    return Math.min(adjustedFraction, maxFraction);
  }

  public setRiskTolerance(tolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'): void {
    this.riskTolerance = tolerance;
    this.setRiskParameters();
  }

  public getRiskTolerance(): string {
    return this.riskTolerance;
  }
}