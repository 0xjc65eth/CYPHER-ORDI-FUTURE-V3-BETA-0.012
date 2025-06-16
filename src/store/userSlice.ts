import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UserState {
  id: string | null
  email: string | null
  name: string | null
  isAuthenticated: boolean
  preferences: {
    theme: "light" | "dark"
    language: string
    notifications: boolean
  }
  isLoading: boolean
  error: string | null
}

const initialState: UserState = {
  id: null,
  email: null,
  name: null,
  isAuthenticated: false,
  preferences: {
    theme: "dark",
    language: "en",
    notifications: true,
  },
  isLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      Object.assign(state, action.payload)
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    logout: (state) => {
      state.id = null
      state.email = null
      state.name = null
      state.isAuthenticated = false
      state.error = null
    },
  },
})

export const { setUser, setLoading, setError, logout } = userSlice.actions
export default userSlice.reducer
