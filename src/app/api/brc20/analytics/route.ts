import { NextRequest, NextResponse } from 'next/server'
import { brc20Service } from '@/services/BRC20Service'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching BRC-20 analytics...')
    
    const analytics = await brc20Service.getBRC20Analytics()
    
    const response = {
      analytics,
      timestamp: new Date().toISOString(),
      cached: false,
      dataSource: 'brc20Service'
    }

    console.log('✅ Successfully generated BRC-20 analytics')
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error generating BRC-20 analytics:', error)
    
    // Return fallback analytics
    const fallbackAnalytics = {
      totalMarketCap: 1000000000,
      totalVolume24h: 50000000,
      totalTokens: 1200,
      totalHolders: 150000,
      topGainers: [],
      topLosers: [],
      mostActive: [],
      recentlyDeployed: []
    }

    return NextResponse.json({
      analytics: fallbackAnalytics,
      timestamp: new Date().toISOString(),
      cached: false,
      dataSource: 'fallback',
      error: 'Analytics temporarily unavailable'
    })
  }
}