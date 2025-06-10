import { useQuery } from '@tanstack/react-query'

interface TraitRarity {
  trait: string
  value: string
  count: number
  percentage: number
  score: number
}

interface RarityData {
  inscriptionId?: string
  collection: string
  totalScore: number
  rank: number
  percentile: number
  traits: TraitRarity[]
  distribution: {
    range: string
    count: number
    percentage: number
  }[]
  metadata?: {
    name: string
    description: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
}

interface RarityCalculation {
  method: 'statistical' | 'normalized' | 'weighted'
  baseScore: number
  bonusScore: number
  penaltyScore: number
  finalScore: number
  breakdown: Array<{
    trait: string
    contribution: number
    weight: number
  }>
}

const ORDINALS_RARITY_API = 'https://api.ordinalsrarity.com/v1'
const RARITY_SNIPER_API = 'https://api.raritysniper.com/ordinals'

async function calculateRarity(
  inscriptionIdOrCollection: string,
  method: 'statistical' | 'normalized' | 'weighted' = 'statistical'
): Promise<RarityData> {
  try {
    // In production, this would call actual rarity calculation APIs
    // For now, return mock calculated data
    
    const mockTraits: TraitRarity[] = [
      { trait: 'Background', value: 'Gold', count: 123, percentage: 1.23, score: 81.3 },
      { trait: 'Body', value: 'Robot', count: 89, percentage: 0.89, score: 112.4 },
      { trait: 'Eyes', value: 'Laser', count: 45, percentage: 0.45, score: 222.2 },
      { trait: 'Mouth', value: 'Smile', count: 1234, percentage: 12.34, score: 8.1 },
      { trait: 'Hat', value: 'Crown', count: 167, percentage: 1.67, score: 59.9 },
      { trait: 'Accessory', value: 'Chain', count: 456, percentage: 4.56, score: 21.9 }
    ]

    const totalScore = mockTraits.reduce((sum, trait) => sum + trait.score, 0)

    return {
      inscriptionId: inscriptionIdOrCollection.includes('#') ? inscriptionIdOrCollection : undefined,
      collection: 'NodeMonkes',
      totalScore,
      rank: 143,
      percentile: 94.3,
      traits: mockTraits,
      distribution: [
        { range: '0-50', count: 2341, percentage: 23.4 },
        { range: '50-100', count: 3456, percentage: 34.6 },
        { range: '100-150', count: 2123, percentage: 21.2 },
        { range: '150-200', count: 1234, percentage: 12.3 },
        { range: '200-250', count: 567, percentage: 5.7 },
        { range: '250+', count: 279, percentage: 2.8 }
      ],
      metadata: {
        name: 'NodeMonke #1234',
        description: 'A unique NodeMonke with rare traits',
        attributes: mockTraits.map(t => ({
          trait_type: t.trait,
          value: t.value
        }))
      }
    }
  } catch (error) {
    console.error('Error calculating rarity:', error)
    throw error
  }
}

async function fetchRarityTrends(collection: string, timeframe: '24h' | '7d' | '30d' | 'all') {
  try {
    // Mock historical rarity trends
    const dataPoints = timeframe === '24h' ? 24 : 
                      timeframe === '7d' ? 7 : 
                      timeframe === '30d' ? 30 : 90

    return Array.from({ length: dataPoints }, (_, i) => ({
      timestamp: Date.now() - (dataPoints - i) * (timeframe === '24h' ? 3600000 : 86400000),
      avgRarity: 87.3 + Math.random() * 10 - 5,
      topRarity: 289.5 + Math.random() * 20 - 10,
      floorRarity: 23.4 + Math.random() * 5 - 2.5,
      volume: Math.floor(Math.random() * 100) + 50
    }))
  } catch (error) {
    console.error('Error fetching rarity trends:', error)
    throw error
  }
}

async function fetchTraitCorrelations(collection: string) {
  try {
    // Mock trait correlation matrix
    const traits = ['Background', 'Body', 'Eyes', 'Mouth', 'Hat', 'Accessory']
    const correlations: Array<{
      trait1: string
      trait2: string
      correlation: number
      significance: number
    }> = []

    traits.forEach((trait1, i) => {
      traits.forEach((trait2, j) => {
        if (i <= j) {
          correlations.push({
            trait1,
            trait2,
            correlation: i === j ? 1 : (Math.random() * 2 - 1),
            significance: i === j ? 1 : Math.random()
          })
        }
      })
    })

    return correlations
  } catch (error) {
    console.error('Error fetching trait correlations:', error)
    throw error
  }
}

export function useRarityData(inscriptionIdOrCollection: string) {
  return useQuery({
    queryKey: ['ordinals', 'rarity', inscriptionIdOrCollection],
    queryFn: () => calculateRarity(inscriptionIdOrCollection),
    enabled: !!inscriptionIdOrCollection,
    staleTime: 300000 // Cache for 5 minutes
  })
}

export function useRarityCalculation(
  inscriptionId: string,
  method: 'statistical' | 'normalized' | 'weighted'
) {
  return useQuery({
    queryKey: ['ordinals', 'rarity-calculation', inscriptionId, method],
    queryFn: async (): Promise<RarityCalculation> => {
      // Mock different calculation methods
      const baseScore = 100 + Math.random() * 100
      const bonusScore = Math.random() * 50
      const penaltyScore = Math.random() * 10
      
      return {
        method,
        baseScore,
        bonusScore,
        penaltyScore,
        finalScore: baseScore + bonusScore - penaltyScore,
        breakdown: [
          { trait: 'Background', contribution: 25.5, weight: 1.2 },
          { trait: 'Body', contribution: 35.2, weight: 1.5 },
          { trait: 'Eyes', contribution: 48.7, weight: 2.1 },
          { trait: 'Mouth', contribution: 12.3, weight: 0.8 },
          { trait: 'Hat', contribution: 28.9, weight: 1.3 },
          { trait: 'Accessory', contribution: 18.4, weight: 1.0 }
        ]
      }
    },
    enabled: !!inscriptionId,
    staleTime: 300000
  })
}

export function useRarityTrends(collection: string, timeframe: '24h' | '7d' | '30d' | 'all') {
  return useQuery({
    queryKey: ['ordinals', 'rarity-trends', collection, timeframe],
    queryFn: () => fetchRarityTrends(collection, timeframe),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 50000
  })
}

export function useTraitCorrelations(collection: string) {
  return useQuery({
    queryKey: ['ordinals', 'trait-correlations', collection],
    queryFn: () => fetchTraitCorrelations(collection),
    staleTime: 3600000 // Cache for 1 hour
  })
}

// Batch rarity calculation for multiple inscriptions
export function useBatchRarity(inscriptionIds: string[]) {
  return useQuery({
    queryKey: ['ordinals', 'batch-rarity', inscriptionIds],
    queryFn: async () => {
      // In production, this would batch calculate rarities
      return Promise.all(inscriptionIds.map(id => calculateRarity(id)))
    },
    enabled: inscriptionIds.length > 0,
    staleTime: 300000
  })
}