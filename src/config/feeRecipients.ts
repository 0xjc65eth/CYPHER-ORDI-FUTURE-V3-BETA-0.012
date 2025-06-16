export const FEE_RECIPIENTS = {
  // EVM Networks (Ethereum, Arbitrum, Optimism, Polygon, Base, Avalanche, BSC)
  EVM: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  
  // Solana Network
  SOLANA: 'EPbE1ZmLXkEJDitNb9KNu9Hq8mThS3P7LpBxdF3EkUwT',
  
  // Bitcoin Network (for future integration)
  BITCOIN: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
};

export const REVENUE_MONITORING = {
  // Admin wallets that can access revenue dashboard
  ADMIN_WALLETS: [
    '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB', // Primary admin
    '0x742d35Cc6634C0532925a3b844Bc9e7595f2BD9e', // Secondary admin
  ],
  
  // Revenue distribution (for future implementation)
  DISTRIBUTION: {
    DEVELOPMENT: 0.4,    // 40% for development
    OPERATIONS: 0.3,     // 30% for operations
    MARKETING: 0.2,      // 20% for marketing
    RESERVES: 0.1        // 10% for reserves
  },
  
  // Minimum withdrawal amounts
  MIN_WITHDRAWAL: {
    ETH: 0.1,
    MATIC: 100,
    BNB: 0.5,
    AVAX: 5,
    SOL: 1
  }
};

export const FEE_COLLECTION_CONFIG = {
  // Smart contract addresses for fee collection (if using smart contracts)
  CONTRACTS: {
    ETHEREUM: process.env.NEXT_PUBLIC_FEE_COLLECTOR_ETH || '',
    ARBITRUM: process.env.NEXT_PUBLIC_FEE_COLLECTOR_ARB || '',
    OPTIMISM: process.env.NEXT_PUBLIC_FEE_COLLECTOR_OP || '',
    POLYGON: process.env.NEXT_PUBLIC_FEE_COLLECTOR_POLYGON || '',
    BASE: process.env.NEXT_PUBLIC_FEE_COLLECTOR_BASE || '',
    AVALANCHE: process.env.NEXT_PUBLIC_FEE_COLLECTOR_AVAX || '',
    BSC: process.env.NEXT_PUBLIC_FEE_COLLECTOR_BSC || ''
  },
  
  // Fee collection methods
  METHODS: {
    DIRECT: 'direct',           // Direct transfer to wallet
    CONTRACT: 'contract',       // Via smart contract
    RELAYER: 'relayer'         // Via meta-transaction relayer
  },
  
  // Default method per chain
  DEFAULT_METHOD: {
    1: 'direct',        // Ethereum
    42161: 'direct',    // Arbitrum
    10: 'direct',       // Optimism
    137: 'direct',      // Polygon
    8453: 'direct',     // Base
    43114: 'direct',    // Avalanche
    56: 'direct',       // BSC
    'solana': 'direct'  // Solana
  }
};

// Additional exports needed by components
export const FEE_PERCENTAGE = 0.0035; // 0.35%
export const MAX_FEE_USD = 100; // Maximum fee of $100

export const FEE_CONFIG = {
  percentage: FEE_PERCENTAGE,
  maxFeeUSD: MAX_FEE_USD,
  minFeeUSD: 0.01, // Minimum fee of $0.01
};

// Wallet addresses for fee collection across different networks
export const WALLET_ADDRESSES = {
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

// Fee calculation function
export function calculateServiceFee(tradeAmount: number, tokenPrice: number = 1): {
  feeAmount: number;
  feeUSD: number;
  feePercentage: number;
  isCapped: boolean;
} {
  const tradeValueUSD = tradeAmount * tokenPrice;
  const calculatedFeeUSD = tradeValueUSD * FEE_PERCENTAGE;
  
  // Apply minimum and maximum fee caps
  let finalFeeUSD = Math.max(calculatedFeeUSD, FEE_CONFIG.minFeeUSD);
  finalFeeUSD = Math.min(finalFeeUSD, FEE_CONFIG.maxFeeUSD);
  
  const isCapped = finalFeeUSD === FEE_CONFIG.maxFeeUSD;
  const feeAmount = finalFeeUSD / tokenPrice;
  const actualFeePercentage = tradeValueUSD > 0 ? (finalFeeUSD / tradeValueUSD) * 100 : 0;

  return {
    feeAmount,
    feeUSD: finalFeeUSD,
    feePercentage: actualFeePercentage,
    isCapped
  };
}

// Address formatting utility
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// Generate swap deeplink for wallet connections
export function generateSwapDeeplink(params: {
  fromToken?: string;
  toToken?: string;
  fromChain?: string;
  toChain?: string;
  amount?: string;
}): string {
  const baseUrl = 'https://app.uniswap.org/#/swap';
  const searchParams = new URLSearchParams();
  
  if (params.fromToken) searchParams.set('inputCurrency', params.fromToken);
  if (params.toToken) searchParams.set('outputCurrency', params.toToken);
  if (params.amount) searchParams.set('exactAmount', params.amount);
  if (params.fromChain) searchParams.set('chain', params.fromChain);
  
  const query = searchParams.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}