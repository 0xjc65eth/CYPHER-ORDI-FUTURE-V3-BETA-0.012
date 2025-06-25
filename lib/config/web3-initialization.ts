// Web3 Initialization Configuration for CYPHER ORDi Future V3
// Secure multi-chain wallet integration with production-ready settings

export interface NetworkConfig {
  id: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  apiUrl: string;
  isTestnet: boolean;
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: 'bitcoin-mainnet',
    name: 'Bitcoin Mainnet',
    rpcUrl: 'https://api.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    apiUrl: 'https://api.hiro.so',
    isTestnet: false
  },
  {
    id: 'bitcoin-testnet',
    name: 'Bitcoin Testnet',
    rpcUrl: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.testnet.hiro.so',
    apiUrl: 'https://api.testnet.hiro.so',
    isTestnet: true
  }
];

export function getSupportedNetworks(): NetworkConfig[] {
  const enableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true';
  
  if (enableTestnets) {
    return SUPPORTED_NETWORKS;
  }
  
  return SUPPORTED_NETWORKS.filter(network => !network.isTestnet);
}

// Função segura para inicialização
export function safeGetNetworkConfig(): { supportedNetworks: NetworkConfig[] } {
  try {
    const networks = getSupportedNetworks();
    
    if (!networks || networks.length === 0) {
      console.warn('Nenhuma rede configurada, usando padrão');
      return {
        supportedNetworks: [SUPPORTED_NETWORKS[0]] // Bitcoin Mainnet como fallback
      };
    }
    
    return { supportedNetworks: networks };
  } catch (error) {
    console.error('Erro ao carregar configuração de redes:', error);
    return {
      supportedNetworks: [SUPPORTED_NETWORKS[0]]
    };
  }
}

// Legacy support - manter compatibilidade com código existente
export const DEFAULT_NETWORK = 'bitcoin-mainnet'
export const DEFAULT_TESTNET = 'bitcoin-testnet'

export const WEB3_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || 'cypher-ordi-future-v3',
  supportedNetworks: SUPPORTED_NETWORKS,
  defaultNetwork: DEFAULT_NETWORK,
  enableTestnets: process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true',
  autoConnect: false,
  timeout: 10000,
  retryAttempts: 3
} as const

export function getNetworkConfig(networkId: string): NetworkConfig | undefined {
  return SUPPORTED_NETWORKS.find(network => network.id === networkId);
}

export function isTestnet(networkId: string): boolean {
  const config = getNetworkConfig(networkId);
  return config?.isTestnet || false;
}

export function getAvailableNetworks(includeTestnets = false): NetworkConfig[] {
  return SUPPORTED_NETWORKS.filter(
    network => includeTestnets || !network.isTestnet
  );
}