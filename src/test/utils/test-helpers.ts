/**
 * 🧪 TEST HELPERS - CYPHER ORDi FUTURE V3
 * Utilitários para testes unitários e de integração
 */

export interface MockApiResponse<T> {
  data: T;
  status: number;
  headers?: Record<string, string>;
  delay?: number;
}

export interface MockWalletData {
  address: string;
  balance: number;
  ordinalsBalance: any[];
  runesBalance: any[];
  brc20Balance: any[];
  rareSats: any[];
}

export interface MockMarketData {
  bitcoin: {
    price: number;
    change24h: number;
    volume24h: number;
  };
  ethereum: {
    price: number;
    change24h: number;
    volume24h: number;
  };
  timestamp: number;
}

// Mock API response helper
export const mockApiResponse = <T>(data: T, status = 200, delay = 0): Promise<MockApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        status,
        headers: { 'Content-Type': 'application/json' },
        delay
      });
    }, delay);
  });
};

// Mock error helper
export const mockError = (message: string, code?: string): Error => {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
};

// Mock API error response
export const mockApiError = (status: number, message: string, delay = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = mockError(message);
      (error as any).status = status;
      reject(error);
    }, delay);
  });
};

// Mock wallet data generator
export const createMockWalletData = (overrides: Partial<MockWalletData> = {}): MockWalletData => {
  return {
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance: 0.05,
    ordinalsBalance: [
      {
        id: 'mock_ordinal_1',
        content_type: 'text/plain',
        content_length: 100,
        genesis_height: 840000,
        genesis_fee: 5000,
        genesis_timestamp: Date.now() - 86400000,
        value: 546
      }
    ],
    runesBalance: [
      {
        name: 'MOCK•RUNE•TOKEN',
        amount: '1000000',
        decimals: 2,
        symbol: 'MRT'
      }
    ],
    brc20Balance: [
      {
        ticker: 'MOCK',
        balance: '500000',
        transferable_balance: '250000',
        total_supply: '21000000'
      }
    ],
    rareSats: [
      {
        id: 'rare_sat_1',
        rarity: 'uncommon',
        satNumber: 50000000000,
        block: 840000,
        offset: 0,
        value: 0.001
      }
    ],
    ...overrides
  };
};

// Mock market data generator
export const createMockMarketData = (overrides: Partial<MockMarketData> = {}): MockMarketData => {
  return {
    bitcoin: {
      price: 43000,
      change24h: 2.5,
      volume24h: 15000000000
    },
    ethereum: {
      price: 2600,
      change24h: -1.2,
      volume24h: 8000000000
    },
    timestamp: Date.now(),
    ...overrides
  };
};

// Mock Portfolio data
export const createMockPortfolioData = () => {
  return {
    totalValue: 125000,
    totalPnL: 15000,
    assets: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 2.5,
        avgPrice: 38000,
        currentPrice: 43000,
        value: 107500,
        pnL: 12500,
        roi: 13.16,
        allocation: 86
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        quantity: 6.73,
        avgPrice: 2400,
        currentPrice: 2600,
        value: 17498,
        pnL: 1346,
        roi: 8.33,
        allocation: 14
      }
    ],
    performance: {
      day: 2.3,
      week: 8.7,
      month: 15.2,
      year: 127.8
    }
  };
};

// Mock trading bot data
export const createMockTradingBotData = () => {
  return {
    status: 'active',
    strategy: 'arbitrage',
    performance: {
      totalTrades: 145,
      winRate: 73.1,
      totalPnL: 5250,
      dailyPnL: 320,
      drawdown: -2.1
    },
    activePositions: [
      {
        symbol: 'BTCUSDT',
        side: 'buy',
        size: 0.1,
        entryPrice: 42800,
        currentPrice: 43000,
        pnL: 20,
        duration: '2h 15m'
      }
    ],
    config: {
      maxPositions: 5,
      riskPerTrade: 2,
      exchanges: ['binance', 'hyperliquid']
    }
  };
};

