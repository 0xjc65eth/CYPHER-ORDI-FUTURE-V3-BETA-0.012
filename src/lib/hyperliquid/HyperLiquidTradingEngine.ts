import { EnhancedLogger } from '@/lib/enhanced-logger'
import { performanceMonitor } from '@/lib/performance/PerformanceMonitor'
import { createAPICircuitBreaker } from '@/lib/circuit-breaker/CircuitBreaker'
import { HyperLiquidWebSocket, hyperLiquidWS } from './HyperLiquidWebSocket'

export interface HyperLiquidConfig {
  apiKey?: string
  secretKey?: string
  useTestnet: boolean
  maxOrderSize: number
  maxPositionSize: number
  defaultLeverage: number
  riskLimits: RiskLimits
}

export interface RiskLimits {
  maxDailyLoss: number
  maxOpenPositions: number
  maxOrderValue: number
  maxLeverage: number
  stopLossPercentage: number
  takeProfitPercentage: number
}

export interface OrderRequest {
  coin: string
  is_buy: boolean
  sz: number // size
  limit_px: number // limit price
  order_type: 'Limit' | 'Market' | 'Stop' | 'StopLimit'
  reduce_only?: boolean
  time_in_force?: 'Gtc' | 'Ioc' | 'Fok'
  post_only?: boolean
  cloid?: string // client order id
}

export interface Position {
  coin: string
  szi: string // size (negative for short)
  entryPx?: string // entry price
  positionValue: string
  unrealizedPnl: string
  returnOnEquity: string
  leverage: string
  maxLeverage: string
  marginUsed: string
}

export interface OrderStatus {
  order: {
    coin: string
    side: 'A' | 'B'
    limitPx: string
    sz: string
    oid: number
    timestamp: number
    origSz: string
    cloid?: string
  }
  status: 'open' | 'filled' | 'canceled' | 'triggered' | 'rejected'
  statusTimestamp: number
}

export interface TradeResult {
  success: boolean
  orderId?: number
  cloid?: string
  error?: string
  timestamp: number
}

export interface AccountInfo {
  marginSummary: {
    accountValue: string
    totalNtlPos: string
    totalRawUsd: string
    totalMarginUsed: string
  }
  crossMaintenanceMarginUsed: string
  crossMarginSummary: {
    accountValue: string
    totalNtlPos: string
    totalRawUsd: string
    totalMarginUsed: string
  }
  time: number
}

export interface MarketData {
  coin: string
  markPx: string // mark price
  midPx?: string // mid price
  prevDayPx?: string // previous day price
  dayNtlVlm?: string // 24h notional volume
  premium?: string
  oiOpen?: string // open interest
  funding?: string
  impactPxs?: string[]
}

export class HyperLiquidTradingEngine {
  private config: HyperLiquidConfig
  private positions = new Map<string, Position>()
  private openOrders = new Map<number, OrderStatus>()
  private isInitialized = false
  private circuitBreaker = createAPICircuitBreaker('HyperLiquid-API', {
    failureThreshold: 3,
    recoveryTimeout: 30000,
    timeout: 15000
  })

  // API endpoints
  private readonly API_URL = 'https://api.hyperliquid.xyz'
  private readonly TESTNET_API_URL = 'https://api.hyperliquid-testnet.xyz'

  constructor(config: HyperLiquidConfig) {
    this.config = config
    this.setupWebSocketHandlers()
  }

