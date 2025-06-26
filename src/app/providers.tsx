'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, Suspense, useEffect } from 'react'
import { initializeWalletProviderPatches } from '@/lib/wallet-providers-patch'
import { Provider } from 'react-redux'
import { ErrorBoundary } from 'react-error-boundary'
import { store } from '@/store'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { NotificationContainer } from '@/components/notifications'
import { NotificationSystemActivator } from '@/components/notifications/NotificationSystemActivator'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { AuthProvider as AuthProviderStub } from '@/lib/auth/AuthContextStub'
import { isSupabaseConfigured } from '@/lib/auth/supabase'
import { WalletProvider } from '@/contexts/WalletContext'
// Temporarily use simple provider to avoid BigInt issues
import { LaserEyesProvider as LaserEyesWalletProvider } from '@/providers/SimpleLaserEyesProvider'
// import { WalletProvider as LaserEyesWalletProvider } from '@/providers/WalletProvider'
// import { LaserEyesSafeWrapper } from '@/components/LaserEyesSafeWrapper'
import { AudioManager } from '@/components/notifications/AudioManager'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
// Import AppKit configuration
import '@/config/appkit.config'
import { WagmiProvider } from 'wagmi'
import { wagmiAdapter } from '@/config/appkit.config'
import { PremiumProvider } from '@/contexts/PremiumContext'
import { Web3Provider } from '@/components/providers/Web3Provider'

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-orange-500 font-mono">
        <h1 className="text-2xl font-bold mb-4">SYSTEM ERROR</h1>
        <p className="text-sm mb-4">State management initialization failed</p>
        <pre className="text-xs bg-gray-900 p-4 rounded mb-4 text-left max-w-md overflow-auto">
          {error.message}
        </pre>
        <button 
          onClick={resetErrorBoundary}
          className="bg-orange-500 text-black px-4 py-2 rounded text-sm font-bold hover:bg-orange-600"
        >
          RETRY INITIALIZATION
        </button>
      </div>
    </div>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-orange-500 font-mono">
        <div className="w-16 h-16 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm">INITIALIZING STATE MANAGEMENT...</p>
      </div>
    </div>
  )
}

// Individual provider wrappers with error boundaries
function SafeReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Redux Provider Error:', error)}
    >
      <Provider store={store}>
        {children}
      </Provider>
    </ErrorBoundary>
  )
}

function SafeQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on certain errors
              if (error instanceof Error && error.message.includes('BigInt')) {
                return false
              }
              return failureCount < 3
            },
          },
        },
      })
  )

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Query Provider Error:', error)}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

function SafeAuthProvider({ children }: { children: React.ReactNode }) {
  // Use stub provider if Supabase is not configured
  const Provider = isSupabaseConfigured() ? AuthProvider : AuthProviderStub;
  
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Auth Provider Error:', error)}
    >
      <Provider>
        {children}
      </Provider>
    </ErrorBoundary>
  )
}

function SafeWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Wallet Provider Error:', error)}
    >
      <Web3Provider>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          <PremiumProvider>
            <LaserEyesWalletProvider>
              <WalletProvider>
                {children}
              </WalletProvider>
            </LaserEyesWalletProvider>
          </PremiumProvider>
        </WagmiProvider>
      </Web3Provider>
    </ErrorBoundary>
  )
}

function SafeNotificationProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Notification Provider Error:', error)}
    >
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Apply wallet provider patches on mount
  useEffect(() => {
    initializeWalletProviderPatches();
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Root Provider Error:', error)}
    >
      <Suspense fallback={<LoadingFallback />}>
        <SafeReduxProvider>
          <SafeQueryProvider>
            <SafeAuthProvider>
              <SafeWalletProvider>
                <SafeNotificationProvider>
                  <ServiceWorkerRegistration />
                  {children}
                  <NotificationContainer />
                </SafeNotificationProvider>
              </SafeWalletProvider>
            </SafeAuthProvider>
          </SafeQueryProvider>
        </SafeReduxProvider>
      </Suspense>
    </ErrorBoundary>
  )
}