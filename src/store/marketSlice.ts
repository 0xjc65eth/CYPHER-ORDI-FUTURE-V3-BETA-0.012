import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface MarketState {
  btcPrice: number
  btcChange24h: number
  volume24h: number
  marketCap: number
  dominance: number
  fearGreedIndex: number
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: MarketState = {
  btcPrice: 0,
  btcChange24h: 0,
  volume24h: 0,
  marketCap: 0,
  dominance: 0,
  fearGreedIndex: 50,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

const marketSlice = createSlice({
  name: "market",
  initialState,
  reducers: {
    setMarketData: (state, action: PayloadAction<Partial<MarketState>>) => {
      Object.assign(state, action.payload)
      state.lastUpdated = new Date().toISOString()
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { setMarketData, setLoading, setError, clearError } = marketSlice.actions
export default marketSlice.reducer
