import { StateCreator } from 'zustand'
import { RootState } from '../index'

export interface MarketData {
  // Main market data
  btcPrice: number
  btcChange24h: number
  btcVolume24h: number
  btcMarketCap: number
  btcDominance: number
  
  // Alternative markets
  ethPrice: number
  ethChange24h: number
  solPrice: number
  solChange24h: number
  
  // Market indices
  fearGreedIndex: number
  totalMarketCap: number
  volume24h: number
  marketCapChange24h: number
  
  // Mining data
  hashrate: number
  difficulty: number
  nextDifficultyAdjustment: number
  blockHeight: number
  avgBlockTime: number
  
  // Mempool data
  mempoolSize: number
  mempoolFees: {
    low: number
    medium: number
    high: number
  }
  pendingTransactions: number
  
  // Lightning Network
  lightningCapacity: number
  lightningNodes: number
  lightningChannels: number
  
  // Ordinals & Runes
  ordinalsVolume24h: number
  runesVolume24h: number
  inscriptionsToday: number
  
  // Timestamps
  lastUpdated: number
  lastPriceUpdate: number
  lastMiningUpdate: number
  lastMempoolUpdate: number
}

export interface PriceData {
  [symbol: string]: {
    price: number
    change24h: number
    volume24h: number
    marketCap: number
    lastUpdated: number
  }
}

export interface MarketState {
  // Data
  data: MarketData
  prices: PriceData
  watchlist: string[]
  
  // Loading states
  loading: {
    prices: boolean
    market: boolean
    mining: boolean
    mempool: boolean
    ordinals: boolean
  }
  
  // Error handling
  error: string | null
  lastError: {
    message: string
    timestamp: number
    source: string
  } | null
  
  // Preferences
  preferences: {
    currency: 'USD' | 'BTC' | 'EUR'
    priceAlerts: Array<{
      id: string
      symbol: string
      type: 'above' | 'below'
      price: number
      enabled: boolean
    }>
    refreshInterval: number
    showTestnetData: boolean
  }
  
  // Real-time data
  realTimeUpdates: {
    enabled: boolean
    lastUpdate: number
    updateCount: number
  }
  
  // Historical data cache
  priceHistory: {
    [symbol: string]: Array<{
      timestamp: number
      price: number
      volume: number
    }>
  }
}

export interface MarketActions {
  // Data updates
  updateMarketData: (data: Partial<MarketData>) => void
  updatePrices: (prices: Partial<PriceData>) => void
  updatePrice: (symbol: string, price: number, change24h?: number, volume24h?: number, marketCap?: number) => void
  
  // Watchlist management
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  clearWatchlist: () => void
  
  // Loading states
  setMarketLoading: (key: keyof MarketState['loading'], loading: boolean) => void
  setMarketError: (error: string | null, source?: string) => void
  
  // Preferences
  updateMarketPreferences: (preferences: Partial<MarketState['preferences']>) => void
  addPriceAlert: (alert: MarketState['preferences']['priceAlerts'][0]) => void
  removePriceAlert: (id: string) => void
  
  // Real-time updates
  enableRealTimeUpdates: () => void
  disableRealTimeUpdates: () => void
  updateRealTimeData: (data: Partial<MarketData>) => void
  
  // Historical data
  addPriceHistory: (symbol: string, data: { timestamp: number; price: number; volume: number }) => void
  clearPriceHistory: (symbol?: string) => void
  
  // Refresh actions
  refreshMarketData: () => Promise<void>
  refreshPrices: () => Promise<void>
}

export interface MarketSlice {
  market: MarketState
  updateMarketData: MarketActions['updateMarketData']
  updatePrices: MarketActions['updatePrices']
  updatePrice: MarketActions['updatePrice']
  addToWatchlist: MarketActions['addToWatchlist']
  removeFromWatchlist: MarketActions['removeFromWatchlist']
  clearWatchlist: MarketActions['clearWatchlist']
  setMarketLoading: MarketActions['setMarketLoading']
  setMarketError: MarketActions['setMarketError']
  updateMarketPreferences: MarketActions['updateMarketPreferences']
  addPriceAlert: MarketActions['addPriceAlert']
  removePriceAlert: MarketActions['removePriceAlert']
  enableRealTimeUpdates: MarketActions['enableRealTimeUpdates']
  disableRealTimeUpdates: MarketActions['disableRealTimeUpdates']
  updateRealTimeData: MarketActions['updateRealTimeData']
  addPriceHistory: MarketActions['addPriceHistory']
  clearPriceHistory: MarketActions['clearPriceHistory']
  refreshMarketData: MarketActions['refreshMarketData']
  refreshPrices: MarketActions['refreshPrices']
}

