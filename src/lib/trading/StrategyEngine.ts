/**
 * 📈 STRATEGY ENGINE - CYPHER AI v3.0
 * Motor de estratégias de trading com múltiplas técnicas
 */

import { MarketData } from './AutomatedTradingEngine';
import * as tf from '@tensorflow/tfjs';

export interface TechnicalSignal {
  action: 'buy' | 'sell' | 'hold';
  strength: number; // 0-1
  indicators: {
    rsi: { value: number; signal: 'oversold' | 'overbought' | 'neutral' };
    macd: { value: number; signal: 'bullish' | 'bearish' | 'neutral' };
    bollinger: { position: 'above' | 'below' | 'inside' };
    ema: { trend: 'up' | 'down' | 'sideways' };
    volume: { trend: 'increasing' | 'decreasing' | 'stable' };
  };
}

export interface Strategy {
  name: string;
  type: 'technical' | 'ml' | 'sentiment' | 'hybrid';
  weight: number;
  analyze: (data: MarketData) => TechnicalSignal;
}

export class StrategyEngine {
  private strategies: Map<string, Strategy> = new Map();
  private strategyPerformance: Map<string, number> = new Map();
  
  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // Estratégia RSI + Bollinger
    this.addStrategy({
      name: 'RSI_Bollinger',
      type: 'technical',
      weight: 0.25,
      analyze: (data: MarketData) => this.rsiBollingerStrategy(data)
    });

    // Estratégia MACD + EMA
    this.addStrategy({
      name: 'MACD_EMA',
      type: 'technical',
      weight: 0.25,
      analyze: (data: MarketData) => this.macdEmaStrategy(data)
    });

    // Estratégia Volume Profile
    this.addStrategy({
      name: 'Volume_Profile',
      type: 'technical',
      weight: 0.20,
      analyze: (data: MarketData) => this.volumeProfileStrategy(data)
    });

    // Estratégia Mean Reversion
    this.addStrategy({
      name: 'Mean_Reversion',
      type: 'technical',
      weight: 0.15,
      analyze: (data: MarketData) => this.meanReversionStrategy(data)
    });

