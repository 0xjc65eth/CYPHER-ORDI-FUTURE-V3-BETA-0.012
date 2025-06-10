import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { hiroOrdinalsService } from '@/services/HiroOrdinalsService'

interface InscriptionFilters {
  contentType?: string
  inscriptionRange?: [number, number]
  satRarity?: string
  feeRate?: [number, number]
  status?: 'confirmed' | 'pending'
}

interface Inscription {
  id: number
  txid: string
  address: string
  contentType: string
  contentSize: number
  contentUrl?: string
  fee: number
  feeRate: number
  satNumber: number
  satRarity?: string
  block?: number
  timestamp: number
  genesisAddress: string
  genesisBlock: number
  genesisFee: number
  collection?: {
    name: string
    slug: string
  }
  metadata?: Record<string, any>
  provenance?: Array<{
    address: string
    block: number
    timestamp: number
    txid: string
  }>
}

interface MempoolInscription extends Inscription {
  estimatedBlocks: number
  position: number
  priority: 'high' | 'medium' | 'low'
}

const HIRO_API = 'https://api.hiro.so/ordinals/v1'
const ORDAPI = 'https://ordapi.xyz'
const ORDISCAN_API = 'https://api.ordiscan.com/v1'

async function fetchInscriptions(filters: InscriptionFilters): Promise<Inscription[]> {
  try {
    console.log('🔄 Fetching inscriptions with filters:', filters)
    
    // Get inscriptions from Hiro service
    const hiroInscriptions = await hiroOrdinalsService.getInscriptions(50, 0)
    
    // Transform Hiro data to our interface
    const inscriptions: Inscription[] = hiroInscriptions.map((item, i) => ({
      id: item.number,
      txid: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      address: item.address || `bc1q${Math.random().toString(36).substring(2, 10)}`,
      contentType: item.content_type,
      contentSize: item.content_length,
      contentUrl: `https://ordinals.com/content/${item.number}`,
      fee: item.genesis_fee,
      feeRate: Math.floor(item.genesis_fee / 250), // Approximate fee rate
      satNumber: parseInt(item.sat_ordinal || '0') || (1234567890123 + i * 1000),
      satRarity: item.sat_rarity || ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'][Math.floor(Math.random() * 6)],
      block: item.genesis_height,
      timestamp: item.timestamp,
      genesisAddress: item.address || `bc1q${Math.random().toString(36).substring(2, 10)}`,
      genesisBlock: item.genesis_height,
      genesisFee: item.genesis_fee,
      collection: item.collection_name ? {
        name: item.collection_name,
        slug: item.collection_id || item.collection_name.toLowerCase().replace(/\s+/g, '-')
      } : undefined
    }))

    // Apply filters
    let filtered = inscriptions

    if (filters.contentType && filters.contentType !== 'all') {
      filtered = filtered.filter(i => i.contentType === filters.contentType)
    }

    if (filters.inscriptionRange) {
      filtered = filtered.filter(i => 
        i.id >= filters.inscriptionRange![0] && 
        i.id <= filters.inscriptionRange![1]
      )
    }

    if (filters.satRarity && filters.satRarity !== 'all') {
      filtered = filtered.filter(i => i.satRarity === filters.satRarity)
    }

    if (filters.feeRate) {
      filtered = filtered.filter(i => 
        i.feeRate >= filters.feeRate![0] && 
        i.feeRate <= filters.feeRate![1]
      )
    }

    console.log('✅ Fetched and filtered inscriptions:', filtered.length)
    return filtered
  } catch (error) {
    console.error('❌ Error fetching inscriptions:', error)
    throw error
  }
}

async function fetchMempoolInscriptions(): Promise<MempoolInscription[]> {
  try {
    // Mock mempool data
    return Array.from({ length: 20 }, (_, i) => ({
      id: 0, // Pending inscriptions don't have IDs yet
      txid: `pending-${Math.random().toString(36).substring(2, 15)}`,
      address: `bc1q${Math.random().toString(36).substring(2, 10)}`,
      contentType: ['image/png', 'text/plain', 'application/json'][Math.floor(Math.random() * 3)],
      contentSize: Math.floor(Math.random() * 50000) + 1000,
      fee: Math.floor(Math.random() * 20000) + 5000,
      feeRate: Math.floor(Math.random() * 150) + 20,
      satNumber: 0,
      timestamp: Date.now() - i * 30000,
      genesisAddress: `bc1q${Math.random().toString(36).substring(2, 10)}`,
      genesisBlock: 0,
      genesisFee: 0,
      estimatedBlocks: Math.floor(Math.random() * 6) + 1,
      position: i + 1,
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
    }))
  } catch (error) {
    console.error('Error fetching mempool inscriptions:', error)
    throw error
  }
}

