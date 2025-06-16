'use client';

import React from 'react';
import {
  MarketTickerTape,
  StockPriceCard,
  ExecutiveCard,
  ChartContainer,
  FinancialMetric,
  ExecutiveSummaryGrid,
  TradingButton,
  FinancialDataTable,
  MarketStatusIndicator,
} from '@/components/ui/WallStreetTheme';
import {
  Bitcoin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

// Mock data for showcase
const mockTickerData = [
  { symbol: 'BTC', price: 67500, change: 1250, changePercent: 1.89 },
  { symbol: 'ETH', price: 3750, change: -45, changePercent: -1.18 },
  { symbol: 'ORDI', price: 42.50, change: 2.15, changePercent: 5.33 },
  { symbol: 'RUNES', price: 0.85, change: 0.12, changePercent: 16.47 },
];

const mockTableData = [
  { Asset: 'BTC', Price: '$67,500', Change: '+1.89%', Volume: '$28.5B', MarketCap: '$1.33T' },
  { Asset: 'ORDI', Price: '$42.50', Change: '+5.33%', Volume: '$125M', MarketCap: '$890M' },
  { Asset: 'RUNES', Price: '$0.85', Change: '+16.47%', Volume: '$45M', MarketCap: '$178M' },
];

export const WallStreetShowcase: React.FC = () => {
  return (
    <div className="ws-theme min-h-screen">
      {/* Market Ticker */}
      <MarketTickerTape items={mockTickerData} />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Wall Street Theme Showcase
            </h1>
            <p className="text-gray-400">
              Professional financial dashboard components and styling
            </p>
          </div>
          <MarketStatusIndicator status="open" />
        </div>

        {/* Price Cards Grid */}
        <ExecutiveSummaryGrid>
          <StockPriceCard
            title="Bitcoin Price"
            value={67500}
            change={1250}
            changePercent={1.89}
            prefix="$"
            icon={<Bitcoin size={24} />}
          />
          
          <StockPriceCard
            title="Portfolio Value"
            value={125000}
            change={3750}
            changePercent={3.09}
            prefix="$"
            icon={<DollarSign size={24} />}
          />
          
          <StockPriceCard
            title="24h Volume"
            value="28.5B"
            prefix="$"
            icon={<BarChart3 size={24} />}
          />
          
          <StockPriceCard
            title="Market Cap"
            value="1.33T"
            prefix="$"
            icon={<PieChart size={24} />}
          />
        </ExecutiveSummaryGrid>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chart Container Example */}
          <ExecutiveCard title="Portfolio Analytics">
            <ChartContainer title="Asset Performance" subtitle="Real-time performance metrics">
              <div className="space-y-4">
                <FinancialMetric
                  label="Total Return"
                  value="25,000"
                  trend="up"
                  prefix="$"
                />
                <FinancialMetric
                  label="Annual ROI"
                  value="18.5%"
                  trend="up"
                />
                <FinancialMetric
                  label="Volatility"
                  value="2.4%"
                  trend="down"
                />
                <FinancialMetric
                  label="Sharpe Ratio"
                  value="1.85"
                  trend="up"
                />
              </div>
            </ChartContainer>
          </ExecutiveCard>

          {/* Trading Interface */}
          <ExecutiveCard title="Trading Interface">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="ws-label">Asset</label>
                  <select className="ws-select w-full">
                    <option>Bitcoin (BTC)</option>
                    <option>Ordinals (ORDI)</option>
                    <option>Runes</option>
                  </select>
                </div>
                <div>
                  <label className="ws-label">Amount</label>
                  <input 
                    type="number" 
                    className="ws-input w-full" 
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <TradingButton variant="buy" size="lg">
                  <TrendingUp size={16} className="mr-2" />
                  Buy Order
                </TradingButton>
                <TradingButton variant="sell" size="lg">
                  <TrendingDown size={16} className="mr-2" />
                  Sell Order
                </TradingButton>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <TradingButton variant="neutral" size="sm">
                  Market
                </TradingButton>
                <TradingButton variant="neutral" size="sm">
                  Limit
                </TradingButton>
                <TradingButton variant="neutral" size="sm">
                  Stop
                </TradingButton>
              </div>
            </div>
          </ExecutiveCard>
        </div>

        {/* Data Table Example */}
        <ExecutiveCard title="Market Data">
          <FinancialDataTable
            headers={['Asset', 'Price', '24h Change', 'Volume', 'Market Cap']}
            data={mockTableData}
          />
        </ExecutiveCard>

        {/* Color Palette Demo */}
        <div className="mt-8">
          <ExecutiveCard title="Color Palette & Components">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="ws-label">Status Indicators</h4>
                <div className="space-y-2">
                  <MarketStatusIndicator status="open" />
                  <MarketStatusIndicator status="closed" />
                  <MarketStatusIndicator status="pre-market" />
                  <MarketStatusIndicator status="after-hours" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="ws-label">Button Variants</h4>
                <div className="space-y-2">
                  <TradingButton variant="buy" size="sm">Buy</TradingButton>
                  <TradingButton variant="sell" size="sm">Sell</TradingButton>
                  <TradingButton variant="neutral" size="sm">Neutral</TradingButton>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="ws-label">Typography</h4>
                <div className="space-y-1">
                  <div className="ws-text-large">Large Text</div>
                  <div className="text-base">Regular Text</div>
                  <div className="ws-text-small">Small Text</div>
                  <div className="ws-text-mono">Monospace</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="ws-label">Color Examples</h4>
                <div className="space-y-1">
                  <div className="ws-positive">Profit Green</div>
                  <div className="ws-negative">Loss Red</div>
                  <div style={{ color: 'var(--ws-gold)' }}>Gold Accent</div>
                  <div className="text-gray-400">Secondary Text</div>
                </div>
              </div>
            </div>
          </ExecutiveCard>
        </div>
      </div>
    </div>
  );
};

export default WallStreetShowcase;