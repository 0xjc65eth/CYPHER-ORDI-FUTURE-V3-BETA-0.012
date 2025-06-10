/**
 * Estratégias de Trading para Backtesting
 */

export interface Strategy {
  name: string;
  description: string;
  execute: (data: any) => Promise<'BUY' | 'SELL' | 'HOLD'>;
}

// Estratégia de Médias Móveis
export const movingAverageStrategy: Strategy = {
  name: 'Moving Average Crossover',
  description: 'Compra quando MA rápida cruza acima da MA lenta',
  execute: async (data: any) => {
    const { ma20, ma50, price } = data;
    
    if (ma20 > ma50 && price > ma20) {
      return 'BUY';
    } else if (ma20 < ma50 && price < ma20) {
      return 'SELL';
    }
    
    return 'HOLD';
  }
};

// Estratégia RSI
export const rsiStrategy: Strategy = {
  name: 'RSI Oversold/Overbought',
  description: 'Compra em oversold, vende em overbought',
  execute: async (data: any) => {
    const { rsi } = data;
    
    if (rsi < 30) {
      return 'BUY';
    } else if (rsi > 70) {
      return 'SELL';
    }
    
    return 'HOLD';
  }
};

// Estratégia Bollinger Bands
export const bollingerBandsStrategy: Strategy = {
  name: 'Bollinger Bands Bounce',
  description: 'Compra no lower band, vende no upper band',
  execute: async (data: any) => {
    const { price, upperBand, lowerBand } = data;
    
    if (price <= lowerBand) {
      return 'BUY';
    } else if (price >= upperBand) {
      return 'SELL';
    }
    
    return 'HOLD';
  }
};

// Estratégia MACD
export const macdStrategy: Strategy = {
  name: 'MACD Signal Cross',
  description: 'Compra quando MACD cruza signal line',
  execute: async (data: any) => {
    const { macd, signal, histogram } = data;
    
    if (macd > signal && histogram > 0) {
      return 'BUY';
    } else if (macd < signal && histogram < 0) {
      return 'SELL';
    }
    
    return 'HOLD';
  }
};

// Estratégia combinada do CYPHER AI
export const cypherAIStrategy: Strategy = {
  name: 'CYPHER AI Combined',
  description: 'Combina múltiplos indicadores com pesos',
  execute: async (data: any) => {
    const { rsi, macd, signal, ma20, ma50, price, volume } = data;
    
    let score = 0;
    
    // RSI weight: 25%
    if (rsi < 30) score += 25;
    else if (rsi > 70) score -= 25;
    
    // MACD weight: 25%
    if (macd > signal) score += 25;
    else score -= 25;
    
    // MA weight: 25%
    if (ma20 > ma50) score += 25;
    else score -= 25;
    
    // Volume weight: 25%
    const avgVolume = data.volumeMA || volume;
    if (volume > avgVolume * 1.5) score += 25;
    
    if (score >= 50) return 'BUY';
    if (score <= -50) return 'SELL';
    
    return 'HOLD';
  }
};

export const strategies = [
  movingAverageStrategy,
  rsiStrategy,
  bollingerBandsStrategy,
  macdStrategy,
  cypherAIStrategy
];
