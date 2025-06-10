'use client';

import React from 'react';
// WALLET TEMPORARILY DISABLED - import { ProfessionalWalletConnect } from './ProfessionalWalletConnect';
import { Wallet } from 'lucide-react';

export function DashboardBitcoinWallet() {
  // WALLET TEMPORARILY DISABLED - return <ProfessionalWalletConnect />;
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="text-center">
        <Wallet className="h-6 w-6 mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400 text-sm">Wallet temporarily disabled</p>
      </div>
    </div>
  );
}