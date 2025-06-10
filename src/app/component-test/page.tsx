'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { devDebugger, withDebugTracking, useDebugTracking, logger } from '@/lib/debug/developmentUtils';
import DebugDashboard from '@/components/debug/DebugDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';

// Import chart components for testing
import dynamic from 'next/dynamic';

// Dynamically import chart components with debugging
const SafeChart = dynamic(() => import('@/components/charts/SafeChart'), {
  loading: () => <ComponentLoader name="SafeChart" />,
  ssr: false,
});

const SimpleChart = dynamic(() => import('@/components/charts/SimpleChart'), {
  loading: () => <ComponentLoader name="SimpleChart" />,
  ssr: false,
});

const BitcoinPriceChart = dynamic(() => import('@/components/charts/bitcoin/BitcoinPriceChart'), {
  loading: () => <ComponentLoader name="BitcoinPriceChart" />,
  ssr: false,
});

const NeuralPredictionChart = dynamic(() => import('@/components/charts/ai/NeuralPredictionChart'), {
  loading: () => <ComponentLoader name="NeuralPredictionChart" />,
  ssr: false,
});

// Test data generators
const generateMockData = (type: 'price' | 'volume' | 'neural') => {
  const now = Date.now();
  const data = [];
  
  for (let i = 0; i < 100; i++) {
    const timestamp = now - (100 - i) * 60000; // 1 minute intervals
    let value;
    
    switch (type) {
      case 'price':
        value = 50000 + Math.sin(i / 10) * 5000 + Math.random() * 1000;
        break;
      case 'volume':
        value = Math.random() * 1000000;
        break;
      case 'neural':
        value = 50000 + Math.sin(i / 15) * 8000 + Math.random() * 2000;
        break;
      default:
        value = Math.random() * 100;
    }
    
    data.push({
      timestamp,
      value,
      time: timestamp / 1000,
    });
  }
  
  return data;
};

// Component loader with debugging
function ComponentLoader({ name }: { name: string }) {
  useDebugTracking(`${name}Loader`);
  
  return (
    <div className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading {name}...</p>
      </div>
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary, componentName }: { 
  error: Error; 
  resetErrorBoundary: () => void;
  componentName?: string;
}) {
  useEffect(() => {
    logger.error(componentName || 'Unknown', error);
    devDebugger.trackComponentError(componentName || 'Unknown', error, { renderPhase: 'mount' });
  }, [error, componentName]);

  return (
    <div className="p-4 border-2 border-red-300 bg-red-50 dark:bg-red-900/20 rounded">
      <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">
        ❌ Component Error: {componentName}
      </h3>
      <details className="mb-3">
        <summary className="cursor-pointer text-red-700 dark:text-red-300">Error Details</summary>
        <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
          {error.message}
          {error.stack && `\n${error.stack}`}
        </pre>
      </details>
      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        size="sm"
        className="text-red-700 border-red-300 hover:bg-red-100"
      >
        Retry Component
      </Button>
    </div>
  );
}

// Test scenario configurations
const testScenarios = {
  'normal': {
    name: 'Normal Data',
    props: {},
    description: 'Standard data with normal values'
  },
  'empty': {
    name: 'Empty Data',
    props: { data: [] },
    description: 'Test with empty data array'
  },
  'null': {
    name: 'Null Data',
    props: { data: null },
    description: 'Test with null data'
  },
  'undefined': {
    name: 'Undefined Data',
    props: { data: undefined },
    description: 'Test with undefined data'
  },
  'large': {
    name: 'Large Dataset',
    props: { data: generateMockData('price').concat(generateMockData('price')) },
    description: 'Test with large amount of data'
  },
  'malformed': {
    name: 'Malformed Data',
    props: { data: [{ invalid: 'data' }, { another: 'bad', entry: true }] },
    description: 'Test with malformed data structure'
  },
  'rapid': {
    name: 'Rapid Updates',
    props: { enableRapidUpdates: true },
    description: 'Test with rapid prop updates'
  }
};

// Available components for testing
const availableComponents = {
  SafeChart: { component: SafeChart, defaultProps: { data: generateMockData('price') } },
  SimpleChart: { component: SimpleChart, defaultProps: { data: generateMockData('price') } },
  BitcoinPriceChart: { component: BitcoinPriceChart, defaultProps: {} },
  NeuralPredictionChart: { component: NeuralPredictionChart, defaultProps: { data: generateMockData('neural') } },
};

