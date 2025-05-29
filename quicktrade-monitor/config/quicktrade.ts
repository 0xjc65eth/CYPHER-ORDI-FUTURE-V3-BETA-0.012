// 💰 CONFIGURAÇÃO QUICKTRADE - SEU SISTEMA DE REVENUE
// ================================================================

// 🏛️ SUAS CARTEIRAS DE DESTINO (ONDE AS TAXAS VÃO!)
export const REVENUE_WALLETS = {
  // Todas as redes EVM usam a mesma carteira
  ethereum: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  arbitrum: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  optimism: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  polygon: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  base: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  avalanche: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  bsc: '0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB',
  
  // Carteira Solana separada
  solana: 'EPbE1ZmLXkEJDitNb9KNu9Hq8mThS3P7LpBxdF3EkUwT'
} as const;

// 💸 CONFIGURAÇÕES DE TAXA
export const FEE_CONFIG = {
  percentage: 0.0005, // 0.05%
  minimumTransaction: 10, // $10 mínimo
  maximumFee: 100, // $100 máximo por transação
  
  // Tokens aceitos para pagamento de taxa
  acceptedTokens: {
    evm: ['USDC', 'USDT', 'ETH', 'native'],
    solana: ['USDC', 'USDT', 'SOL']
  }
} as const;

// 🌐 REDES SUPORTADAS
export const SUPPORTED_NETWORKS = [
  'ethereum',
  'arbitrum', 
  'optimism',
  'polygon',
  'base',
  'avalanche',
  'bsc',
  'solana'
] as const;

export type SupportedNetwork = typeof SUPPORTED_NETWORKS[number];

// 🔗 BLOCKCHAIN EXPLORERS
export const BLOCK_EXPLORERS = {
  ethereum: 'https://etherscan.io',
  arbitrum: 'https://arbiscan.io',
  optimism: 'https://optimistic.etherscan.io',
  polygon: 'https://polygonscan.com',
  base: 'https://basescan.org',
  avalanche: 'https://snowtrace.io',
  bsc: 'https://bscscan.com',
  solana: 'https://solscan.io'
} as const;

// 📊 CONFIGURAÇÕES DE MONITORAMENTO
export const MONITORING_CONFIG = {
  maxRetries: 10,
  retryDelayMs: 30000, // 30 segundos
  confirmationsRequired: {
    ethereum: 6,
    arbitrum: 6,
    optimism: 6,
    polygon: 20,
    base: 6,
    avalanche: 6,
    bsc: 6,
    solana: 32
  },
  successRate: 99.5 // Taxa de sucesso esperada
} as const;

// 💰 FUNÇÕES UTILITÁRIAS
export const calculateServiceFee = (transactionValue: number): number => {
  const fee = transactionValue * FEE_CONFIG.percentage;
  return Math.min(fee, FEE_CONFIG.maximumFee);
};

export const getDestinationWallet = (network: SupportedNetwork): string => {
  return REVENUE_WALLETS[network];
};

export const getBlockExplorer = (network: SupportedNetwork): string => {
  return BLOCK_EXPLORERS[network];
};

export const getWalletExplorerUrl = (network: SupportedNetwork): string => {
  const wallet = getDestinationWallet(network);
  const explorer = getBlockExplorer(network);
  
  if (network === 'solana') {
    return `${explorer}/account/${wallet}`;
  } else {
    return `${explorer}/address/${wallet}`;
  }
};

// 📈 PROJEÇÕES DE REVENUE
export const calculateRevenueProjection = (dailyVolume: number) => {
  const dailyRevenue = dailyVolume * FEE_CONFIG.percentage;
  
  return {
    daily: dailyRevenue,
    weekly: dailyRevenue * 7,
    monthly: dailyRevenue * 30,
    yearly: dailyRevenue * 365
  };
};

// 🎯 EXEMPLOS DE REVENUE
export const REVENUE_EXAMPLES = {
  conservative: calculateRevenueProjection(100000),   // $100k/dia
  moderate: calculateRevenueProjection(1000000),      // $1M/dia  
  optimistic: calculateRevenueProjection(10000000)    // $10M/dia
} as const;

// 🚀 STATUS DO SISTEMA
export const SYSTEM_STATUS = {
  version: '1.0.0',
  networks: SUPPORTED_NETWORKS.length,
  exchanges: 22, // Total de exchanges integradas
  readyForProduction: true,
  lastUpdated: '2024-01-15'
} as const;