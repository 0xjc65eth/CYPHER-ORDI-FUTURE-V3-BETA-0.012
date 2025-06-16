'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import RunesDashboard from '@/components/runes/RunesDashboard';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center space-y-4"
    >
      <Loader2 className="w-12 h-12 text-orange-400 animate-spin" />
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Carregando <span className="text-orange-400">RUNES</span>DEX
        </h2>
        <p className="text-gray-400">
          Conectando aos protocolos AMM e carregando dados de mercado...
        </p>
      </div>
    </motion.div>
  </div>
);

// Error boundary component
class RunesErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Runes dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-red-500/30 rounded-lg p-8 max-w-md text-center"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Erro no Sistema Runes
            </h2>
            <p className="text-gray-400 mb-6">
              Ocorreu um erro ao carregar o dashboard RunesDEX. 
              Por favor, recarregue a página ou tente novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Recarregar Página
            </button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function RunesPage() {
  return (
    <RunesErrorBoundary>
      <div className="min-h-screen bg-black">
        {/* Page Header - Hidden when dashboard loads */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center bg-black z-10 pointer-events-none"
        >
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-4"
            >
              <span className="text-orange-400">RUNES</span>DEX
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg"
            >
              Protocolo AMM Avançado para Bitcoin Runes
            </motion.p>
          </div>
        </motion.div>

        {/* Main Dashboard */}
        <Suspense fallback={<LoadingSpinner />}>
          <RunesDashboard />
        </Suspense>
      </div>
    </RunesErrorBoundary>
  );
}