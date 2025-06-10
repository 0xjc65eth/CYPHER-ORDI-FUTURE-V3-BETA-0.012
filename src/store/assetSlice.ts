import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Token } from "@/types/quickTrade"

interface AssetState {
  selectedAsset: Token | null
  selectedAssetSymbol: string
  assetPrices: Record<string, {
    price: number
    priceChange24h: number
    volume24h: number
    marketCap: number
    lastUpdated: number
  }>
  isLoadingAssetData: boolean
  isLoadingAssetSwitch: boolean
  error: string | null
  lastAssetSwitch: number
  assetHistory: string[] // Track recently selected assets
}

const initialState: AssetState = {
  selectedAsset: null,
  selectedAssetSymbol: 'BTC', // Default to Bitcoin
  assetPrices: {},
  isLoadingAssetData: false,
  isLoadingAssetSwitch: false,
  error: null,
  lastAssetSwitch: 0,
  assetHistory: ['BTC']
}

const assetSlice = createSlice({
  name: "asset",
  initialState,
  reducers: {
    setSelectedAsset: (state, action: PayloadAction<{ asset?: Token; symbol?: string }>) => {
      const { asset, symbol } = action.payload
      
      // Set loading state for asset switch
      state.isLoadingAssetSwitch = true
      
      if (asset) {
        state.selectedAsset = asset
        state.selectedAssetSymbol = asset.symbol
      } else if (symbol) {
        state.selectedAssetSymbol = symbol
      }
      
      // Update asset history
      const newSymbol = asset?.symbol || symbol
      if (newSymbol && !state.assetHistory.includes(newSymbol)) {
        state.assetHistory = [newSymbol, ...state.assetHistory.slice(0, 9)] // Keep last 10
      }
      
      state.lastAssetSwitch = Date.now()
      state.error = null
    },
    
    setAssetSwitchComplete: (state) => {
      state.isLoadingAssetSwitch = false
    },
    
    setAssetPrice: (state, action: PayloadAction<{
      symbol: string
      price: number
      priceChange24h?: number
      volume24h?: number
      marketCap?: number
    }>) => {
      const { symbol, price, priceChange24h, volume24h, marketCap } = action.payload
      
      state.assetPrices[symbol] = {
        price,
        priceChange24h: priceChange24h || 0,
        volume24h: volume24h || 0,
        marketCap: marketCap || 0,
        lastUpdated: Date.now()
      }
    },
    
    setAssetPrices: (state, action: PayloadAction<Record<string, {
      price: number
      priceChange24h?: number
      volume24h?: number
      marketCap?: number
    }>>) => {
      const timestamp = Date.now()
      Object.entries(action.payload).forEach(([symbol, data]) => {
        state.assetPrices[symbol] = {
          price: data.price,
          priceChange24h: data.priceChange24h || 0,
          volume24h: data.volume24h || 0,
          marketCap: data.marketCap || 0,
          lastUpdated: timestamp
        }
      })
    },
    
    setAssetDataLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingAssetData = action.payload
    },
    
    setAssetError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoadingAssetData = false
      state.isLoadingAssetSwitch = false
    },
    
    clearAssetError: (state) => {
      state.error = null
    },
    
    // Clear stale price data (older than 5 minutes)
    clearStaleAssetData: (state) => {
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
      Object.keys(state.assetPrices).forEach(symbol => {
        if (state.assetPrices[symbol].lastUpdated < fiveMinutesAgo) {
          delete state.assetPrices[symbol]
        }
      })
    },
    
    // Reset asset state
    resetAssetState: (state) => {
      state.selectedAsset = null
      state.selectedAssetSymbol = 'BTC'
      state.assetPrices = {}
      state.isLoadingAssetData = false
      state.isLoadingAssetSwitch = false
      state.error = null
      state.lastAssetSwitch = 0
      state.assetHistory = ['BTC']
    }
  },
})

export const { 
  setSelectedAsset,
  setAssetSwitchComplete,
  setAssetPrice,
  setAssetPrices,
  setAssetDataLoading,
  setAssetError,
  clearAssetError,
  clearStaleAssetData,
  resetAssetState
} = assetSlice.actions

export default assetSlice.reducer

// Selectors
export const selectSelectedAsset = (state: { asset: AssetState }) => state.asset.selectedAsset
export const selectSelectedAssetSymbol = (state: { asset: AssetState }) => state.asset.selectedAssetSymbol
export const selectAssetPrice = (symbol: string) => (state: { asset: AssetState }) => 
  state.asset.assetPrices[symbol]
export const selectAssetPrices = (state: { asset: AssetState }) => state.asset.assetPrices
export const selectIsLoadingAssetData = (state: { asset: AssetState }) => state.asset.isLoadingAssetData
export const selectIsLoadingAssetSwitch = (state: { asset: AssetState }) => state.asset.isLoadingAssetSwitch
export const selectAssetError = (state: { asset: AssetState }) => state.asset.error
export const selectAssetHistory = (state: { asset: AssetState }) => state.asset.assetHistory
export const selectLastAssetSwitch = (state: { asset: AssetState }) => state.asset.lastAssetSwitch