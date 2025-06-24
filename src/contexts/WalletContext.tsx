'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { walletSecurity, WalletProvider, SecurityLevel, TransactionValidationRequest, TransactionType, WalletConnectionResult } from '@/lib/walletSecurity'
import { securityLogger, SecurityEventType, LogLevel } from '@/lib/securityLogs'

export interface BitcoinWalletData {
  address: string
  publicKey: string
  balance: number
  ordinals: Ordinal[]
  runes: RuneBalance[]
  inscriptions: Inscription[]
  rareSats: RareSat[]
  transactions: Transaction[]
  pnl: PNLData
}

export interface Ordinal {
  id: string
  number: number
  content_type: string
  content_body?: string
  genesis_address: string
  genesis_block_height: number
  genesis_fee: number
  genesis_transaction: string
  location: string
  value: number
  offset: number
  mime_type: string
  timestamp: string
}

export interface RuneBalance {
  rune: string
  runeid: string
  spacedRune: string
  amount: string
  symbol: string
  divisibility: number
}

export interface Inscription {
  id: string
  number: number
  address: string
  content_type: string
  content_length: number
  timestamp: string
  genesis_height: number
  genesis_fee: number
  genesis_transaction: string
  location: string
  output: string
  value: number
  offset: number
}

export interface RareSat {
  satributes: string[]
  satoshi: number
  utxo: string
  ranges: Array<{
    start: number
    end: number
    size: number
    name: string
    year_start: string
  }>
}

export interface Transaction {
  txid: string
  version: number
  locktime: number
  vin: Array<{
    txid: string
    vout: number
    prevout: {
      scriptpubkey: string
      scriptpubkey_asm: string
      scriptpubkey_type: string
      scriptpubkey_address: string
      value: number
    }
    scriptsig: string
    scriptsig_asm: string
    is_coinbase: boolean
    sequence: number
  }>
  vout: Array<{
    scriptpubkey: string
    scriptpubkey_asm: string
    scriptpubkey_type: string
    scriptpubkey_address: string
    value: number
  }>
  size: number
  weight: number
  fee: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
}

export interface PNLData {
  realized: number
  unrealized: number
  total: number
  percentage: number
  breakdown: {
    ordinals: number
    runes: number
    bitcoin: number
  }
}

// Enhanced Error Types
export enum WalletErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  USER_REJECTED = 'USER_REJECTED',
  WALLET_LOCKED = 'WALLET_LOCKED',
  WALLET_NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  SECURITY_ERROR = 'SECURITY_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INVALID_NETWORK = 'INVALID_NETWORK',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface WalletError {
  type: WalletErrorType
  message: string
  details?: any
  timestamp: Date
  recoverable: boolean
  suggestions: string[]
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'
  attempts: number
  lastAttempt: Date | null
  sessionId: string | null
  securityLevel: SecurityLevel
  provider: WalletProvider | null
}

export interface LoadingState {
  connecting: boolean
  refreshing: boolean
  validating: boolean
  signing: boolean
  sending: boolean
}

interface WalletContextType {
  // Connection state
  connectionState: ConnectionState
  connected: boolean
  connecting: boolean
  address: string | null
  publicKey: string | null
  
  // Wallet data
  walletData: BitcoinWalletData | null
  
  // Enhanced state management
  loadingState: LoadingState
  error: WalletError | null
  warnings: string[]
  
  // Actions
  connect: (provider?: WalletProvider) => Promise<WalletConnectionResult>
  disconnect: () => Promise<void>
  refreshData: () => Promise<void>
  retry: () => Promise<void>
  clearError: () => void
  
  // Security features
  validateTransaction: (request: TransactionValidationRequest) => Promise<any>
  getSecurityStatus: () => any
  
