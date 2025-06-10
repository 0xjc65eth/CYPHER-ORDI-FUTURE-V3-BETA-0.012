'use client';

import React from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';
import { ArbitrageScanner } from '@/components/arbitrage/ArbitrageScanner';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArbitragePage() {
  return (
    <TopNavLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-gray-400">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Arbitrage Scanner</span>
            </div>
          </div>
          
          <div className="text-right">
            <h1 className="text-2xl font-bold text-white">Professional Arbitrage Hub</h1>
            <p className="text-sm text-gray-400">Real-time cross-marketplace opportunities</p>
          </div>
        </div>
        
        <ArbitrageScanner />
      </div>
    </TopNavLayout>
  );
}