/**
 * 🔑 API CONFIGURATION - CYPHER ORDi FUTURE V3
 * Configuração centralizada de APIs com chaves reais fornecidas
 */

export const API_CONFIG = {
  COINMARKETCAP: {
    BASE_URL: 'https://pro-api.coinmarketcap.com',
    API_KEY: 'c045d2a9-6f2d-44e9-8297-a88ab83b463b',
    HEADERS: {
      'X-CMC_PRO_API_KEY': 'c045d2a9-6f2d-44e9-8297-a88ab83b463b',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    ENDPOINTS: {
      QUOTES: '/v1/cryptocurrency/quotes/latest',
      LISTINGS: '/v1/cryptocurrency/listings/latest',
      METADATA: '/v1/cryptocurrency/info',
      OHLCV: '/v1/cryptocurrency/ohlcv/latest'
    },
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 333,
      REQUESTS_PER_DAY: 10000,
      REQUESTS_PER_MONTH: 300000
    }
  },

  HYPERLIQUID: {
    API_KEY: '0x130832d9de3087dff97d4e0bece2e7b970e7a01f24a8c809134b9efaa627430a',
    BASE_URL: 'https://api.hyperliquid.xyz',
    TESTNET_URL: 'https://api.hyperliquid-testnet.xyz',
    ENDPOINTS: {
      INFO: '/info',
      EXCHANGE: '/exchange',
      WEBSOCKET: 'wss://api.hyperliquid.xyz/ws'
    },
    HEADERS: {
      'Content-Type': 'application/json',
      'User-Agent': 'CypherOrdi-Future/3.0'
    }
  },

  ELEVENLABS: {
    API_KEY: 'sk_9c2c1f484f2d3d452cc0a3b2858a82bfa61761766c329415',
    BASE_URL: 'https://api.elevenlabs.io/v1',
    HEADERS: {
      'xi-api-key': 'sk_9c2c1f484f2d3d452cc0a3b2858a82bfa61761766c329415',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    ENDPOINTS: {
      VOICES: '/voices',
      TEXT_TO_SPEECH: '/text-to-speech',
      SPEECH_TO_SPEECH: '/speech-to-speech',
      MODELS: '/models'
    },
    VOICE_SETTINGS: {
      stability: 0.75,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    }
  },

  HIRO: {
    BASE_URL: 'https://api.hiro.so',
    HEADERS: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'CypherOrdi-Future/3.0'
    },
    ENDPOINTS: {
      ORDINALS: '/ordinals/v1',
      RUNES: '/runes/v1',
      BRC20: '/ordinals/v1/brc-20',
      INSCRIPTIONS: '/ordinals/v1/inscriptions',
      SATOSHIS: '/ordinals/v1/sats'
    },
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 100,
      BURST_LIMIT: 200
    }
  },

  MEMPOOL: {
    BASE_URL: 'https://mempool.space/api',
    HEADERS: {
      'Accept': 'application/json',
      'User-Agent': 'CypherOrdi-Future/3.0'
    },
    ENDPOINTS: {
      FEES: '/v1/fees/recommended',
      BLOCKS: '/blocks',
      TX: '/tx',
      ADDRESS: '/address',
      STATISTICS: '/v1/statistics',
      DIFFICULTY: '/v1/difficulty-adjustment'
    },
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 10,
      REQUESTS_PER_HOUR: 300
    }
  },

  BLOCKSTREAM: {
    BASE_URL: 'https://blockstream.info/api',
    HEADERS: {
      'Accept': 'application/json',
      'User-Agent': 'CypherOrdi-Future/3.0'
    },
    ENDPOINTS: {
      ADDRESS: '/address',
      UTXO: '/address/{address}/utxo',
      TX: '/tx',
      BLOCKS: '/blocks',
      BLOCK: '/block',
      FEE_ESTIMATES: '/fee-estimates'
    },
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 100,
      CONCURRENT_REQUESTS: 5
    }
  },

  COINGECKO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    PRO_URL: 'https://pro-api.coingecko.com/api/v3',
    API_KEY: process.env.COINGECKO_API_KEY || '',
    HEADERS: {
      'Accept': 'application/json',
      'User-Agent': 'CypherOrdi-Future/3.0'
    },
    ENDPOINTS: {
      SIMPLE_PRICE: '/simple/price',
      COINS_MARKETS: '/coins/markets',
      COINS_HISTORY: '/coins/{id}/market_chart',
      TRENDING: '/search/trending',
      GLOBAL: '/global'
    },
    RATE_LIMIT: {
      FREE_TIER: 10, // requests per minute
      PRO_TIER: 500  // requests per minute
    }
  },

  BINANCE: {
    BASE_URL: 'https://api.binance.com/api/v3',
    FUTURES_URL: 'https://fapi.binance.com/fapi/v1',
    API_KEY: process.env.BINANCE_API_KEY || '',
    SECRET_KEY: process.env.BINANCE_SECRET_KEY || '',
    HEADERS: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'CypherOrdi-Future/3.0'
    },
    ENDPOINTS: {
      TICKER_24HR: '/ticker/24hr',
      TICKER_PRICE: '/ticker/price',
      KLINES: '/klines',
      ORDER_BOOK: '/depth',
      TRADES: '/trades',
      ACCOUNT: '/account'
    }
  },

  // Configurações gerais
  GENERAL: {
    DEFAULT_TIMEOUT: 10000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    REQUEST_TIMEOUT: 15000,
    CACHE_TTL: {
      PRICE_DATA: 30,      // 30 seconds
      MARKET_DATA: 60,     // 1 minute
      ORDINALS_DATA: 300,  // 5 minutes
      RUNES_DATA: 180,     // 3 minutes
      PORTFOLIO_DATA: 120, // 2 minutes
      STATIC_DATA: 3600    // 1 hour
    }
  },

  // Configurações de desenvolvimento
  DEVELOPMENT: {
    MOCK_API_DELAY: 500,
    ENABLE_LOGGING: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    DISABLE_RATE_LIMITING: false
  }
};

