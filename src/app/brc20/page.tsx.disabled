'use client';

import React from 'react';

// Enhanced BigInt protection before any imports
if (typeof window !== 'undefined' && typeof BigInt !== 'undefined') {
  // Store original Math.pow
  const originalPow = Math.pow;
  
  // Override Math.pow to handle BigInt conversions
  Math.pow = function(base: any, exponent: any) {
    try {
      // Convert BigInt to Number if needed
      const baseNum = typeof base === 'bigint' ? Number(base) : base;
      const expNum = typeof exponent === 'bigint' ? Number(exponent) : exponent;
      
      // Call original Math.pow with converted values
      return originalPow.call(Math, baseNum, expNum);
    } catch (error) {
      console.warn('Math.pow BigInt conversion error:', error);
      return 0;
    }
  };

  // Also protect BigInt constructor
  const OriginalBigInt = BigInt;
  (window as any).BigInt = function(value: any) {
    try {
      return OriginalBigInt(value);
    } catch (error) {
      console.warn('BigInt conversion error:', error);
      return OriginalBigInt(0);
    }
  };
}

// Now safe to import
import dynamic from 'next/dynamic';

// Dynamic import for LaserEyes to avoid SSR issues
const BRC20PageContent = dynamic(
  () => import('./BRC20PageContent').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-800 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="h-32 bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-800 rounded"></div>
              <div className="h-32 bg-gray-800 rounded"></div>
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    ),
  }
);

export default function BRC20Page() {
  return <BRC20PageContent />;
}