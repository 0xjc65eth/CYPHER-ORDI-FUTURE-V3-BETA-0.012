export { default as ExchangeConnector } from './ExchangeConnector';
export { default as BinanceConnector } from './BinanceConnector';
export { default as CoinbaseConnector } from './CoinbaseConnector';
export { default as KrakenConnector } from './KrakenConnector';
export { default as OKXConnector } from './OKXConnector';
export { default as CoinAPIConnector } from './CoinAPIConnector';

export type {
  OrderResult,
  PriceData,
  OrderBookData,
  TickerData
} from './ExchangeConnector';

import { ExchangeConnector } from './ExchangeConnector';
import BinanceConnector from './BinanceConnector';
import CoinbaseConnector from './CoinbaseConnector';
import KrakenConnector from './KrakenConnector';
import OKXConnector from './OKXConnector';
import CoinAPIConnector from './CoinAPIConnector';
import { logger } from '../utils/logger';

export interface ExchangeCredentials {
  binance?: {
    apiKey: string;
    apiSecret: string;
    sandbox?: boolean;
  };
  coinbase?: {
    apiKey: string;
    apiSecret: string;
    passphrase: string;
    sandbox?: boolean;
  };
  kraken?: {
    apiKey: string;
    apiSecret: string;
    sandbox?: boolean;
  };
  okx?: {
    apiKey: string;
    apiSecret: string;
    passphrase: string;
    sandbox?: boolean;
  };
  coinapi?: {
    apiKey: string;
    sandbox?: boolean;
  };
}

export class ExchangeFactory {
  private static instances: Map<string, ExchangeConnector> = new Map();

  static createExchange(
    exchangeName: string,
    credentials?: any
  ): ExchangeConnector {
    const key = `${exchangeName}_${JSON.stringify(credentials)}`;
    
    if (this.instances.has(key)) {
      return this.instances.get(key)!;
    }

    let connector: ExchangeConnector;

    switch (exchangeName.toLowerCase()) {
      case 'binance':
        connector = new BinanceConnector(credentials);
        break;
      case 'coinbase':
        connector = new CoinbaseConnector(credentials);
        break;
      case 'kraken':
        connector = new KrakenConnector(credentials);
        break;
      case 'okx':
        connector = new OKXConnector(credentials);
        break;
      case 'coinapi':
        connector = new CoinAPIConnector(credentials);
        break;
      default:
        throw new Error(`Unsupported exchange: ${exchangeName}`);
    }

    this.instances.set(key, connector);
    return connector;
  }

  static createMultipleExchanges(
    credentials: ExchangeCredentials
  ): ExchangeConnector[] {
    const connectors: ExchangeConnector[] = [];

    // Create Binance connector if credentials provided
    if (credentials.binance) {
      try {
        connectors.push(this.createExchange('binance', credentials.binance));
        logger.info('Created Binance connector');
      } catch (error) {
        logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to create Binance connector:');
      }
    }

    // Create Coinbase connector if credentials provided
    if (credentials.coinbase) {
      try {
        connectors.push(this.createExchange('coinbase', credentials.coinbase));
        logger.info('Created Coinbase connector');
      } catch (error) {
        logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to create Coinbase connector:');
      }
    }

    // Create Kraken connector if credentials provided
    if (credentials.kraken) {
      try {
        connectors.push(this.createExchange('kraken', credentials.kraken));
        logger.info('Created Kraken connector');
      } catch (error) {
        logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to create Kraken connector:');
      }
    }

    // Create OKX connector if credentials provided
    if (credentials.okx) {
      try {
        connectors.push(this.createExchange('okx', credentials.okx));
        logger.info('Created OKX connector');
      } catch (error) {
        logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to create OKX connector:');
      }
    }

    // Create CoinAPI connector if credentials provided
    if (credentials.coinapi) {
      try {
        connectors.push(this.createExchange('coinapi', credentials.coinapi));
        logger.info('Created CoinAPI connector');
      } catch (error) {
        logger.error(error instanceof Error ? error : new Error(String(error)), 'Failed to create CoinAPI connector:');
      }
    }

    return connectors;
  }

  static getSupportedExchanges(): string[] {
    return ['binance', 'coinbase', 'kraken', 'okx', 'coinapi'];
  }

  static async connectAll(connectors: ExchangeConnector[]): Promise<void> {
    const connectionPromises = connectors.map(async (connector) => {
      try {
        await connector.connect();
        logger.info(`Successfully connected to ${connector.getName()}`);
      } catch (error) {
        logger.error(`Failed to connect to ${connector.getName()}:`, error);
      }
    });

    await Promise.allSettled(connectionPromises);
  }

  static async disconnectAll(connectors: ExchangeConnector[]): Promise<void> {
    const disconnectionPromises = connectors.map(async (connector) => {
      try {
        await connector.disconnect();
        logger.info(`Successfully disconnected from ${connector.getName()}`);
      } catch (error) {
        logger.error(`Failed to disconnect from ${connector.getName()}:`, error);
      }
    });

    await Promise.allSettled(disconnectionPromises);
  }

