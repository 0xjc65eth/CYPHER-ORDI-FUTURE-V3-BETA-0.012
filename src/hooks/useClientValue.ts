'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para valores que podem causar problemas de hidratação
 * Renderiza um placeholder no servidor e o valor real no cliente
 */
export function useClientValue<T>(
  getValue: () => T, 
  fallbackValue: T,
  deps: React.DependencyList = []
): T {
  const [value, setValue] = useState<T>(fallbackValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setValue(getValue());
  }, [getValue, ...deps]);

  return isClient ? value : fallbackValue;
}

/**
 * Hook específico para preços que mudam frequentemente
 */
export function useClientPrice(
  getPrice: () => number | null,
  placeholder: string = "Loading..."
): string {
  const price = useClientValue(getPrice, null);
  
  if (price === null) {
    return placeholder;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2
  }).format(price);
}

/**
 * Hook para timestamps que podem diferir entre servidor e cliente
 */
export function useClientTimestamp(
  timestamp?: number,
  placeholder: string = "..."
): string {
  const formatTime = () => {
    if (!timestamp) return placeholder;
    return new Date(timestamp).toLocaleString();
  };

  return useClientValue(formatTime, placeholder, [timestamp]);
}