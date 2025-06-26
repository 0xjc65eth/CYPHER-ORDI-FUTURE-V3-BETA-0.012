"use client"

import { ReactNode } from 'react'
import LaserEyesProvider from '../libs/lasereyes-mono/lib/providers/lasereyes-provider'

export function WalletProvider({ children }: { children: ReactNode }) {
  return <LaserEyesProvider>{children}</LaserEyesProvider>
} 