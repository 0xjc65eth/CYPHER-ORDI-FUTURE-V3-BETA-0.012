'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { devDebugger, logger } from '@/lib/debug/developmentUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  timestamp: Date;
}

interface RenderMetric {
  componentName: string;
  renderTime: number;
  renderCount: number;
  averageRenderTime: number;
  lastRender: Date;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  autoTrack?: boolean;
  trackingInterval?: number;
  onPerformanceIssue?: (metric: PerformanceMetric) => void;
}

export default function PerformanceMonitor({
  isVisible = true,
  autoTrack = true,
  trackingInterval = 1000,
  onPerformanceIssue
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [renderMetrics, setRenderMetrics] = useState<Map<string, RenderMetric>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(autoTrack);
  const [memoryTrend, setMemoryTrend] = useState<number[]>([]);
  const [fpsTrend, setFpsTrend] = useState<number[]>([]);
  
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const observerRef = useRef<PerformanceObserver | null>(null);

  // FPS calculation
  const calculateFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTimeRef.current;
    
    if (delta >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / delta);
      setFpsTrend(prev => [...prev.slice(-29), fps]); // Keep last 30 values
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
      return fps;
    }
    
    frameCountRef.current++;
    return null;
  }, []);

  // Memory usage calculation
  const getMemoryMetrics = useCallback((): PerformanceMetric[] => {
    const metrics: PerformanceMetric[] = [];
    
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const memory = (window.performance as any).memory;
      
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
      
      setMemoryTrend(prev => [...prev.slice(-29), usedMB]); // Keep last 30 values
      
      metrics.push({
        name: 'Memory Usage',
        value: usedMB,
        unit: 'MB',
        threshold: limitMB * 0.8, // 80% of limit
        status: usedMB > limitMB * 0.9 ? 'critical' : usedMB > limitMB * 0.7 ? 'warning' : 'good',
        timestamp: new Date()
      });
      
      metrics.push({
        name: 'Memory Utilization',
        value: (usedMB / totalMB) * 100,
        unit: '%',
        threshold: 80,
        status: (usedMB / totalMB) > 0.9 ? 'critical' : (usedMB / totalMB) > 0.7 ? 'warning' : 'good',
        timestamp: new Date()
      });
    }
    
    return metrics;
  }, []);

  // Performance observer for paint and navigation timing
  const setupPerformanceObserver = useCallback(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const newMetrics: PerformanceMetric[] = [];

        entries.forEach((entry) => {
          switch (entry.entryType) {
            case 'paint':
              newMetrics.push({
                name: entry.name === 'first-paint' ? 'First Paint' : 'First Contentful Paint',
                value: entry.startTime,
                unit: 'ms',
                threshold: entry.name === 'first-paint' ? 1000 : 1500,
                status: entry.startTime > (entry.name === 'first-paint' ? 2000 : 3000) ? 'critical' : 
                        entry.startTime > (entry.name === 'first-paint' ? 1000 : 1500) ? 'warning' : 'good',
                timestamp: new Date()
              });
              break;

            case 'largest-contentful-paint':
              newMetrics.push({
                name: 'Largest Contentful Paint',
                value: entry.startTime,
                unit: 'ms',
                threshold: 2500,
                status: entry.startTime > 4000 ? 'critical' : entry.startTime > 2500 ? 'warning' : 'good',
                timestamp: new Date()
              });
              break;

            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                newMetrics.push({
                  name: 'Cumulative Layout Shift',
                  value: (entry as any).value,
                  unit: '',
                  threshold: 0.1,
                  status: (entry as any).value > 0.25 ? 'critical' : (entry as any).value > 0.1 ? 'warning' : 'good',
                  timestamp: new Date()
                });
              }
              break;
          }
        });

        if (newMetrics.length > 0) {
          setMetrics(prev => [...prev, ...newMetrics].slice(-50)); // Keep last 50 metrics
          
          // Check for performance issues
          newMetrics.forEach(metric => {
            if (metric.status !== 'good' && onPerformanceIssue) {
              onPerformanceIssue(metric);
            }
          });
        }
      });

      observerRef.current.observe({ 
        entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] 
      });
    } catch (error) {
      logger.error('PerformanceMonitor', error as Error);
    }
  }, [onPerformanceIssue]);

  // Component render tracking
  const updateRenderMetrics = useCallback(() => {
    const componentData = devDebugger.getComponentInfo() as Map<string, any>;
    const newRenderMetrics = new Map<string, RenderMetric>();

    componentData.forEach((data, name) => {
      const renderTime = data.performance?.renderTime || 0;
      const existing = renderMetrics.get(name);
      
      const metric: RenderMetric = {
        componentName: name,
        renderTime,
        renderCount: data.renderCount,
        averageRenderTime: existing 
          ? (existing.averageRenderTime * (data.renderCount - 1) + renderTime) / data.renderCount
          : renderTime,
        lastRender: data.lastRender
      };

      newRenderMetrics.set(name, metric);
    });

    setRenderMetrics(newRenderMetrics);
  }, [renderMetrics]);

  // Main monitoring loop
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // Update FPS
      const fps = calculateFPS();
      
      // Update memory metrics
      const memoryMetrics = getMemoryMetrics();
      if (memoryMetrics.length > 0) {
        setMetrics(prev => [...prev, ...memoryMetrics].slice(-50));
      }

      // Add FPS metric if calculated
      if (fps !== null) {
        const fpsMetric: PerformanceMetric = {
          name: 'Frame Rate',
          value: fps,
          unit: 'FPS',
          threshold: 30,
          status: fps < 15 ? 'critical' : fps < 30 ? 'warning' : 'good',
          timestamp: new Date()
        };
        
        setMetrics(prev => [...prev, fpsMetric].slice(-50));
        
        if (fps < 15 && onPerformanceIssue) {
          onPerformanceIssue(fpsMetric);
        }
      }

      // Update render metrics
      updateRenderMetrics();
    }, trackingInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, trackingInterval, calculateFPS, getMemoryMetrics, updateRenderMetrics, onPerformanceIssue]);

  // Setup performance observer
  useEffect(() => {
    if (isMonitoring) {
      setupPerformanceObserver();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isMonitoring, setupPerformanceObserver]);

  // FPS tracking frame
  useEffect(() => {
    if (isMonitoring) {
      const frame = () => {
        calculateFPS();
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
  }, [isMonitoring, calculateFPS]);

  if (!isVisible || process.env.NODE_ENV !== 'development') return null;

  const recentMetrics = metrics.slice(-10);
  const criticalMetrics = recentMetrics.filter(m => m.status === 'critical');
  const warningMetrics = recentMetrics.filter(m => m.status === 'warning');
  const slowComponents = Array.from(renderMetrics.values())
    .filter(r => r.averageRenderTime > 16)
    .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
    .slice(0, 5);

  const currentFPS = fpsTrend[fpsTrend.length - 1] || 0;
  const currentMemory = memoryTrend[memoryTrend.length - 1] || 0;

  return (
    <Card className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">🔬 Performance Monitor</h2>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"}>
            {isMonitoring ? '🟢 Active' : '🔴 Inactive'}
          </Badge>
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant="outline"
            size="sm"
          >
            {isMonitoring ? 'Pause' : 'Start'}
          </Button>
          <Button
            onClick={() => {
              setMetrics([]);
              setRenderMetrics(new Map());
              setMemoryTrend([]);
              setFpsTrend([]);
            }}
            variant="outline"
            size="sm"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-2xl font-bold text-blue-600">{currentFPS}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">FPS</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-2xl font-bold text-green-600">{currentMemory.toFixed(1)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Memory (MB)</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-2xl font-bold text-orange-600">{criticalMetrics.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Critical Issues</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <div className="text-2xl font-bold text-yellow-600">{warningMetrics.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
        </div>
      </div>

      {/* Issues */}
      {(criticalMetrics.length > 0 || warningMetrics.length > 0) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">⚠️ Performance Issues</h3>
          <div className="space-y-2">
            {criticalMetrics.map((metric, index) => (
              <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-800 dark:text-red-200">
                    🚨 {metric.name}
                  </span>
                  <Badge variant="destructive">
                    {metric.value.toFixed(1)}{metric.unit}
                  </Badge>
                </div>
              </div>
            ))}
            {warningMetrics.map((metric, index) => (
              <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    ⚠️ {metric.name}
                  </span>
                  <Badge variant="default">
                    {metric.value.toFixed(1)}{metric.unit}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slow Components */}
      {slowComponents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🐌 Slow Components</h3>
          <div className="space-y-2">
            {slowComponents.map((component, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                <div>
                  <span className="font-medium">{component.componentName}</span>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {component.renderCount} renders
                  </div>
                </div>
                <Badge variant="default">
                  {component.averageRenderTime.toFixed(1)}ms avg
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FPS Trend */}
        <div>
          <h3 className="text-lg font-semibold mb-3">📈 FPS Trend</h3>
          <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded p-3 flex items-end space-x-1">
            {fpsTrend.slice(-20).map((fps, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t ${
                  fps >= 30 ? 'bg-green-500' : fps >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ height: `${Math.max((fps / 60) * 100, 5)}%` }}
                title={`${fps} FPS`}
              ></div>
            ))}
          </div>
        </div>

        {/* Memory Trend */}
        <div>
          <h3 className="text-lg font-semibold mb-3">💾 Memory Trend</h3>
          <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded p-3 flex items-end space-x-1">
            {memoryTrend.slice(-20).map((memory, index) => {
              const maxMemory = Math.max(...memoryTrend, 50);
              return (
                <div
                  key={index}
                  className="flex-1 bg-blue-500 rounded-t"
                  style={{ height: `${Math.max((memory / maxMemory) * 100, 5)}%` }}
                  title={`${memory.toFixed(1)} MB`}
                ></div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Metrics */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">📊 Recent Metrics</h3>
        <div className="max-h-40 overflow-y-auto">
          <div className="space-y-1">
            {recentMetrics.reverse().map((metric, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-2 rounded text-sm ${
                  metric.status === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    : metric.status === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                }`}
              >
                <span>{metric.name}</span>
                <div className="text-right">
                  <div>{metric.value.toFixed(1)}{metric.unit}</div>
                  <div className="text-xs opacity-75">
                    {metric.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}