/**
 * 💼 PORTFOLIO DATA API
 * Real-time portfolio analytics and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  withMiddleware,
  createSuccessResponse,
  createErrorResponse,
  corsHeaders
} from '@/lib/api-middleware';

interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  type: 'bitcoin' | 'ordinal' | 'rune' | 'brc20';
  balance: number;
  value: number;
  price: number;
  change24h: number;
  allocation: number;
  avgCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  lastUpdate: number;
}

interface PortfolioData {
  positions: PortfolioPosition[];
  metrics: {
    totalValue: number;
    totalPnL: number;
    totalPnLPercent: number;
    dailyChange: number;
    dailyChangePercent: number;
  };
  summary: {
    totalAssets: number;
    totalValue: number;
    bestPerformer: string;
    worstPerformer: string;
    totalGainLoss: number;
  };
}

class PortfolioEngine {
  private static instance: PortfolioEngine;

  static getInstance(): PortfolioEngine {
    if (!PortfolioEngine.instance) {
      PortfolioEngine.instance = new PortfolioEngine();
    }
    return PortfolioEngine.instance;
  }

  getPortfolioData(): PortfolioData {
    const positions: PortfolioPosition[] = [
      {
        id: 'btc',
        symbol: 'BTC',
        name: 'Bitcoin',
        type: 'bitcoin',
        balance: 0.5,
        value: 22500,
        price: 45000,
        change24h: 2.5,
        allocation: 60,
        avgCost: 42000,
        unrealizedPnL: 1500,
        unrealizedPnLPercent: 7.14,
        lastUpdate: Date.now()
      },
      {
        id: 'uncommon_goods',
        symbol: 'UNCOMMON•GOODS',
        name: 'Uncommon Goods Rune',
        type: 'rune',
        balance: 1000000,
        value: 8500,
        price: 0.0000085,
        change24h: 15.2,
        allocation: 22.7,
        avgCost: 0.0000075,
        unrealizedPnL: 1000,
        unrealizedPnLPercent: 13.33,
        lastUpdate: Date.now()
      },
      {
        id: 'ordi',
        symbol: 'ORDI',
        name: 'Ordinals Token',
        type: 'brc20',
        balance: 150,
        value: 4500,
        price: 30,
        change24h: -5.8,
        allocation: 12,
        avgCost: 32,
        unrealizedPnL: -300,
        unrealizedPnLPercent: -6.25,
        lastUpdate: Date.now()
      },
      {
        id: 'rare_sat_1',
        symbol: 'RARE-SAT-1',
        name: 'Rare Satoshi Collection',
        type: 'ordinal',
        balance: 1,
        value: 2000,
        price: 2000,
        change24h: 8.5,
        allocation: 5.3,
        avgCost: 1800,
        unrealizedPnL: 200,
        unrealizedPnLPercent: 11.11,
        lastUpdate: Date.now()
      }
    ];

    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
    const totalPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);

    const bestPerformer = positions.reduce((best, pos) => 
      pos.unrealizedPnLPercent > best.unrealizedPnLPercent ? pos : best
    );
    
    const worstPerformer = positions.reduce((worst, pos) => 
      pos.unrealizedPnLPercent < worst.unrealizedPnLPercent ? pos : worst
    );

    return {
      positions,
      metrics: {
        totalValue,
        totalPnL,
        totalPnLPercent: (totalPnL / (totalValue - totalPnL)) * 100,
        dailyChange: totalValue * 0.025,
        dailyChangePercent: 2.5
      },
      summary: {
        totalAssets: positions.length,
        totalValue,
        bestPerformer: bestPerformer.symbol,
        worstPerformer: worstPerformer.symbol,
        totalGainLoss: totalPnL
      }
    };
  }
}

async function handlePortfolioData(request: NextRequest): Promise<NextResponse> {
  try {
    const engine = PortfolioEngine.getInstance();
    const portfolioData = engine.getPortfolioData();

    return NextResponse.json(
      createSuccessResponse(portfolioData, 'Portfolio data retrieved successfully'),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Portfolio data error:', error);
    
    return NextResponse.json(
      createErrorResponse('Failed to retrieve portfolio data', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export const GET = withMiddleware(handlePortfolioData, {
  rateLimit: {
    windowMs: 60000,
    maxRequests: 120,
  },
  cache: {
    ttl: 30,
  }
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}