// Utilitários de validação
export function validateApiKey(service: keyof typeof API_CONFIG): boolean {
  const config = API_CONFIG[service];
  if (!config || typeof config !== 'object') return false;
  
  if ('API_KEY' in config) {
    return Boolean(config.API_KEY && config.API_KEY.length > 0);
  }
  
  return true; // Para serviços que não requerem chave de API
}

export function getApiConfig(service: keyof typeof API_CONFIG) {
  return API_CONFIG[service] || null;
}

export function isServiceAvailable(service: keyof typeof API_CONFIG): boolean {
  const config = getApiConfig(service);
  if (!config) return false;
  
  // Verificar se a chave de API é necessária e está presente
  if ('API_KEY' in config && config.API_KEY) {
    return validateApiKey(service);
  }
  
  return Boolean(config.BASE_URL);
}

export function getServiceHeaders(service: keyof typeof API_CONFIG): Record<string, string> {
  const config = getApiConfig(service);
  return config?.HEADERS || {};
}

export function getServiceEndpoint(service: keyof typeof API_CONFIG, endpoint: string): string {
  const config = getApiConfig(service);
  if (!config || !config.BASE_URL) {
    throw new Error(`Service ${service} not configured`);
  }
  
  return `${config.BASE_URL}${endpoint}`;
}

export function getRateLimitForService(service: keyof typeof API_CONFIG): any {
  const config = getApiConfig(service);
  return config?.RATE_LIMIT || null;
}

// Configurações específicas para diferentes ambientes
export const getEnvironmentConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    isProduction,
    isDevelopment,
    apiTimeout: isProduction ? API_CONFIG.GENERAL.REQUEST_TIMEOUT : API_CONFIG.GENERAL.DEFAULT_TIMEOUT,
    enableMocking: isDevelopment && process.env.ENABLE_API_MOCKING === 'true',
    enableDetailedLogs: isDevelopment || process.env.ENABLE_DETAILED_LOGS === 'true'
  };
};

// Verificação de saúde dos serviços
export const healthCheckServices = async (): Promise<Record<string, boolean>> => {
  const services = Object.keys(API_CONFIG) as Array<keyof typeof API_CONFIG>;
  const healthStatus: Record<string, boolean> = {};
  
  for (const service of services) {
    try {
      if (service === 'GENERAL' || service === 'DEVELOPMENT') {
        healthStatus[service] = true;
        continue;
      }
      
      const available = isServiceAvailable(service);
      healthStatus[service] = available;
    } catch (error) {
      healthStatus[service] = false;
    }
  }
  
  return healthStatus;
};

export default API_CONFIG;