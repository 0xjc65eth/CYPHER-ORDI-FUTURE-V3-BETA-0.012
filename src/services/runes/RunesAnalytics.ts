/**
 * Runes Analytics Engine
 * Advanced market analysis, yield optimization, and portfolio insights
 */

import { RunesDEX, RuneToken, LiquidityPool, LiquidityPosition } from './RunesDEX';
import { EnhancedLogger } from '@/lib/enhanced-logger';

export interface RunesMarketMetrics {
  totalMarketCap: number;
  totalVolume24h: number;
  totalValueLocked: number;
  avgApyAcrossPools: number;
  topPerformingTokens: Array<{
    token: RuneToken;
    priceChange24h: number;
    volume24h: number;
    marketCap: number;
  }>;
  liquidityDistribution: Record<string, number>;
  marketSentiment: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  volatilityIndex: number;
}

export interface YieldOptimization {
  recommendations: Array<{
    poolId: string;
    tokenPair: string;
    currentApr: number;
    estimatedApr: number;
    riskScore: number;
    liquidityRequired: bigint;
    impermanentLossRisk: number;
    timeToBreakeven: number; // in days
    reasoning: string[];
    confidence: number;
  }>;
  portfolioOptimization: {
    currentYield: number;
    optimizedYield: number;
    rebalanceActions: Array<{
      action: 'add' | 'remove' | 'rebalance';
      poolId: string;
      amount: bigint;
      expectedImpact: number;
    }>;
    riskAdjustedReturn: number;
  };
}

export interface TokenAnalysis {
  tokenId: string;
  symbol: string;
  marketMetrics: {
    price: number;
    priceChange24h: number;
    priceChange7d: number;
    volume24h: number;
    marketCap: number;
    fullyDilutedMarketCap: number;
    circulatingSupply: bigint;
    totalSupply: bigint;
    holders: number;
  };
  technicalIndicators: {
    rsi: number;
    macd: { macd: number; signal: number; histogram: number };
    bollingerBands: { upper: number; middle: number; lower: number };
    support: number[];
    resistance: number[];
    trend: 'bullish' | 'bearish' | 'sideways';
  };
  fundamentalMetrics: {
    utilityScore: number;
    adoptionScore: number;
    liquidityScore: number;
    developmentActivity: number;
    socialSentiment: number;
    overallScore: number;
  };
  liquidityAnalysis: {
    totalPools: number;
    totalLiquidity: number;
    averageSlippage: number;
    priceImpactFor1BTC: number;
    priceImpactFor5BTC: number;
    liquidityDistribution: Array<{
      poolId: string;
      percentage: number;
      depth: number;
    }>;
  };
  priceTargets: {
    support: number[];
    resistance: number[];
    target1: number;
    target2: number;
    stopLoss: number;
  };
}

export interface ImpermanentLossAnalysis {
  currentIL: number;
  projectedIL: Record<string, number>; // price change % -> IL %
  hedgingStrategies: Array<{
    strategy: string;
    cost: number;
    effectiveness: number;
    implementation: string;
  }>;
  breakEvenTime: number;
  totalFeesEarned: bigint;
  netPositionValue: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalStaked: number;
  totalRewards: number;
  averageApr: number;
  impermanentLoss: number;
  netPnL: number;
  diversificationScore: number;
  riskScore: number;
  positions: Array<{
    poolId: string;
    tokenPair: string;
    value: number;
    apr: number;
    il: number;
    rewards: number;
    healthScore: number;
  }>;
}

export class RunesAnalytics {
  private runesDEX: RunesDEX;
  private logger: EnhancedLogger;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_TTL = 300000; // 5 minutes

  constructor(runesDEX: RunesDEX) {
    this.runesDEX = runesDEX;
    this.logger = new EnhancedLogger();
  }

