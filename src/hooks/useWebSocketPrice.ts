import { useState, useEffect, useCallback } from 'react'
import { wsManager } from '@/lib/websocket/websocket-manager'

interface PriceData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  timestamp: number
}

interface UseWebSocketPriceOptions {
  symbols: string[]
  exchanges?: string[]
  autoConnect?: boolean
}

export function useWebSocketPrice({
  symbols,
  exchanges = ['binance', 'okx', 'bybit'],
  autoConnect = true
}: UseWebSocketPriceOptions) {
  const [prices, setPrices] = useState<Map<string, Map<string, PriceData>>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<Map<string, boolean>>(new Map())

  useEffect(() => {
    if (!autoConnect) return

    // Set up event listeners
    const handlePrice = ({ exchange, data }: { exchange: string; data: PriceData }) => {
      setPrices(prev => {
        const newPrices = new Map(prev)
        if (!newPrices.has(data.symbol)) {
          newPrices.set(data.symbol, new Map())
        }
        newPrices.get(data.symbol)!.set(exchange, data)
        return newPrices
      })
    }

    const handleConnected = (exchange: string) => {
      setConnectionStatus(prev => {
        const newStatus = new Map(prev)
        newStatus.set(exchange, true)
        return newStatus
      })
      
      // Subscribe to symbols for this exchange
      symbols.forEach(symbol => {
        wsManager.subscribeToSymbol(exchange, symbol)
      })
    }

    const handleDisconnected = (exchange: string) => {
      setConnectionStatus(prev => {
        const newStatus = new Map(prev)
        newStatus.set(exchange, false)
        return newStatus
      })
    }

    // Add listeners
    wsManager.on('price', handlePrice)
    wsManager.on('connected', handleConnected)
    wsManager.on('disconnected', handleDisconnected)

    // Check overall connection status
    const checkConnection = () => {
      const statuses = Array.from(connectionStatus.values())
      setIsConnected(statuses.some(status => status))
    }

    const interval = setInterval(checkConnection, 1000)

    return () => {
      wsManager.off('price', handlePrice)
      wsManager.off('connected', handleConnected)
      wsManager.off('disconnected', handleDisconnected)
      clearInterval(interval)
      
      // Unsubscribe from symbols
      symbols.forEach(symbol => {
        exchanges.forEach(exchange => {
          wsManager.unsubscribeFromSymbol(exchange, symbol)
        })
      })
    }
  }, [symbols, exchanges, autoConnect])

  const getPriceForSymbol = useCallback((symbol: string): Map<string, PriceData> | undefined => {
    return prices.get(symbol)
  }, [prices])

  const getBestPrice = useCallback((symbol: string, side: 'buy' | 'sell'): { exchange: string; price: number } | null => {
    const symbolPrices = prices.get(symbol)
    if (!symbolPrices || symbolPrices.size === 0) return null

    let bestExchange = ''
    let bestPrice = side === 'buy' ? Infinity : 0

    symbolPrices.forEach((data, exchange) => {
      if (side === 'buy' && data.price < bestPrice) {
        bestPrice = data.price
        bestExchange = exchange
      } else if (side === 'sell' && data.price > bestPrice) {
        bestPrice = data.price
        bestExchange = exchange
      }
    })

    return { exchange: bestExchange, price: bestPrice }
  }, [prices])

  const getSpread = useCallback((symbol: string): number => {
    const buy = getBestPrice(symbol, 'buy')
    const sell = getBestPrice(symbol, 'sell')
    
    if (!buy || !sell) return 0
    
    return ((sell.price - buy.price) / buy.price) * 100
  }, [getBestPrice])

  return {
    prices,
    isConnected,
    connectionStatus,
    getPriceForSymbol,
    getBestPrice,
    getSpread
  }
}