import { NextResponse } from 'next/server';

const assets = ['BTC', 'ETH', 'ORDI', 'SATS', 'SOL', 'DOGE', 'PUPS', 'RSIC'];
const timeframes = ['1h', '4h', '1d', '1w'] as const;

export async function GET() {
  try {
    // Gerar sinais de trading
    const signals = assets.slice(0, 6).map((asset, index) => {
      const prices: { [key: string]: number } = {
        BTC: 104000,
        ETH: 3800,
        ORDI: 65,
        SATS: 0.0000045,
        SOL: 185,
        DOGE: 0.42,
        PUPS: 45,
        RSIC: 12.5
      };
      
      const price = prices[asset] || 100;
      const signalType = Math.random() > 0.5 ? 'buy' : Math.random() > 0.5 ? 'sell' : 'hold';
      const strength = Math.random() > 0.7 ? 'strong' : Math.random() > 0.5 ? 'moderate' : 'weak';
      const confidence = Math.floor(60 + Math.random() * 35);
      
      let reasoning = '';
      if (signalType === 'buy') {
        reasoning = `RSI oversold at ${30 + Math.random() * 10}. Support level holding strong.`;
      } else if (signalType === 'sell') {
        reasoning = `Resistance at ${price * 1.05}. RSI overbought at ${70 + Math.random() * 20}.`;
      } else {
        reasoning = 'Consolidation phase. Wait for breakout confirmation.';
      }
      
      return {
        id: `signal-${Date.now()}-${index}`,
        asset,
        type: signalType,
        strength,
        timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
        confidence,
        price,
        target: signalType === 'buy' ? price * 1.05 : signalType === 'sell' ? price * 0.95 : undefined,
        stopLoss: signalType === 'buy' ? price * 0.97 : signalType === 'sell' ? price * 1.03 : undefined,
        reasoning,
        timestamp: Date.now() - Math.random() * 3600000
      };
    });
    
    // Ordenar por confiança
    signals.sort((a, b) => b.confidence - a.confidence);
    
    return NextResponse.json({
      success: true,
      data: signals,
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao gerar sinais' },
      { status: 500 }
    );
  }
}