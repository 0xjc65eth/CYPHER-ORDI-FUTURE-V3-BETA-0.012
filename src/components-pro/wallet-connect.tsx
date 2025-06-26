'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/store'
import { setAddress, setNftData } from '@/store/userSlice'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const dispatch = useAppDispatch()

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      const result = await connectAsync({ connector: injected() })
      
      if (result?.accounts[0]) {
        dispatch(setAddress(result.accounts[0]))
        
        // Mock NFT data for demo
        dispatch(setNftData({
          id: '1',
          name: 'CYPHER PASS',
          collection: 'CYPHER ORDI FUTURE',
          image: '/nft-avatar.png',
          verified: true,
          tier: 'DIAMOND',
          version: '1.0',
          benefits: ['Premium Features', 'Early Access', 'Exclusive Content']
        }))
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectAsync()
      dispatch(setAddress(null))
      dispatch(setNftData(null))
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  return (
    <Button
      onClick={isConnected ? handleDisconnect : handleConnect}
      className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
        isConnected
          ? 'bg-[#2D2D2D] text-white hover:bg-[#3D3D3D]'
          : 'bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white hover:opacity-90'
      }`}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <div className="flex items-center">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Connecting...
        </div>
      ) : isConnected ? (
        'Disconnect'
      ) : (
        'Connect Wallet'
      )}
    </Button>
  )
} 