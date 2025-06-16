import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface MempoolState {
  unconfirmedCount: number
  totalSize: number
  totalFees: number
  medianFee: number
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: MempoolState = {
  unconfirmedCount: 0,
  totalSize: 0,
  totalFees: 0,
  medianFee: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

const mempoolSlice = createSlice({
  name: "mempool",
  initialState,
  reducers: {
    setMempoolData: (state, action: PayloadAction<Partial<MempoolState>>) => {
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

export const { setMempoolData, setLoading, setError } = mempoolSlice.actions
export default mempoolSlice.reducer
