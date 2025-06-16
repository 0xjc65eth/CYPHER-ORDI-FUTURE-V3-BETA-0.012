// 📊 CYPHER ORDI FUTURE v3.0.0 - Chart Utils
// Utilitários para manipulação e formatação de dados de charts

import { ChartData, TimeSeriesData, PriceData } from '../types/chartTypes';

/**
 * Formata dados brutos para uso em charts
 */
export function formatChartData(rawData: any[], type: 'price' | 'volume' | 'sentiment' = 'price'): ChartData[] {
  return rawData.map((item, index) => ({
    timestamp: item.timestamp || item.time || `${index}`,
    value: item[type] || item.value || 0,
    label: item.label || item.name
  }));
}

/**
 * Gera dados mock para demonstrações
 */
export function generateMockData(
  count: number = 24, 
  baseValue: number = 65000,
  volatility: number = 0.05
): PriceData[] {
  const data: PriceData[] = [];
  
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.5) * volatility;
    const newValue = baseValue * (1 + change);
    
    data.push({
      time: new Date(Date.now() - (count - i) * 60 * 60 * 1000).toISOString(),
      price: Number(newValue.toFixed(2)),
      change: Number((newValue - baseValue).toFixed(2)),
      changePercent: Number((change * 100).toFixed(2)),
      volume: Math.random() * 1000000
    });
    
    baseValue = newValue;
  }
  
  return data;
}

/**
 * Calcula médias móveis simples
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  
  return result;
}

/**
 * Formata valores monetários
 */
export function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}