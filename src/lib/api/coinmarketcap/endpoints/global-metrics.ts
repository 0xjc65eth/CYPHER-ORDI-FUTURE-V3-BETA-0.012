// CoinMarketCap Global Metrics Endpoints
import { getCMCClient } from '../client';
import { CMC_CONFIG } from '../config';
import { validateParamTypes } from '../errors';
import { GlobalMetrics, GlobalMetricsParams } from '../types';

// Get latest global metrics
export async function getGlobalMetrics(params?: GlobalMetricsParams): Promise<GlobalMetrics> {
  const client = getCMCClient();
  
  if (params) {
    validateParamTypes(params, {
      convert: 'string',
      convert_id: 'string',
    });
  }

  const defaultParams = {
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<GlobalMetrics>(
    CMC_CONFIG.ENDPOINTS.GLOBAL_METRICS_LATEST,
    defaultParams
  );
}

// Get historical global metrics
export async function getGlobalMetricsHistorical(params: {
  time_start?: string;
  time_end?: string;
  count?: number;
  interval?: string;
  convert?: string;
  convert_id?: string;
}): Promise<{
  quotes: Array<{
    timestamp: string;
    btc_dominance: number;
    eth_dominance: number;
    active_cryptocurrencies: number;
    active_exchanges: number;
    active_market_pairs: number;
    quote: {
      [currency: string]: {
        total_market_cap: number;
        total_volume_24h: number;
        total_volume_24h_reported: number;
        altcoin_market_cap: number;
        altcoin_volume_24h: number;
        defi_volume_24h: number;
        defi_24h_percentage_change: number;
        defi_market_cap: number;
        stablecoin_volume_24h: number;
        stablecoin_24h_percentage_change: number;
        stablecoin_market_cap: number;
        derivatives_volume_24h: number;
        derivatives_24h_percentage_change: number;
        timestamp: string;
      };
    };
  }>;
}> {
  const client = getCMCClient();
  
  validateParamTypes(params, {
    time_start: 'string',
    time_end: 'string',
    count: 'number',
    interval: 'string',
    convert: 'string',
    convert_id: 'string',
  });

  const defaultParams = {
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<any>(
    CMC_CONFIG.ENDPOINTS.GLOBAL_METRICS_HISTORICAL,
    defaultParams
  );
}

// Helper function to calculate market statistics
export async function getMarketStatistics(convert = CMC_CONFIG.DEFAULT_CURRENCY): Promise<{
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
  altcoinMarketCap: number;
  defiMarketCap: number;
  stablecoinMarketCap: number;
  activeCryptocurrencies: number;
  activeExchanges: number;
  marketCapChange24h: number;
  volumeChange24h: number;
}> {
  const metrics = await getGlobalMetrics({ convert });
  const quote = metrics.quote[convert];

  return {
    totalMarketCap: quote.total_market_cap,
    totalVolume24h: quote.total_volume_24h,
    btcDominance: metrics.btc_dominance,
    ethDominance: metrics.eth_dominance,
    altcoinMarketCap: quote.altcoin_market_cap,
    defiMarketCap: quote.defi_market_cap,
    stablecoinMarketCap: quote.stablecoin_market_cap,
    activeCryptocurrencies: metrics.active_cryptocurrencies,
    activeExchanges: metrics.active_exchanges,
    marketCapChange24h: quote.total_market_cap_yesterday_percentage_change,
    volumeChange24h: quote.total_volume_24h_yesterday_percentage_change,
  };
}

// Helper function to get DeFi statistics
export async function getDefiStatistics(convert = CMC_CONFIG.DEFAULT_CURRENCY): Promise<{
  marketCap: number;
  volume24h: number;
  change24h: number;
  dominance: number;
}> {
  const metrics = await getGlobalMetrics({ convert });
  const quote = metrics.quote[convert];

  return {
    marketCap: quote.defi_market_cap,
    volume24h: quote.defi_volume_24h,
    change24h: quote.defi_24h_percentage_change,
    dominance: (quote.defi_market_cap / quote.total_market_cap) * 100,
  };
}

// Helper function to get stablecoin statistics
export async function getStablecoinStatistics(convert = CMC_CONFIG.DEFAULT_CURRENCY): Promise<{
  marketCap: number;
  volume24h: number;
  change24h: number;
  dominance: number;
}> {
  const metrics = await getGlobalMetrics({ convert });
  const quote = metrics.quote[convert];

  return {
    marketCap: quote.stablecoin_market_cap,
    volume24h: quote.stablecoin_volume_24h,
    change24h: quote.stablecoin_24h_percentage_change,
    dominance: (quote.stablecoin_market_cap / quote.total_market_cap) * 100,
  };
}

// Helper function to get dominance trends
export async function getDominanceTrends(convert = CMC_CONFIG.DEFAULT_CURRENCY): Promise<{
  btc: {
    current: number;
    yesterday: number;
    change24h: number;
  };
  eth: {
    current: number;
    yesterday: number;
    change24h: number;
  };
  altcoins: {
    current: number;
    marketCap: number;
    volume24h: number;
  };
}> {
  const metrics = await getGlobalMetrics({ convert });
  const quote = metrics.quote[convert];

  const altcoinDominance = 100 - metrics.btc_dominance - metrics.eth_dominance;

  return {
    btc: {
      current: metrics.btc_dominance,
      yesterday: metrics.btc_dominance_yesterday,
      change24h: metrics.btc_dominance_24h_percentage_change,
    },
    eth: {
      current: metrics.eth_dominance,
      yesterday: metrics.eth_dominance_yesterday,
      change24h: metrics.eth_dominance_24h_percentage_change,
    },
    altcoins: {
      current: altcoinDominance,
      marketCap: quote.altcoin_market_cap,
      volume24h: quote.altcoin_volume_24h,
    },
  };
}