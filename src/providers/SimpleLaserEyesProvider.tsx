'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Simple LaserEyes context that doesn't cause BigInt issues
interface LaserEyesContextType {
  connect: (provider: any) => Promise<void>
  disconnect: () => Promise<void>
  connected: boolean
  connecting: boolean
  address: string | null
  balance: { confirmed: number; unconfirmed: number; total: number } | null
  getInscriptions: () => Promise<any[]>
}

const LaserEyesContext = createContext<LaserEyesContextType | null>(null)

export function LaserEyesProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<{ confirmed: number; unconfirmed: number; total: number } | null>(null)

  const connect = async (provider: any) => {
    setConnecting(true)
    try {
      // Simulate connection process
      console.log('Connecting with simple provider...')
      
      // Check if we can access window.XverseProviders
      if (typeof window !== 'undefined' && (window as any).XverseProviders?.BitcoinProvider) {
        const xverseProvider = (window as any).XverseProviders.BitcoinProvider
        
        // Try to get accounts
        const response = await xverseProvider.request('getAccounts', {
          purposes: ['ordinals', 'payment'],
          message: 'CYPHER ORDi Future V3 would like to connect to your wallet.',
        })
        
        if (response?.result?.addresses && response.result.addresses.length > 0) {
          const addresses = response.result.addresses
          const paymentAddr = addresses.find((addr: any) => addr.purpose === 'payment') || addresses[0]
          
          setAddress(paymentAddr.address)
          setConnected(true)
          setBalance({ confirmed: 0, unconfirmed: 0, total: 0 }) // Placeholder balance
          
          console.log('✅ Simple wallet connection successful:', paymentAddr.address)
        }
      } else {
        throw new Error('Xverse wallet not found')
      }
    } catch (error) {
      console.error('Simple provider connection failed:', error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    setConnected(false)
    setAddress(null)
    setBalance(null)
    console.log('Wallet disconnected')
  }

  const getInscriptions = async () => {
    // Return empty array for now
    return []
  }

  const value: LaserEyesContextType = {
    connect,
    disconnect,
    connected,
    connecting,
    address,
    balance,
    getInscriptions
  }

  return (
    <LaserEyesContext.Provider value={value}>
      {children}
    </LaserEyesContext.Provider>
  )
}

export function useLaserEyes() {
  const context = useContext(LaserEyesContext)
  if (!context) {
    throw new Error('useLaserEyes must be used within a LaserEyesProvider')
  }
  return context
}