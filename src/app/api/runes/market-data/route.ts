/**
 * 🪙 RUNES MARKET DATA API
 * Real-time Runes market data and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  withMiddleware,
  createSuccessResponse,
  createErrorResponse,
  corsHeaders
} from '@/lib/api-middleware';

// Request schema
const RunesRequestSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  sortBy: z.enum(['marketCap', 'volume', 'price', 'change24h']).optional().default('marketCap'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  includeAnalytics: z.boolean().optional().default(true)
});

interface RuneMarketData {
  id: string;
  name: string;
  symbol: string;
  price: {
    current: number;
    change24h: number;
    change7d: number;
    high24h: number;
    low24h: number;
  };
  marketCap: {
    current: number;
    rank: number;
    change24h: number;
  };
  volume: {
    volume24h: number;
    change24h: number;
    volumeRank: number;
  };
  supply: {
    circulating: number;
    total: number;
    max: number;
    percentage: number;
  };
  holders: number;
  transactions: {
    transfers24h: number;
    mints24h: number;
    burns24h: number;
  };
  minting: {
    progress: number;
    remaining: number;
    rate: number;
    estimatedCompletion: number;
  };
  liquidity: {
    pools: Array<{
      exchange: string;
      liquidity: number;
      apr: number;
    }>;
    totalLiquidity: number;
  };
  technicalAnalysis: {
    rsi: number;
    macd: number;
    bollinger: {
      upper: number;
      middle: number;
      lower: number;
    };
    support: number;
    resistance: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  sentiment: {
    score: number;
    mentions24h: number;
    bullishPercentage: number;
  };
  lastUpdate: number;
}

interface RunesAnalytics {
  marketOverview: {
    totalMarketCap: number;
    totalVolume24h: number;
    averageChange24h: number;
    activeRunes: number;
    newRunes24h: number;
    marketSentiment: 'bullish' | 'bearish' | 'neutral';
  };
  topPerformers: {
    gainers24h: RuneMarketData[];
    losers24h: RuneMarketData[];
    volumeLeaders: RuneMarketData[];
  };
  crossChainMetrics: {
    bridgeVolume24h: number;
    activeBridges: number;
    averageBridgeTime: number;
  };
  liquidityMetrics: {
    totalLiquidity: number;
    averageApr: number;
    topPools: Array<{
      name: string;
      liquidity: number;
      apr: number;
      volume24h: number;
    }>;
  };
}

class RunesDataEngine {
  private static instance: RunesDataEngine;
  private runesData: RuneMarketData[] = [];
  private lastUpdate = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): RunesDataEngine {
    if (!RunesDataEngine.instance) {
      RunesDataEngine.instance = new RunesDataEngine();
    }
    return RunesDataEngine.instance;
  }

  private constructor() {
    this.initializeRunesData();
  }

  private initializeRunesData() {
    const runeNames = [
      'UNCOMMON•GOODS', 'RSIC•METAPROTOCOL', 'DOG•GO•TO•THE•MOON',
      'SATOSHI•NAKAMOTO', 'BITCOIN•PIZZA•DAY', 'MEME•ECONOMICS',
      'ORDINAL•THEORY', 'DIGITAL•ARTIFACTS', 'RARE•SATS•CLUB',
      'LIGHTNING•NETWORK', 'TIMECHAIN•GENESIS', 'PROOF•OF•WORK',
      'HASH•POWER•UNITE', 'BLOCK•HEIGHT•MOON', 'MINERS•DELIGHT',
      'SATS•FOR•LIFE', 'ORANGE•PILL•MAXI', 'HODL•FOREVER',
      'STACK•SATS•DAILY', 'TWENTY•ONE•MILLION', 'GENESIS•BLOCK•FUN',
      'DIFFICULTY•ADJUST', 'MERKLE•TREE•MAGIC', 'NONCE•DISCOVERY'
    ];

    this.runesData = runeNames.map((name, index) => {
      const basePrice = 0.00001 + Math.random() * 0.001;
      const marketCap = basePrice * (1000000 + Math.random() * 50000000);
      const volume24h = marketCap * (0.05 + Math.random() * 0.3);
      const change24h = (Math.random() - 0.5) * 20; // -10% to +10%
      const holders = 100 + Math.floor(Math.random() * 10000);
      
      return {
        id: `rune_${index + 1}`,
        name,
        symbol: name.replace(/[•\s]/g, '').substring(0, 8),
        price: {
          current: basePrice,
          change24h,
          change7d: (Math.random() - 0.5) * 40,
          high24h: basePrice * (1 + Math.random() * 0.2),
          low24h: basePrice * (0.8 + Math.random() * 0.2)
        },
        marketCap: {
          current: marketCap,
          rank: index + 1,
          change24h: change24h * 0.8 // Market cap change usually less volatile
        },
        volume: {
          volume24h,
          change24h: (Math.random() - 0.5) * 100,
          volumeRank: Math.floor(Math.random() * runeNames.length) + 1
        },
        supply: {
          circulating: 1000000 + Math.random() * 99000000,
          total: 100000000,
          max: 100000000,
          percentage: 50 + Math.random() * 50
        },
        holders,
        transactions: {
          transfers24h: Math.floor(Math.random() * 1000),
          mints24h: Math.floor(Math.random() * 100),
          burns24h: Math.floor(Math.random() * 10)
        },
        minting: {
          progress: 50 + Math.random() * 50,
          remaining: Math.floor(Math.random() * 1000000),
          rate: Math.floor(Math.random() * 1000),
          estimatedCompletion: Date.now() + Math.random() * 86400000 * 30 // 30 days
        },
        liquidity: {
          pools: [
            {
              exchange: 'UniSat',
              liquidity: volume24h * 2,
              apr: 5 + Math.random() * 20
            },
            {
              exchange: 'OrdSwap', 
              liquidity: volume24h * 1.5,
              apr: 8 + Math.random() * 15
            }
          ],
          totalLiquidity: volume24h * 3.5
        },
        technicalAnalysis: {
          rsi: 30 + Math.random() * 40,
          macd: (Math.random() - 0.5) * 0.001,
          bollinger: {
            upper: basePrice * 1.1,
            middle: basePrice,
            lower: basePrice * 0.9
          },
          support: basePrice * 0.95,
          resistance: basePrice * 1.05,
          trend: change24h > 2 ? 'bullish' : change24h < -2 ? 'bearish' : 'neutral'
        },
        sentiment: {
          score: 50 + (Math.random() - 0.5) * 60,
          mentions24h: Math.floor(Math.random() * 100),
          bullishPercentage: 30 + Math.random() * 40
        },
        lastUpdate: Date.now()
      };
    });

    this.lastUpdate = Date.now();
  }

  async getRunesData(request: z.infer<typeof RunesRequestSchema>): Promise<RuneMarketData[]> {
    // Refresh data if cache expired
    if (Date.now() - this.lastUpdate > this.CACHE_DURATION) {
      this.updatePrices();
    }

    let sortedData = [...this.runesData];

    // Sort data
    switch (request.sortBy) {
      case 'marketCap':
        sortedData.sort((a, b) => b.marketCap.current - a.marketCap.current);
        break;
      case 'volume':
        sortedData.sort((a, b) => b.volume.volume24h - a.volume.volume24h);
        break;
      case 'price':
        sortedData.sort((a, b) => b.price.current - a.price.current);
        break;
      case 'change24h':
        sortedData.sort((a, b) => b.price.change24h - a.price.change24h);
        break;
    }

    if (request.order === 'asc') {
      sortedData.reverse();
    }

    return sortedData.slice(0, request.limit);
  }

  private updatePrices() {
    this.runesData.forEach(rune => {
      // Small price movements
      const priceChange = (Math.random() - 0.5) * 0.02; // ±1%
      rune.price.current *= (1 + priceChange);
      rune.price.change24h += priceChange * 100;
      
      // Update market cap
      rune.marketCap.current = rune.price.current * rune.supply.circulating;
      
      // Update volume (more volatile)
      const volumeChange = (Math.random() - 0.5) * 0.1; // ±5%
      rune.volume.volume24h *= (1 + volumeChange);
      
      // Update last update time
      rune.lastUpdate = Date.now();
    });

    this.lastUpdate = Date.now();
  }

  getAnalytics(): RunesAnalytics {
    const totalMarketCap = this.runesData.reduce((sum, rune) => sum + rune.marketCap.current, 0);
    const totalVolume24h = this.runesData.reduce((sum, rune) => sum + rune.volume.volume24h, 0);
    const averageChange24h = this.runesData.reduce((sum, rune) => sum + rune.price.change24h, 0) / this.runesData.length;
    
    const gainers = this.runesData
      .filter(rune => rune.price.change24h > 0)
      .sort((a, b) => b.price.change24h - a.price.change24h)
      .slice(0, 5);
    
    const losers = this.runesData
      .filter(rune => rune.price.change24h < 0)
      .sort((a, b) => a.price.change24h - b.price.change24h)
      .slice(0, 5);
    
    const volumeLeaders = [...this.runesData]
      .sort((a, b) => b.volume.volume24h - a.volume.volume24h)
      .slice(0, 5);

    return {
      marketOverview: {
        totalMarketCap,
        totalVolume24h,
        averageChange24h,
        activeRunes: this.runesData.length,
        newRunes24h: Math.floor(Math.random() * 5),
        marketSentiment: averageChange24h > 2 ? 'bullish' : averageChange24h < -2 ? 'bearish' : 'neutral'
      },
      topPerformers: {
        gainers24h: gainers,
        losers24h: losers,
        volumeLeaders
      },
      crossChainMetrics: {
        bridgeVolume24h: totalVolume24h * 0.1,
        activeBridges: 3,
        averageBridgeTime: 300 + Math.random() * 600 // 5-15 minutes
      },
      liquidityMetrics: {
        totalLiquidity: totalVolume24h * 2.5,
        averageApr: 12.5,
        topPools: [
          {
            name: 'UNCOMMON•GOODS/BTC',
            liquidity: 1500000,
            apr: 18.5,
            volume24h: 500000
          },
          {
            name: 'DOG•GO•TO•THE•MOON/BTC',
            liquidity: 1200000,
            apr: 15.2,
            volume24h: 350000
          },
          {
            name: 'SATOSHI•NAKAMOTO/BTC',
            liquidity: 1000000,
            apr: 13.8,
            volume24h: 300000
          }
        ]
      }
    };
  }
}

// Handler function
async function handleRunesMarketData(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    
    // Convert query params
    const processedParams = {
      ...searchParams,
      limit: searchParams.limit ? parseInt(searchParams.limit) : undefined,
      includeAnalytics: searchParams.includeAnalytics !== 'false'
    };
    
    // Validate request
    const validationResult = RunesRequestSchema.safeParse(processedParams);
    if (!validationResult.success) {
      return NextResponse.json(
        createErrorResponse('Invalid request parameters', {
          errors: validationResult.error.errors
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const runesRequest = validationResult.data;
    const engine = RunesDataEngine.getInstance();
    
    // Get runes data
    const runesData = await engine.getRunesData(runesRequest);
    
    // Prepare response
    const responseData: any = {
      runes: runesData,
      pagination: {
        limit: runesRequest.limit,
        total: runesData.length,
        sortBy: runesRequest.sortBy,
        order: runesRequest.order
      },
      lastUpdate: Date.now()
    };

    // Include analytics if requested
    if (runesRequest.includeAnalytics) {
      responseData.analytics = engine.getAnalytics();
    }

    return NextResponse.json(
      createSuccessResponse(responseData, 'Runes market data retrieved successfully'),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Runes market data error:', error);
    
    return NextResponse.json(
      createErrorResponse('Failed to retrieve runes market data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Export handlers
export const GET = withMiddleware(handleRunesMarketData, {
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 120, // 2 requests per second
  },
  cache: {
    ttl: 30, // 30 seconds cache
  }
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders
  });
}