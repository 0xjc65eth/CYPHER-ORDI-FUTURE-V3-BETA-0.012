'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setMiningData } from '@/store/miningSlice'
import type { MiningState } from '@/types/store'

export const useMiningData = () => {
  const dispatch = useAppDispatch()
  const miningData = useAppSelector((state: any) => state.mining)

  useEffect(() => {
    const fetchMiningData = async () => {
      try {
        // TODO: Replace with actual API call
        const mockData: MiningState = {
          hashRate: Math.floor(Math.random() * 100000),
          difficulty: Math.floor(Math.random() * 1000000),
          blockTime: Math.floor(Math.random() * 600) + 300, // Between 5-15 minutes
          lastUpdated: new Date().toISOString()
        }

        dispatch(setMiningData(mockData))
      } catch (error) {
        console.error('Error fetching mining data:', error)
      }
    }

    // Initial fetch
    fetchMiningData()

    // Set up interval for periodic updates
    const interval = setInterval(fetchMiningData, 60000) // Update every minute

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [dispatch])

  return miningData
} 