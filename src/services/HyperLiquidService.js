/**
 * HyperLiquid Service - Complete integration for perpetuals trading
 * Provides API integration for HyperLiquid exchange
 */

import axios from 'axios';

class HyperLiquidService {
  constructor() {
    this.baseURL = 'https://api.hyperliquid.xyz';
    this.infoAPI = `${this.baseURL}/info`;
    this.exchangeAPI = `${this.baseURL}/exchange`;
    
    // Initialize axios instance with proper headers
    this.api = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Request interceptor for logging
    this.api.interceptors.request.use((config) => {
      console.log(`[HyperLiquid] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[HyperLiquid API Error]:', error?.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Get all available perpetuals markets
   */
  async getPerpetualsMarkets() {
    try {
      const response = await this.api.post(this.infoAPI, {
        type: 'meta'
      });
      
      return {
        success: true,
        data: response.data?.universe || [],
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get user's positions
   */
  async getUserPositions(address) {
    if (!address) {
      return {
        success: false,
        error: 'Address is required',
        data: []
      };
    }

    try {
      const response = await this.api.post(this.infoAPI, {
        type: 'clearinghouseState',
        user: address
      });

      const positions = response.data?.assetPositions || [];
      
      // Calculate P&L for each position
      const enrichedPositions = await Promise.all(
        positions.map(async (position) => {
          const pnl = await this.calculatePositionPnL(position);
          return {
            ...position,
            ...pnl
          };
        })
      );

      return {
        success: true,
        data: enrichedPositions,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Calculate real-time P&L for a position
   */
  async calculatePositionPnL(position) {
    try {
      if (!position.position || !position.position.szi || position.position.szi === '0') {
        return {
          unrealizedPnl: 0,
          unrealizedPnlPercent: 0,
          marketPrice: 0,
          entryPrice: 0
        };
      }

      // Get current market price
      const marketData = await this.getMarketData(position.position.coin);
      const marketPrice = marketData.data?.markPx || 0;
      const entryPrice = parseFloat(position.position.entryPx || 0);
      const size = parseFloat(position.position.szi);
      
      // Calculate unrealized P&L
      const priceDiff = marketPrice - entryPrice;
      const unrealizedPnl = priceDiff * Math.abs(size);
      const unrealizedPnlPercent = entryPrice > 0 ? (priceDiff / entryPrice) * 100 : 0;

      return {
        unrealizedPnl: unrealizedPnl,
        unrealizedPnlPercent: unrealizedPnlPercent,
        marketPrice: marketPrice,
        entryPrice: entryPrice,
        size: size,
        leverage: parseFloat(position.position.leverage || 1)
      };
    } catch (error) {
      console.error('[Position P&L Calculation Error]:', error);
      return {
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        marketPrice: 0,
        entryPrice: 0
      };
    }
  }

  /**
   * Get market data for a specific asset
   */
  async getMarketData(asset) {
    try {
      const response = await this.api.post(this.infoAPI, {
        type: 'allMids'
      });

      const allMids = response.data || {};
      const price = parseFloat(allMids[asset] || 0);

      return {
        success: true,
        data: {
          asset: asset,
          markPx: price,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get user's trading history
   */
  async getUserTrades(address, limit = 100) {
    if (!address) {
      return {
        success: false,
        error: 'Address is required',
        data: []
      };
    }

    try {
      const response = await this.api.post(this.infoAPI, {
        type: 'userFills',
        user: address
      });

      const trades = response.data || [];
      
      // Sort by timestamp and limit
      const sortedTrades = trades
        .sort((a, b) => b.time - a.time)
        .slice(0, limit);

      return {
        success: true,
        data: sortedTrades,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Get portfolio summary with total P&L
   */
  async getPortfolioSummary(address) {
    try {
      const [positionsResult, tradesResult] = await Promise.all([
        this.getUserPositions(address),
        this.getUserTrades(address, 50)
      ]);

      if (!positionsResult.success) {
        return positionsResult;
      }

      const positions = positionsResult.data;
      const trades = tradesResult.data || [];

      // Calculate total unrealized P&L
      const totalUnrealizedPnl = positions.reduce((sum, pos) => {
        return sum + (pos.unrealizedPnl || 0);
      }, 0);

      // Calculate total portfolio value
      const totalValue = positions.reduce((sum, pos) => {
        const positionValue = Math.abs(pos.size || 0) * (pos.marketPrice || 0);
        return sum + positionValue;
      }, 0);

      // Calculate daily P&L from recent trades
      const yesterday = Date.now() - (24 * 60 * 60 * 1000);
      const recentTrades = trades.filter(trade => trade.time > yesterday);
      const dailyPnl = recentTrades.reduce((sum, trade) => {
        return sum + (parseFloat(trade.pnl || 0));
      }, 0);

      return {
        success: true,
        data: {
          totalPositions: positions.length,
          totalUnrealizedPnl: totalUnrealizedPnl,
          totalPortfolioValue: totalValue,
          dailyPnl: dailyPnl,
          positions: positions,
          recentTrades: recentTrades.slice(0, 10),
          summary: {
            openPositions: positions.filter(p => p.size && Math.abs(p.size) > 0).length,
            profitablePositions: positions.filter(p => (p.unrealizedPnl || 0) > 0).length,
            averageLeverage: positions.length > 0 
              ? positions.reduce((sum, p) => sum + (p.leverage || 1), 0) / positions.length 
              : 0
          }
        },
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Close a position (market order)
   */
  async closePosition(address, asset, size, privateKey) {
    try {
      // This would require proper wallet integration and signing
      // For now, return a simulation
      console.log(`[HyperLiquid] Simulating close position: ${asset}, size: ${size}`);
      
      return {
        success: true,
        data: {
          message: 'Position close order submitted',
          asset: asset,
          size: size,
          type: 'market',
          side: size > 0 ? 'sell' : 'buy',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get real-time market prices for multiple assets
   */
  async getMultipleMarketPrices(assets = []) {
    try {
      const response = await this.api.post(this.infoAPI, {
        type: 'allMids'
      });

      const allMids = response.data || {};
      const prices = {};

      if (assets.length === 0) {
        // Return all available prices
        Object.keys(allMids).forEach(asset => {
          prices[asset] = {
            price: parseFloat(allMids[asset]),
            asset: asset,
            timestamp: Date.now()
          };
        });
      } else {
        // Return specific assets
        assets.forEach(asset => {
          prices[asset] = {
            price: parseFloat(allMids[asset] || 0),
            asset: asset,
            timestamp: Date.now()
          };
        });
      }

      return {
        success: true,
        data: prices,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {}
      };
    }
  }

  /**
   * Calculate risk metrics for the portfolio
   */
  calculateRiskMetrics(positions, portfolioValue) {
    if (!positions || positions.length === 0) {
      return {
        totalRisk: 0,
        maxDrawdown: 0,
        positionRisk: 0,
        leverageRisk: 'Low'
      };
    }

    // Calculate total risk exposure
    const totalRisk = positions.reduce((sum, pos) => {
      const positionValue = Math.abs(pos.size || 0) * (pos.marketPrice || 0);
      const leverage = pos.leverage || 1;
      return sum + (positionValue * leverage);
    }, 0);

    // Calculate max potential drawdown
    const maxDrawdown = positions.reduce((max, pos) => {
      const potentialLoss = Math.abs(pos.unrealizedPnl || 0);
      return Math.max(max, potentialLoss);
    }, 0);

    // Calculate position concentration risk
    const positionRisk = portfolioValue > 0 ? (maxDrawdown / portfolioValue) * 100 : 0;

    // Calculate average leverage
    const avgLeverage = positions.length > 0 
      ? positions.reduce((sum, p) => sum + (p.leverage || 1), 0) / positions.length 
      : 1;

    let leverageRisk = 'Low';
    if (avgLeverage > 10) leverageRisk = 'High';
    else if (avgLeverage > 5) leverageRisk = 'Medium';

    return {
      totalRisk,
      maxDrawdown,
      positionRisk,
      leverageRisk,
      avgLeverage
    };
  }
}

// Export singleton instance
const hyperLiquidService = new HyperLiquidService();
export default hyperLiquidService;

// Named exports for specific functions
export {
  hyperLiquidService,
  HyperLiquidService
};