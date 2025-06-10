/**
 * ArbitrageEngine - Cross-DEX Arbitrage Detection and Execution
 * Scans multiple DEXs for price differences and executes profitable trades
 */

import EventEmitter from 'events';

export class ArbitrageEngine extends EventEmitter {
  constructor() {
    super();
    this.isScanning = false;
    this.opportunities = new Map();
    this.priceFeeds = new Map();
    this.gasTracker = new Map();
    this.liquidityCache = new Map();
    
    this.config = {
      minProfitThreshold: 0.003, // 0.3% minimum profit
      maxSlippage: 0.005, // 0.5% max slippage
      gasBuffer: 1.5, // 50% gas buffer
      liquidityThreshold: 50000, // $50k minimum liquidity
      maxTradeSize: 10000, // $10k max trade size
      scanInterval: 5000, // 5 seconds
      priceValidityDuration: 30000, // 30 seconds
      maxConcurrentTrades: 3
    };

    this.dexConfigs = {
      uniswapV3: {
        name: 'Uniswap V3',
        baseUrl: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
        gasEstimate: 150000,
        feeRate: 0.003,
        enabled: true
      },
      sushiswap: {
        name: 'SushiSwap',
        baseUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
        gasEstimate: 120000,
        feeRate: 0.003,
        enabled: true
      },
      oneInch: {
        name: '1inch',
        baseUrl: 'https://api.1inch.io/v5.0/1',
        gasEstimate: 180000,
        feeRate: 0.002,
        enabled: true
      },
      balancer: {
        name: 'Balancer',
        baseUrl: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
        gasEstimate: 200000,
        feeRate: 0.0025,
        enabled: true
      },
      curve: {
        name: 'Curve',
        baseUrl: 'https://api.curve.fi',
        gasEstimate: 160000,
        feeRate: 0.004,
        enabled: true
      },
      dodo: {
        name: 'DODO',
        baseUrl: 'https://api.dodoex.io',
        gasEstimate: 140000,
        feeRate: 0.003,
        enabled: true
      }
    };

    this.monitoredPairs = [
      { base: 'WETH', quote: 'USDC', priority: 1 },
      { base: 'WBTC', quote: 'USDC', priority: 1 },
      { base: 'LINK', quote: 'USDC', priority: 2 },
      { base: 'UNI', quote: 'USDC', priority: 2 },
      { base: 'AAVE', quote: 'USDC', priority: 3 },
      { base: 'COMP', quote: 'USDC', priority: 3 },
      { base: 'MKR', quote: 'USDC', priority: 3 },
      { base: 'SNX', quote: 'USDC', priority: 3 },
      { base: 'WETH', quote: 'WBTC', priority: 2 },
      { base: 'WETH', quote: 'DAI', priority: 2 }
    ];

    this.performance = {
      totalScans: 0,
      opportunitiesFound: 0,
      tradesExecuted: 0,
      totalProfit: 0,
      avgProfitPerTrade: 0,
      successRate: 0,
      avgExecutionTime: 0
    };

    this.initializeConnections();
  }

  /**
   * Initialize DEX connections and price feeds
   */
  async initializeConnections() {
    try {
      // Initialize gas price tracker
      await this.initializeGasTracker();
      
      // Initialize price feeds for each DEX
      for (const [dexId, config] of Object.entries(this.dexConfigs)) {
        if (config.enabled) {
          await this.initializeDexConnection(dexId, config);
        }
      }

      this.emit('initialized', {
        message: 'Arbitrage engine initialized',
        enabledDexs: Object.keys(this.dexConfigs).filter(id => this.dexConfigs[id].enabled)
      });

    } catch (error) {
      console.error('Arbitrage engine initialization error:', error);
      this.emit('error', error);
    }
  }

  /**
   * Start scanning for arbitrage opportunities
   */
  async startScanning() {
    if (this.isScanning) {
      throw new Error('Scanner is already running');
    }

    this.isScanning = true;
    this.emit('scanningStarted', { timestamp: Date.now() });
    
    // Start main scanning loop
    this.scanLoop();
    
    console.log('🔍 Arbitrage scanning started');
  }

  /**
   * Stop scanning
   */
  stopScanning() {
    this.isScanning = false;
    this.emit('scanningStopped', { 
      timestamp: Date.now(),
      performance: this.performance
    });
    
    console.log('⏹️ Arbitrage scanning stopped');
  }

