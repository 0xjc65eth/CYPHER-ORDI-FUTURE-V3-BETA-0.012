'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

// WALLET TEMPORARILY DISABLED - ENTIRE COMPONENT REPLACED WITH PLACEHOLDER
// Original imports commented out:
// import { useWalletContext as useWallet, type WalletName } from '@/contexts/WalletContext';
// import { useWalletPortfolio } from '@/hooks/useWalletPortfolio';

export function ProfessionalWalletConnect() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="text-center">
        <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-500" />
        <h3 className="text-lg font-semibold text-white mb-1">Wallet Connection</h3>
        <p className="text-gray-400 text-sm">Wallet functionality temporarily disabled</p>
        <Button 
          disabled 
          className="mt-3 bg-gray-700 text-gray-500 cursor-not-allowed"
        >
          Connect Wallet (Disabled)
        </Button>
      </div>
    </div>
  );
}

// Original component code has been commented out for wallet removal