import { NextRequest, NextResponse } from 'next/server';
import { FEE_RECIPIENTS, REVENUE_MONITORING } from '@/config/feeRecipients';
import { RevenueDataV3, DailyRevenueV3, TopTrader } from '@/types/quickTrade';

// Mock revenue data for demo - In production, fetch from database
const generateMockRevenue = (): RevenueDataV3 => {
  const chains = ['1', '42161', '10', '137', '8453', '43114', '56', 'solana'];
  const chainNames: Record<string, string> = {
    '1': 'ETH',
    '42161': 'ETH',
    '10': 'ETH',
    '137': 'MATIC',
    '8453': 'ETH',
    '43114': 'AVAX',
    '56': 'BNB',
    'solana': 'SOL'
  };

  const totalCollected: Record<string, { native: string; usd: number; tokenSymbol: string }> = {};
  let totalUSD = 0;
  let transactionCount = 0;

  // Generate revenue data for each chain
  chains.forEach(chainId => {
    const nativeAmount = (Math.random() * 10).toFixed(4);
    const usdValue = parseFloat(nativeAmount) * 
      (chainId === '1' || chainId === '42161' || chainId === '10' || chainId === '8453' ? 2850 :
       chainId === '137' ? 0.8 :
       chainId === '43114' ? 25 :
       chainId === '56' ? 320 :
       95); // SOL

    totalCollected[chainId] = {
      native: nativeAmount,
      usd: usdValue,
      tokenSymbol: chainNames[chainId]
    };
    totalUSD += usdValue;
    transactionCount += Math.floor(Math.random() * 100) + 50;
  });

  // Generate daily revenue for last 30 days
  const dailyRevenue: DailyRevenueV3[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dayRevenue: DailyRevenueV3 = {
      date: date.toISOString().split('T')[0],
      revenueUSD: Math.random() * 5000 + 1000,
      transactionCount: Math.floor(Math.random() * 200) + 50,
      uniqueUsers: Math.floor(Math.random() * 150) + 30,
      chains: {},
      topDEXs: []
    };

    // Add chain distribution
    chains.forEach(chainId => {
      dayRevenue.chains[chainId] = {
        revenueUSD: Math.random() * 1000,
        transactionCount: Math.floor(Math.random() * 50) + 5,
        avgTransactionSize: Math.random() * 1000 + 100
      };
    });

    // Add top DEXs
    const dexs = ['UNISWAP_V3', 'JUPITER', 'PANCAKESWAP', 'ORCA', 'SUSHISWAP'];
    dexs.forEach(dex => {
      dayRevenue.topDEXs.push({
        dex: dex as any,
        volume: Math.random() * 100000 + 10000,
        feeCollected: Math.random() * 500 + 50
      });
    });

    dailyRevenue.push(dayRevenue);
  }

  // Generate top traders
  const topTraders: TopTrader[] = [];
  for (let i = 0; i < 10; i++) {
    topTraders.push({
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      totalVolumeUSD: Math.random() * 100000 + 10000,
      totalFeesUSD: Math.random() * 500 + 50,
      transactionCount: Math.floor(Math.random() * 100) + 10,
      favoriteChain: chains[Math.floor(Math.random() * chains.length)],
      favoriteDEX: 'UNISWAP_V3' as any
    });
  }

  return {
    totalCollected,
    totalUSD,
    transactionCount,
    averageFeeUSD: totalUSD / transactionCount,
    successRate: 0.995, // 99.5%
    lastUpdated: Date.now(),
    dailyRevenue,
    topTraders
  };
};

// Check if user is admin
const isAdmin = (walletAddress: string | null): boolean => {
  if (!walletAddress) return false;
  return REVENUE_MONITORING.ADMIN_WALLETS.includes(walletAddress.toLowerCase());
};

export async function GET(request: NextRequest) {
  try {
    // Get wallet address from query params or headers
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('wallet') || 
                         request.headers.get('x-wallet-address');

    // Check admin access
    if (!isAdmin(walletAddress)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Generate revenue data
    const revenueData = generateMockRevenue();

    // Add additional analytics
    const analytics = {
      successRate: revenueData.successRate,
      avgTransactionTime: '45 seconds',
      mostActiveChain: Object.entries(revenueData.totalCollected)
        .sort(([,a], [,b]) => b.usd - a.usd)[0][0],
      peakHour: '14:00 UTC',
      totalVolume30d: revenueData.dailyRevenue.reduce((sum, day) => 
        sum + day.revenueUSD * 2000, 0), // Estimate volume from fees
      growth30d: '+23.5%',
      projectedMonthlyRevenue: revenueData.totalUSD * 30,
      feeRecipients: {
        evm: FEE_RECIPIENTS.EVM,
        solana: FEE_RECIPIENTS.SOLANA
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        revenue: revenueData,
        analytics,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Revenue API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch revenue data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get wallet address and action
    const body = await request.json();
    const { wallet, action, params } = body;

    // Check admin access
    if (!isAdmin(wallet)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Handle different admin actions
    switch (action) {
      case 'export':
        // Export revenue data
        const exportData = {
          format: params?.format || 'csv',
          dateRange: params?.dateRange || 'last30days',
          data: generateMockRevenue(),
          exportedAt: new Date().toISOString(),
          exportedBy: wallet
        };
        
        return NextResponse.json({
          success: true,
          data: exportData,
          message: 'Revenue data exported successfully'
        });

      case 'withdraw':
        // Process withdrawal (mock)
        const withdrawalAmount = params?.amount || 0;
        const withdrawalChain = params?.chain || 'ethereum';
        
        if (withdrawalAmount < REVENUE_MONITORING.MIN_WITHDRAWAL[withdrawalChain as keyof typeof REVENUE_MONITORING.MIN_WITHDRAWAL]) {
          return NextResponse.json(
            { error: `Minimum withdrawal amount not met for ${withdrawalChain}` },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            withdrawalId: `wd_${Date.now()}`,
            amount: withdrawalAmount,
            chain: withdrawalChain,
            status: 'processing',
            estimatedTime: '10-30 minutes',
            destinationWallet: wallet
          },
          message: 'Withdrawal initiated successfully'
        });

      case 'distribute':
        // Distribute revenue according to preset percentages
        const totalToDistribute = params?.amount || 0;
        const distribution = Object.entries(REVENUE_MONITORING.DISTRIBUTION).map(([category, percentage]) => ({
          category,
          percentage: percentage * 100,
          amount: totalToDistribute * percentage
        }));

        return NextResponse.json({
          success: true,
          data: {
            distributionId: `dist_${Date.now()}`,
            totalAmount: totalToDistribute,
            distribution,
            status: 'pending_approval',
            initiatedBy: wallet
          },
          message: 'Distribution proposal created'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Revenue POST Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}