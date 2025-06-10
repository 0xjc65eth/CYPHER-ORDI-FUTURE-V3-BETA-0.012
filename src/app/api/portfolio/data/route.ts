import { NextRequest, NextResponse } from 'next/server';

interface PortfolioAsset {
  id: string;
  type: 'bitcoin' | 'ordinal' | 'rune' | 'brc20';
  name: string;
  symbol: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
  allocation: number;
  metadata?: {
    inscriptionId?: string;
    runeId?: string;
    tokenStandard?: string;
    collectionName?: string;
    rarity?: number;
  };
}

interface PortfolioTransaction {
  id: string;
  type: 'buy' | 'sell' | 'receive' | 'send' | 'mint' | 'burn';
  asset: string;
  amount: number;
  price: number;
  value: number;
  fee: number;
  timestamp: Date;
  txHash: string;
  status: 'confirmed' | 'pending' | 'failed';
  from?: string;
  to?: string;
}

interface PortfolioData {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  assets: PortfolioAsset[];
  transactions: PortfolioTransaction[];
  performance: {
    '24h': number;
    '7d': number;
    '30d': number;
    '90d': number;
    '1y': number;
  };
}

// Mock portfolio data generator
function generatePortfolioData(address: string): PortfolioData {
  const assets: PortfolioAsset[] = [
    {
      id: '1',
      type: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      balance: 0.5423,
      value: 53457.15,
      price: 98500,
      change24h: 2.34,
      allocation: 45.2,
      metadata: {}
    },
    {
      id: '2',
      type: 'ordinal',
      name: 'Bitcoin Punks #1234',
      symbol: 'PUNK',
      balance: 1,
      value: 15000,
      price: 15000,
      change24h: 12.5,
      allocation: 12.7,
      metadata: {
        inscriptionId: 'abc123def456',
        collectionName: 'Bitcoin Punks',
        rarity: 234
      }
    },
    {
      id: '3',
      type: 'rune',
      name: 'SATOSHI•NAKAMOTO',
      symbol: 'SATOSHI',
      balance: 1000000,
      value: 8500,
      price: 0.0085,
      change24h: -3.2,
      allocation: 7.2,
      metadata: {
        runeId: '2:1',
        tokenStandard: 'RUNES'
      }
    },
    {
      id: '4',
      type: 'brc20',
      name: 'ORDI',
      symbol: 'ORDI',
      balance: 500,
      value: 12500,
      price: 25,
      change24h: 5.7,
      allocation: 10.6,
      metadata: {
        tokenStandard: 'BRC-20'
      }
    },
    {
      id: '5',
      type: 'ordinal',
      name: 'Ordinal Maxi Biz #567',
      symbol: 'OMB',
      balance: 1,
      value: 8000,
      price: 8000,
      change24h: -2.1,
      allocation: 6.8,
      metadata: {
        inscriptionId: 'xyz789uvw012',
        collectionName: 'Ordinal Maxi Biz',
        rarity: 567
      }
    }
  ];

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalCost = totalValue * 0.85; // Mock 15% profit
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = (totalPnL / totalCost) * 100;

  const transactions: PortfolioTransaction[] = [
    {
      id: 't1',
      type: 'buy',
      asset: 'BTC',
      amount: 0.5423,
      price: 85000,
      value: 46095.5,
      fee: 50,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      txHash: 'tx123...',
      status: 'confirmed'
    },
    {
      id: 't2',
      type: 'buy',
      asset: 'PUNK',
      amount: 1,
      price: 12000,
      value: 12000,
      fee: 100,
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      txHash: 'tx456...',
      status: 'confirmed'
    },
    {
      id: 't3',
      type: 'mint',
      asset: 'SATOSHI',
      amount: 1000000,
      price: 0.005,
      value: 5000,
      fee: 25,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      txHash: 'tx789...',
      status: 'confirmed'
    }
  ];

  return {
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPercent,
    assets,
    transactions,
    performance: {
      '24h': 2.34,
      '7d': 8.76,
      '30d': 23.45,
      '90d': 45.67,
      '1y': 123.45
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Address parameter is required' 
        },
        { status: 400 }
      );
    }

    // Validate Bitcoin address format (basic validation)
    if (!address.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Bitcoin address format' 
        },
        { status: 400 }
      );
    }

    // Generate portfolio data (in production, this would fetch from blockchain/database)
    const portfolioData = generatePortfolioData(address);

    // Add some randomness to simulate real-time changes
    portfolioData.assets.forEach(asset => {
      asset.value = asset.value * (1 + (Math.random() - 0.5) * 0.01);
      asset.change24h = asset.change24h + (Math.random() - 0.5) * 0.5;
    });

    // Recalculate allocations
    const newTotalValue = portfolioData.assets.reduce((sum, asset) => sum + asset.value, 0);
    portfolioData.assets.forEach(asset => {
      asset.allocation = (asset.value / newTotalValue) * 100;
    });
    portfolioData.totalValue = newTotalValue;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      address,
      data: portfolioData
    });

  } catch (error) {
    console.error('Portfolio data API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, transaction } = body;

    if (!address || !transaction) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Address and transaction data are required' 
        },
        { status: 400 }
      );
    }

    // In production, this would save the transaction to database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Transaction recorded successfully',
      transactionId: `t${Date.now()}`
    });

  } catch (error) {
    console.error('Portfolio transaction API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record transaction',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}