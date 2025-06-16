'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface PremiumContextType {
  isPremium: boolean
  setIsPremium: (value: boolean) => void
  premiumCollection: string | null
  setPremiumCollection: (value: string | null) => void
  isVerifying: boolean
  setIsVerifying: (value: boolean) => void
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined)

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false)
  const [premiumCollection, setPremiumCollection] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // Listen for wallet events
  useEffect(() => {
    const handleWalletConnected = (event: CustomEvent) => {
      if (event.detail?.isPremium) {
        setIsPremium(true)
        if (event.detail?.premiumCollection) {
          setPremiumCollection(event.detail.premiumCollection)
        }
      }
    }

    const handleWalletDisconnected = () => {
      setIsPremium(false)
      setPremiumCollection(null)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('walletConnected', handleWalletConnected as EventListener)
      window.addEventListener('walletDisconnected', handleWalletDisconnected as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('walletConnected', handleWalletConnected as EventListener)
        window.removeEventListener('walletDisconnected', handleWalletDisconnected as EventListener)
      }
    }
  }, [])

  return (
    <PremiumContext.Provider 
      value={{ 
        isPremium, 
        setIsPremium, 
        premiumCollection, 
        setPremiumCollection,
        isVerifying,
        setIsVerifying
      }}
    >
      {children}
    </PremiumContext.Provider>
  )
}

export function usePremium() {
  const context = useContext(PremiumContext)
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider')
  }
  return context
}
