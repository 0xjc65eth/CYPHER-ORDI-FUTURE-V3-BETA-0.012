export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface OrderValidationParams {
  inputAmount: number;
  inputCurrency: string;
  targetCurrency: string;
  targetNetwork: string;
  walletBalance?: number;
  minOrderSize?: number;
  maxOrderSize?: number;
}

export class FractionalOrderValidator {
  private static readonly MIN_USD_AMOUNT = 1;
  private static readonly MAX_USD_AMOUNT = 1000000;
  
  private static readonly NETWORK_LIMITS = {
    bitcoin: { min: 0.00000546, max: 21000000 },
    ethereum: { min: 0.000001, max: 120000000 },
    bsc: { min: 0.000001, max: 1000000000 },
    polygon: { min: 0.000001, max: 10000000000 },
    solana: { min: 0.000001, max: 500000000 }
  };

  private static readonly SUPPORTED_CURRENCIES = [
    'USD', 'BTC', 'ETH', 'SOL', 'ORDI', 'BNB', 'MATIC', 'USDT', 'USDC'
  ];

  private static readonly CURRENCY_DECIMALS = {
    BTC: 8,
    ETH: 18,
    SOL: 9,
    ORDI: 8,
    BNB: 18,
    MATIC: 18,
    USD: 2,
    USDT: 6,
    USDC: 6
  };

