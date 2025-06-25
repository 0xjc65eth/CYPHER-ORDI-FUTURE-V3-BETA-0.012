'use client';

import React from 'react';
import { GuaranteedChart } from '@/components/charts/GuaranteedChart';
import { Card } from '@/components/ui/card';

export default function ChartTestFinalPage() {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Chart Component Final Test
          </h1>
          <p className="text-gray-400">
            Testing the fixed LineChart component without naming conflicts
          </p>
        </div>

        <Card className="p-6 bg-gray-900 border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">
            Bitcoin Price Chart Test
          </h2>
          <div className="h-96">
            <GuaranteedChart 
              symbol="BTCUSDT" 
              interval="1h"
              height={384}
            />
          </div>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            ✅ If you see this page without "Element type is invalid" errors, 
            the LineChart import conflicts have been resolved.
          </p>
        </div>
      </div>
    </div>
  );
}