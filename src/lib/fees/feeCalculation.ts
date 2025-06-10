/**
 * Fee Calculation Engine for CYPHER TRADE
 * Calculates the 0.34% CYPHER fee for all transactions
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

// CYPHER fee rate: 0.34%
export const CYPHER_FEE_RATE = 0.0034;

// Fee recipient addresses
const FEE_RECIPIENTS = {
  ethereum: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  arbitrum: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  optimism: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  polygon: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  base: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  avalanche: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  bsc: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  solana: 'EPbE1ZmLXkEJDitNb9KNu9Hq8mThS3P7LpBxdF3EkUwT',
  bitcoin: 'bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6'
};

/**
 * Calculate fees for a trade
 */
export async function calculateFees(request: FeeCalculationRequest): Promise<FeeCalculation> {
  const { tokenIn, tokenOut, amountIn, network } = request;
  
  // Mock token price (in production, fetch from price oracle)
  const tokenPrice = 2000; // $2000 per token
  const amountInUSD = parseFloat(amountIn) * tokenPrice;
  
  // Calculate CYPHER fee (0.34%)
  const cypherFeeUSD = amountInUSD * CYPHER_FEE_RATE;
  const cypherFeeAmount = cypherFeeUSD / tokenPrice;
  
  // Get recipient address for network
  const recipient = FEE_RECIPIENTS[network as keyof typeof FEE_RECIPIENTS] || FEE_RECIPIENTS.ethereum;
  
  // Mock DEX fees (would be calculated from actual DEX quotes)
  const dexFees = [
    {
      dex: 'Uniswap V3',
      amount: (parseFloat(amountIn) * 0.003).toString(), // 0.3%
      amountUSD: amountInUSD * 0.003,
      percentage: 0.3
    }
  ];
  
  // Mock gas fees
  const gasFees = {
    estimatedGas: '150000',
    gasPrice: '20000000000', // 20 gwei
    gasCostUSD: 25 // $25
  };
  
  // Calculate totals
  const totalDexFeesUSD = dexFees.reduce((sum, fee) => sum + fee.amountUSD, 0);
  const totalFeeUSD = cypherFeeUSD + totalDexFeesUSD + gasFees.gasCostUSD;
  const totalFeePercentage = (totalFeeUSD / amountInUSD) * 100;
  
  return {
    cypherFee: {
      amount: cypherFeeAmount.toString(),
      amountUSD: cypherFeeUSD,
      percentage: CYPHER_FEE_RATE * 100,
      recipient
    },
    dexFees,
    gasFees,
    totalFeeUSD,
    totalFeePercentage
  };
}

/**
 * Calculate just the CYPHER fee
 */
export function calculateCypherFee(amountUSD: number): number {
  return amountUSD * CYPHER_FEE_RATE;
}

/**
 * Get fee percentage as text
 */
export function getFeePercentageText(): string {
  return `${(CYPHER_FEE_RATE * 100).toFixed(2)}%`;
}

export default {
  calculateFees,
  calculateCypherFee,
  getFeePercentageText,
  CYPHER_FEE_RATE
};