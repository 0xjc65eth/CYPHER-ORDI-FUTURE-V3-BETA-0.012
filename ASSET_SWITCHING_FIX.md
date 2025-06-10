# Asset Switching Fix Implementation

## Overview

This document outlines the comprehensive fix for the asset switching mechanism in the Bitcoin Analytics Web Application. The implementation addresses the core issues where switching between different assets didn't update the displayed values properly.

## Problems Identified

### Before the Fix:
1. **No Centralized State Management**: Each component maintained its own `selectedAsset` state locally
2. **Non-Reactive Data Updates**: Components didn't properly react to asset changes
3. **Cache Issues**: Stale data persisted when switching assets
4. **Missing Loading States**: No indication when assets were being switched
5. **Inconsistent Data Display**: Different components showed different data for the same asset
6. **No Real-time Updates**: Asset data wasn't refreshed automatically

## Solution Architecture

### 1. Centralized State Management

#### Redux Asset Slice (`src/store/assetSlice.ts`)
```typescript
interface AssetState {
  selectedAsset: Token | null
  selectedAssetSymbol: string
  assetPrices: Record<string, AssetPriceData>
  isLoadingAssetData: boolean
  isLoadingAssetSwitch: boolean
  error: string | null
  lastAssetSwitch: number
  assetHistory: string[]
}
```

**Key Features:**
- Centralized selected asset state
- Real-time price tracking for all assets
- Loading states for both data fetching and asset switching
- Error handling with proper state management
- Asset history for UX improvements

### 2. Asset Management Hook (`src/hooks/useAssetManagement.ts`)

**Core Functionality:**
- **Asset Switching**: `switchAsset(asset?, symbol?)` - Handles asset transitions with proper state updates
- **Data Fetching**: Integrates with React Query for efficient caching and background updates
- **Real-time Updates**: Automatic price refreshing every 30 seconds
- **Cache Management**: Intelligent cache invalidation and stale data detection
- **Error Handling**: Comprehensive error management with fallback mechanisms

**API:**
```typescript
const {
  selectedAssetSymbol,
  currentAssetPrice,
  assetPrices,
  isLoadingAssetData,
  isLoadingAssetSwitch,
  switchAsset,
  refreshAssetData,
  getAssetDisplayPrice,
  isDataStale
} = useAssetManagement()
```

### 3. Enhanced Cache Management (`src/lib/cache/assetSwitchCache.ts`)

**AssetSwitchCacheManager Features:**
- **Smart Invalidation**: Automatically invalidates related queries when switching assets
- **Prefetching**: Preloads data for new assets to reduce switching time
- **Stale Data Detection**: Identifies and manages outdated information
- **Background Cleanup**: Automatically removes old cache entries
- **Performance Optimization**: Reduces API calls through intelligent caching

**Key Methods:**
```typescript
class AssetSwitchCacheManager {
  async switchToAsset(newAsset: string): Promise<void>
  async refreshCurrentAsset(): Promise<void>
  async preloadAssets(assets: string[]): Promise<void>
  isAssetDataFresh(asset: string): boolean
  async clearAssetCache(asset: string): Promise<void>
}
```

### 4. Asset Switch Provider (`src/contexts/AssetSwitchProvider.tsx`)

**Context Provider Features:**
- **Event System**: Subscribe to asset switch and data refresh events
- **Automatic Preloading**: Preloads popular assets on initialization
- **Auto-refresh**: Configurable automatic data refresh intervals
- **Error Recovery**: Handles failures gracefully with rollback mechanisms

**Usage:**
```tsx
<AssetSwitchProvider
  defaultAsset="BTC"
  preloadAssets={['BTC', 'ETH', 'SOL', 'USDC']}
  enableAutoRefresh={true}
  refreshInterval={30000}
>
  <YourComponents />
</AssetSwitchProvider>
```

### 5. Enhanced Components

#### Fixed Quick Trade (`src/components/quick-trade/FixedQuickTrade.tsx`)
- **Reactive Asset Updates**: Automatically recalculates when assets change
- **Loading States**: Shows loading indicators during asset switches
- **Error Handling**: Displays appropriate error messages
- **Real-time Pricing**: Updates prices automatically
- **Stale Data Indicators**: Visual cues for outdated information

#### Enhanced Token Selector (`src/components/trading/EnhancedTokenSelector.tsx`)
- **Live Price Integration**: Shows real-time prices and changes
- **Data Freshness Indicators**: Visual indicators for stale data
- **Auto-refresh Capability**: Manual and automatic data refresh
- **Improved UX**: Better loading states and error handling

## Implementation Details

### Asset Switching Flow

1. **User Initiates Switch**
   ```typescript
   await switchAsset(undefined, 'ETH')
   ```

2. **State Update**
   - Redux state updated with loading indicator
   - Previous asset preserved for rollback

3. **Cache Management**
   - Invalidate queries for new asset
   - Check for fresh data availability
   - Prefetch if data is stale

4. **Data Fetching**
   - Fetch fresh price data if needed
   - Update Redux store with new data
   - Trigger component re-renders

5. **Completion**
   - Mark switch as complete
   - Update loading states
   - Notify event listeners

### React Query Integration

**Query Configuration:**
```typescript
const { data: liveAssetPrice } = useQuery({
  queryKey: ['asset-price', selectedAssetSymbol],
  queryFn: () => AssetPriceService.fetchAssetPrice(selectedAssetSymbol),
  refetchInterval: 30000,
  staleTime: 20000,
  enabled: !!selectedAssetSymbol,
  onSuccess: (data) => dispatch(setAssetPrice({ symbol: selectedAssetSymbol, ...data }))
})
```

