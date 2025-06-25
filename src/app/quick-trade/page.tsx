'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWeb3 } from '@/components/providers/Web3Provider';

// Dynamic import com no SSR
const QuickTradeContent = dynamic(
  () => import('@/components/quick-trade/QuickTradeContent'),
  { 
    ssr: false,
    loading: () => <QuickTradeLoading />
  }
);

function QuickTradeLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">
        <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 w-96 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export default function QuickTradePage() {
  const { isInitialized, supportedNetworks, error } = useWeb3();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <QuickTradeLoading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Erro ao inicializar Web3
          </h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized || !supportedNetworks || supportedNetworks.length === 0) {
    return <QuickTradeLoading />;
  }

  return (
    <Suspense fallback={<QuickTradeLoading />}>
      <QuickTradeContent />
    </Suspense>
  );
}