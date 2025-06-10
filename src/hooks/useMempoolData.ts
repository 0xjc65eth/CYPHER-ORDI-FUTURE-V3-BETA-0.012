'use client'

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setMempoolData } from '@/store/mempoolSlice'
import type { MempoolState } from '@/types/store'

export const useMempoolData = () => {
  const dispatch = useAppDispatch()
  const mempoolData = useAppSelector((state: any) => state.mempool)

  useEffect(() => {
    const fetchMempoolData = async () => {
      try {
        // TODO: Replace with actual API call
        const mockData: MempoolState = {
          pendingTransactions: Math.floor(Math.random() * 1000),
          averageFeeRate: Math.random() * 100,
          mempoolSize: Math.floor(Math.random() * 10000),
          lastUpdated: new Date().toISOString(),
          transactions: [],
          feeRates: {
            low: Math.random() * 10,
            medium: Math.random() * 20,
            high: Math.random() * 30
          },
          blocks: [
            {
              height: 0,
              hash: '',
              timestamp: Date.now(),
              size: 0,
              weight: 0
            }
          ]
        }

        dispatch(setMempoolData(mockData))
      } catch (error) {
        console.error('Error fetching mempool data:', error)
      }
    }

    // Initial fetch
    fetchMempoolData()

    // Set up interval for periodic updates
    const interval = setInterval(fetchMempoolData, 15000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [dispatch])

  return mempoolData
} 