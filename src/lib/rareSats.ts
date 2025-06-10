// Rare Satoshi Detection System
export interface SatCategory {
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
}

export interface RareSat {
  satNumber: bigint
  blockHeight: number
  categories: SatCategory[]
  totalRarity: number
  isRare: boolean
}

// Bitcoin Constants
const SUBSIDY_HALVING_INTERVAL = 210000
const DIFFCHANGE_INTERVAL = 2016
const BLOCKS_PER_YEAR = 52560 // approximately

// Satoshi ranges for different categories
const SAT_RANGES = {
  genesis: { start: 0n, end: 50n * 100000000n }, // First block
  pizza: { start: 1929300000000n, end: 1968600000000n }, // Pizza transaction block range
  vintage: { start: 0n, end: 1000000n * 100000000n }, // First million BTC
  uncommon: (height: number) => height % 10 === 9, // Last sat of each block ending in 9
  rare: (height: number) => height % 100 === 99, // Last sat of each block ending in 99
  epic: (height: number) => height % 1000 === 999, // Last sat of each block ending in 999
  legendary: (height: number) => height % 10000 === 9999, // Last sat of each block ending in 9999
}

export function getBlockReward(height: number): bigint {
  const halvings = Math.floor(height / SUBSIDY_HALVING_INTERVAL)
  const subsidy = 50n * 100000000n // 50 BTC in sats
  return subsidy >> BigInt(halvings)
}

export function getSatNumberFromBlockHeight(height: number, offset: bigint = 0n): bigint {
  let totalSats = 0n
  
  for (let h = 0; h < height; h++) {
    totalSats += getBlockReward(h)
  }
  
  return totalSats + offset
}

export function analyzeSat(satNumber: bigint, blockHeight: number): RareSat {
  const categories: SatCategory[] = []
  let totalRarity = 0

  // Genesis Sat
  if (satNumber >= SAT_RANGES.genesis.start && satNumber < SAT_RANGES.genesis.end) {
    categories.push({
      name: 'Genesis',
      description: 'From the first Bitcoin block',
      icon: '🌟',
      rarity: 'mythic'
    })
    totalRarity += 100
  }

  // Pizza Sat
  if (satNumber >= SAT_RANGES.pizza.start && satNumber < SAT_RANGES.pizza.end) {
    categories.push({
      name: 'Pizza',
      description: 'From the famous pizza transaction era',
      icon: '🍕',
      rarity: 'legendary'
    })
    totalRarity += 80
  }

  // Vintage Sat
  if (satNumber < SAT_RANGES.vintage.end) {
    categories.push({
      name: 'Vintage',
      description: 'From the first million Bitcoin',
      icon: '📜',
      rarity: 'epic'
    })
    totalRarity += 60
  }

  // Halving Sat
  if (blockHeight % SUBSIDY_HALVING_INTERVAL === 0 && blockHeight > 0) {
    categories.push({
      name: 'Halving',
      description: 'First sat after a halving event',
      icon: '✂️',
      rarity: 'legendary'
    })
    totalRarity += 90
  }

  // Difficulty Adjustment Sat
  if (blockHeight % DIFFCHANGE_INTERVAL === 0) {
    categories.push({
      name: 'Difficulty',
      description: 'From a difficulty adjustment block',
      icon: '⚡',
      rarity: 'rare'
    })
    totalRarity += 40
  }

  // Block Pattern Sats
  if (SAT_RANGES.legendary(blockHeight)) {
    categories.push({
      name: 'Legendary Block',
      description: 'From a block ending in 9999',
      icon: '👑',
      rarity: 'legendary'
    })
    totalRarity += 70
  } else if (SAT_RANGES.epic(blockHeight)) {
    categories.push({
      name: 'Epic Block',
      description: 'From a block ending in 999',
      icon: '💎',
      rarity: 'epic'
    })
    totalRarity += 50
  } else if (SAT_RANGES.rare(blockHeight)) {
    categories.push({
      name: 'Rare Block',
      description: 'From a block ending in 99',
      icon: '💠',
      rarity: 'rare'
    })
    totalRarity += 30
  } else if (SAT_RANGES.uncommon(blockHeight)) {
    categories.push({
      name: 'Uncommon Block',
      description: 'From a block ending in 9',
      icon: '🔷',
      rarity: 'uncommon'
    })
    totalRarity += 10
  }

  // Palindrome Sat
  const satStr = satNumber.toString()
  if (satStr === satStr.split('').reverse().join('') && satStr.length > 6) {
    categories.push({
      name: 'Palindrome',
      description: 'Satoshi number is a palindrome',
      icon: '🔄',
      rarity: 'epic'
    })
    totalRarity += 65
  }

  // Round Number Sat
  if (satNumber % 1000000000n === 0n) {
    categories.push({
      name: 'Round',
      description: 'Perfect billion satoshi',
      icon: '🎯',
      rarity: 'rare'
    })
    totalRarity += 45
  }

  // Year Sat (one sat per year)
  const yearsSinceLaunch = Math.floor(blockHeight / BLOCKS_PER_YEAR)
  if (blockHeight % BLOCKS_PER_YEAR === 0) {
    categories.push({
      name: `Year ${yearsSinceLaunch}`,
      description: 'First sat of a Bitcoin year',
      icon: '📅',
      rarity: 'epic'
    })
    totalRarity += 55
  }

  // Alpha Sat (first sat of each block)
  const blockReward = getBlockReward(blockHeight)
  const blockStartSat = getSatNumberFromBlockHeight(blockHeight)
  if (satNumber === blockStartSat) {
    categories.push({
      name: 'Alpha',
      description: 'First satoshi of the block',
      icon: 'Ⓐ',
      rarity: 'uncommon'
    })
    totalRarity += 15
  }

  // Omega Sat (last sat of each block)
  if (satNumber === blockStartSat + blockReward - 1n) {
    categories.push({
      name: 'Omega',
      description: 'Last satoshi of the block',
      icon: 'Ω',
      rarity: 'uncommon'
    })
    totalRarity += 15
  }

  return {
    satNumber,
    blockHeight,
    categories,
    totalRarity,
    isRare: categories.length > 0
  }
}

