'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface BitcoinWalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: 'mainnet' | 'testnet';
  provider: string | null;
}

export interface BitcoinWalletAction {
  type: 'CONNECT' | 'DISCONNECT' | 'UPDATE_BALANCE' | 'SET_NETWORK';
  payload?: any;
}

const initialState: BitcoinWalletState = {
  isConnected: false,
  address: null,
  balance: 0,
  network: 'mainnet',
  provider: null
};

function walletReducer(state: BitcoinWalletState, action: BitcoinWalletAction): BitcoinWalletState {
  switch (action.type) {
    case 'CONNECT':
      return {
        ...state,
        isConnected: true,
        address: action.payload.address,
        provider: action.payload.provider
      };
    case 'DISCONNECT':
      return initialState;
    case 'UPDATE_BALANCE':
      return {
        ...state,
        balance: action.payload
      };
    case 'SET_NETWORK':
      return {
        ...state,
        network: action.payload
      };
    default:
      return state;
  }
}

export const BitcoinWalletContext = createContext<{
  state: BitcoinWalletState;
  dispatch: React.Dispatch<BitcoinWalletAction>;
  connectWallet: (provider: string) => Promise<void>;
  disconnectWallet: () => void;
}>({
  state: initialState,
  dispatch: () => {},
  connectWallet: async () => {},
  disconnectWallet: () => {}
});

export function BitcoinWalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const connectWallet = async (provider: string) => {
    try {
      // Mock connection for demo
      const mockAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      dispatch({
        type: 'CONNECT',
        payload: { address: mockAddress, provider }
      });
      
      // Mock balance
      dispatch({
        type: 'UPDATE_BALANCE',
        payload: Math.random() * 10
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT' });
  };

  return (
    <BitcoinWalletContext.Provider value={{
      state,
      dispatch,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </BitcoinWalletContext.Provider>
  );
}

export const useBitcoinWallet = () => {
  const context = useContext(BitcoinWalletContext);
  if (!context) {
    throw new Error('useBitcoinWallet must be used within a BitcoinWalletProvider');
  }
  return context;
};