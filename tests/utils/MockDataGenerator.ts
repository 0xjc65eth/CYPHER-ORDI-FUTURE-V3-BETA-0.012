/**
 * Mock Data Generator for Testing
 * Provides realistic test data for all system components
 */

// Using built-in random generators instead of faker for simplicity

export interface MockBitcoinData {
  price: number
  change24h: number
  volume: number
  marketCap: number
  dominance: number
  timestamp: number
}

export interface MockWalletData {
  address: string
  balance: number
  transactions: MockTransaction[]
  ordinals: MockOrdinal[]
  runes: MockRune[]
}

export interface MockTransaction {
  txid: string
  amount: number
  fee: number
  confirmations: number
  timestamp: number
  type: 'send' | 'receive'
}

export interface MockOrdinal {
  id: string
  name: string
  collection: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  price: number
  image: string
}

export interface MockRune {
  id: string
  name: string
  symbol: string
  amount: number
  price: number
  marketCap: number
}

export interface MockMarketData {
  bitcoin: MockBitcoinData
  altcoins: Array<{
    symbol: string
    price: number
    change24h: number
    volume: number
  }>
  sentiment: {
    fearGreed: number
    trendingHashtags: string[]
    socialVolume: number
  }
}

export interface MockTradingData {
  opportunities: Array<{
    id: string
    type: 'arbitrage' | 'momentum' | 'reversal'
    symbol: string
    confidence: number
    potential: number
    risk: number
  }>
  performance: {
    totalPnL: number
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
  }
}

export class MockDataGenerator {
  private static instance: MockDataGenerator
  private seedData: Map<string, any> = new Map()

