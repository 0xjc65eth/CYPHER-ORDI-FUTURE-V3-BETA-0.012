// CoinMarketCap Cryptocurrency Endpoints
import { getCMCClient } from '../client';
import { CMC_CONFIG } from '../config';
import { validateParams, validateParamTypes, validateParamRanges } from '../errors';
import {
  Cryptocurrency,
  ListingsLatestParams,
  QuotesLatestParams,
  TrendingLatestParams,
  TrendingData,
  MarketPair,
  MarketPairsParams,
  OHLCVData,
  OHLCVParams,
  PricePerformance,
  PricePerformanceParams,
} from '../types';

// Get cryptocurrency listings
export async function getCryptocurrencyListings(params?: ListingsLatestParams): Promise<Cryptocurrency[]> {
  const client = getCMCClient();
  
  // Validate parameters
  if (params) {
    validateParamTypes(params, {
      start: 'number',
      limit: 'number',
      price_min: 'number',
      price_max: 'number',
      market_cap_min: 'number',
      market_cap_max: 'number',
      volume_24h_min: 'number',
      volume_24h_max: 'number',
      circulating_supply_min: 'number',
      circulating_supply_max: 'number',
      percent_change_24h_min: 'number',
      percent_change_24h_max: 'number',
      convert: 'string',
      convert_id: 'string',
      sort: 'string',
      sort_dir: 'string',
      cryptocurrency_type: 'string',
      tag: 'string',
      aux: 'string',
    });

    validateParamRanges(params, {
      start: { min: 1 },
      limit: { min: 1, max: CMC_CONFIG.MAX_LIMIT },
    });
  }

  const defaultParams = {
    limit: CMC_CONFIG.DEFAULT_LIMIT,
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<Cryptocurrency[]>(
    CMC_CONFIG.ENDPOINTS.LISTINGS_LATEST,
    defaultParams
  );
}

// Get cryptocurrency quotes
export async function getCryptocurrencyQuotes(params: QuotesLatestParams): Promise<Record<string, Cryptocurrency>> {
  const client = getCMCClient();
  
  // Validate that at least one identifier is provided
  if (!params.id && !params.slug && !params.symbol) {
    throw new Error('At least one of id, slug, or symbol must be provided');
  }

  validateParamTypes(params, {
    id: 'string',
    slug: 'string',
    symbol: 'string',
    convert: 'string',
    convert_id: 'string',
    aux: 'string',
    skip_invalid: 'boolean',
  });

  const defaultParams = {
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<Record<string, Cryptocurrency>>(
    CMC_CONFIG.ENDPOINTS.QUOTES_LATEST,
    defaultParams
  );
}

// Get trending cryptocurrencies
export async function getTrendingCryptocurrencies(params?: TrendingLatestParams): Promise<TrendingData> {
  const client = getCMCClient();
  
  if (params) {
    validateParamTypes(params, {
      start: 'number',
      limit: 'number',
      time_period: 'string',
      convert: 'string',
      convert_id: 'string',
    });

    validateParamRanges(params, {
      start: { min: 1 },
      limit: { min: 1, max: 200 },
    });
  }

  const defaultParams = {
    limit: 10,
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<TrendingData>(
    CMC_CONFIG.ENDPOINTS.TRENDING_LATEST,
    defaultParams
  );
}

// Get gainers and losers
export async function getGainersLosers(params?: TrendingLatestParams): Promise<{
  gainers: Cryptocurrency[];
  losers: Cryptocurrency[];
}> {
  const client = getCMCClient();
  
  if (params) {
    validateParamTypes(params, {
      start: 'number',
      limit: 'number',
      time_period: 'string',
      convert: 'string',
      convert_id: 'string',
    });

    validateParamRanges(params, {
      start: { min: 1 },
      limit: { min: 1, max: 200 },
    });
  }

  const defaultParams = {
    limit: 10,
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<{ gainers: Cryptocurrency[]; losers: Cryptocurrency[] }>(
    CMC_CONFIG.ENDPOINTS.TRENDING_GAINERS_LOSERS,
    defaultParams
  );
}

// Get most visited cryptocurrencies
export async function getMostVisited(params?: TrendingLatestParams): Promise<Cryptocurrency[]> {
  const client = getCMCClient();
  
  if (params) {
    validateParamTypes(params, {
      start: 'number',
      limit: 'number',
      convert: 'string',
      convert_id: 'string',
    });

    validateParamRanges(params, {
      start: { min: 1 },
      limit: { min: 1, max: 200 },
    });
  }

  const defaultParams = {
    limit: 10,
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<Cryptocurrency[]>(
    CMC_CONFIG.ENDPOINTS.TRENDING_MOST_VISITED,
    defaultParams
  );
}

// Get market pairs
export async function getMarketPairs(params: MarketPairsParams): Promise<{
  id: number;
  name: string;
  symbol: string;
  num_market_pairs: number;
  market_pairs: MarketPair[];
}> {
  const client = getCMCClient();
  
  // Validate that at least one identifier is provided
  if (!params.id && !params.slug && !params.symbol) {
    throw new Error('At least one of id, slug, or symbol must be provided');
  }

  validateParamTypes(params, {
    id: 'string',
    slug: 'string',
    symbol: 'string',
    start: 'number',
    limit: 'number',
    sort_dir: 'string',
    sort: 'string',
    aux: 'string',
    matched_id: 'string',
    matched_symbol: 'string',
    category: 'string',
    fee_type: 'string',
    convert: 'string',
    convert_id: 'string',
  });

  if (params.start !== undefined || params.limit !== undefined) {
    validateParamRanges(params, {
      start: { min: 1 },
      limit: { min: 1, max: 5000 },
    });
  }

  const defaultParams = {
    limit: 100,
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<any>(
    CMC_CONFIG.ENDPOINTS.MARKET_PAIRS_LATEST,
    defaultParams
  );
}

// Get OHLCV data (latest)
export async function getOHLCVLatest(params: OHLCVParams): Promise<{
  [key: string]: {
    id: number;
    name: string;
    symbol: string;
    quotes: OHLCVData[];
  };
}> {
  const client = getCMCClient();
  
  // Validate that at least one identifier is provided
  if (!params.id && !params.slug && !params.symbol) {
    throw new Error('At least one of id, slug, or symbol must be provided');
  }

  validateParamTypes(params, {
    id: 'string',
    slug: 'string',
    symbol: 'string',
    period: 'string',
    convert: 'string',
    convert_id: 'string',
    skip_invalid: 'boolean',
  });

  const defaultParams = {
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<any>(
    CMC_CONFIG.ENDPOINTS.OHLCV_LATEST,
    defaultParams
  );
}

// Get OHLCV data (historical)
export async function getOHLCVHistorical(params: OHLCVParams): Promise<{
  id: number;
  name: string;
  symbol: string;
  quotes: OHLCVData[];
}> {
  const client = getCMCClient();
  
  // Validate that at least one identifier is provided
  if (!params.id && !params.slug && !params.symbol) {
    throw new Error('At least one of id, slug, or symbol must be provided');
  }

  validateParamTypes(params, {
    id: 'string',
    slug: 'string',
    symbol: 'string',
    period: 'string',
    time_start: 'string',
    time_end: 'string',
    count: 'number',
    interval: 'string',
    convert: 'string',
    convert_id: 'string',
    skip_invalid: 'boolean',
  });

  if (params.count !== undefined) {
    validateParamRanges(params, {
      count: { min: 1, max: 10000 },
    });
  }

  const defaultParams = {
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<any>(
    CMC_CONFIG.ENDPOINTS.OHLCV_HISTORICAL,
    defaultParams
  );
}

// Get price performance statistics
export async function getPricePerformance(params: PricePerformanceParams): Promise<{
  [key: string]: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    periods: {
      [period: string]: PricePerformance;
    };
  };
}> {
  const client = getCMCClient();
  
  // Validate that at least one identifier is provided
  if (!params.id && !params.slug && !params.symbol) {
    throw new Error('At least one of id, slug, or symbol must be provided');
  }

  validateParamTypes(params, {
    id: 'string',
    slug: 'string',
    symbol: 'string',
    time_period: 'string',
    convert: 'string',
    convert_id: 'string',
    skip_invalid: 'boolean',
  });

  const defaultParams = {
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<any>(
    CMC_CONFIG.ENDPOINTS.PRICE_PERFORMANCE_LATEST,
    defaultParams
  );
}

// Helper function to get a single cryptocurrency by ID
export async function getCryptocurrencyById(id: number, convert = CMC_CONFIG.DEFAULT_CURRENCY): Promise<Cryptocurrency> {
  const quotes = await getCryptocurrencyQuotes({ id: id.toString(), convert });
  return quotes[id.toString()];
}

// Helper function to get a single cryptocurrency by symbol
export async function getCryptocurrencyBySymbol(symbol: string, convert = CMC_CONFIG.DEFAULT_CURRENCY): Promise<Cryptocurrency> {
  const quotes = await getCryptocurrencyQuotes({ symbol, convert });
  return Object.values(quotes)[0];
}

// Helper function to get top cryptocurrencies
export async function getTopCryptocurrencies(limit = 10, convert = CMC_CONFIG.DEFAULT_CURRENCY): Promise<Cryptocurrency[]> {
  return getCryptocurrencyListings({
    start: 1,
    limit,
    convert,
    sort: 'market_cap',
    sort_dir: 'desc',
  });
}

// Helper function to get new listings
export async function getNewListings(limit = 10, convert = CMC_CONFIG.DEFAULT_CURRENCY): Promise<Cryptocurrency[]> {
  return getCryptocurrencyListings({
    start: 1,
    limit,
    convert,
    sort: 'date_added',
    sort_dir: 'desc',
  });
}