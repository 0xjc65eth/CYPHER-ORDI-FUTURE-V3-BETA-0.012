import { NextRequest, NextResponse } from 'next/server';
import { cacheInstances } from '@/lib/cache/advancedCache';
import { applyRateLimit, apiRateLimiters } from '@/lib/api/middleware/rateLimiter';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, apiRateLimiters.prices);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const assets = searchParams.get('assets')?.split(',') || [];
    const currency = searchParams.get('currency') || 'USD';

    if (assets.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Assets parameter is required',
          message: 'Please provide comma-separated list of asset symbols'
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `portfolio-prices:${assets.join(',')}:${currency}`;
    let priceData = await cacheInstances.prices.get(cacheKey);

    if (!priceData) {
      priceData = await fetchAssetPrices(assets, currency);
      
      // Cache for 5 seconds (real-time pricing)
      await cacheInstances.prices.set(cacheKey, priceData, {
        ttl: 5,
        tags: ['prices', 'portfolio', 'market']
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      currency,
      data: priceData,
      metadata: {
        cached: !!priceData,
        nextUpdate: new Date(Date.now() + 5000).toISOString()
      }
    });

  } catch (error) {
    console.error('Portfolio prices API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch asset prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, apiRateLimiters.prices);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const { assets, currency = 'USD', includeChange = true, includeVolume = false } = body;

    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Assets array is required' 
        },
        { status: 400 }
      );
    }

    const priceData = await fetchDetailedAssetPrices(assets, {
      currency,
      includeChange,
      includeVolume
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      currency,
      data: priceData
    });

  } catch (error) {
    console.error('Portfolio detailed prices API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch detailed asset prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchAssetPrices(assets: string[], currency: string) {
  const prices: Record<string, any> = {};

  // Mock price data - in production, this would fetch from multiple APIs
  const basePrices: Record<string, number> = {
    'BTC': 98000,
    'ETH': 3500,
    'ORDI': 25,
    'SATS': 0.0008,
    'PEPE': 0.5,
    'BITCOIN-PUNK': 15000,
    'SATOSHI•NAKAMOTO': 0.0085,
    'DOG•GO•TO•THE•MOON': 0.012,
    'UNCOMMON•GOODS': 0.003
  };

  for (const asset of assets) {
    const basePrice = basePrices[asset.toUpperCase()] || Math.random() * 1000;
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const currentPrice = basePrice * (1 + variation);
    
    const change24h = (Math.random() - 0.5) * 20; // ±10% daily change
    const volume24h = Math.random() * 1000000; // Random volume

    prices[asset] = {
      symbol: asset,
      price: currentPrice,
      currency,
      change24h,
      change24hPercent: (change24h / basePrice) * 100,
      volume24h,
      marketCap: currentPrice * Math.random() * 21000000, // Mock market cap
      high24h: currentPrice * (1 + Math.random() * 0.1),
      low24h: currentPrice * (1 - Math.random() * 0.1),
      lastUpdated: new Date().toISOString()
    };
  }

  return prices;
}

async function fetchDetailedAssetPrices(
  assets: string[], 
  options: {
    currency: string;
    includeChange: boolean;
    includeVolume: boolean;
  }
) {
  const detailedPrices: Record<string, any> = {};

  for (const asset of assets) {
    const basicPrice = await fetchSingleAssetPrice(asset, options.currency);
    
    detailedPrices[asset] = {
      ...basicPrice,
      sparkline: options.includeChange ? generateSparklineData() : undefined,
      volumeProfile: options.includeVolume ? generateVolumeProfile() : undefined,
      technicalIndicators: {
        rsi: Math.random() * 100,
        macd: {
          macd: (Math.random() - 0.5) * 100,
          signal: (Math.random() - 0.5) * 100,
          histogram: (Math.random() - 0.5) * 50
        },
        bollinger: {
          upper: basicPrice.price * 1.1,
          middle: basicPrice.price,
          lower: basicPrice.price * 0.9
        }
      },
      sentiment: {
        score: Math.random() * 100,
        sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
        confidence: Math.random() * 100
      }
    };
  }

  return detailedPrices;
}

async function fetchSingleAssetPrice(asset: string, currency: string) {
  // This would integrate with actual price APIs
  // For now, return mock data with realistic structure
  
  const basePrice = Math.random() * 1000 + 100;
  const change24h = (Math.random() - 0.5) * 20;
  
  return {
    symbol: asset,
    name: getAssetName(asset),
    price: basePrice,
    currency,
    change24h,
    change24hPercent: (change24h / basePrice) * 100,
    volume24h: Math.random() * 1000000,
    marketCap: basePrice * Math.random() * 21000000,
    circulatingSupply: Math.random() * 21000000,
    totalSupply: Math.random() * 21000000,
    high24h: basePrice * (1 + Math.random() * 0.1),
    low24h: basePrice * (1 - Math.random() * 0.1),
    ath: basePrice * (1 + Math.random() * 2),
    atl: basePrice * (1 - Math.random() * 0.8),
    lastUpdated: new Date().toISOString()
  };
}

function getAssetName(symbol: string): string {
  const names: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'ORDI': 'Ordinals',
    'SATS': 'Satoshis',
    'PEPE': 'Pepe Token',
    'BITCOIN-PUNK': 'Bitcoin Punks',
    'SATOSHI•NAKAMOTO': 'Satoshi Nakamoto Rune',
    'DOG•GO•TO•THE•MOON': 'Dog Go To The Moon',
    'UNCOMMON•GOODS': 'Uncommon Goods'
  };
  
  return names[symbol.toUpperCase()] || symbol;
}

function generateSparklineData(): number[] {
  const points = 24; // 24 hours of hourly data
  const sparkline: number[] = [];
  let currentPrice = 100;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 5; // ±2.5% hourly change
    currentPrice *= (1 + change / 100);
    sparkline.push(Number(currentPrice.toFixed(2)));
  }
  
  return sparkline;
}

function generateVolumeProfile(): Array<{ price: number; volume: number }> {
  const profile: Array<{ price: number; volume: number }> = [];
  const basePrice = 100;
  
  for (let i = 0; i < 20; i++) {
    profile.push({
      price: basePrice * (0.9 + (i / 20) * 0.2), // Price range ±10%
      volume: Math.random() * 1000000
    });
  }
  
  return profile.sort((a, b) => b.volume - a.volume);
}