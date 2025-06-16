'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Loader2, Wallet, RefreshCw } from 'lucide-react';
import BitcoinWalletConnectButton from '@/components/wallet/BitcoinWalletConnectButton';
import BitcoinWalletDetails from '@/components/wallet/BitcoinWalletDetails';
import { useBitcoinWallet } from '@/hooks/useBitcoinWallet';
import { getBitcoinWallet } from '@/services/BitcoinWalletConnect';
import { getHiroApi } from '@/services/HiroApiService';

export default function WalletTestPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testAddress, setTestAddress] = useState('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'); // Example Bitcoin address

  const {
    isConnected,
    walletState,
    availableWallets,
    getFormattedBalance,
    getFormattedAddress
  } = useBitcoinWallet();

  // Test wallet detection
  const testWalletDetection = async () => {
    try {
      const bitcoinWallet = getBitcoinWallet();
      const wallets = bitcoinWallet.detectWallets();
      
      return {
        success: true,
        walletsFound: wallets.length,
        wallets: wallets.map(w => ({ name: w.name, id: w.id }))
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Test Hiro API Service
  const testHiroApiService = async () => {
    try {
      const hiroApi = getHiroApi();
      
      // Test multiple endpoints
      const [balance, ordinals, runes, networkStats] = await Promise.allSettled([
        hiroApi.getBitcoinBalance(testAddress),
        hiroApi.getOrdinals(testAddress, 10),
        hiroApi.getRunesBalances(testAddress),
        hiroApi.getNetworkStats()
      ]);

      return {
        success: true,
        balance: balance.status === 'fulfilled' ? balance.value : null,
        ordinals: ordinals.status === 'fulfilled' ? ordinals.value : null,
        runes: runes.status === 'fulfilled' ? runes.value : null,
        networkStats: networkStats.status === 'fulfilled' ? networkStats.value : null
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Test service integration
  const testServiceIntegration = async () => {
    try {
      const bitcoinWallet = getBitcoinWallet();
      const currentState = bitcoinWallet.getWalletState();
      
      return {
        success: true,
        walletState: currentState,
        isConnected: currentState.isConnected,
        hasAddress: !!currentState.address
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults({});

    try {
      // Test 1: Wallet Detection
      console.log('Running wallet detection test...');
      const walletDetectionResult = await testWalletDetection();
      setTestResults(prev => ({ ...prev, walletDetection: walletDetectionResult }));

      // Test 2: Hiro API Service
      console.log('Running Hiro API service test...');
      const hiroApiResult = await testHiroApiService();
      setTestResults(prev => ({ ...prev, hiroApi: hiroApiResult }));

      // Test 3: Service Integration
      console.log('Running service integration test...');
      const integrationResult = await testServiceIntegration();
      setTestResults(prev => ({ ...prev, integration: integrationResult }));

      console.log('All tests completed');
    } catch (error: any) {
      console.error('Error running tests:', error);
      setTestResults(prev => ({ ...prev, error: error.message }));
    } finally {
      setIsRunningTests(false);
    }
  };

  // Run tests on component mount
  useEffect(() => {
    runAllTests();
  }, []);

  const renderTestResult = (testName: string, result: any) => {
    if (!result) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          <span className="text-gray-500">Running...</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={result.success ? 'text-green-600' : 'text-red-600'}>
            {result.success ? 'Passed' : 'Failed'}
          </span>
        </div>
        
        {result.error && (
          <p className="text-sm text-red-600">Error: {result.error}</p>
        )}
        
        {result.success && (
          <div className="text-sm text-gray-600">
            {testName === 'walletDetection' && (
              <p>Found {result.walletsFound} wallet(s): {result.wallets?.map(w => w.name).join(', ')}</p>
            )}
            
            {testName === 'hiroApi' && (
              <div>
                <p>✓ Balance API: {result.balance ? 'Working' : 'Failed'}</p>
                <p>✓ Ordinals API: {result.ordinals ? 'Working' : 'Failed'}</p>
                <p>✓ Runes API: {result.runes ? 'Working' : 'Failed'}</p>
                <p>✓ Network Stats: {result.networkStats ? 'Working' : 'Failed'}</p>
              </div>
            )}
            
            {testName === 'integration' && (
              <div>
                <p>✓ Wallet State: {result.walletState ? 'Loaded' : 'Failed'}</p>
                <p>✓ Connection Status: {result.isConnected ? 'Connected' : 'Not connected'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bitcoin Wallet Connect Test Suite
          </h1>
          <p className="text-gray-600">
            Testing Bitcoin wallet connectivity, Hiro API integration, and service functionality
          </p>
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Test Results
              </CardTitle>
              <Button
                onClick={runAllTests}
                disabled={isRunningTests}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRunningTests ? 'animate-spin' : ''}`} />
                Run Tests
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test 1: Wallet Detection */}
            <div>
              <h3 className="font-semibold mb-2">1. Wallet Detection Test</h3>
              {renderTestResult('walletDetection', testResults.walletDetection)}
            </div>

            <Separator />

            {/* Test 2: Hiro API Service */}
            <div>
              <h3 className="font-semibold mb-2">2. Hiro API Service Test</h3>
              {renderTestResult('hiroApi', testResults.hiroApi)}
            </div>

            <Separator />

            {/* Test 3: Service Integration */}
            <div>
              <h3 className="font-semibold mb-2">3. Service Integration Test</h3>
              {renderTestResult('integration', testResults.integration)}
            </div>
          </CardContent>
        </Card>

        {/* Available Wallets */}
        <Card>
          <CardHeader>
            <CardTitle>Available Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            {availableWallets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div>
                      <p className="font-medium">{wallet.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {wallet.id}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No Bitcoin wallets detected. Please install a supported wallet (Xverse, Unisat, OKX, or Leather).
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <BitcoinWalletConnectButton />
            </div>
            
            {isConnected && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully connected to {walletState.walletType} wallet!
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Wallet Type</p>
                    <p className="font-semibold capitalize">{walletState.walletType}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="font-mono text-sm">{getFormattedAddress()}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Balance</p>
                    <p className="font-semibold">{getFormattedBalance().btc} BTC</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Details */}
        {isConnected && (
          <BitcoinWalletDetails />
        )}

        {/* Raw Test Data */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Test Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}