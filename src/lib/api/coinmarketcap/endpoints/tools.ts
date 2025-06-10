// CoinMarketCap Tools Endpoints
import { getCMCClient } from '../client';
import { CMC_CONFIG } from '../config';
import { validateParams, validateParamTypes, validateParamRanges } from '../errors';

// Price conversion tool
export async function priceConversion(params: {
  amount: number;
  id?: string;
  symbol?: string;
  convert?: string;
  convert_id?: string;
  time?: string;
}): Promise<{
  id: number;
  symbol: string;
  name: string;
  amount: number;
  last_updated: string;
  quote: {
    [currency: string]: {
      price: number;
      last_updated: string;
    };
  };
}> {
  const client = getCMCClient();
  
  // Validate required parameters
  validateParams(params, ['amount']);
  
  // Validate that at least one identifier is provided
  if (!params.id && !params.symbol) {
    throw new Error('Either id or symbol must be provided');
  }

  validateParamTypes(params, {
    amount: 'number',
    id: 'string',
    symbol: 'string',
    convert: 'string',
    convert_id: 'string',
    time: 'string',
  });

  validateParamRanges(params, {
    amount: { min: 0 },
  });

  const defaultParams = {
    convert: CMC_CONFIG.DEFAULT_CURRENCY,
    ...params,
  };

  return client.get<any>(
    CMC_CONFIG.ENDPOINTS.PRICE_CONVERSION,
    defaultParams,
    {
      cache: false, // Don't cache conversion results
    }
  );
}

// Helper function to convert between cryptocurrencies
export async function convertCrypto(
  amount: number,
  fromSymbol: string,
  toSymbol: string
): Promise<{
  from: {
    symbol: string;
    name: string;
    amount: number;
  };
  to: {
    symbol: string;
    price: number;
    amount: number;
  };
  rate: number;
  lastUpdated: string;
}> {
  const result = await priceConversion({
    amount,
    symbol: fromSymbol,
    convert: toSymbol,
  });

  const toPrice = result.quote[toSymbol].price;

  return {
    from: {
      symbol: result.symbol,
      name: result.name,
      amount: result.amount,
    },
    to: {
      symbol: toSymbol,
      price: toPrice,
      amount: toPrice,
    },
    rate: toPrice / amount,
    lastUpdated: result.last_updated,
  };
}

// Helper function to convert to multiple currencies
export async function convertToMultipleCurrencies(
  amount: number,
  fromSymbol: string,
  toCurrencies: string[]
): Promise<{
  from: {
    symbol: string;
    name: string;
    amount: number;
  };
  conversions: Array<{
    currency: string;
    price: number;
    amount: number;
    rate: number;
  }>;
  lastUpdated: string;
}> {
  const convert = toCurrencies.join(',');
  const result = await priceConversion({
    amount,
    symbol: fromSymbol,
    convert,
  });

  const conversions = toCurrencies.map(currency => ({
    currency,
    price: result.quote[currency].price,
    amount: result.quote[currency].price,
    rate: result.quote[currency].price / amount,
  }));

  return {
    from: {
      symbol: result.symbol,
      name: result.name,
      amount: result.amount,
    },
    conversions,
    lastUpdated: result.last_updated,
  };
}

// Helper function to get historical price at specific time
export async function getHistoricalPrice(
  symbol: string,
  time: string,
  convert = CMC_CONFIG.DEFAULT_CURRENCY
): Promise<{
  symbol: string;
  name: string;
  price: number;
  timestamp: string;
}> {
  const result = await priceConversion({
    amount: 1,
    symbol,
    convert,
    time,
  });

  return {
    symbol: result.symbol,
    name: result.name,
    price: result.quote[convert].price,
    timestamp: result.quote[convert].last_updated,
  };
}