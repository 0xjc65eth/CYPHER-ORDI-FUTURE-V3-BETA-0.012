import { NextRequest, NextResponse } from 'next/server';
import { portfolioDataSchema, bitcoinAddressSchema } from '@/lib/validation/schemas';
import { cacheInstances } from '@/lib/cache/advancedCache';
import { applyRateLimit, apiRateLimiters } from '@/lib/api/middleware/rateLimiter';
import { hiroAPI } from '@/lib/api/hiro';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, apiRateLimiters.portfolio);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Address parameter is required',
          message: 'Please provide a valid Bitcoin address'
        },
        { status: 400 }
      );
    }

    // Validate Bitcoin address
    const addressValidation = bitcoinAddressSchema.safeParse(address);
    if (!addressValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Bitcoin address format',
          message: 'Please provide a valid Bitcoin address'
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `portfolio:${address}`;
    let portfolioData = await cacheInstances.portfolio.get(cacheKey);

    if (!portfolioData) {
      // Fetch fresh data from multiple sources
      portfolioData = await fetchPortfolioData(address);
      
      // Cache the result
      await cacheInstances.portfolio.set(cacheKey, portfolioData, {
        ttl: 300, // 5 minutes
        tags: ['portfolio', 'user', address]
      });
    }

    // Validate the data structure
    const validation = portfolioDataSchema.safeParse(portfolioData);
    if (!validation.success) {
      console.error('Portfolio data validation failed:', validation.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid portfolio data structure',
          message: 'Failed to validate portfolio data'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      address,
      data: portfolioData,
      metadata: {
        cached: !!portfolioData,
        source: 'cypher-ai-v3'
      }
    });

  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio data',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, apiRateLimiters.portfolio);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const { address, asset, action, amount, price } = body;

    // Validate required fields
    if (!address || !asset || !action || !amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields',
          message: 'Address, asset, action, and amount are required'
        },
        { status: 400 }
      );
    }

    // Validate Bitcoin address
    const addressValidation = bitcoinAddressSchema.safeParse(address);
    if (!addressValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Bitcoin address format',
          message: 'Please provide a valid Bitcoin address'
        },
        { status: 400 }
      );
    }

    // Process the portfolio update
    const transactionId = await processPortfolioUpdate({
      address,
      asset,
      action,
      amount,
      price: price || 0,
      timestamp: new Date()
    });

    // Invalidate cache for this address
    await cacheInstances.portfolio.delete(`portfolio:${address}`);

    return NextResponse.json({
      success: true,
      message: 'Portfolio updated successfully',
      transactionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Portfolio update API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update portfolio',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

async function fetchPortfolioData(address: string) {
  try {
    // Fetch data from multiple sources in parallel
    const [
      hiroData,
      bitcoinBalance,
      transactions
    ] = await Promise.allSettled([
      hiroAPI.getPortfolio(address),
      fetchBitcoinBalance(address),
      fetchTransactionHistory(address)
    ]);

    // Process Hiro data
    const portfolio = hiroData.status === 'fulfilled' ? hiroData.value : null;
    const btcBalance = bitcoinBalance.status === 'fulfilled' ? bitcoinBalance.value : 0;
    const txHistory = transactions.status === 'fulfilled' ? transactions.value : [];

    // Build portfolio data structure
    const assets = [];
    let totalValue = 0;

    // Add Bitcoin asset
    if (btcBalance > 0) {
      const btcPrice = await getCurrentBitcoinPrice();
      const btcValue = btcBalance * btcPrice;
      
      assets.push({
        id: 'bitcoin',
        type: 'bitcoin' as const,
        name: 'Bitcoin',
        symbol: 'BTC',
        balance: btcBalance,
        value: btcValue,
        price: btcPrice,
        change24h: await getBitcoinChange24h(),
        allocation: 0, // Will be calculated later
        metadata: {}
      });
      
      totalValue += btcValue;
    }

    // Add Ordinals
    if (portfolio?.inscriptions?.results) {
      for (const inscription of portfolio.inscriptions.results.slice(0, 10)) {
        const value = await getInscriptionValue(inscription.id);
        assets.push({
          id: inscription.id,
          type: 'ordinal' as const,
          name: `Inscription #${inscription.number}`,
          symbol: 'ORD',
          balance: 1,
          value: value,
          price: value,
          change24h: 0,
          allocation: 0,
          metadata: {
            inscriptionId: inscription.id,
            contentType: inscription.content_type,
            rarity: inscription.sat_rarity
          }
        });
        totalValue += value;
      }
    }

    // Add Runes
    if (portfolio?.runes) {
      for (const rune of portfolio.runes.slice(0, 10)) {
        const price = await getRunePrice(rune.rune.name);
        const balance = parseInt(rune.balance);
        const value = balance * price;
        
        assets.push({
          id: rune.rune.id,
          type: 'rune' as const,
          name: rune.rune.spaced_name,
          symbol: rune.rune.symbol || rune.rune.name.substring(0, 4).toUpperCase(),
          balance: balance,
          value: value,
          price: price,
          change24h: 0,
          allocation: 0,
          metadata: {
            runeId: rune.rune.id,
            tokenStandard: 'RUNES'
          }
        });
        totalValue += value;
      }
    }

    // Add BRC-20 tokens
    if (portfolio?.brc20) {
      for (const token of portfolio.brc20.slice(0, 10)) {
        const price = await getBRC20Price(token.ticker);
        const balance = parseFloat(token.balance);
        const value = balance * price;
        
        assets.push({
          id: token.ticker,
          type: 'brc20' as const,
          name: token.ticker,
          symbol: token.ticker,
          balance: balance,
          value: value,
          price: price,
          change24h: 0,
          allocation: 0,
          metadata: {
            tokenStandard: 'BRC-20'
          }
        });
        totalValue += value;
      }
    }

    // Calculate allocations
    assets.forEach(asset => {
      asset.allocation = totalValue > 0 ? (asset.value / totalValue) * 100 : 0;
    });

    // Calculate performance metrics
    const performance = await calculatePerformance(address, assets);

    return {
      totalValue,
      totalCost: totalValue * 0.85, // Mock cost basis
      totalPnL: totalValue * 0.15, // Mock P&L
      totalPnLPercent: 17.65, // Mock P&L percentage
      assets,
      transactions: txHistory,
      performance
    };

  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    throw new Error('Failed to fetch portfolio data');
  }
}

async function fetchBitcoinBalance(address: string): Promise<number> {
  try {
    // This would integrate with a Bitcoin node or API
    // For now, return mock data
    return Math.random() * 10;
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error);
    return 0;
  }
}

async function fetchTransactionHistory(address: string) {
  try {
    // This would fetch actual transaction history
    // For now, return mock data
    return [
      {
        id: `tx_${Date.now()}`,
        type: 'buy' as const,
        asset: 'BTC',
        amount: 0.1,
        price: 98000,
        value: 9800,
        fee: 50,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        txHash: `${Math.random().toString(36).substring(7)}`,
        status: 'confirmed' as const
      }
    ];
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}

async function getCurrentBitcoinPrice(): Promise<number> {
  try {
    // Check cache first
    const cachedPrice = await cacheInstances.prices.get('btc-price');
    if (cachedPrice) {
      return cachedPrice;
    }

    // Fetch from API (mock for now)
    const price = 98000 + (Math.random() - 0.5) * 2000;
    
    // Cache for 5 seconds
    await cacheInstances.prices.set('btc-price', price, {
      ttl: 5,
      tags: ['price', 'bitcoin']
    });
    
    return price;
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return 98000; // Fallback price
  }
}

async function getBitcoinChange24h(): Promise<number> {
  return (Math.random() - 0.5) * 10; // Mock 24h change
}

async function getInscriptionValue(inscriptionId: string): Promise<number> {
  return Math.random() * 50000; // Mock inscription value
}

async function getRunePrice(runeName: string): Promise<number> {
  return Math.random() * 0.01; // Mock rune price
}

async function getBRC20Price(ticker: string): Promise<number> {
  return Math.random() * 100; // Mock BRC-20 price
}

async function calculatePerformance(address: string, assets: any[]) {
  return {
    '24h': (Math.random() - 0.5) * 10,
    '7d': (Math.random() - 0.5) * 20,
    '30d': (Math.random() - 0.5) * 50,
    '90d': (Math.random() - 0.5) * 100,
    '1y': (Math.random() - 0.5) * 300
  };
}

async function processPortfolioUpdate(update: {
  address: string;
  asset: string;
  action: string;
  amount: number;
  price: number;
  timestamp: Date;
}): Promise<string> {
  // This would process the portfolio update in the database
  // For now, just return a mock transaction ID
  return `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}