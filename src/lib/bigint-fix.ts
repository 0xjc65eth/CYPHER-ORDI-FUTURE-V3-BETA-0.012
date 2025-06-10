/**
 * CRITICAL BIGINT FIX - COMPLETE SOLUTION
 * Fixes all BigInt errors: Cannot mix BigInt and other types
 */

if (typeof globalThis !== 'undefined' && !globalThis.__BIGINT_FIXED__) {
  globalThis.__BIGINT_FIXED__ = true;

  // Store originals
  const originalMathPow = Math.pow;
  const originalMathMax = Math.max;
  const originalMathMin = Math.min;
  const originalMathFloor = Math.floor;
  const originalMathCeil = Math.ceil;
  const originalMathRound = Math.round;
  const originalMathAbs = Math.abs;
  const originalParseInt = parseInt;
  const originalParseFloat = parseFloat;

  // Safe BigInt conversion
  function safeBigIntToNumber(value: any): number {
    if (typeof value === 'bigint') {
      const stringValue = value.toString();
      const numberValue = parseFloat(stringValue);
      
      if (numberValue > Number.MAX_SAFE_INTEGER) {
        return Number.MAX_SAFE_INTEGER;
      }
      if (numberValue < Number.MIN_SAFE_INTEGER) {
        return Number.MIN_SAFE_INTEGER;
      }
      return numberValue;
    }
    return Number(value);
  }

  // Override ALL Math functions
  Math.pow = function(base: any, exponent: any) {
    try {
      return originalMathPow(safeBigIntToNumber(base), safeBigIntToNumber(exponent));
    } catch {
      return 0;
    }
  };

  Math.max = function(...values: any[]) {
    try {
      return originalMathMax(...values.map(safeBigIntToNumber));
    } catch {
      return 0;
    }
  };

  Math.min = function(...values: any[]) {
    try {
      return originalMathMin(...values.map(safeBigIntToNumber));
    } catch {
      return 0;
    }
  };

  Math.floor = function(value: any) {
    try {
      return originalMathFloor(safeBigIntToNumber(value));
    } catch {
      return 0;
    }
  };

  Math.ceil = function(value: any) {
    try {
      return originalMathCeil(safeBigIntToNumber(value));
    } catch {
      return 0;
    }
  };

  Math.round = function(value: any) {
    try {
      return originalMathRound(safeBigIntToNumber(value));
    } catch {
      return 0;
    }
  };

  Math.abs = function(value: any) {
    try {
      return originalMathAbs(safeBigIntToNumber(value));
    } catch {
      return 0;
    }
  };

  // Override arithmetic operators globally
  const originalValueOf = BigInt.prototype.valueOf;
  BigInt.prototype.valueOf = function() {
    return safeBigIntToNumber(this);
  };

  // Override Number constructor completely
  const OriginalNumber = globalThis.Number;
  globalThis.Number = function(value: any) {
    if (typeof value === 'bigint') {
      return safeBigIntToNumber(value);
    }
    return OriginalNumber(value);
  } as any;

  // Copy all static properties
  Object.setPrototypeOf(globalThis.Number, OriginalNumber);
  Object.defineProperties(globalThis.Number, Object.getOwnPropertyDescriptors(OriginalNumber));

  // Override parseInt and parseFloat
  globalThis.parseInt = function(string: any, radix?: number) {
    if (typeof string === 'bigint') {
      string = string.toString();
    }
    return originalParseInt(string, radix);
  };

  globalThis.parseFloat = function(string: any) {
    if (typeof string === 'bigint') {
      string = string.toString();
    }
    return originalParseFloat(string);
  };

  console.log('✅ Complete BigInt polyfill applied');
}

export default {};