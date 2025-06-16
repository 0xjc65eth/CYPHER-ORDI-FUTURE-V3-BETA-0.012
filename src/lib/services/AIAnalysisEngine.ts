import { Portfolio, AIInsight, AssetHolding, Transaction, RiskAnalysis } from '@/types/portfolio';

export class AIAnalysisEngine {
  // Patterns and thresholds for analysis
  private readonly patterns = {
    bullish: ['higher_highs', 'breakout', 'golden_cross', 'accumulation'],
    bearish: ['lower_lows', 'breakdown', 'death_cross', 'distribution'],
    neutral: ['consolidation', 'range_bound', 'low_volatility']
  };

  private readonly riskThresholds = {
    volatility: { low: 0.1, medium: 0.2, high: 0.3 },
    drawdown: { low: 0.05, medium: 0.15, high: 0.25 },
    concentration: { low: 0.3, medium: 0.5, high: 0.7 }
  };

  generateInsights(portfolio: Portfolio): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Performance insights
    insights.push(...this.analyzePerformance(portfolio));
    
    // Risk insights
    insights.push(...this.analyzeRisk(portfolio));
    
    // Opportunity insights
    insights.push(...this.identifyOpportunities(portfolio));
    
    // Anomaly detection
    insights.push(...this.detectAnomalies(portfolio));
    
    // Market correlation insights
    insights.push(...this.analyzeMarketCorrelation(portfolio));
    
    // Tax optimization insights
    insights.push(...this.analyzeTaxOpportunities(portfolio));
    
    // Rebalancing recommendations
    insights.push(...this.generateRebalancingInsights(portfolio));
    
