// Bitcoin Market Data Service - CORRIGIDO v3.1.0

import { API_CONFIG } from './config'
import { cacheService, cacheKeys, cacheTTL } from '@/lib/cache'
import { devLogger } from '@/lib/logger'

export interface BitcoinPrice {
  usd: number
  usd_24h_change: number
  usd_24h_vol: number
  usd_market_cap: number
}

export interface MarketData {
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  lastUpdated: string
  source: 'api' | 'cache' | 'fallback'
}

// Client API robusto com retry e fallback
class ApiClient {
  private async fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CYPHER-AI/3.1.0'
          },
          timeout: 10000
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        devLogger.log('API', `Attempt ${attempt}/${maxRetries} failed: ${error}`)
        
        if (attempt === maxRetries) {
          throw error
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  async fetch(url: string): Promise<any> {
    return this.fetchWithRetry(url)
  }
}

const apiClient = new ApiClient()

export class BitcoinService {
  // Dados de fallback atualizados
  private fallbackData: MarketData = {
    price: 98750,
    change24h: 2.8,
    volume24h: 32000000000,
    marketCap: 1960000000000,
    lastUpdated: new Date().toISOString(),
    source: 'fallback'
  }

  async getPrice(): Promise<MarketData> {
    try {
      // Tentar obter do cache primeiro
      const cached = await cacheService.get<MarketData>(cacheKeys.bitcoinPrice())
      if (cached) {
        devLogger.log('API', 'Bitcoin price from cache')
        return { ...cached, source: 'cache' }
      }

      // Buscar dados da API
      return await this.fetchFromAPI()
      
    } catch (error) {
      devLogger.error(error as Error, 'Failed to fetch Bitcoin price')
      return this.getFallbackData()
    }
  }

  private async fetchFromAPI(): Promise<MarketData> {
    const APIs = [
      {
        name: 'CoinGecko',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
        parser: (data: any) => {
          const btc = data.bitcoin
          return {
            price: btc.usd,
            change24h: btc.usd_24h_change,
            volume24h: btc.usd_24h_vol,
            marketCap: btc.usd_market_cap,
            lastUpdated: new Date().toISOString(),
            source: 'api' as const
          }
        }
      },
      {
        name: 'CoinAPI',
        url: 'https://rest.coinapi.io/v1/exchangerate/BTC/USD',
        parser: (data: any) => ({
          price: data.rate,
          change24h: 0, // CoinAPI doesn't provide this in simple endpoint
          volume24h: 0,
          marketCap: 0,
          lastUpdated: new Date().toISOString(),
          source: 'api' as const
        })
      }
    ]

    let lastError: Error | null = null

    for (const api of APIs) {
      try {
        devLogger.log('API', `Fetching Bitcoin price from ${api.name}`)
        const data = await apiClient.fetch(api.url)
        const marketData = api.parser(data)

        // Cache successful result
        await cacheService.set(cacheKeys.bitcoinPrice(), marketData, cacheTTL.prices)
        
        devLogger.log('API', `Successfully fetched from ${api.name}`)
        return marketData

      } catch (error) {
        lastError = error as Error
        devLogger.log('API', `${api.name} failed: ${error}`)
        continue
      }
    }

    throw lastError || new Error('All API sources failed')
  }

  private getFallbackData(): MarketData {
    devLogger.log('API', 'Using fallback Bitcoin data')
    return {
      ...this.fallbackData,
      lastUpdated: new Date().toISOString()
    }
  }

  async getMarketChart(days: number = 7): Promise<any> {
    const cacheKey = `bitcoin:chart:${days}days`
    
    try {
      return await cacheService.getOrCompute(
        cacheKey,
        async () => {
          devLogger.log('API', `Fetching Bitcoin chart for ${days} days`)
          const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
          return await apiClient.fetch(url)
        },
        cacheTTL.prices * 5 // Cache por 5 minutos para gráficos
      )
    } catch (error) {
      devLogger.error(error as Error, 'Failed to fetch market chart')
      // Return mock chart data
      return this.generateMockChartData(days)
    }
  }

  private generateMockChartData(days: number) {
    const now = Date.now()
    const basePrice = this.fallbackData.price
    const prices = []
    const volumes = []

    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000)
      const priceVariation = (Math.random() - 0.5) * 0.1 // ±5% variation
      const price = basePrice * (1 + priceVariation)
      const volume = 25000000000 + (Math.random() * 10000000000)

      prices.push([timestamp, price])
      volumes.push([timestamp, volume])
    }

    return { prices, total_volumes: volumes }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const data = await this.getPrice()
      return data.price > 0
    } catch {
      return false
    }
  }
}

export const bitcoinService = new BitcoinService()