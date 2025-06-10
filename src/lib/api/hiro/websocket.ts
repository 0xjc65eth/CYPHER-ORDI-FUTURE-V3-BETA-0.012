// Hiro WebSocket Implementation for Real-time Updates

import { EventEmitter } from 'events'
import { logger } from '@/lib/logger'
import { WebSocketMessage, WebSocketSubscription } from './types'

// WebSocket configuration
const HIRO_WS_ENDPOINT = process.env.NEXT_PUBLIC_HIRO_WS_ENDPOINT || 'wss://api.hiro.so/ordinals/v1/ws'
const RECONNECT_INTERVAL = 5000 // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 10
const PING_INTERVAL = 30000 // 30 seconds
const PONG_TIMEOUT = 5000 // 5 seconds

export class HiroWebSocket extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private pingTimer: NodeJS.Timeout | null = null
  private pongTimer: NodeJS.Timeout | null = null
  private subscriptions = new Map<string, WebSocketSubscription>()
  private isConnecting = false
  private shouldReconnect = true
  private messageQueue: any[] = []

  constructor() {
    super()
    this.setMaxListeners(50) // Increase max listeners for multiple subscriptions
  }

  // Connect to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        // Wait for current connection attempt
        const checkConnection = setInterval(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection)
            resolve()
          } else if (!this.isConnecting) {
            clearInterval(checkConnection)
            reject(new Error('Connection failed'))
          }
        }, 100)
        return
      }

      this.isConnecting = true
      
      try {
        this.ws = new WebSocket(HIRO_WS_ENDPOINT)
        
        this.ws.onopen = () => {
          logger.info('Hiro WebSocket connected')
          this.isConnecting = false
          this.reconnectAttempts = 0
          
          // Start ping/pong heartbeat
          this.startHeartbeat()
          
          // Resubscribe to previous subscriptions
          this.resubscribe()
          
          // Process queued messages
          this.processMessageQueue()
          
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            logger.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          logger.error('WebSocket error:', error)
          this.emit('error', error)
        }

        this.ws.onclose = () => {
          logger.info('WebSocket disconnected')
          this.isConnecting = false
          this.stopHeartbeat()
          this.emit('disconnected')
          
          if (this.shouldReconnect) {
            this.scheduleReconnect()
          }
          
          if (this.reconnectAttempts === 0) {
            reject(new Error('WebSocket connection failed'))
          }
        }
      } catch (error) {
        this.isConnecting = false
        logger.error('Failed to create WebSocket:', error)
        reject(error)
      }
    })
  }

  // Disconnect from WebSocket
  disconnect(): void {
    this.shouldReconnect = false
    this.clearReconnectTimer()
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.subscriptions.clear()
    this.messageQueue = []
    this.emit('disconnected')
  }

  // Subscribe to events
  subscribe(subscription: WebSocketSubscription): void {
    const key = this.getSubscriptionKey(subscription)
    this.subscriptions.set(key, subscription)
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendSubscription(subscription)
    } else {
      // Queue subscription for when connected
      this.messageQueue.push({
        type: 'subscribe',
        data: subscription
      })
    }
  }

  // Unsubscribe from events
  unsubscribe(subscription: WebSocketSubscription): void {
    const key = this.getSubscriptionKey(subscription)
    this.subscriptions.delete(key)
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendUnsubscription(subscription)
    }
  }

  // Subscribe to new inscriptions
  subscribeToInscriptions(filters?: {
    address?: string
    content_type?: string
    recursive?: boolean
  }): void {
    this.subscribe({
      event: 'inscription:new',
      filters
    })
  }

  // Subscribe to inscription transfers
  subscribeToTransfers(filters?: {
    address?: string
    inscription_id?: string
  }): void {
    this.subscribe({
      event: 'inscription:transfer',
      filters
    })
  }

  // Subscribe to rune activity
  subscribeToRunes(filters?: {
    rune_id?: string
    address?: string
    operation?: 'mint' | 'transfer' | 'burn'
  }): void {
    this.subscribe({
      event: 'rune:activity',
      filters
    })
  }

  // Subscribe to BRC-20 activity
  subscribeToBRC20(filters?: {
    ticker?: string
    address?: string
    operation?: 'deploy' | 'mint' | 'transfer'
  }): void {
    this.subscribe({
      event: 'brc20:activity',
      filters
    })
  }

  // Subscribe to blocks
  subscribeToBlocks(): void {
    this.subscribe({
      event: 'block:new'
    })
  }

  // Subscribe to mempool
  subscribeToMempool(): void {
    this.subscribe({
      event: 'mempool:update'
    })
  }

  // Handle incoming messages
  private handleMessage(message: WebSocketMessage): void {
    logger.debug('WebSocket message received:', message.type)
    
    // Emit general message event
    this.emit('message', message)
    
    // Emit specific event based on message type
    switch (message.type) {
      case 'inscription':
        this.emit('inscription', message)
        break
      case 'rune':
        this.emit('rune', message)
        break
      case 'brc20':
        this.emit('brc20', message)
        break
      case 'block':
        this.emit('block', message)
        break
      case 'mempool':
        this.emit('mempool', message)
        break
      default:
        logger.warn('Unknown message type:', message.type)
    }
  }

  // Send subscription message
  private sendSubscription(subscription: WebSocketSubscription): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'subscribe',
        ...subscription
      }))
    }
  }

  // Send unsubscription message
  private sendUnsubscription(subscription: WebSocketSubscription): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: 'unsubscribe',
        event: subscription.event
      }))
    }
  }

  // Resubscribe to all subscriptions after reconnect
  private resubscribe(): void {
    this.subscriptions.forEach(subscription => {
      this.sendSubscription(subscription)
    })
  }

  // Process queued messages
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      
      if (message.type === 'subscribe') {
        this.sendSubscription(message.data)
      }
    }
  }

  // Start heartbeat ping/pong
  private startHeartbeat(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }))
        
        // Set pong timeout
        this.pongTimer = setTimeout(() => {
          logger.warn('Pong timeout - closing connection')
          this.ws?.close()
        }, PONG_TIMEOUT)
      }
    }, PING_INTERVAL)
  }

  // Stop heartbeat
  private stopHeartbeat(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
    
    if (this.pongTimer) {
      clearTimeout(this.pongTimer)
      this.pongTimer = null
    }
  }

  // Schedule reconnection
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      logger.error('Max reconnection attempts reached')
      this.emit('max_reconnect_attempts')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(RECONNECT_INTERVAL * this.reconnectAttempts, 30000)
    
    logger.info(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        logger.error('Reconnection failed:', error)
      })
    }, delay)
  }

  // Clear reconnect timer
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  // Get subscription key
  private getSubscriptionKey(subscription: WebSocketSubscription): string {
    return `${subscription.event}:${JSON.stringify(subscription.filters || {})}`
  }

  // Get connection state
  getState(): string {
    if (!this.ws) return 'DISCONNECTED'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'CONNECTED'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
        return 'CLOSED'
      default:
        return 'UNKNOWN'
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Get subscription count
  getSubscriptionCount(): number {
    return this.subscriptions.size
  }

  // Get all subscriptions
  getSubscriptions(): WebSocketSubscription[] {
    return Array.from(this.subscriptions.values())
  }
}

// Singleton instance
export const hiroWebSocket = new HiroWebSocket()