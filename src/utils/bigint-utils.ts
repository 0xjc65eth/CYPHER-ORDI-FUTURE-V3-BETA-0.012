/**
 * 🔢 BIGINT UTILITIES - CYPHER ORDi FUTURE V3
 * Utilitários para conversão segura de BigInt sem usar 'as any'
 */

import { EnhancedLogger } from '@/lib/enhanced-logger';
import { ErrorReporter } from '@/lib/ErrorReporter';

export function safeBigInt(value: string | number | bigint): bigint {
  try {
    if (typeof value === 'bigint') {
      return value;
    }
    
    if (typeof value === 'number') {
      if (!Number.isInteger(value)) {
        throw new Error('Cannot convert non-integer number to BigInt');
      }
      return BigInt(Math.floor(value));
    }
    
    if (typeof value === 'string') {
      // Remove whitespace and validate
      const cleaned = value.trim();
      if (!/^-?\d+$/.test(cleaned)) {
        throw new Error('Invalid string format for BigInt conversion');
      }
      return BigInt(cleaned);
    }
    
    throw new Error('Unsupported type for BigInt conversion');
  } catch (error) {
    EnhancedLogger.error('BigInt conversion failed', {
      component: 'BigIntUtils',
      value: String(value),
      type: typeof value,
      error: error instanceof Error ? error.message : String(error)
    });
    return BigInt(0);
  }
}

export function bigIntToNumber(value: bigint): number {
  try {
    const numberValue = Number(value);
    
    if (!Number.isSafeInteger(numberValue)) {
      EnhancedLogger.warn('BigInt to number conversion may lose precision', {
        component: 'BigIntUtils',
        bigIntValue: value.toString(),
        numberValue,
        maxSafeInteger: Number.MAX_SAFE_INTEGER
      });
    }
    
    return numberValue;
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'bigIntToNumber',
      metadata: { value: value.toString() }
    });
    return 0;
  }
}

export function formatBigInt(value: bigint, decimals = 8): string {
  try {
    const stringValue = value.toString();
    
    if (decimals <= 0) {
      return stringValue;
    }
    
    const isNegative = stringValue.startsWith('-');
    const absoluteValue = isNegative ? stringValue.slice(1) : stringValue;
    
    if (absoluteValue.length <= decimals) {
      const paddedValue = absoluteValue.padStart(decimals, '0');
      const formatted = `0.${paddedValue}`;
      return isNegative ? `-${formatted}` : formatted;
    }
    
    const integerPart = absoluteValue.slice(0, -decimals);
    const decimalPart = absoluteValue.slice(-decimals);
    const formatted = `${integerPart}.${decimalPart}`;
    
    return isNegative ? `-${formatted}` : formatted;
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'formatBigInt',
      metadata: { value: value.toString(), decimals }
    });
    return '0';
  }
}

export function parseBigIntFromDecimal(value: string, decimals = 8): bigint {
  try {
    const cleanValue = value.trim();
    
    if (!/^-?\d*\.?\d*$/.test(cleanValue)) {
      throw new Error('Invalid decimal format');
    }
    
    const isNegative = cleanValue.startsWith('-');
    const absoluteValue = isNegative ? cleanValue.slice(1) : cleanValue;
    
    const [integerPart = '0', decimalPart = ''] = absoluteValue.split('.');
    
    // Pad or truncate decimal part
    const normalizedDecimalPart = decimalPart.padEnd(decimals, '0').slice(0, decimals);
    
    const combinedValue = integerPart + normalizedDecimalPart;
    const result = BigInt(combinedValue);
    
    return isNegative ? -result : result;
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'parseBigIntFromDecimal',
      metadata: { value, decimals }
    });
    return BigInt(0);
  }
}

export function bigIntToSatoshis(value: bigint): bigint {
  try {
    // Convert BTC to satoshis (1 BTC = 100,000,000 satoshis)
    return value * BigInt(100000000);
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'bigIntToSatoshis',
      metadata: { value: value.toString() }
    });
    return BigInt(0);
  }
}

export function satoshisToBTC(satoshis: bigint): string {
  try {
    return formatBigInt(satoshis, 8);
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'satoshisToBTC',
      metadata: { satoshis: satoshis.toString() }
    });
    return '0';
  }
}

export function addBigInts(...values: bigint[]): bigint {
  try {
    return values.reduce((sum, value) => sum + value, BigInt(0));
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'addBigInts',
      metadata: { values: values.map(v => v.toString()) }
    });
    return BigInt(0);
  }
}

export function subtractBigInts(a: bigint, b: bigint): bigint {
  try {
    return a - b;
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'subtractBigInts',
      metadata: { a: a.toString(), b: b.toString() }
    });
    return BigInt(0);
  }
}

export function multiplyBigInts(a: bigint, b: bigint): bigint {
  try {
    return a * b;
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'multiplyBigInts',
      metadata: { a: a.toString(), b: b.toString() }
    });
    return BigInt(0);
  }
}

export function divideBigInts(a: bigint, b: bigint): bigint {
  try {
    if (b === BigInt(0)) {
      throw new Error('Division by zero');
    }
    return a / b;
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'divideBigInts',
      metadata: { a: a.toString(), b: b.toString() }
    });
    return BigInt(0);
  }
}

export function compareBigInts(a: bigint, b: bigint): -1 | 0 | 1 {
  try {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'compareBigInts',
      metadata: { a: a.toString(), b: b.toString() }
    });
    return 0;
  }
}

export function isValidBigInt(value: any): value is bigint {
  return typeof value === 'bigint';
}

export function serialializeBigInt(obj: any): any {
  try {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      if (typeof value === 'bigint') {
        return {
          __type: 'bigint',
          value: value.toString()
        };
      }
      return value;
    }));
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'serialializeBigInt'
    });
    return obj;
  }
}

export function deserializeBigInt(obj: any): any {
  try {
    return JSON.parse(JSON.stringify(obj), (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'bigint') {
        return BigInt(value.value);
      }
      return value;
    });
  } catch (error) {
    ErrorReporter.report(error as Error, {
      component: 'BigIntUtils',
      action: 'deserializeBigInt'
    });
    return obj;
  }
}

// Type-safe BigInt conversion for common use cases
export const BigIntUtils = {
  safe: safeBigInt,
  toNumber: bigIntToNumber,
  format: formatBigInt,
  parseDecimal: parseBigIntFromDecimal,
  toSatoshis: bigIntToSatoshis,
  toBTC: satoshisToBTC,
  add: addBigInts,
  subtract: subtractBigInts,
  multiply: multiplyBigInts,
  divide: divideBigInts,
  compare: compareBigInts,
  isValid: isValidBigInt,
  serialize: serialializeBigInt,
  deserialize: deserializeBigInt
};

export default BigIntUtils;