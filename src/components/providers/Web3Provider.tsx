'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { safeGetNetworkConfig, NetworkConfig } from '@/lib/config/web3-initialization';

interface Web3ContextType {
  isInitialized: boolean;
  supportedNetworks: NetworkConfig[];
  currentNetwork: NetworkConfig | null;
  error: string | null;
  healthChecks: Record<string, boolean>;
}

const Web3Context = createContext<Web3ContextType>({
  isInitialized: false,
  supportedNetworks: [],
  currentNetwork: null,
  error: null,
  healthChecks: {}
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Web3ContextType>({
    isInitialized: false,
    supportedNetworks: [],
    currentNetwork: null,
    error: null,
    healthChecks: {}
  });

  useEffect(() => {
    // Inicialização segura apenas no cliente
    if (typeof window === 'undefined') return;

    const initializeWeb3 = async () => {
      try {
        // Obter configuração de forma segura
        const config = safeGetNetworkConfig();
        
        if (!config.supportedNetworks || config.supportedNetworks.length === 0) {
          throw new Error('Nenhuma rede suportada configurada');
        }

        // Health checks com timeout
        const healthChecks: Record<string, boolean> = {};
        
        for (const networkName of config.supportedNetworks || []) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            // Get API URL based on network name
            let apiUrl = 'https://api.hiro.so';
            if (networkName === 'bitcoin') {
              apiUrl = 'https://mempool.space/api';
            } else if (networkName === 'ethereum') {
              apiUrl = 'https://api.etherscan.io/api';
            }
            
            const response = await fetch(`${apiUrl}/v2/info`, {
              signal: controller.signal,
              headers: {
                'x-api-key': process.env.NEXT_PUBLIC_HIRO_API_KEY || ''
              }
            });
            
            clearTimeout(timeoutId);
            healthChecks[networkName] = response.ok;
          } catch (error) {
            console.warn(`Health check falhou para ${networkName}:`, error);
            healthChecks[networkName] = false;
          }
        }

        setState({
          isInitialized: true,
          supportedNetworks: config.supportedNetworks,
          currentNetwork: config.supportedNetworks[0],
          error: null,
          healthChecks
        });

      } catch (error) {
        console.error('Erro na inicialização Web3:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          isInitialized: false
        }));
      }
    };

    // Delay para garantir que o DOM está pronto
    const timer = setTimeout(initializeWeb3, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Web3Context.Provider value={state}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 deve ser usado dentro de Web3Provider');
  }
  return context;
};