'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import DebugDashboard from '@/components/debug/DebugDashboard';
import PerformanceMonitor from '@/components/debug/PerformanceMonitor';
import { 
  debugManager, 
  initializeDebugTools, 
  consoleLogger, 
  hotReloadManager,
  useDebugTracking,
  useRenderLogger,
  useHotReload 
} from '@/lib/debug';

export default function DevToolsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [debugConfig, setDebugConfig] = useState(debugManager.getConfig());
  const [showDebugDashboard, setShowDebugDashboard] = useState(true);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(true);
  const [demoComponentKey, setDemoComponentKey] = useState(0);

  useDebugTracking('DevToolsPage');
  const { logRender, logError, logWarning } = useRenderLogger('DevToolsPage');
  const { updateCount, triggerReload } = useHotReload('DevToolsPage');

  useEffect(() => {
    logRender({ activeTab, debugConfig });
  }, [activeTab, debugConfig, logRender]);

  const handleConfigChange = (key: string, value: boolean) => {
    const newConfig = { ...debugConfig, [key]: value };
    setDebugConfig(newConfig);
    debugManager.configure(newConfig);
    logWarning('Configuration changed', { [key]: value });
  };

  const generateTestError = () => {
    const error = new Error('This is a test error for debugging purposes');
    logError(error, { testError: true, timestamp: Date.now() });
  };

  const generateTestWarning = () => {
    logWarning('This is a test warning message', { testWarning: true });
  };

  const forceComponentRerender = () => {
    setDemoComponentKey(prev => prev + 1);
    logRender({ forced: true, key: demoComponentKey + 1 });
  };

  const exportDebugData = () => {
    const logs = consoleLogger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tools = [
    {
      id: 'debug-dashboard',
      name: 'Debug Dashboard',
      description: 'Real-time component tracking with error monitoring',
      icon: '🔍',
      enabled: debugConfig.enableDebugDashboard,
      component: showDebugDashboard ? <DebugDashboard isVisible={true} position="bottom-right" /> : null
    },
    {
      id: 'performance-monitor',
      name: 'Performance Monitor',
      description: 'FPS, memory usage, and render time tracking',
      icon: '⚡',
      enabled: debugConfig.enablePerformanceMonitor,
      component: showPerformanceMonitor ? <PerformanceMonitor isVisible={true} /> : null
    },
    {
      id: 'console-logger',
      name: 'Console Logger',
      description: 'Enhanced console logging with component tracking',
      icon: '📝',
      enabled: debugConfig.enableConsoleLogging,
      component: null
    },
    {
      id: 'hot-reload',
      name: 'Hot Reload Manager',
      description: 'Smart hot reloading with state preservation',
      icon: '🔄',
      enabled: debugConfig.enableHotReload,
      component: null
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🛠️ Development & Debug Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comprehensive debugging tools for identifying and fixing dashboard issues
          </p>
          <div className="flex gap-2">
            <Badge variant="default">Hot Reload Updates: {updateCount}</Badge>
            <Badge variant={process.env.NODE_ENV === 'development' ? 'default' : 'secondary'}>
              {process.env.NODE_ENV === 'development' ? '🟢 Development' : '🔴 Production'}
            </Badge>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1">
            {['overview', 'testing', 'monitoring', 'configuration'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Tools Overview */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Available Debug Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-4 border rounded-lg ${
                      tool.enabled
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{tool.icon}</span>
                      <Badge variant={tool.enabled ? 'default' : 'secondary'}>
                        {tool.enabled ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tool.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {tool.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button onClick={generateTestError} variant="destructive" size="sm">
                  🚨 Test Error
                </Button>
                <Button onClick={generateTestWarning} variant="default" size="sm">
                  ⚠️ Test Warning
                </Button>
                <Button onClick={forceComponentRerender} variant="outline" size="sm">
                  🔄 Force Rerender
                </Button>
                <Button onClick={triggerReload} variant="outline" size="sm">
                  🔥 Hot Reload
                </Button>
                <Button onClick={() => consoleLogger.clearLogs()} variant="outline" size="sm">
                  🧹 Clear Logs
                </Button>
                <Button onClick={exportDebugData} variant="outline" size="sm">
                  💾 Export Data
                </Button>
                <Button 
                  onClick={() => window.location.href = '/component-test'} 
                  variant="outline" 
                  size="sm"
                >
                  🧪 Component Test
                </Button>
                <Button 
                  onClick={() => console.log(consoleLogger.getRenderStats())} 
                  variant="outline" 
                  size="sm"
                >
                  📊 Log Stats
                </Button>
              </div>
            </Card>

            {/* Demo Component */}
            <DemoComponent key={demoComponentKey} />
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Component Testing</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Test individual components with various scenarios to identify rendering issues.
              </p>
              <Button onClick={() => window.location.href = '/component-test'}>
                🧪 Open Component Test Lab
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Common Issues & Solutions</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-red-800 dark:text-red-200">
                    "Element type is invalid"
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check imports/exports, ensure components are properly defined, watch for circular dependencies
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Slow Renders (&gt;16ms)
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use React.memo, optimize props, check for unnecessary re-renders
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Memory Leaks
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clean up event listeners, cancel subscriptions in useEffect cleanup
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            {/* Performance Monitor will render here */}
            {tools.find(t => t.id === 'performance-monitor')?.component}
          </div>
        )}

        {activeTab === 'configuration' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Debug Configuration</h2>
            <div className="space-y-4">
              {Object.entries(debugConfig).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getConfigDescription(key)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfigChange(key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Debug Dashboard - Always visible if enabled */}
      {tools.find(t => t.id === 'debug-dashboard')?.component}
    </div>
  );
}

// Demo component for testing
function DemoComponent({ key }: { key?: number }) {
  const [count, setCount] = useState(0);
  const [data, setData] = useState<any[]>([]);
  
  useDebugTracking('DemoComponent', { count }, { data });
  const { logRender, logWarning } = useRenderLogger('DemoComponent');

  useEffect(() => {
    logRender({ count, dataLength: data.length });
  }, [count, data, logRender]);

  const addData = () => {
    setData(prev => [...prev, { id: Date.now(), value: Math.random() }]);
    if (data.length > 10) {
      logWarning('Data array getting large', { length: data.length + 1 });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">🧪 Demo Component</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        This component generates renders and data for debugging purposes.
      </p>
      <div className="flex gap-4 mb-4">
        <Button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </Button>
        <Button onClick={addData} variant="outline">
          Add Data ({data.length})
        </Button>
        <Button onClick={() => setData([])} variant="outline">
          Clear Data
        </Button>
      </div>
      {data.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Latest data: {JSON.stringify(data.slice(-3))}
        </div>
      )}
    </Card>
  );
}

// Helper function for configuration descriptions
function getConfigDescription(key: string): string {
  const descriptions: Record<string, string> = {
    enableDebugDashboard: 'Show real-time component debug dashboard',
    enablePerformanceMonitor: 'Monitor FPS, memory usage, and render times',
    enableConsoleLogging: 'Enhanced console logging with component tracking',
    enableHotReload: 'Smart hot reloading with state preservation',
    persistLogs: 'Keep logs in memory for analysis',
    autoTrackComponents: 'Automatically track component renders'
  };
  
  return descriptions[key] || 'Configuration option';
}