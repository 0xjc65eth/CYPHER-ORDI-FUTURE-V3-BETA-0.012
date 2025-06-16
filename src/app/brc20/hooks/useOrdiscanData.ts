'use client'

import { useState, useEffect } from 'react'

export function useOrdiscanData(endpoint: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Simulated data for BRC-20
    const mockData = {
      total_tokens: 15000,
      volume_24h: 2500000,
      market_cap: 150000000,
      tokens: [
        { name: 'ORDI', price: 0.00005, market_cap: 50000000, volume_24h: 1000000 },
        { name: 'SATS', price: 0.00002, market_cap: 30000000, volume_24h: 750000 },
        { name: 'PEPE', price: 0.00001, market_cap: 20000000, volume_24h: 500000 }
      ]
    }
    
    // Simulate API call
    setTimeout(() => {
      setData(mockData)
      setIsLoading(false)
    }, 500)
  }, [endpoint])

  return { data, isLoading, error }
}