  static clearInstances(): void {
    this.instances.clear();
  }

  static getInstance(exchangeName: string): ExchangeConnector | undefined {
    for (const [key, instance] of this.instances.entries()) {
      if (key.startsWith(exchangeName)) {
        return instance;
      }
    }
    return undefined;
  }

  static getAllInstances(): ExchangeConnector[] {
    return Array.from(this.instances.values());
  }

  static getInstancesStatus(): any {
    const status: any = {};
    
    for (const [key, instance] of this.instances.entries()) {
      const exchangeName = instance.getName();
      status[exchangeName] = instance.getStatus();
    }
    
    return status;
  }
}

// Utility functions for exchange management
export const exchangeUtils = {
  /**
   * Get the common trading pairs across all exchanges
   */
  async getCommonTradingPairs(connectors: ExchangeConnector[]): Promise<string[]> {
    try {
      const symbolSets = await Promise.all(
        connectors.map(connector => connector.getSymbols())
      );
      
      if (symbolSets.length === 0) return [];
      
      // Find intersection of all symbol sets
      let commonSymbols = new Set(symbolSets[0]);
      
      for (let i = 1; i < symbolSets.length; i++) {
        const currentSet = new Set(symbolSets[i]);
        commonSymbols = new Set(
          [...commonSymbols].filter(symbol => currentSet.has(symbol))
        );
      }
      
      return Array.from(commonSymbols);
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error getting common trading pairs:');
      return [];
    }
  },

  /**
   * Get the best bid/ask prices across all exchanges for a symbol
   */
  async getBestPrices(
    connectors: ExchangeConnector[],
    symbol: string
  ): Promise<{
    bestBid: { exchange: string; price: number; } | null;
    bestAsk: { exchange: string; price: number; } | null;
  }> {
    try {
      const tickerPromises = connectors.map(async connector => {
        try {
          const ticker = await connector.getTicker(symbol);
          return {
            exchange: connector.getName(),
            ticker
          };
        } catch (error) {
          return null;
        }
      });
      
      const results = await Promise.allSettled(tickerPromises);
      const validTickers = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      if (validTickers.length === 0) {
        return { bestBid: null, bestAsk: null };
      }
      
      // Find best bid (highest) and best ask (lowest)
      let bestBid = { exchange: '', price: 0 };
      let bestAsk = { exchange: '', price: Infinity };
      
      validTickers.forEach(({ exchange, ticker }) => {
        // For best bid, we want the highest price
        if (ticker.price > bestBid.price) {
          bestBid = { exchange, price: ticker.price };
        }
        
        // For best ask, we want the lowest price
        if (ticker.price < bestAsk.price) {
          bestAsk = { exchange, price: ticker.price };
        }
      });
      
      return {
        bestBid: bestBid.price > 0 ? bestBid : null,
        bestAsk: bestAsk.price < Infinity ? bestAsk : null
      };
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error getting best prices:');
      return { bestBid: null, bestAsk: null };
    }
  },

  /**
   * Calculate spreads between exchanges for a symbol
   */
  async calculateSpreads(
    connectors: ExchangeConnector[],
    symbol: string
  ): Promise<Array<{
    buyExchange: string;
    sellExchange: string;
    spread: number;
    spreadPercentage: number;
  }>> {
    try {
      const tickerPromises = connectors.map(async connector => {
        try {
          const ticker = await connector.getTicker(symbol);
          return {
            exchange: connector.getName(),
            price: ticker.price
          };
        } catch (error) {
          return null;
        }
      });
      
      const results = await Promise.allSettled(tickerPromises);
      const validPrices = results
        .filter((result): result is PromiseFulfilledResult<any> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
      
      const spreads: Array<{
        buyExchange: string;
        sellExchange: string;
        spread: number;
        spreadPercentage: number;
      }> = [];
      
      // Calculate spreads between all exchange pairs
      for (let i = 0; i < validPrices.length; i++) {
        for (let j = i + 1; j < validPrices.length; j++) {
          const price1 = validPrices[i];
          const price2 = validPrices[j];
          
          // Calculate spread in both directions
          if (price1.price < price2.price) {
            const spread = price2.price - price1.price;
            const spreadPercentage = (spread / price1.price) * 100;
            
            spreads.push({
              buyExchange: price1.exchange,
              sellExchange: price2.exchange,
              spread,
              spreadPercentage
            });
          } else if (price2.price < price1.price) {
            const spread = price1.price - price2.price;
            const spreadPercentage = (spread / price2.price) * 100;
            
            spreads.push({
              buyExchange: price2.exchange,
              sellExchange: price1.exchange,
              spread,
              spreadPercentage
            });
          }
        }
      }
      
      // Sort by spread percentage (highest first)
      return spreads.sort((a, b) => b.spreadPercentage - a.spreadPercentage);
      
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), 'Error calculating spreads:');
      return [];
    }
  }
};

export default ExchangeFactory;