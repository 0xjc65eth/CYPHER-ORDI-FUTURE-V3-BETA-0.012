'use client'

import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, createConfig, WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { store } from '@/store'
import { WalletProvider } from '@/providers/WalletProvider'
import { PremiumProvider } from '@/contexts/PremiumContext'

const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
  connectors: [
    injected(),
  ],
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <PremiumProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </PremiumProvider>
        </Provider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}