  static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator()
    }
    return MockDataGenerator.instance
  }

  // Bitcoin Price Data
  generateBitcoinPrice(options?: { basePrice?: number; volatility?: number }): MockBitcoinData {
    const basePrice = options?.basePrice || 43000
    const volatility = options?.volatility || 0.05
    
    const price = basePrice + (Math.random() - 0.5) * basePrice * volatility
    const change24h = (Math.random() - 0.5) * 10 // -5% to +5%
    
    return {
      price: Math.round(price * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      volume: Math.round(Math.random() * 1000000000),
      marketCap: Math.round(price * 19700000), // ~19.7M BTC supply
      dominance: 45 + Math.random() * 10, // 45-55%
      timestamp: Date.now()
    }
  }

  // Historical Price Data
  generatePriceHistory(days: number = 30): Array<{ timestamp: number; price: number; volume: number }> {
    const history: Array<{ timestamp: number; price: number; volume: number }> = []
    const basePrice = 43000
    let currentPrice = basePrice
    
    for (let i = days; i >= 0; i--) {
      const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000)
      const change = (Math.random() - 0.5) * 0.05 // -2.5% to +2.5% daily
      currentPrice *= (1 + change)
      
      history.push({
        timestamp,
        price: Math.round(currentPrice * 100) / 100,
        volume: Math.round(Math.random() * 500000000)
      })
    }
    
    return history
  }

  // Wallet Data
  generateWalletData(options?: { 
    hasOrdinals?: boolean
    hasRunes?: boolean
    transactionCount?: number
  }): MockWalletData {
    const address = this.generateBitcoinAddress()
    const balance = Math.random() * 10 // 0-10 BTC
    
    const transactions = this.generateTransactions(
      options?.transactionCount || 10
    )
    
    const ordinals = options?.hasOrdinals ? this.generateOrdinals(5) : []
    const runes = options?.hasRunes ? this.generateRunes(3) : []
    
    return {
      address,
      balance: Math.round(balance * 100000000) / 100000000, // 8 decimals
      transactions,
      ordinals,
      runes
    }
  }

  // Bitcoin Address
  generateBitcoinAddress(): string {
    const types = ['bc1', '3', '1']
    const type = types[Math.floor(Math.random() * types.length)]
    
    if (type === 'bc1') {
      return 'bc1' + this.generateRandomString(39).toLowerCase()
    } else {
      return type + this.generateRandomString(33)
    }
  }

  // Generate random string
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generate random hex string
  private generateHexString(length: number): string {
    const chars = '0123456789abcdef'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Generate UUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Generate product name
  private generateProductName(): string {
    const adjectives = ['Rare', 'Epic', 'Legendary', 'Uncommon', 'Ancient', 'Mystical']
    const nouns = ['Satoshi', 'Coin', 'Block', 'Hash', 'Token', 'Gem']
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    return `${adj} ${noun} #${Math.floor(Math.random() * 10000)}`
  }

  // Transactions
  generateTransactions(count: number): MockTransaction[] {
    const transactions: MockTransaction[] = []
    
    for (let i = 0; i < count; i++) {
      transactions.push({
        txid: this.generateHexString(64),
        amount: Math.random() * 2,
        fee: Math.random() * 0.001,
        confirmations: Math.floor(Math.random() * 100),
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        type: Math.random() > 0.5 ? 'send' : 'receive'
      })
    }
    
    return transactions.sort((a, b) => b.timestamp - a.timestamp)
  }

  // Ordinals
  generateOrdinals(count: number): MockOrdinal[] {
    const ordinals: MockOrdinal[] = []
    const collections = ['Bitcoin Punks', 'Ordinal Rocks', 'Inscribed Pepes', 'BTC Monkeys']
    const rarities: MockOrdinal['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    
    for (let i = 0; i < count; i++) {
      ordinals.push({
        id: Math.floor(Math.random() * 1000000).toString(),
        name: this.generateProductName(),
        collection: collections[Math.floor(Math.random() * collections.length)],
        rarity: rarities[Math.floor(Math.random() * rarities.length)],
        price: Math.random() * 0.1, // 0-0.1 BTC
        image: `https://picsum.photos/200/200?random=${i}`
      })
    }
    
    return ordinals
  }

  // Runes
  generateRunes(count: number): MockRune[] {
    const runes: MockRune[] = []
    const names = ['UNCOMMON•GOODS', 'RARE•SATS', 'EPIC•RUNES', 'LEGENDARY•COINS']
    
    for (let i = 0; i < count; i++) {
      const amount = Math.floor(Math.random() * 1000000)
      const price = Math.random() * 0.00001
      
      runes.push({
        id: Math.floor(Math.random() * 100000000).toString(),
        name: names[Math.floor(Math.random() * names.length)],
        symbol: this.generateRandomString(4).toUpperCase(),
        amount,
        price,
        marketCap: amount * price
      })
    }
    
    return runes
  }

  // Market Data
  generateMarketData(): MockMarketData {
    const bitcoin = this.generateBitcoinPrice()
    
    const altcoins = [
      'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'AVAX', 'MATIC', 'UNI'
    ].map(symbol => ({
      symbol,
      price: Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 20,
      volume: Math.random() * 100000000
    }))
    
    const sentiment = {
      fearGreed: Math.floor(Math.random() * 100),
      trendingHashtags: [
        '#Bitcoin', '#BTC', '#Crypto', '#Ordinals', '#Runes', '#HODL'
      ],
      socialVolume: Math.floor(Math.random() * 10000)
    }
    
    return {
      bitcoin,
      altcoins,
      sentiment
    }
  }

  // Trading Data
  generateTradingData(): MockTradingData {
    const opportunities = []
    const types: MockTradingData['opportunities'][0]['type'][] = ['arbitrage', 'momentum', 'reversal']
    
    for (let i = 0; i < 5; i++) {
      opportunities.push({
        id: this.generateUUID(),
        type: types[Math.floor(Math.random() * types.length)],
        symbol: 'BTC-USD',
        confidence: Math.random() * 100,
        potential: Math.random() * 20,
        risk: Math.random() * 10
      })
    }
    
    const performance = {
      totalPnL: (Math.random() - 0.5) * 10000,
      winRate: 50 + Math.random() * 40, // 50-90%
      sharpeRatio: Math.random() * 3,
      maxDrawdown: Math.random() * 20
    }
    
    return {
      opportunities,
      performance
    }
  }

  // Mining Data
  generateMiningData() {
    return {
      hashRate: Math.random() * 500 + 300, // 300-800 EH/s
      difficulty: Math.random() * 60e12 + 50e12,
      blockTime: Math.random() * 5 + 8, // 8-13 minutes
      mempoolSize: Math.floor(Math.random() * 100000),
      fees: {
        slow: Math.floor(Math.random() * 10 + 5),
        medium: Math.floor(Math.random() * 20 + 15),
        fast: Math.floor(Math.random() * 50 + 35)
      }
    }
  }

  // Voice AI Response Time Data
  generateVoiceResponseData() {
    return {
      responseTime: Math.random() * 2000 + 500, // 500-2500ms
      accuracy: Math.random() * 20 + 80, // 80-100%
      confidence: Math.random() * 30 + 70, // 70-100%
      processingSteps: [
        { step: 'Voice Recognition', time: Math.random() * 300 + 100 },
        { step: 'Intent Analysis', time: Math.random() * 200 + 50 },
        { step: 'Data Processing', time: Math.random() * 500 + 200 },
        { step: 'Response Generation', time: Math.random() * 300 + 100 }
      ]
    }
  }

  // Performance Metrics
  generatePerformanceMetrics() {
    return {
      apiResponseTime: Math.random() * 1000 + 200,
      memoryUsage: Math.random() * 80 + 20, // 20-100%
      cpuUsage: Math.random() * 60 + 10, // 10-70%
      errorRate: Math.random() * 2, // 0-2%
      uptime: Math.random() * 5 + 95, // 95-100%
      throughput: Math.floor(Math.random() * 1000 + 100) // requests/sec
    }
  }

  // Generate test data with seed for reproducibility
  generateSeededData(seed: string): any {
    if (this.seedData.has(seed)) {
      return this.seedData.get(seed)
    }
    
    // Set random seed for reproducible tests
    // Note: This is a simplified approach - in production you might want a more robust seeding mechanism
    
    const data = {
      bitcoin: this.generateBitcoinPrice(),
      wallet: this.generateWalletData({ hasOrdinals: true, hasRunes: true }),
      market: this.generateMarketData(),
      trading: this.generateTradingData(),
      mining: this.generateMiningData(),
      voice: this.generateVoiceResponseData(),
      performance: this.generatePerformanceMetrics()
    }
    
    this.seedData.set(seed, data)
    return data
  }

  // Helper function to generate hash from string
  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Clear cached data
  clearCache(): void {
    this.seedData.clear()
  }
}

export default MockDataGenerator.getInstance()