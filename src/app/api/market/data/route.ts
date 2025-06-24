import { NextRequest, NextResponse } from 'next/server';
import { marketDataSchema } from '@/lib/validation/schemas';
import { cacheInstances } from '@/lib/cache/advancedCache';
import { applyRateLimit, apiRateLimiters } from '@/lib/api/middleware/rateLimiter';
import { coinMarketCapService } from '@/services/CoinMarketCapService';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, apiRateLimiters.market);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all'; // crypto, ordinals, runes, brc20
    const limit = parseInt(searchParams.get('limit') || '100');
    const sortBy = searchParams.get('sort') || 'market_cap'; // market_cap, volume, price, change
    const timeframe = searchParams.get('timeframe') || '24h'; // 1h, 24h, 7d, 30d

    // Check cache first
    const cacheKey = `market-data:${category}:${limit}:${sortBy}:${timeframe}`;
    let marketData = await cacheInstances.market.get(cacheKey);

    if (!marketData) {
      marketData = await fetchMarketData({
        category,
        limit,
        sortBy,
        timeframe
      });
      
      // Cache for 30 seconds
      await cacheInstances.market.set(cacheKey, marketData, {
        ttl: 30,
        tags: ['market', 'data', category]
      });
    }

    // Validate data structure
    const validation = marketDataSchema.safeParse(marketData);
    if (!validation.success) {
      console.error('Market data validation failed:', validation.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid market data structure' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: marketData,
      filters: {
        category,
        limit,
        sortBy,
        timeframe
      },
      metadata: {
        cached: !!marketData,
        nextUpdate: new Date(Date.now() + 30000).toISOString()
      }
    });

  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchMarketData(options: {
  category: string;
  limit: number;
  sortBy: string;
  timeframe: string;
}) {
  try {
    // Fetch data from multiple sources
    const [cryptoData, bitcoinEcosystem, globalMetrics] = await Promise.allSettled([
      fetchCryptoMarketData(options),
      fetchBitcoinEcosystemData(options),
      fetchGlobalMarketMetrics()
    ]);

    // Process results
    const crypto = cryptoData.status === 'fulfilled' ? cryptoData.value : [];
    const ecosystem = bitcoinEcosystem.status === 'fulfilled' ? bitcoinEcosystem.value : [];
    const global = globalMetrics.status === 'fulfilled' ? globalMetrics.value : getDefaultGlobalMetrics();

    // Combine and filter data based on category
    let allTickers = [...crypto, ...ecosystem];
    
    if (options.category !== 'all') {
      allTickers = allTickers.filter(ticker => 
        ticker.category === options.category || 
        (options.category === 'crypto' && ['bitcoin', 'ethereum'].includes(ticker.category))
      );
    }

    // Sort data
    allTickers.sort((a, b) => {
      switch (options.sortBy) {
        case 'market_cap':
          return (b.marketCap || 0) - (a.marketCap || 0);
        case 'volume':
          return b.volume24h - a.volume24h;
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.change24h - a.change24h;
        default:
          return (b.marketCap || 0) - (a.marketCap || 0);
      }
    });

    // Limit results
    const limitedTickers = allTickers.slice(0, options.limit);

    // Get trending assets
    const trending = getTrendingAssets(allTickers, options.timeframe);

    return {
      tickers: limitedTickers,
      overview: global,
      trending
    };

  } catch (error) {
    console.error('Error fetching market data:', error);
    throw new Error('Failed to fetch market data');
  }
}

async function fetchCryptoMarketData(options: any) {
  try {
    // Fetch real data from CoinMarketCap
    const listings = await coinMarketCapService.getCryptocurrencyListings({
      limit: Math.min(options.limit || 100, 200),
      sort: 'market_cap',
      sort_dir: 'desc',
      convert: 'USD'
    });

    // Transform CMC data to our format
    const cryptoAssets = listings.map(crypto => {
      const usdQuote = crypto.quote.USD;
      return {
        symbol: crypto.symbol,
        name: crypto.name,
        category: crypto.symbol === 'BTC' ? 'bitcoin' : crypto.symbol === 'ETH' ? 'ethereum' : 'crypto',
        price: usdQuote.price,
        change24h: usdQuote.percent_change_24h,
        change24hPercent: usdQuote.percent_change_24h,
        volume24h: usdQuote.volume_24h,
        marketCap: usdQuote.market_cap,
        high24h: usdQuote.price * 1.02, // Estimate high/low since CMC doesn't provide 24h high/low in basic plan
        low24h: usdQuote.price * 0.98,
        timestamp: new Date(usdQuote.last_updated),
        id: crypto.id,
        rank: crypto.cmc_rank,
        circulatingSupply: crypto.circulating_supply,
        totalSupply: crypto.total_supply,
        maxSupply: crypto.max_supply
      };
    });

    return cryptoAssets;
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to fetch real crypto market data, falling back to mock data');
    // Fallback to basic mock data if API fails
    return [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        category: 'bitcoin',
        price: 98000,
        change24h: 2.5,
        change24hPercent: 2.5,
        volume24h: 15000000000,
        marketCap: 1900000000000,
        high24h: 99000,
        low24h: 97000,
        timestamp: new Date()
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        category: 'ethereum',
        price: 3500,
        change24h: 1.8,
        change24hPercent: 1.8,
        volume24h: 8000000000,
        marketCap: 420000000000,
        high24h: 3600,
        low24h: 3400,
        timestamp: new Date()
      }
    ];
  }
}

