'use client'

import { useEffect, useState } from 'react'

interface HydrationProviderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function HydrationProvider({ children, fallback = null }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}