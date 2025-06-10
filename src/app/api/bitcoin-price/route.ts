import { NextResponse } from 'next/server';
import { realDataService } from '@/services/realDataService';

export async function GET() {
  try {
    // Get real Bitcoin metrics
    const metrics = await realDataService.getBitcoinMetrics();
    
    return NextResponse.json({
      symbol: 'BTC/USD',
      price: metrics.price,
      change24h: metrics.priceChange24h,
      volume24h: metrics.volume24h,
      marketCap: metrics.marketCap,
      circulatingSupply: metrics.circulatingSupply,
      dominance: metrics.dominance,
      fearGreedIndex: metrics.fearGreedIndex,
      hashRate: metrics.hashRate,
      difficulty: metrics.difficulty,
      blockHeight: metrics.blockHeight,
      nextHalving: metrics.nextHalving,
      timestamp: new Date().toISOString(),
      source: 'real-data-service'
    });
  } catch (error) {
    console.error('Bitcoin metrics API error:', error);
    
    // Fallback to Binance API
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT', {
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          symbol: 'BTC/USDT',
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          timestamp: new Date().toISOString(),
          source: 'binance-fallback'
        });
      }
    } catch (binanceError) {
      console.error('Binance fallback also failed:', binanceError);
    }
    
    // Final fallback to mock data
    return NextResponse.json({
      symbol: 'BTC/USD',
      price: 67432.10,
      change24h: 2.34,
      volume24h: 28543678234,
      marketCap: 1325000000000,
      circulatingSupply: 19654321,
      dominance: 52.4,
      fearGreedIndex: 75,
      hashRate: 450.5,
      difficulty: 62000000000000,
      blockHeight: 823456,
      nextHalving: {
        blocksUntil: 126544,
        estimatedDate: new Date(Date.now() + 126544 * 10 * 60 * 1000).toISOString(),
        progress: 39.7
      },
      timestamp: new Date().toISOString(),
      source: 'mock-data-fallback',
      error: 'All APIs unavailable, using mock data'
    });
  }
}