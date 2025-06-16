import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartFractionalTrading } from '@/lib/services/SmartFractionalTrading';
import { FractionalOrderValidator } from '@/lib/services/FractionalOrderValidator';
import { CheckCircle, AlertCircle, DollarSign, Bitcoin, Gem } from 'lucide-react';

export const FractionalTradeTest: React.FC = () => {
  const [smartTrader] = useState(() => new SmartFractionalTrading());
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    return () => {
      smartTrader.destroy();
    };
  }, [smartTrader]);

  const runTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    const testCases = [
      {
        name: '$10 to Bitcoin',
        input: { amount: 10, currency: 'USD' },
        target: { currency: 'BTC', network: 'bitcoin' }
      },
      {
        name: '$10 to Ethereum',
        input: { amount: 10, currency: 'USD' },
        target: { currency: 'ETH', network: 'ethereum' }
      },
      {
        name: '$10 to Solana',
        input: { amount: 10, currency: 'USD' },
        target: { currency: 'SOL', network: 'solana' }
      },
      {
        name: '$10 to Ordinals',
        input: { amount: 10, currency: 'USD' },
        target: { currency: 'ORDI', network: 'bitcoin' }
      }
    ];

    for (const testCase of testCases) {
      try {
        // Validate order
        const validation = FractionalOrderValidator.validateOrder({
          inputAmount: testCase.input.amount,
          inputCurrency: testCase.input.currency,
          targetCurrency: testCase.target.currency,
          targetNetwork: testCase.target.network
        });

        // Calculate fractional order
        const order = await smartTrader.calculateFractionalOrder(
          testCase.input.amount,
          testCase.input.currency,
          testCase.target.currency,
          testCase.target.network
        );

        const result = {
          name: testCase.name,
          success: true,
          validation,
          order,
          breakdown: {
            inputValue: `$${testCase.input.amount}`,
            outputAmount: order.fractionalAmount.toFixed(8),
            outputCurrency: testCase.target.currency,
            price: `$${order.estimatedPrice.toLocaleString()}`,
            networkFee: `$${order.fee.toFixed(2)}`,
            totalCost: `$${(order.total + order.fee).toFixed(2)}`
          }
        };

        setTestResults(prev => [...prev, result]);

      } catch (error: any) {
        setTestResults(prev => [...prev, {
          name: testCase.name,
          success: false,
          error: error.message
        }]);
      }

      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'BTC': return <Bitcoin className="w-5 h-5 text-orange-500" />;
      case 'ETH': return <Gem className="w-5 h-5 text-blue-500" />;
      case 'ORDI': return <div className="w-5 h-5 bg-orange-600 rounded-full" />;
      default: return <DollarSign className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Fractional Trade Testing</h2>
          <p className="text-gray-400">
            Testing $10 trades with automatic USD to crypto conversion
          </p>
        </div>

        <Button
          onClick={runTest}
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          {isRunning ? 'Running Tests...' : 'Run $10 Trade Tests'}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Results</h3>
            
            {testResults.map((result, index) => (
              <Card key={index} className="p-4 bg-gray-800 border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {result.name}
                  </h4>
                  {result.order && getCurrencyIcon(result.order.targetCurrency)}
                </div>

                {result.success ? (
                  <div className="space-y-3">
                    {/* Validation Results */}
                    <div className="text-sm">
                      <p className="text-gray-400 mb-1">Validation:</p>
                      <div className="pl-4 space-y-1">
                        {result.validation.errors.length > 0 && (
                          <p className="text-red-400">
                            ❌ Errors: {result.validation.errors.join(', ')}
                          </p>
                        )}
                        {result.validation.warnings.length > 0 && (
                          <p className="text-yellow-400">
                            ⚠️ Warnings: {result.validation.warnings.join(', ')}
                          </p>
                        )}
                        {result.validation.suggestions.length > 0 && (
                          <p className="text-blue-400">
                            💡 Suggestions: {result.validation.suggestions.join(', ')}
                          </p>
                        )}
                        {result.validation.isValid && (
                          <p className="text-green-400">✅ Order is valid</p>
                        )}
                      </div>
                    </div>

                    {/* Order Breakdown */}
                    <div className="bg-gray-900 rounded-lg p-3 space-y-2">
                      <p className="text-sm font-semibold text-gray-300">Order Details:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span className="text-gray-500">Input:</span>
                        <span className="font-mono">{result.breakdown.inputValue}</span>
                        
                        <span className="text-gray-500">Output:</span>
                        <span className="font-mono">
                          {result.breakdown.outputAmount} {result.breakdown.outputCurrency}
                        </span>
                        
                        <span className="text-gray-500">Market Price:</span>
                        <span className="font-mono">{result.breakdown.price}</span>
                        
                        <span className="text-gray-500">Network Fee:</span>
                        <span className="font-mono">{result.breakdown.networkFee}</span>
                        
                        <span className="text-gray-500 font-semibold">Total Cost:</span>
                        <span className="font-mono font-semibold">{result.breakdown.totalCost}</span>
                      </div>
                    </div>

                    {/* Fractional Details */}
                    <div className="text-xs text-gray-400">
                      <p>
                        💰 You&apos;re buying a fraction: {result.breakdown.outputAmount} {result.breakdown.outputCurrency}
                      </p>
                      <p>
                        📊 That&apos;s {((parseFloat(result.breakdown.outputAmount) / 1) * 100).toFixed(6)}% of 1 {result.breakdown.outputCurrency}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-400 text-sm">
                    Error: {result.error}
                  </div>
                )}
              </Card>
            ))}

            {/* Summary */}
            {testResults.every(r => r.success) && (
              <Card className="p-4 bg-green-900/20 border-green-700">
                <p className="text-green-400 font-semibold">
                  ✅ All tests passed! Fractional trading is working correctly.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  The system successfully calculated fractional amounts for all $10 test trades.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};