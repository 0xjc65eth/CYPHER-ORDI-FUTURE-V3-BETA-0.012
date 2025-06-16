import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simular índice Fear & Greed
    const fearGreedScore = Math.floor(Math.random() * 30) + 40; // Entre 40-70
    
    let overall: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
    if (fearGreedScore <= 20) overall = 'extreme_fear';
    else if (fearGreedScore <= 40) overall = 'fear';
    else if (fearGreedScore <= 60) overall = 'neutral';
    else if (fearGreedScore <= 80) overall = 'greed';
    else overall = 'extreme_greed';
    
    // Gerar histórico
    const fearGreedHistory = Array.from({ length: 30 }, (_, i) => ({
      timestamp: Date.now() - (29 - i) * 86400000,
      score: Math.floor(Math.random() * 40) + 30
    }));
    
    const sentiment = {
      overall,
      score: fearGreedScore,
      btcDominance: 52.3 + (Math.random() - 0.5) * 5,
      totalMarketCap: 2.85e12 + (Math.random() - 0.5) * 0.2e12,
      totalVolume24h: 125e9 + (Math.random() - 0.5) * 20e9,
      activeTraders: Math.floor(1250000 + Math.random() * 250000),
      fearGreedComponents: {
        volatility: Math.floor(Math.random() * 30) + 35, // 35-65
        momentum: Math.floor(Math.random() * 40) + 30,   // 30-70
        social: Math.floor(Math.random() * 35) + 25,     // 25-60
        dominance: Math.floor(Math.random() * 25) + 45,  // 45-70
        trends: Math.floor(Math.random() * 50) + 25      // 25-75
      },
      fearGreedHistory
    };
    
    return NextResponse.json({
      success: true,
      data: sentiment,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao obter sentimento de mercado' },
      { status: 500 }
    );
  }
}