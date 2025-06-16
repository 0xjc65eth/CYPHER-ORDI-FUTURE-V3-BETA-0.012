'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBitcoinWallet } from '@/services/BitcoinWalletConnect';

interface WalletState {
  isConnected: boolean;
  walletType: string | null;
  address: string | null;
  publicKey: string | null;
  balance: any;
  ordinalsBalance: any[];
  runesBalance: any[];
}

interface AvailableWallet {
  name: string;
  id: string;
  icon: string;
  provider: any;
}

export const useBitcoinWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletType: null,
    address: null,
    publicKey: null,
    balance: null,
    ordinalsBalance: [],
    runesBalance: []
  });
  
  const [availableWallets, setAvailableWallets] = useState<AvailableWallet[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bitcoinWallet = getBitcoinWallet();

  // Update wallet state
  const updateWalletState = useCallback(() => {
    const currentState = bitcoinWallet.getWalletState();
    setWalletState(currentState);
  }, [bitcoinWallet]);

  // Detect available wallets
  const detectWallets = useCallback(() => {
    const wallets = bitcoinWallet.detectWallets();
    setAvailableWallets(wallets);
  }, [bitcoinWallet]);

  // Connect to wallet
  const connect = useCallback(async (walletId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const result = await bitcoinWallet.connect(walletId);
      
      if (result.success) {
        updateWalletState();
        return result;
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to connect wallet';
      setError(errorMessage);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [bitcoinWallet, updateWalletState]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    bitcoinWallet.disconnect();
    updateWalletState();
    setError(null);
  }, [bitcoinWallet, updateWalletState]);

  // Refresh wallet info
  const refreshWalletInfo = useCallback(async () => {
    if (walletState.isConnected) {
      try {
        await bitcoinWallet.getWalletInfo();
        updateWalletState();
      } catch (error: any) {
        console.error('Error refreshing wallet info:', error);
        setError(error.message || 'Failed to refresh wallet info');
      }
    }
  }, [bitcoinWallet, walletState.isConnected, updateWalletState]);

  // Sign transaction
  const signTransaction = useCallback(async (transaction: string) => {
    if (!walletState.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      return await bitcoinWallet.signTransaction(transaction);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sign transaction';
      setError(errorMessage);
      throw error;
    }
  }, [bitcoinWallet, walletState.isConnected]);

  // Get balance in different formats
  const getFormattedBalance = useCallback(() => {
    const { balance } = walletState;
    
    if (!balance) return { btc: '0', satoshis: '0', usd: '0' };
    
    let satoshis = 0;
    
    if (typeof balance === 'number') {
      satoshis = balance;
    } else if (balance.total !== undefined) {
      satoshis = balance.total;
    } else if (balance.confirmed !== undefined) {
      satoshis = balance.confirmed;
    }
    
    const btc = (satoshis / 100000000).toFixed(8);
    
    return {
      btc,
      satoshis: satoshis.toString(),
      usd: '0' // TODO: Calculate USD value
    };
  }, [walletState.balance]);

  // Format address for display
  const getFormattedAddress = useCallback(() => {
    const { address } = walletState;
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [walletState.address]);

  // Check if specific wallet is available
  const isWalletAvailable = useCallback((walletId: string) => {
    return availableWallets.some(wallet => wallet.id === walletId);
  }, [availableWallets]);

  // Initialize on mount
  useEffect(() => {
    updateWalletState();
    detectWallets();
  }, [updateWalletState, detectWallets]);

  // Auto-refresh wallet info periodically
  useEffect(() => {
    if (walletState.isConnected) {
      const interval = setInterval(() => {
        refreshWalletInfo();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [walletState.isConnected, refreshWalletInfo]);

  return {
    // State
    walletState,
    availableWallets,
    isConnecting,
    error,
    
    // Actions
    connect,
    disconnect,
    refreshWalletInfo,
    signTransaction,
    
    // Utilities
    getFormattedBalance,
    getFormattedAddress,
    isWalletAvailable,
    detectWallets,
    
    // Computed values
    isConnected: walletState.isConnected,
    address: walletState.address,
    walletType: walletState.walletType,
    balance: walletState.balance,
    ordinalsCount: walletState.ordinalsBalance?.length || 0,
    runesCount: walletState.runesBalance?.length || 0
  };
};

export default useBitcoinWallet;