import { NextResponse } from 'next/server';
import { hiroAPI } from '@/lib/hiro-api';

export async function GET() {
  try {
    console.log('📊 Buscando estatísticas de Ordinals');

    // Tentar buscar dados reais da API Hiro
    try {
      const data = await hiroAPI.getInscriptionStats();
      
      return NextResponse.json({
        success: true,
        data: {
          total_inscriptions: data.total_inscriptions || 52300000,
          volume_24h: data.volume_24h || 234.5,
          collections: data.collections || 1842,
          avg_fee: data.avg_fee || 47,
          ...data
        },
        timestamp: Date.now()
      });
    } catch (hiroError) {
      console.log('⚠️ Hiro API não disponível, usando dados simulados');
      
      // Dados simulados caso a API não esteja disponível
      return NextResponse.json({
        success: true,
        data: {
          total_inscriptions: 52300000 + Math.floor(Math.random() * 100000),
          volume_24h: 234.5 + (Math.random() - 0.5) * 50,
          collections: 1842 + Math.floor(Math.random() * 20),
          avg_fee: 47 + Math.floor(Math.random() * 10),
          change_24h: (Math.random() - 0.5) * 10,
          new_inscriptions_24h: Math.floor(Math.random() * 50000),
          active_wallets: Math.floor(15000 + Math.random() * 5000)
        },
        timestamp: Date.now(),
        source: 'simulated'
      });
    }

  } catch (error) {
    console.error('❌ Erro na API Ordinals Stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar estatísticas',
      message: error.message
    }, { status: 500 });
  }
}