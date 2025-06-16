/**
 * Ordinals Data Types
 * 
 * This file defines the types for Bitcoin Ordinals data used in the Bitcoin Blockchain Analytics application.
 */

export interface OrdinalData {
  id: string;
  inscription_id: string;
  inscription_number: number;
  address: string;
  output: string;
  location: string;
  contentType: string;
  contentLength: number;
  timestamp: string;
  genesisTransaction: string;
  genesisHeight: number;
  sat: string;
  satRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  satOffset: number;
  preview?: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface OrdinalCollection {
  id: string;
  name: string;
  description?: string;
  creator: string;
  inscriptionCount: number;
  floorPrice?: number;
  totalVolume?: number;
  createdAt: string;
  updatedAt: string;
  verified: boolean;
  iconUrl?: string;
  bannerUrl?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    website?: string;
  };
  attributes?: {
    name: string;
    values: string[];
    counts: number[];
  }[];
}

export interface OrdinalMarketData {
  timestamp: string;
  floorPrice: number;
  volume24h: number;
  sales24h: number;
  averagePrice24h: number;
  highestSale24h: number;
  lowestSale24h: number;
  marketCap: number;
  holders: number;
  listedCount: number;
  totalListedValue: number;
}

export interface OrdinalTransaction {
  id: string;
  inscriptionId: string;
  txid: string;
  blockHeight: number;
  timestamp: string;
  fromAddress: string;
  toAddress: string;
  price?: number;
  marketplace?: string;
  type: 'transfer' | 'sale' | 'mint';
  feeRate: number;
  feeTotal: number;
}

export interface OrdinalStats {
  totalInscriptions: number;
  inscriptionsLast24h: number;
  inscriptionsLast7d: number;
  totalVolumeBTC: number;
  volumeBTCLast24h: number;
  volumeBTCLast7d: number;
  averagePriceBTC: number;
  averagePriceBTCLast24h: number;
  averagePriceBTCLast7d: number;
  totalCollections: number;
  totalHolders: number;
  totalMarketplaces: number;
}
