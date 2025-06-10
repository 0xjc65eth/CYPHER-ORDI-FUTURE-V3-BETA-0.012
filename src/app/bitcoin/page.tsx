'use client';

import React from 'react';
import { OrdinalsHub } from '@/components/bitcoin/OrdinalsHub';
import { RunesMarket } from '@/components/bitcoin/RunesMarket';
import { RareSatsExplorer } from '@/components/bitcoin/RareSatsExplorer';
import { HotMintsTracker } from '@/components/bitcoin/HotMintsTracker';

export default function BitcoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ₿ Bitcoin Ecosystem
          </h1>
          <p className="text-gray-300 text-lg">
            Comprehensive Ordinals, Runes & Rare Sats Analytics
          </p>
        </div>

        {/* Ordinals Hub */}
        <section>
          <OrdinalsHub />
        </section>

        {/* Runes Market */}
        <section>
          <RunesMarket />
        </section>

        {/* Hot Mints Tracker */}
        <section>
          <HotMintsTracker />
        </section>

        {/* Rare Sats Explorer */}
        <section>
          <RareSatsExplorer />
        </section>
      </div>
    </div>
  );
}