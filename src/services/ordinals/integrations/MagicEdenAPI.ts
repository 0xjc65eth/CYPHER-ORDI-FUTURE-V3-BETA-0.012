/**
 * Magic Eden Ordinals API Integration
 * Official Bitcoin NFT Marketplace API
 */

export interface MagicEdenCollection {
  symbol: string;
  name: string;
  description: string;
  image: string;
  twitter: string;
  discord: string;
  website: string;
  totalItems: number;
  floorPrice: number;  // in BTC
  totalVolume: number;
  listedCount: number;
  owners: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  floorChange24h: number;
  averagePrice24h: number;
  supply: number;
  featured?: boolean;
  verified?: boolean;
}

export interface MagicEdenInscription {
  id: string;
  num: number;
  address: string;
  output: string;
  location: string;
  content: string;
  contentType: string;
  contentBody: string;
  contentPreviewURL: string;
  genesisTransaction: string;
  genesisTransactionBlockTime: number;
  genesisTransactionBlockHeight: number;
  genesisTransactionBlockHash: string;
  sat: number;
  satOffset: number;
  owner: string;
  listed: boolean;
  listedAt?: number;
  listedPrice?: number;
  listedMakerFeeBp?: number;
  listedSellerReceiveAddress?: string;
  collection?: {
    symbol: string;
    name: string;
    imageURI: string;
  };
  satAttributes?: {
    rarity: string;
    year: string;
    epoch: string;
    period: string;
  };
}

export interface MagicEdenActivity {
  txid: string;
  blockHeight: number;
  blockTime: number;
  type: 'list' | 'delist' | 'sale' | 'transfer' | 'mint';
  inscriptionId: string;
  inscriptionNumber: number;
  oldSatpoint?: string;
  newSatpoint?: string;
  fromAddress?: string;
  toAddress?: string;
  oldOwner?: string;
  newOwner?: string;
  price?: number;
  priceUnit?: string;
  marketplace?: string;
  collection?: {
    symbol: string;
    name: string;
  };
}

export interface MagicEdenStats {
  totalVolume: number;
  totalSales: number;
  totalListings: number;
  avgSalePrice: number;
  marketCap: number;
  numOwners: number;
  numItems: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  sales24h: number;
  sales7d: number;
  sales30d: number;
  floorPrice: number;
  listedCount: number;
}

export class MagicEdenAPI {
  private baseUrl = 'https://api-mainnet.magiceden.dev/v2';
  private ordinalsUrl = 'https://api-mainnet.magiceden.dev/v2/ord';
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private rateLimiter: Map<string, number> = new Map();
  private readonly RATE_LIMIT_MS = 1000; // 1 second between requests
  private readonly DEFAULT_TTL = 60000; // 1 minute cache

