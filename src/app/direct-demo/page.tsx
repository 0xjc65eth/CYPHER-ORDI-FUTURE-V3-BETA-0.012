'use client'

import { useState, useEffect } from 'react'
import { WalletConnectDirect } from './components/wallet-connect-direct'
import { RiLockLine, RiShieldCheckLine } from 'react-icons/ri'

export default function DirectDemoPage() {
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Listen for wallet connection events
  useEffect(() => {
    const handleWalletConnected = (event: CustomEvent) => {
      console.log('Wallet connected event received:', event.detail)
      if (event.detail?.isPremium) {
        setIsPremium(true)
      }
    }

    const handleWalletDisconnected = () => {
      console.log('Wallet disconnected event received')
      setIsPremium(false)
    }

    // Check if there's already a wallet connected with premium status
    const checkExistingConnection = () => {
      setIsLoading(false)
    }

    // Add event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('walletConnected', handleWalletConnected as EventListener)
      window.addEventListener('walletDisconnected', handleWalletDisconnected as EventListener)

      // Check after a short delay to allow for any existing connection to be processed
      setTimeout(checkExistingConnection, 500)
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('walletConnected', handleWalletConnected as EventListener)
        window.removeEventListener('walletDisconnected', handleWalletDisconnected as EventListener)
      }
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Wallet Connection & Premium Access Demo</h1>

      <div className="flex justify-end mb-6">
        <WalletConnectDirect />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <div className="p-6 border border-[#3D3D3D] rounded-lg bg-[#121212]">
          <ol className="list-decimal list-inside space-y-4 text-gray-300">
            <li>
              <span className="font-medium text-white">Connect Your Wallet:</span> Click the "Connect Wallet" button above to connect your Bitcoin wallet.
            </li>
            <li>
              <span className="font-medium text-white">Verification Process:</span> After connecting, the system automatically checks if you own any NFTs from our premium collections.
            </li>
            <li>
              <span className="font-medium text-white">Premium Access:</span> If you own a premium collection NFT, you'll see a "Premium Access" badge and gain access to exclusive content.
            </li>
            <li>
              <span className="font-medium text-white">Premium Collections:</span> The following collections grant premium access: OCM GENESIS, OCM KATOSHI PRIME, OCM KATOSHI CLASSIC, MULTIVERSO PASS, SEIZE CTRL, N0 0RDINARY KIND, BITCOIN PUPPETS, THE WIZARDS OF LORDS, YIELD HACKER PASS, STACK SATS.
            </li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Standard Content</h2>
          <div className="p-6 border border-[#3D3D3D] rounded-lg bg-[#121212]">
            <h3 className="text-lg font-medium mb-2">Bitcoin Market Overview</h3>
            <p className="text-gray-400 mb-4">
              Basic market data and trends available to all users.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#1D1D1D] rounded-md">
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-lg font-medium">$63,245</p>
              </div>
              <div className="p-3 bg-[#1D1D1D] rounded-md">
                <p className="text-xs text-gray-500">24h Change</p>
                <p className="text-lg font-medium text-green-500">+2.4%</p>
              </div>
              <div className="p-3 bg-[#1D1D1D] rounded-md">
                <p className="text-xs text-gray-500">Volume</p>
                <p className="text-lg font-medium">$32.8B</p>
              </div>
              <div className="p-3 bg-[#1D1D1D] rounded-md">
                <p className="text-xs text-gray-500">Market Cap</p>
                <p className="text-lg font-medium">$1.24T</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Premium Content</h2>
          {isLoading ? (
            <div className="p-6 border border-[#3D3D3D] rounded-lg bg-[#121212] text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-[#2D2D2D] rounded-full flex items-center justify-center animate-pulse">
                  <RiLockLine className="w-6 h-6 text-[#8B5CF6]" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Verificando acesso...</h3>
              <p className="text-gray-400 text-sm mb-4">
                Verificando se você possui coleções premium...
              </p>
            </div>
          ) : isPremium ? (
            <div className="relative border border-[#8B5CF6]/30 rounded-lg">
              <div className="absolute top-2 right-2 flex items-center px-2 py-1 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] rounded-md text-xs text-white">
                <RiShieldCheckLine className="mr-1" />
                <span>Premium</span>
              </div>
              <div className="p-6 bg-[#121212]">
                <h3 className="text-lg font-medium mb-2">Advanced Market Insights</h3>
                <p className="text-gray-400 mb-4">
                  Exclusive premium data and advanced analytics.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                    <p className="text-xs text-[#8B5CF6]">Whale Activity</p>
                    <p className="text-lg font-medium">Accumulating</p>
                    <p className="text-xs text-gray-500">+12.3% in 24h</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                    <p className="text-xs text-[#8B5CF6]">Sentiment</p>
                    <p className="text-lg font-medium">Extremely Bullish</p>
                    <p className="text-xs text-gray-500">92/100 index</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                    <p className="text-xs text-[#8B5CF6]">Price Prediction</p>
                    <p className="text-lg font-medium text-green-500">$72,500</p>
                    <p className="text-xs text-gray-500">30-day forecast</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                    <p className="text-xs text-[#8B5CF6]">Arbitrage</p>
                    <p className="text-lg font-medium">3.2% Opportunity</p>
                    <p className="text-xs text-gray-500">Binance → Coinbase</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-[#1D1D1D] to-[#2D2D2D] rounded-md">
                  <p className="text-xs text-[#8B5CF6]">Neural Network Analysis</p>
                  <p className="text-sm font-medium">
                    Our proprietary neural network indicates a strong buy signal with 87% confidence.
                    Key indicators suggest accumulation phase is nearing completion with potential
                    breakout within 7-10 days.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-[#3D3D3D] rounded-lg bg-[#121212] text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-[#2D2D2D] rounded-full flex items-center justify-center">
                  <RiLockLine className="w-6 h-6 text-[#8B5CF6]" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Premium Content Locked</h3>
              <p className="text-gray-400 text-sm mb-4">
                Connect your wallet and verify ownership of premium collections to access this content.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 p-6 border border-[#3D3D3D] rounded-lg bg-[#121212]">
        <h2 className="text-xl font-bold mb-4">Technical Implementation</h2>
        <p className="text-gray-400 mb-4">
          This demo uses a direct implementation to connect to Bitcoin wallets and simulate premium content verification.
          It will attempt to use the actual UniSat wallet if installed, or fall back to a simulation for demonstration purposes.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-400">
          <li>Wallet connection with multiple wallet support (UniSat, Xverse, Magic Eden)</li>
          <li>Automatic verification of premium collection ownership</li>
          <li>Real-time updates when wallet status changes</li>
          <li>Premium content gating based on NFT ownership</li>
          <li>Interactive UI with animations and visual feedback</li>
        </ul>
      </div>
    </div>
  )
}
