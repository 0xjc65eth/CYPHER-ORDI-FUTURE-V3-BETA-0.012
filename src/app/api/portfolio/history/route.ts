import { NextRequest, NextResponse } from 'next/server';
import { bitcoinAddressSchema } from '@/lib/validation/schemas';
import { cacheInstances } from '@/lib/cache/advancedCache';
import { applyRateLimit, apiRateLimiters } from '@/lib/api/middleware/rateLimiter';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, apiRateLimiters.portfolio);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // 'all', 'buy', 'sell', 'mint', etc.

    if (!address) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Address parameter is required' 
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
          error: 'Invalid Bitcoin address format' 
        },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `portfolio-history:${address}:${limit}:${offset}:${type || 'all'}`;
    let historyData = await cacheInstances.portfolio.get(cacheKey);

    if (!historyData) {
      historyData = await fetchPortfolioHistory(address, limit, offset, type);
      
      // Cache for 5 minutes
      await cacheInstances.portfolio.set(cacheKey, historyData, {
        ttl: 300,
        tags: ['portfolio', 'history', address]
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      address,
      data: historyData,
      pagination: {
        limit,
        offset,
        total: historyData.total,
        hasMore: (offset + limit) < historyData.total
      }
    });

  } catch (error) {
    console.error('Portfolio history API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio history',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchPortfolioHistory(
  address: string, 
  limit: number, 
  offset: number, 
  type?: string | null
) {
  // Mock transaction history - in production, this would query the database
  const allTransactions = [
    {
      id: 'tx_001',
      type: 'buy',
      asset: 'BTC',
      assetType: 'bitcoin',
      amount: 0.5,
      price: 95000,
      value: 47500,
      fee: 25,
      timestamp: new Date('2024-01-15T10:30:00Z'),
      txHash: 'abc123def456...',
      status: 'confirmed',
      blockHeight: 825000,
      from: null,
      to: address,
      metadata: {
        exchange: 'binance',
        orderType: 'market'
      }
    },
    {
      id: 'tx_002',
      type: 'mint',
      asset: 'SATOSHI•NAKAMOTO',
      assetType: 'rune',
      amount: 1000000,
      price: 0.005,
      value: 5000,
      fee: 50,
      timestamp: new Date('2024-01-14T15:45:00Z'),
      txHash: 'def456ghi789...',
      status: 'confirmed',
      blockHeight: 824900,
      from: null,
      to: address,
      metadata: {
        runeId: '2:1',
        mintingBlock: 824900
      }
    },
    {
      id: 'tx_003',
      type: 'buy',
      asset: 'Bitcoin Punk #1234',
      assetType: 'ordinal',
      amount: 1,
      price: 15000,
      value: 15000,
      fee: 100,
      timestamp: new Date('2024-01-12T09:20:00Z'),
      txHash: 'ghi789jkl012...',
      status: 'confirmed',
      blockHeight: 824800,
      from: 'bc1qselleraddress...',
      to: address,
      metadata: {
        inscriptionId: 'abc123def456',
        marketplace: 'magiceden',
        collectionName: 'Bitcoin Punks'
      }
    },
    {
      id: 'tx_004',
      type: 'receive',
      asset: 'ORDI',
      assetType: 'brc20',
      amount: 500,
      price: 25,
      value: 12500,
      fee: 0,
      timestamp: new Date('2024-01-10T14:30:00Z'),
      txHash: 'jkl012mno345...',
      status: 'confirmed',
      blockHeight: 824700,
      from: 'bc1qsenderaddress...',
      to: address,
      metadata: {
        tokenStandard: 'BRC-20',
        transferReason: 'gift'
      }
    },
    {
      id: 'tx_005',
      type: 'sell',
      asset: 'PEPE',
      assetType: 'brc20',
      amount: 1000,
      price: 0.5,
      value: 500,
      fee: 15,
      timestamp: new Date('2024-01-08T11:15:00Z'),
      txHash: 'mno345pqr678...',
      status: 'confirmed',
      blockHeight: 824600,
      from: address,
      to: 'bc1qbuyeraddress...',
      metadata: {
        tokenStandard: 'BRC-20',
        marketplace: 'unisat'
      }
    }
  ];

  // Filter by type if specified
  let filteredTransactions = allTransactions;
  if (type && type !== 'all') {
    filteredTransactions = allTransactions.filter(tx => tx.type === type);
  }

  // Sort by timestamp (newest first)
  filteredTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Apply pagination
  const total = filteredTransactions.length;
  const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

  // Calculate summary statistics
  const summary = {
    totalTransactions: total,
    totalValue: filteredTransactions.reduce((sum, tx) => sum + tx.value, 0),
    totalFees: filteredTransactions.reduce((sum, tx) => sum + tx.fee, 0),
    typeDistribution: getTypeDistribution(filteredTransactions),
    assetDistribution: getAssetDistribution(filteredTransactions),
    timeRange: {
      earliest: filteredTransactions[filteredTransactions.length - 1]?.timestamp || null,
      latest: filteredTransactions[0]?.timestamp || null
    }
  };

  return {
    transactions: paginatedTransactions,
    total,
    summary
  };
}

function getTypeDistribution(transactions: any[]) {
  const distribution: Record<string, number> = {};
  transactions.forEach(tx => {
    distribution[tx.type] = (distribution[tx.type] || 0) + 1;
  });
  return distribution;
}

function getAssetDistribution(transactions: any[]) {
  const distribution: Record<string, { count: number; value: number }> = {};
  transactions.forEach(tx => {
    if (!distribution[tx.asset]) {
      distribution[tx.asset] = { count: 0, value: 0 };
    }
    distribution[tx.asset].count += 1;
    distribution[tx.asset].value += tx.value;
  });
  return distribution;
}