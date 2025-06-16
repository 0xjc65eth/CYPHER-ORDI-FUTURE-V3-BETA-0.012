'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import WalletButton from './WalletButton';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export const SafeWalletButton: React.FC = () => {
  const { isConnected, connect } = useWallet();
  
  // Check if we're in a safe environment and if connected
  const isSafeEnvironment = typeof connect === 'function' && connect.name !== 'connect';
  
  // If not in safe environment, show interactive fallback button
  if (!isSafeEnvironment) {
    return (
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-gray-800 border-gray-600 hover:bg-gray-700 text-sm px-3 py-2 transition-colors"
        onClick={() => {
          alert('🔌 Wallet functionality will be available once you set up OAuth providers.\n\nFor now, enjoy the demo features!');
        }}
      >
        <Wallet className="w-4 h-4" />
        {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
      </Button>
    );
  }
  
  // Safe environment, render the full WalletButton
  return <WalletButton />;
};