// Search for rare sats in a UTXO
export function findRareSatsInUTXO(utxo: {
  value: number
  blockHeight: number
  txIndex: number
  outputIndex: number
}): RareSat[] {
  const rareSats: RareSat[] = []
  const startSat = getSatNumberFromBlockHeight(utxo.blockHeight) + BigInt(utxo.txIndex * 1000 + utxo.outputIndex)
  
  for (let i = 0; i < utxo.value; i++) {
    const sat = analyzeSat(startSat + BigInt(i), utxo.blockHeight)
    if (sat.isRare) {
      rareSats.push(sat)
    }
  }
  
  return rareSats
}

// Get rarity color based on total rarity score
export function getRarityColor(rarity: number): string {
  if (rarity >= 100) return 'bg-gradient-to-r from-purple-500 to-pink-500' // Mythic
  if (rarity >= 80) return 'bg-gradient-to-r from-yellow-500 to-red-500' // Legendary
  if (rarity >= 60) return 'bg-gradient-to-r from-indigo-500 to-purple-500' // Epic
  if (rarity >= 40) return 'bg-gradient-to-r from-blue-500 to-indigo-500' // Rare
  if (rarity >= 20) return 'bg-gradient-to-r from-green-500 to-blue-500' // Uncommon
  return 'bg-gray-500' // Common
}

export function getRarityGradient(rarity: number): string {
  if (rarity >= 100) return 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' // Mythic
  if (rarity >= 80) return 'linear-gradient(135deg, #eab308 0%, #ef4444 100%)' // Legendary
  if (rarity >= 60) return 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' // Epic
  if (rarity >= 40) return 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' // Rare
  if (rarity >= 20) return 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)' // Uncommon
  return '#6b7280' // Common
}