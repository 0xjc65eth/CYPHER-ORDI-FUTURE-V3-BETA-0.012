import { NextRequest, NextResponse } from 'next/server';

const CMC_API_KEY = process.env.CMC_API_KEY || 'c045d2a9-6f2d-44e9-8297-a88ab83b463b';
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1';

// Cache para reduzir chamadas à API
const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minuto

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols') || 'BTC,ETH,ORDI';
    
    // Verificar cache
    const cacheKey = `prices:${symbols}`;
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Buscar dados da API
    const response = await fetch(
      `${CMC_API_URL}/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CMC API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Atualizar cache
    priceCache.set(cacheKey, { data, timestamp: Date.now() });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    
    // Retornar dados mock em caso de erro
    return NextResponse.json({
      status: {
        error_code: 500,
        error_message: 'Erro ao buscar dados de preço'
      },
      data: {
        BTC: { quote: { USD: { price: 50000, percent_change_24h: 0 } } },
        ETH: { quote: { USD: { price: 3000, percent_change_24h: 0 } } },
        ORDI: { quote: { USD: { price: 50, percent_change_24h: 0 } } }
      }
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}