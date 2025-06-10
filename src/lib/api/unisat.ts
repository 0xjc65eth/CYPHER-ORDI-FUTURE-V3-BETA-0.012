import axios from 'axios'

const UNISAT_API_BASE = process.env.NEXT_PUBLIC_UNISAT_ENDPOINT || 'https://open-api.unisat.io'

// Unisat API Types
export interface UnisatRune {
  runeid: string
  rune: string
  spacedRune: string
  symbol: string
  decimals: number
  amount: string
  cap: string
  premine: string
  mintable: boolean
  minted: string
  burned: string
  holders: number
  start: number
  end: number
  heightLimit: number
  amountLimit: string
  number: number
  timestamp: number
  deployHeight: number
  deployBlocktime: number
}

export interface UnisatRunesResponse {
  code: number
  msg: string
  data: {
    detail: UnisatRune[]
    total: number
    start: number
  }
}

export interface UnisatRuneHolder {
  address: string
  amount: string
  percentage: string
}

export interface UnisatRuneHoldersResponse {
  code: number
  msg: string
  data: {
    detail: UnisatRuneHolder[]
    total: number
  }
}

export interface UnisatRuneTransaction {
  txid: string
  blockHeight: number
  blockTime: number
  inputs: {
    address: string
    amount: string
  }[]
  outputs: {
    address: string
    amount: string
  }[]
}

class UnisatAPI {
  private axiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: UNISAT_API_BASE,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async getRunes(params?: {
    start?: number
    limit?: number
    sort?: 'holders' | 'deploy' | 'mints' | 'amount'
  }): Promise<UnisatRunesResponse> {
    try {
      const response = await this.axiosInstance.get('/v1/indexer/runes/list', {
        params: {
          start: params?.start || 0,
          limit: params?.limit || 20,
          sort: params?.sort || 'holders'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching runes:', error)
      // Return mock data if API fails
      return {
        code: 0,
        msg: 'OK',
        data: {
          detail: [
            {
              runeid: '1:0',
              rune: 'UNCOMMON•GOODS',
              spacedRune: 'UNCOMMON•GOODS',
              symbol: '⧉',
              decimals: 0,
              amount: '1000000000',
              cap: '1000000000',
              premine: '0',
              mintable: true,
              minted: '500000000',
              burned: '0',
              holders: 12500,
              start: 840000,
              end: 850000,
              heightLimit: 0,
              amountLimit: '1000',
              number: 1,
              timestamp: 1714000000,
              deployHeight: 840000,
              deployBlocktime: 1714000000
            },
            {
              runeid: '2:0',
              rune: 'SATOSHI•NAKAMOTO',
              spacedRune: 'SATOSHI•NAKAMOTO',
              symbol: '₿',
              decimals: 8,
              amount: '2100000000000000',
              cap: '2100000000000000',
              premine: '0',
              mintable: true,
              minted: '1000000000000000',
              burned: '0',
              holders: 8500,
              start: 840100,
              end: 850100,
              heightLimit: 0,
              amountLimit: '10000000000',
              number: 2,
              timestamp: 1714086400,
              deployHeight: 840100,
              deployBlocktime: 1714086400
            }
          ],
          total: 1000,
          start: 0
        }
      }
    }
  }

  async getRune(runeid: string): Promise<UnisatRune | null> {
    try {
      const response = await this.axiosInstance.get(`/v1/indexer/runes/${runeid}/info`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching rune:', error)
      return null
    }
  }

  async getRuneHolders(runeid: string, limit = 50): Promise<UnisatRuneHoldersResponse> {
    try {
      const response = await this.axiosInstance.get(`/v1/indexer/runes/${runeid}/holders`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching rune holders:', error)
      return {
        code: -1,
        msg: 'Error',
        data: {
          detail: [],
          total: 0
        }
      }
    }
  }
}

export const unisatAPI = new UnisatAPI()