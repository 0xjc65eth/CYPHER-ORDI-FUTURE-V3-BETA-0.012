'use client';

// Error Boundary Usage Examples
// This file demonstrates how to use the comprehensive error boundary system

import React from 'react';
import { 
  ErrorBoundary, 
  ChartErrorBoundary, 
  DashboardErrorBoundary,
  withErrorBoundary,
  withChartErrorBoundary,
  withDashboardErrorBoundary
} from '@/components/ui/error-boundaries';
import { SafeChartWrapper } from '@/components/charts/SafeChartWrapper';

// Example 1: Basic Error Boundary Usage
function BasicExample() {
  return (
    <ErrorBoundary level="component" name="BasicExample">
      <div>This component is protected by an error boundary</div>
    </ErrorBoundary>
  );
}

// Example 2: Chart with Error Boundary
function ChartExample() {
  const chartData = [
    { time: '2023-01-01', price: 40000 },
    { time: '2023-01-02', price: 42000 },
    { time: '2023-01-03', price: 41000 },
  ];

  return (
    <ChartErrorBoundary 
      chartType="Price Chart" 
      dataSource="CoinGecko API"
      fallbackData={chartData}
    >
      {/* Your chart component here */}
      <div className="w-full h-64 bg-gray-800 rounded flex items-center justify-center">
        <span className="text-gray-400">Chart Component Would Go Here</span>
      </div>
    </ChartErrorBoundary>
  );
}

// Example 3: Dashboard Section with Error Boundary
function DashboardExample() {
  return (
    <DashboardErrorBoundary 
      section="Portfolio Overview" 
      critical={false}
      fallbackMode="safe"
    >
      <div className="p-4 bg-gray-900 rounded">
        <h3 className="text-white mb-4">Portfolio Overview</h3>
        <p className="text-gray-400">Protected dashboard section</p>
      </div>
    </DashboardErrorBoundary>
  );
}

// Example 4: Using HOCs for Error Boundaries
const SafeComponent = withErrorBoundary(
  function MyComponent() {
    return <div>This component is automatically wrapped with error boundary</div>;
  },
  { level: 'component', name: 'MyComponent' }
);

const SafeChart = withChartErrorBoundary(
  function MyChart({ data }: { data: any[] }) {
    return <div>Chart with data: {data.length} points</div>;
  },
  { chartType: 'Custom Chart', dataSource: 'API' }
);

const SafeDashboard = withDashboardErrorBoundary(
  function MyDashboard() {
    return <div>Dashboard section content</div>;
  },
  { section: 'Analytics', critical: true }
);

// Example 5: Nested Error Boundaries
function NestedExample() {
  return (
    <DashboardErrorBoundary section="Main Dashboard" critical={true}>
      <div className="space-y-4">
        <ErrorBoundary level="component" name="Header">
          <header className="bg-gray-800 p-4 rounded">
            <h1 className="text-white">Dashboard Header</h1>
          </header>
        </ErrorBoundary>

        <div className="grid grid-cols-2 gap-4">
          <ChartErrorBoundary chartType="Price Chart" dataSource="Live API">
            <div className="bg-gray-800 p-4 rounded h-32">Price Chart</div>
          </ChartErrorBoundary>

          <ChartErrorBoundary chartType="Volume Chart" dataSource="Live API">
            <div className="bg-gray-800 p-4 rounded h-32">Volume Chart</div>
          </ChartErrorBoundary>
        </div>

        <ErrorBoundary level="component" name="Footer">
          <footer className="bg-gray-800 p-4 rounded">
            <p className="text-gray-400">Dashboard Footer</p>
          </footer>
        </ErrorBoundary>
      </div>
    </DashboardErrorBoundary>
  );
}

// Example 6: Safe Chart Wrapper Usage
function SafeChartExample() {
  const data = [
    { time: Date.now() - 86400000, value: 0.5 },
    { time: Date.now(), value: 0.7 },
  ];

  return (
    <SafeChartWrapper
      chartType="Bitcoin Price"
      dataSource="CoinGecko"
      data={data}
      className="w-full h-64"
    >
      {/* Your actual chart component */}
      <div className="w-full h-full bg-gradient-to-r from-orange-900/20 to-orange-600/20 rounded flex items-center justify-center">
        <span className="text-orange-400">Your Chart Component Here</span>
      </div>
    </SafeChartWrapper>
  );
}

// Example 7: Component that intentionally throws error (for testing)
function ErrorThrowingComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined');
  }
  
  return <div className="text-green-400">No error thrown</div>;
}

// Example 8: Complete error boundary showcase
export function ErrorBoundaryShowcase() {
  const [showError, setShowError] = React.useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Error Boundary System Demo</h1>
        <p className="text-gray-400">Comprehensive error handling for CYPHER ORDI</p>
      </div>

      {/* Error Testing Controls */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-3">Error Testing</h2>
        <button
          onClick={() => setShowError(!showError)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          {showError ? 'Fix Error' : 'Trigger Error'}
        </button>
        
        <div className="mt-4">
          <ErrorBoundary level="component" name="TestComponent">
            <ErrorThrowingComponent shouldError={showError} />
          </ErrorBoundary>
        </div>
      </div>

      {/* Basic Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Basic Error Boundary</h3>
          <BasicExample />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Chart Error Boundary</h3>
          <ChartExample />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Dashboard Error Boundary</h3>
          <DashboardExample />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Safe Chart Wrapper</h3>
          <SafeChartExample />
        </div>
      </div>

      {/* HOC Examples */}
      <div className="bg-gray-900 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-3">HOC Examples</h2>
        <div className="space-y-4">
          <SafeComponent />
          <SafeChart data={[1, 2, 3]} />
          <SafeDashboard />
        </div>
      </div>

      {/* Nested Example */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Nested Error Boundaries</h2>
        <NestedExample />
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-950 border border-blue-800 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-200 mb-3">Implementation Guide</h2>
        <div className="text-sm text-blue-300 space-y-2">
          <p><strong>1. Basic Usage:</strong> Wrap components with ErrorBoundary</p>
          <p><strong>2. Charts:</strong> Use ChartErrorBoundary or SafeChartWrapper</p>
          <p><strong>3. Dashboard:</strong> Use DashboardErrorBoundary for sections</p>
          <p><strong>4. HOCs:</strong> Use withErrorBoundary for automatic wrapping</p>
          <p><strong>5. Critical Sections:</strong> Set critical=true for important components</p>
          <p><strong>6. Recovery:</strong> Error boundaries include automatic retry mechanisms</p>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundaryShowcase;