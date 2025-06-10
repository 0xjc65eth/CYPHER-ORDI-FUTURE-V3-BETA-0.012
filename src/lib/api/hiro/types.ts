// Hiro API Types - Complete TypeScript definitions

// Base Types
export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  limit: number
  offset: number
  total: number
  results: T[]
}

// Runes Types
export interface RuneEtching {
  id: string
  rune_id: string
  rune_number: number
  name: string
  symbol: string
  divisibility: number
  premine: string
  terms?: {
    amount: string
    cap: string
    height_start?: number
    height_end?: number
    offset_start?: number
    offset_end?: number
  }
  turbo: boolean
  minted: string
  total_mints: number
  burned: string
  total_burns: number
  total_supply: string
  timestamp: number
  genesis_height: number
  genesis_tx_hash: string
}

export interface RuneHolder {
  address: string
  balance: string
  percentage: number
}

export interface RuneActivity {
  tx_id: string
  tx_index: number
  block_height: number
  block_hash: string
  timestamp: number
  operation: 'mint' | 'transfer' | 'burn'
  rune_id: string
  amount: string
  sender?: string
  receiver?: string
  fee: number
}

export interface RuneBalance {
  rune_id: string
  name: string
  balance: string
  symbol: string
  divisibility: number
}

export interface RuneStats {
  total_runes: number
  total_mints: number
  total_burns: number
  total_holders: number
  volume_24h: string
  transactions_24h: number
}

// Ordinals Types
export interface Inscription {
  id: string
  number: number
  address: string
  genesis_address: string
  genesis_block_height: number
  genesis_block_hash: string
  genesis_tx_id: string
  genesis_fee: number
  genesis_timestamp: number
  tx_id: string
  location: string
  output: string
  value: number
  offset: number
  sat_ordinal: string
  sat_rarity: string
  sat_coinbase_height: number
  mime_type: string
  content_type: string
  content_length: number
  timestamp: number
  curse_type?: string | null
  recursive: boolean
  recursion_refs?: string[] | null
  metadata?: Record<string, any>
}

export interface InscriptionTransfer {
  id: string
  number: number
  from: string
  to: string
  tx_id: string
  block_height: number
  timestamp: number
  fee: number
  location: string
  output: string
  offset: number
}

export interface InscriptionStats {
  inscriptions_total: number
  inscriptions_total_24h: number
  blocks_total: number
  blocks_total_24h: number
  fees_total: number
  fees_total_24h: number
  unique_addresses: number
  content_types: {
    type: string
    count: number
    percentage: number
  }[]
}

export interface InscriptionContent {
  inscription_id: string
  content_type: string
  content_length: number
  content: string | Buffer
  encoding?: string
}

// BRC-20 Types
export interface BRC20Token {
  ticker: string
  max_supply: string
  minted_supply: string
  mint_limit?: string
  decimals: number
  deploy_inscription_id: string
  deploy_timestamp: number
  deployer: string
  tx_count: number
  holder_count: number
  self_mint: boolean
}

export interface BRC20Balance {
  ticker: string
  available: string
  transferable: string
  total: string
}

export interface BRC20Activity {
  inscription_id: string
  inscription_number: number
  tx_id: string
  address: string
  to_address?: string
  operation: 'deploy' | 'mint' | 'transfer'
  ticker: string
  amount: string
  timestamp: number
  block_height: number
  valid: boolean
}

export interface BRC20Holder {
  address: string
  balance: string
  percentage: number
  rank: number
}

export interface BRC20Stats {
  total_tokens: number
  total_holders: number
  total_transactions: number
  market_cap: string
  volume_24h: string
  transactions_24h: number
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'inscription' | 'rune' | 'brc20' | 'block' | 'mempool'
  action: 'new' | 'update' | 'confirmed'
  data: any
  timestamp: number
  block_height?: number
}

export interface WebSocketSubscription {
  event: string
  filters?: Record<string, any>
}

// Error Types
export interface HiroAPIError {
  error: string
  message: string
  statusCode: number
  details?: any
}

// Cache Types
export interface CacheConfig {
  ttl: number // Time to live in seconds
  maxSize?: number // Maximum number of items
  strategy?: 'LRU' | 'FIFO' // Cache eviction strategy
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

// API Response Types
export type RunesListResponse = PaginatedResponse<RuneEtching>
export type RuneHoldersResponse = PaginatedResponse<RuneHolder>
export type RuneActivityResponse = PaginatedResponse<RuneActivity>
export type InscriptionsListResponse = PaginatedResponse<Inscription>
export type InscriptionTransfersResponse = PaginatedResponse<InscriptionTransfer>
export type BRC20ListResponse = PaginatedResponse<BRC20Token>
export type BRC20ActivityResponse = PaginatedResponse<BRC20Activity>
export type BRC20HoldersResponse = PaginatedResponse<BRC20Holder>

// Filter Types
export interface RuneFilters {
  name?: string
  symbol?: string
  min_supply?: string
  max_supply?: string
  turbo?: boolean
  sort_by?: 'minted' | 'holders' | 'activity' | 'created'
  order?: 'asc' | 'desc'
}

export interface InscriptionFilters {
  address?: string
  mime_type?: string
  content_type?: string
  recursive?: boolean
  cursed?: boolean
  from_number?: number
  to_number?: number
  from_timestamp?: number
  to_timestamp?: number
  sat_rarity?: string
  sort_by?: 'number' | 'timestamp' | 'fee' | 'size'
  order?: 'asc' | 'desc'
}

export interface BRC20Filters {
  ticker?: string
  deployer?: string
  min_holders?: number
  max_supply?: string
  self_mint?: boolean
  sort_by?: 'deploy' | 'minted' | 'holders' | 'activity'
  order?: 'asc' | 'desc'
}