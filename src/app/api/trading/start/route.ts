/**
 * 🚀 TRADING ENGINE API - CYPHER AI v3.0
 * Endpoint para controlar o motor de trading automatizado
 */

import { NextRequest, NextResponse } from 'next/server';
import { AutomatedTradingEngine, TradingConfig } from '@/lib/trading/AutomatedTradingEngine';
import { IntelligentRiskManager } from '@/lib/trading/IntelligentRiskManager';
import { StrategyEngine } from '@/lib/trading/StrategyEngine';
import { binanceEngine, okxEngine, bybitEngine } from '@/lib/trading/trading-engine';

// Singleton para manter a instância do trading engine
let tradingEngine: AutomatedTradingEngine | null = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode = 'moderate', config } = body;

    // Configuração padrão
    const tradingConfig: TradingConfig = {
      mode: mode as any,
      maxPositions: config?.maxPositions || 5,
      maxDrawdown: config?.maxDrawdown || 0.15,
      profitTarget: config?.profitTarget || 0.02,
      tradingPairs: config?.pairs || ['BTCUSDT', 'ETHUSDT', 'ORDIUSDT'],
      timeframes: config?.timeframes || ['5m', '15m', '1h'],
      enableArbitrage: config?.enableArbitrage ?? true,
      enableMLPredictions: config?.enableMLPredictions ?? true,
      enableSentimentAnalysis: config?.enableSentimentAnalysis ?? true
    };

    // Criar nova instância se não existir
    if (!tradingEngine) {
      const exchangeConnectors = [binanceEngine]; // Adicionar outras exchanges conforme configurado
      const riskManager = new IntelligentRiskManager(mode);
      const strategyEngine = new StrategyEngine();
      
      tradingEngine = new AutomatedTradingEngine(
        exchangeConnectors,
        riskManager,
        strategyEngine,
        tradingConfig
      );
    }

    // Iniciar trading
    tradingEngine.startTrading().catch(error => {
      console.error('Trading engine error:', error);
    });

    return NextResponse.json({
      status: 'active',
      message: 'Automated trading started successfully',
      config: tradingConfig,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Failed to start trading:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to start trading engine'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!tradingEngine) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Trading engine not running'
        },
        { status: 400 }
      );
    }

    // Parar trading
    await tradingEngine.stopTrading();
    const performance = tradingEngine.getPerformance();
    
    // Limpar instância
    tradingEngine = null;

    return NextResponse.json({
      status: 'stopped',
      message: 'Trading engine stopped successfully',
      performance,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Failed to stop trading:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to stop trading engine'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!tradingEngine) {
      return NextResponse.json({
        status: 'inactive',
        message: 'Trading engine not running'
      });
    }

    const performance = tradingEngine.getPerformance();
    const activePositions = tradingEngine.getActivePositions();

    return NextResponse.json({
      status: 'active',
      performance,
      activePositions,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Failed to get trading status:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message || 'Failed to get trading status'
      },
      { status: 500 }
    );
  }
}