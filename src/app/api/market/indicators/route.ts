import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const indicators = [
      {
        name: 'Hash Rate',
        value: 580 + Math.random() * 20,
        change: (Math.random() - 0.5) * 5,
        impact: 'bullish' as const,
        description: 'Network security at all-time high'
      },
      {
        name: 'Mining Difficulty',
        value: 72.5 + Math.random() * 2,
        change: 2.3,
        impact: 'neutral' as const,
        description: 'Next adjustment in 5 days'
      },
      {
        name: 'Exchange Reserves',
        value: 2.35,
        change: -3.2,
        impact: 'bullish' as const,
        description: 'BTC leaving exchanges (million BTC)'
      },
      {
        name: 'Long/Short Ratio',
        value: 1.8 + Math.random() * 0.4,
        change: 5.7,
        impact: 'bullish' as const,
        description: 'More longs than shorts'
      },
      {
        name: 'Funding Rate',
        value: 0.01 + Math.random() * 0.02,
        change: -15,
        impact: 'neutral' as const,
        description: 'Perpetual futures funding (%)'
      },
      {
        name: 'MVRV Ratio',
        value: 2.1 + Math.random() * 0.3,
        change: 1.2,
        impact: 'neutral' as const,
        description: 'Market value to realized value'
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: indicators,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao obter indicadores' },
      { status: 500 }
    );
  }
}