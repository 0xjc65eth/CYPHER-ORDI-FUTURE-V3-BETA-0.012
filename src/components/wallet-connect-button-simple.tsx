'use client'

import { useState } from 'react'
import { RiWallet3Line } from 'react-icons/ri'

export function WalletConnectButton() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)

  const handleConnect = () => {
    // Simular conexão de carteira
    setIsConnected(true)
    setAddress('bc1q...xyz')
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAddress(null)
  }

  return (
    <div className="relative z-50">
      {isConnected && address ? (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDisconnect}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-[#3D3D3D] to-[#2D2D2D] text-white rounded-md shadow-lg hover:shadow-xl transition-all"
          >
            <span className="truncate max-w-[120px] font-medium">{address}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="relative overflow-hidden group flex items-center px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#8B5CF6] text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
        >
          {/* Efeito de brilho */}
          <span className="absolute top-0 left-0 w-full h-full bg-white/20 transform -translate-x-full skew-x-12 group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
          <RiWallet3Line className="mr-2 w-5 h-5" />
          <span>Connect Wallet</span>
        </button>
      )}
    </div>
  )
}
