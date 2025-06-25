/**
 * Web3 Initialization Configuration
 * CYPHER ORDi FUTURE V3
 */

import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

// Web3 Configuration
export const web3Config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// App Kit Configuration
export const appKitConfig = {
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  metadata: {
    name: 'CYPHER ORDi FUTURE V3',
    description: 'Advanced Bitcoin Trading Intelligence Platform',
    url: 'https://cypher-ordi-future.vercel.app',
    icons: ['https://cypher-ordi-future.vercel.app/favicon.ico']
  },
  enableAnalytics: false,
  enableOnramp: false,
  enableSwaps: false,
};

// Wallet connection configuration
export const walletConfig = {
  autoConnect: true,
  connectors: {
    injected: true,
    walletConnect: true,
    metaMask: true,
  },
  chains: [mainnet, sepolia],
  publicClient: {
    pollingInterval: 4000,
  },
};

// Bitcoin network configuration
export const bitcoinConfig = {
  network: process.env.NEXT_PUBLIC_BITCOIN_NETWORK || 'mainnet',
  providers: {
    mempool: 'https://mempool.space/api',
    blockstream: 'https://blockstream.info/api',
    hiro: 'https://api.hiro.so',
  },
};

// Initialize Web3 providers
export function initializeWeb3() {
  if (typeof window === 'undefined') return;
  
  try {
    // Initialize wallet detection
    if (window.ethereum) {
      console.log('Ethereum provider detected');
    }
    
    // Initialize Bitcoin wallets
    if (window.unisat) {
      console.log('Unisat wallet detected');
    }
    
    if (window.xverse) {
      console.log('Xverse wallet detected');
    }
    
    if (window.LeatherProvider) {
      console.log('Leather wallet detected');
    }
    
    return true;
  } catch (error) {
    console.warn('Web3 initialization failed:', error);
    return false;
  }
}

// Network configuration interface
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  supportedNetworks?: string[];
}

// Safe network configuration getter
export function safeGetNetworkConfig(networkId?: string): NetworkConfig {
  const defaultConfig: NetworkConfig = {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    supportedNetworks: ['ethereum', 'bitcoin']
  };

  try {
    // Return network-specific configuration based on networkId
    switch (networkId) {
      case 'ethereum':
      case 'mainnet':
        return defaultConfig;
      case 'sepolia':
        return {
          name: 'Sepolia Testnet',
          chainId: 11155111,
          rpcUrl: 'https://sepolia.infura.io/v3',
          blockExplorer: 'https://sepolia.etherscan.io',
          nativeCurrency: {
            name: 'Sepolia Ethereum',
            symbol: 'SEP',
            decimals: 18
          },
          supportedNetworks: ['ethereum', 'sepolia']
        };
      default:
        return defaultConfig;
    }
  } catch (error) {
    console.warn('Failed to get network config, using default:', error);
    return defaultConfig;
  }
}

// Export default configuration
export default {
  web3Config,
  appKitConfig,
  walletConfig,
  bitcoinConfig,
  initializeWeb3,
  safeGetNetworkConfig,
};