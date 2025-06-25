'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  RefreshCw, 
  Zap, 
  Clock, 
  DollarSign,
  Activity,
  Settings,
  BarChart3,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

// Import our fixed components
import FixedQuickTrade from '@/components/quick-trade/FixedQuickTrade'
import AssetSwitchProvider, { useAssetSwitch, useAssetSwitchWithStates } from '@/contexts/AssetSwitchProvider'
import { useAssetManagement } from '@/hooks/useAssetManagement'

// Asset demo component
function AssetSwitchDemo() {
  const {
    selectedAsset,
    assetPrices,
    isLoadingAssetData,
    isLoadingAssetSwitch,
    refreshAssetData,
    getAssetDisplayPrice,
    isDataStale,
    lastAssetSwitch
  } = useAssetManagement()
  
  const {
    switchAsset,
    isLoadingSwitch,
    onAssetSwitch,
    onAssetDataRefresh,
    getCacheStatus
  } = useAssetSwitch()
  
  const [switchLog, setSwitchLog] = useState<Array<{
    timestamp: number
    from: string
    to: string
    duration: number
  }>>([])
  
  const [refreshLog, setRefreshLog] = useState<Array<{
    timestamp: number
    asset: string
  }>>([])
  
  const [cacheStatus, setCacheStatus] = useState<any>(null)
  
  // Popular assets for demo
  const popularAssets = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'BNB', 'AVAX', 'MATIC']
  
  // Track asset switches
  useEffect(() => {
    const unsubscribe = onAssetSwitch((newAsset, oldAsset) => {
      const switchTime = Date.now()
      const duration = switchTime - lastAssetSwitch
      
      setSwitchLog(prev => [{
        timestamp: switchTime,
        from: oldAsset,
        to: newAsset,
        duration
      }, ...prev.slice(0, 9)]) // Keep last 10
    })
    
    return unsubscribe
  }, [onAssetSwitch, lastAssetSwitch])
  
  // Track data refreshes
  useEffect(() => {
    const unsubscribe = onAssetDataRefresh((asset) => {
      setRefreshLog(prev => [{
        timestamp: Date.now(),
        asset
      }, ...prev.slice(0, 9)]) // Keep last 10
    })
    
    return unsubscribe
  }, [onAssetDataRefresh])
  
  // Update cache status periodically
  useEffect(() => {
    const updateCacheStatus = () => {
      setCacheStatus(getCacheStatus())
    }
    
    updateCacheStatus()
    const interval = setInterval(updateCacheStatus, 2000)
    
    return () => clearInterval(interval)
  }, [getCacheStatus])
  
  const handleAssetSwitch = async (newAsset: string) => {
    try {
      await switchAsset(undefined, newAsset)
    } catch (error) {
      console.error('Switch failed:', error)
    }
  }
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }
  
  const formatDuration = (ms: number) => {
    return `${ms}ms`
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Asset Switching Demo</h1>
        <p className="text-gray-600">
          Demonstrating fixed asset switching with real-time updates, proper loading states, and cache management
        </p>
      </div>
      
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Current Asset</p>
                <p className="font-bold text-lg">{selectedAsset}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="font-bold text-lg">
                  {getAssetDisplayPrice(selectedAsset)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Data Freshness</p>
                <Badge variant={isDataStale(selectedAsset) ? "destructive" : "default"}>
                  {isDataStale(selectedAsset) ? 'Stale' : 'Fresh'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className={`w-5 h-5 ${isLoadingSwitch ? 'animate-spin text-blue-500' : 'text-gray-400'}`} />
              <div>
                <p className="text-sm text-gray-600">Switch Status</p>
                <Badge variant={isLoadingSwitch ? "default" : "outline"}>
                  {isLoadingSwitch ? 'Switching' : 'Ready'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Asset Switching Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Asset Switching Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {popularAssets.map(asset => (
              <Button
                key={asset}
                variant={selectedAsset === asset ? "default" : "outline"}
                onClick={() => handleAssetSwitch(asset)}
                disabled={isLoadingSwitch || selectedAsset === asset}
                className="relative"
              >
                {asset}
                {isDataStale(asset) && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </Button>
            ))}
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={refreshAssetData}
              disabled={isLoadingAssetData}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingAssetData ? 'animate-spin' : ''}`} />
              Refresh Current Asset
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Demo Tabs */}
      <Tabs defaultValue="quicktrade" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quicktrade">Quick Trade</TabsTrigger>
          <TabsTrigger value="logs">Switch Logs</TabsTrigger>
          <TabsTrigger value="cache">Cache Status</TabsTrigger>
          <TabsTrigger value="prices">Price Grid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quicktrade">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The Quick Trade component below demonstrates real-time asset switching with proper state management.
              Switch assets using the controls above and watch the data update automatically.
            </AlertDescription>
          </Alert>
          <FixedQuickTrade />
        </TabsContent>
        
        <TabsContent value="logs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asset Switch Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {switchLog.length === 0 ? (
                    <p className="text-gray-500 text-sm">No switches yet</p>
                  ) : (
                    switchLog.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{entry.from} → {entry.to}</span>
                        <div className="text-right">
                          <div>{formatTime(entry.timestamp)}</div>
                          <div className="text-xs text-gray-500">{formatDuration(entry.duration)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Refresh Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {refreshLog.length === 0 ? (
                    <p className="text-gray-500 text-sm">No refreshes yet</p>
                  ) : (
                    refreshLog.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{entry.asset} refreshed</span>
                        <span>{formatTime(entry.timestamp)}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="cache">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cache Status</CardTitle>
            </CardHeader>
            <CardContent>
              {cacheStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Active Asset</p>
                      <p className="font-bold">{cacheStatus.activeAsset || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cached Assets</p>
                      <p className="font-bold">{cacheStatus.cachedAssets.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fresh Assets</p>
                      <p className="font-bold text-green-600">{cacheStatus.freshAssets.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stale Assets</p>
                      <p className="font-bold text-orange-600">{cacheStatus.staleAssets.length}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">All Cached</h4>
                      <div className="flex flex-wrap gap-1">
                        {cacheStatus.cachedAssets.map((asset: string) => (
                          <Badge key={asset} variant="outline">{asset}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Fresh</h4>
                      <div className="flex flex-wrap gap-1">
                        {cacheStatus.freshAssets.map((asset: string) => (
                          <Badge key={asset} className="bg-green-100 text-green-700">{asset}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-orange-600">Stale</h4>
                      <div className="flex flex-wrap gap-1">
                        {cacheStatus.staleAssets.map((asset: string) => (
                          <Badge key={asset} className="bg-orange-100 text-orange-700">{asset}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Loading cache status...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prices">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Price Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularAssets.map(asset => {
                  const priceData = assetPrices[asset]
                  const isSelected = selectedAsset === asset
                  const isStale = isDataStale(asset)
                  
                  return (
                    <div
                      key={asset}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      } ${isStale ? 'opacity-60' : ''}`}
                      onClick={() => handleAssetSwitch(asset)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{asset}</h3>
                        <div className="flex gap-1">
                          {isSelected && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          {isStale && <Clock className="w-4 h-4 text-orange-500" />}
                        </div>
                      </div>
                      
                      {priceData ? (
                        <>
                          <p className="text-lg font-semibold">{getAssetDisplayPrice(asset)}</p>
                          <p className={`text-sm ${
                            priceData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {priceData.priceChange24h >= 0 ? '+' : ''}{priceData.priceChange24h.toFixed(2)}%
                          </p>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Main page component with provider
export default function AssetSwitchingDemoPage() {
  return (
    <AssetSwitchProvider
      defaultAsset="BTC"
      preloadAssets={['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'BNB', 'AVAX', 'MATIC']}
      enableAutoRefresh={true}
      refreshInterval={30000}
    >
      <AssetSwitchDemo />
    </AssetSwitchProvider>
  )
}