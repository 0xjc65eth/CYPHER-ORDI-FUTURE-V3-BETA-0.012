import { NextRequest, NextResponse } from 'next/server';
import { exchangeService } from '@/services/exchanges';
import { arbitrageDetectionEngine } from '@/services/ArbitrageDetectionEngine';
import { automatedArbitrageExecutor } from '@/services/AutomatedArbitrageExecutor';
import { arbitrageAnalyticsService } from '@/services/ArbitrageAnalyticsService';

interface ArbitrageOpportunity {
  id: string;
  type: 'cross-exchange' | 'triangular' | 'defi' | 'ordinals';
  exchanges: {
    buy: {
      name: string;
      price: number;
      volume: number;
      fee: number;
    };
    sell: {
      name: string;
      price: number;
      volume: number;
      fee: number;
    };
  };
  asset: {
    symbol: string;
    name: string;
    type: 'bitcoin' | 'ordinal' | 'rune' | 'brc20';
  };
  profit: {
    amount: number;
    percentage: number;
    netAmount: number; // After fees
  };
  requiredCapital: number;
  confidence: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  expiresAt: Date;
  executionTime: number; // seconds
  status: 'active' | 'expired' | 'executed';
}

interface ArbitrageStats {
  totalOpportunities: number;
  averageProfit: number;
  bestOpportunity: ArbitrageOpportunity | null;
  volume24h: number;
  successRate: number;
}

// Mock exchanges data
const EXCHANGES = [
  { name: 'Binance', fee: 0.001 },
  { name: 'Coinbase', fee: 0.0015 },
  { name: 'Kraken', fee: 0.0016 },
  { name: 'OKX', fee: 0.001 },
  { name: 'Magic Eden', fee: 0.02 },
  { name: 'Ordinals Market', fee: 0.025 },
  { name: 'UniSat', fee: 0.02 }
];

