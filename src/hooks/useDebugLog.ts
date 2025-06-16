'use client';

import { useEffect } from 'react';

export function useDebugLog(component: string, data: any, dependencies: any[] = []) {
  useEffect(() => {
    console.log(`🐛 [${component}] Data updated:`, {
      timestamp: new Date().toISOString(),
      data,
      dataSize: Array.isArray(data) ? data.length : typeof data === 'object' ? Object.keys(data || {}).length : 'primitive'
    });
  }, dependencies);
}

export function logAPICall(endpoint: string, response: any, error?: any) {
  if (error) {
    console.error(`❌ [API] ${endpoint} failed:`, error);
  } else {
    console.log(`✅ [API] ${endpoint} success:`, {
      timestamp: new Date().toISOString(),
      dataSize: Array.isArray(response) ? response.length : typeof response === 'object' ? Object.keys(response || {}).length : 'primitive',
      sample: Array.isArray(response) ? response[0] : response
    });
  }
}

export function logPerformance(operation: string, startTime: number) {
  const duration = Date.now() - startTime;
  console.log(`⏱️ [Performance] ${operation} took ${duration}ms`);
}