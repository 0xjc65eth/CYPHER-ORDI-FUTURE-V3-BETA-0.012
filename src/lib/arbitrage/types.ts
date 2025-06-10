// Neural Arbitrage Engine Types

export interface ArbitrageOpportunity {
  asset: string;
  type: 'ordinal' | 'rune' | 'btc';
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  grossProfit: number;
  netProfit: number;
  profitPercentage: number;
  fees: number;
  estimatedTimeWindow: number; // minutes
  confidence: number; // 0-100
  liquidityCheck: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ExchangePrice {
  exchange: string;
  price: number;
  volume: number;
  fee: number;
  lastUpdate: Date;
}

export interface ArbitrageConfig {
  minProfitPercentage: number;
  maxSlippage: number;
  includeFees: boolean;
  exchanges: string[];
}