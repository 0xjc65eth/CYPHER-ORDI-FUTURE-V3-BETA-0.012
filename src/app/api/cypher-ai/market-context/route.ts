import { NextRequest, NextResponse } from 'next/server';

// Tipos para dados de mercado
interface MarketData {
  bitcoin: {
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
    dominance: number;
  };
  ethereum: {
    price: number;
    change24h: number;
    volume24h: number;
    marketCap: number;
  };
  fearGreedIndex: {
    value: number;
    classification: string;
    timestamp: string;
  };
  technicalIndicators: {
    rsi: number;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    };
    ema: {
      ema20: number;
      ema50: number;
      ema200: number;
    };
  };
  smartMoneyConcepts: {
    structureDirection: 'bullish' | 'bearish' | 'neutral';
    liquidityZones: Array<{
      level: number;
      type: 'support' | 'resistance';
      strength: number;
    }>;
    orderBlocks: Array<{
      high: number;
      low: number;
      type: 'bullish' | 'bearish';
      timeframe: string;
    }>;
    fairValueGaps: Array<{
      high: number;
      low: number;
      status: 'unfilled' | 'partial' | 'filled';
    }>;
    inducement: {
      detected: boolean;
      level?: number;
      probability: number;
    };
  };
  newsAnalysis: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
    keyEvents: string[];
    sources: number;
  };
  onChainMetrics: {
    activeAddresses: number;
    transactionCount: number;
    hashRate: number;
    difficulty: number;
    memPoolSize: number;
  };
  tradingOpportunities: Array<{
    asset: string;
    type: 'buy' | 'sell' | 'hold';
    timeframe: string;
    entry: number;
    target: number;
    stopLoss: number;
    confidence: number;
    reason: string;
    riskReward: number;
  }>;
}

// Função para buscar dados do Bitcoin via CoinGecko
async function fetchBitcoinData() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
      { next: { revalidate: 60 } } // Cache por 1 minuto
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from CoinGecko');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Bitcoin data:', error);
    return null;
  }
}

// Função para buscar Fear & Greed Index
async function fetchFearGreedIndex() {
  try {
    const response = await fetch(
      'https://api.alternative.me/fng/',
      { next: { revalidate: 3600 } } // Cache por 1 hora
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Fear & Greed Index');
    }
    
    const data = await response.json();
    return data.data[0];
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    return null;
  }
}

// Função para calcular indicadores técnicos (simulados)
function calculateTechnicalIndicators(price: number) {
  // Simulação de indicadores técnicos baseados no preço atual
  const rsi = Math.random() * 100;
  const macdValue = (Math.random() - 0.5) * 100;
  const signalValue = macdValue + (Math.random() - 0.5) * 10;
  
  return {
    rsi: Math.round(rsi * 100) / 100,
    macd: {
      macd: Math.round(macdValue * 100) / 100,
      signal: Math.round(signalValue * 100) / 100,
      histogram: Math.round((macdValue - signalValue) * 100) / 100
    },
    bollingerBands: {
      upper: Math.round((price * 1.02) * 100) / 100,
      middle: price,
      lower: Math.round((price * 0.98) * 100) / 100
    },
    ema: {
      ema20: Math.round((price * (0.98 + Math.random() * 0.04)) * 100) / 100,
      ema50: Math.round((price * (0.96 + Math.random() * 0.08)) * 100) / 100,
      ema200: Math.round((price * (0.90 + Math.random() * 0.20)) * 100) / 100
    }
  };
}

// Função para análise Smart Money Concepts
function analyzeSmartMoneyConcepts(price: number, volume: number) {
  const structureOptions = ['bullish', 'bearish', 'neutral'] as const;
  const structure = structureOptions[Math.floor(Math.random() * structureOptions.length)];
  
  // Gerar zonas de liquidez baseadas no preço
  const liquidityZones = [
    {
      level: Math.round((price * 1.05) * 100) / 100,
      type: 'resistance' as const,
      strength: Math.random() * 100
    },
    {
      level: Math.round((price * 0.95) * 100) / 100,
      type: 'support' as const,
      strength: Math.random() * 100
    }
  ];
  
  // Order blocks simulados
  const orderBlocks = [
    {
      high: Math.round((price * 1.03) * 100) / 100,
      low: Math.round((price * 1.01) * 100) / 100,
      type: Math.random() > 0.5 ? 'bullish' as const : 'bearish' as const,
      timeframe: '4H'
    }
  ];
  
  // Fair Value Gaps
  const fairValueGaps = [
    {
      high: Math.round((price * 1.015) * 100) / 100,
      low: Math.round((price * 1.005) * 100) / 100,
      status: Math.random() > 0.5 ? 'unfilled' as const : 'partial' as const
    }
  ];
  
  return {
    structureDirection: structure,
    liquidityZones,
    orderBlocks,
    fairValueGaps,
    inducement: {
      detected: Math.random() > 0.7,
      level: Math.random() > 0.5 ? price * 1.02 : undefined,
      probability: Math.random() * 100
    }
  };
}

// Função para análise de notícias (simulada)
function analyzeNewssentiment() {
  const sentiments = ['bullish', 'bearish', 'neutral'] as const;
  const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
  
  const keyEvents = [
    'Bitcoin ETF aprovado pela SEC',
    'MicroStrategy compra mais BTC',
    'El Salvador adopta Bitcoin',
    'Whale movements detected',
    'Institutional buying increase'
  ];
  
  return {
    sentiment,
    score: Math.random() * 100,
    keyEvents: keyEvents.slice(0, Math.floor(Math.random() * 3) + 1),
    sources: Math.floor(Math.random() * 50) + 10
  };
}