export default function ComponentTestPage() {
  const [selectedComponent, setSelectedComponent] = useState<keyof typeof availableComponents>('SafeChart');
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof testScenarios>('normal');
  const [isAutoTesting, setIsAutoTesting] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showDebugDashboard, setShowDebugDashboard] = useState(true);

  useDebugTracking('ComponentTestPage');

  // Auto testing effect
  useEffect(() => {
    if (isAutoTesting) {
      const scenarios = Object.keys(testScenarios);
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        setSelectedScenario(scenarios[currentIndex] as keyof typeof testScenarios);
        currentIndex = (currentIndex + 1) % scenarios.length;
        
        // Log test result
        setTestResults(prev => [...prev, {
          component: selectedComponent,
          scenario: scenarios[currentIndex],
          timestamp: new Date(),
          success: true // This would be determined by error boundary
        }]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isAutoTesting, selectedComponent]);

  const currentComponent = availableComponents[selectedComponent];
  const currentScenario = testScenarios[selectedScenario];
  const testProps = {
    ...currentComponent.defaultProps,
    ...currentScenario.props
  };

  const runAllTests = () => {
    logger.component('ComponentTestPage', 'Running all tests');
    
    Object.keys(testScenarios).forEach((scenario, index) => {
      setTimeout(() => {
        setSelectedScenario(scenario as keyof typeof testScenarios);
        logger.component('ComponentTestPage', `Testing scenario: ${scenario}`);
      }, index * 1000);
    });
  };

  const clearTestResults = () => {
    setTestResults([]);
    devDebugger.clearDebugData();
    logger.component('ComponentTestPage', 'Test results cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧪 Component Testing Lab
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test individual components with various data scenarios and debug issues
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Component</label>
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value as keyof typeof availableComponents)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                {Object.keys(availableComponents).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Test Scenario</label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as keyof typeof testScenarios)}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                {Object.entries(testScenarios).map(([key, scenario]) => (
                  <option key={key} value={key}>{scenario.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <Button
                onClick={() => setIsAutoTesting(!isAutoTesting)}
                variant={isAutoTesting ? "destructive" : "default"}
                className="mb-2"
              >
                {isAutoTesting ? '⏹️ Stop Auto Test' : '▶️ Auto Test'}
              </Button>
            </div>

            <div className="flex flex-col justify-end">
              <Button onClick={runAllTests} variant="outline" className="mb-2">
                🔄 Run All Tests
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setShowDebugDashboard(!showDebugDashboard)}
              variant="outline"
              size="sm"
            >
              {showDebugDashboard ? '🔍 Hide Debug' : '🔍 Show Debug'}
            </Button>
            <Button onClick={clearTestResults} variant="outline" size="sm">
              🗑️ Clear Results
            </Button>
          </div>
        </Card>

        {/* Current Test Info */}
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">
              Testing: {selectedComponent}
            </h3>
            <Badge variant={isAutoTesting ? "default" : "secondary"}>
              {isAutoTesting ? 'Auto Testing' : 'Manual'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Scenario:</strong> {currentScenario.description}
          </p>
          <details className="mt-2">
            <summary className="text-sm cursor-pointer text-blue-600 dark:text-blue-400">
              View Test Props
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
              {JSON.stringify(testProps, null, 2)}
            </pre>
          </details>
        </Card>

        {/* Component Test Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Component Render */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Component Output</h3>
            <ErrorBoundary
              FallbackComponent={(props) => (
                <ErrorFallback {...props} componentName={selectedComponent} />
              )}
              onReset={() => logger.component(selectedComponent, 'Error boundary reset')}
              resetKeys={[selectedComponent, selectedScenario]}
            >
              <Suspense fallback={<ComponentLoader name={selectedComponent} />}>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 min-h-64">
                  {React.createElement(currentComponent.component, testProps)}
                </div>
              </Suspense>
            </ErrorBoundary>
          </Card>

          {/* Test Results */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm">No test results yet</p>
              ) : (
                testResults.slice(-10).reverse().map((result, index) => (
                  <div key={index} className={`p-2 rounded border ${
                    result.success 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                      : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {result.component} - {result.scenario}
                      </span>
                      <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
                        {result.success ? '✅' : '❌'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Test Gallery */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Test Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(availableComponents).map(([name, config]) => (
              <div key={name} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">{name}</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedComponent(name as keyof typeof availableComponents)}
                    className="text-xs"
                  >
                    Test
                  </Button>
                </div>
                <ErrorBoundary
                  FallbackComponent={(props) => (
                    <div className="text-xs text-red-600 p-2 bg-red-50 rounded">
                      Error: {props.error.message}
                    </div>
                  )}
                  resetKeys={[name]}
                >
                  <Suspense fallback={<div className="h-20 bg-gray-100 rounded animate-pulse"></div>}>
                    <div className="h-20 overflow-hidden">
                      {React.createElement(config.component, {
                        ...config.defaultProps,
                        data: generateMockData('price').slice(0, 20) // Smaller dataset for gallery
                      })}
                    </div>
                  </Suspense>
                </ErrorBoundary>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Debug Dashboard */}
      {showDebugDashboard && (
        <DebugDashboard isVisible={true} position="bottom-right" />
      )}
    </div>
  );
}