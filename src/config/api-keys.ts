// Arquivo de configuração para chaves de API e outras configurações

// Chave da API do CoinMarketCap
export const COINMARKETCAP_API_KEY = process.env.CMC_API_KEY;

// Chave da API do Ordiscan
export const ORDISCAN_API_KEY = process.env.ORDISCAN_API_KEY;

// Configurações de cache
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

// URLs de API
export const API_URLS = {
  coinmarketcap: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
  ordiscan: 'https://api.ordiscan.com/v1',
  // Adicione outras URLs de API conforme necessário
};

// Configurações de fallback
export const FALLBACK_PRICES: { [key: string]: number } = {
  'BTC': 64000,
  'ETH': 3100,
  'BNB': 560,
  'SOL': 145,
  'XRP': 0.50,
  'ADA': 0.45,
  'AVAX': 35,
  'DOGE': 0.15,
  'DOT': 7.5,
  'MATIC': 0.65
};