    // Sort by confidence and impact
    return insights.sort((a, b) => {
      const scoreA = (a.confidence / 100) * (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1);
      const scoreB = (b.confidence / 100) * (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1);
      return scoreB - scoreA;
    });
  }

  private analyzePerformance(portfolio: Portfolio): AIInsight[] {
    const insights: AIInsight[] = [];
    const metrics = portfolio.metrics;
    
    // Analyze overall performance
    if (metrics.totalPNLPercentage > 50) {
      insights.push({
        id: `perf-${Date.now()}-1`,
        type: 'trend',
        title: 'Exceptional Portfolio Performance',
        description: `Your portfolio has gained ${metrics.totalPNLPercentage.toFixed(1)}%, significantly outperforming market averages. Consider taking some profits to lock in gains.`,
        confidence: 90,
        impact: 'high',
        actionable: true,
        actions: [{
          id: 'action-1',
          type: 'rebalance',
          description: 'Consider rebalancing to lock in profits',
          urgency: 'medium'
        }],
        timestamp: new Date().toISOString()
      });
    }
    
    // Analyze win rate
    if (metrics.winRate > 70) {
      insights.push({
        id: `perf-${Date.now()}-2`,
        type: 'trend',
        title: 'High Win Rate Detected',
        description: `Your trading win rate of ${metrics.winRate.toFixed(1)}% is exceptional. Your strategy appears to be working well.`,
        confidence: 85,
        impact: 'medium',
        actionable: false,
        timestamp: new Date().toISOString()
      });
    }
    
    // Analyze recent performance
    const recentPerf = this.calculateRecentPerformance(portfolio);
    if (recentPerf.trend === 'accelerating') {
      insights.push({
        id: `perf-${Date.now()}-3`,
        type: 'trend',
        title: 'Accelerating Growth Pattern',
        description: 'Your portfolio growth is accelerating. Recent returns are exceeding historical averages.',
        confidence: 75,
        impact: 'medium',
        actionable: true,
        actions: [{
          id: 'action-2',
          type: 'alert',
          description: 'Monitor for potential overheating',
          urgency: 'low'
        }],
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }

  private analyzeRisk(portfolio: Portfolio): AIInsight[] {
    const insights: AIInsight[] = [];
    const risk = portfolio.riskAnalysis;
    
    // Concentration risk
    if (risk.concentrationRisk > 70) {
      const topHolding = portfolio.holdings.reduce((max, h) => 
        h.currentValue > (max?.currentValue || 0) ? h : max, portfolio.holdings[0]);
      
      insights.push({
        id: `risk-${Date.now()}-1`,
        type: 'risk',
        title: 'High Concentration Risk',
        description: `${topHolding.asset} represents over ${((topHolding.currentValue / portfolio.metrics.totalValue) * 100).toFixed(0)}% of your portfolio. Consider diversifying.`,
        confidence: 95,
        impact: 'high',
        actionable: true,
        actions: [{
          id: 'action-3',
          type: 'rebalance',
          description: `Reduce ${topHolding.asset} position by 20-30%`,
          asset: topHolding.asset,
          urgency: 'high'
        }],
        timestamp: new Date().toISOString()
      });
    }
    
    // Volatility risk
    if (risk.volatilityRisk > 80) {
      insights.push({
        id: `risk-${Date.now()}-2`,
        type: 'risk',
        title: 'Elevated Volatility Detected',
        description: 'Portfolio volatility is significantly above average. Your returns may be more unpredictable.',
        confidence: 80,
        impact: 'medium',
        actionable: true,
        actions: [{
          id: 'action-4',
          type: 'research',
          description: 'Consider adding stable assets or hedges',
          urgency: 'medium'
        }],
        timestamp: new Date().toISOString()
      });
    }
    
    // Drawdown analysis
    const currentDrawdown = this.calculateCurrentDrawdown(portfolio);
    if (currentDrawdown > 15) {
      insights.push({
        id: `risk-${Date.now()}-3`,
        type: 'risk',
        title: 'Significant Drawdown',
        description: `Portfolio is down ${currentDrawdown.toFixed(1)}% from recent highs. This could be a buying opportunity or a sign to reassess.`,
        confidence: 90,
        impact: 'high',
        actionable: true,
        actions: [{
          id: 'action-5',
          type: 'research',
          description: 'Review positions for fundamental changes',
          urgency: 'high'
        }],
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }

  private identifyOpportunities(portfolio: Portfolio): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Momentum opportunities
    portfolio.holdings.forEach(holding => {
      if (holding.monthChangePercentage > 20 && holding.weekChangePercentage > 5) {
        insights.push({
          id: `opp-${Date.now()}-${holding.id}`,
          type: 'opportunity',
          title: `Strong Momentum in ${holding.asset}`,
          description: `${holding.asset} is showing strong momentum with ${holding.monthChangePercentage.toFixed(1)}% monthly gain. Consider adding to position if fundamentals support.`,
          confidence: 70,
          impact: 'medium',
          actionable: true,
          actions: [{
            id: `action-opp-${holding.id}`,
            type: 'buy',
            description: `Consider adding 10-20% more ${holding.asset}`,
            asset: holding.asset,
            urgency: 'medium'
          }],
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Dip buying opportunities
    portfolio.holdings.forEach(holding => {
      if (holding.dayChangePercentage < -5 && holding.monthChangePercentage > 0) {
        insights.push({
          id: `dip-${Date.now()}-${holding.id}`,
          type: 'opportunity',
          title: `Potential Buy-the-Dip for ${holding.asset}`,
          description: `${holding.asset} is down ${Math.abs(holding.dayChangePercentage).toFixed(1)}% today but maintains positive monthly trend. Could be a buying opportunity.`,
          confidence: 65,
          impact: 'medium',
          actionable: true,
          actions: [{
            id: `action-dip-${holding.id}`,
            type: 'buy',
            description: `Set limit orders 2-3% below current price`,
            asset: holding.asset,
            targetPrice: holding.currentPrice * 0.97,
            urgency: 'medium'
          }],
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Tax loss harvesting
    portfolio.holdings.forEach(holding => {
      if (holding.unrealizedPNL < -1000 && holding.unrealizedPNLPercentage < -20) {
        insights.push({
          id: `tax-${Date.now()}-${holding.id}`,
          type: 'opportunity',
          title: `Tax Loss Harvesting Opportunity`,
          description: `${holding.asset} has an unrealized loss of $${Math.abs(holding.unrealizedPNL).toFixed(0)}. Consider harvesting for tax benefits.`,
          confidence: 85,
          impact: 'low',
          actionable: true,
          actions: [{
            id: `action-tax-${holding.id}`,
            type: 'sell',
            description: `Sell ${holding.asset} and potentially rebuy after wash sale period`,
            asset: holding.asset,
            urgency: 'low'
          }],
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return insights;
  }

  private detectAnomalies(portfolio: Portfolio): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Volume anomalies
    const recentTransactions = portfolio.transactions.slice(-10);
    const avgTransactionSize = portfolio.transactions.reduce((sum, t) => sum + t.totalValue, 0) / portfolio.transactions.length;
    
    recentTransactions.forEach(tx => {
      if (tx.totalValue > avgTransactionSize * 3) {
        insights.push({
          id: `anomaly-${Date.now()}-${tx.id}`,
          type: 'anomaly',
          title: 'Unusually Large Transaction',
          description: `Transaction of $${tx.totalValue.toFixed(0)} is ${(tx.totalValue / avgTransactionSize).toFixed(1)}x larger than average. Verify this was intentional.`,
          confidence: 90,
          impact: 'medium',
          actionable: true,
          actions: [{
            id: `action-anomaly-${tx.id}`,
            type: 'alert',
            description: 'Review transaction details',
            urgency: 'high'
          }],
          metadata: { transactionId: tx.id },
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Price anomalies
    portfolio.holdings.forEach(holding => {
      const priceChange = ((holding.currentPrice - holding.marketPrice24hAgo) / holding.marketPrice24hAgo) * 100;
      if (Math.abs(priceChange) > 15) {
        insights.push({
          id: `price-anomaly-${Date.now()}-${holding.id}`,
          type: 'anomaly',
          title: `Unusual Price Movement in ${holding.asset}`,
          description: `${holding.asset} moved ${priceChange.toFixed(1)}% in 24h. Check for news or market events.`,
          confidence: 85,
          impact: 'high',
          actionable: true,
          actions: [{
            id: `action-price-${holding.id}`,
            type: 'research',
            description: 'Research cause of price movement',
            asset: holding.asset,
            urgency: 'high'
          }],
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return insights;
  }

  private analyzeMarketCorrelation(portfolio: Portfolio): AIInsight[] {
    const insights: AIInsight[] = [];
    const market = portfolio.marketContext;
    
    // Fear & Greed analysis
    if (market.fearGreedIndex < 20) {
      insights.push({
        id: `market-${Date.now()}-1`,
        type: 'opportunity',
        title: 'Extreme Fear in Market',
        description: 'Market sentiment shows extreme fear. Historically, this has been a good buying opportunity for contrarian investors.',
        confidence: 75,
        impact: 'high',
        actionable: true,
        actions: [{
          id: 'action-fear',
          type: 'buy',
          description: 'Consider gradual accumulation',
          urgency: 'medium'
        }],
        timestamp: new Date().toISOString()
      });
    } else if (market.fearGreedIndex > 80) {
      insights.push({
        id: `market-${Date.now()}-2`,
        type: 'risk',
        title: 'Extreme Greed in Market',
        description: 'Market sentiment shows extreme greed. Consider taking some profits or hedging positions.',
        confidence: 75,
        impact: 'medium',
        actionable: true,
        actions: [{
          id: 'action-greed',
          type: 'sell',
          description: 'Consider trimming positions',
          urgency: 'medium'
        }],
        timestamp: new Date().toISOString()
      });
    }
    
    // Whale activity
    if (market.whaleActivity === 'high') {
      insights.push({
        id: `market-${Date.now()}-3`,
        type: 'trend',
        title: 'High Whale Activity Detected',
        description: 'Large holders are actively moving funds. This often precedes significant market moves.',
        confidence: 70,
        impact: 'medium',
        actionable: true,
        actions: [{
          id: 'action-whale',
          type: 'alert',
          description: 'Monitor positions closely',
          urgency: 'high'
        }],
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }

  private analyzeTaxOpportunities(portfolio: Portfolio): AIInsight[] {
    const insights: AIInsight[] = [];
    const currentYear = new Date().getFullYear();
    
    // Calculate realized gains for the year
    const yearTransactions = portfolio.transactions.filter(tx => 
      new Date(tx.date).getFullYear() === currentYear && tx.type === 'sell'
    );
    
    const realizedGains = yearTransactions.reduce((sum, tx) => sum + (tx.realizedPNL || 0), 0);
    
    if (realizedGains > 10000) {
      // Look for offsetting losses
      const losers = portfolio.holdings.filter(h => h.unrealizedPNL < -500);
      if (losers.length > 0) {
        insights.push({
          id: `tax-opt-${Date.now()}`,
          type: 'recommendation',
          title: 'Tax Optimization Opportunity',
          description: `You have $${realizedGains.toFixed(0)} in realized gains. Consider harvesting losses from underperforming assets to offset tax liability.`,
          confidence: 90,
          impact: 'medium',
          actionable: true,
          actions: losers.slice(0, 3).map(holding => ({
            id: `tax-action-${holding.id}`,
            type: 'sell' as const,
            description: `Harvest loss from ${holding.asset} (-$${Math.abs(holding.unrealizedPNL).toFixed(0)})`,
            asset: holding.asset,
            urgency: 'low' as const
          })),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return insights;
  }

  private generateRebalancingInsights(portfolio: Portfolio): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Check portfolio balance
    const targetAllocation = 1 / portfolio.holdings.length; // Equal weight for simplicity
    const rebalancingNeeded = portfolio.holdings.filter(h => {
      const currentAllocation = h.currentValue / portfolio.metrics.totalValue;
      return Math.abs(currentAllocation - targetAllocation) > 0.1; // 10% deviation
    });
    
    if (rebalancingNeeded.length > 0) {
      insights.push({
        id: `rebalance-${Date.now()}`,
        type: 'recommendation',
        title: 'Portfolio Rebalancing Recommended',
        description: `${rebalancingNeeded.length} assets have deviated significantly from target allocations. Consider rebalancing to maintain desired risk profile.`,
        confidence: 80,
        impact: 'medium',
        actionable: true,
        actions: [{
          id: 'action-rebalance',
          type: 'rebalance',
          description: 'Review and execute rebalancing trades',
          urgency: 'medium'
        }],
        timestamp: new Date().toISOString()
      });
    }
    
    return insights;
  }

  // Helper methods
  private calculateRecentPerformance(portfolio: Portfolio): { trend: string; strength: number } {
    const history = portfolio.performanceHistory;
    if (history.length < 30) return { trend: 'insufficient_data', strength: 0 };
    
    const recent = history.slice(-7);
    const prior = history.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, h) => sum + h.dayReturnPercentage, 0) / recent.length;
    const priorAvg = prior.reduce((sum, h) => sum + h.dayReturnPercentage, 0) / prior.length;
    
    if (recentAvg > priorAvg * 1.5) return { trend: 'accelerating', strength: recentAvg / priorAvg };
    if (recentAvg < priorAvg * 0.5) return { trend: 'decelerating', strength: recentAvg / priorAvg };
    return { trend: 'stable', strength: 1 };
  }

  private calculateCurrentDrawdown(portfolio: Portfolio): number {
    const history = portfolio.performanceHistory;
    if (history.length === 0) return 0;
    
    let peak = history[0].totalValue;
    history.forEach(h => {
      if (h.totalValue > peak) peak = h.totalValue;
    });
    
    const current = history[history.length - 1].totalValue;
    return peak > 0 ? ((peak - current) / peak) * 100 : 0;
  }

  // Pattern recognition methods
  detectTrendPatterns(prices: number[]): string[] {
    const patterns: string[] = [];
    
    if (prices.length < 20) return patterns;
    
    // Moving averages
    const ma5 = this.calculateMA(prices.slice(-5));
    const ma20 = this.calculateMA(prices.slice(-20));
    
    if (ma5 > ma20 * 1.02) patterns.push('golden_cross');
    if (ma5 < ma20 * 0.98) patterns.push('death_cross');
    
    // Higher highs/lower lows
    const highs = this.findLocalExtremes(prices, 'high');
    const lows = this.findLocalExtremes(prices, 'low');
    
    if (highs.length >= 2 && highs[highs.length - 1] > highs[highs.length - 2]) {
      patterns.push('higher_highs');
    }
    if (lows.length >= 2 && lows[lows.length - 1] < lows[lows.length - 2]) {
      patterns.push('lower_lows');
    }
    
    return patterns;
  }

  private calculateMA(prices: number[]): number {
    return prices.reduce((sum, p) => sum + p, 0) / prices.length;
  }

  private findLocalExtremes(prices: number[], type: 'high' | 'low'): number[] {
    const extremes: number[] = [];
    for (let i = 1; i < prices.length - 1; i++) {
      if (type === 'high' && prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        extremes.push(prices[i]);
      } else if (type === 'low' && prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        extremes.push(prices[i]);
      }
    }
    return extremes;
  }
}