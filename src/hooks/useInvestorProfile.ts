"use client"

import { useState, useEffect } from 'react'

interface InvestorProfileData {
  profile: 'Safe' | 'Moderate' | 'Degen' | 'Degen LFG'
  riskTolerance: number // 0-100
  timeHorizon: number // 0-100
  diversity: number // 0-100
  recommendations: string[]
}

interface UseInvestorProfileResult {
  data: InvestorProfileData | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useInvestorProfile(address: string): UseInvestorProfileResult {
  const [data, setData] = useState<InvestorProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInvestorProfile = async () => {
    if (!address) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, this would fetch data from an API
      // For demo purposes, we'll use mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Mock investor profile data
      const mockData: InvestorProfileData = {
        profile: 'Moderate',
        riskTolerance: 65,
        timeHorizon: 80,
        diversity: 45,
        recommendations: [
          'Consider increasing your portfolio diversity by adding more Runes',
          'Your long-term horizon suggests you could benefit from rare ordinals',
          'Set up automatic BTC purchases to dollar-cost average',
          'Consider exploring rare sats collections for long-term value'
        ]
      }
      
      setData(mockData)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch investor profile'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestorProfile()
  }, [address])

  return {
    data,
    isLoading,
    error,
    refetch: fetchInvestorProfile
  }
}
