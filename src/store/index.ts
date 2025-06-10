import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import marketSlice from './marketSlice'
import miningSlice from './miningSlice'
import mempoolSlice from './mempoolSlice'
import userSlice from './userSlice'
import assetSlice from './assetSlice'

export const store = configureStore({
  reducer: {
    market: marketSlice,
    mining: miningSlice,
    mempool: mempoolSlice,
    user: userSlice,
    asset: assetSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector