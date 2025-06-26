import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

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
    const minSpread = parseFloat(searchParams.get('minSpread') || '5');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Generate mock opportunities for Ordinals and Runes arbitrage
    const mockOpportunities = [
      // Bitcoin Ordinals
      {
        symbol: 'NodeMonkes',
        name: 'NodeMonkes Collection',
        type: 'ordinals',
        buyPrice: 0.025,
        sellPrice: 0.0295,
        spread: 18.0,
        potentialProfit: 0.0045,
        buySource: 'Magic Eden',
        sellSource: 'UniSat',
        buyLink: 'https://magiceden.io/ordinals/marketplace/nodemonkes',
        sellLink: 'https://unisat.io/inscription/nodemonkes',
        baseCurrency: 'BTC',
        volume24h: 2.5,
        liquidity: 85,
        confidence: 92,
        lastUpdated: Date.now(),
        marketCap: 125000,
        aiAnalysis: 'High-value collection with strong floor support. Recent whale activity detected.',
        riskScore: 'low',
        trustScore: 92,
        estimatedFees: {
          network: 0.0002,
          platform: 0.0005,
          total: 0.0007
        },
        executionTime: 180,
        historicalSuccess: 89,
        priceConsistency: 94,
        discoveryTime: Date.now() - 300000
      },
      {
        symbol: 'Bitcoin Puppets',
        name: 'Bitcoin Puppets',
        type: 'ordinals',
        buyPrice: 0.012,
        sellPrice: 0.0138,
        spread: 15.0,
        potentialProfit: 0.0018,
        buySource: 'OKX',
        sellSource: 'Magic Eden',
        buyLink: 'https://okx.com/web3/marketplace/ordinals/bitcoin-puppets',
        sellLink: 'https://magiceden.io/ordinals/marketplace/bitcoin-puppets',
        baseCurrency: 'BTC',
        volume24h: 1.8,
        liquidity: 78,
        confidence: 88,
        lastUpdated: Date.now(),
        marketCap: 78000,
        aiAnalysis: 'Strong community backing. Technical resistance broken recently.',
        riskScore: 'medium',
        trustScore: 78,
        estimatedFees: {
          network: 0.00015,
          platform: 0.0004,
          total: 0.00055
        },
        executionTime: 240,
        historicalSuccess: 76,
        priceConsistency: 82,
        discoveryTime: Date.now() - 450000
      },
      // BRC-20 Tokens
      {
        symbol: 'ORDI',
        name: 'Ordinals Protocol',
        type: 'tokens',
        buyPrice: 42.50,
        sellPrice: 48.90,
        spread: 15.06,
        potentialProfit: 6.40,
        buySource: 'OKX',
        sellSource: 'UniSat',
        buyLink: 'https://okx.com/web3/dex-swap/btc/ordi',
        sellLink: 'https://unisat.io/market/brc20?tick=ordi',
        baseCurrency: 'USD',
        volume24h: 2500000,
        liquidity: 95,
        confidence: 96,
        lastUpdated: Date.now(),
        marketCap: 890000000,
        aiAnalysis: 'First BRC-20 token showing institutional interest. Major exchange listing imminent.',
        riskScore: 'low',
        trustScore: 96,
        estimatedFees: {
          network: 0.5,
          platform: 2.1,
          bridge: 1.2,
          total: 3.8
        },
        executionTime: 120,
        historicalSuccess: 94,
        priceConsistency: 91,
        discoveryTime: Date.now() - 180000
      },
      {
        symbol: 'SATS',
        name: 'Satoshis',
        type: 'tokens',
        buyPrice: 0.000485,
        sellPrice: 0.000558,
        spread: 15.05,
        potentialProfit: 0.000073,
        buySource: 'Gate.io',
        sellSource: 'Magic Eden',
        buyLink: 'https://gate.io/trade/SATS_USDT',
        sellLink: 'https://magiceden.io/ordinals/marketplace/sats',
        baseCurrency: 'USD',
        volume24h: 850000,
        liquidity: 82,
        confidence: 89,
        lastUpdated: Date.now(),
        marketCap: 315000000,
        aiAnalysis: 'Memorial token gaining traction. Strong correlation with BTC price movements.',
        riskScore: 'medium',
        trustScore: 82,
        estimatedFees: {
          network: 0.000012,
          platform: 0.000024,
          bridge: 0.000008,
          total: 0.000044
        },
        executionTime: 300,
        historicalSuccess: 79,
        priceConsistency: 85,
        discoveryTime: Date.now() - 600000
      },
      // Runes
      {
        symbol: 'UNCOMMON•GOODS',
        name: 'Uncommon Goods Rune',
        type: 'runes',
        buyPrice: 12.5,
        sellPrice: 14.8,
        spread: 18.4,
        potentialProfit: 2.3,
        buySource: 'UniSat',
        sellSource: 'OKX',
        buyLink: 'https://unisat.io/runes/market/UNCOMMON%E2%80%A2GOODS',
        sellLink: 'https://okx.com/web3/marketplace/runes/uncommon-goods',
        baseCurrency: 'USD',
        volume24h: 45000,
        liquidity: 65,
        confidence: 81,
        lastUpdated: Date.now(),
        marketCap: 1200000,
        aiAnalysis: 'Early Rune with utility focus. Growing adoption in NFT marketplaces.',
        riskScore: 'high',
        trustScore: 65,
        estimatedFees: {
          network: 0.3,
          platform: 0.8,
          total: 1.1
        },
        executionTime: 420,
        historicalSuccess: 61,
        priceConsistency: 68,
        discoveryTime: Date.now() - 720000
      },
      {
        symbol: 'RSIC•GENESIS•RUNE',
        name: 'RSIC Genesis Rune',
        type: 'runes',
        buyPrice: 8.9,
        sellPrice: 10.45,
        spread: 17.4,
        potentialProfit: 1.55,
        buySource: 'Magic Eden',
        sellSource: 'Ordiscan',
        buyLink: 'https://magiceden.io/runes/RSIC%E2%80%A2GENESIS%E2%80%A2RUNE',
        sellLink: 'https://ordiscan.com/rune/RSIC%E2%80%A2GENESIS%E2%80%A2RUNE',
        baseCurrency: 'USD',
        volume24h: 125000,
        liquidity: 72,
        confidence: 85,
        lastUpdated: Date.now(),
        marketCap: 2800000,
        aiAnalysis: 'Genesis collection with strong fundamentals. Mining rewards creating buy pressure.',
        riskScore: 'medium',
        trustScore: 85,
        estimatedFees: {
          network: 0.25,
          platform: 0.45,
          total: 0.7
        },
        executionTime: 200,
        historicalSuccess: 83,
        priceConsistency: 87,
        discoveryTime: Date.now() - 150000
      },
      // Additional high-spread opportunities
      {
        symbol: 'MEME•ECONOMICS',
        name: 'Meme Economics Rune',
        type: 'runes',
        buyPrice: 0.85,
        sellPrice: 1.02,
        spread: 20.0,
        potentialProfit: 0.17,
        buySource: 'UniSat',
        sellSource: 'Magic Eden',
        buyLink: 'https://unisat.io/runes/market/MEME%E2%80%A2ECONOMICS',
        sellLink: 'https://magiceden.io/runes/MEME%E2%80%A2ECONOMICS',
        baseCurrency: 'USD',
        volume24h: 15000,
        liquidity: 45,
        confidence: 75,
        lastUpdated: Date.now(),
        marketCap: 180000,
        aiAnalysis: 'Emerging meme token with viral potential. Social sentiment strongly positive.',
        riskScore: 'high',
        trustScore: 45,
        estimatedFees: {
          network: 0.02,
          platform: 0.04,
          total: 0.06
        },
        executionTime: 600,
        historicalSuccess: 42,
        priceConsistency: 55,
        discoveryTime: Date.now() - 1200000
      },
      {
        symbol: 'Quantum Cats',
        name: 'Quantum Cats Ordinals',
        type: 'ordinals',
        buyPrice: 0.035,
        sellPrice: 0.042,
        spread: 20.0,
        potentialProfit: 0.007,
        buySource: 'Ordiscan',
        sellSource: 'OKX',
        buyLink: 'https://ordiscan.com/collection/quantum-cats',
        sellLink: 'https://okx.com/web3/marketplace/ordinals/quantum-cats',
        baseCurrency: 'BTC',
        volume24h: 0.8,
        liquidity: 58,
        confidence: 79,
        lastUpdated: Date.now(),
        marketCap: 95000,
        aiAnalysis: 'Innovative on-chain art project. Limited supply creating scarcity premium.',
        riskScore: 'high',
        trustScore: 58,
        estimatedFees: {
          network: 0.0003,
          platform: 0.0007,
          total: 0.001
        },
        executionTime: 480,
        historicalSuccess: 52,
        priceConsistency: 61,
        discoveryTime: Date.now() - 900000
      }
    ];

    // Filter by type and minimum spread
    let filteredOpportunities = mockOpportunities
      .filter(opp => type === 'all' || opp.type === type)
      .filter(opp => opp.spread >= minSpread)
      .sort((a, b) => b.spread - a.spread)
      .slice(0, limit);

    // Calculate statistics
    const totalOpportunities = filteredOpportunities.length;
    const totalSpread = filteredOpportunities.reduce((sum, opp) => sum + opp.spread, 0);
    const avgSpread = totalOpportunities > 0 ? totalSpread / totalOpportunities : 0;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      opportunities: filteredOpportunities,
      stats: {
        totalOpportunities,
        totalSpread,
        avgSpread,
        highValueOpportunities: filteredOpportunities.filter(opp => opp.spread >= 15).length,
        lastScan: Date.now()
      },
      filters: {
        type,
        minSpread,
        limit
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