  /**
   * Main scanning loop
   */
  async scanLoop() {
    while (this.isScanning) {
      try {
        const startTime = Date.now();
        
        // Update gas prices
        await this.updateGasPrices();
        
        // Scan all monitored pairs
        const opportunities = await this.scanAllPairs();
        
        // Filter and rank opportunities
        const profitableOpportunities = this.filterOpportunities(opportunities);
        
        // Update opportunities map
        this.updateOpportunities(profitableOpportunities);
        
        // Execute best opportunities if any
        if (profitableOpportunities.length > 0) {
          await this.executeBestOpportunities(profitableOpportunities);
        }

        this.performance.totalScans++;
        const scanTime = Date.now() - startTime;
        
        this.emit('scanCompleted', {
          opportunities: profitableOpportunities,
          scanTime,
          totalOpportunities: opportunities.length,
          profitableOpportunities: profitableOpportunities.length
        });

        // Wait before next scan
        await this.sleep(this.config.scanInterval);

      } catch (error) {
        console.error('Scan loop error:', error);
        this.emit('scanError', error);
        await this.sleep(this.config.scanInterval * 2); // Wait longer on error
      }
    }
  }

  /**
   * Scan all monitored pairs for arbitrage opportunities
   */
  async scanAllPairs() {
    const allOpportunities = [];
    
    // Process pairs by priority
    const prioritizedPairs = this.monitoredPairs.sort((a, b) => a.priority - b.priority);
    
    for (const pair of prioritizedPairs) {
      try {
        const opportunities = await this.scanPair(pair);
        allOpportunities.push(...opportunities);
      } catch (error) {
        console.error(`Error scanning pair ${pair.base}/${pair.quote}:`, error);
      }
    }

    return allOpportunities;
  }