  /**
   * Get comprehensive market metrics
   */
  async getMarketMetrics(): Promise<RunesMarketMetrics> {
    const cacheKey = 'market-metrics';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [pools, analytics] = await Promise.all([
        this.runesDEX.getPools(),
        this.runesDEX.getMarketAnalytics('1d')
      ]);

      // Calculate metrics
      const totalValueLocked = pools.reduce((sum, pool) => 
        sum + (pool.reserveA * BigInt(Math.floor(pool.price * 1e8)) + pool.reserveB * BigInt(1e8)) / BigInt(1e8), BigInt(0)
      );

      const avgApy = pools.reduce((sum, pool) => sum + pool.apr, 0) / pools.length;

      // Analyze token performance
      const tokenPerformance = new Map<string, any>();
      pools.forEach(pool => {
        if (!tokenPerformance.has(pool.tokenA.symbol)) {
          tokenPerformance.set(pool.tokenA.symbol, {
            token: pool.tokenA,
            volume24h: 0,
            liquidityCount: 0
          });
        }
        if (!tokenPerformance.has(pool.tokenB.symbol)) {
          tokenPerformance.set(pool.tokenB.symbol, {
            token: pool.tokenB,
            volume24h: 0,
            liquidityCount: 0
          });
        }

        const tokenAData = tokenPerformance.get(pool.tokenA.symbol);
        const tokenBData = tokenPerformance.get(pool.tokenB.symbol);
        
        tokenAData.volume24h += pool.volume24h / 2;
        tokenBData.volume24h += pool.volume24h / 2;
        tokenAData.liquidityCount++;
        tokenBData.liquidityCount++;
      });

      const topPerformingTokens = Array.from(tokenPerformance.values())
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 10)
        .map(data => ({
          token: data.token,
          priceChange24h: Math.random() * 20 - 10, // Mock data - would get from price feed
          volume24h: data.volume24h,
          marketCap: Number(data.token.circulatingSupply) * 0.001 // Mock calculation
        }));

      // Calculate liquidity distribution
      const liquidityDistribution: Record<string, number> = {};
      pools.forEach(pool => {
        const pairKey = `${pool.tokenA.symbol}/${pool.tokenB.symbol}`;
        liquidityDistribution[pairKey] = Number(pool.reserveA + pool.reserveB);
      });

      // Calculate market sentiment
      const priceChanges = topPerformingTokens.map(t => t.priceChange24h);
      const avgPriceChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
      const marketSentiment = this.calculateMarketSentiment(avgPriceChange, analytics.totalVolume24h);

      // Calculate volatility index
      const volatilityIndex = this.calculateVolatilityIndex(priceChanges);

      const metrics: RunesMarketMetrics = {
        totalMarketCap: topPerformingTokens.reduce((sum, token) => sum + token.marketCap, 0),
        totalVolume24h: analytics.totalVolume24h,
        totalValueLocked: Number(totalValueLocked),
        avgApyAcrossPools: avgApy,
        topPerformingTokens,
        liquidityDistribution,
        marketSentiment,
        volatilityIndex
      };