  public static validateOrder(params: OrderValidationParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate amount
    this.validateAmount(params, errors, warnings, suggestions);

    // Validate currencies
    this.validateCurrencies(params, errors, warnings);

    // Validate network
    this.validateNetwork(params, errors, warnings);

    // Validate wallet balance if provided
    if (params.walletBalance !== undefined) {
      this.validateWalletBalance(params, errors, warnings, suggestions);
    }

    // Check for common issues
    this.checkCommonIssues(params, warnings, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private static validateAmount(
    params: OrderValidationParams,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ) {
    const { inputAmount, inputCurrency } = params;

    // Check if amount is a valid number
    if (isNaN(inputAmount) || inputAmount <= 0) {
      errors.push('Amount must be a positive number');
      return;
    }

    // Check decimal places
    const decimals = this.CURRENCY_DECIMALS[inputCurrency as keyof typeof this.CURRENCY_DECIMALS] || 2;
    const decimalPlaces = (inputAmount.toString().split('.')[1] || '').length;
    
    if (decimalPlaces > decimals) {
      warnings.push(`${inputCurrency} supports only ${decimals} decimal places`);
    }

    // Convert to USD for universal checks
    const usdValue = this.estimateUSDValue(inputAmount, inputCurrency);

    // Check minimum amount
    if (usdValue < this.MIN_USD_AMOUNT) {
      errors.push(`Minimum order size is $${this.MIN_USD_AMOUNT}`);
      suggestions.push(`Try increasing your order to at least $${this.MIN_USD_AMOUNT}`);
    }

    // Check maximum amount
    if (usdValue > this.MAX_USD_AMOUNT) {
      errors.push(`Maximum order size is $${this.MAX_USD_AMOUNT.toLocaleString()}`);
      suggestions.push('Consider splitting your order into smaller transactions');
    }

    // Warn about small orders
    if (usdValue < 10) {
      warnings.push('Small orders may have higher relative fees');
      suggestions.push('Consider batching small orders to reduce fees');
    }

    // Suggest round numbers for better UX
    if (inputCurrency === 'USD' && inputAmount % 10 !== 0) {
      suggestions.push(`Consider using round numbers like $${Math.round(inputAmount / 10) * 10}`);
    }
  }

  private static validateCurrencies(
    params: OrderValidationParams,
    errors: string[],
    warnings: string[]
  ) {
    const { inputCurrency, targetCurrency } = params;

    // Check if currencies are supported
    if (!this.SUPPORTED_CURRENCIES.includes(inputCurrency)) {
      errors.push(`${inputCurrency} is not a supported input currency`);
    }

    if (!this.SUPPORTED_CURRENCIES.includes(targetCurrency)) {
      errors.push(`${targetCurrency} is not a supported target currency`);
    }

    // Check for same currency
    if (inputCurrency === targetCurrency) {
      errors.push('Input and target currencies cannot be the same');
    }

    // Warn about stablecoin conversions
    const stablecoins = ['USDT', 'USDC', 'USD'];
    if (stablecoins.includes(inputCurrency) && stablecoins.includes(targetCurrency)) {
      warnings.push('Converting between stablecoins may not be cost-effective');
    }
  }

  private static validateNetwork(
    params: OrderValidationParams,
    errors: string[],
    warnings: string[]
  ) {
    const { targetNetwork, targetCurrency } = params;

    // Check if network is supported
    if (!this.NETWORK_LIMITS[targetNetwork as keyof typeof this.NETWORK_LIMITS]) {
      errors.push(`${targetNetwork} is not a supported network`);
      return;
    }

    // Check currency-network compatibility
    const validNetworks = this.getValidNetworksForCurrency(targetCurrency);
    if (!validNetworks.includes(targetNetwork)) {
      errors.push(`${targetCurrency} is not available on ${targetNetwork} network`);
      warnings.push(`${targetCurrency} is available on: ${validNetworks.join(', ')}`);
    }

    // Warn about network congestion
    if (targetNetwork === 'ethereum') {
      warnings.push('Ethereum network fees may be high during peak times');
    }
  }

  private static validateWalletBalance(
    params: OrderValidationParams,
    errors: string[],
    warnings: string[],
    suggestions: string[]
  ) {
    const { inputAmount, walletBalance } = params;

    if (walletBalance === undefined) return;

    // Check sufficient balance
    if (inputAmount > walletBalance) {
      errors.push('Insufficient wallet balance');
      suggestions.push(`Your balance: ${walletBalance.toFixed(2)}, Required: ${inputAmount.toFixed(2)}`);
    }

    // Warn about using entire balance
    if (inputAmount > walletBalance * 0.95) {
      warnings.push('This will use nearly all of your balance');
      suggestions.push('Consider keeping some funds for network fees');
    }
  }

  private static checkCommonIssues(
    params: OrderValidationParams,
    warnings: string[],
    suggestions: string[]
  ) {
    const { inputAmount, inputCurrency, targetCurrency, targetNetwork } = params;

    // Check for test amounts
    if (inputAmount === 0.01 || inputAmount === 1 || inputAmount === 10) {
      suggestions.push('Looks like a test amount - ready to trade more?');
    }

    // Suggest popular trading pairs
    if (inputCurrency === 'USD') {
      const popularTargets = ['BTC', 'ETH', 'SOL'];
      if (!popularTargets.includes(targetCurrency)) {
        suggestions.push(`Popular choices: ${popularTargets.join(', ')}`);
      }
    }

    // Network-specific suggestions
    if (targetNetwork === 'polygon' || targetNetwork === 'bsc') {
      suggestions.push('Low-fee network selected - great for small transactions!');
    }

    // Time-based suggestions
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      suggestions.push('Trading during US market hours - expect higher liquidity');
    } else {
      warnings.push('Trading outside peak hours may result in wider spreads');
    }
  }

  private static getValidNetworksForCurrency(currency: string): string[] {
    const networkMap: { [key: string]: string[] } = {
      'BTC': ['bitcoin'],
      'ETH': ['ethereum', 'polygon', 'bsc'],
      'BNB': ['bsc'],
      'MATIC': ['polygon', 'ethereum'],
      'SOL': ['solana'],
      'ORDI': ['bitcoin'],
      'USDT': ['ethereum', 'bsc', 'polygon', 'solana'],
      'USDC': ['ethereum', 'bsc', 'polygon', 'solana']
    };

    return networkMap[currency] || ['ethereum'];
  }

  private static estimateUSDValue(amount: number, currency: string): number {
    // Simplified price estimates for validation
    const approximatePrices: { [key: string]: number } = {
      'USD': 1,
      'BTC': 50000,
      'ETH': 3000,
      'SOL': 100,
      'ORDI': 50,
      'BNB': 500,
      'MATIC': 1,
      'USDT': 1,
      'USDC': 1
    };

    return amount * (approximatePrices[currency] || 1);
  }

  public static formatAmount(amount: number, currency: string): string {
    const decimals = this.CURRENCY_DECIMALS[currency as keyof typeof this.CURRENCY_DECIMALS] || 2;
    return amount.toFixed(decimals);
  }

  public static getSuggestedAmounts(currency: string): number[] {
    if (currency === 'USD') {
      return [10, 50, 100, 500, 1000];
    } else if (currency === 'BTC') {
      return [0.0001, 0.001, 0.01, 0.1];
    } else if (currency === 'ETH') {
      return [0.01, 0.1, 0.5, 1];
    } else if (currency === 'SOL') {
      return [0.1, 1, 10, 50];
    }
    return [1, 10, 100];
  }
}