import { NextRequest, NextResponse } from 'next/server';

// Mock mining data for on-chain metrics
// In production, this would fetch from mining pools and blockchain data
export async function GET(request: NextRequest) {
  try {
    // Current network statistics
    const currentHashrate = 450 * 1e18; // 450 EH/s
    const currentDifficulty = 73197634206448.38;
    const blockReward = 6.25; // BTC per block
    const btcPrice = 62000;
    const blocksPerDay = 144;
    
    // Calculate miner revenue
    const dailyBtcMined = blockReward * blocksPerDay;
    const dailyRevenue = dailyBtcMined * btcPrice;
    
    // Generate historical data for 365-day MA
    const historicalRevenues = [];
    for (let i = 0; i < 365; i++) {
      const historicalPrice = btcPrice * (0.5 + Math.random() * 0.8);
      const historicalRevenue = dailyBtcMined * historicalPrice;
      historicalRevenues.push(historicalRevenue);
    }
    
    const minerRevenue365MA = historicalRevenues.reduce((a, b) => a + b, 0) / 365;
    
    const miningData = {
      hashrate: currentHashrate,
      difficulty: currentDifficulty,
      blockReward,
      minerRevenue: dailyRevenue,
      minerRevenue365MA,
      totalMinedCoins: 19600000,
      blocksFound: blocksPerDay,
      networkStats: {
        blocksToday: Math.floor(Math.random() * 10) + 135,
        avgBlockTime: 600 + Math.random() * 60 - 30, // 10 min ± 30s
        mempoolSize: Math.floor(Math.random() * 50000) + 10000,
        feeRate: Math.floor(Math.random() * 50) + 10 // sats/vbyte
      },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(miningData);
  } catch (error) {
    console.error('Error fetching mining data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mining data' },
      { status: 500 }
    );
  }
}