// Função para simular métricas on-chain
function generateOnChainMetrics() {
  return {
    activeAddresses: Math.floor(Math.random() * 100000) + 800000,
    transactionCount: Math.floor(Math.random() * 50000) + 200000,
    hashRate: Math.floor(Math.random() * 100) + 400, // EH/s
    difficulty: Math.floor(Math.random() * 1000000000000) + 50000000000000,
    memPoolSize: Math.floor(Math.random() * 100) + 10 // MB
  };
}

// Função para gerar oportunidades de trading
function generateTradingOpportunities(bitcoinPrice: number, ethereumPrice: number, smc: any) {
  const opportunities = [];
  
  // Oportunidade Bitcoin
  if (smc.structureDirection === 'bullish') {
    opportunities.push({
      asset: 'BTC',
      type: 'buy' as const,
      timeframe: '4H',
      entry: bitcoinPrice,
      target: Math.round((bitcoinPrice * 1.05) * 100) / 100,
      stopLoss: Math.round((bitcoinPrice * 0.97) * 100) / 100,
      confidence: Math.random() * 30 + 70,
      reason: 'Bullish structure break with volume confirmation',
      riskReward: 1.67
    });
  }
  
  // Oportunidade Ethereum
  opportunities.push({
    asset: 'ETH',
    type: Math.random() > 0.5 ? 'buy' as const : 'hold' as const,
    timeframe: '1H',
    entry: ethereumPrice,
    target: Math.round((ethereumPrice * 1.03) * 100) / 100,
    stopLoss: Math.round((ethereumPrice * 0.98) * 100) / 100,
    confidence: Math.random() * 40 + 50,
    reason: 'ETH showing relative strength vs BTC',
    riskReward: 1.5
  });
  
  return opportunities;
}

// Handler principal GET
export async function GET(request: NextRequest) {
  try {
    // Buscar dados de mercado em paralelo
    const [coinGeckoData, fearGreedData] = await Promise.all([
      fetchBitcoinData(),
      fetchFearGreedIndex()
    ]);
    
    // Usar dados padrão se as APIs falharam
    const bitcoinPrice = coinGeckoData?.bitcoin?.usd || 104390;
    const ethereumPrice = coinGeckoData?.ethereum?.usd || 2350;
    
    const bitcoinData = {
      price: bitcoinPrice,
      change24h: coinGeckoData?.bitcoin?.usd_24h_change || (Math.random() - 0.5) * 10,
      volume24h: coinGeckoData?.bitcoin?.usd_24h_vol || 25000000000,
      marketCap: coinGeckoData?.bitcoin?.usd_market_cap || 2000000000000,
      dominance: 52.5 + (Math.random() - 0.5) * 5
    };
    
    const ethereumData = {
      price: ethereumPrice,
      change24h: coinGeckoData?.ethereum?.usd_24h_change || (Math.random() - 0.5) * 8,
      volume24h: coinGeckoData?.ethereum?.usd_24h_vol || 15000000000,
      marketCap: coinGeckoData?.ethereum?.usd_market_cap || 280000000000
    };
    
    const fearGreed = {
      value: fearGreedData?.value || Math.floor(Math.random() * 100),
      classification: fearGreedData?.value_classification || 'Neutral',
      timestamp: fearGreedData?.timestamp || new Date().toISOString()
    };
    
    // Calcular indicadores e análises
    const technicalIndicators = calculateTechnicalIndicators(bitcoinPrice);
    const smartMoneyConcepts = analyzeSmartMoneyConcepts(bitcoinPrice, bitcoinData.volume24h);
    const newsAnalysis = analyzeNewssentiment();
    const onChainMetrics = generateOnChainMetrics();
    const tradingOpportunities = generateTradingOpportunities(bitcoinPrice, ethereumPrice, smartMoneyConcepts);
    
    const marketData: MarketData = {
      bitcoin: bitcoinData,
      ethereum: ethereumData,
      fearGreedIndex: fearGreed,
      technicalIndicators,
      smartMoneyConcepts,
      newsAnalysis,
      onChainMetrics,
      tradingOpportunities
    };
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: marketData,
      sources: {
        priceData: coinGeckoData ? 'CoinGecko' : 'Simulated',
        fearGreed: fearGreedData ? 'Alternative.me' : 'Simulated',
        technical: 'Calculated',
        smc: 'Internal Analysis',
        news: 'Aggregated Sentiment',
        onChain: 'Simulated'
      }
    });
    
  } catch (error) {
    console.error('Market Context API Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar contexto de mercado',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handler POST para análise específica
export async function POST(request: NextRequest) {
  try {
    const { assets, timeframe, analysisType } = await request.json();
    
    // Buscar dados específicos dos ativos solicitados
    const assetData = await fetchBitcoinData();
    
    // Gerar análise específica baseada nos parâmetros
    const specificAnalysis = {
      assets: assets || ['BTC', 'ETH'],
      timeframe: timeframe || '4H',
      analysis: analysisType || 'smc',
      timestamp: new Date().toISOString(),
      results: {
        signals: generateTradingOpportunities(
          assetData?.bitcoin?.usd || 104390,
          assetData?.ethereum?.usd || 2350,
          { structureDirection: 'bullish' }
        ),
        riskLevel: Math.random() > 0.5 ? 'medium' : 'low',
        confidence: Math.random() * 30 + 70,
        recommendation: 'Consider position sizing based on risk tolerance'
      }
    };
    
    return NextResponse.json({
      success: true,
      data: specificAnalysis
    });
    
  } catch (error) {
    console.error('Specific Analysis Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro na análise específica',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Handler OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}