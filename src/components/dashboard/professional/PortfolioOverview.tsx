'use client';

import React from 'react';
import { WalletConnector } from '@/components/wallet/WalletConnector';

export function PortfolioOverview() {
  return (
    <div className="space-y-4">
      <WalletConnector />
    </div>
  );
}