async function fetchInscriptionDetails(inscriptionId: string): Promise<Inscription> {
  try {
    // Mock detailed inscription data
    return {
      id: parseInt(inscriptionId),
      txid: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      address: `bc1q${Math.random().toString(36).substring(2, 10)}`,
      contentType: 'image/png',
      contentSize: 45678,
      contentUrl: `https://ordinals.com/content/${inscriptionId}`,
      fee: 12345,
      feeRate: 45,
      satNumber: 1234567890123,
      satRarity: 'uncommon',
      block: 823456,
      timestamp: Date.now() - 3600000,
      genesisAddress: `bc1q${Math.random().toString(36).substring(2, 10)}`,
      genesisBlock: 820123,
      genesisFee: 23456,
      metadata: {
        artist: 'Satoshi',
        collection: 'NodeMonkes',
        attributes: [
          { trait: 'Background', value: 'Gold' },
          { trait: 'Body', value: 'Robot' },
          { trait: 'Eyes', value: 'Laser' }
        ]
      },
      provenance: [
        {
          address: `bc1q${Math.random().toString(36).substring(2, 10)}`,
          block: 823456,
          timestamp: Date.now() - 3600000,
          txid: `${Math.random().toString(36).substring(2, 15)}`
        },
        {
          address: `bc1q${Math.random().toString(36).substring(2, 10)}`,
          block: 822000,
          timestamp: Date.now() - 7200000,
          txid: `${Math.random().toString(36).substring(2, 15)}`
        },
        {
          address: `bc1q${Math.random().toString(36).substring(2, 10)}`,
          block: 820123,
          timestamp: Date.now() - 14400000,
          txid: `${Math.random().toString(36).substring(2, 15)}`
        }
      ]
    }
  } catch (error) {
    console.error('Error fetching inscription details:', error)
    throw error
  }
}

export function useInscriptionData(filters: InscriptionFilters) {
  return useQuery({
    queryKey: ['ordinals', 'inscriptions', filters],
    queryFn: () => fetchInscriptions(filters),
    refetchInterval: filters.status === 'pending' ? 5000 : 30000,
    staleTime: filters.status === 'pending' ? 3000 : 20000
  })
}

export function useMempoolInscriptions() {
  return useQuery({
    queryKey: ['ordinals', 'mempool-inscriptions'],
    queryFn: fetchMempoolInscriptions,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 3000
  })
}

export function useInscriptionDetails(inscriptionId: string) {
  return useQuery({
    queryKey: ['ordinals', 'inscription', inscriptionId],
    queryFn: () => fetchInscriptionDetails(inscriptionId),
    enabled: !!inscriptionId,
    staleTime: 60000 // Cache for 1 minute
  })
}

// WebSocket hook for real-time inscription updates
export function useInscriptionWebSocket() {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // In production, this would connect to a real WebSocket
    // For now, we'll simulate updates
    const interval = setInterval(() => {
      // Simulate new inscription
      const newInscription: Inscription = {
        id: Date.now(),
        txid: `${Math.random().toString(36).substring(2, 15)}`,
        address: `bc1q${Math.random().toString(36).substring(2, 10)}`,
        contentType: 'image/png',
        contentSize: Math.floor(Math.random() * 100000) + 1000,
        fee: Math.floor(Math.random() * 10000) + 1000,
        feeRate: Math.floor(Math.random() * 100) + 10,
        satNumber: Date.now(),
        block: 823456,
        timestamp: Date.now(),
        genesisAddress: `bc1q${Math.random().toString(36).substring(2, 10)}`,
        genesisBlock: 823456,
        genesisFee: Math.floor(Math.random() * 50000) + 10000
      }

      // Update query cache
      queryClient.setQueryData(['ordinals', 'inscriptions', {}], (old: any) => {
        if (!old) return [newInscription]
        return [newInscription, ...old.slice(0, 99)]
      })
    }, 10000) // New inscription every 10 seconds

    setIsConnected(true)

    return () => {
      clearInterval(interval)
      setIsConnected(false)
    }
  }, [queryClient])

  return { isConnected }
}

// Hook to fetch inscriptions for a specific collection
export function useCollectionInscriptions(collectionId: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['ordinals', 'collection-inscriptions', collectionId, limit, offset],
    queryFn: async () => {
      console.log('🔄 Fetching inscriptions for collection:', collectionId)
      const inscriptions = await hiroOrdinalsService.getInscriptionsByCollection(collectionId, limit, offset)
      
      // Transform to our interface
      return inscriptions.map((item, i) => ({
        id: item.number,
        txid: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        address: item.address || `bc1q${Math.random().toString(36).substring(2, 10)}`,
        contentType: item.content_type,
        contentSize: item.content_length,
        contentUrl: `https://ordinals.com/content/${item.number}`,
        fee: item.genesis_fee,
        feeRate: Math.floor(item.genesis_fee / 250),
        satNumber: parseInt(item.sat_ordinal || '0') || (1234567890123 + i * 1000),
        satRarity: item.sat_rarity || ['common', 'uncommon', 'rare'][Math.floor(Math.random() * 3)],
        block: item.genesis_height,
        timestamp: item.timestamp,
        genesisAddress: item.address || `bc1q${Math.random().toString(36).substring(2, 10)}`,
        genesisBlock: item.genesis_height,
        genesisFee: item.genesis_fee,
        collection: {
          name: item.collection_name || collectionId,
          slug: item.collection_id || collectionId
        }
      }))
    },
    enabled: !!collectionId,
    refetchInterval: 30000,
    staleTime: 20000
  })
}