async function fetchBitcoinEcosystemData(options: any) {
  // Mock Bitcoin ecosystem data (Ordinals, Runes, BRC-20)
  const ecosystemAssets = [
    {
      symbol: 'ORDI',
      name: 'Ordinals',
      category: 'brc20',
      price: 25 + (Math.random() - 0.5) * 5,
      change24h: (Math.random() - 0.5) * 15,
      change24hPercent: (Math.random() - 0.5) * 10,
      volume24h: 5000000 + Math.random() * 2000000,
      marketCap: 500000000 + Math.random() * 100000000,
      high24h: 27,
      low24h: 23,
      timestamp: new Date()
    },
    {
      symbol: 'SATS',
      name: 'Satoshis',
      category: 'brc20',
      price: 0.0008 + (Math.random() - 0.5) * 0.0002,
      change24h: (Math.random() - 0.5) * 20,
      change24hPercent: (Math.random() - 0.5) * 15,
      volume24h: 2000000 + Math.random() * 1000000,
      marketCap: 168000000 + Math.random() * 20000000,
      high24h: 0.0009,
      low24h: 0.0007,
      timestamp: new Date()
    },
    {
      symbol: 'SATOSHI•NAKAMOTO',
      name: 'Satoshi Nakamoto Rune',
      category: 'runes',
      price: 0.0085 + (Math.random() - 0.5) * 0.002,
      change24h: (Math.random() - 0.5) * 25,
      change24hPercent: (Math.random() - 0.5) * 20,
      volume24h: 1500000 + Math.random() * 500000,
      marketCap: 85000000 + Math.random() * 10000000,
      high24h: 0.0095,
      low24h: 0.0075,
      timestamp: new Date()
    },
    {
      symbol: 'DOG•GO•TO•THE•MOON',
      name: 'Dog Go To The Moon',
      category: 'runes',
      price: 0.012 + (Math.random() - 0.5) * 0.003,
      change24h: (Math.random() - 0.5) * 30,
      change24hPercent: (Math.random() - 0.5) * 25,
      volume24h: 800000 + Math.random() * 400000,
      marketCap: 24000000 + Math.random() * 5000000,
      high24h: 0.014,
      low24h: 0.010,
      timestamp: new Date()
    },
    {
      symbol: 'BITCOIN-PUNKS',
      name: 'Bitcoin Punks Collection',
      category: 'ordinals',
      price: 15000 + (Math.random() - 0.5) * 3000,
      change24h: (Math.random() - 0.5) * 12,
      change24hPercent: (Math.random() - 0.5) * 8,
      volume24h: 3000000 + Math.random() * 1000000,
      marketCap: 150000000 + Math.random() * 30000000,
      high24h: 16000,
      low24h: 14000,
      timestamp: new Date()
    }
  ];

  return ecosystemAssets;
}

async function fetchGlobalMarketMetrics() {
  try {
    // Fetch real global metrics from CoinMarketCap
    const globalData = await coinMarketCapService.getGlobalMetrics('USD');
    const usdQuote = globalData.quote.USD;
    
    return {
      totalMarketCap: usdQuote.total_market_cap,
      totalVolume24h: usdQuote.total_volume_24h,
      btcDominance: globalData.btc_dominance,
      totalSupply: 21000000, // Bitcoin total supply
      activeCurrencies: globalData.active_cryptocurrencies,
      defiMarketCap: globalData.defi_market_cap,
      defiVolume24h: globalData.defi_volume_24h,
      stablecoinMarketCap: globalData.stablecoin_market_cap,
      stablecoinVolume24h: globalData.stablecoin_volume_24h,
      ethDominance: globalData.eth_dominance,
      lastUpdated: globalData.last_updated
    };
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to fetch real global metrics, falling back to mock data');
    // Fallback to mock data if API fails
    return {
      totalMarketCap: 2500000000000,
      totalVolume24h: 50000000000,
      btcDominance: 52,
      totalSupply: 21000000,
      activeCurrencies: 15000
    };
  }
}

function getDefaultGlobalMetrics() {
  return {
    totalMarketCap: 2500000000000,
    totalVolume24h: 50000000000,
    btcDominance: 52,
    totalSupply: 21000000,
    activeCurrencies: 15000
  };
}

function getTrendingAssets(tickers: any[], timeframe: string) {
  // Sort by change percentage and return top movers
  const topGainers = [...tickers]
    .sort((a, b) => b.change24hPercent - a.change24hPercent)
    .slice(0, 5)
    .map(ticker => ({
      id: ticker.symbol.toLowerCase(),
      name: ticker.name,
      symbol: ticker.symbol,
      price: ticker.price,
      change24h: ticker.change24h,
      volume24h: ticker.volume24h
    }));

  return topGainers;
}