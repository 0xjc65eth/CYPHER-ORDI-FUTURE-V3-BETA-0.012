import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'

interface WalletBalance {
  confirmed: number
  unconfirmed: number
  total: number
  address: string
  lastUpdate: Date
}

export function useWalletBalance() {
  const { isConnected, address } = useWallet()
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Fetch balance from mempool.space API
      const response = await fetch(
        `https://mempool.space/api/address/${address}`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`)
      }

      const data = await response.json()
      
      const balanceData: WalletBalance = {
        confirmed: data.chain_stats.funded_txo_sum / 100000000, // Convert from satoshis to BTC
        unconfirmed: data.mempool_stats.funded_txo_sum / 100000000,
        total: (data.chain_stats.funded_txo_sum + data.mempool_stats.funded_txo_sum) / 100000000,
        address,
        lastUpdate: new Date()
      }

      setBalance(balanceData)
    } catch (err) {
      console.error('Error fetching wallet balance:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance()
      
      // Refresh balance every 30 seconds
      const interval = setInterval(fetchBalance, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isConnected, address, fetchBalance])

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance
  }
}