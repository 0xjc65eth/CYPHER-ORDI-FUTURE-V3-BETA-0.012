import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

interface MarketMetrics {
  orderBook: {
    bids: Array<{
      price: number
      amount: number
      total: number
      depth: number
    }>
    asks: Array<{
      price: number
      amount: number
      total: number
      depth: number
    }>
    spread: number
    spreadPercentage: number
    midPrice: number
  }
  depth: {
    buyDepth: number
    sellDepth: number
    imbalance: number
  }
  liquidity: {
    available: number
    locked: number
    totalValue: number
  }
  marketMakers: {
    count: number
    topMakers: Array<{
      address: string
      orders: number
      volume: number
      makerRatio: number
    }>
  }
  activity: {
    trades24h: number
    volume24h: number
    buyers24h: number
    sellers24h: number
    avgTradeSize: number
  }
}

const MARKETPLACE_APIS = {
  magicEden: 'https://api-mainnet.magiceden.dev/v2',
  gamma: 'https://gamma.io/api/v1',
  okx: 'https://www.okx.com/api/v5',
  unisat: 'https://open-api.unisat.io/v1'
}

async function fetchMarketMetrics(collection: string): Promise<MarketMetrics> {
  try {
    // In production, aggregate data from multiple marketplaces
    // For now, return comprehensive mock data
    
    // Generate realistic order book
    const generateOrderBook = () => {
      const midPrice = 0.0485
      const bids = Array.from({ length: 20 }, (_, i) => {
        const price = midPrice - (i + 1) * 0.0001
        const amount = Math.floor(Math.random() * 20) + 5
        return {
          price,
          amount,
          total: price * amount,
          depth: 0 // Will be calculated
        }
      })
      
      const asks = Array.from({ length: 20 }, (_, i) => {
        const price = midPrice + (i + 1) * 0.0001
        const amount = Math.floor(Math.random() * 20) + 5
        return {
          price,
          amount,
          total: price * amount,
          depth: 0 // Will be calculated
        }
      })

      // Calculate cumulative depth
      let bidDepth = 0
      bids.forEach(bid => {
        bidDepth += bid.amount
        bid.depth = bidDepth
      })

      let askDepth = 0
      asks.forEach(ask => {
        askDepth += ask.amount
        ask.depth = askDepth
      })

      const spread = asks[0].price - bids[0].price
      const spreadPercentage = (spread / midPrice) * 100

      return {
        bids: bids.slice(0, 10),
        asks: asks.slice(0, 10),
        spread,
        spreadPercentage,
        midPrice
      }
    }

    const orderBook = generateOrderBook()
    
    return {
      orderBook,
      depth: {
        buyDepth: orderBook.bids.reduce((sum, bid) => sum + bid.amount, 0),
        sellDepth: orderBook.asks.reduce((sum, ask) => sum + ask.amount, 0),
        imbalance: 0.65 // Buy pressure
      },
      liquidity: {
        available: 234.5,
        locked: 45.8,
        totalValue: 280.3
      },
      marketMakers: {
        count: 23,
        topMakers: [
          {
            address: 'bc1q...abc',
            orders: 45,
            volume: 12.3,
            makerRatio: 0.78
          },
          {
            address: 'bc1q...def',
            orders: 38,
            volume: 9.8,
            makerRatio: 0.65
          },
          {
            address: 'bc1q...ghi',
            orders: 32,
            volume: 7.2,
            makerRatio: 0.72
          }
        ]
      },
      activity: {
        trades24h: 1234,
        volume24h: 156.7,
        buyers24h: 456,
        sellers24h: 389,
        avgTradeSize: 0.127
      }
    }
  } catch (error) {
    console.error('Error fetching market metrics:', error)
    throw error
  }
}

async function fetchAggregatedLiquidity(collection: string) {
  try {
    // Aggregate liquidity across all marketplaces
    return {
      magicEden: {
        bids: 123,
        asks: 145,
        liquidity: 89.3
      },
      gamma: {
        bids: 89,
        asks: 98,
        liquidity: 56.7
      },
      okx: {
        bids: 67,
        asks: 78,
        liquidity: 45.2
      },
      unisat: {
        bids: 45,
        asks: 52,
        liquidity: 34.1
      },
      total: {
        bids: 324,
        asks: 373,
        liquidity: 225.3
      }
    }
  } catch (error) {
    console.error('Error fetching aggregated liquidity:', error)
    throw error
  }
}

export function useMarketMetrics(collection: string) {
  return useQuery({
    queryKey: ['ordinals', 'market-metrics', collection],
    queryFn: () => fetchMarketMetrics(collection),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time data
    staleTime: 3000
  })
}

export function useAggregatedLiquidity(collection: string) {
  return useQuery({
    queryKey: ['ordinals', 'aggregated-liquidity', collection],
    queryFn: () => fetchAggregatedLiquidity(collection),
    refetchInterval: 10000,
    staleTime: 8000
  })
}

// Real-time order book updates via WebSocket
export function useOrderBookWebSocket(collection: string) {
  const [orderBook, setOrderBook] = useState<MarketMetrics['orderBook'] | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // In production, connect to marketplace WebSocket APIs
    // For now, simulate real-time updates
    const interval = setInterval(() => {
      const midPrice = 0.0485 + (Math.random() - 0.5) * 0.001
      const spread = 0.0001 + Math.random() * 0.0002
      
      const newBid = {
        price: midPrice - spread / 2,
        amount: Math.floor(Math.random() * 10) + 1,
        total: 0,
        depth: 0
      }
      newBid.total = newBid.price * newBid.amount

      const newAsk = {
        price: midPrice + spread / 2,
        amount: Math.floor(Math.random() * 10) + 1,
        total: 0,
        depth: 0
      }
      newAsk.total = newAsk.price * newAsk.amount

      setOrderBook(prev => {
        if (!prev) return null
        
        const bids = [newBid, ...prev.bids.slice(0, 9)].sort((a, b) => b.price - a.price)
        const asks = [newAsk, ...prev.asks.slice(0, 9)].sort((a, b) => a.price - b.price)
        
        // Recalculate depths
        let bidDepth = 0
        bids.forEach(bid => {
          bidDepth += bid.amount
          bid.depth = bidDepth
        })

        let askDepth = 0
        asks.forEach(ask => {
          askDepth += ask.amount
          ask.depth = askDepth
        })

        return {
          bids,
          asks,
          spread: asks[0].price - bids[0].price,
          spreadPercentage: ((asks[0].price - bids[0].price) / midPrice) * 100,
          midPrice
        }
      })
    }, 2000) // Update every 2 seconds

    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [collection])

  return { orderBook, isConnected }
}