const initialMarketData: MarketData = {
  btcPrice: 0,
  btcChange24h: 0,
  btcVolume24h: 0,
  btcMarketCap: 0,
  btcDominance: 0,
  ethPrice: 0,
  ethChange24h: 0,
  solPrice: 0,
  solChange24h: 0,
  fearGreedIndex: 50,
  totalMarketCap: 0,
  volume24h: 0,
  marketCapChange24h: 0,
  hashrate: 0,
  difficulty: 0,
  nextDifficultyAdjustment: 0,
  blockHeight: 0,
  avgBlockTime: 600,
  mempoolSize: 0,
  mempoolFees: {
    low: 1,
    medium: 5,
    high: 10,
  },
  pendingTransactions: 0,
  lightningCapacity: 0,
  lightningNodes: 0,
  lightningChannels: 0,
  ordinalsVolume24h: 0,
  runesVolume24h: 0,
  inscriptionsToday: 0,
  lastUpdated: 0,
  lastPriceUpdate: 0,
  lastMiningUpdate: 0,
  lastMempoolUpdate: 0,
}

const initialMarketState: MarketState = {
  data: initialMarketData,
  prices: {},
  watchlist: ['BTC', 'ETH', 'SOL'],
  loading: {
    prices: false,
    market: false,
    mining: false,
    mempool: false,
    ordinals: false,
  },
  error: null,
  lastError: null,
  preferences: {
    currency: 'USD',
    priceAlerts: [],
    refreshInterval: 30000,
    showTestnetData: false,
  },
  realTimeUpdates: {
    enabled: false,
    lastUpdate: 0,
    updateCount: 0,
  },
  priceHistory: {},
}

export const createMarketSlice: StateCreator<
  RootState,
  [],
  [],
  MarketSlice
