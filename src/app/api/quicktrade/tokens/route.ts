import { NextRequest, NextResponse } from 'next/server';
import { dexAggregator } from '@/services/dexAggregator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainIdParam = searchParams.get('chainId');
    
    // Default to Ethereum if no chain specified
    const chainId = chainIdParam ? parseInt(chainIdParam) : 1;

    // Validate chain ID
    const supportedChains = [1, 137, 56, 43114, 42161, 10, 8453];
    if (!supportedChains.includes(chainId)) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}. Supported: ${supportedChains.join(', ')}` },
        { status: 400 }
      );
    }

    // Get token list from DEX aggregator
    const tokens = await dexAggregator.getTokenList(chainId);

    return NextResponse.json({
      success: true,
      data: {
        chainId,
        tokens,
        count: tokens.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting token list:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get token list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}