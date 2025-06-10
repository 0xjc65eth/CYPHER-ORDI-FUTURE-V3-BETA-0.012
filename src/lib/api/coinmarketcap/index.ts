// CoinMarketCap API Main Export
export * from './types';
export * from './client';
export * from './config';
export * from './cache';
export * from './errors';

// Export all endpoints
export * from './endpoints/cryptocurrency';
export * from './endpoints/global-metrics';
export * from './endpoints/tools';
export * from './endpoints/indicators';

// Import functions for default export
import {
  getCMCClient,
  createCMCClient,
  CMCClient,
} from './client';

import {
  getCryptocurrencyListings,
  getCryptocurrencyQuotes,
  getTrendingCryptocurrencies,
  getGainersLosers,
  getMostVisited,
  getMarketPairs,
  getOHLCVLatest,
  getOHLCVHistorical,
  getPricePerformance,
  getCryptocurrencyById,
  getCryptocurrencyBySymbol,
  getTopCryptocurrencies,
  getNewListings,
} from './endpoints/cryptocurrency';

import {
  getGlobalMetrics,
  getGlobalMetricsHistorical,
  getMarketStatistics,
  getDefiStatistics,
  getStablecoinStatistics,
  getDominanceTrends,
} from './endpoints/global-metrics';

import {
  priceConversion,
  convertCrypto,
  convertToMultipleCurrencies,
  getHistoricalPrice,
} from './endpoints/tools';

import {
  getFearGreedIndex,
  getAltcoinSeasonIndex,
  getMarketSentiment,
} from './endpoints/indicators';

// Default export with all main functions
const CMC = {
  // Client management
  getClient: getCMCClient,
  createClient: createCMCClient,
  
  // Cryptocurrency data
  listings: getCryptocurrencyListings,
  quotes: getCryptocurrencyQuotes,
  trending: getTrendingCryptocurrencies,
  gainersLosers: getGainersLosers,
  mostVisited: getMostVisited,
  marketPairs: getMarketPairs,
  ohlcv: {
    latest: getOHLCVLatest,
    historical: getOHLCVHistorical,
  },
  pricePerformance: getPricePerformance,
  
  // Global metrics
  globalMetrics: getGlobalMetrics,
  marketStats: getMarketStatistics,
  defiStats: getDefiStatistics,
  stablecoinStats: getStablecoinStatistics,
  dominance: getDominanceTrends,
  
  // Tools
  convert: priceConversion,
  convertCrypto: convertCrypto,
  
  // Indicators
  fearGreed: getFearGreedIndex,
  altcoinSeason: getAltcoinSeasonIndex,
  sentiment: getMarketSentiment,
  
  // Helpers
  getById: getCryptocurrencyById,
  getBySymbol: getCryptocurrencyBySymbol,
  getTop: getTopCryptocurrencies,
  getNew: getNewListings,
};

export default CMC;