  /**
   * Scan a specific pair across all DEXs
   */
  async scanPair(pair) {
    const pairString = `${pair.base}/${pair.quote}`;
    const opportunities = [];
    
    try {
      // Get prices from all enabled DEXs
      const pricePromises = Object.entries(this.dexConfigs)
        .filter(([_, config]) => config.enabled)
        .map(([dexId, config]) => this.getPairPrice(dexId, pair));

      const priceResults = await Promise.allSettled(pricePromises);
      const validPrices = [];

      // Process price results
      priceResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          validPrices.push({
            dexId: Object.keys(this.dexConfigs)[index],
            ...result.value
          });
        }
      });

      if (validPrices.length < 2) {
        return opportunities;
      }

      // Find arbitrage opportunities
      for (let i = 0; i < validPrices.length; i++) {
        for (let j = i + 1; j < validPrices.length; j++) {
          const buyPrice = validPrices[i];
          const sellPrice = validPrices[j];
          
          // Check both directions
          const opp1 = this.calculateArbitrageOpportunity(pair, buyPrice, sellPrice);
          const opp2 = this.calculateArbitrageOpportunity(pair, sellPrice, buyPrice);
          
          if (opp1) opportunities.push(opp1);
          if (opp2) opportunities.push(opp2);
        }
      }

    } catch (error) {
      console.error(`Pair scanning error for ${pairString}:`, error);
    }

    return opportunities;
  }

  /**
   * Calculate arbitrage opportunity between two price sources
   */
  calculateArbitrageOpportunity(pair, buySource, sellSource) {
    const pairString = `${pair.base}/${pair.quote}`;
    
    if (!buySource.price || !sellSource.price || buySource.price >= sellSource.price) {
      return null;
    }

    const priceDiff = sellSource.price - buySource.price;
    const profitPercentage = priceDiff / buySource.price;
    
    // Calculate trade size based on available liquidity
    const maxTradeSize = Math.min(
      buySource.liquidity || this.config.maxTradeSize,
      sellSource.liquidity || this.config.maxTradeSize,
      this.config.maxTradeSize
    );

    // Estimate costs
    const buyGasCost = this.estimateGasCost(buySource.dexId);
    const sellGasCost = this.estimateGasCost(sellSource.dexId);
    const totalGasCost = buyGasCost + sellGasCost;
    
    const buyFee = buySource.price * maxTradeSize * this.dexConfigs[buySource.dexId].feeRate;
    const sellFee = sellSource.price * maxTradeSize * this.dexConfigs[sellSource.dexId].feeRate;
    const totalFees = buyFee + sellFee;
    
    const slippageCost = (buySource.price + sellSource.price) * maxTradeSize * this.config.maxSlippage;
    
    // Calculate net profit
    const grossProfit = priceDiff * maxTradeSize;
    const totalCosts = totalGasCost + totalFees + slippageCost;
    const netProfit = grossProfit - totalCosts;
    const netProfitPercentage = netProfit / (buySource.price * maxTradeSize);

    // Check if profitable
    if (netProfitPercentage < this.config.minProfitThreshold) {
      return null;
    }

    return {
      id: `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pair: pairString,
      buyDex: buySource.dexId,
      sellDex: sellSource.dexId,
      buyPrice: buySource.price,
      sellPrice: sellSource.price,
      priceDiff,
      profitPercentage,
      netProfitPercentage,
      maxTradeSize,
      grossProfit,
      netProfit,
      totalCosts,
      gasEstimate: (buyGasCost + sellGasCost) / 20, // Convert to gwei estimate
      confidence: this.calculateConfidence(buySource, sellSource),
      timestamp: Date.now(),
      expiresAt: Date.now() + this.config.priceValidityDuration,
      status: 'detected'
    };
  }

  /**
   * Calculate confidence score for an opportunity
   */
  calculateConfidence(buySource, sellSource) {
    let confidence = 0.5; // Base confidence
    
    // Liquidity factor
    const minLiquidity = Math.min(buySource.liquidity || 0, sellSource.liquidity || 0);
    if (minLiquidity > this.config.liquidityThreshold) {
      confidence += 0.2;
    }
    
    // Price age factor
    const maxAge = Math.max(
      Date.now() - (buySource.timestamp || Date.now()),
      Date.now() - (sellSource.timestamp || Date.now())
    );
    if (maxAge < 10000) { // Less than 10 seconds old
      confidence += 0.2;
    }
    
    // DEX reliability factor
    const reliableDexs = ['uniswapV3', 'sushiswap', 'oneInch'];
    if (reliableDexs.includes(buySource.dexId) && reliableDexs.includes(sellSource.dexId)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Filter opportunities based on profitability and risk
   */
  filterOpportunities(opportunities) {
    return opportunities
      .filter(opp => {
        // Check if still valid
        if (Date.now() > opp.expiresAt) return false;
        
        // Check minimum profit
        if (opp.netProfitPercentage < this.config.minProfitThreshold) return false;
        
        // Check minimum confidence
        if (opp.confidence < 0.6) return false;
        
        // Check liquidity
        if (opp.maxTradeSize < 1000) return false; // Minimum $1000 trade
        
        return true;
      })
      .sort((a, b) => b.netProfitPercentage - a.netProfitPercentage)
      .slice(0, 10); // Top 10 opportunities
  }

  /**
   * Execute best arbitrage opportunities
   */
  async executeBestOpportunities(opportunities) {
    const activeTrades = Array.from(this.opportunities.values())
      .filter(opp => opp.status === 'executing').length;
    
    if (activeTrades >= this.config.maxConcurrentTrades) {
      return;
    }

    const toExecute = opportunities
      .slice(0, this.config.maxConcurrentTrades - activeTrades)
      .filter(opp => opp.netProfitPercentage > 0.01); // Only execute if >1% profit

    for (const opportunity of toExecute) {
      try {
        await this.executeArbitrage(opportunity);
      } catch (error) {
        console.error('Arbitrage execution error:', error);
      }
    }
  }

  /**
   * Execute a single arbitrage opportunity
   */
  async executeArbitrage(opportunity) {
    try {
      this.emit('arbitrageStarted', opportunity);
      
      // Update status
      opportunity.status = 'executing';
      opportunity.executionStartTime = Date.now();
      this.opportunities.set(opportunity.id, opportunity);

      // Simulate execution (replace with actual DEX integration)
      const result = await this.simulateArbitrageExecution(opportunity);
      
      // Update opportunity with result
      opportunity.status = result.success ? 'completed' : 'failed';
      opportunity.executionEndTime = Date.now();
      opportunity.actualProfit = result.actualProfit || 0;
      opportunity.executionTime = opportunity.executionEndTime - opportunity.executionStartTime;

      // Update performance metrics
      this.updatePerformanceMetrics(opportunity);

      this.emit('arbitrageCompleted', opportunity);
      
      return result;

    } catch (error) {
      opportunity.status = 'failed';
      opportunity.error = error.message;
      this.emit('arbitrageError', { opportunity, error });
      throw error;
    }
  }

  /**
   * Simulate arbitrage execution (replace with real DEX calls)
   */
  async simulateArbitrageExecution(opportunity) {
    // Simulate network delay
    await this.sleep(2000 + Math.random() * 3000);
    
    // Simulate success/failure (90% success rate for simulation)
    const success = Math.random() > 0.1;
    
    if (success) {
      // Simulate some slippage and variation in actual profit
      const slippageFactor = 1 - (Math.random() * this.config.maxSlippage);
      const actualProfit = opportunity.netProfit * slippageFactor;
      
      return {
        success: true,
        actualProfit,
        buyTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        sellTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        executionTime: Date.now()
      };
    } else {
      return {
        success: false,
        error: 'Transaction failed or insufficient liquidity',
        actualProfit: -50 // Gas cost
      };
    }
  }

  /**
   * Get price for a pair from a specific DEX
   */
  async getPairPrice(dexId, pair) {
    try {
      // This would integrate with actual DEX APIs
      // For now, returning simulated data
      
      const basePrice = this.getBasePrice(pair.base);
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const price = basePrice * (1 + variation);
      
      return {
        price,
        liquidity: 100000 + Math.random() * 1000000, // $100k - $1.1M
        timestamp: Date.now(),
        volume24h: Math.random() * 10000000 // Random 24h volume
      };
      
    } catch (error) {
      console.error(`Error getting price from ${dexId} for ${pair.base}/${pair.quote}:`, error);
      return null;
    }
  }

  /**
   * Get base price for a token (simplified)
   */
  getBasePrice(token) {
    const basePrices = {
      'WETH': 2500,
      'WBTC': 45000,
      'LINK': 15,
      'UNI': 8,
      'AAVE': 120,
      'COMP': 80,
      'MKR': 1200,
      'SNX': 3,
      'USDC': 1,
      'DAI': 1
    };
    
    return basePrices[token] || 100;
  }

  /**
   * Helper methods
   */
  
  async initializeGasTracker() {
    // Initialize gas price tracking
    this.gasTracker.set('standard', 20);
    this.gasTracker.set('fast', 30);
    this.gasTracker.set('fastest', 50);
  }

  async initializeDexConnection(dexId, config) {
    // Initialize connection to DEX
    console.log(`Initializing connection to ${config.name}`);
  }

  async updateGasPrices() {
    // Update current gas prices
    const gasPrice = 20 + Math.random() * 30; // 20-50 gwei
    this.gasTracker.set('current', gasPrice);
  }

  estimateGasCost(dexId) {
    const gasPrice = this.gasTracker.get('current') || 25;
    const gasLimit = this.dexConfigs[dexId]?.gasEstimate || 150000;
    return (gasPrice * gasLimit * 1e-9) * 2000; // Estimate in USD
  }

  updateOpportunities(opportunities) {
    // Remove expired opportunities
    for (const [id, opp] of this.opportunities) {
      if (Date.now() > opp.expiresAt) {
        this.opportunities.delete(id);
      }
    }
    
    // Add new opportunities
    opportunities.forEach(opp => {
      this.opportunities.set(opp.id, opp);
    });
  }

  updatePerformanceMetrics(opportunity) {
    this.performance.tradesExecuted++;
    
    if (opportunity.status === 'completed' && opportunity.actualProfit > 0) {
      this.performance.totalProfit += opportunity.actualProfit;
      this.performance.opportunitiesFound++;
    }
    
    this.performance.avgProfitPerTrade = this.performance.totalProfit / this.performance.tradesExecuted;
    this.performance.successRate = this.performance.opportunitiesFound / this.performance.tradesExecuted;
    
    if (opportunity.executionTime) {
      this.performance.avgExecutionTime = 
        (this.performance.avgExecutionTime + opportunity.executionTime) / 2;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  getOpportunities() {
    return Array.from(this.opportunities.values());
  }

  getPerformance() {
    return { ...this.performance };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  getDexStatus() {
    const status = {};
    Object.entries(this.dexConfigs).forEach(([dexId, config]) => {
      status[dexId] = {
        name: config.name,
        enabled: config.enabled,
        gasEstimate: config.gasEstimate,
        feeRate: config.feeRate,
        lastUpdate: Date.now()
      };
    });
    return status;
  }
}

// Export singleton instance
export const arbitrageEngine = new ArbitrageEngine();
export default arbitrageEngine;