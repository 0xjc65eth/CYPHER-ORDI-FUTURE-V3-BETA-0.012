import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, optimism, base, avalanche, bsc } from 'viem/chains'

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

// 2. Set up chains for EVM (ensure proper array)
const chains = [mainnet, arbitrum, polygon, optimism, base, avalanche, bsc]

// 3. Set up Wagmi adapter with proper networks parameter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: chains
})

// 4. Create the modal (without Solana for now to avoid conflicts)
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: chains,
  defaultNetwork: mainnet,
  metadata: {
    name: 'CYPHER ORDI FUTURE V3',
    description: 'Professional Bitcoin & Multi-Chain Trading Platform',
    url: 'https://cypher-ordi-future.com',
    icons: ['https://cypher-ordi-future.com/logo.png']
  },
  features: {
    analytics: true,
    email: false,
    socials: false
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#f97316',
    '--w3m-color-mix-strength': 20,
    '--w3m-border-radius-master': '4px'
  }
})

export { wagmiAdapter }