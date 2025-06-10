/**
 * 🔧 useMounted Hook
 * Resolve problemas de hydration no Next.js
 */

import { useEffect, useState } from 'react'

export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

// Hook com callback
export function useClientOnly<T>(
  clientValue: T,
  serverValue?: T
): T {
  const mounted = useMounted()
  return mounted ? clientValue : (serverValue ?? clientValue)
}

// HOC para componentes client-only
export function withClientOnly<P extends object>(
  Component: React.ComponentType<P>,
  Fallback?: React.ComponentType
) {
  return function ClientOnlyComponent(props: P) {
    const mounted = useMounted()
    
    if (!mounted) {
      return Fallback ? React.createElement(Fallback) : null
    }
    
    return React.createElement(Component, props)
  }
}

export default useMounted