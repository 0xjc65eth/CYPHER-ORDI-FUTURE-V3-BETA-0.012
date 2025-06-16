'use client'

import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import {
  MAINNET,
  UNISAT,
  XVERSE,
  MAGIC_EDEN,
  OYL,
  LEATHER,
  WIZZ,
  PHANTOM,
  ORANGE
} from '@omnisat/lasereyes-core'
import { ReactNode } from 'react'

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <LaserEyesProvider
      config={{
        network: MAINNET,
        walletProviders: [UNISAT, XVERSE, MAGIC_EDEN, OYL, LEATHER, WIZZ, PHANTOM, ORANGE],
        autoConnect: true,
        dataSources: {
          maestro: {
            apiKey: 'e227a764-b31b-43cf-a60c-be5daa50cd2c' // Ordiscan API key
          },
          coinMarketCap: {
            apiKey: 'c045d2a9-6f2d-44e9-8297-a88ab83b463b' // CoinMarketCap API key
          }
        }
      }}
    >
      {children}
    </LaserEyesProvider>
  )
}
