// pages/api/runes/[name].js - API para detalhes de um Rune
import { hiroAPI } from '@/lib/hiro-api';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    
    if (!name) {
      return NextResponse.json({
        success: false,
        error: 'Nome do Rune é obrigatório'
      }, { status: 400 });
    }

    console.log(`🏃 Buscando detalhes do Rune: ${name}`);

    // Buscar dados paralelos
    const [details, holders, activity] = await Promise.allSettled([
      hiroAPI.getRuneDetails(name),
      hiroAPI.getRuneHolders(name, 0, 10),
      hiroAPI.getRuneActivity(name, 0, 10)
    ]);

    const result = {
      details: details.status === 'fulfilled' ? details.value : null,
      holders: holders.status === 'fulfilled' ? holders.value : null,
      activity: activity.status === 'fulfilled' ? activity.value : null,
      timestamp: Date.now()
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Erro na API Rune Details:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar detalhes do Rune',
      message: error.message
    }, { status: 500 });
  }
}