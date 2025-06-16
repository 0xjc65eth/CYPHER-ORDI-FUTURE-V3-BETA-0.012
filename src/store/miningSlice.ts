import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface MiningState {
  hashRate: number
  difficulty: number
  nextAdjustment: number
  blockHeight: number
  avgBlockTime: number
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: MiningState = {
  hashRate: 0,
  difficulty: 0,
  nextAdjustment: 0,
  blockHeight: 0,
  avgBlockTime: 600,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

const miningSlice = createSlice({
  name: "mining",
  initialState,
  reducers: {
    setMiningData: (state, action: PayloadAction<Partial<MiningState>>) => {
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
  },
})

export const { setMiningData, setLoading, setError } = miningSlice.actions
export default miningSlice.reducer
