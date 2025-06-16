/**
 * 🔌 AGENT_006: Multi-Wallet Integration System
 * Bitcoin Wallets: XVERSE, UNISAT, Magic Eden + Hardware Wallets
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Wallet Types & Interfaces
export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
  connected: boolean;
  address?: string;
  balance?: number;
  network?: 'mainnet' | 'testnet';
  features: WalletFeature[];
}

export interface WalletFeature {
  type: 'ordinals' | 'runes' | 'brc20' | 'payment' | 'stacking';
  supported: boolean;
  address?: string;
}

export interface WalletConnection {
  wallet: WalletInfo;
  addresses: {
    payment: string;
    ordinals: string;
    stacks?: string;
  };
  publicKey: string;
  network: string;
}

// Wallet Context
interface WalletContextType {
  wallets: WalletInfo[];
  activeWallet: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connectWallet: (walletId: string) => Promise<void>;
  disconnectWallet: () => void;
  switchWallet: (walletId: string) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  sendBitcoin: (to: string, amount: number) => Promise<string>;
  sendOrdinal: (to: string, inscriptionId: string) => Promise<string>;
  sendRune: (to: string, runeName: string, amount: number) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Supported Wallets Configuration
export const SUPPORTED_WALLETS: Record<string, WalletInfo> = {
  xverse: {
    id: 'xverse',
    name: 'Xverse',
    icon: '/wallets/xverse.svg',
    installed: false,
    connected: false,
    features: [
      { type: 'payment', supported: true },
      { type: 'ordinals', supported: true },
      { type: 'runes', supported: true },
      { type: 'brc20', supported: true },
      { type: 'stacking', supported: true }
    ]
  },
  unisat: {
    id: 'unisat',
    name: 'UniSat',
    icon: '/wallets/unisat.svg',
    installed: false,
    connected: false,
    features: [
      { type: 'payment', supported: true },
      { type: 'ordinals', supported: true },
      { type: 'runes', supported: true },
      { type: 'brc20', supported: true },
      { type: 'stacking', supported: false }
    ]
  }
};

// Wallet Provider Component
export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<WalletInfo[]>(Object.values(SUPPORTED_WALLETS));
  const [activeWallet, setActiveWallet] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async (walletId: string): Promise<void> => {
    setIsConnecting(true);
    setError(null);

    try {
      let connection: WalletConnection | null = null;

      switch (walletId) {
        case 'xverse':
          connection = await connectXverse();
          break;
        case 'unisat':
          connection = await connectUnisat();
          break;
        case 'magiceden':
          connection = await connectMagicEden();
          break;
        default:
          throw new Error(`Unsupported wallet: ${walletId}`);
      }

      if (connection) {
        setActiveWallet(connection);
        setWallets(prev => prev.map(w => 
          w.id === walletId 
            ? { ...w, connected: true, address: connection.addresses.payment }
            : { ...w, connected: false }
        ));
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setActiveWallet(null);
    setWallets(prev => prev.map(w => ({ ...w, connected: false })));
  };

  const switchWallet = async (walletId: string) => {
    disconnectWallet();
    await connectWallet(walletId);
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!activeWallet) throw new Error('No wallet connected');
    
    try {
      switch (activeWallet.wallet.id) {
        case 'xverse':
          if (typeof window !== 'undefined' && (window as any).XverseProviders?.BitcoinProvider) {
            return await (window as any).XverseProviders.BitcoinProvider.signMessage(message);
          }
          break;
        case 'unisat':
          if (typeof window !== 'undefined' && (window as any).unisat) {
            return await (window as any).unisat.signMessage(message);
          }
          break;
        case 'magiceden':
          if (typeof window !== 'undefined' && (window as any).magicEden?.bitcoin) {
            return await (window as any).magicEden.bitcoin.signMessage(message);
          }
          break;
        default:
          throw new Error(`Wallet ${activeWallet.wallet.name} not supported for message signing`);
      }
      throw new Error('Wallet provider not found');
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  const sendBitcoin = async (to: string, amount: number): Promise<string> => {
    if (!activeWallet) throw new Error('No wallet connected');
    
    try {
      switch (activeWallet.wallet.id) {
        case 'xverse':
          if (typeof window !== 'undefined' && (window as any).XverseProviders?.BitcoinProvider) {
            return await (window as any).XverseProviders.BitcoinProvider.sendTransfer({
              recipients: [{ address: to, amount }]
            });
          }
          break;
        case 'unisat':
          if (typeof window !== 'undefined' && (window as any).unisat) {
            return await (window as any).unisat.sendBitcoin(to, amount);
          }
          break;
        default:
          throw new Error(`Wallet ${activeWallet.wallet.name} not supported for Bitcoin transfers`);
      }
      throw new Error('Wallet provider not found');
    } catch (error) {
      console.error('Error sending Bitcoin:', error);
      throw error;
    }
  };

  const sendOrdinal = async (to: string, inscriptionId: string): Promise<string> => {
    if (!activeWallet) throw new Error('No wallet connected');
    
    try {
      switch (activeWallet.wallet.id) {
        case 'xverse':
          if (typeof window !== 'undefined' && (window as any).XverseProviders?.BitcoinProvider) {
            return await (window as any).XverseProviders.BitcoinProvider.sendInscription({
              address: to,
              inscriptionId
            });
          }
          break;
        case 'unisat':
          if (typeof window !== 'undefined' && (window as any).unisat) {
            return await (window as any).unisat.sendInscription(to, inscriptionId);
          }
          break;
        case 'magiceden':
          if (typeof window !== 'undefined' && (window as any).magicEden?.bitcoin) {
            return await (window as any).magicEden.bitcoin.sendOrdinal(to, inscriptionId);
          }
          break;
        default:
          throw new Error(`Wallet ${activeWallet.wallet.name} not supported for Ordinal transfers`);
      }
      throw new Error('Wallet provider not found');
    } catch (error) {
      console.error('Error sending Ordinal:', error);
      throw error;
    }
  };

  const sendRune = async (to: string, runeName: string, amount: number): Promise<string> => {
    if (!activeWallet) throw new Error('No wallet connected');
    
    try {
      switch (activeWallet.wallet.id) {
        case 'xverse':
          if (typeof window !== 'undefined' && (window as any).XverseProviders?.BitcoinProvider) {
            return await (window as any).XverseProviders.BitcoinProvider.sendRune({
              address: to,
              runeName,
              amount
            });
          }
          break;
        case 'unisat':
          // Unisat may not support Runes yet
          throw new Error('Runes not yet supported by Unisat');
        case 'magiceden':
          if (typeof window !== 'undefined' && (window as any).magicEden?.bitcoin) {
            return await (window as any).magicEden.bitcoin.sendRune(to, runeName, amount);
          }
          break;
        default:
          throw new Error(`Wallet ${activeWallet.wallet.name} not supported for Rune transfers`);
      }
      throw new Error('Wallet provider not found');
    } catch (error) {
      console.error('Error sending Rune:', error);
      throw error;
    }
  };

  const contextValue: WalletContextType = {
    wallets,
    activeWallet,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchWallet,
    signMessage,
    sendBitcoin,
    sendOrdinal,
    sendRune
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export default WalletProvider;

// Wallet connection functions
const connectXverse = async (): Promise<WalletConnection> => {
  if (typeof window !== 'undefined' && (window as any).XverseProviders) {
    const xverse = (window as any).XverseProviders.getProvider();
    
    const response = await xverse.connect();
    
    return {
      wallet: {
        ...SUPPORTED_WALLETS.xverse,
        installed: true,
        connected: true,
        address: response.addresses.payment,
        balance: 0 // Will be fetched separately
      },
      addresses: {
        payment: response.addresses.payment,
        ordinals: response.addresses.ordinals
      },
      publicKey: response.publicKey,
      network: 'mainnet'
    };
  }
  throw new Error('Xverse wallet not installed');
};

const connectUnisat = async (): Promise<WalletConnection> => {
  if (typeof window !== 'undefined' && (window as any).unisat) {
    const unisat = (window as any).unisat;
    
    const accounts = await unisat.requestAccounts();
    const publicKey = await unisat.getPublicKey();
    const network = await unisat.getNetwork();
    
    return {
      wallet: {
        ...SUPPORTED_WALLETS.unisat,
        installed: true,
        connected: true,
        address: accounts[0],
        balance: 0
      },
      addresses: {
        payment: accounts[0],
        ordinals: accounts[0]
      },
      publicKey,
      network: network.toLowerCase()
    };
  }
  throw new Error('UniSat wallet not installed');
};

const connectMagicEden = async (): Promise<WalletConnection> => {
  if (typeof window !== 'undefined' && (window as any).magicEden) {
    const magicEden = (window as any).magicEden.bitcoin;
    
    const response = await magicEden.connect();
    
    return {
      wallet: {
        id: 'magiceden',
        name: 'Magic Eden',
        icon: '/wallets/magiceden.svg',
        installed: true,
        connected: true,
        address: response.address,
        balance: 0,
        features: [
          { type: 'payment', supported: true },
          { type: 'ordinals', supported: true },
          { type: 'runes', supported: true },
          { type: 'brc20', supported: true },
          { type: 'stacking', supported: false }
        ]
      },
      addresses: {
        payment: response.address,
        ordinals: response.address
      },
      publicKey: response.publicKey || '',
      network: 'mainnet'
    };
  }
  throw new Error('Magic Eden wallet not installed');
};