import { NextRequest, NextResponse } from 'next/server';

const ORDISCAN_API_KEY = process.env.ORDISCAN_API_KEY;
const ORDISCAN_BASE_URL = 'https://api.ordiscan.com/v1';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint') || 'collections';
    const limit = searchParams.get('limit') || '20';
    
    if (!ORDISCAN_API_KEY) {
      console.warn('⚠️ Ordiscan API key not found, using mock data');
      return getMockOrdiscanData(endpoint);
    }

    let apiUrl = '';
    
    switch (endpoint) {
      case 'collections':
        apiUrl = `${ORDISCAN_BASE_URL}/collections?limit=${limit}`;
        break;
      case 'ordinals':
        apiUrl = `${ORDISCAN_BASE_URL}/ordinals?limit=${limit}`;
        break;
      case 'activity':
        apiUrl = `${ORDISCAN_BASE_URL}/activity?limit=${limit}`;
        break;
      case 'runes':
        apiUrl = `${ORDISCAN_BASE_URL}/runes?limit=${limit}`;
        break;
      default:
        apiUrl = `${ORDISCAN_BASE_URL}/collections?limit=${limit}`;
    }

    console.log(`🔍 Fetching from Ordiscan: ${endpoint}`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${ORDISCAN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ Ordiscan API error: ${response.status}, using mock data`);
      return getMockOrdiscanData(endpoint);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString(),
      source: 'Ordiscan',
      endpoint: endpoint
    });

  } catch (error) {
    console.error('Ordiscan API error:', error);
    return getMockOrdiscanData(request.nextUrl.searchParams.get('endpoint') || 'collections');
  }
}

function getMockOrdiscanData(endpoint: string) {
  const mockData: { [key: string]: any } = {
    collections: {
      total: 156,
      results: [
        {
          id: 'bitcoin-puppets',
          name: 'Bitcoin Puppets',
          description: 'First collection of Bitcoin-themed puppets on Ordinals',
          supply: 10000,
          floor_price: 0.089,
          volume_24h: 125.67,
          volume_change_24h: 15.2,
          unique_holders: 3547,
          sales_24h: 89,
          verified: true,
          category: 'pfp',
          created_at: '2023-03-15T10:30:00Z',
          markets: {
            magic_eden: { price: 0.089, volume: 45.2 },
            unisat: { price: 0.095, volume: 38.1 },
            okx: { price: 0.087, volume: 42.3 }
          }
        },
        {
          id: 'ordinal-maxi-biz',
          name: 'Ordinal Maxi Biz',
          description: 'Classic Ordinal Maxi Business collection',
          supply: 5000,
          floor_price: 0.125,
          volume_24h: 95.34,
          volume_change_24h: 8.7,
          unique_holders: 2890,
          sales_24h: 56,
          verified: true,
          category: 'art',
          created_at: '2023-02-20T14:15:00Z',
          markets: {
            magic_eden: { price: 0.125, volume: 32.1 },
            unisat: { price: 0.135, volume: 28.7 },
            ordiscan: { price: 0.120, volume: 34.5 }
          }
        },
        {
          id: 'quantum-cats',
          name: 'Quantum Cats',
          description: 'Schrödinger inspired digital cats on Bitcoin',
          supply: 3333,
          floor_price: 0.045,
          volume_24h: 67.89,
          volume_change_24h: 22.4,
          unique_holders: 1876,
          sales_24h: 34,
          verified: false,
          category: 'pfp',
          created_at: '2023-04-10T09:45:00Z',
          markets: {
            magic_eden: { price: 0.045, volume: 25.3 },
            unisat: { price: 0.048, volume: 22.1 },
            okx: { price: 0.042, volume: 20.5 }
          }
        }
      ]
    },
    ordinals: {
      total: 50234567,
      results: [
        {
          id: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855i0',
          number: 1234567,
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          content_type: 'image/png',
          content_length: 12345,
          genesis_block_height: 779832,
          genesis_timestamp: 1678901234,
          fee: 10000,
          collection: 'bitcoin-puppets',
          current_price: 0.089,
          last_sale_price: 0.085,
          listed: true
        }
      ]
    },
    runes: {
      total: 12456,
      results: [
        {
          id: 'UNCOMMON•GOODS',
          name: 'UNCOMMON•GOODS',
          symbol: '⧉',
          supply: '158932000000',
          burned: '0',
          holders: 18445,
          mints: 158932,
          etching_block: 840000,
          etching_tx: 'a1b2c3d4e5f6...',
          divisibility: 8,
          spacers: 128,
          premine: '0',
          cap: '158932000000',
          start: 840000,
          end: null,
          offset_start: 0,
          offset_end: 1,
          height_start: 840000,
          height_end: null,
          amount: '1000000',
          markets: {
            unisat: { price: 12.5, volume: 345.2 },
            magic_eden: { price: 14.8, volume: 287.6 },
            okx: { price: 11.9, volume: 298.1 }
          }
        },
        {
          id: 'RSIC•GENESIS•RUNE',
          name: 'RSIC•GENESIS•RUNE',
          symbol: '⧉',
          supply: '123456000000',
          burned: '0',
          holders: 12356,
          mints: 123456,
          etching_block: 840001,
          markets: {
            unisat: { price: 8.9, volume: 234.1 },
            magic_eden: { price: 10.45, volume: 198.5 },
            ordiscan: { price: 8.5, volume: 267.8 }
          }
        }
      ]
    },
    activity: {
      total: 1000000,
      results: [
        {
          type: 'sale',
          collection: 'bitcoin-puppets',
          token_id: '1234',
          price: 0.089,
          currency: 'BTC',
          buyer: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          seller: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
          timestamp: Date.now() - 300000,
          tx_hash: 'a1b2c3d4e5f6...'
        }
      ]
    }
  };

  return NextResponse.json({
    success: true,
    data: mockData[endpoint] || mockData.collections,
    timestamp: new Date().toISOString(),
    source: 'Mock',
    endpoint: endpoint,
    note: 'Using mock data - API key not available'
  });
}