// Generate mock arbitrage opportunities
function generateOpportunities(limit: number = 10): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', type: 'bitcoin' as const },
    { symbol: 'ORDI', name: 'ORDI', type: 'brc20' as const },
    { symbol: 'SATS', name: 'SATS', type: 'brc20' as const },
    { symbol: 'PUNK', name: 'Bitcoin Punks', type: 'ordinal' as const },
    { symbol: 'OMB', name: 'Ordinal Maxi Biz', type: 'ordinal' as const }
  ];

  for (let i = 0; i < limit; i++) {
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const buyExchange = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
    let sellExchange = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
    
    // Ensure different exchanges
    while (sellExchange.name === buyExchange.name) {
      sellExchange = EXCHANGES[Math.floor(Math.random() * EXCHANGES.length)];
    }

    const basePrice = asset.symbol === 'BTC' ? 98500 : 
                     asset.type === 'ordinal' ? 10000 + Math.random() * 20000 :
                     10 + Math.random() * 50;
    
    const priceDiff = 0.001 + Math.random() * 0.03; // 0.1% to 3% difference
    const buyPrice = basePrice * (1 - priceDiff / 2);
    const sellPrice = basePrice * (1 + priceDiff / 2);
    
    const volume = asset.symbol === 'BTC' ? 0.1 + Math.random() * 2 :
                   asset.type === 'ordinal' ? 1 :
                   100 + Math.random() * 1000;
    
    const requiredCapital = buyPrice * volume;
    const grossProfit = (sellPrice - buyPrice) * volume;
    const totalFees = (buyPrice * volume * buyExchange.fee) + (sellPrice * volume * sellExchange.fee);
    const netProfit = grossProfit - totalFees;
    const profitPercentage = (netProfit / requiredCapital) * 100;
    
    // Only include profitable opportunities
    if (netProfit > 0) {
      opportunities.push({
        id: `arb-${Date.now()}-${i}`,
        type: asset.type === 'ordinal' ? 'ordinals' : 'cross-exchange',
        exchanges: {
          buy: {
            name: buyExchange.name,
            price: buyPrice,
            volume: volume,
            fee: buyExchange.fee
          },
          sell: {
            name: sellExchange.name,
            price: sellPrice,
            volume: volume,
            fee: sellExchange.fee
          }
        },
        asset: asset,
        profit: {
          amount: grossProfit,
          percentage: profitPercentage,
          netAmount: netProfit
        },
        requiredCapital,
        confidence: 60 + Math.random() * 40,
        riskLevel: profitPercentage > 2 ? 'high' : profitPercentage > 1 ? 'medium' : 'low',
        expiresAt: new Date(Date.now() + (30 + Math.random() * 300) * 1000), // 30s to 5min
        executionTime: 5 + Math.random() * 25,
        status: 'active'
      });
    }
  }

  return opportunities.sort((a, b) => b.profit.percentage - a.profit.percentage);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const minProfit = parseFloat(searchParams.get('minProfit') || '0.5');
    const maxCapital = parseFloat(searchParams.get('maxCapital') || '1000000');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const symbol = searchParams.get('symbol') || 'BTC';

    // Get real opportunities from detection engine
    const realOpportunities = exchangeService.getOpportunities();
    
    // If no real opportunities, generate some for symbols
    let opportunities = realOpportunities.length > 0 ? realOpportunities : [];
    
    if (opportunities.length === 0) {
      // Generate opportunities for different symbols
      const symbols = ['BTC', 'ETH', 'SOL'];
      for (const sym of symbols) {
        const symbolOpportunities = await exchangeService.detectArbitrageOpportunities(sym);
        opportunities.push(...symbolOpportunities);
      }
    }

    // Convert to API format
    const formattedOpportunities = opportunities.map(opp => ({
      id: opp.id,
      type: 'cross-exchange' as const,
      exchanges: {
        buy: {
          name: opp.buyExchange,
          price: opp.buyPrice,
          volume: opp.liquidity.buy,
          fee: opp.fees.buy
        },
        sell: {
          name: opp.sellExchange,
          price: opp.sellPrice,
          volume: opp.liquidity.sell,
          fee: opp.fees.sell
        }
      },
      asset: {
        symbol: opp.symbol,
        name: opp.symbol,
        type: 'bitcoin' as const
      },
      profit: {
        amount: opp.profit,
        percentage: opp.profitPercent,
        netAmount: opp.netProfit
      },
      requiredCapital: opp.buyPrice,
      confidence: opp.confidence,
      riskLevel: opp.riskLevel,
      expiresAt: new Date(opp.expiresAt),
      executionTime: opp.executionTime,
      status: 'active' as const
    }));

    // Filter opportunities
    let filteredOpportunities = formattedOpportunities;

    // Filter by type
    if (type !== 'all') {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.type === type);
    }

    // Filter by minimum profit percentage
    filteredOpportunities = filteredOpportunities.filter(opp => opp.profit.percentage >= minProfit);

    // Filter by maximum required capital
    filteredOpportunities = filteredOpportunities.filter(opp => opp.requiredCapital <= maxCapital);

    // Sort by profit percentage
    filteredOpportunities.sort((a, b) => b.profit.percentage - a.profit.percentage);

    // Limit results
    filteredOpportunities = filteredOpportunities.slice(0, limit);

    // Get real analytics
    const analytics = arbitrageAnalyticsService.exportAnalytics();
    const executorStats = automatedArbitrageExecutor.getStats();
    const detectionStatus = arbitrageDetectionEngine.getStatus();

    // Calculate stats
    const stats: ArbitrageStats = {
      totalOpportunities: filteredOpportunities.length,
      averageProfit: filteredOpportunities.length > 0 
        ? filteredOpportunities.reduce((sum, opp) => sum + opp.profit.percentage, 0) / filteredOpportunities.length
        : 0,
      bestOpportunity: filteredOpportunities.length > 0 ? filteredOpportunities[0] : null,
      volume24h: analytics.historical.reduce((sum, day) => sum + day.volume, 0),
      successRate: executorStats.successRate * 100
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      opportunities: filteredOpportunities,
      systemStatus: {
        detectionEngine: detectionStatus.isActive,
        automatedExecution: automatedArbitrageExecutor.getStatus().enabled,
        exchangeHealth: await exchangeService.healthCheck(),
        performance: analytics.performance,
        marketConditions: analytics.marketConditions
      },
      filters: {
        type,
        minProfit,
        maxCapital,
        limit,
        symbol
      }
    });

  } catch (error) {
    console.error('Arbitrage opportunities API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch arbitrage opportunities',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Real arbitrage execution and control endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, action, config } = body;

    if (!action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Action is required' 
        },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'execute':
        if (!opportunityId) {
          return NextResponse.json(
            { success: false, error: 'Opportunity ID required for execution' },
            { status: 400 }
          );
        }

        // Execute through real exchange service
        const result = await exchangeService.executeArbitrage(opportunityId);
        
        return NextResponse.json({
          success: result.success,
          message: result.success ? 'Arbitrage execution completed' : 'Execution failed',
          executionId: result.executionId,
          result: result,
          timestamp: result.timestamp
        });

      case 'start_detection':
        // Start the detection engine
        await arbitrageDetectionEngine.start();
        
        return NextResponse.json({
          success: true,
          message: 'Arbitrage detection engine started',
          status: arbitrageDetectionEngine.getStatus()
        });

      case 'stop_detection':
        // Stop the detection engine
        arbitrageDetectionEngine.stop();
        
        return NextResponse.json({
          success: true,
          message: 'Arbitrage detection engine stopped',
          status: arbitrageDetectionEngine.getStatus()
        });

      case 'start_automation':
        // Start automated execution
        automatedArbitrageExecutor.start();
        
        return NextResponse.json({
          success: true,
          message: 'Automated arbitrage execution started',
          status: automatedArbitrageExecutor.getStatus()
        });

      case 'stop_automation':
        // Stop automated execution
        automatedArbitrageExecutor.stop();
        
        return NextResponse.json({
          success: true,
          message: 'Automated arbitrage execution stopped',
          status: automatedArbitrageExecutor.getStatus()
        });

      case 'update_config':
        if (!config) {
          return NextResponse.json(
            { success: false, error: 'Configuration is required' },
            { status: 400 }
          );
        }

        // Update detection engine config
        if (config.detection) {
          arbitrageDetectionEngine.updateConfig(config.detection);
        }

        // Update executor config
        if (config.execution) {
          automatedArbitrageExecutor.updateConfig(config.execution);
        }

        return NextResponse.json({
          success: true,
          message: 'Configuration updated successfully',
          detectionConfig: arbitrageDetectionEngine.getConfig(),
          executionConfig: automatedArbitrageExecutor.getConfig()
        });

      case 'get_analytics':
        // Return comprehensive analytics
        const analytics = arbitrageAnalyticsService.exportAnalytics();
        const executorStats = automatedArbitrageExecutor.getStats();
        const recentAlerts = arbitrageDetectionEngine.getRecentAlerts(20);
        const recentNotifications = automatedArbitrageExecutor.getRecentNotifications(20);

        return NextResponse.json({
          success: true,
          analytics,
          executorStats,
          recentAlerts,
          recentNotifications,
          systemStatus: {
            detectionEngine: arbitrageDetectionEngine.getStatus(),
            automatedExecution: automatedArbitrageExecutor.getStatus(),
            analytics: arbitrageAnalyticsService.getStatus?.() || { isTracking: true }
          }
        });

      case 'health_check':
        // System health check
        const exchangeHealth = await exchangeService.healthCheck();
        const detectionStatus = arbitrageDetectionEngine.getStatus();
        const executionStatus = automatedArbitrageExecutor.getStatus();

        return NextResponse.json({
          success: true,
          health: {
            exchanges: exchangeHealth,
            detection: detectionStatus.isActive,
            execution: executionStatus.isRunning,
            uptime: detectionStatus.uptime,
            lastUpdate: Date.now()
          }
        });

      case 'monitor':
        // Add to monitoring (legacy support)
        return NextResponse.json({
          success: true,
          message: 'Added to monitoring list'
        });

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Invalid action: ${action}` 
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Arbitrage action API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process arbitrage action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}