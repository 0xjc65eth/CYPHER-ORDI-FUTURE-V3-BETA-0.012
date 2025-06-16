import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
};

const polygon = {
  chainId: 137,
  name: 'Polygon',
  currency: 'MATIC',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon-rpc.com'
};

const arbitrum = {
  chainId: 42161,
  name: 'Arbitrum',
  currency: 'ETH',
  explorerUrl: 'https://arbiscan.io',
  rpcUrl: 'https://arb1.arbitrum.io/rpc'
};

const optimism = {
  chainId: 10,
  name: 'Optimism',
  currency: 'ETH',
  explorerUrl: 'https://optimistic.etherscan.io',
  rpcUrl: 'https://mainnet.optimism.io'
};

const base = {
  chainId: 8453,
  name: 'Base',
  currency: 'ETH',
  explorerUrl: 'https://basescan.org',
  rpcUrl: 'https://mainnet.base.org'
};

const avalanche = {
  chainId: 43114,
  name: 'Avalanche',
  currency: 'AVAX',
  explorerUrl: 'https://snowtrace.io',
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
};

const bsc = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://bsc-dataseed.binance.org'
};

// 3. Create modal
const metadata = {
  name: 'CYPHER ORDI FUTURE V3',
  description: 'Professional Bitcoin & Multi-Chain Trading Platform',
  url: 'https://cypher-ordi-future.com',
  icons: ['https://cypher-ordi-future.com/logo.png']
};

export const config = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  defaultChainId: 1,
  rpcUrl: '...'
});

export const web3Modal = createWeb3Modal({
  ethersConfig: config,
  chains: [mainnet, polygon, arbitrum, optimism, base, avalanche, bsc],
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#f97316',
    '--w3m-color-mix-strength': 20
  }
});

export { mainnet, polygon, arbitrum, optimism, base, avalanche, bsc };

// Export supported chain configurations for components
export const SUPPORTED_EVM_CHAINS = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://cloudflare-eth.com'] } },
    blockExplorers: { default: { name: 'Etherscan', url: 'https://etherscan.io' } }
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: { default: { http: ['https://polygon-rpc.com'] } },
    blockExplorers: { default: { name: 'Polygonscan', url: 'https://polygonscan.com' } }
  },
  {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ARB',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://arb1.arbitrum.io/rpc'] } },
    blockExplorers: { default: { name: 'Arbiscan', url: 'https://arbiscan.io' } }
  },
  {
    id: 10,
    name: 'Optimism',
    symbol: 'OP',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://mainnet.optimism.io'] } },
    blockExplorers: { default: { name: 'Optimistic Etherscan', url: 'https://optimistic.etherscan.io' } }
  },
  {
    id: 8453,
    name: 'Base',
    symbol: 'BASE',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://mainnet.base.org'] } },
    blockExplorers: { default: { name: 'Basescan', url: 'https://basescan.org' } }
  },
  {
    id: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    rpcUrls: { default: { http: ['https://api.avax.network/ext/bc/C/rpc'] } },
    blockExplorers: { default: { name: 'Snowtrace', url: 'https://snowtrace.io' } }
  },
  {
    id: 56,
    name: 'BSC',
    symbol: 'BNB',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: { default: { http: ['https://bsc-dataseed.binance.org'] } },
    blockExplorers: { default: { name: 'BscScan', url: 'https://bscscan.com' } }
  }
];

export const SUPPORTED_SOLANA_CHAINS = [
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
    rpcUrls: { default: { http: ['https://api.mainnet-beta.solana.com'] } },
    blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } }
  }
];