  async initialize(): Promise<void> {
    try {
      EnhancedLogger.info('Initializing HyperLiquid Trading Engine', {
        component: 'HyperLiquidTradingEngine',
        useTestnet: this.config.useTestnet
      })

      // Connect to WebSocket
      await hyperLiquidWS.connect()

      // Load initial data
      await this.loadAccountInfo()
      await this.loadOpenOrders()
      await this.loadPositions()

      // Subscribe to user updates
      if (this.config.apiKey) {
        await hyperLiquidWS.subscribeToUser(this.config.apiKey)
        await hyperLiquidWS.subscribeToOrderUpdates(this.config.apiKey)
        await hyperLiquidWS.subscribeToFills(this.config.apiKey)
      }

      this.isInitialized = true

      EnhancedLogger.info('HyperLiquid Trading Engine initialized successfully', {
        component: 'HyperLiquidTradingEngine',
        positionCount: this.positions.size,
        openOrderCount: this.openOrders.size
      })

    } catch (error) {
      EnhancedLogger.error('Failed to initialize HyperLiquid Trading Engine', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      throw error
    }
  }

  private setupWebSocketHandlers(): void {
    hyperLiquidWS.on('userUpdate', (data: any) => {
      this.handleUserUpdate(data)
    })

    hyperLiquidWS.on('orderUpdate', (data: any) => {
      this.handleOrderUpdate(data)
    })

    hyperLiquidWS.on('fill', (data: any) => {
      this.handleFill(data)
    })
  }

  private handleUserUpdate(data: any): void {
    try {
      if (data.type === 'accountValue') {
        EnhancedLogger.info('Account value updated', {
          component: 'HyperLiquidTradingEngine',
          accountValue: data.data.accountValue
        })
      }
    } catch (error) {
      EnhancedLogger.error('Error handling user update', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private handleOrderUpdate(data: any): void {
    try {
      const orderStatus: OrderStatus = {
        order: data.order,
        status: data.status,
        statusTimestamp: data.timestamp || Date.now()
      }

      this.openOrders.set(data.order.oid, orderStatus)

      EnhancedLogger.info('Order status updated', {
        component: 'HyperLiquidTradingEngine',
        orderId: data.order.oid,
        status: data.status,
        coin: data.order.coin
      })

      performanceMonitor.recordMetric({
        name: 'Order Update Processing',
        value: Date.now() - data.timestamp,
        unit: 'ms',
        category: 'api',
        tags: { status: data.status }
      })

    } catch (error) {
      EnhancedLogger.error('Error handling order update', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private handleFill(data: any): void {
    try {
      EnhancedLogger.info('Order filled', {
        component: 'HyperLiquidTradingEngine',
        coin: data.coin,
        side: data.side,
        size: data.sz,
        price: data.px,
        fee: data.fee
      })

      // Update positions after fill
      this.updatePositionFromFill(data)

    } catch (error) {
      EnhancedLogger.error('Error handling fill', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private updatePositionFromFill(fillData: any): void {
    const coin = fillData.coin
    const existingPosition = this.positions.get(coin)

    // This is a simplified position calculation
    // In production, you'd want more sophisticated position tracking
    if (existingPosition) {
      // Update existing position
      const currentSize = parseFloat(existingPosition.szi)
      const fillSize = parseFloat(fillData.sz) * (fillData.side === 'B' ? 1 : -1)
      const newSize = currentSize + fillSize

      existingPosition.szi = newSize.toString()
      this.positions.set(coin, existingPosition)
    } else {
      // Create new position
      const newPosition: Position = {
        coin,
        szi: (parseFloat(fillData.sz) * (fillData.side === 'B' ? 1 : -1)).toString(),
        entryPx: fillData.px,
        positionValue: (parseFloat(fillData.sz) * parseFloat(fillData.px)).toString(),
        unrealizedPnl: '0',
        returnOnEquity: '0',
        leverage: '1',
        maxLeverage: this.config.riskLimits.maxLeverage.toString(),
        marginUsed: '0'
      }
      this.positions.set(coin, newPosition)
    }
  }

  // Trading operations
  async placeOrder(orderRequest: OrderRequest): Promise<TradeResult> {
    if (!this.isInitialized) {
      throw new Error('Trading engine not initialized')
    }

    return this.circuitBreaker.execute(async () => {
      return this.executePlaceOrder(orderRequest)
    })
  }

  private async executePlaceOrder(orderRequest: OrderRequest): Promise<TradeResult> {
    const startTime = performance.now()

    try {
      // Validate order before placing
      const validationResult = this.validateOrder(orderRequest)
      if (!validationResult.valid) {
        return {
          success: false,
          error: validationResult.error,
          timestamp: Date.now()
        }
      }

      // Prepare order for HyperLiquid API
      const hyperLiquidOrder = {
        action: {
          type: 'order',
          orders: [{
            a: orderRequest.coin,
            b: orderRequest.is_buy,
            p: orderRequest.limit_px.toString(),
            s: orderRequest.sz.toString(),
            r: orderRequest.reduce_only || false,
            t: {
              limit: {
                tif: orderRequest.time_in_force || 'Gtc'
              }
            },
            c: orderRequest.cloid
          }]
        },
        nonce: Date.now(),
        signature: this.signRequest({}) // Implement signature logic
      }

      const response = await fetch(this.getApiUrl('/exchange'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hyperLiquidOrder)
      })

      const result = await response.json()

      if (result.status === 'ok') {
        const orderId = result.response?.data?.statuses?.[0]?.resting?.oid

        EnhancedLogger.info('Order placed successfully', {
          component: 'HyperLiquidTradingEngine',
          orderId,
          coin: orderRequest.coin,
          side: orderRequest.is_buy ? 'buy' : 'sell',
          size: orderRequest.sz,
          price: orderRequest.limit_px
        })

        performanceMonitor.recordMetric({
          name: 'Order Placement',
          value: performance.now() - startTime,
          unit: 'ms',
          category: 'api',
          tags: { success: 'true', coin: orderRequest.coin }
        })

        return {
          success: true,
          orderId,
          cloid: orderRequest.cloid,
          timestamp: Date.now()
        }
      } else {
        throw new Error(result.response || 'Order placement failed')
      }

    } catch (error) {
      EnhancedLogger.error('Failed to place order', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error',
        order: orderRequest
      })

      performanceMonitor.recordMetric({
        name: 'Order Placement',
        value: performance.now() - startTime,
        unit: 'ms',
        category: 'api',
        tags: { success: 'false', coin: orderRequest.coin }
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  async cancelOrder(orderId: number): Promise<TradeResult> {
    if (!this.isInitialized) {
      throw new Error('Trading engine not initialized')
    }

    return this.circuitBreaker.execute(async () => {
      return this.executeCancelOrder(orderId)
    })
  }

  private async executeCancelOrder(orderId: number): Promise<TradeResult> {
    try {
      const cancelRequest = {
        action: {
          type: 'cancel',
          cancels: [{
            a: '', // Will be filled based on order
            o: orderId
          }]
        },
        nonce: Date.now(),
        signature: this.signRequest({}) // Implement signature logic
      }

      const response = await fetch(this.getApiUrl('/exchange'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cancelRequest)
      })

      const result = await response.json()

      if (result.status === 'ok') {
        this.openOrders.delete(orderId)

        EnhancedLogger.info('Order canceled successfully', {
          component: 'HyperLiquidTradingEngine',
          orderId
        })

        return {
          success: true,
          orderId,
          timestamp: Date.now()
        }
      } else {
        throw new Error(result.response || 'Order cancellation failed')
      }

    } catch (error) {
      EnhancedLogger.error('Failed to cancel order', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }

  async modifyOrder(orderId: number, newPrice: number, newSize?: number): Promise<TradeResult> {
    // HyperLiquid doesn't support order modification directly
    // We need to cancel and replace
    const cancelResult = await this.cancelOrder(orderId)
    
    if (!cancelResult.success) {
      return cancelResult
    }

    // Get original order details to recreate
    const originalOrder = this.openOrders.get(orderId)
    if (!originalOrder) {
      return {
        success: false,
        error: 'Original order not found',
        timestamp: Date.now()
      }
    }

    const newOrder: OrderRequest = {
      coin: originalOrder.order.coin,
      is_buy: originalOrder.order.side === 'B',
      sz: newSize || parseFloat(originalOrder.order.sz),
      limit_px: newPrice,
      order_type: 'Limit'
    }

    return this.placeOrder(newOrder)
  }

  // Risk management
  private validateOrder(order: OrderRequest): { valid: boolean; error?: string } {
    // Size validation
    if (order.sz <= 0) {
      return { valid: false, error: 'Invalid order size' }
    }

    if (order.sz > this.config.maxOrderSize) {
      return { valid: false, error: `Order size exceeds maximum (${this.config.maxOrderSize})` }
    }

    // Price validation
    if (order.limit_px <= 0) {
      return { valid: false, error: 'Invalid limit price' }
    }

    // Position size check
    const currentPosition = this.positions.get(order.coin)
    if (currentPosition) {
      const currentSize = Math.abs(parseFloat(currentPosition.szi))
      const newSize = order.is_buy ? currentSize + order.sz : Math.abs(currentSize - order.sz)
      
      if (newSize > this.config.maxPositionSize) {
        return { valid: false, error: `Position would exceed maximum size (${this.config.maxPositionSize})` }
      }
    }

    // Order value check
    const orderValue = order.sz * order.limit_px
    if (orderValue > this.config.riskLimits.maxOrderValue) {
      return { valid: false, error: `Order value exceeds maximum (${this.config.riskLimits.maxOrderValue})` }
    }

    return { valid: true }
  }

  // Data loading methods
  private async loadAccountInfo(): Promise<void> {
    try {
      const response = await fetch(this.getApiUrl('/info'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: this.config.apiKey
        })
      })

      const data = await response.json()
      
      EnhancedLogger.info('Account info loaded', {
        component: 'HyperLiquidTradingEngine',
        accountValue: data.marginSummary?.accountValue
      })

    } catch (error) {
      EnhancedLogger.error('Failed to load account info', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private async loadOpenOrders(): Promise<void> {
    try {
      const response = await fetch(this.getApiUrl('/info'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'openOrders',
          user: this.config.apiKey
        })
      })

      const orders = await response.json()
      
      // Process and store orders
      this.openOrders.clear()
      if (Array.isArray(orders)) {
        orders.forEach((order: any) => {
          this.openOrders.set(order.order.oid, {
            order: order.order,
            status: 'open',
            statusTimestamp: Date.now()
          })
        })
      }

      EnhancedLogger.info('Open orders loaded', {
        component: 'HyperLiquidTradingEngine',
        orderCount: this.openOrders.size
      })

    } catch (error) {
      EnhancedLogger.error('Failed to load open orders', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  private async loadPositions(): Promise<void> {
    try {
      const response = await fetch(this.getApiUrl('/info'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: this.config.apiKey
        })
      })

      const data = await response.json()
      
      // Process and store positions
      this.positions.clear()
      if (data.assetPositions) {
        data.assetPositions.forEach((position: any) => {
          if (parseFloat(position.position.szi) !== 0) {
            this.positions.set(position.position.coin, position.position)
          }
        })
      }

      EnhancedLogger.info('Positions loaded', {
        component: 'HyperLiquidTradingEngine',
        positionCount: this.positions.size
      })

    } catch (error) {
      EnhancedLogger.error('Failed to load positions', {
        component: 'HyperLiquidTradingEngine',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Utility methods
  private getApiUrl(endpoint: string): string {
    const baseUrl = this.config.useTestnet ? this.TESTNET_API_URL : this.API_URL
    return `${baseUrl}${endpoint}`
  }

  private signRequest(request: any): string {
    // Implement HMAC signature for authenticated requests
    // This is a placeholder - implement actual signing logic
    return 'signature_placeholder'
  }

  // Public getters
  getPositions(): Map<string, Position> {
    return new Map(this.positions)
  }

  getOpenOrders(): Map<number, OrderStatus> {
    return new Map(this.openOrders)
  }

  getPosition(coin: string): Position | undefined {
    return this.positions.get(coin)
  }

  isReady(): boolean {
    return this.isInitialized && hyperLiquidWS.isConnected()
  }

  getStats() {
    return {
      initialized: this.isInitialized,
      connected: hyperLiquidWS.isConnected(),
      positionCount: this.positions.size,
      openOrderCount: this.openOrders.size,
      circuitBreakerState: this.circuitBreaker.getState(),
      config: {
        useTestnet: this.config.useTestnet,
        maxOrderSize: this.config.maxOrderSize,
        maxPositionSize: this.config.maxPositionSize
      }
    }
  }

  // Cleanup
  async shutdown(): Promise<void> {
    EnhancedLogger.info('Shutting down HyperLiquid Trading Engine', {
      component: 'HyperLiquidTradingEngine'
    })

    hyperLiquidWS.disconnect()
    this.positions.clear()
    this.openOrders.clear()
    this.isInitialized = false
  }
}

export default HyperLiquidTradingEngine