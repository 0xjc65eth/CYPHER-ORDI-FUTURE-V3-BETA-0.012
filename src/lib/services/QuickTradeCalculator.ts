/**
 * QuickTradeCalculator - Precise fractional trading calculations
 * Handles $10 minimum trades with proper asset fractionation
 */

interface TradeCalculation {
  amount: number;
  valueUSD: number;
  priceUSD: number;
  decimals: number;
  isValid: boolean;
  formattedAmount: string;
}

interface TradeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  calculation?: TradeCalculation;
}

export class QuickTradeCalculator {
  private minTradeUSD: number;

  constructor(minTradeUSD: number = 10) {
    this.minTradeUSD = minTradeUSD;
  }

  /**
   * Calculate precise asset amount for given USD value
   */
  calculateAssetAmount(assetPriceUSD: number, tradeValueUSD: number): TradeCalculation {
    // Validation
    if (tradeValueUSD < this.minTradeUSD) {
      return {
        amount: 0,
        valueUSD: tradeValueUSD,
        priceUSD: assetPriceUSD,
        decimals: 0,
        isValid: false,
        formattedAmount: '0'
      };
    }

    if (assetPriceUSD <= 0) {
      return {
        amount: 0,
        valueUSD: tradeValueUSD,
        priceUSD: assetPriceUSD,
        decimals: 0,
        isValid: false,
        formattedAmount: '0'
      };
    }

    // Calculate fractional amount
    const assetAmount = tradeValueUSD / assetPriceUSD;
    
    // Determine optimal decimal precision
    const decimals = this.getOptimalDecimals(assetPriceUSD);
    
    // Round to appropriate decimals
    const roundedAmount = this.preciseRound(assetAmount, decimals);
    
    return {
      amount: roundedAmount,
      valueUSD: tradeValueUSD,
      priceUSD: assetPriceUSD,
      decimals: decimals,
      isValid: true,
      formattedAmount: this.formatAmount(roundedAmount, decimals)
    };
  }

  /**
   * Get optimal decimal places based on asset price
   */
  private getOptimalDecimals(price: number): number {
    if (price >= 10000) return 8;     // Very expensive assets (BTC): 0.00001234
    if (price >= 1000) return 6;      // Expensive assets (BTC): 0.000156
    if (price >= 100) return 5;       // ETH range: 0.00435
    if (price >= 10) return 4;        // Mid-tier tokens: 0.1234
    if (price >= 1) return 3;         // Dollar range tokens: 1.234
    if (price >= 0.1) return 2;       // Dime range: 12.34
    if (price >= 0.01) return 1;      // Cent range: 123.4
    return 0;                         // Very cheap tokens: 1234
  }

  /**
   * Precise rounding to avoid floating point issues
   */
  private preciseRound(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  /**
   * Format amount with proper decimal places
   */
  private formatAmount(amount: number, decimals: number): string {
    return amount.toFixed(decimals);
  }

  /**
   * Validate a trade with comprehensive checks
   */
  validateTrade(assetSymbol: string, amount: number, priceUSD: number): TradeValidation {
    const tradeValueUSD = amount * priceUSD;
    
    const validation: TradeValidation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check minimum trade value
    if (tradeValueUSD < this.minTradeUSD) {
      validation.isValid = false;
      validation.errors.push(
        `Minimum trade value: $${this.minTradeUSD}. Current: $${tradeValueUSD.toFixed(2)} (${amount} ${assetSymbol})`
      );
    }

    // Check for zero or negative values
    if (amount <= 0) {
      validation.isValid = false;
      validation.errors.push('Amount must be greater than zero');
    }

    if (priceUSD <= 0) {
      validation.isValid = false;
      validation.errors.push('Invalid asset price');
    }

    // Check decimal precision
    const maxDecimals = this.getOptimalDecimals(priceUSD);
    const actualDecimals = this.getDecimalPlaces(amount);
    
    if (actualDecimals > maxDecimals) {
      validation.warnings.push(
        `High precision: ${actualDecimals} decimals. Recommended max: ${maxDecimals} for ${assetSymbol}`
      );
    }

    // Check if amount is too small to be meaningful
    if (tradeValueUSD < 0.01) {
      validation.warnings.push(
        `Very small trade value: $${tradeValueUSD.toFixed(4)}`
      );
    }

    // Add calculation if valid
    if (validation.isValid) {
      validation.calculation = this.calculateAssetAmount(priceUSD, tradeValueUSD);
    }

    return validation;
  }

  /**
   * Get number of decimal places in a number
   */
  private getDecimalPlaces(num: number): number {
    const str = num.toString();
    if (str.indexOf('.') !== -1 && str.indexOf('e-') === -1) {
      return str.split('.')[1].length;
    } else if (str.indexOf('e-') !== -1) {
      const parts = str.split('e-');
      return parseInt(parts[1], 10);
    }
    return 0;
  }

  /**
   * Calculate how much of an asset you can buy with USD amount
   */
  calculateMaxAssetForUSD(usdAmount: number, assetPriceUSD: number): TradeCalculation {
    return this.calculateAssetAmount(assetPriceUSD, usdAmount);
  }

  /**
   * Calculate USD value of asset amount
   */
  calculateUSDForAsset(assetAmount: number, assetPriceUSD: number): number {
    return this.preciseRound(assetAmount * assetPriceUSD, 2);
  }

  /**
   * Get examples for different asset types
   */
  static getExamples(): { asset: string; price: number; usdAmount: number; calculation: TradeCalculation }[] {
    const calculator = new QuickTradeCalculator();
    
    return [
      {
        asset: 'BTC',
        price: 63500,
        usdAmount: 10,
        calculation: calculator.calculateAssetAmount(63500, 10)
      },
      {
        asset: 'ETH', 
        price: 2300,
        usdAmount: 10,
        calculation: calculator.calculateAssetAmount(2300, 10)
      },
      {
        asset: 'USDC',
        price: 1,
        usdAmount: 10,
        calculation: calculator.calculateAssetAmount(1, 10)
      },
      {
        asset: 'DOGE',
        price: 0.08,
        usdAmount: 10,
        calculation: calculator.calculateAssetAmount(0.08, 10)
      }
    ];
  }

  /**
   * Update minimum trade amount
   */
  setMinTradeUSD(newMinimum: number): void {
    if (newMinimum > 0) {
      this.minTradeUSD = newMinimum;
    }
  }

  /**
   * Get current minimum trade amount
   */
  getMinTradeUSD(): number {
    return this.minTradeUSD;
  }
}

// Export types for use in components
export type { TradeCalculation, TradeValidation };