### Error Handling Strategy

1. **Network Errors**: Fallback to mock data for development
2. **API Failures**: Retry with exponential backoff
3. **Switch Failures**: Rollback to previous asset
4. **Cache Errors**: Clear corrupted cache entries
5. **User Feedback**: Clear error messages and recovery options

## Features Implemented

### ✅ Reactive Data Updates
- Components automatically update when assets change
- Real-time price synchronization across all components
- Automatic recalculation of derived values

### ✅ Proper State Management
- Centralized asset state in Redux
- Consistent data across all components
- Proper loading and error states

### ✅ Loading States
- Visual indicators during asset switches
- Different loading states for data vs switching
- Skeleton loading for price data

### ✅ Cache Management
- Intelligent cache invalidation
- Stale data detection and refresh
- Background cleanup of old entries

### ✅ Real-time Updates
- Automatic price refresh every 30 seconds
- Manual refresh capabilities
- Event-driven updates

### ✅ Error Recovery
- Graceful error handling
- Fallback mechanisms
- User-friendly error messages

## Usage Examples

### Basic Asset Switching
```tsx
import { useAssetManagement } from '@/hooks/useAssetManagement'

function MyComponent() {
  const { 
    selectedAssetSymbol, 
    currentAssetPrice, 
    switchAsset, 
    isLoadingAssetSwitch 
  } = useAssetManagement()

  const handleSwitch = () => {
    switchAsset(undefined, 'ETH')
  }

  return (
    <div>
      <p>Current: {selectedAssetSymbol}</p>
      <p>Price: {currentAssetPrice?.price}</p>
      <button onClick={handleSwitch} disabled={isLoadingAssetSwitch}>
        Switch to ETH
      </button>
    </div>
  )
}
```

### Event Listening
```tsx
import { useAssetSwitch } from '@/contexts/AssetSwitchProvider'

function LoggingComponent() {
  const { onAssetSwitch } = useAssetSwitch()

  useEffect(() => {
    const unsubscribe = onAssetSwitch((newAsset, oldAsset) => {
      console.log(`Switched from ${oldAsset} to ${newAsset}`)
    })
    
    return unsubscribe
  }, [onAssetSwitch])

  return <div>Logging asset switches...</div>
}
```

## Testing

### Demo Page
Access the comprehensive demo at `/asset-switching-demo` to see:
- Real-time asset switching
- Loading state demonstrations
- Cache status monitoring
- Switch and refresh logging
- Live price grid

### Key Test Scenarios
1. **Rapid Asset Switching**: Switch between assets quickly to test state consistency
2. **Network Interruption**: Test error handling and recovery
3. **Stale Data**: Verify stale data detection and refresh
4. **Cache Management**: Monitor cache status and cleanup
5. **Real-time Updates**: Verify automatic price updates

## Performance Optimizations

1. **Query Deduplication**: React Query prevents duplicate requests
2. **Background Refetching**: Updates happen without blocking UI
3. **Intelligent Caching**: Only fetch when necessary
4. **Batch Updates**: Group related state updates
5. **Memory Management**: Automatic cleanup of old cache entries

## Migration Guide

### For Existing Components

1. **Replace Local State**:
   ```tsx
   // Before
   const [selectedAsset, setSelectedAsset] = useState('BTC')
   
   // After
   const { selectedAssetSymbol, switchAsset } = useAssetManagement()
   ```

2. **Use Centralized Data**:
   ```tsx
   // Before
   const [price, setPrice] = useState(0)
   
   // After
   const { currentAssetPrice } = useAssetManagement()
   ```

3. **Handle Loading States**:
   ```tsx
   // Before
   {isLoading && <Spinner />}
   
   // After
   {isLoadingAssetSwitch && <Spinner />}
   ```

## File Structure

```
src/
├── store/
│   └── assetSlice.ts                 # Redux asset state management
├── hooks/
│   └── useAssetManagement.ts         # Main asset management hook
├── lib/cache/
│   └── assetSwitchCache.ts          # Cache management utilities
├── contexts/
│   └── AssetSwitchProvider.tsx      # React context provider
├── components/
│   ├── quick-trade/
│   │   └── FixedQuickTrade.tsx      # Fixed trading component
│   └── trading/
│       └── EnhancedTokenSelector.tsx # Enhanced token selector
└── app/
    └── asset-switching-demo/
        └── page.tsx                  # Demo and testing page
```

## Conclusion

This comprehensive fix addresses all identified issues with asset switching:

- **Reactive Updates**: All components now properly react to asset changes
- **Centralized State**: Consistent data management across the application
- **Real-time Data**: Automatic updates keep information current
- **Performance**: Optimized caching and query management
- **User Experience**: Clear loading states and error handling
- **Maintainability**: Clean, documented, and testable code

The implementation provides a robust foundation for asset management that can be extended for additional features like portfolio tracking, advanced analytics, and multi-asset operations.

## Next Steps

1. **Integration**: Integrate the fixed components into existing pages
2. **Testing**: Comprehensive testing across different scenarios
3. **Monitoring**: Add analytics to track switching performance
4. **Extensions**: Consider additional features like asset favorites, recent assets, etc.
5. **Documentation**: Create user guides for the enhanced functionality