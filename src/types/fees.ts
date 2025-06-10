/**
 * Type definitions for the fee system
 */

export interface FeeCalculationRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut?: string;
  network: string;
  slippage?: number;
  deadline?: number;
}

export interface FeeCalculation {
  cypherFee: {
    amount: string;
    amountUSD: number;
    percentage: number;
    recipient: string;
  };
  dexFees: Array<{
    dex: string;
    amount: string;
    amountUSD: number;
    percentage: number;
  }>;
  gasFees: {
    estimatedGas: string;
    gasPrice: string;
    gasCostUSD: number;
  };
  bridgeFees?: {
    amount: string;
    amountUSD: number;
    fromChain: string;
    toChain: string;
  };
  totalFeeUSD: number;
  totalFeePercentage: number;
}

export interface FeeAddresses {
  ethereum: string;
  arbitrum: string;
  optimism: string;
  polygon: string;
  base: string;
  avalanche: string;
  bsc: string;
  solana: string;
  bitcoin: string;
}

export interface FeeStructure {
  percentage: number;
  minFeeUSD: number;
  maxFeeUSD: number;
  recipient: string;
  network: string;
}

export interface FeeTracking {
  id: string;
  timestamp: number;
  amount: string;
  amountUSD: number;
  token: string;
  network: string;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  userAddress?: string;
}