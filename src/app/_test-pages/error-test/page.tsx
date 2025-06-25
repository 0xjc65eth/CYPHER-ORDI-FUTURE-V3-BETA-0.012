'use client';

import { useState } from 'react';
import { safe } from '@/lib/utils/SafeDataAccess';
import { APIService, BitcoinAPI } from '@/lib/services/APIService';
import { GlobalErrorHandler } from '@/lib/errors/GlobalErrorHandler';

export default function ErrorTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test 1: SafeDataAccess for undefined values
  const testSafeDataAccess = () => {
    addResult('Testing SafeDataAccess...');
    
    const testObj: any = {
      data: {
        price: 50000,
        nested: null
      }
    };

    // Test safe get
    const price = safe.get(testObj, 'data.price', 0);
    addResult(`✅ Safe get price: ${price}`);

    // Test undefined path
    const missing = safe.get(testObj, 'data.nested.value.deep', 'default');
    addResult(`✅ Safe get missing: ${missing}`);

    // Test array safety
    const notArray = safe.array(testObj.data.items, []);
    addResult(`✅ Safe array: ${JSON.stringify(notArray)}`);
  };

  // Test 2: Date validation
  const testDateValidation = () => {
    addResult('Testing Date Validation...');

    // Test valid date
    const validDate = safe.date('2024-01-01');
    addResult(`✅ Valid date: ${validDate.toISOString()}`);

    // Test invalid date
    const invalidDate = safe.date('invalid-date');
    addResult(`✅ Invalid date handled: ${invalidDate.toISOString()}`);

    // Test null date
    const nullDate = safe.date(null);
    addResult(`✅ Null date handled: ${nullDate.toISOString()}`);

    // Test formatDate
    const formatted = safe.formatDate('2024-01-01', 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    addResult(`✅ Formatted date: ${formatted}`);

    // Test invalid formatDate
    const invalidFormatted = safe.formatDate('invalid');
    addResult(`✅ Invalid format handled: ${invalidFormatted}`);
  };

  // Test 3: API Service with retry
  const testAPIService = async () => {
    addResult('Testing API Service...');

    try {
      // Test successful API call
      const price = await BitcoinAPI.getPrice();
      addResult(`✅ Bitcoin price fetched: $${price}`);
    } catch (error) {
      addResult(`❌ API call failed: ${error}`);
    }

    // Test API with invalid endpoint (should retry and fail gracefully)
    try {
      await APIService.get('/api/invalid-endpoint', { retries: 2, retryDelay: 500 });
      addResult('❌ Invalid endpoint should have failed');
    } catch (error: any) {
      addResult(`✅ Invalid endpoint handled: ${error.message}`);
    }

    // Test cache
    addResult('Testing API cache...');
    const start = Date.now();
    await APIService.get('/api/bitcoin-price');
    const firstCall = Date.now() - start;
    
    const start2 = Date.now();
    await APIService.get('/api/bitcoin-price');
    const secondCall = Date.now() - start2;
    
    addResult(`✅ First call: ${firstCall}ms, Second call (cached): ${secondCall}ms`);
  };

  // Test 4: Error boundaries
  const testErrorBoundary = () => {
    addResult('Testing Error Boundary...');
    
    // This will throw an error that should be caught by the ErrorBoundary
    throw new Error('Test error for boundary');
  };

  // Test 5: Global error handler
  const testGlobalErrorHandler = () => {
    addResult('Testing Global Error Handler...');
    
    // Simulate different error types
    // 1. Undefined property access
    try {
      const obj: any = null;
      const value = obj.property.nested;
    } catch (error: any) {
      addResult(`✅ Caught undefined error: ${error.message}`);
    }

    // 2. Promise rejection
    Promise.reject('Test rejection').catch(() => {
      addResult('✅ Unhandled rejection caught');
    });

    // Get error stats
    const stats = GlobalErrorHandler.getErrorStats();
    addResult(`✅ Error stats: ${JSON.stringify(stats)}`);
  };

  // Run all tests
  const runAllTests = async () => {
    setTestResults([]);
    
    testSafeDataAccess();
    testDateValidation();
    await testAPIService();
    testGlobalErrorHandler();
    
    addResult('✅ All tests completed!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Error Handling Test Suite</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={runAllTests}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Run All Tests
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={testSafeDataAccess}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              Test SafeDataAccess
            </button>
            
            <button
              onClick={testDateValidation}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              Test Date Validation
            </button>
            
            <button
              onClick={testAPIService}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              Test API Service
            </button>
            
            <button
              onClick={testGlobalErrorHandler}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
            >
              Test Global Error Handler
            </button>
          </div>
          
          <button
            onClick={testErrorBoundary}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Test Error Boundary (Will Crash Component)
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2 font-mono text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-400">No tests run yet. Click a button above to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className={result.includes('✅') ? 'text-green-400' : result.includes('❌') ? 'text-red-400' : 'text-gray-300'}>
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}