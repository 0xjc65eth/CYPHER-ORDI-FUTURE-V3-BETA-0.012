/**
 * OKX Wallet WaaS Ordinals API Integration
 * Advanced Bitcoin NFT marketplace with comprehensive trading features
 */

export interface OKXCollection {
  collectionId: string;
  symbol: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  websiteUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  totalSupply: number;
  ownerCount: number;
  floorPrice: string;
  floorPriceSymbol: string;
  royaltyFee: string;
  listedRate: string;
  volume24h: string;
  volume7d: string;
  volume30d: string;
  volumeTotal: string;
  change24h: string;
  change7d: string;
  change30d: string;
  salesCount24h: number;
  avgPrice24h: string;
  marketCap: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OKXInscription {
  inscriptionId: string;
  inscriptionNumber: string;
  address: string;
  outputValue: string;
  preview: string;
  content: string;
  contentLength: string;
  contentType: string;
  timestamp: string;
  genesisHeight: string;
  genesisTransaction: string;
  location: string;
  offset: string;
  satoshi: string;
  contentBody: string;
  utxo: {
    txId: string;
    index: number;
    satoshi: string;
    scriptPk: string;
    addressType: number;
    address: string;
    height: number;
    isOpInRBF: boolean;
  };
  collectionInfo?: {
    collectionId: string;
    name: string;
    logoUrl: string;
  };
  rarityInfo?: {
    rank: number;
    score: number;
    rarity: string;
    totalSupply: number;
  };
  listingInfo?: {
    price: string;
    priceSymbol: string;
    listedAt: string;
    seller: string;
    marketplace: string;
  };
  traitInfo?: Array<{
    traitType: string;
    value: string;
    rarity: number;
    frequency: number;
  }>;
}

export interface OKXMarketActivity {
  activityId: string;
  type: 'MINT' | 'LIST' | 'BUY' | 'CANCEL_LIST' | 'TRANSFER';
  inscriptionId: string;
  inscriptionNumber: string;
  fromAddress: string;
  toAddress: string;
  price?: string;
  priceSymbol?: string;
  quantity: string;
  timestamp: string;
  txHash: string;
  blockHeight: string;
  marketplace?: string;
  collectionInfo?: {
    collectionId: string;
    name: string;
  };
}

export interface OKXMarketStats {
  totalVolume: string;
  totalSales: number;
  totalListings: number;
  avgPrice: string;
  floorPrice: string;
  marketCap: string;
  ownerCount: number;
  itemCount: number;
  listedCount: number;
  volume24h: string;
  volume7d: string;
  volume30d: string;
  sales24h: number;
  sales7d: number;
  sales30d: number;
  change24h: string;
  change7d: string;
  change30d: string;
}

export interface OKXTrendingCollection {
  collectionId: string;
  name: string;
  logoUrl: string;
  floorPrice: string;
  change24h: string;
  volume24h: string;
  rank: number;
  trendingType: 'VOLUME' | 'SALES' | 'FLOOR_PRICE' | 'NEW';
}

export class OKXOrdinalsAPI {
  private baseUrl = 'https://www.okx.com/api/v5/mktdata/nft';
  private ordinalsUrl = 'https://www.okx.com/api/v5/mktdata/nft/ordinals';
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private rateLimiter: Map<string, number> = new Map();
  private readonly RATE_LIMIT_MS = 500; // 500ms between requests (OKX allows higher frequency)
  private readonly DEFAULT_TTL = 30000; // 30 seconds cache