    // Estratégia Momentum
    this.addStrategy({
      name: 'Momentum',
      type: 'technical',
      weight: 0.15,
      analyze: (data: MarketData) => this.momentumStrategy(data)
    });
  }

  public analyzeTechnical(data: MarketData): TechnicalSignal {
    const signals: TechnicalSignal[] = [];
    const weights: number[] = [];

    // Executar todas as estratégias
    for (const [name, strategy] of this.strategies) {
      if (strategy.type === 'technical' || strategy.type === 'hybrid') {
        const signal = strategy.analyze(data);
        signals.push(signal);
        
        // Ajustar peso baseado na performance
        const performance = this.strategyPerformance.get(name) || 1;
        weights.push(strategy.weight * performance);
      }
    }

    // Combinar sinais ponderados
    return this.combineSignals(signals, weights);
  }

  private rsiBollingerStrategy(data: MarketData): TechnicalSignal {
    const rsi = data.indicators.rsi;
    const price = data.price;
    const bb = data.indicators.bb;
    
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let strength = 0;

    // RSI Analysis
    const rsiSignal = rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral';
    
    // Bollinger Position
    const bbPosition = price > bb.upper ? 'above' : price < bb.lower ? 'below' : 'inside';

    // Estratégia combinada
    if (rsi < 30 && price < bb.lower) {
      action = 'buy';
      strength = 0.8 + (30 - rsi) / 100; // Quanto mais oversold, mais forte
    } else if (rsi > 70 && price > bb.upper) {
      action = 'sell';
      strength = 0.8 + (rsi - 70) / 100; // Quanto mais overbought, mais forte
    } else if (rsi < 40 && bbPosition === 'inside') {
      action = 'buy';
      strength = 0.6;
    } else if (rsi > 60 && bbPosition === 'inside') {
      action = 'sell';
      strength = 0.6;
    }

    return {
      action,
      strength,
      indicators: {
        rsi: { value: rsi, signal: rsiSignal as any },
        macd: data.indicators.macd,
        bollinger: { position: bbPosition },
        ema: { trend: this.getEmaTrend(data) },
        volume: { trend: this.getVolumeTrend(data) }
      }
    };
  }

  private macdEmaStrategy(data: MarketData): TechnicalSignal {
    const macd = data.indicators.macd;
    const ema = data.indicators.ema;
    const price = data.price;

    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let strength = 0;

    // MACD Signal
    const macdSignal = macd.histogram > 0 ? 'bullish' : macd.histogram < 0 ? 'bearish' : 'neutral';

    // EMA Trend
    const emaTrend = this.getEmaTrend(data);

    // Price position relative to EMAs
    const aboveEma9 = price > ema.ema9;
    const aboveEma21 = price > ema.ema21;
    const aboveEma50 = price > ema.ema50;

    // Estratégia combinada
    if (macdSignal === 'bullish' && emaTrend === 'up' && aboveEma21) {
      action = 'buy';
      strength = 0.8;
      if (aboveEma9 && aboveEma50) strength = 0.9;
    } else if (macdSignal === 'bearish' && emaTrend === 'down' && !aboveEma21) {
      action = 'sell';
      strength = 0.8;
      if (!aboveEma9 && !aboveEma50) strength = 0.9;
    } else if (macd.histogram > 0 && aboveEma9) {
      action = 'buy';
      strength = 0.6;
    } else if (macd.histogram < 0 && !aboveEma9) {
      action = 'sell';
      strength = 0.6;
    }

    return {
      action,
      strength,
      indicators: {
        rsi: { value: data.indicators.rsi, signal: 'neutral' },
        macd: { value: macd.histogram, signal: macdSignal as any },
        bollinger: { position: 'inside' },
        ema: { trend: emaTrend },
        volume: { trend: this.getVolumeTrend(data) }
      }
    };
  }

  private volumeProfileStrategy(data: MarketData): TechnicalSignal {
    const volume = data.volume;
    const price = data.price;
    const change = data.change24h;

    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let strength = 0;

    // Volume trend
    const volumeTrend = this.getVolumeTrend(data);

    // Price-Volume divergence
    const priceUp = change > 0;
    const volumeUp = volumeTrend === 'increasing';

    // High volume breakout
    const volumeSpike = volume > (data.volume * 2); // Volume 2x da média

    if (priceUp && volumeUp && volumeSpike) {
      action = 'buy';
      strength = 0.85;
    } else if (!priceUp && volumeUp) {
      // Possível reversão - volume alto com preço caindo
      action = 'buy';
      strength = 0.65;
    } else if (priceUp && !volumeUp) {
      // Movimento fraco - preço subindo sem volume
      action = 'sell';
      strength = 0.65;
    } else if (!priceUp && !volumeUp && volumeSpike) {
      action = 'sell';
      strength = 0.85;
    }

    return {
      action,
      strength,
      indicators: {
        rsi: { value: data.indicators.rsi, signal: 'neutral' },
        macd: data.indicators.macd,
        bollinger: { position: 'inside' },
        ema: { trend: this.getEmaTrend(data) },
        volume: { trend: volumeTrend }
      }
    };
  }

  private meanReversionStrategy(data: MarketData): TechnicalSignal {
    const price = data.price;
    const bb = data.indicators.bb;
    const rsi = data.indicators.rsi;
    
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let strength = 0;

    // Calcular desvio do preço médio
    const deviation = (price - bb.middle) / bb.middle;
    const extremeDeviation = Math.abs(deviation) > 0.02; // 2% de desvio

    // Mean reversion logic
    if (deviation < -0.02 && rsi < 40) {
      // Preço muito abaixo da média
      action = 'buy';
      strength = Math.min(0.9, 0.5 + Math.abs(deviation) * 10);
    } else if (deviation > 0.02 && rsi > 60) {
      // Preço muito acima da média
      action = 'sell';
      strength = Math.min(0.9, 0.5 + Math.abs(deviation) * 10);
    } else if (deviation < -0.01) {
      action = 'buy';
      strength = 0.6;
    } else if (deviation > 0.01) {
      action = 'sell';
      strength = 0.6;
    }

    return {
      action,
      strength,
      indicators: {
        rsi: { value: rsi, signal: 'neutral' },
        macd: data.indicators.macd,
        bollinger: { position: price > bb.upper ? 'above' : price < bb.lower ? 'below' : 'inside' },
        ema: { trend: this.getEmaTrend(data) },
        volume: { trend: this.getVolumeTrend(data) }
      }
    };
  }

  private momentumStrategy(data: MarketData): TechnicalSignal {
    const price = data.price;
    const ema = data.indicators.ema;
    const macd = data.indicators.macd;
    const change = data.change24h;

    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let strength = 0;

    // Momentum indicators
    const shortTermMomentum = (price - ema.ema9) / ema.ema9;
    const mediumTermMomentum = (price - ema.ema21) / ema.ema21;
    const longTermMomentum = (price - ema.ema50) / ema.ema50;

    // Strong upward momentum
    if (shortTermMomentum > 0.01 && mediumTermMomentum > 0.005 && macd.histogram > 0) {
      action = 'buy';
      strength = 0.7 + Math.min(0.2, shortTermMomentum * 10);
    }
    // Strong downward momentum
    else if (shortTermMomentum < -0.01 && mediumTermMomentum < -0.005 && macd.histogram < 0) {
      action = 'sell';
      strength = 0.7 + Math.min(0.2, Math.abs(shortTermMomentum) * 10);
    }
    // Momentum shift
    else if (shortTermMomentum > 0 && mediumTermMomentum < 0 && change > 1) {
      action = 'buy';
      strength = 0.65;
    }
    else if (shortTermMomentum < 0 && mediumTermMomentum > 0 && change < -1) {
      action = 'sell';
      strength = 0.65;
    }

    return {
      action,
      strength,
      indicators: {
        rsi: { value: data.indicators.rsi, signal: 'neutral' },
        macd: { value: macd.histogram, signal: macd.histogram > 0 ? 'bullish' : 'bearish' },
        bollinger: { position: 'inside' },
        ema: { trend: this.getEmaTrend(data) },
        volume: { trend: this.getVolumeTrend(data) }
      }
    };
  }

  private combineSignals(signals: TechnicalSignal[], weights: number[]): TechnicalSignal {
    let buyScore = 0;
    let sellScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < signals.length; i++) {
      const signal = signals[i];
      const weight = weights[i];
      
      if (signal.action === 'buy') {
        buyScore += signal.strength * weight;
      } else if (signal.action === 'sell') {
        sellScore += signal.strength * weight;
      }
      
      totalWeight += weight;
    }

    // Normalizar scores
    buyScore /= totalWeight;
    sellScore /= totalWeight;

    // Determinar ação final
    let finalAction: 'buy' | 'sell' | 'hold' = 'hold';
    let finalStrength = 0;

    if (buyScore > sellScore && buyScore > 0.5) {
      finalAction = 'buy';
      finalStrength = buyScore;
    } else if (sellScore > buyScore && sellScore > 0.5) {
      finalAction = 'sell';
      finalStrength = sellScore;
    }

    // Agregar indicadores (usar o mais recente)
    const latestSignal = signals[signals.length - 1];

    return {
      action: finalAction,
      strength: finalStrength,
      indicators: latestSignal.indicators
    };
  }

  private getEmaTrend(data: MarketData): 'up' | 'down' | 'sideways' {
    const ema = data.indicators.ema;
    
    if (ema.ema9 > ema.ema21 && ema.ema21 > ema.ema50) {
      return 'up';
    } else if (ema.ema9 < ema.ema21 && ema.ema21 < ema.ema50) {
      return 'down';
    } else {
      return 'sideways';
    }
  }

  private getVolumeTrend(data: MarketData): 'increasing' | 'decreasing' | 'stable' {
    // TODO: Implementar análise de tendência de volume baseada em histórico
    // Por enquanto, usar volume 24h
    const avgVolume = 1000000; // Volume médio estimado
    
    if (data.volume > avgVolume * 1.2) {
      return 'increasing';
    } else if (data.volume < avgVolume * 0.8) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  // Métodos públicos

  public addStrategy(strategy: Strategy): void {
    this.strategies.set(strategy.name, strategy);
    this.strategyPerformance.set(strategy.name, 1.0); // Performance inicial neutra
  }

  public removeStrategy(name: string): void {
    this.strategies.delete(name);
    this.strategyPerformance.delete(name);
  }

  public updateStrategyPerformance(name: string, performance: number): void {
    const current = this.strategyPerformance.get(name) || 1.0;
    // Média móvel exponencial para suavizar updates
    const alpha = 0.1;
    const newPerformance = alpha * performance + (1 - alpha) * current;
    this.strategyPerformance.set(name, newPerformance);
  }

  public getStrategyPerformance(): Map<string, number> {
    return new Map(this.strategyPerformance);
  }

  public optimizeWeights(historicalData: any[]): void {
    // TODO: Implementar otimização de pesos usando dados históricos
    // Pode usar algoritmos genéticos ou gradient descent
  }
}