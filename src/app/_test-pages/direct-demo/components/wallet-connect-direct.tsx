'use client'

import React, { useState } from 'react'

export function WalletConnectDirect() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')

  const connectWallet = () => {
    // Simulação de conexão de carteira
    setIsConnected(true)
    setWalletAddress('bc1q...xyz')
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress('')
  }

  return (
    <div className="bg-gradient-to-br from-[#181F3A] to-[#2A3A5A] border-none shadow-xl p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Wallet Connect Direct</h2>
      
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Connected Wallet:</span>
            <span className="text-white font-medium">{walletAddress}</span>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