// Mock ordinals data
export const createMockOrdinalsData = () => {
  return {
    results: [
      {
        id: 'mock_inscription_1',
        number: 12345678,
        content_type: 'image/png',
        content_length: 15420,
        genesis_height: 840000,
        genesis_fee: 10000,
        genesis_timestamp: Date.now() - 86400000,
        value: 546,
        sat_ordinal: 1234567890123456,
        sat_rarity: 'common',
        content_url: 'https://api.hiro.so/ordinals/v1/inscriptions/mock_inscription_1/content'
      },
      {
        id: 'mock_inscription_2',
        number: 12345679,
        content_type: 'text/plain',
        content_length: 256,
        genesis_height: 840100,
        genesis_fee: 5000,
        genesis_timestamp: Date.now() - 43200000,
        value: 546,
        sat_ordinal: 1234567890123457,
        sat_rarity: 'uncommon',
        content_url: 'https://api.hiro.so/ordinals/v1/inscriptions/mock_inscription_2/content'
      }
    ],
    total: 2,
    offset: 0,
    limit: 20
  };
};

// Mock runes data
export const createMockRunesData = () => {
  return {
    results: [
      {
        id: 'mock_rune_1',
        name: 'CYPHER•ORDi•FUTURE',
        symbol: 'COF',
        decimals: 8,
        premine: '1000000000000000',
        total_supply: '21000000000000000',
        total_mints: 15420,
        etching: {
          block_height: 840000,
          tx_id: 'mock_tx_1',
          etcher: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
        },
        mint_terms: {
          amount: '100000000',
          cap: '210000',
          start_height: 840000,
          end_height: 1000000
        }
      },
      {
        id: 'mock_rune_2',
        name: 'BITCOIN•RUNES•TOKEN',
        symbol: 'BRT',
        decimals: 2,
        premine: '500000000',
        total_supply: '10000000000',
        total_mints: 8750,
        etching: {
          block_height: 840500,
          tx_id: 'mock_tx_2',
          etcher: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
        }
      }
    ],
    total: 2,
    offset: 0,
    limit: 20
  };
};

// Mock arbitrage opportunities
export const createMockArbitrageData = () => {
  return [
    {
      symbol: 'BTCUSDT',
      buyExchange: 'binance',
      sellExchange: 'hyperliquid',
      buyPrice: 42980,
      sellPrice: 43150,
      spread: 170,
      spreadPercent: 0.395,
      volume24h: 15000000,
      opportunity: 'profitable'
    },
    {
      symbol: 'ETHUSDT', 
      buyExchange: 'hyperliquid',
      sellExchange: 'binance',
      buyPrice: 2598,
      sellPrice: 2605,
      spread: 7,
      spreadPercent: 0.269,
      volume24h: 8000000,
      opportunity: 'marginal'
    }
  ];
};

// Test utilities for async operations
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const startTime = Date.now();
  
  while (!condition() && Date.now() - startTime < timeout) {
    await waitFor(interval);
  }
  
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
};

// Mock fetch for testing
export const createMockFetch = (responses: Record<string, any>) => {
  return jest.fn().mockImplementation((url: string) => {
    const response = responses[url];
    
    if (!response) {
      return Promise.reject(new Error(`No mock response defined for ${url}`));
    }
    
    return Promise.resolve({
      ok: response.status >= 200 && response.status < 300,
      status: response.status || 200,
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(JSON.stringify(response.data))
    });
  });
};

// Error boundary test helper
export const triggerErrorBoundary = (component: any, error: Error) => {
  const originalConsoleError = console.error;
  console.error = jest.fn();
  
  try {
    component.instance().componentDidCatch(error, { componentStack: 'mock stack' });
  } finally {
    console.error = originalConsoleError;
  }
};

// Named export for mockFetch
export const mockFetch = createMockFetch;

export default {
  mockApiResponse,
  mockError,
  mockApiError,
  createMockWalletData,
  createMockMarketData,
  createMockPortfolioData,
  createMockTradingBotData,
  createMockOrdinalsData,
  createMockRunesData,
  createMockArbitrageData,
  waitFor,
  waitForCondition,
  createMockFetch,
  mockFetch,
  triggerErrorBoundary
};