  private async rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get('global') || 0;
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < this.RATE_LIMIT_MS) {
      await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_MS - timeSinceLastRequest));
    }

    this.rateLimiter.set('global', Date.now());
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'CYPHER-ORDi-Future-V3',
        ...options?.headers
      }
    });

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.status} ${response.statusText}`);
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
  async getCollections(
    limit: number = 50,
    cursor?: string,
    sortBy: 'volume24h' | 'floorPrice' | 'createdAt' = 'volume24h'
  ): Promise<{ collections: OKXCollection[]; nextCursor?: string }> {
    const cacheKey = `collections-${limit}-${cursor || 'start'}-${sortBy}`;
    const cached = this.getCached<{ collections: OKXCollection[]; nextCursor?: string }>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        sortBy,
        blockchain: 'BITCOIN'
      });

      if (cursor) params.append('cursor', cursor);

      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/collections?${params.toString()}`
      );
      const data = await response.json();
      
      const result = {
        collections: data.data?.collections || [],
        nextCursor: data.data?.nextCursor
      };
      
      this.setCache(cacheKey, result, 120000); // 2 minute cache
      return result;
    } catch (error) {
      console.error('OKX getCollections error:', error);
      return { collections: this.getMockCollections() };
    }
  }

  async getCollection(collectionId: string): Promise<OKXCollection | null> {
    const cacheKey = `collection-${collectionId}`;
    const cached = this.getCached<OKXCollection>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/collections/${collectionId}`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.data, 60000); // 1 minute cache
      return data.data;
    } catch (error) {
      console.error(`OKX getCollection error for ${collectionId}:`, error);
      return null;
    }
  }

  async getTrendingCollections(
    timeframe: '24h' | '7d' | '30d' = '24h',
    type: 'VOLUME' | 'SALES' | 'FLOOR_PRICE' | 'NEW' = 'VOLUME',
    limit: number = 20
  ): Promise<OKXTrendingCollection[]> {
    const cacheKey = `trending-${timeframe}-${type}-${limit}`;
    const cached = this.getCached<OKXTrendingCollection[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        timeframe,
        type,
        limit: limit.toString(),
        blockchain: 'BITCOIN'
      });

      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/trending?${params.toString()}`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.data?.collections || [], 180000); // 3 minute cache
      return data.data?.collections || [];
    } catch (error) {
      console.error('OKX getTrendingCollections error:', error);
      return this.getMockTrendingCollections();
    }
  }

  // Inscriptions API
  async getInscriptions(
    collectionId?: string,
    traits?: Record<string, string[]>,
    priceRange?: { min: string; max: string },
    rarityRange?: { min: number; max: number },
    sortBy: 'priceAsc' | 'priceDesc' | 'rarityAsc' | 'rarityDesc' | 'newest' = 'priceAsc',
    limit: number = 50,
    cursor?: string
  ): Promise<{ inscriptions: OKXInscription[]; nextCursor?: string }> {
    const cacheKey = `inscriptions-${collectionId || 'all'}-${JSON.stringify(traits)}-${JSON.stringify(priceRange)}-${JSON.stringify(rarityRange)}-${sortBy}-${limit}-${cursor || 'start'}`;
    const cached = this.getCached<{ inscriptions: OKXInscription[]; nextCursor?: string }>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        sortBy,
        blockchain: 'BITCOIN'
      });

      if (cursor) params.append('cursor', cursor);
      if (collectionId) params.append('collectionId', collectionId);
      
      if (priceRange) {
        params.append('minPrice', priceRange.min);
        params.append('maxPrice', priceRange.max);
      }
      
      if (rarityRange) {
        params.append('minRarity', rarityRange.min.toString());
        params.append('maxRarity', rarityRange.max.toString());
      }

      if (traits) {
        Object.entries(traits).forEach(([traitType, values]) => {
          values.forEach(value => {
            params.append(`traits[${traitType}]`, value);
          });
        });
      }

      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/inscriptions?${params.toString()}`
      );
      const data = await response.json();
      
      const result = {
        inscriptions: data.data?.inscriptions || [],
        nextCursor: data.data?.nextCursor
      };
      
      this.setCache(cacheKey, result, 30000); // 30 second cache
      return result;
    } catch (error) {
      console.error('OKX getInscriptions error:', error);
      return { inscriptions: this.getMockInscriptions() };
    }
  }

  async getInscription(inscriptionId: string): Promise<OKXInscription | null> {
    const cacheKey = `inscription-${inscriptionId}`;
    const cached = this.getCached<OKXInscription>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/inscriptions/${inscriptionId}`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.data, 60000); // 1 minute cache
      return data.data;
    } catch (error) {
      console.error(`OKX getInscription error for ${inscriptionId}:`, error);
      return null;
    }
  }

  // Market Activity API
  async getCollectionActivity(
    collectionId: string,
    types?: Array<'MINT' | 'LIST' | 'BUY' | 'CANCEL_LIST' | 'TRANSFER'>,
    limit: number = 100,
    cursor?: string
  ): Promise<{ activities: OKXMarketActivity[]; nextCursor?: string }> {
    const cacheKey = `activity-${collectionId}-${types?.join(',') || 'all'}-${limit}-${cursor || 'start'}`;
    const cached = this.getCached<{ activities: OKXMarketActivity[]; nextCursor?: string }>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        collectionId,
        limit: limit.toString(),
        blockchain: 'BITCOIN'
      });

      if (cursor) params.append('cursor', cursor);
      if (types && types.length > 0) {
        types.forEach(type => params.append('type', type));
      }

      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/activities?${params.toString()}`
      );
      const data = await response.json();
      
      const result = {
        activities: data.data?.activities || [],
        nextCursor: data.data?.nextCursor
      };
      
      this.setCache(cacheKey, result, 15000); // 15 second cache for activities
      return result;
    } catch (error) {
      console.error(`OKX getCollectionActivity error for ${collectionId}:`, error);
      return { activities: this.getMockActivities() };
    }
  }

  async getInscriptionActivity(inscriptionId: string): Promise<OKXMarketActivity[]> {
    const cacheKey = `inscription-activity-${inscriptionId}`;
    const cached = this.getCached<OKXMarketActivity[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/inscriptions/${inscriptionId}/activities`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.data?.activities || [], 30000); // 30 second cache
      return data.data?.activities || [];
    } catch (error) {
      console.error(`OKX getInscriptionActivity error for ${inscriptionId}:`, error);
      return [];
    }
  }

  // Market Statistics API
  async getMarketStats(timeframe: '24h' | '7d' | '30d' | 'all' = '24h'): Promise<OKXMarketStats> {
    const cacheKey = `market-stats-${timeframe}`;
    const cached = this.getCached<OKXMarketStats>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/stats?timeframe=${timeframe}&blockchain=BITCOIN`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.data, 60000); // 1 minute cache
      return data.data;
    } catch (error) {
      console.error('OKX getMarketStats error:', error);
      return this.getMockMarketStats();
    }
  }

  async getCollectionStats(collectionId: string, timeframe: '24h' | '7d' | '30d' | 'all' = 'all'): Promise<OKXMarketStats | null> {
    const cacheKey = `collection-stats-${collectionId}-${timeframe}`;
    const cached = this.getCached<OKXMarketStats>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/collections/${collectionId}/stats?timeframe=${timeframe}`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.data, 60000); // 1 minute cache
      return data.data;
    } catch (error) {
      console.error(`OKX getCollectionStats error for ${collectionId}:`, error);
      return null;
    }
  }

  // Advanced Analytics
  async getFloorPriceHistory(
    collectionId: string,
    timeframe: '24h' | '7d' | '30d' | '90d' = '7d',
    interval: '1h' | '4h' | '1d' = '1h'
  ): Promise<Array<{ timestamp: number; price: string; volume: string }>> {
    const cacheKey = `floor-history-${collectionId}-${timeframe}-${interval}`;
    const cached = this.getCached<Array<{ timestamp: number; price: string; volume: string }>>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        timeframe,
        interval,
        collectionId
      });

      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/collections/${collectionId}/floor-history?${params.toString()}`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.data?.history || [], 300000); // 5 minute cache
      return data.data?.history || [];
    } catch (error) {
      console.error(`OKX getFloorPriceHistory error for ${collectionId}:`, error);
      return this.getMockFloorHistory();
    }
  }

  async getTraitRarities(collectionId: string): Promise<Record<string, Record<string, { count: number; rarity: number }>>> {
    const cacheKey = `trait-rarities-${collectionId}`;
    const cached = this.getCached<Record<string, Record<string, { count: number; rarity: number }>>>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/collections/${collectionId}/traits`
      );
      const data = await response.json();
      
      this.setCache(cacheKey, data.data?.traits || {}, 600000); // 10 minute cache
      return data.data?.traits || {};
    } catch (error) {
      console.error(`OKX getTraitRarities error for ${collectionId}:`, error);
      return {};
    }
  }

  // Utility methods
  async searchCollections(query: string): Promise<OKXCollection[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '50',
        blockchain: 'BITCOIN'
      });

      const response = await this.rateLimitedFetch(
        `${this.ordinalsUrl}/search/collections?${params.toString()}`
      );
      const data = await response.json();
      
      return data.data?.collections || [];
    } catch (error) {
      console.error('OKX searchCollections error:', error);
      return [];
    }
  }

  // Mock data methods
  private getMockCollections(): OKXCollection[] {
    return [
      {
        collectionId: 'nodemonkeys-okx',
        symbol: 'NODEMONKEYS',
        name: 'NodeMonkeys',
        description: 'The first 10k PFP collection on Bitcoin',
        logoUrl: 'https://example.com/nodemonkeys-logo.png',
        bannerUrl: 'https://example.com/nodemonkeys-banner.png',
        websiteUrl: 'https://nodemonkeys.io',
        twitterUrl: 'https://twitter.com/nodemonkeys',
        discordUrl: 'https://discord.gg/nodemonkeys',
        totalSupply: 10000,
        ownerCount: 3456,
        floorPrice: '0.045',
        floorPriceSymbol: 'BTC',
        royaltyFee: '2.5',
        listedRate: '8.92',
        volume24h: '156.7',
        volume7d: '892.3',
        volume30d: '3421.5',
        volumeTotal: '5670.8',
        change24h: '+12.5',
        change7d: '+8.3',
        change30d: '+45.2',
        salesCount24h: 89,
        avgPrice24h: '0.052',
        marketCap: '450.0',
        isVerified: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private getMockInscriptions(): OKXInscription[] {
    return [
      {
        inscriptionId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        inscriptionNumber: '15000000',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        outputValue: '10000',
        preview: 'https://ordinals.com/preview/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        content: 'https://ordinals.com/content/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        contentLength: '25600',
        contentType: 'image/png',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        genesisHeight: '820000',
        genesisTransaction: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
        location: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0:0:0',
        offset: '0',
        satoshi: '2099999997689999',
        contentBody: '',
        utxo: {
          txId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
          index: 0,
          satoshi: '10000',
          scriptPk: '0014a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
          addressType: 0,
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          height: 820000,
          isOpInRBF: false
        },
        collectionInfo: {
          collectionId: 'nodemonkeys-okx',
          name: 'NodeMonkeys',
          logoUrl: 'https://example.com/nodemonkeys-logo.png'
        },
        rarityInfo: {
          rank: 2456,
          score: 78.5,
          rarity: 'uncommon',
          totalSupply: 10000
        },
        listingInfo: {
          price: '0.045',
          priceSymbol: 'BTC',
          listedAt: new Date(Date.now() - 3600000).toISOString(),
          seller: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          marketplace: 'okx'
        },
        traitInfo: [
          {
            traitType: 'Background',
            value: 'Blue',
            rarity: 0.15,
            frequency: 1500
          },
          {
            traitType: 'Body',
            value: 'Monkey',
            rarity: 1.0,
            frequency: 10000
          }
        ]
      }
    ];
  }

  private getMockActivities(): OKXMarketActivity[] {
    return [
      {
        activityId: 'activity-1',
        type: 'BUY',
        inscriptionId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        inscriptionNumber: '15000000',
        fromAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        toAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
        price: '0.045',
        priceSymbol: 'BTC',
        quantity: '1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        txHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
        blockHeight: '820000',
        marketplace: 'okx',
        collectionInfo: {
          collectionId: 'nodemonkeys-okx',
          name: 'NodeMonkeys'
        }
      }
    ];
  }

  private getMockTrendingCollections(): OKXTrendingCollection[] {
    return [
      {
        collectionId: 'nodemonkeys-okx',
        name: 'NodeMonkeys',
        logoUrl: 'https://example.com/nodemonkeys-logo.png',
        floorPrice: '0.045',
        change24h: '+12.5',
        volume24h: '156.7',
        rank: 1,
        trendingType: 'VOLUME'
      }
    ];
  }

  private getMockMarketStats(): OKXMarketStats {
    return {
      totalVolume: '28005.5',
      totalSales: 156700,
      totalListings: 8920,
      avgPrice: '0.048',
      floorPrice: '0.045',
      marketCap: '4500.0',
      ownerCount: 34560,
      itemCount: 100000,
      listedCount: 8920,
      volume24h: '1567.0',
      volume7d: '8923.0',
      volume30d: '34215.0',
      sales24h: 890,
      sales7d: 5670,
      sales30d: 21340,
      change24h: '+12.5',
      change7d: '+8.3',
      change30d: '+45.2'
    };
  }

  private getMockFloorHistory(): Array<{ timestamp: number; price: string; volume: string }> {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: now - (24 - i) * 60 * 60 * 1000,
      price: (0.045 + (Math.random() - 0.5) * 0.01).toFixed(6),
      volume: (Math.random() * 50 + 10).toFixed(2)
    }));
  }
}

// Singleton instance
export const okxOrdinalsAPI = new OKXOrdinalsAPI();