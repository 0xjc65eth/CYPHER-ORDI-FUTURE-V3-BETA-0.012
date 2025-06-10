import { NextRequest, NextResponse } from 'next/server';

// Mock UTXO data for on-chain metrics
// In production, this would fetch from blockchain data providers
export async function GET(request: NextRequest) {
  try {
    // Generate mock UTXO set data
    const outputs = [];
    const currentPrice = 62000;
    
    // Generate a realistic UTXO distribution
    for (let i = 0; i < 1000; i++) {
      const age = Math.floor(Math.random() * 365); // Days
      const createdPrice = currentPrice * (0.5 + Math.random() * 0.8); // Historical prices
      const value = Math.random() * 10; // BTC amount
      const isSpent = Math.random() > 0.6; // 40% unspent
      
      outputs.push({
        value,
        createdPrice,
        spentPrice: isSpent ? currentPrice * (0.9 + Math.random() * 0.2) : undefined,
        age,
        isSpent
      });
    }
    
    const utxoData = {
      outputs,
      totalSupply: 21000000,
      circulatingSupply: 19600000,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(utxoData);
  } catch (error) {
    console.error('Error fetching UTXO data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch UTXO data' },
      { status: 500 }
    );
  }
}