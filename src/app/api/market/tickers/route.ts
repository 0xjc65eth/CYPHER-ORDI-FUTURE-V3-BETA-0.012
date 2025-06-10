import { NextResponse } from 'next/server';

// Simulação de dados de mercado em tempo real
const generateMarketData = () => {
  const baseAssets = [
    { symbol: 'BTC', name: 'Bitcoin', basePrice: 104000, type: 'crypto' },
    { symbol: 'ETH', name: 'Ethereum', basePrice: 3800, type: 'crypto' },
    { symbol: 'ORDI', name: 'Ordinals', basePrice: 65, type: 'ordinal' },
    { symbol: 'SATS', name: 'Satoshis', basePrice: 0.0000045, type: 'brc20' },
    { symbol: 'RATS', name: 'Rats', basePrice: 0.00012, type: 'brc20' },
    { symbol: 'PUPS', name: 'Bitcoin Puppets', basePrice: 45, type: 'rune' },
    { symbol: 'RSIC', name: 'Rune Specific', basePrice: 12.5, type: 'rune' },
    { symbol: 'SOL', name: 'Solana', basePrice: 185, type: 'crypto' },
    { symbol: 'DOGE', name: 'Dogecoin', basePrice: 0.42, type: 'crypto' },
    { symbol: 'PEPE', name: 'Pepe', basePrice: 0.000021, type: 'crypto' },
    { symbol: 'SHIB', name: 'Shiba Inu', basePrice: 0.000034, type: 'crypto' },
    { symbol: 'AVAX', name: 'Avalanche', basePrice: 45, type: 'crypto' },
    { symbol: 'MATIC', name: 'Polygon', basePrice: 1.15, type: 'crypto' },
    { symbol: 'DOT', name: 'Polkadot', basePrice: 8.75, type: 'crypto' },
    { symbol: 'LINK', name: 'Chainlink', basePrice: 22.50, type: 'crypto' }
  ];

  return baseAssets.map(asset => {
    // Simular variações de preço
    const priceVariation = (Math.random() - 0.5) * 0.1; // ±5%
    const currentPrice = asset.basePrice * (1 + priceVariation);
    
    // Simular mudanças 24h
    const change24h = (Math.random() - 0.5) * 10; // ±5%
    
    // Determinar volatilidade baseada no tipo
    const volatilityChance = Math.random();
    let volatility: 'low' | 'medium' | 'high' = 'medium';
    
    if (asset.type === 'brc20' || asset.type === 'rune') {
      volatility = volatilityChance > 0.5 ? 'high' : 'medium';
    } else if (asset.symbol === 'BTC' || asset.symbol === 'ETH') {
      volatility = volatilityChance > 0.7 ? 'medium' : 'low';
    } else {
      volatility = volatilityChance > 0.6 ? 'high' : 'medium';
    }
    
    // Determinar se está trending
    const trending = Math.random() > 0.7 || Math.abs(change24h) > 5;
    
    return {
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      price: currentPrice,
      change24h: currentPrice * (change24h / 100),
      changePercent24h: change24h,
      volume24h: Math.random() * 1000000000 * (asset.symbol === 'BTC' ? 30 : 1),
      marketCap: currentPrice * (asset.symbol === 'BTC' ? 19700000 : Math.random() * 1000000000),
      high24h: currentPrice * 1.05,
      low24h: currentPrice * 0.95,
      lastUpdate: Date.now(),
      trending,
      volatility
    };
  });
};

export async function GET() {
  try {
    const tickers = generateMarketData();
    
    // Ordenar por volume
    tickers.sort((a, b) => b.volume24h - a.volume24h);
    
    return NextResponse.json({
      success: true,
      data: tickers,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Erro ao gerar dados de mercado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao obter dados de mercado' },
      { status: 500 }
    );
  }
}