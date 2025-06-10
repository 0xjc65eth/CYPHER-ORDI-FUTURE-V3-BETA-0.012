// CoinMarketCap API Types
export interface CMCResponse<T> {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
    notice: string | null;
  };
  data: T;
}

export interface Quote {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  percent_change_60d: number;
  percent_change_90d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  last_updated: string;
}

export interface Platform {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  token_address: string;
}

export interface Tag {
  slug: string;
  name: string;
  category: string;
}

export interface Cryptocurrency {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: string[] | Tag[];
  max_supply: number | null;
  circulating_supply: number;
  total_supply: number;
  infinite_supply: boolean;
  platform: Platform | null;
  cmc_rank: number;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  tvl_ratio: number | null;
  last_updated: string;
  quote: {
    [currency: string]: Quote;
  };
}

export interface GlobalMetrics {
  active_cryptocurrencies: number;
  total_cryptocurrencies: number;
  active_market_pairs: number;
  active_exchanges: number;
  total_exchanges: number;
  eth_dominance: number;
  btc_dominance: number;
  eth_dominance_yesterday: number;
  btc_dominance_yesterday: number;
  eth_dominance_24h_percentage_change: number;
  btc_dominance_24h_percentage_change: number;
  defi_volume_24h: number;
  defi_volume_24h_reported: number;
  defi_market_cap: number;
  defi_24h_percentage_change: number;
  stablecoin_volume_24h: number;
  stablecoin_volume_24h_reported: number;
  stablecoin_market_cap: number;
  stablecoin_24h_percentage_change: number;
  derivatives_volume_24h: number;
  derivatives_volume_24h_reported: number;
  derivatives_24h_percentage_change: number;
  quote: {
    [currency: string]: {
      total_market_cap: number;
      total_volume_24h: number;
      total_volume_24h_reported: number;
      altcoin_volume_24h: number;
      altcoin_volume_24h_reported: number;
      altcoin_market_cap: number;
      defi_volume_24h: number;
      defi_volume_24h_reported: number;
      defi_24h_percentage_change: number;
      defi_market_cap: number;
      stablecoin_volume_24h: number;
      stablecoin_volume_24h_reported: number;
      stablecoin_24h_percentage_change: number;
      stablecoin_market_cap: number;
      derivatives_volume_24h: number;
      derivatives_volume_24h_reported: number;
      derivatives_24h_percentage_change: number;
      last_updated: string;
      total_market_cap_yesterday: number;
      total_volume_24h_yesterday: number;
      total_market_cap_yesterday_percentage_change: number;
      total_volume_24h_yesterday_percentage_change: number;
    };
  };
  last_updated: string;
}

export interface TrendingItem {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  cmc_rank: number;
  num_market_pairs: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  infinite_supply: boolean;
  last_updated: string;
  date_added: string;
  tags: string[];
  platform: Platform | null;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  quote: {
    [currency: string]: Quote;
  };
}

export interface TrendingGainerLoser extends TrendingItem {}

export interface TrendingMostVisited extends TrendingItem {}

export interface TrendingData {
  trending: TrendingItem[];
  gainers: TrendingGainerLoser[];
  losers: TrendingGainerLoser[];
  most_visited: TrendingMostVisited[];
}

export interface FearGreedIndex {
  value: number;
  value_classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  timestamp: string;
  time_until_update: string;
}

export interface AltcoinSeasonIndex {
  value: number;
  status: 'Bitcoin Season' | 'Alt Season' | 'Neutral';
  description: string;
  timestamp: string;
}

export interface MarketPair {
  exchange: {
    id: number;
    name: string;
    slug: string;
  };
  market_id: number;
  market_pair: string;
  category: string;
  fee_type: string;
  market_url: string;
  price_quote: number;
  effective_liquidity: number;
  market_score: number;
  market_reputation: number;
  liquidity_score: number;
  liquidity: number;
  volume_24h_base: number;
  volume_24h_quote: number;
  volume_24h: number;
  volume_percentage: number;
  bid_ask_spread_percentage: number;
  last_updated: string;
}

export interface OHLCVData {
  time_open: string;
  time_close: string;
  time_high: string;
  time_low: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  market_cap: number;
  timestamp: string;
}

export interface PricePerformance {
  quote: {
    [currency: string]: {
      price: number;
      price_change_percentage_24h: number;
      price_change_percentage_7d: number;
      price_change_percentage_30d: number;
      price_change_percentage_60d: number;
      price_change_percentage_90d: number;
      price_change_percentage_365d: number;
      price_change_percentage_ytd: number;
      price_change_percentage_all_time: number;
      last_updated: string;
    };
  };
}

// Request Parameters Types
export interface ListingsLatestParams {
  start?: number;
  limit?: number;
  price_min?: number;
  price_max?: number;
  market_cap_min?: number;
  market_cap_max?: number;
  volume_24h_min?: number;
  volume_24h_max?: number;
  circulating_supply_min?: number;
  circulating_supply_max?: number;
  percent_change_24h_min?: number;
  percent_change_24h_max?: number;
  convert?: string;
  convert_id?: string;
  sort?: 'name' | 'symbol' | 'date_added' | 'market_cap' | 'market_cap_strict' | 'price' | 'circulating_supply' | 'total_supply' | 'max_supply' | 'num_market_pairs' | 'volume_24h' | 'percent_change_1h' | 'percent_change_24h' | 'percent_change_7d' | 'percent_change_30d' | 'percent_change_60d' | 'percent_change_90d' | 'market_cap_by_total_supply_strict' | 'volume_7d' | 'volume_30d';
  sort_dir?: 'asc' | 'desc';
  cryptocurrency_type?: 'all' | 'coins' | 'tokens';
  tag?: string;
  aux?: string;
}

export interface QuotesLatestParams {
  id?: string;
  slug?: string;
  symbol?: string;
  convert?: string;
  convert_id?: string;
  aux?: string;
  skip_invalid?: boolean;
}

export interface TrendingLatestParams {
  start?: number;
  limit?: number;
  time_period?: '24h' | '7d' | '30d';
  convert?: string;
  convert_id?: string;
}

export interface GlobalMetricsParams {
  convert?: string;
  convert_id?: string;
}

export interface OHLCVParams {
  id?: string;
  slug?: string;
  symbol?: string;
  period?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | '1h' | '2h' | '3h' | '4h' | '6h' | '12h' | '1d' | '2d' | '3d' | '7d' | '14d' | '15d' | '30d' | '60d' | '90d' | '365d';
  time_start?: string;
  time_end?: string;
  count?: number;
  interval?: string;
  convert?: string;
  convert_id?: string;
  skip_invalid?: boolean;
}

export interface MarketPairsParams {
  id?: string;
  slug?: string;
  symbol?: string;
  start?: number;
  limit?: number;
  sort_dir?: 'asc' | 'desc';
  sort?: 'volume_24h_strict' | 'exchange_score' | 'effective_liquidity' | 'market_score' | 'market_reputation';
  aux?: string;
  matched_id?: string;
  matched_symbol?: string;
  category?: 'spot' | 'derivatives' | 'otc' | 'perpetual';
  fee_type?: 'all' | 'percentage' | 'no-fees' | 'transactional-mining' | 'unknown';
  convert?: string;
  convert_id?: string;
}

export interface PricePerformanceParams {
  id?: string;
  slug?: string;
  symbol?: string;
  time_period?: 'all_time' | 'yesterday' | '24h' | '7d' | '30d' | '90d' | '365d' | 'ytd';
  convert?: string;
  convert_id?: string;
  skip_invalid?: boolean;
}

// Cache configuration
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
}