> = (set, get) => ({
  market: initialMarketState,
  
  updateMarketData: (data: Partial<MarketData>) => {
    set((state) => {
      state.market.data = { ...state.market.data, ...data }
      state.market.data.lastUpdated = Date.now()
      state.market.error = null
    })
  },
  
  updatePrices: (prices: Partial<PriceData>) => {
    set((state) => {
      const timestamp = Date.now()
      
      Object.entries(prices).forEach(([symbol, priceData]) => {
        state.market.prices[symbol] = {
          ...priceData,
          lastUpdated: timestamp,
        }
        
        // Update main data if BTC
        if (symbol === 'BTC') {
          state.market.data.btcPrice = priceData.price
          state.market.data.btcChange24h = priceData.change24h
          state.market.data.btcVolume24h = priceData.volume24h
          state.market.data.btcMarketCap = priceData.marketCap
        }
        
        // Add to price history
        if (!state.market.priceHistory[symbol]) {
          state.market.priceHistory[symbol] = []
        }
        
        state.market.priceHistory[symbol].push({
          timestamp,
          price: priceData.price,
          volume: priceData.volume24h,
        })
        
        // Keep only last 1000 entries
        if (state.market.priceHistory[symbol].length > 1000) {
          state.market.priceHistory[symbol] = state.market.priceHistory[symbol].slice(-1000)
        }
      })
      
      state.market.data.lastPriceUpdate = timestamp
      state.market.error = null
    })
  },
  
  updatePrice: (symbol: string, price: number, change24h = 0, volume24h = 0, marketCap = 0) => {
    const priceData = { price, change24h, volume24h, marketCap }
    get().updatePrices({ [symbol]: priceData })
  },
  
  addToWatchlist: (symbol: string) => {
    set((state) => {
      if (!state.market.watchlist.includes(symbol)) {
        state.market.watchlist.push(symbol)
      }
    })
  },
  
  removeFromWatchlist: (symbol: string) => {
    set((state) => {
      state.market.watchlist = state.market.watchlist.filter(s => s !== symbol)
    })
  },
  
  clearWatchlist: () => {
    set((state) => {
      state.market.watchlist = []
    })
  },
  
  setMarketLoading: (key: keyof MarketState['loading'], loading: boolean) => {
    set((state) => {
      state.market.loading[key] = loading
    })
  },
  
  setMarketError: (error: string | null, source = 'unknown') => {
    set((state) => {
      state.market.error = error
      if (error) {
        state.market.lastError = {
          message: error,
          timestamp: Date.now(),
          source,
        }
      }
    })
  },
  
  updateMarketPreferences: (preferences: Partial<MarketState['preferences']>) => {
    set((state) => {
      state.market.preferences = { ...state.market.preferences, ...preferences }
    })
  },
  
  addPriceAlert: (alert: MarketState['preferences']['priceAlerts'][0]) => {
    set((state) => {
      state.market.preferences.priceAlerts.push(alert)
    })
  },
  
  removePriceAlert: (id: string) => {
    set((state) => {
      state.market.preferences.priceAlerts = state.market.preferences.priceAlerts.filter(
        alert => alert.id !== id
      )
    })
  },
  
  enableRealTimeUpdates: () => {
    set((state) => {
      state.market.realTimeUpdates.enabled = true
    })
  },
  
  disableRealTimeUpdates: () => {
    set((state) => {
      state.market.realTimeUpdates.enabled = false
    })
  },
  
  updateRealTimeData: (data: Partial<MarketData>) => {
    set((state) => {
      if (state.market.realTimeUpdates.enabled) {
        state.market.data = { ...state.market.data, ...data }
        state.market.realTimeUpdates.lastUpdate = Date.now()
        state.market.realTimeUpdates.updateCount++
      }
    })
  },
  
  addPriceHistory: (symbol: string, data: { timestamp: number; price: number; volume: number }) => {
    set((state) => {
      if (!state.market.priceHistory[symbol]) {
        state.market.priceHistory[symbol] = []
      }
      
      state.market.priceHistory[symbol].push(data)
      
      // Keep only last 1000 entries
      if (state.market.priceHistory[symbol].length > 1000) {
        state.market.priceHistory[symbol] = state.market.priceHistory[symbol].slice(-1000)
      }
    })
  },
  
  clearPriceHistory: (symbol?: string) => {
    set((state) => {
      if (symbol) {
        delete state.market.priceHistory[symbol]
      } else {
        state.market.priceHistory = {}
      }
    })
  },
  
  refreshMarketData: async () => {
    try {
      set((state) => {
        state.market.loading.market = true
        state.market.error = null
      })
      
      // Mock data refresh - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockData: Partial<MarketData> = {
        btcPrice: 45000 + Math.random() * 1000,
        btcChange24h: (Math.random() - 0.5) * 10,
        fearGreedIndex: Math.floor(Math.random() * 100),
        hashrate: 400000000 + Math.random() * 50000000,
        difficulty: 60000000000000 + Math.random() * 5000000000000,
        mempoolSize: Math.floor(Math.random() * 100000),
        lastUpdated: Date.now(),
      }
      
      get().updateMarketData(mockData)
      
    } catch (error: any) {
      get().setMarketError(error.message || 'Failed to refresh market data', 'refreshMarketData')
    } finally {
      set((state) => {
        state.market.loading.market = false
      })
    }
  },
  
  refreshPrices: async () => {
    const { watchlist } = get().market
    
    try {
      set((state) => {
        state.market.loading.prices = true
      })
      
      // Mock price refresh - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockPrices: PriceData = {}
      watchlist.forEach(symbol => {
        const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 3000 : 100
        mockPrices[symbol] = {
          price: basePrice + Math.random() * 1000,
          change24h: (Math.random() - 0.5) * 10,
          volume24h: Math.random() * 1000000000,
          marketCap: Math.random() * 1000000000000,
          lastUpdated: Date.now(),
        }
      })
      
      get().updatePrices(mockPrices)
      
    } catch (error: any) {
      get().setMarketError(error.message || 'Failed to refresh prices', 'refreshPrices')
    } finally {
      set((state) => {
        state.market.loading.prices = false
      })
    }
  },
})