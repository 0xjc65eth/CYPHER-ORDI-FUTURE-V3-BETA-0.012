/**
 * Bitcoin Price API Route
 * Fornece dados de preço em tempo real
 */

import { NextResponse } from 'next/server';

// Mock data temporário - em produção, conectar a APIs reais
const MOCK_BITCOIN_DATA = {
  price: 67234.56,
  change24h: 2.45,
  volume24h: 28943567890,
  marketCap: 1315678943210,
  high24h: 68450.23,
  low24h: 65890.34,
  lastUpdate: new Date().toISOString()
};

export async function GET() {
  try {
    // Em produção, buscar dados de APIs como CoinGecko, Binance, etc.
    // Por enquanto, retornando mock data
    
    return NextResponse.json({
      success: true,
      data: MOCK_BITCOIN_DATA
    });
  } catch (error) {
    console.error('Bitcoin API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Bitcoin data' },
      { status: 500 }
    );
  }
}