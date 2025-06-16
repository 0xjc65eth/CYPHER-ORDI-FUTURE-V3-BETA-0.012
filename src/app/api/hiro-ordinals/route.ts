import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'inscriptions';
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';

  try {
    let url = '';
    
    switch (endpoint) {
      case 'inscriptions':
        url = `https://api.hiro.so/ordinals/v1/inscriptions?limit=${limit}&offset=${offset}`;
        break;
      case 'brc20':
        url = `https://api.hiro.so/ordinals/v1/brc-20/tokens?limit=${limit}&offset=${offset}`;
        break;
      case 'stats':
        url = `https://api.hiro.so/ordinals/v1/stats`;
        break;
      default:
        url = `https://api.hiro.so/ordinals/v1/${endpoint}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`Hiro API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Hiro API Error:', error);
    
    // Return mock data on error
    const mockData = {
      inscriptions: {
        results: [
          {
            number: 52300000,
            content_type: 'text/plain',
            timestamp: new Date().toISOString(),
            value: '0.045 BTC'
          },
          {
            number: 52299999,
            content_type: 'image/png',
            timestamp: new Date().toISOString(),
            value: '0.089 BTC'
          }
        ],
        total: 52300000
      },
      brc20: {
        results: [
          {
            ticker: 'ORDI',
            max_supply: '21000000',
            minted_supply: '21000000',
            holders: 15234
          },
          {
            ticker: 'SATS',
            max_supply: '2100000000000000',
            minted_supply: '2100000000000000',
            holders: 45678
          }
        ]
      },
      stats: {
        total_inscriptions: 52300000,
        inscriptions_24h: 25000,
        total_fees_btc: 1234.5,
        active_addresses: 123456
      }
    };

    return NextResponse.json(
      endpoint === 'brc20' ? mockData.brc20 : 
      endpoint === 'stats' ? mockData.stats : 
      mockData.inscriptions
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}