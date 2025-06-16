'use client';

// Hyperliquid API Integration for Perpetuals Trading
export interface HyperliquidMarket {
  coin: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated: boolean;
}

export interface HyperliquidPosition {
  coin: string;
  leverage: {
    type: 'cross' | 'isolated';
    value: number;
  };
  positionValue: string;
  unrealizedPnl: string;
  side: 'long' | 'short';
  szi: string;
  entryPx: string;
  returnOnEquity: string;
  marginUsed: string;
}

export interface HyperliquidOrder {
  coin: string;
  side: 'B' | 'A'; // Buy or Ask (Sell)
  sz: string;
  limitPx: string;
  orderType: 'Limit' | 'Market';
  reduceOnly: boolean;
  timeInForce: 'Gtc' | 'Ioc' | 'Alo';
}

export interface HyperliquidTicker {
  coin: string;
  px: string;
  dayChange: string;
  prevDayPx: string;
  volume: string;
  openInterest: string;
  funding: string;
  markPx: string;
}

class HyperliquidAPI {
  private baseURL: string;
  private infoURL: string;

  constructor() {
    this.baseURL = 'https://api.hyperliquid.xyz';
    this.infoURL = 'https://api.hyperliquid.xyz/info';
  }

  // Get all available markets
  async getMarkets(): Promise<HyperliquidMarket[]> {
    try {
      const response = await fetch(`${this.infoURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'meta',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }

      const data = await response.json();
      return data.universe || [];
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
    }
  }

  // Get market tickers
  async getTickers(): Promise<HyperliquidTicker[]> {
    try {
      const response = await fetch(`${this.infoURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'allMids',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickers');
      }

      const data = await response.json();
      
      // Transform the data to match our interface
      const markets = await this.getMarkets();
      return markets.map((market, index) => ({
        coin: market.coin,
        px: data[index] || '0',
        dayChange: '0', // Would need additional API call for 24h data
        prevDayPx: '0',
        volume: '0',
        openInterest: '0',
        funding: '0',
        markPx: data[index] || '0'
      }));
    } catch (error) {
      console.error('Error fetching tickers:', error);
      return [];
    }
  }

  // Get user positions (requires wallet connection)
  async getUserPositions(address: string): Promise<HyperliquidPosition[]> {
    try {
      const response = await fetch(`${this.infoURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }

      const data = await response.json();
      return data.assetPositions || [];
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  // Get order book for a market
  async getOrderBook(coin: string) {
    try {
      const response = await fetch(`${this.infoURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'l2Book',
          coin: coin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order book');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order book:', error);
      return null;
    }
  }

  // Get user's open orders
  async getOpenOrders(address: string) {
    try {
      const response = await fetch(`${this.infoURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'openOrders',
          user: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch open orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching open orders:', error);
      return [];
    }
  }

  // Generate trading deep link to Hyperliquid
  generateTradingLink(
    coin: string,
    side: 'long' | 'short',
    size?: string,
    leverage?: number,
    userAddress?: string
  ): string {
    let url = `https://app.hyperliquid.xyz/trade/${coin}`;
    
    const params = new URLSearchParams();
    
    if (side) params.append('side', side);
    if (size) params.append('size', size);
    if (leverage) params.append('leverage', leverage.toString());
    if (userAddress) params.append('user', userAddress);
    
    // Add our referral fee (if supported)
    params.append('ref', 'cypher-ordi-future');
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  // Get trading fees structure
  getTradingFees() {
    return {
      maker: 0.0002, // 0.02%
      taker: 0.0005, // 0.05%
      liquidation: 0.005, // 0.5%
      referralDiscount: 0.1 // 10% discount with referral
    };
  }

  // Get popular trading pairs
  getPopularPairs(): string[] {
    return [
      'BTC',
      'ETH',
      'SOL',
      'AVAX',
      'DOGE',
      'MATIC',
      'ARB',
      'OP',
      'SUI',
      'APT',
      'TIA',
      'WIF',
      'PEPE',
      'BONK',
      'ORDI',
      'SEI',
      'JTO',
      'PYTH',
      'JUP',
      'WEN'
    ];
  }

  // Format position data for display
  formatPosition(position: HyperliquidPosition) {
    return {
      symbol: position.coin,
      side: position.side,
      size: parseFloat(position.szi),
      entryPrice: parseFloat(position.entryPx),
      markPrice: 0, // Would need current market price
      pnl: parseFloat(position.unrealizedPnl),
      pnlPercentage: parseFloat(position.returnOnEquity) * 100,
      margin: parseFloat(position.marginUsed),
      leverage: position.leverage.value,
      leverageType: position.leverage.type
    };
  }

  // Calculate position metrics
  calculatePositionMetrics(
    entryPrice: number,
    currentPrice: number,
    size: number,
    side: 'long' | 'short',
    leverage: number
  ) {
    const isLong = side === 'long';
    const priceChange = currentPrice - entryPrice;
    const pnl = isLong ? priceChange * size : -priceChange * size;
    const pnlPercentage = (pnl / (entryPrice * size)) * 100 * leverage;
    const liquidationPrice = isLong 
      ? entryPrice * (1 - 0.9 / leverage)
      : entryPrice * (1 + 0.9 / leverage);

    return {
      pnl,
      pnlPercentage,
      liquidationPrice,
      margin: (entryPrice * size) / leverage
    };
  }
}

// React hook for Hyperliquid integration
export function useHyperliquid() {
  const api = new HyperliquidAPI();

  const openTrade = (
    coin: string,
    side: 'long' | 'short',
    size?: string,
    leverage?: number,
    userAddress?: string
  ) => {
    const tradingLink = api.generateTradingLink(coin, side, size, leverage, userAddress);
    window.open(tradingLink, '_blank');
  };

  return {
    api,
    openTrade,
    getMarkets: api.getMarkets.bind(api),
    getTickers: api.getTickers.bind(api),
    getUserPositions: api.getUserPositions.bind(api),
    getOrderBook: api.getOrderBook.bind(api),
    getOpenOrders: api.getOpenOrders.bind(api),
    getPopularPairs: api.getPopularPairs.bind(api),
    formatPosition: api.formatPosition.bind(api),
    calculatePositionMetrics: api.calculatePositionMetrics.bind(api),
    getTradingFees: api.getTradingFees.bind(api)
  };
}

export default HyperliquidAPI;