'use client';

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import { RunesTerminalProvider } from '@/contexts/RunesTerminalContext';

// Dynamic import for the pair dashboard
const PairDashboard = lazy(() => import('@/components/pair/PairDashboard'));

interface Props {
  params: Promise<{ pair: string }>;
}

// Loading component with better UX
const LoadingSpinner = ({ pair }: { pair: string }) => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center space-y-4"
    >
      <div className="relative">
        <Loader2 className="w-16 h-16 text-orange-400 animate-spin" />
        <div className="absolute inset-0 border-4 border-orange-400/20 rounded-full animate-pulse" />
      </div>
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-2">
          Loading <span className="text-orange-400">{pair}</span> Terminal
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Initializing advanced trading interface with real-time data feeds...
        </p>
        <div className="mt-4 flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </motion.div>
  </div>
);

export default function PairPage({ params }: Props) {
  const [pairString, setPairString] = React.useState<string>('');
  const [base, setBase] = React.useState<string>('');
  const [quote, setQuote] = React.useState<string>('');

  React.useEffect(() => {
    params.then(({ pair }) => {
      setPairString(pair);
      const [baseSymbol, quoteSymbol] = pair.split('-');
      setBase(baseSymbol || 'BTC');
      setQuote(quoteSymbol || 'RUNE');
    });
  }, [params]);

  if (!pairString) {
    return <LoadingSpinner pair="Loading..." />;
  }

  return (
    <RunesTerminalProvider>
      <div className="min-h-screen bg-black">
        {/* Animated intro header */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute inset-0 flex items-center justify-center bg-black z-20 pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <h1 className="text-5xl font-bold text-white mb-2">
                <span className="text-orange-400 drop-shadow-lg">{base}</span>
                <span className="text-gray-400 mx-2">/</span>
                <span className="text-green-400 ml-2">{quote}</span>
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-orange-400 to-green-400 mx-auto rounded-full" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-gray-400 text-xl font-light tracking-wide"
            >
              Professional Trading Terminal
            </motion.p>
          </div>
        </motion.div>

        {/* Main Dashboard with Suspense */}
        <Suspense fallback={<LoadingSpinner pair={pairString} />}>
          <PairDashboard key={pairString} base={base} quote={quote} pairId={pairString} />
        </Suspense>
      </div>
    </RunesTerminalProvider>
  );
}