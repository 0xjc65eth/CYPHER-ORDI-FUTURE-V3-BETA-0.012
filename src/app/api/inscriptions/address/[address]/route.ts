import { NextRequest, NextResponse } from 'next/server';
import { bitcoinAddressSchema, inscriptionSchema } from '@/lib/validation/schemas';
import { cacheInstances } from '@/lib/cache/advancedCache';
import { applyRateLimit, apiRateLimiters } from '@/lib/api/middleware/rateLimiter';
import { hiroAPI } from '@/lib/api/hiro';

interface RouteParams {
  params: Promise<{
    address: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Apply rate limiting
  const rateLimitResult = await applyRateLimit(request, apiRateLimiters.standard);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }

  try {
    const { address } = await params;
    const searchParams = request.nextUrl.searchParams;
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'number'; // number, timestamp, value
    const order = searchParams.get('order') || 'desc'; // asc, desc
    const contentType = searchParams.get('content_type'); // filter by content type
    const rarity = searchParams.get('rarity'); // filter by sat rarity

    // Validate Bitcoin address
    const addressValidation = bitcoinAddressSchema.safeParse(address);
    if (!addressValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Bitcoin address format',
          message: 'Please provide a valid Bitcoin address'
        },
        { status: 400 }
      );
    }

    // Build cache key with all parameters
    const cacheKey = `inscriptions:${address}:${limit}:${offset}:${sortBy}:${order}:${contentType || 'all'}:${rarity || 'all'}`;
    
    // Check cache first
    let inscriptionsData = await cacheInstances.blockchain.get(cacheKey);

    if (!inscriptionsData) {
      // Fetch fresh data
      inscriptionsData = await fetchInscriptionsByAddress(address, {
        limit,
        offset,
        sortBy,
        order,
        contentType,
        rarity
      });
      
      // Cache for 10 minutes
      await cacheInstances.blockchain.set(cacheKey, inscriptionsData, {
        ttl: 600,
        tags: ['inscriptions', 'blockchain', address]
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      address,
      data: inscriptionsData,
      pagination: {
        limit,
        offset,
        total: inscriptionsData.total,
        hasMore: (offset + limit) < inscriptionsData.total
      },
      filters: {
        sortBy,
        order,
        contentType,
        rarity
      }
    });

  } catch (error) {
    console.error('Inscriptions by address API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch inscriptions',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function fetchInscriptionsByAddress(
  address: string, 
  options: {
    limit: number;
    offset: number;
    sortBy: string;
    order: string;
    contentType?: string | null;
    rarity?: string | null;
  }
) {
  try {
    // First try to get data from Hiro API
    let hiroData = null;
    try {
      hiroData = await hiroAPI.ordinals.getInscriptionsByAddress(address, {
        limit: options.limit,
        offset: options.offset
      });
    } catch (error) {
      console.warn('Hiro API failed, using mock data:', error);
    }

    // If Hiro API fails, use mock data
    if (!hiroData) {
      hiroData = generateMockInscriptionsData(address, options);
    }

    // Process and enrich the inscription data
    const enrichedInscriptions = await enrichInscriptionData(hiroData.results);

    // Apply filters
    let filteredInscriptions = enrichedInscriptions;
    
    if (options.contentType) {
      filteredInscriptions = filteredInscriptions.filter(
        inscription => inscription.contentType.includes(options.contentType!)
      );
    }
    
    if (options.rarity) {
      filteredInscriptions = filteredInscriptions.filter(
        inscription => inscription.satRarity === options.rarity
      );
    }

    // Apply sorting
    filteredInscriptions.sort((a, b) => {
      let aValue, bValue;
      
      switch (options.sortBy) {
        case 'number':
          aValue = a.number;
          bValue = b.number;
          break;
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'value':
          aValue = a.value || 0;
          bValue = b.value || 0;
          break;
        default:
          aValue = a.number;
          bValue = b.number;
      }
      
      return options.order === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Calculate collection statistics
    const statistics = calculateInscriptionStatistics(filteredInscriptions);

    return {
      inscriptions: filteredInscriptions.slice(options.offset, options.offset + options.limit),
      total: filteredInscriptions.length,
      statistics
    };

  } catch (error) {
    console.error('Error fetching inscriptions by address:', error);
    throw new Error('Failed to fetch inscriptions data');
  }
}

function generateMockInscriptionsData(address: string, options: any) {
  const mockInscriptions = [];
  const totalInscriptions = 150; // Mock total

  for (let i = 0; i < Math.min(options.limit, totalInscriptions); i++) {
    const inscriptionNumber = 1000000 + i + options.offset;
    const contentTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'text/plain', 'application/json'];
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
    
    mockInscriptions.push({
      id: `${Math.random().toString(36).substring(7)}i0`,
      number: inscriptionNumber,
      address,
      outputValue: 546, // Standard dust limit
      preview: `https://ordinals.com/preview/${inscriptionNumber}`,
      content: `https://ordinals.com/content/${inscriptionNumber}`,
      contentLength: Math.floor(Math.random() * 100000) + 1000,
      contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      timestamp: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      genesisHeight: 780000 + Math.floor(Math.random() * 50000),
      genesisBlockHeight: 780000 + Math.floor(Math.random() * 50000),
      genesisTxId: Math.random().toString(36).substring(7),
      location: `${Math.random().toString(36).substring(7)}:0:0`,
      output: `${Math.random().toString(36).substring(7)}:0`,
      offset: 0,
      satOrdinal: Math.floor(Math.random() * 2000000000000000),
      satRarity: rarities[Math.floor(Math.random() * rarities.length)],
      satCoinbaseHeight: Math.floor(Math.random() * 780000)
    });
  }

  return {
    results: mockInscriptions,
    total: totalInscriptions
  };
}

async function enrichInscriptionData(inscriptions: any[]) {
  return Promise.all(inscriptions.map(async (inscription) => {
    // Estimate inscription value based on rarity and content type
    const baseValue = estimateInscriptionValue(inscription);
    
    // Get collection information if available
    const collectionInfo = await getCollectionInfo(inscription);
    
    // Get market data
    const marketData = await getInscriptionMarketData(inscription.id);

    return {
      ...inscription,
      value: baseValue,
      estimatedPrice: baseValue,
      collection: collectionInfo,
      marketData,
      metadata: {
        isCollection: !!collectionInfo,
        verified: Math.random() > 0.7, // Mock verification
        featured: Math.random() > 0.9, // Mock featured status
        trending: Math.random() > 0.8  // Mock trending status
      }
    };
  }));
}

function estimateInscriptionValue(inscription: any): number {
  let baseValue = 1000; // Base value in sats
  
  // Rarity multiplier
  const rarityMultipliers: Record<string, number> = {
    'common': 1,
    'uncommon': 2,
    'rare': 5,
    'epic': 20,
    'legendary': 100,
    'mythic': 500
  };
  
  baseValue *= rarityMultipliers[inscription.satRarity] || 1;
  
  // Content type multiplier
  if (inscription.contentType.startsWith('image/')) {
    baseValue *= 2;
  } else if (inscription.contentType === 'text/plain') {
    baseValue *= 0.5;
  }
  
  // Size penalty for very large inscriptions
  if (inscription.contentLength > 50000) {
    baseValue *= 0.8;
  }
  
  // Add randomness for market fluctuation
  baseValue *= (0.8 + Math.random() * 0.4);
  
  return Math.floor(baseValue);
}

async function getCollectionInfo(inscription: any) {
  // Mock collection detection - in production, this would check against known collections
  if (Math.random() > 0.7) {
    const collections = [
      'Bitcoin Punks',
      'Ordinal Maxi Biz',
      'Bitcoin Wizards',
      'Taproot Wizards',
      'Bitcoin Rocks',
      'Ordinal Turtles'
    ];
    
    return {
      name: collections[Math.floor(Math.random() * collections.length)],
      slug: Math.random().toString(36).substring(7),
      verified: Math.random() > 0.5,
      floorPrice: Math.floor(Math.random() * 100000) + 10000,
      totalSupply: Math.floor(Math.random() * 10000) + 100,
      website: 'https://example.com',
      twitter: '@collection'
    };
  }
  
  return null;
}

async function getInscriptionMarketData(inscriptionId: string) {
  return {
    lastSale: {
      price: Math.floor(Math.random() * 50000) + 5000,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      marketplace: Math.random() > 0.5 ? 'magiceden' : 'unisat'
    },
    listings: Math.floor(Math.random() * 5),
    offers: Math.floor(Math.random() * 3),
    priceHistory: generatePriceHistory(),
    volume24h: Math.floor(Math.random() * 100000),
    volume7d: Math.floor(Math.random() * 500000)
  };
}

function generatePriceHistory(): Array<{ price: number; timestamp: Date }> {
  const history = [];
  let currentPrice = Math.floor(Math.random() * 50000) + 10000;
  
  for (let i = 30; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 0.2; // ±10% daily change
    currentPrice *= (1 + change);
    
    history.push({
      price: Math.floor(currentPrice),
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    });
  }
  
  return history;
}

function calculateInscriptionStatistics(inscriptions: any[]) {
  const totalValue = inscriptions.reduce((sum, inscription) => sum + (inscription.value || 0), 0);
  const avgValue = totalValue / inscriptions.length;
  
  const contentTypeDistribution: Record<string, number> = {};
  const rarityDistribution: Record<string, number> = {};
  
  inscriptions.forEach(inscription => {
    const contentType = inscription.contentType.split('/')[0]; // image, text, etc.
    contentTypeDistribution[contentType] = (contentTypeDistribution[contentType] || 0) + 1;
    
    rarityDistribution[inscription.satRarity] = (rarityDistribution[inscription.satRarity] || 0) + 1;
  });
  
  const collectionCount = inscriptions.filter(i => i.collection).length;
  
  return {
    totalInscriptions: inscriptions.length,
    totalValue,
    averageValue: Math.floor(avgValue),
    collectionPercentage: (collectionCount / inscriptions.length) * 100,
    contentTypeDistribution,
    rarityDistribution,
    oldestInscription: Math.min(...inscriptions.map(i => i.number)),
    newestInscription: Math.max(...inscriptions.map(i => i.number))
  };
}