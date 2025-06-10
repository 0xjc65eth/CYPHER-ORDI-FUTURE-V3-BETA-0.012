/**
 * Backtesting Engine para CYPHER ORDI FUTURE
 * Permite testar estratégias com dados históricos
 */

import { EventEmitter } from 'events';

export interface BacktestConfig {
  startDate: Date;
  endDate: Date;
  initialBalance: number;
  maxDrawdown: number;
  commission: number;
  slippage: number;
}

export interface BacktestResult {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
}

export interface Trade {
  id: string;
  timestamp: Date;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  commission: number;
  profit?: number;
}

export class BacktestingEngine extends EventEmitter {
  private config: BacktestConfig;
  private balance: number;
  private trades: Trade[] = [];
  private positions: Map<string, any> = new Map();
  private isRunning: boolean = false;

  constructor(config: BacktestConfig) {
    super();
    this.config = config;
    this.balance = config.initialBalance;
  }

  async runBacktest(
    strategy: (data: any) => Promise<'BUY' | 'SELL' | 'HOLD'>,
    historicalData: any[]
  ): Promise<BacktestResult> {
    this.isRunning = true;
    this.emit('backtest:start', { config: this.config });

    try {
      // Reset state
      this.balance = this.config.initialBalance;
      this.trades = [];
      this.positions.clear();

      // Process historical data
      for (const candle of historicalData) {
        const signal = await strategy(candle);
        
        if (signal === 'BUY') {
          await this.executeBuy(candle);
        } else if (signal === 'SELL') {
          await this.executeSell(candle);
        }

        // Check stop conditions
        if (this.checkDrawdown()) {
          this.emit('backtest:stopped', { reason: 'max_drawdown' });
          break;
        }

        this.emit('backtest:progress', {
          timestamp: candle.timestamp,
          balance: this.balance,
          positions: this.positions.size
        });
      }

      const results = this.calculateResults();
      this.emit('backtest:complete', results);
      return results;

    } catch (error) {
      this.emit('backtest:error', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private async executeBuy(candle: any): Promise<void> {
    const price = candle.close * (1 + this.config.slippage);
    const commission = candle.close * this.config.commission;
    const cost = price + commission;
    
    if (this.balance >= cost) {
      const quantity = (this.balance * 0.95) / price; // Use 95% of balance
      
      const trade: Trade = {
        id: `trade-${Date.now()}`,
        timestamp: new Date(candle.timestamp),
        type: 'BUY',
        price,
        quantity,
        commission
      };

      this.trades.push(trade);
      this.balance -= cost * quantity;
      this.positions.set(trade.id, { ...trade, entryPrice: price });
      
      this.emit('trade:executed', trade);
    }
  }

  private async executeSell(candle: any): Promise<void> {
    if (this.positions.size === 0) return;

    const price = candle.close * (1 - this.config.slippage);
    const commission = candle.close * this.config.commission;

    for (const [id, position] of this.positions) {
      const profit = (price - position.entryPrice) * position.quantity - commission;
      
      const trade: Trade = {
        id: `trade-${Date.now()}`,
        timestamp: new Date(candle.timestamp),
        type: 'SELL',
        price,
        quantity: position.quantity,
        commission,
        profit
      };

      this.trades.push(trade);
      this.balance += price * position.quantity - commission;
      this.positions.delete(id);
      
      this.emit('trade:executed', trade);
    }
  }

  private checkDrawdown(): boolean {
    const currentValue = this.calculatePortfolioValue();
    const drawdown = (this.config.initialBalance - currentValue) / this.config.initialBalance;
    return drawdown >= this.config.maxDrawdown;
  }

  private calculatePortfolioValue(): number {
    let value = this.balance;
    for (const position of this.positions.values()) {
      value += position.quantity * position.entryPrice;
    }
    return value;
  }

  private calculateResults(): BacktestResult {
    const finalValue = this.calculatePortfolioValue();
    const totalReturn = ((finalValue - this.config.initialBalance) / this.config.initialBalance) * 100;
    
    const profits = this.trades
      .filter(t => t.profit !== undefined && t.profit > 0)
      .map(t => t.profit!);
    
    const losses = this.trades
      .filter(t => t.profit !== undefined && t.profit < 0)
      .map(t => Math.abs(t.profit!));

    const winRate = profits.length / (profits.length + losses.length) * 100;
    const averageProfit = profits.reduce((a, b) => a + b, 0) / profits.length || 0;
    const averageLoss = losses.reduce((a, b) => a + b, 0) / losses.length || 0;
    const profitFactor = averageProfit / averageLoss || 0;

    // Calculate Sharpe Ratio (simplified)
    const returns = this.calculateDailyReturns();
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length
    );
    const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252); // Annualized

    return {
      totalReturn,
      sharpeRatio,
      maxDrawdown: this.calculateMaxDrawdown(),
      winRate,
      totalTrades: this.trades.length,
      profitableTrades: profits.length,
      averageProfit,
      averageLoss,
      profitFactor
    };
  }

  private calculateDailyReturns(): number[] {
    // Simplified daily returns calculation
    const returns: number[] = [];
    let previousValue = this.config.initialBalance;
    
    // Group trades by day and calculate returns
    // This is simplified - in production, use actual daily values
    for (const trade of this.trades) {
      if (trade.profit !== undefined) {
        const dailyReturn = trade.profit / previousValue;
        returns.push(dailyReturn);
        previousValue += trade.profit;
      }
    }
    
    return returns;
  }

  private calculateMaxDrawdown(): number {
    let peak = this.config.initialBalance;
    let maxDrawdown = 0;
    let currentValue = this.config.initialBalance;

    for (const trade of this.trades) {
      if (trade.profit !== undefined) {
        currentValue += trade.profit;
        if (currentValue > peak) {
          peak = currentValue;
        }
        const drawdown = (peak - currentValue) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }

    return maxDrawdown * 100;
  }

  stop(): void {
    this.isRunning = false;
    this.emit('backtest:stopped', { reason: 'manual' });
  }

  getTrades(): Trade[] {
    return [...this.trades];
  }

  getBalance(): number {
    return this.balance;
  }
}
