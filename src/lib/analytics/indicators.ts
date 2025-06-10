// Advanced On-Chain Indicators Library

interface UTXOData {
  outputs: Array<{
    value: number;
    createdPrice: number;
    spentPrice?: number;
    age: number;
    isSpent: boolean;
  }>;
  totalSupply: number;
  circulatingSupply: number;
}

interface PriceData {
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
}

interface MiningData {
  hashrate: number;
  difficulty: number;
  blockReward: number;
  minerRevenue: number;
  minerRevenue365MA: number;
  totalMinedCoins: number;
  blocksFound: number;
}

interface Thresholds {
  overheated: number;
  bullish: number;
  neutral: [number, number];
  bearish: number;
  oversold: number;
}

interface InterpretationResult {
  signal: 'bullish' | 'bearish' | 'neutral';
  description: string;
  confidence: number;
}

// SOPR (Spent Output Profit Ratio)
export function calculateSOPR(utxoData: UTXOData): number {
  const spentOutputs = utxoData.outputs.filter(output => output.isSpent && output.spentPrice);
  
  if (spentOutputs.length === 0) return 1;
  
  let totalSpentValue = 0;
  let totalCreatedValue = 0;
  
  spentOutputs.forEach(output => {
    const spentValue = output.value * (output.spentPrice || 0);
    const createdValue = output.value * output.createdPrice;
    totalSpentValue += spentValue;
    totalCreatedValue += createdValue;
  });
  
  return totalCreatedValue > 0 ? totalSpentValue / totalCreatedValue : 1;
}

// NUPL (Net Unrealized Profit/Loss)
export function calculateNUPL(priceData: PriceData, utxoData: UTXOData): number {
  const unspentOutputs = utxoData.outputs.filter(output => !output.isSpent);
  
  let unrealizedProfit = 0;
  let unrealizedLoss = 0;
  let totalValue = 0;
  
  unspentOutputs.forEach(output => {
    const currentValue = output.value * priceData.currentPrice;
    const createdValue = output.value * output.createdPrice;
    totalValue += currentValue;
    
    if (currentValue > createdValue) {
      unrealizedProfit += (currentValue - createdValue);
    } else {
      unrealizedLoss += (createdValue - currentValue);
    }
  });
  
  const netUnrealizedPL = unrealizedProfit - unrealizedLoss;
  return totalValue > 0 ? netUnrealizedPL / totalValue : 0;
}

// MVRV (Market Value to Realized Value)
export function calculateMVRV(priceData: PriceData, utxoData: UTXOData): number {
  const marketValue = priceData.currentPrice * utxoData.circulatingSupply;
  
  let realizedValue = 0;
  utxoData.outputs.forEach(output => {
    if (!output.isSpent) {
      realizedValue += output.value * output.createdPrice;
    }
  });
  
  return realizedValue > 0 ? marketValue / realizedValue : 1;
}

// Puell Multiple
export function calculatePuellMultiple(miningData: MiningData): number {
  const dailyIssuanceUSD = miningData.minerRevenue;
  const ma365IssuanceUSD = miningData.minerRevenue365MA;
  
  return ma365IssuanceUSD > 0 ? dailyIssuanceUSD / ma365IssuanceUSD : 1;
}

// Stock-to-Flow Model
export function calculateStockToFlow(priceData: PriceData, miningData: MiningData) {
  const stock = miningData.totalMinedCoins;
  const flow = miningData.blockReward * miningData.blocksFound * 365; // Annual flow
  const stockToFlowRatio = stock / flow;
  
  // S2F Model: Price = 0.4 * S2F^3
  const modelPrice = 0.4 * Math.pow(stockToFlowRatio, 3);
  const actualPrice = priceData.currentPrice;
  const deviation = ((actualPrice - modelPrice) / modelPrice) * 100;
  
  // Generate historical comparison
  const historicalData = priceData.priceHistory.map((item, index) => {
    const historicalS2F = stockToFlowRatio * (1 - index * 0.001); // Approximate historical S2F
    const historicalModel = 0.4 * Math.pow(historicalS2F, 3);
    return {
      date: item.date,
      model: historicalModel,
      actual: item.price
    };
  });
  
  return {
    stockToFlowRatio,
    modelPrice,
    actualPrice,
    deviation,
    historicalData: historicalData.slice(-30) // Last 30 days
  };
}

// Reserve Risk
export function calculateReserveRisk(priceData: PriceData, utxoData: UTXOData): number {
  // Reserve Risk = Price / (Coin Days Destroyed)
  // Simplified calculation
  let coinDaysDestroyed = 0;
  
  utxoData.outputs.forEach(output => {
    if (output.isSpent) {
      coinDaysDestroyed += output.value * output.age;
    }
  });
  
  const normalizedCDD = coinDaysDestroyed / utxoData.circulatingSupply;
  return normalizedCDD > 0 ? priceData.currentPrice / (normalizedCDD * 100000) : 0.001;
}

// Thermocap Ratio
export function calculateThermocapRatio(priceData: PriceData, miningData: MiningData): number {
  // Thermocap = Cumulative miner revenue
  // Simplified: using current market cap vs estimated thermocap
  const estimatedThermocap = miningData.minerRevenue365MA * 365 * 10; // 10 years of mining
  return estimatedThermocap > 0 ? priceData.marketCap / estimatedThermocap : 0.00001;
}

