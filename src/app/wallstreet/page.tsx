'use client';

import dynamic from 'next/dynamic';

// Dynamic import to prevent SSR toFixed() errors on financial data
const FinancialDashboard = dynamic(
  () => import('@/components/dashboard/FinancialDashboard'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-orange-500 font-mono">
          <div className="w-16 h-16 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm">LOADING WALL STREET TERMINAL...</p>
        </div>
      </div>
    )
  }
);

export default function WallStreetDemo() {
  return <FinancialDashboard />;
}