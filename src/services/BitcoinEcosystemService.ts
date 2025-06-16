/**
 * Bitcoin Ecosystem Service
 * Provides Bitcoin ecosystem data and statistics
 */

export interface BitcoinEcosystemStats {
  totalRunes: number;
  runesVolume24h: number;
  activeHolders: number;
  totalTransactions: number;
  totalInscriptions: number;
  ordinalsVolume24h: number;
  brc20Tokens: number;
  networkHashrate: number;
  mempool: {
    size: number;
    avgFee: number;
  };
}

export interface RuneData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  supply: number;
  holders: number;
  mints: number;
  mintProgress: number;
}

import { RareSatData } from '@/types/rare-sats';

class BitcoinEcosystemService {
  private static instance: BitcoinEcosystemService;

  static getInstance(): BitcoinEcosystemService {
    if (!BitcoinEcosystemService.instance) {
      BitcoinEcosystemService.instance = new BitcoinEcosystemService();
    }
    return BitcoinEcosystemService.instance;
  }

  async getEcosystemStats(): Promise<BitcoinEcosystemStats> {
    // Return mock data that matches the working version
    return {
      totalRunes: 24,
      runesVolume24h: 1500000,
      activeHolders: 15000,
      totalTransactions: 50000,
      totalInscriptions: 45892343,
      ordinalsVolume24h: 485000,
      brc20Tokens: 156,
      networkHashrate: 450000000,
      mempool: {
        size: 25000,
        avgFee: 12
      }
    };
  }

  async getRunesData(): Promise<RuneData[]> {
    // Return mock runes data that was working
    const runeNames = [
      'UNCOMMON•GOODS', 'RSIC•METAPROTOCOL', 'DOG•GO•TO•THE•MOON',
      'SATOSHI•NAKAMOTO', 'BITCOIN•PIZZA•DAY', 'MEME•ECONOMICS',
      'ORDINAL•THEORY', 'DIGITAL•ARTIFACTS', 'RARE•SATS•CLUB',
      'LIGHTNING•NETWORK', 'TIMECHAIN•GENESIS', 'PROOF•OF•WORK'
    ];

    return runeNames.map((name, index) => ({
      id: `rune_${index + 1}`,
      name,
      symbol: name.replace(/[•\s]/g, '').substring(0, 8),
      price: 0.00001 + Math.random() * 0.001,
      change24h: (Math.random() - 0.5) * 20,
      marketCap: 1000000 + Math.random() * 50000000,
      supply: 1000000 + Math.random() * 99000000,
      holders: 100 + Math.floor(Math.random() * 10000),
      mints: Math.floor(Math.random() * 1000),
      mintProgress: 50 + Math.random() * 50
    }));
  }

  async getRareSatsData(address?: string): Promise<RareSatData> {
    // Mock implementation with real-looking data
    const rareSats = [
      {
        id: 'sat_001',
        rarity: 'vintage',
        value: 0.5,
        satNumber: 50000000000,
        block: 1,
        offset: 0,
        type: 'Block 1 Sat',
        inscription: 'Genesis Block Satoshi',
        address: address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      },
      {
        id: 'sat_002', 
        rarity: 'pizza',
        value: 0.3,
        satNumber: 1234567890,
        block: 57043,
        offset: 100,
        type: 'Pizza Transaction Sat',
        address: address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      },
      {
        id: 'sat_003',
        rarity: 'palindrome',
        value: 0.2,
        satNumber: 1234554321,
        block: 100000,
        offset: 50,
        type: 'Palindrome Sat',
        address: address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      },
      {
        id: 'sat_004',
        rarity: 'block9',
        value: 0.4,
        satNumber: 450000000,
        block: 9,
        offset: 0,
        type: 'Block 9 Sat',
        inscription: 'Early Bitcoin History',
        address: address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      },
      {
        id: 'sat_005',
        rarity: 'fibonacci',
        value: 0.15,
        satNumber: 2147483647,
        block: 200000,
        offset: 89,
        type: 'Fibonacci Sequence Sat',
        address: address || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
      }
    ];

    const totalValue = rareSats.reduce((sum, sat) => sum + sat.value, 0);

    return {
      type: 'RareSatData',
      sats: rareSats,
      totalValue,
      count: rareSats.length
    };
  }
}

export const bitcoinEcosystemService = BitcoinEcosystemService.getInstance();