// Entity-Adjusted Dormancy Flow
export function calculateDormancyFlow(utxoData: UTXOData): number {
  // Dormancy = Coin Days Destroyed / Transfer Volume
  let coinDaysDestroyed = 0;
  let transferVolume = 0;
  
  utxoData.outputs.forEach(output => {
    if (output.isSpent) {
      coinDaysDestroyed += output.value * output.age;
      transferVolume += output.value;
    }
  });
  
  return transferVolume > 0 ? coinDaysDestroyed / transferVolume : 0;
}

// Get historical thresholds for each metric
export function getHistoricalThresholds(metric: string): Thresholds {
  const thresholds: Record<string, Thresholds> = {
    sopr: {
      overheated: 1.08,
      bullish: 1.02,
      neutral: [0.98, 1.02],
      bearish: 0.95,
      oversold: 0.92
    },
    nupl: {
      overheated: 0.75,
      bullish: 0.5,
      neutral: [0.25, 0.5],
      bearish: 0.1,
      oversold: 0
    },
    mvrv: {
      overheated: 3.5,
      bullish: 2.0,
      neutral: [1.5, 2.5],
      bearish: 1.2,
      oversold: 0.8
    },
    puell: {
      overheated: 4.0,
      bullish: 2.0,
      neutral: [0.8, 2.0],
      bearish: 0.5,
      oversold: 0.3
    }
  };
  
  return thresholds[metric] || thresholds.sopr;
}

// Interpret metric value based on thresholds
export function interpretMetric(
  metric: string, 
  value: number, 
  thresholds: Thresholds
): InterpretationResult {
  let signal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  let description = '';
  let confidence = 70;
  
  // Determine signal based on thresholds
  if (value >= thresholds.overheated) {
    signal = 'bearish';
    confidence = 90;
  } else if (value >= thresholds.bullish) {
    signal = 'bullish';
    confidence = 80;
  } else if (value >= thresholds.neutral[0] && value <= thresholds.neutral[1]) {
    signal = 'neutral';
    confidence = 70;
  } else if (value <= thresholds.oversold) {
    signal = 'bullish';
    confidence = 85;
  } else if (value <= thresholds.bearish) {
    signal = 'bearish';
    confidence = 75;
  }
  
  // Generate descriptions based on metric and signal
  const descriptions: Record<string, Record<string, string>> = {
    sopr: {
      bullish: 'SOPR above 1 indicates profitable spending. Current levels suggest healthy market with moderate profit-taking.',
      bearish: 'SOPR below 1 shows losses being realized. This often occurs at market bottoms when weak hands capitulate.',
      neutral: 'SOPR near 1 indicates equilibrium between profit and loss realization. Market is in a transitional phase.'
    },
    nupl: {
      bullish: 'Net Unrealized Profit/Loss shows market in belief phase. Historically, these levels precede significant price appreciation.',
      bearish: 'NUPL indicates widespread unrealized losses. Market capitulation may be near, presenting accumulation opportunities.',
      neutral: 'NUPL shows balanced market sentiment. Neither extreme greed nor fear is dominating participant behavior.'
    },
    mvrv: {
      bullish: 'MVRV suggests undervaluation relative to realized value. Historical data shows accumulation opportunities at these levels.',
      bearish: 'MVRV indicates overvaluation. Profit-taking is likely as unrealized gains reach unsustainable levels.',
      neutral: 'MVRV at fair value levels. Market pricing aligns with on-chain cost basis of participants.'
    },
    puell: {
      bullish: 'Mining profitability at healthy levels supports continued network security and potential price appreciation.',
      bearish: 'Extreme mining profitability historically precedes market corrections as miners increase selling pressure.',
      neutral: 'Puell Multiple indicates sustainable mining economics. Network fundamentals remain strong.'
    }
  };
  
  description = descriptions[metric]?.[signal] || 'Metric showing typical market behavior.';
  
  return { signal, description, confidence };
}

// Cycle phase detection
export function detectCyclePhase(metrics: {
  sopr: number;
  nupl: number;
  mvrv: number;
  puell: number;
}): string {
  const { sopr, nupl, mvrv, puell } = metrics;
  
  // Accumulation phase
  if (mvrv < 1.2 && nupl < 0.25 && puell < 0.5) {
    return 'Accumulation';
  }
  
  // Early Bull
  if (mvrv >= 1.2 && mvrv < 2.0 && nupl >= 0.25 && nupl < 0.5) {
    return 'Early Bull';
  }
  
  // Bull Market
  if (mvrv >= 2.0 && mvrv < 3.0 && nupl >= 0.5 && nupl < 0.75) {
    return 'Bull Market';
  }
  
  // Euphoria
  if (mvrv >= 3.0 && nupl >= 0.75 && puell >= 3.0) {
    return 'Euphoria';
  }
  
  // Distribution
  if (sopr < 1.02 && mvrv > 2.5 && puell > 2.0) {
    return 'Distribution';
  }
  
  // Bear Market
  if (mvrv < 1.5 && nupl < 0.25 && sopr < 1) {
    return 'Bear Market';
  }
  
  return 'Transitional';
}