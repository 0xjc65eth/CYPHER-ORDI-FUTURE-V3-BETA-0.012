import { NextResponse } from 'next/server'

// Analytics data generator
function generateAnalyticsData() {
  const now = new Date()
  const data = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: 95000 + Math.random() * 10000,
      volume: 45000 + Math.random() * 10000,
      transactions: 300000 + Math.random() * 50000,
      activeAddresses: 900000 + Math.random() * 100000,
      hashRate: 500 + Math.random() * 50,
      difficulty: 70 + Math.random() * 5
    })
  }
  
  return data
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'
    
    const analyticsData = {
      overview: {
        marketCap: 2145678901234,
        dominance: 52.3,
        volume24h: 45678901234,
        change24h: 2.5
      },
      chartData: generateAnalyticsData(),
      metrics: {
        avgBlockTime: 9.8,
        mempoolSize: 124567,
        feeRate: 45,
        pendingTx: 23456
      }
    }
    
    return NextResponse.json({
      success: true,
      data: analyticsData,
      timeframe,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}