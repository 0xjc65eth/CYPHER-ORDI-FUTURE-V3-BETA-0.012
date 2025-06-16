'use client';

import { useState } from 'react';
import { useBacktesting } from '@/hooks/useBacktesting';
import { strategies } from '@/lib/backtesting/strategies';
import { Play, Square, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function BacktestingPanel() {
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);
  const { runBacktest, results, isRunning, progress, error, stop } = useBacktesting();

  const handleRunBacktest = async () => {
    // Mock historical data - in production, fetch real data
    const mockData = generateMockData(1000);
    await runBacktest(selectedStrategy, mockData);
  };

  return (
    <div className="space-y-4">
      {/* Strategy Selector */}
      <div className="bg-zinc-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Select Strategy</h3>
        <select
          value={selectedStrategy.name}
          onChange={(e) => {
            const strategy = strategies.find(s => s.name === e.target.value);
            if (strategy) setSelectedStrategy(strategy);
          }}
          className="w-full bg-zinc-800 rounded px-3 py-2 text-white"
          disabled={isRunning}
        >
          {strategies.map(strategy => (
            <option key={strategy.name} value={strategy.name}>
              {strategy.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-zinc-400 mt-2">{selectedStrategy.description}</p>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={isRunning ? stop : handleRunBacktest}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
            isRunning 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-4 h-4" />
              Stop Backtest
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Backtest
            </>
          )}
        </button>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="bg-zinc-900 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Processing...</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && !isRunning && (
        <div className="bg-zinc-900 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Backtest Results
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Total Return</p>
              <p className={`text-xl font-bold ${
                results.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {results.totalReturn >= 0 ? '+' : ''}{results.totalReturn.toFixed(2)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">Win Rate</p>
              <p className="text-xl font-bold">{results.winRate.toFixed(1)}%</p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">Total Trades</p>
              <p className="text-xl font-bold">{results.totalTrades}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">Sharpe Ratio</p>
              <p className="text-xl font-bold">{results.sharpeRatio.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">Max Drawdown</p>
              <p className="text-xl font-bold text-red-500">
                -{results.maxDrawdown.toFixed(1)}%
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">Profit Factor</p>
              <p className="text-xl font-bold">{results.profitFactor.toFixed(2)}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Profitable Trades</span>
              <span className="text-green-500">{results.profitableTrades}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-zinc-400">Average Profit</span>
              <span className="text-green-500">+${results.averageProfit.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-zinc-400">Average Loss</span>
              <span className="text-red-500">-${results.averageLoss.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Generate mock historical data for testing
function generateMockData(count: number): any[] {
  const data = [];
  let price = 50000;
  let ma20 = price;
  let ma50 = price;
  
  for (let i = 0; i < count; i++) {
    // Random walk
    price = price * (1 + (Math.random() - 0.5) * 0.02);
    
    // Update moving averages
    ma20 = ma20 * 0.95 + price * 0.05;
    ma50 = ma50 * 0.98 + price * 0.02;
    
    data.push({
      timestamp: Date.now() - (count - i) * 60000,
      open: price * 0.99,
      high: price * 1.01,
      low: price * 0.98,
      close: price,
      volume: Math.random() * 1000000,
      ma20,
      ma50,
      rsi: 30 + Math.random() * 40,
      macd: (ma20 - ma50) / 100,
      signal: (ma20 - ma50) / 100 * 0.9,
      histogram: (ma20 - ma50) / 100 * 0.1,
      upperBand: price * 1.02,
      lowerBand: price * 0.98,
      volumeMA: 500000
    });
  }
  
  return data;
}
