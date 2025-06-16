'use client';

import { useState, useEffect } from 'react';
import { ClientOnlyChart } from '@/components/charts/ClientOnlyChart';
import { SimpleChart } from '@/components/charts/SimpleChart';

export default function TestFinalPage() {
  const [mounted, setMounted] = useState(false);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    setMounted(true);
    
    // Test different chart libraries
    const runTests = async () => {
      const results: any = {};
      
      try {
        // Test 1: Direct Recharts import
        const recharts = await import('recharts');
        results.recharts = 'SUCCESS - ' + Object.keys(recharts).length + ' components';
      } catch (error) {
        results.recharts = 'FAILED - ' + (error as Error).message;
      }

      try {
        // Test 2: Chart.js import
        const chartjs = await import('chart.js');
        results.chartjs = 'SUCCESS';
      } catch (error) {
        results.chartjs = 'FAILED - ' + (error as Error).message;
      }

      try {
        // Test 3: Lightweight Charts import
        const lwc = await import('lightweight-charts');
        results.lightweight = 'SUCCESS';
      } catch (error) {
        results.lightweight = 'FAILED - ' + (error as Error).message;
      }

      setTestResults(results);
    };

    runTests();
  }, []);

  const testData = [
    { time: '09:00', value: 65000 },
    { time: '10:00', value: 65300 },
    { time: '11:00', value: 64800 },
    { time: '12:00', value: 66100 },
    { time: '13:00', value: 66500 },
    { time: '14:00', value: 65900 },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Mounting components...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🔧 Final Chart Testing Suite
        </h1>

        {/* Test Results Summary */}
        <div className="mb-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">📋 Library Test Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(testResults).map(([lib, result]) => (
              <div key={lib} className="bg-gray-900 p-4 rounded">
                <h3 className="font-semibold capitalize mb-2">{lib}</h3>
                <p className={`text-sm ${(result as string).includes('SUCCESS') ? 'text-green-400' : 'text-red-400'}`}>
                  {result as string}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Tests */}
        <div className="space-y-8">
          {/* Test 1: ClientOnlyChart */}
          <section className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              ✅ Test 1: ClientOnlyChart (SSR-Safe)
            </h2>
            <p className="text-gray-400 mb-4">
              This should always work as it handles SSR properly with dynamic imports.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ClientOnlyChart
                type="line"
                data={testData}
                title="Line Chart"
                color="#3b82f6"
              />
              <ClientOnlyChart
                type="area"
                data={testData}
                title="Area Chart"
                color="#10b981"
              />
              <ClientOnlyChart
                type="bar"
                data={testData}
                title="Bar Chart"
                color="#f59e0b"
              />
            </div>
          </section>

          {/* Test 2: SimpleChart */}
          <section className="p-6 bg-gray-700 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              ⚠️ Test 2: SimpleChart (May Fail on SSR)
            </h2>
            <p className="text-gray-400 mb-4">
              This uses direct Recharts imports and may not render if SSR issues persist.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SimpleChart symbol="BTCUSDT" interval="1h" />
              <SimpleChart symbol="ETHUSDT" interval="1h" />
            </div>
          </section>

          {/* Test 3: Manual Chart Creation */}
          <section className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">
              🔧 Test 3: Manual Chart Implementation
            </h2>
            <p className="text-gray-400 mb-4">
              Raw HTML/CSS chart to prove data is available.
            </p>
            <div className="bg-gray-900 p-4 rounded">
              <h3 className="font-semibold mb-4">Bitcoin Price Trend (CSS Chart)</h3>
              <div className="flex items-end space-x-2 h-32 bg-gray-950 p-4 rounded">
                {testData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-blue-500 w-full rounded-t transition-all duration-500"
                      style={{
                        height: `${(item.value - 64000) / 50}%`,
                        minHeight: '4px'
                      }}
                      title={`${item.time}: $${item.value.toLocaleString()}`}
                    />
                    <span className="text-xs mt-2 text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Test 4: Status Summary */}
          <section className="p-6 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">📊 Status Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-green-400">✅ What's Working</h3>
                <ul className="space-y-1 text-sm">
                  <li>• ClientOnlyChart with dynamic imports</li>
                  <li>• SSR-safe chart rendering</li>
                  <li>• Data fetching from APIs</li>
                  <li>• Chart fallback states</li>
                  <li>• Manual chart implementations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-orange-400">⚠️ Issues Found</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Direct Recharts imports cause SSR issues</li>
                  <li>• BaseChart component not SSR-compatible</li>
                  <li>• Chart libraries need client-side only loading</li>
                  <li>• Some components missing dynamic imports</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Solution Recommendations */}
          <section className="p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-green-400">
              🚀 Recommended Solutions
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">1.</span>
                <p>Replace all direct Recharts imports with ClientOnlyChart wrapper</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">2.</span>
                <p>Use dynamic imports with ssr: false for all chart libraries</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">3.</span>
                <p>Implement proper loading states while charts mount</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">4.</span>
                <p>Add error boundaries around chart components</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-400 font-bold">5.</span>
                <p>Create fallback CSS charts for critical data visualization</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}