import { NextResponse } from 'next/server';

const newsTemplates = [
  {
    headline: 'Bitcoin ETF Sees Record $500M Daily Inflow',
    summary: 'Institutional investors continue to pour money into Bitcoin ETFs, marking the highest single-day inflow.',
    impact: 'high',
    sentiment: 'positive',
    source: 'Bloomberg',
    relatedAssets: ['BTC', 'ETH']
  },
  {
    headline: 'Ordinals Protocol Update Enhances Inscription Speed',
    summary: 'New protocol update reduces inscription time by 40%, making Ordinals more accessible.',
    impact: 'medium',
    sentiment: 'positive',
    source: 'Ordinals News',
    relatedAssets: ['ORDI', 'SATS']
  },
  {
    headline: 'Federal Reserve Signals Potential Rate Cut',
    summary: 'Fed Chair hints at possible rate cuts in Q2, crypto markets react positively.',
    impact: 'high',
    sentiment: 'positive',
    source: 'Reuters',
    relatedAssets: ['BTC', 'ETH', 'SOL']
  },
  {
    headline: 'Major Exchange Lists New Runes Token',
    summary: 'Binance announces listing of PUPS token, trading to begin next week.',
    impact: 'medium',
    sentiment: 'positive',
    source: 'CoinDesk',
    relatedAssets: ['PUPS', 'RSIC']
  },
  {
    headline: 'Whale Alert: 1000 BTC Moved to Cold Storage',
    summary: 'Large Bitcoin holder moves significant amount to cold storage, indicating long-term hold.',
    impact: 'low',
    sentiment: 'neutral',
    source: 'Whale Alert',
    relatedAssets: ['BTC']
  },
  {
    headline: 'DeFi TVL Reaches New All-Time High',
    summary: 'Total value locked in DeFi protocols surpasses $150 billion milestone.',
    impact: 'medium',
    sentiment: 'positive',
    source: 'DeFi Pulse',
    relatedAssets: ['ETH', 'SOL', 'AVAX']
  }
];

export async function GET() {
  try {
    // Gerar notícias com timestamps variados e padronizar campos
    const news = newsTemplates.map((template, index) => ({
      id: `news-${Date.now()}-${index}`,
      title: template.headline, // Componente espera 'title'
      summary: template.summary,
      impact: template.impact,
      sentiment: template.sentiment === 'positive' ? 'bullish' : 
                template.sentiment === 'negative' ? 'bearish' : 'neutral',
      source: template.source,
      relatedAssets: template.relatedAssets,
      timestamp: Date.now() - (index * 900000) // 15 minutos entre cada notícia
    }));
    
    return NextResponse.json({
      success: true,
      data: news,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao obter notícias' },
      { status: 500 }
    );
  }
}