'use client';

import React, { Suspense, lazy, ErrorBoundary } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { RunesTerminalProvider } from '@/contexts/RunesTerminalContext';

// Dynamic imports for code splitting
const RunesBloombergTerminal = lazy(() => import('@/components/runes/RunesBloombergTerminal'));

// Loading component with better UX
const LoadingSpinner = () => (
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
          Inicializando <span className="text-orange-400">RUNES</span> Terminal
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Conectando aos protocolos de mercado, carregando dados em tempo real 
          e preparando dashboard profissional...
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

// Enhanced Error boundary component
class RunesErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Runes Terminal Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-gray-900 border border-red-500/30 rounded-xl p-8 max-w-lg text-center backdrop-blur-sm"
          >
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Erro no <span className="text-orange-400">RUNES</span> Terminal
            </h2>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Ocorreu um erro crítico ao carregar o dashboard Bloomberg Terminal. 
              O sistema de fallback será ativado automaticamente.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-red-400 font-bold mb-2">Debug Info:</h3>
                <p className="text-xs text-gray-300 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Recarregar Página
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback component for Suspense
const SuspenseFallback = () => (
  <div className="min-h-screen bg-black">
    <LoadingSpinner />
  </div>
);

export default function RunesPage() {
  return (
    <RunesErrorBoundary>
      <div className="min-h-screen bg-black">
        {/* Animated intro header */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
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
                <span className="text-orange-400 drop-shadow-lg">RUNES</span>
                <span className="text-green-400 ml-2">TERMINAL</span>
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-orange-400 to-green-400 mx-auto rounded-full" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-gray-400 text-xl font-light tracking-wide"
            >
              Bloomberg-Style Professional Trading Interface
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-6 text-sm text-gray-500"
            >
              Powered by Real-Time Market Data & Advanced Analytics
            </motion.div>
          </div>
        </motion.div>

        {/* Main Bloomberg Terminal with Suspense */}
        <RunesTerminalProvider>
          <Suspense fallback={<SuspenseFallback />}>
            <RunesBloombergTerminal />
          </Suspense>
        </RunesTerminalProvider>
      </div>
    </RunesErrorBoundary>
  );
}