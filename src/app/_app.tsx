import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletProvider } from '../components/wallet/WalletProvider'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <WalletProvider>
          <Component {...pageProps} />
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
} 