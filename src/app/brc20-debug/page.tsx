'use client';

import React, { useState, useEffect } from 'react';
import { TopNavLayout } from '@/components/layout/TopNavLayout';

export default function BRC20DebugPage() {
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    
    // Collect debug information
    const info = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      localStorage: typeof window !== 'undefined' ? !!window.localStorage : false,
      sessionStorage: typeof window !== 'undefined' ? !!window.sessionStorage : false,
      hasConsole: typeof console !== 'undefined',
      hasWindow: typeof window !== 'undefined',
      hasDocument: typeof document !== 'undefined',
      href: window.location.href,
      pathname: window.location.pathname,
      reactVersion: React.version
    };
    
    setDebugInfo(info);
    console.log('🔍 BRC20 Debug Info:', info);
  }, []);

  if (!mounted) {
    return (
      <TopNavLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold text-white mb-4">BRC20 Debug - Mounting...</h1>
        </div>
      </TopNavLayout>
    );
  }

  return (
    <TopNavLayout>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold text-white mb-6">BRC20 Debug Page</h1>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Environment Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">{key}:</span>
                <span className="text-white font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Simple BRC20 Test</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded">
              <h3 className="text-green-400 font-semibold mb-2">✅ Test Token: ORDI</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white ml-2">$45.67</span>
                </div>
                <div>
                  <span className="text-gray-400">Change:</span>
                  <span className="text-green-400 ml-2">+8.5%</span>
                </div>
                <div>
                  <span className="text-gray-400">Market Cap:</span>
                  <span className="text-white ml-2">$959M</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded">
              <h3 className="text-blue-400 font-semibold mb-2">✅ Test Token: SATS</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white ml-2">$0.0000005</span>
                </div>
                <div>
                  <span className="text-gray-400">Change:</span>
                  <span className="text-green-400 ml-2">+12.3%</span>
                </div>
                <div>
                  <span className="text-gray-400">Market Cap:</span>
                  <span className="text-white ml-2">$1.05M</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Navigation Test</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.href = '/brc20'}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded"
            >
              Go to Original BRC20 Page
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Go to Homepage
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Console Test</h2>
          <button 
            onClick={() => {
              console.log('🔍 Manual console test from BRC20 Debug page');
              console.warn('⚠️ Warning test');
              console.error('❌ Error test');
              alert('Console test completed - check browser console');
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
          >
            Test Console Logging
          </button>
        </div>
      </div>
    </TopNavLayout>
  );
}