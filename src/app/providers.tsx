'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { NotificationContainer } from '@/components/notifications'
import { NotificationSystemActivator } from '@/components/notifications/NotificationSystemActivator'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { WalletProvider } from '@/contexts/WalletContext'
import { AudioManager } from '@/components/notifications/AudioManager'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WalletProvider>
            <NotificationProvider>
              <ServiceWorkerRegistration />
              {children}
              <NotificationContainer />
            </NotificationProvider>
          </WalletProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  )
}