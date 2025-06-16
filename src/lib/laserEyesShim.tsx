import React, { createContext, useContext, ReactNode } from 'react';

// Interfaces para prevenir tipos indefinidos
interface LaserEyesContextType {
  address: string | null;
  connected: boolean;
  connecting: boolean;
  network: string;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendBitcoin: (to: string, amount: number) => Promise<string>;
  signMessage: (message: string) => Promise<string>;
  payInvoice: (invoice: string) => Promise<string>;
}

// Context com valores padrão seguros
const LaserEyesContext = createContext<LaserEyesContextType>({
  address: null,
  connected: false,
  connecting: false,
  network: 'mainnet',
  balance: 0,
  connect: async () => {
    console.warn('LaserEyes: connect not implemented');
  },
  disconnect: () => {
    console.warn('LaserEyes: disconnect not implemented');
  },
  sendBitcoin: async () => {
    console.warn('LaserEyes: sendBitcoin not implemented');
    return '';
  },
  signMessage: async () => {
    console.warn('LaserEyes: signMessage not implemented');
    return '';
  },
  payInvoice: async () => {
    console.warn('LaserEyes: payInvoice not implemented');
    return '';
  },
});

// Proxy seguro para evitar loop infinito
const createSafeProxy = (target: any, depth = 0): any => {
  // Limite de profundidade para evitar loops infinitos
  if (depth > 5) {
    return target;
  }

  return new Proxy(target, {
    get(obj, prop) {
      // Evitar loops com propriedades específicas
      if (prop === 'pow' || prop === Symbol.toPrimitive || prop === 'valueOf') {
        return undefined;
      }

      const value = obj[prop];
      
      // Se é uma função, retornar versão segura
      if (typeof value === 'function') {
        return function(...args: any[]) {
          try {
            return value.apply(obj, args);
          } catch (error) {
            console.error(`LaserEyes proxy error in ${String(prop)}:`, error);
            return undefined;
          }
        };
      }

      // Se é um objeto, aplicar proxy recursivamente (com limite)
      if (value && typeof value === 'object') {
        return createSafeProxy(value, depth + 1);
      }

      return value;
    },

    set(obj, prop, value) {
      try {
        obj[prop] = value;
        return true;
      } catch (error) {
        console.error(`LaserEyes proxy set error in ${String(prop)}:`, error);
        return false;
      }
    },

    has(obj, prop) {
      return prop in obj;
    },

    ownKeys(obj) {
      return Reflect.ownKeys(obj);
    },

    getOwnPropertyDescriptor(obj, prop) {
      return Reflect.getOwnPropertyDescriptor(obj, prop);
    }
  });
};

// Provider component com error boundary
interface LaserEyesProviderProps {
  children: ReactNode;
}

export const LaserEyesProvider: React.FC<LaserEyesProviderProps> = ({ children }) => {
  const [state, setState] = React.useState<Partial<LaserEyesContextType>>({
    address: null,
    connected: false,
    connecting: false,
    network: 'mainnet',
    balance: 0,
  });

  const [error, setError] = React.useState<string | null>(null);

  // Implementação segura das funções
  const connect = React.useCallback(async () => {
    try {
      setState(prev => ({ ...prev, connecting: true }));
      setError(null);
      
      // Simular conexão para evitar erros
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        connected: true,
        connecting: false,
        address: 'bc1q...' // Mock address
      }));
    } catch (error) {
      console.error('LaserEyes connect error:', error);
      setError('Failed to connect wallet');
      setState(prev => ({ ...prev, connecting: false }));
    }
  }, []);

  const disconnect = React.useCallback(() => {
    try {
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        address: null,
        balance: 0
      }));
      setError(null);
    } catch (error) {
      console.error('LaserEyes disconnect error:', error);
    }
  }, []);

  const sendBitcoin = React.useCallback(async (to: string, amount: number): Promise<string> => {
    try {
      if (!state.connected) {
        throw new Error('Wallet not connected');
      }
      
      // Mock implementation
      console.log(`Sending ${amount} BTC to ${to}`);
      return 'mock_transaction_id';
    } catch (error) {
      console.error('LaserEyes sendBitcoin error:', error);
      throw error;
    }
  }, [state.connected]);

  const signMessage = React.useCallback(async (message: string): Promise<string> => {
    try {
      if (!state.connected) {
        throw new Error('Wallet not connected');
      }
      
      // Mock implementation
      console.log(`Signing message: ${message}`);
      return 'mock_signature';
    } catch (error) {
      console.error('LaserEyes signMessage error:', error);
      throw error;
    }
  }, [state.connected]);

  const payInvoice = React.useCallback(async (invoice: string): Promise<string> => {
    try {
      if (!state.connected) {
        throw new Error('Wallet not connected');
      }
      
      // Mock implementation
      console.log(`Paying invoice: ${invoice}`);
      return 'mock_payment_id';
    } catch (error) {
      console.error('LaserEyes payInvoice error:', error);
      throw error;
    }
  }, [state.connected]);

  const contextValue: LaserEyesContextType = React.useMemo(() => ({
    address: state.address || null,
    connected: state.connected || false,
    connecting: state.connecting || false,
    network: state.network || 'mainnet',
    balance: state.balance || 0,
    connect,
    disconnect,
    sendBitcoin,
    signMessage,
    payInvoice,
  }), [state, connect, disconnect, sendBitcoin, signMessage, payInvoice]);

  // Error boundary interno
  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500 text-red-300 rounded">
        <p>LaserEyes Error: {error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <LaserEyesContext.Provider value={contextValue}>
      {children}
    </LaserEyesContext.Provider>
  );
};

// Hook personalizado com validação
export const useLaserEyes = (): LaserEyesContextType => {
  const context = useContext(LaserEyesContext);
  
  if (!context) {
    console.warn('useLaserEyes must be used within a LaserEyesProvider');
    return {
      address: null,
      connected: false,
      connecting: false,
      network: 'mainnet',
      balance: 0,
      connect: async () => {},
      disconnect: () => {},
      sendBitcoin: async () => '',
      signMessage: async () => '',
      payInvoice: async () => '',
    };
  }
  
  return context;
};

// Função utilitária para criar proxies seguros
export const createSafeLaserEyes = (originalLaserEyes?: any) => {
  if (!originalLaserEyes) {
    return createSafeProxy({});
  }
  
  return createSafeProxy(originalLaserEyes);
};

// Helper para importação segura
export const safeLaserEyesImport = async () => {
  try {
    // Aguardar um tick para garantir que patches foram aplicados
    await new Promise(resolve => setTimeout(resolve, 0));
    
    return {
      LaserEyesProvider,
      useLaserEyes,
      createSafeProxy,
    };
  } catch (error) {
    console.error('🚨 Erro ao importar LaserEyes:', error);
    
    // Fallback: retornar mock básico
    return {
      LaserEyesProvider: ({ children }: { children: React.ReactNode }) => children,
      useLaserEyes: () => ({
        isConnected: false,
        connect: async () => false,
        disconnect: async () => {},
        address: '',
        balance: 0
      })
    };
  }
};

// Export padrão seguro
const LaserEyes = {
  Provider: LaserEyesProvider,
  useLaserEyes,
  createSafeProxy,
};

export default LaserEyes;