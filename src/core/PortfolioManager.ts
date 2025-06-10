export interface PortfolioAsset {
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  currentValue: number;
  avgBuyPrice: number;
  totalCost: number;
  pnl: number;
  pnlPercentage: number;
  allocation: number;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercentage: number;
  assets: PortfolioAsset[];
  lastUpdated: Date;
}

export class PortfolioManager {
  private portfolio: Portfolio | null = null;

  constructor() {
    this.portfolio = null;
  }

  public updatePortfolio(assets: PortfolioAsset[]): Portfolio {
    const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalCost = assets.reduce((sum, asset) => sum + asset.totalCost, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPercentage = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    // Calculate allocations
    const updatedAssets = assets.map(asset => ({
      ...asset,
      allocation: totalValue > 0 ? (asset.currentValue / totalValue) * 100 : 0
    }));

    this.portfolio = {
      totalValue,
      totalCost,
      totalPnl,
      totalPnlPercentage,
      assets: updatedAssets,
      lastUpdated: new Date()
    };

    return this.portfolio;
  }

  public getPortfolio(): Portfolio | null {
    return this.portfolio;
  }

  public getAsset(symbol: string): PortfolioAsset | null {
    if (!this.portfolio) return null;
    return this.portfolio.assets.find(asset => asset.symbol === symbol) || null;
  }

  public addAsset(asset: PortfolioAsset): void {
    if (!this.portfolio) {
      this.portfolio = {
        totalValue: 0,
        totalCost: 0,
        totalPnl: 0,
        totalPnlPercentage: 0,
        assets: [],
        lastUpdated: new Date()
      };
    }

    const existingAssetIndex = this.portfolio.assets.findIndex(a => a.symbol === asset.symbol);
    
    if (existingAssetIndex >= 0) {
      // Update existing asset
      this.portfolio.assets[existingAssetIndex] = asset;
    } else {
      // Add new asset
      this.portfolio.assets.push(asset);
    }

    // Recalculate portfolio totals
    this.updatePortfolio(this.portfolio.assets);
  }

  public removeAsset(symbol: string): boolean {
    if (!this.portfolio) return false;

    const assetIndex = this.portfolio.assets.findIndex(asset => asset.symbol === symbol);
    if (assetIndex >= 0) {
      this.portfolio.assets.splice(assetIndex, 1);
      this.updatePortfolio(this.portfolio.assets);
      return true;
    }
    return false;
  }

  public getTopPerformers(limit: number = 5): PortfolioAsset[] {
    if (!this.portfolio) return [];
    return [...this.portfolio.assets]
      .sort((a, b) => b.pnlPercentage - a.pnlPercentage)
      .slice(0, limit);
  }

  public getWorstPerformers(limit: number = 5): PortfolioAsset[] {
    if (!this.portfolio) return [];
    return [...this.portfolio.assets]
      .sort((a, b) => a.pnlPercentage - b.pnlPercentage)
      .slice(0, limit);
  }

  public getDiversificationScore(): number {
    if (!this.portfolio || this.portfolio.assets.length === 0) return 0;

    // Calculate Herfindahl-Hirschman Index (HHI)
    const hhi = this.portfolio.assets.reduce((sum, asset) => {
      const allocation = asset.allocation / 100;
      return sum + (allocation * allocation);
    }, 0);

    // Convert to diversification score (0-100, higher = more diversified)
    const maxAssets = Math.min(this.portfolio.assets.length, 10); // Cap at 10 for practical purposes
    const minHHI = 1 / maxAssets;
    const diversificationScore = Math.max(0, (1 - hhi) / (1 - minHHI)) * 100;

    return Math.round(diversificationScore);
  }

  public getConcentrationRisk(): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (!this.portfolio) return 'LOW';

    const topAssetAllocation = Math.max(...this.portfolio.assets.map(a => a.allocation));
    
    if (topAssetAllocation > 70) return 'HIGH';
    if (topAssetAllocation > 50) return 'MEDIUM';
    return 'LOW';
  }

  public calculateRebalancingNeeds(targetAllocations: { [symbol: string]: number }): { symbol: string; currentAllocation: number; targetAllocation: number; actionNeeded: 'BUY' | 'SELL' | 'HOLD'; percentageDiff: number }[] {
    if (!this.portfolio) return [];

    return this.portfolio.assets.map(asset => {
      const targetAllocation = targetAllocations[asset.symbol] || 0;
      const percentageDiff = asset.allocation - targetAllocation;
      let actionNeeded: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

      if (Math.abs(percentageDiff) > 5) { // 5% threshold
        actionNeeded = percentageDiff > 0 ? 'SELL' : 'BUY';
      }

      return {
        symbol: asset.symbol,
        currentAllocation: asset.allocation,
        targetAllocation,
        actionNeeded,
        percentageDiff: Math.abs(percentageDiff)
      };
    });
  }

  public exportToCSV(): string {
    if (!this.portfolio) return '';

    const headers = ['Symbol', 'Name', 'Amount', 'Current Price', 'Current Value', 'Avg Buy Price', 'Total Cost', 'PnL', 'PnL %', 'Allocation %'];
    const rows = this.portfolio.assets.map(asset => [
      asset.symbol,
      asset.name,
      asset.amount.toString(),
      asset.currentPrice.toString(),
      asset.currentValue.toString(),
      asset.avgBuyPrice.toString(),
      asset.totalCost.toString(),
      asset.pnl.toString(),
      asset.pnlPercentage.toFixed(2),
      asset.allocation.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}