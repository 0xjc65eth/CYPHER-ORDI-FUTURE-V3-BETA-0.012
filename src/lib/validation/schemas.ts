import { z } from 'zod';

// Bitcoin Address Validation
export const bitcoinAddressSchema = z.string()
  .regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, 'Invalid Bitcoin address format');

// Portfolio Schemas
export const portfolioAssetSchema = z.object({
  id: z.string(),
  type: z.enum(['bitcoin', 'ordinal', 'rune', 'brc20']),
  name: z.string(),
  symbol: z.string(),
  balance: z.number().min(0),
  value: z.number().min(0),
  price: z.number().min(0),
  change24h: z.number(),
  allocation: z.number().min(0).max(100),
  metadata: z.object({
    inscriptionId: z.string().optional(),
    runeId: z.string().optional(),
    tokenStandard: z.string().optional(),
    collectionName: z.string().optional(),
    rarity: z.number().optional(),
  }).optional(),
});

export const portfolioTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['buy', 'sell', 'receive', 'send', 'mint', 'burn']),
  asset: z.string(),
  amount: z.number().min(0),
  price: z.number().min(0),
  value: z.number().min(0),
  fee: z.number().min(0),
  timestamp: z.coerce.date(),
  txHash: z.string(),
  status: z.enum(['confirmed', 'pending', 'failed']),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const portfolioDataSchema = z.object({
  totalValue: z.number().min(0),
  totalCost: z.number().min(0),
  totalPnL: z.number(),
  totalPnLPercent: z.number(),
  assets: z.array(portfolioAssetSchema),
  transactions: z.array(portfolioTransactionSchema),
  performance: z.object({
    '24h': z.number(),
    '7d': z.number(),
    '30d': z.number(),
    '90d': z.number(),
    '1y': z.number(),
  }),
});

// Market Data Schemas
export const marketTickerSchema = z.object({
  symbol: z.string(),
  price: z.number().min(0),
  change24h: z.number(),
  change24hPercent: z.number(),
  volume24h: z.number().min(0),
  marketCap: z.number().min(0).optional(),
  high24h: z.number().min(0),
  low24h: z.number().min(0),
  timestamp: z.coerce.date(),
});

export const marketDataSchema = z.object({
  tickers: z.array(marketTickerSchema),
  overview: z.object({
    totalMarketCap: z.number().min(0),
    totalVolume24h: z.number().min(0),
    btcDominance: z.number().min(0).max(100),
    totalSupply: z.number().min(0),
    activeCurrencies: z.number().min(0),
  }),
  trending: z.array(z.object({
    id: z.string(),
    name: z.string(),
    symbol: z.string(),
    price: z.number().min(0),
    change24h: z.number(),
    volume24h: z.number().min(0),
  })),
});

// News Schema
export const newsItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  publishedAt: z.coerce.date(),
  source: z.string(),
  category: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
});

// Trading Signal Schema
export const tradingSignalSchema = z.object({
  id: z.string(),
  asset: z.string(),
  signal: z.enum(['buy', 'sell', 'hold']),
  strength: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  targetPrice: z.number().min(0).optional(),
  stopLoss: z.number().min(0).optional(),
  timeframe: z.string(),
  reasoning: z.string(),
  indicators: z.array(z.object({
    name: z.string(),
    value: z.number(),
    signal: z.enum(['bullish', 'bearish', 'neutral']),
  })),
  timestamp: z.coerce.date(),
});

// Inscription Schema
export const inscriptionSchema = z.object({
  id: z.string(),
  number: z.number().min(0),
  address: bitcoinAddressSchema,
  outputValue: z.number().min(0),
  preview: z.string().url().optional(),
  content: z.string().url().optional(),
  contentLength: z.number().min(0),
  contentType: z.string(),
  contentBody: z.string().optional(),
  timestamp: z.coerce.date(),
  genesisHeight: z.number().min(0),
  genesisBlockHeight: z.number().min(0),
  genesisTxId: z.string(),
  location: z.string(),
  output: z.string(),
  value: z.number().min(0).optional(),
  offset: z.number().min(0),
  satOrdinal: z.number().min(0),
  satRarity: z.string().optional(),
  satCoinbaseHeight: z.number().min(0),
});

// Rune Schema
export const runeSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  spacedName: z.string(),
  number: z.number().min(0),
  height: z.number().min(0),
  txIndex: z.number().min(0),
  timestamp: z.coerce.date(),
  mints: z.number().min(0),
  burned: z.number().min(0),
  divisibility: z.number().min(0),
  premine: z.number().min(0),
  spaced: z.boolean(),
  turbo: z.boolean(),
  etching: z.object({
    terms: z.object({
      amount: z.number().min(0).optional(),
      cap: z.number().min(0).optional(),
      heightStart: z.number().min(0).optional(),
      heightEnd: z.number().min(0).optional(),
      offsetStart: z.number().min(0).optional(),
      offsetEnd: z.number().min(0).optional(),
    }).optional(),
    runestone: z.string(),
  }),
  supply: z.object({
    current: z.number().min(0),
    total: z.number().min(0),
    burned: z.number().min(0),
    minted: z.number().min(0),
  }),
});

// WebSocket Message Schema
export const websocketMessageSchema = z.object({
  type: z.enum(['subscribe', 'unsubscribe', 'price_update', 'market_update', 'notification']),
  channel: z.string(),
  data: z.any(),
  timestamp: z.coerce.date(),
});

// Rate Limiting Schema
export const rateLimitSchema = z.object({
  windowMs: z.number().min(1000),
  maxRequests: z.number().min(1),
  keyGenerator: z.function().optional(),
  skipFailedRequests: z.boolean().default(false),
  skipSuccessfulRequests: z.boolean().default(false),
});

// Cache Configuration Schema
export const cacheConfigSchema = z.object({
  ttl: z.number().min(0),
  key: z.string(),
  tags: z.array(z.string()).optional(),
  namespace: z.string().optional(),
});

// API Response Schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.coerce.date(),
  requestId: z.string().optional(),
  metadata: z.object({
    cached: z.boolean().optional(),
    cacheExpiry: z.coerce.date().optional(),
    rateLimit: z.object({
      remaining: z.number().min(0),
      reset: z.coerce.date(),
      limit: z.number().min(0),
    }).optional(),
  }).optional(),
});

// Type exports
export type BitcoinAddress = z.infer<typeof bitcoinAddressSchema>;
export type PortfolioAsset = z.infer<typeof portfolioAssetSchema>;
export type PortfolioTransaction = z.infer<typeof portfolioTransactionSchema>;
export type PortfolioData = z.infer<typeof portfolioDataSchema>;
export type MarketTicker = z.infer<typeof marketTickerSchema>;
export type MarketData = z.infer<typeof marketDataSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
export type TradingSignal = z.infer<typeof tradingSignalSchema>;
export type Inscription = z.infer<typeof inscriptionSchema>;
export type Rune = z.infer<typeof runeSchema>;
export type WebSocketMessage = z.infer<typeof websocketMessageSchema>;
export type RateLimit = z.infer<typeof rateLimitSchema>;
export type CacheConfig = z.infer<typeof cacheConfigSchema>;
export type APIResponse = z.infer<typeof apiResponseSchema>;