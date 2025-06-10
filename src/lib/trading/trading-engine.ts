import { EventEmitter } from 'events'
import axios from 'axios'
import crypto from 'crypto'

export interface OrderParams {
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop' | 'stop-limit'
  quantity: number
  price?: number
  stopPrice?: number
  timeInForce?: 'GTC' | 'IOC' | 'FOK'
}

export interface Order {
  id: string
  clientOrderId: string
  symbol: string
  side: 'buy' | 'sell'
  type: string
  status: 'new' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected'
  quantity: number
  price: number
  executedQty: number
  executedPrice: number
  fee: number
  feeCurrency: string
  timestamp: number
}

export interface Balance {
  asset: string
  free: number
  locked: number
  total: number
}

export class TradingEngine extends EventEmitter {
  private apiKey: string
  private apiSecret: string
  private exchange: string
  private baseUrl: string
  
  constructor(exchange: string, apiKey: string, apiSecret: string) {
    super()
    this.exchange = exchange
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    
    // Set base URL based on exchange
    switch (exchange) {
      case 'binance':
        this.baseUrl = 'https://api.binance.com'
        break
      case 'okx':
        this.baseUrl = 'https://www.okx.com'
        break
      case 'bybit':
        this.baseUrl = 'https://api.bybit.com'
        break
      default:
        throw new Error(`Unsupported exchange: ${exchange}`)
    }
  }
  
  private generateSignature(params: any): string {
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex')
  }
  
  private async makeRequest(method: string, endpoint: string, params: any = {}) {
    const timestamp = Date.now()
    const signature = this.generateSignature({ ...params, timestamp })
    
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'X-MBX-APIKEY': this.apiKey,
        },
        params: method === 'GET' ? { ...params, timestamp, signature } : undefined,
        data: method !== 'GET' ? { ...params, timestamp, signature } : undefined,
      })
      
      return response.data
    } catch (error: any) {
      console.error('Trading engine error:', error.response?.data || error.message)
      throw error
    }
  }
  
  async getBalance(): Promise<Balance[]> {
    const endpoint = this.exchange === 'binance' ? '/api/v3/account' : '/api/v5/account/balance'
    const data = await this.makeRequest('GET', endpoint)
    
    if (this.exchange === 'binance') {
      return data.balances.map((b: any) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
        total: parseFloat(b.free) + parseFloat(b.locked)
      }))
    }
    
    return data
  }
  
  async createOrder(params: OrderParams): Promise<Order> {
    const endpoint = this.exchange === 'binance' ? '/api/v3/order' : '/api/v5/trade/order'
    
    const orderParams: any = {
      symbol: params.symbol,
      side: params.side.toUpperCase(),
      type: params.type.toUpperCase(),
      quantity: params.quantity,
    }
    
    if (params.price) {
      orderParams.price = params.price
    }
    
    if (params.stopPrice) {
      orderParams.stopPrice = params.stopPrice
    }
    
    if (params.timeInForce) {
      orderParams.timeInForce = params.timeInForce
    }
    
    const response = await this.makeRequest('POST', endpoint, orderParams)
    
    return this.formatOrder(response)
  }
  
  async cancelOrder(symbol: string, orderId: string): Promise<Order> {
    const endpoint = this.exchange === 'binance' ? '/api/v3/order' : '/api/v5/trade/cancel-order'
    
    const params = {
      symbol,
      orderId
    }
    
    const response = await this.makeRequest('DELETE', endpoint, params)
    
    return this.formatOrder(response)
  }
  
  async getOpenOrders(symbol?: string): Promise<Order[]> {
    const endpoint = this.exchange === 'binance' ? '/api/v3/openOrders' : '/api/v5/trade/orders-pending'
    
    const params = symbol ? { symbol } : {}
    const response = await this.makeRequest('GET', endpoint, params)
    
    return response.map((order: any) => this.formatOrder(order))
  }
  
  async getOrderHistory(symbol: string, limit: number = 100): Promise<Order[]> {
    const endpoint = this.exchange === 'binance' ? '/api/v3/allOrders' : '/api/v5/trade/orders-history'
    
    const params = {
      symbol,
      limit
    }
    
    const response = await this.makeRequest('GET', endpoint, params)
    
    return response.map((order: any) => this.formatOrder(order))
  }
  
  private formatOrder(rawOrder: any): Order {
    if (this.exchange === 'binance') {
      return {
        id: rawOrder.orderId.toString(),
        clientOrderId: rawOrder.clientOrderId,
        symbol: rawOrder.symbol,
        side: rawOrder.side.toLowerCase() as 'buy' | 'sell',
        type: rawOrder.type.toLowerCase(),
        status: this.mapOrderStatus(rawOrder.status),
        quantity: parseFloat(rawOrder.origQty),
        price: parseFloat(rawOrder.price),
        executedQty: parseFloat(rawOrder.executedQty),
        executedPrice: parseFloat(rawOrder.cummulativeQuoteQty) / parseFloat(rawOrder.executedQty) || 0,
        fee: 0, // Would need to fetch separately
        feeCurrency: 'USDT',
        timestamp: rawOrder.time
      }
    }
    
    // Format for other exchanges
    return rawOrder
  }
  
  private mapOrderStatus(status: string): Order['status'] {
    const statusMap: Record<string, Order['status']> = {
      'NEW': 'new',
      'FILLED': 'filled',
      'PARTIALLY_FILLED': 'partially_filled',
      'CANCELED': 'cancelled',
      'REJECTED': 'rejected',
    }
    
    return statusMap[status] || 'new'
  }
  
  // Risk Management
  async executeWithRiskManagement(params: OrderParams, maxRiskPercent: number = 2) {
    // Get current balance
    const balances = await this.getBalance()
    const usdtBalance = balances.find(b => b.asset === 'USDT')
    
    if (!usdtBalance) {
      throw new Error('No USDT balance found')
    }
    
    // Calculate position size based on risk
    const maxRiskAmount = usdtBalance.free * (maxRiskPercent / 100)
    const adjustedQuantity = Math.min(params.quantity, maxRiskAmount / (params.price || 0))
    
    // Create order with adjusted quantity
    return this.createOrder({
      ...params,
      quantity: adjustedQuantity
    })
  }
  
  // Batch Operations
  async executeBatchOrders(orders: OrderParams[]): Promise<Order[]> {
    const results: Order[] = []
    
    for (const orderParams of orders) {
      try {
        const order = await this.createOrder(orderParams)
        results.push(order)
        this.emit('orderCreated', order)
      } catch (error) {
        this.emit('orderError', { params: orderParams, error })
      }
    }
    
    return results
  }
}

// Export singleton instances for each exchange
export const binanceEngine = new TradingEngine(
  'binance',
  process.env.BINANCE_API_KEY || '',
  process.env.BINANCE_SECRET_KEY || ''
)

export const okxEngine = new TradingEngine(
  'okx', 
  process.env.OKX_API_KEY || '',
  process.env.OKX_SECRET_KEY || ''
)

export const bybitEngine = new TradingEngine(
  'bybit',
  process.env.BYBIT_API_KEY || '',
  process.env.BYBIT_SECRET_KEY || ''
)