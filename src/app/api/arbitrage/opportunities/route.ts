import { NextRequest, NextResponse } from 'next/server';

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
    const minProfit = parseFloat(searchParams.get('minProfit') || '0');
    const maxCapital = parseFloat(searchParams.get('maxCapital') || '1000000');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Generate opportunities
    let opportunities = generateOpportunities(limit * 2); // Generate more to filter

    // Filter by type
    if (type !== 'all') {
      opportunities = opportunities.filter(opp => opp.type === type);
    }

    // Filter by minimum profit percentage
    opportunities = opportunities.filter(opp => opp.profit.percentage >= minProfit);

    // Filter by maximum required capital
    opportunities = opportunities.filter(opp => opp.requiredCapital <= maxCapital);

    // Limit results
    opportunities = opportunities.slice(0, limit);

    // Calculate stats
    const stats: ArbitrageStats = {
      totalOpportunities: opportunities.length,
      averageProfit: opportunities.length > 0 
        ? opportunities.reduce((sum, opp) => sum + opp.profit.percentage, 0) / opportunities.length
        : 0,
      bestOpportunity: opportunities.length > 0 ? opportunities[0] : null,
      volume24h: 12345678, // Mock value
      successRate: 73.5 // Mock value
    };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      opportunities,
      filters: {
        type,
        minProfit,
        maxCapital,
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

// WebSocket endpoint for real-time updates (simulated with SSE)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, action } = body;

    if (!opportunityId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Opportunity ID and action are required' 
        },
        { status: 400 }
      );
    }

    // Simulate execution
    if (action === 'execute') {
      // In production, this would trigger actual trading
      return NextResponse.json({
        success: true,
        message: 'Arbitrage execution initiated',
        executionId: `exec-${Date.now()}`,
        estimatedTime: 15 // seconds
      });
    }

    if (action === 'monitor') {
      // In production, this would add to monitoring list
      return NextResponse.json({
        success: true,
        message: 'Added to monitoring list'
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid action' 
      },
      { status: 400 }
    );

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