      this.setCache(cacheKey, metrics, 300000); // 5 minute cache
      return metrics;

    } catch (error) {
      this.logger.error('Failed to get market metrics:', error);
      throw error;
    }
  }

  /**
   * Analyze individual token
   */
  async analyzeToken(tokenId: string): Promise<TokenAnalysis> {
    const cacheKey = `token-analysis-${tokenId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Get token pools and price history
      const [pools, priceHistory] = await Promise.all([
        this.runesDEX.getPools({ tokenA: tokenId }),
        this.runesDEX.getHistoricalPrices(tokenId, 'BTC', '1h', 168) // 7 days of hourly data
      ]);

      const token = pools[0]?.tokenA || pools[0]?.tokenB;
      if (!token) {
        throw new Error('Token not found');
      }

      // Calculate price metrics
      const currentPrice = priceHistory[priceHistory.length - 1]?.close || 0;
      const price24hAgo = priceHistory[priceHistory.length - 24]?.close || currentPrice;
      const price7dAgo = priceHistory[0]?.close || currentPrice;

      const priceChange24h = ((currentPrice - price24hAgo) / price24hAgo) * 100;
      const priceChange7d = ((currentPrice - price7dAgo) / price7dAgo) * 100;

      // Calculate technical indicators
      const technicalIndicators = this.calculateTechnicalIndicators(priceHistory);

      // Analyze fundamentals
      const fundamentalMetrics = await this.analyzeFundamentals(token, pools);

      // Analyze liquidity
      const liquidityAnalysis = this.analyzeLiquidity(token, pools);

      // Calculate price targets
      const priceTargets = this.calculatePriceTargets(priceHistory, technicalIndicators);

      const analysis: TokenAnalysis = {
        tokenId: token.id,
        symbol: token.symbol,
        marketMetrics: {
          price: currentPrice,
          priceChange24h,
          priceChange7d,
          volume24h: pools.reduce((sum, pool) => sum + pool.volume24h, 0),
          marketCap: Number(token.circulatingSupply) * currentPrice,
          fullyDilutedMarketCap: Number(token.totalSupply) * currentPrice,
          circulatingSupply: token.circulatingSupply,
          totalSupply: token.totalSupply,
          holders: 0 // Would get from API
        },
        technicalIndicators,
        fundamentalMetrics,
        liquidityAnalysis,
        priceTargets
      };

      this.setCache(cacheKey, analysis, 600000); // 10 minute cache
      return analysis;

    } catch (error) {
      this.logger.error('Failed to analyze token:', error);
      throw error;
    }
  }

  /**
   * Optimize yield for user portfolio
   */
  async optimizeYield(
    userPositions: LiquidityPosition[],
    riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
  ): Promise<YieldOptimization> {
    try {
      const [allPools, userPools] = await Promise.all([
        this.runesDEX.getPools(),
        Promise.all(userPositions.map(pos => this.runesDEX.getPools().then(pools => 
          pools.find(pool => pool.id === pos.poolId)
        )))
      ]);

      const recommendations: YieldOptimization['recommendations'] = [];

      // Analyze all available pools for opportunities
      for (const pool of allPools) {
        if (!userPools.some(userPool => userPool?.id === pool.id)) {
          const analysis = await this.analyzePoolOpportunity(pool, riskTolerance);
          if (analysis.score > 70) { // High opportunity score
            recommendations.push({
              poolId: pool.id,
              tokenPair: `${pool.tokenA.symbol}/${pool.tokenB.symbol}`,
              currentApr: 0,
              estimatedApr: pool.apr,
              riskScore: analysis.riskScore,
              liquidityRequired: BigInt(Math.floor(analysis.recommendedAmount * 1e8)),
              impermanentLossRisk: analysis.ilRisk,
              timeToBreakeven: analysis.breakEvenDays,
              reasoning: analysis.reasoning,
              confidence: analysis.score
            });
          }
        }
      }

      // Calculate current portfolio metrics
      const currentYield = userPositions.reduce((sum, pos) => sum + pos.apr * pos.shareOfPool, 0);

      // Generate portfolio optimization
      const portfolioOptimization = await this.generatePortfolioOptimization(
        userPositions,
        recommendations,
        riskTolerance
      );

      return {
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        portfolioOptimization: {
          currentYield,
          optimizedYield: portfolioOptimization.optimizedYield,
          rebalanceActions: portfolioOptimization.rebalanceActions,
          riskAdjustedReturn: portfolioOptimization.riskAdjustedReturn
        }
      };

    } catch (error) {
      this.logger.error('Failed to optimize yield:', error);
      throw error;
    }
  }

  /**
   * Analyze impermanent loss for position
   */
  async analyzeImpermanentLoss(
    position: LiquidityPosition,
    priceScenarios: number[] = [-50, -25, -10, 0, 10, 25, 50, 100]
  ): Promise<ImpermanentLossAnalysis> {
    try {
      const pool = (await this.runesDEX.getPools()).find(p => p.id === position.poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }

      // Calculate current IL
      const entryPrice = position.totalValue / (Number(position.tokenAAmount + position.tokenBAmount) / 1e8);
      const currentPrice = pool.price;
      const currentIL = this.calculateImpermanentLoss(entryPrice, currentPrice);

      // Project IL for different scenarios
      const projectedIL: Record<string, number> = {};
      priceScenarios.forEach(scenario => {
        const scenarioPrice = currentPrice * (1 + scenario / 100);
        projectedIL[scenario.toString()] = this.calculateImpermanentLoss(entryPrice, scenarioPrice);
      });

      // Generate hedging strategies
      const hedgingStrategies = [
        {
          strategy: 'Options Hedge',
          cost: position.totalValue * 0.02, // 2% cost
          effectiveness: 80,
          implementation: 'Buy put options on both tokens to hedge downside price movements'
        },
        {
          strategy: 'Rebalancing',
          cost: position.totalValue * 0.005, // 0.5% cost
          effectiveness: 60,
          implementation: 'Periodically rebalance position to maintain target allocation'
        },
        {
          strategy: 'Range Strategy',
          cost: position.totalValue * 0.01, // 1% cost
          effectiveness: 70,
          implementation: 'Use concentrated liquidity in tight price ranges'
        }
      ];

      // Calculate break-even time based on fees earned
      const dailyFees = Number(position.uncollectedFeesA + position.uncollectedFeesB) / 
        ((Date.now() - position.createdAt) / (24 * 60 * 60 * 1000));
      const breakEvenTime = Math.abs(currentIL * position.totalValue) / dailyFees;

      return {
        currentIL,
        projectedIL,
        hedgingStrategies,
        breakEvenTime,
        totalFeesEarned: position.uncollectedFeesA + position.uncollectedFeesB,
        netPositionValue: position.totalValue * (1 + currentIL)
      };

    } catch (error) {
      this.logger.error('Failed to analyze impermanent loss:', error);
      throw error;
    }
  }

  /**
   * Get portfolio metrics and health score
   */
  async getPortfolioMetrics(userPositions: LiquidityPosition[]): Promise<PortfolioMetrics> {
    try {
      const totalValue = userPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
      const totalStaked = userPositions.reduce((sum, pos) => 
        sum + Number(pos.tokenAAmount + pos.tokenBAmount) / 1e8, 0
      );
      const totalRewards = userPositions.reduce((sum, pos) => 
        sum + Number(pos.uncollectedFeesA + pos.uncollectedFeesB) / 1e8, 0
      );

      const averageApr = userPositions.reduce((sum, pos) => 
        sum + pos.apr * (pos.totalValue / totalValue), 0
      );

      const totalImpermanentLoss = userPositions.reduce((sum, pos) => 
        sum + pos.impermanentLoss * pos.totalValue, 0
      );

      const netPnL = totalValue - totalStaked + totalRewards + totalImpermanentLoss;

      // Calculate diversification score
      const diversificationScore = this.calculateDiversificationScore(userPositions);

      // Calculate risk score
      const riskScore = this.calculatePortfolioRiskScore(userPositions);

      // Analyze individual positions
      const positions = userPositions.map(pos => ({
        poolId: pos.poolId,
        tokenPair: `${pos.id.split('-')[0]}/${pos.id.split('-')[1]}`, // Simplified
        value: pos.totalValue,
        apr: pos.apr,
        il: pos.impermanentLoss,
        rewards: Number(pos.uncollectedFeesA + pos.uncollectedFeesB) / 1e8,
        healthScore: this.calculatePositionHealthScore(pos)
      }));

      return {
        totalValue,
        totalStaked,
        totalRewards,
        averageApr,
        impermanentLoss: totalImpermanentLoss,
        netPnL,
        diversificationScore,
        riskScore,
        positions
      };

    } catch (error) {
      this.logger.error('Failed to calculate portfolio metrics:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private calculateMarketSentiment(avgPriceChange: number, volume: number): RunesMarketMetrics['marketSentiment'] {
    const sentimentScore = avgPriceChange + (volume > 1000000 ? 10 : volume > 100000 ? 5 : 0);
    
    if (sentimentScore > 15) return 'very_bullish';
    if (sentimentScore > 5) return 'bullish';
    if (sentimentScore > -5) return 'neutral';
    if (sentimentScore > -15) return 'bearish';
    return 'very_bearish';
  }

  private calculateVolatilityIndex(priceChanges: number[]): number {
    const mean = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    const variance = priceChanges.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) / priceChanges.length;
    return Math.sqrt(variance);
  }

  private calculateTechnicalIndicators(priceHistory: any[]): TokenAnalysis['technicalIndicators'] {
    const prices = priceHistory.map(p => p.close);
    
    // RSI calculation (simplified)
    const rsi = this.calculateRSI(prices);
    
    // MACD calculation (simplified)
    const macd = this.calculateMACD(prices);
    
    // Bollinger Bands
    const bollingerBands = this.calculateBollingerBands(prices);
    
    // Support and resistance
    const { support, resistance } = this.findSupportResistance(priceHistory);
    
    // Trend analysis
    const trend = this.analyzeTrend(prices);

    return {
      rsi,
      macd,
      bollingerBands,
      support,
      resistance,
      trend
    };
  }

  private async analyzeFundamentals(token: RuneToken, pools: LiquidityPool[]): Promise<TokenAnalysis['fundamentalMetrics']> {
    // Simplified fundamental analysis
    const utilityScore = pools.length * 20; // More pools = more utility
    const adoptionScore = Number(token.circulatingSupply) / Number(token.totalSupply) * 100;
    const liquidityScore = pools.reduce((sum, pool) => sum + pool.volume24h, 0) / 10000;
    const developmentActivity = token.turbo ? 80 : 60; // Turbo runes have higher dev activity
    const socialSentiment = 70; // Mock score
    
    const overallScore = (utilityScore + adoptionScore + liquidityScore + developmentActivity + socialSentiment) / 5;

    return {
      utilityScore: Math.min(utilityScore, 100),
      adoptionScore: Math.min(adoptionScore, 100),
      liquidityScore: Math.min(liquidityScore, 100),
      developmentActivity,
      socialSentiment,
      overallScore: Math.min(overallScore, 100)
    };
  }

  private analyzeLiquidity(token: RuneToken, pools: LiquidityPool[]): TokenAnalysis['liquidityAnalysis'] {
    const totalLiquidity = pools.reduce((sum, pool) => 
      sum + Number(pool.reserveA + pool.reserveB) / 1e8, 0
    );

    const liquidityDistribution = pools.map(pool => ({
      poolId: pool.id,
      percentage: (Number(pool.reserveA + pool.reserveB) / 1e8) / totalLiquidity * 100,
      depth: Number(pool.reserveA + pool.reserveB) / 1e8
    }));

    return {
      totalPools: pools.length,
      totalLiquidity,
      averageSlippage: pools.reduce((sum, pool) => sum + pool.priceImpact, 0) / pools.length,
      priceImpactFor1BTC: 0.5, // Mock calculation
      priceImpactFor5BTC: 2.0, // Mock calculation
      liquidityDistribution
    };
  }

  private calculatePriceTargets(priceHistory: any[], technicalIndicators: any): TokenAnalysis['priceTargets'] {
    const currentPrice = priceHistory[priceHistory.length - 1].close;
    
    return {
      support: technicalIndicators.support,
      resistance: technicalIndicators.resistance,
      target1: currentPrice * 1.15, // 15% upside
      target2: currentPrice * 1.30, // 30% upside
      stopLoss: currentPrice * 0.90  // 10% downside
    };
  }

  private async analyzePoolOpportunity(pool: LiquidityPool, riskTolerance: string): Promise<{
    score: number;
    riskScore: number;
    recommendedAmount: number;
    ilRisk: number;
    breakEvenDays: number;
    reasoning: string[];
  }> {
    const riskMultiplier = { conservative: 0.5, moderate: 1.0, aggressive: 1.5 }[riskTolerance];
    
    let score = 0;
    const reasoning: string[] = [];

    // APR scoring
    if (pool.apr > 50) {
      score += 30;
      reasoning.push('High APR above 50%');
    } else if (pool.apr > 20) {
      score += 20;
      reasoning.push('Moderate APR above 20%');
    }

    // Volume scoring
    if (pool.volume24h > 100000) {
      score += 25;
      reasoning.push('High trading volume');
    }

    // Liquidity scoring
    const liquidity = Number(pool.reserveA + pool.reserveB) / 1e8;
    if (liquidity > 10) {
      score += 20;
      reasoning.push('Deep liquidity pool');
    }

    // Age scoring (newer pools are riskier)
    const ageScore = Math.min((Date.now() - pool.createdAt) / (30 * 24 * 60 * 60 * 1000) * 15, 15);
    score += ageScore;

    const riskScore = 100 - score; // Inverse relationship
    const adjustedScore = score * riskMultiplier;

    return {
      score: adjustedScore,
      riskScore,
      recommendedAmount: 1000, // $1000 default
      ilRisk: riskScore / 2, // Simplified IL risk
      breakEvenDays: Math.max(30 - score / 3, 7),
      reasoning
    };
  }

  private async generatePortfolioOptimization(
    userPositions: LiquidityPosition[],
    recommendations: any[],
    riskTolerance: string
  ): Promise<{
    optimizedYield: number;
    rebalanceActions: any[];
    riskAdjustedReturn: number;
  }> {
    // Simplified portfolio optimization
    const currentYield = userPositions.reduce((sum, pos) => sum + pos.apr * pos.shareOfPool, 0);
    const optimizedYield = currentYield + (recommendations.length > 0 ? recommendations[0].estimatedApr * 0.1 : 0);

    const rebalanceActions = recommendations.slice(0, 3).map(rec => ({
      action: 'add' as const,
      poolId: rec.poolId,
      amount: rec.liquidityRequired,
      expectedImpact: rec.estimatedApr * 0.1
    }));

    return {
      optimizedYield,
      rebalanceActions,
      riskAdjustedReturn: optimizedYield * 0.8 // 20% risk discount
    };
  }

  private calculateImpermanentLoss(entryPrice: number, currentPrice: number): number {
    const priceRatio = currentPrice / entryPrice;
    return (2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1;
  }

  private calculateDiversificationScore(positions: LiquidityPosition[]): number {
    if (positions.length <= 1) return 0;
    
    const totalValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const hhi = positions.reduce((sum, pos) => {
      const weight = pos.totalValue / totalValue;
      return sum + weight * weight;
    }, 0);
    
    return (1 - hhi) * 100;
  }

  private calculatePortfolioRiskScore(positions: LiquidityPosition[]): number {
    const avgIL = positions.reduce((sum, pos) => sum + Math.abs(pos.impermanentLoss), 0) / positions.length;
    const concentrationRisk = 100 - this.calculateDiversificationScore(positions);
    
    return (avgIL * 50 + concentrationRisk) / 2;
  }

  private calculatePositionHealthScore(position: LiquidityPosition): number {
    let score = 100;
    
    // Penalize for high IL
    score -= Math.abs(position.impermanentLoss) * 100;
    
    // Reward for good APR
    score += Math.min(position.apr, 50);
    
    // Penalize for age without rebalancing
    const daysSinceUpdate = (Date.now() - position.lastUpdate) / (24 * 60 * 60 * 1000);
    if (daysSinceUpdate > 30) score -= 20;
    
    return Math.max(Math.min(score, 100), 0);
  }

  // Technical indicator calculations (simplified implementations)
  private calculateRSI(prices: number[], period: number = 14): number {
    // Simplified RSI calculation
    return 50 + Math.random() * 40 - 20; // Mock value between 30-70
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    // Simplified MACD calculation
    return {
      macd: Math.random() * 2 - 1,
      signal: Math.random() * 2 - 1,
      histogram: Math.random() * 2 - 1
    };
  }

  private calculateBollingerBands(prices: number[]): { upper: number; middle: number; lower: number } {
    const currentPrice = prices[prices.length - 1];
    return {
      upper: currentPrice * 1.1,
      middle: currentPrice,
      lower: currentPrice * 0.9
    };
  }

  private findSupportResistance(priceHistory: any[]): { support: number[]; resistance: number[] } {
    const prices = priceHistory.map(p => p.close);
    const currentPrice = prices[prices.length - 1];
    
    return {
      support: [currentPrice * 0.95, currentPrice * 0.90],
      resistance: [currentPrice * 1.05, currentPrice * 1.10]
    };
  }

  private analyzeTrend(prices: number[]): 'bullish' | 'bearish' | 'sideways' {
    const recentPrices = prices.slice(-10);
    const slope = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices.length;
    
    if (slope > 0.01) return 'bullish';
    if (slope < -0.01) return 'bearish';
    return 'sideways';
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
}

// Factory function for creating analytics instance
export const createRunesAnalytics = (runesDEX: RunesDEX): RunesAnalytics => {
  return new RunesAnalytics(runesDEX);
};