  private async rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get(url) || 0;
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_MS - timeSinceLastRequest));
    }

    this.rateLimiter.set(url, Date.now());
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CYPHER-ORDi-Future-V3',
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Magic Eden API error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  // Collections API
  async getCollections(limit: number = 100, offset: number = 0): Promise<MagicEdenCollection[]> {
    const cacheKey = `collections-${limit}-${offset}`;
    const cached = this.getCached<MagicEdenCollection[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/collections?offset=${offset}&limit=${limit}`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.collections || [], 300000); // 5 minute cache for collections
      return data.collections || [];
    } catch (error) {
      console.error('Magic Eden getCollections error:', error);
      return this.getMockCollections();
    }
  }

  async getCollection(symbol: string): Promise<MagicEdenCollection | null> {
    const cacheKey = `collection-${symbol}`;
    const cached = this.getCached<MagicEdenCollection>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(`${this.ordinalsUrl}/collections/${symbol}`);
      const data = await response.json();
      
      this.setCache(cacheKey, data, 120000); // 2 minute cache
      return data;
    } catch (error) {
      console.error(`Magic Eden getCollection error for ${symbol}:`, error);
      return null;
    }
  }

  async getCollectionStats(symbol: string): Promise<MagicEdenStats | null> {
    const cacheKey = `collection-stats-${symbol}`;
    const cached = this.getCached<MagicEdenStats>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(`${this.ordinalsUrl}/collections/${symbol}/stats`);
      const data = await response.json();
      
      this.setCache(cacheKey, data, 60000); // 1 minute cache for stats
      return data;
    } catch (error) {
      console.error(`Magic Eden getCollectionStats error for ${symbol}:`, error);
      return this.getMockStats();
    }
  }

  // Inscriptions API
  async getInscriptions(
    collection?: string,
    traits?: Record<string, string>,
    sortBy: string = 'priceAsc',
    limit: number = 20,
    offset: number = 0
  ): Promise<MagicEdenInscription[]> {
    const cacheKey = `inscriptions-${collection || 'all'}-${JSON.stringify(traits)}-${sortBy}-${limit}-${offset}`;
    const cached = this.getCached<MagicEdenInscription[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
        sortBy,
      });

      if (collection) params.append('collection', collection);
      if (traits) {
        Object.entries(traits).forEach(([key, value]) => {
          params.append(`traits[${key}]`, value);
        });
      }

      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/tokens?${params.toString()}`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.tokens || [], 30000); // 30 second cache
      return data.tokens || [];
    } catch (error) {
      console.error('Magic Eden getInscriptions error:', error);
      return this.getMockInscriptions();
    }
  }

  async getInscription(inscriptionId: string): Promise<MagicEdenInscription | null> {
    const cacheKey = `inscription-${inscriptionId}`;
    const cached = this.getCached<MagicEdenInscription>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(`${this.ordinalsUrl}/tokens/${inscriptionId}`);
      const data = await response.json();
      
      this.setCache(cacheKey, data, 60000); // 1 minute cache
      return data;
    } catch (error) {
      console.error(`Magic Eden getInscription error for ${inscriptionId}:`, error);
      return null;
    }
  }

  // Activity API
  async getCollectionActivity(
    collection: string,
    kind?: string[],
    limit: number = 100,
    offset: number = 0
  ): Promise<MagicEdenActivity[]> {
    const cacheKey = `activity-${collection}-${kind?.join(',') || 'all'}-${limit}-${offset}`;
    const cached = this.getCached<MagicEdenActivity[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: limit.toString(),
      });

      if (kind && kind.length > 0) {
        kind.forEach(k => params.append('kind', k));
      }

      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/collections/${collection}/activities?${params.toString()}`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.activities || [], 15000); // 15 second cache for activity
      return data.activities || [];
    } catch (error) {
      console.error(`Magic Eden getCollectionActivity error for ${collection}:`, error);
      return this.getMockActivity();
    }
  }

  async getInscriptionActivity(inscriptionId: string): Promise<MagicEdenActivity[]> {
    const cacheKey = `inscription-activity-${inscriptionId}`;
    const cached = this.getCached<MagicEdenActivity[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/tokens/${inscriptionId}/activities`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.activities || [], 30000); // 30 second cache
      return data.activities || [];
    } catch (error) {
      console.error(`Magic Eden getInscriptionActivity error for ${inscriptionId}:`, error);
      return [];
    }
  }

  // Market Data API
  async getFloorPrices(collections: string[] = []): Promise<Record<string, number>> {
    const cacheKey = `floor-prices-${collections.join(',')}`;
    const cached = this.getCached<Record<string, number>>(cacheKey);
    if (cached) return cached;

    try {
      const floorPrices: Record<string, number> = {};
      
      if (collections.length === 0) {
        // Get all collections first
        const allCollections = await this.getCollections(50);
        collections = allCollections.map(c => c.symbol);
      }

      // Batch requests for floor prices
      const promises = collections.map(async (symbol) => {
        const stats = await this.getCollectionStats(symbol);
        if (stats) {
          floorPrices[symbol] = stats.floorPrice;
        }
      });

      await Promise.allSettled(promises);
      
      this.setCache(cacheKey, floorPrices, 60000); // 1 minute cache
      return floorPrices;
    } catch (error) {
      console.error('Magic Eden getFloorPrices error:', error);
      return {};
    }
  }

  // Utility methods
  async searchCollections(query: string): Promise<MagicEdenCollection[]> {
    try {
      const allCollections = await this.getCollections(500);
      return allCollections.filter(collection =>
        collection.name.toLowerCase().includes(query.toLowerCase()) ||
        collection.symbol.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Magic Eden searchCollections error:', error);
      return [];
    }
  }

  // Mock data for fallback
  private getMockCollections(): MagicEdenCollection[] {
    return [
      {
        symbol: 'nodemonkeys',
        name: 'NodeMonkeys',
        description: 'The first 10k PFP collection on Bitcoin',
        image: 'https://example.com/nodemonkeys.png',
        twitter: 'https://twitter.com/nodemonkeys',
        discord: 'https://discord.gg/nodemonkeys',
        website: 'https://nodemonkeys.io',
        totalItems: 10000,
        floorPrice: 0.045,
        totalVolume: 2800.5,
        listedCount: 892,
        owners: 3456,
        volume24h: 156.7,
        volume7d: 892.3,
        volume30d: 3421.5,
        floorChange24h: 12.5,
        averagePrice24h: 0.052,
        supply: 10000,
        verified: true,
        featured: true
      }
    ];
  }

  private getMockInscriptions(): MagicEdenInscription[] {
    return [
      {
        id: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        num: 15000000,
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        output: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0:0',
        location: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0:0:0',
        content: 'https://ordinals.com/content/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        contentType: 'image/png',
        contentBody: '',
        contentPreviewURL: 'https://ordinals.com/preview/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        genesisTransaction: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
        genesisTransactionBlockTime: Date.now() - 86400000,
        genesisTransactionBlockHeight: 820000,
        genesisTransactionBlockHash: '00000000000000000001234567890abcdef',
        sat: 2099999997689999,
        satOffset: 0,
        owner: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        listed: true,
        listedAt: Date.now() - 3600000,
        listedPrice: 0.045,
        listedMakerFeeBp: 250,
        collection: {
          symbol: 'nodemonkeys',
          name: 'NodeMonkeys',
          imageURI: 'https://example.com/nodemonkeys.png'
        },
        satAttributes: {
          rarity: 'common',
          year: '2024',
          epoch: '4',
          period: '1'
        }
      }
    ];
  }

  private getMockStats(): MagicEdenStats {
    return {
      totalVolume: 2800.5,
      totalSales: 15670,
      totalListings: 892,
      avgSalePrice: 0.048,
      marketCap: 450.0,
      numOwners: 3456,
      numItems: 10000,
      volume24h: 156.7,
      volume7d: 892.3,
      volume30d: 3421.5,
      sales24h: 89,
      sales7d: 567,
      sales30d: 2134,
      floorPrice: 0.045,
      listedCount: 892
    };
  }

  private getMockActivity(): MagicEdenActivity[] {
    return [
      {
        txid: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
        blockHeight: 820000,
        blockTime: Date.now() - 3600000,
        type: 'sale',
        inscriptionId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        inscriptionNumber: 15000000,
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        oldOwner: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        newOwner: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        price: 0.045,
        priceUnit: 'BTC',
        marketplace: 'magiceden',
        collection: {
          symbol: 'nodemonkeys',
          name: 'NodeMonkeys'
        }
      }
    ];
  }
}

// Singleton instance
export const magicEdenAPI = new MagicEdenAPI();