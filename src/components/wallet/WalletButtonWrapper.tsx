'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Import WalletButton dynamically to avoid SSR issues
const WalletButton = dynamic(() => import('./WalletButton'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
      <div className="w-20 h-6 bg-gray-700 rounded animate-pulse"></div>
    </div>
  )
})

export default function WalletButtonWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
        <div className="w-20 h-6 bg-gray-700 rounded animate-pulse"></div>
      </div>
    )
  }

  return <WalletButton />
}