  // Connection management
  enableAutoReconnect: (enabled: boolean) => void
  isAutoReconnectEnabled: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Enhanced state management
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    attempts: 0,
    lastAttempt: null,
    sessionId: null,
    securityLevel: SecurityLevel.LOW,
    provider: null
  })
  
  const [address, setAddress] = useState<string | null>(null)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [walletData, setWalletData] = useState<BitcoinWalletData | null>(null)
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    connecting: false,
    refreshing: false,
    validating: false,
    signing: false,
    sending: false
  })
  
  const [error, setError] = useState<WalletError | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [isAutoReconnectEnabled, setIsAutoReconnectEnabled] = useState(true)
  
  // Refs for cleanup and timers
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionRef = useRef<string | null>(null)

  // Enhanced connect function with security integration
  const connect = useCallback(async (provider?: WalletProvider): Promise<WalletConnectionResult> => {
    try {
      setLoadingState(prev => ({ ...prev, connecting: true }))
      setError(null)
      setConnectionState(prev => ({ 
        ...prev, 
        status: 'connecting',
        attempts: prev.attempts + 1,
        lastAttempt: new Date()
      }))
      
      // Log connection attempt
      securityLogger.logSecurityEvent(
        SecurityEventType.WALLET_CONNECTION_ATTEMPT,
        { provider, timestamp: new Date().toISOString() },
        LogLevel.INFO
      )
      
      // Use security manager for connection
      const connectionResult = await walletSecurity.secureWalletConnection(provider, 30000)
      
      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Connection failed')
      }
      
      // Store session information
      sessionRef.current = connectionResult.sessionId || null
      
      // Update connection state
      setConnectionState(prev => ({
        ...prev,
        status: 'connected',
        sessionId: sessionRef.current,
        securityLevel: connectionResult.securityLevel,
        provider: connectionResult.walletProvider
      }))
      
      setAddress(connectionResult.address)
      setPublicKey(connectionResult.publicKey || null)
      
      // Handle warnings
      if (connectionResult.warnings.length > 0) {
        setWarnings(connectionResult.warnings)
      }
      
      // Start heartbeat monitoring
      startHeartbeat()
      
      // Load wallet data
      await loadWalletData(connectionResult.address)
      
      securityLogger.logSecurityEvent(
        SecurityEventType.WALLET_CONNECTION_SUCCESS,
        { 
          provider: connectionResult.walletProvider,
          address: connectionResult.address,
          securityLevel: connectionResult.securityLevel
        },
        LogLevel.INFO,
        sessionRef.current || undefined
      )
      
      return connectionResult
      
    } catch (err: any) {
      const walletError = createWalletError(err)
      setError(walletError)
      setConnectionState(prev => ({ ...prev, status: 'error' }))
      
      securityLogger.logSecurityEvent(
        SecurityEventType.WALLET_CONNECTION_FAILED,
        { 
          error: err.message,
          provider,
          errorType: walletError.type
        },
        LogLevel.ERROR
      )
      
      throw walletError
    } finally {
      setLoadingState(prev => ({ ...prev, connecting: false }))
    }
  }, [])

  // Enhanced disconnect function
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      // Clean up timers
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
      
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current)
        heartbeatTimer.current = null
      }
      
      // Disconnect from security manager
      if (sessionRef.current) {
        await walletSecurity.disconnectWallet(sessionRef.current)
        
        securityLogger.logSecurityEvent(
          SecurityEventType.WALLET_DISCONNECTION,
          { sessionId: sessionRef.current },
          LogLevel.INFO,
          sessionRef.current
        )
      }
      
      // Reset state
      setConnectionState({
        status: 'disconnected',
        attempts: 0,
        lastAttempt: null,
        sessionId: null,
        securityLevel: SecurityLevel.LOW,
        provider: null
      })
      
      setAddress(null)
      setPublicKey(null)
      setWalletData(null)
      setError(null)
      setWarnings([])
      sessionRef.current = null
      
    } catch (err) {
      console.error('Error during disconnect:', err)
    }
  }, [])

  // Enhanced refresh data function
  const refreshData = useCallback(async (): Promise<void> => {
    if (connectionState.status !== 'connected' || !address) return
    
    try {
      setLoadingState(prev => ({ ...prev, refreshing: true }))
      setError(null)
      
      // Refresh session activity
      if (sessionRef.current) {
        walletSecurity.refreshSessionActivity(sessionRef.current)
      }
      
      await loadWalletData(address)
      
    } catch (err: any) {
      const walletError = createWalletError(err)
      setError(walletError)
    } finally {
      setLoadingState(prev => ({ ...prev, refreshing: false }))
    }
  }, [connectionState.status, address])
  
  // Retry connection function
  const retry = useCallback(async (): Promise<void> => {
    if (connectionState.status === 'error' || connectionState.status === 'disconnected') {
      await connect(connectionState.provider || undefined)
    }
  }, [connectionState.status, connectionState.provider, connect])
  
  // Clear error function
  const clearError = useCallback((): void => {
    setError(null)
    setWarnings([])
  }, [])
  
  // Transaction validation
  const validateTransaction = useCallback(async (request: TransactionValidationRequest) => {
    if (!sessionRef.current) {
      throw new Error('No active session')
    }
    
    setLoadingState(prev => ({ ...prev, validating: true }))
    
    try {
      const result = await walletSecurity.validateTransaction({
        ...request,
        sessionId: sessionRef.current
      })
      
      return result
    } finally {
      setLoadingState(prev => ({ ...prev, validating: false }))
    }
  }, [])
  
  // Get security status
  const getSecurityStatus = useCallback(() => {
    if (!sessionRef.current) return null
    return walletSecurity.getSessionStatus(sessionRef.current)
  }, [])
  
  // Enable/disable auto-reconnect
  const enableAutoReconnect = useCallback((enabled: boolean): void => {
    setIsAutoReconnectEnabled(enabled)
    
    if (!enabled && reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
  }, [])

  // Helper functions
  const createWalletError = (err: any): WalletError => {
    let errorType = WalletErrorType.UNKNOWN_ERROR
    let recoverable = true
    let suggestions: string[] = []
    
    const message = err.message || 'An unknown error occurred'
    
    // Determine error type and suggestions
    if (message.includes('not installed')) {
      errorType = WalletErrorType.WALLET_NOT_INSTALLED
      recoverable = false
      suggestions = ['Please install a compatible Bitcoin wallet extension']
    } else if (message.includes('rejected') || message.includes('denied')) {
      errorType = WalletErrorType.USER_REJECTED
      suggestions = ['Please approve the connection request in your wallet']
    } else if (message.includes('locked')) {
      errorType = WalletErrorType.WALLET_LOCKED
      suggestions = ['Please unlock your wallet and try again']
    } else if (message.includes('network')) {
      errorType = WalletErrorType.NETWORK_ERROR
      suggestions = ['Check your internet connection', 'Try again in a few moments']
    } else if (message.includes('timeout')) {
      errorType = WalletErrorType.TIMEOUT_ERROR
      suggestions = ['Connection timed out', 'Please try again']
    } else if (message.includes('security') || message.includes('validation')) {
      errorType = WalletErrorType.SECURITY_ERROR
      recoverable = false
      suggestions = ['Security validation failed', 'Please contact support if this persists']
    }
    
    return {
      type: errorType,
      message,
      details: err,
      timestamp: new Date(),
      recoverable,
      suggestions
    }
  }
  
  const loadWalletData = async (walletAddress: string): Promise<void> => {
    // Mock wallet data loading - replace with actual API calls
    const mockData: BitcoinWalletData = {
      address: walletAddress,
      publicKey: publicKey || '',
      balance: 0.00125000,
      ordinals: [],
      runes: [],
      inscriptions: [],
      rareSats: [],
      transactions: [],
      pnl: {
        realized: 0,
        unrealized: 0,
        total: 0,
        percentage: 0,
        breakdown: {
          ordinals: 0,
          runes: 0,
          bitcoin: 0.00125000
        }
      }
    }
    
    setWalletData(mockData)
  }
  
  const startHeartbeat = (): void => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current)
    }
    
    heartbeatTimer.current = setInterval(() => {
      if (sessionRef.current) {
        walletSecurity.refreshSessionActivity(sessionRef.current)
      }
    }, 30000) // 30 seconds
  }
  
  const attemptReconnect = useCallback(async (): Promise<void> => {
    if (!isAutoReconnectEnabled || connectionState.status === 'connected') {
      return
    }
    
    if (connectionState.attempts >= 5) {
      setConnectionState(prev => ({ ...prev, status: 'error' }))
      return
    }
    
    setConnectionState(prev => ({ ...prev, status: 'reconnecting' }))
    
    try {
      await connect(connectionState.provider || undefined)
    } catch (err) {
      // Schedule next retry
      const delay = Math.min(1000 * Math.pow(2, connectionState.attempts), 30000) // Exponential backoff
      
      reconnectTimer.current = setTimeout(() => {
        attemptReconnect()
      }, delay)
    }
  }, [isAutoReconnectEnabled, connectionState, connect])
  
  // Auto-reconnect on connection loss
  useEffect(() => {
    if (connectionState.status === 'error' && isAutoReconnectEnabled) {
      const delay = 2000 // Initial delay
      reconnectTimer.current = setTimeout(() => {
        attemptReconnect()
      }, delay)
    }
    
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }
    }
  }, [connectionState.status, isAutoReconnectEnabled, attemptReconnect])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }
      
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current)
      }
    }
  }, [])
  
  const value: WalletContextType = {
    connectionState,
    connected: connectionState.status === 'connected',
    connecting: loadingState.connecting,
    address,
    publicKey,
    walletData,
    loadingState,
    error,
    warnings,
    connect,
    disconnect,
    refreshData,
    retry,
    clearError,
    validateTransaction,
    getSecurityStatus,
    enableAutoReconnect,
    isAutoReconnectEnabled
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Export useWalletContext as an alias for backwards compatibility
export const useWalletContext = useWallet