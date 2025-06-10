'use client';

import React from 'react';
import { TrendingUp, RefreshCw, BarChart3, AlertCircle, Download } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from './button';
import { Card } from './card';

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  chartType?: string;
  dataSource?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallbackData?: any[];
  showFallbackChart?: boolean;
}

// Simple fallback chart component
function SimpleFallbackChart({ data }: { data?: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-32 bg-gray-800/50 rounded border-2 border-dashed border-gray-600 flex items-center justify-center">
        <p className="text-gray-500 text-sm">No chart data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-32 bg-gray-800/50 rounded relative overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 300 100">
        {/* Simple line chart */}
        <polyline
          fill="none"
          stroke="rgb(249 115 22)"
          strokeWidth="2"
          points={data.map((point, index) => 
            `${(index / (data.length - 1)) * 300},${80 - (point.value || 0) * 60}`
          ).join(' ')}
        />
        {/* Grid lines */}
        <g stroke="rgb(75 85 99)" strokeWidth="0.5" opacity="0.3">
          <line x1="0" y1="25" x2="300" y2="25" />
          <line x1="0" y1="50" x2="300" y2="50" />
          <line x1="0" y1="75" x2="300" y2="75" />
        </g>
      </svg>
      <div className="absolute top-2 left-2 text-xs text-gray-400">
        Fallback Chart
      </div>
    </div>
  );
}

// Chart-specific error fallback
function ChartErrorFallback({ 
  error, 
  retry, 
  chartType,
  dataSource,
  fallbackData,
  showFallbackChart 
}: { 
  error?: Error; 
  retry: () => void;
  chartType?: string;
  dataSource?: string;
  fallbackData?: any[];
  showFallbackChart?: boolean;
}) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [downloadingData, setDownloadingData] = React.useState(false);

  const isDataError = error?.message?.includes('data') || error?.message?.includes('undefined');
  const isRenderError = error?.message?.includes('render') || error?.message?.includes('Element type');
  const isNetworkError = error?.message?.includes('fetch') || error?.message?.includes('network');

  const getErrorIcon = () => {
    if (isNetworkError) return AlertCircle;
    if (isDataError) return BarChart3;
    return TrendingUp;
  };

  const getErrorTitle = () => {
    if (isNetworkError) return 'Chart Data Loading Error';
    if (isDataError) return 'Chart Data Format Error';
    if (isRenderError) return 'Chart Rendering Error';
    return `${chartType || 'Chart'} Error`;
  };

  const getErrorMessage = () => {
    if (isNetworkError) {
      return `Failed to load data from ${dataSource || 'data source'}. Check your internet connection.`;
    }
    if (isDataError) {
      return 'The chart data is in an invalid format or contains missing values.';
    }
    if (isRenderError) {
      return 'The chart component failed to render. This might be due to a library issue.';
    }
    return error?.message || 'An unexpected error occurred while rendering the chart.';
  };

  const downloadErrorData = async () => {
    setDownloadingData(true);
    try {
      const errorData = {
        error: error?.message,
        stack: error?.stack,
        chartType,
        dataSource,
        timestamp: new Date().toISOString(),
        fallbackData
      };
      
      const blob = new Blob([JSON.stringify(errorData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chart-error-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download error data:', err);
    }
    setDownloadingData(false);
  };

  const ErrorIcon = getErrorIcon();

  return (
    <Card className="w-full bg-gray-900 border-orange-500/20">
      <div className="p-4">
        {/* Error Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <ErrorIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              {getErrorTitle()}
            </h3>
            <p className="text-xs text-gray-400">
              {getErrorMessage()}
            </p>
          </div>
        </div>

        {/* Fallback Chart */}
        {showFallbackChart && fallbackData && fallbackData.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Fallback Chart</span>
            </div>
            <SimpleFallbackChart data={fallbackData} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={retry}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Button
              onClick={downloadErrorData}
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-600 hover:bg-gray-800 h-8 text-xs"
              disabled={downloadingData}
            >
              <Download className="w-3 h-3 mr-1" />
              {downloadingData ? 'Downloading...' : 'Download Error'}\n            </Button>
          )}
        </div>

        {/* Chart Info */}
        {(chartType || dataSource) && (
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            {chartType && (
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="text-gray-300 ml-1">{chartType}</span>
              </div>
            )}
            {dataSource && (
              <div>
                <span className="text-gray-500">Source:</span>
                <span className="text-gray-300 ml-1">{dataSource}</span>
              </div>
            )}
          </div>
        )}

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="border-t border-gray-800 pt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              <span>Technical Details</span>
              <span className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showDetails && (
              <div className="mt-2 space-y-2">
                <div className="bg-gray-800 rounded p-2">
                  <h5 className="text-xs font-medium text-gray-400 mb-1">Error:</h5>
                  <p className="text-xs text-red-400 font-mono break-all">{error.message}</p>
                </div>
                <div className="bg-gray-800 rounded p-2">
                  <h5 className="text-xs font-medium text-gray-400 mb-1">Stack:</h5>
                  <pre className="text-xs text-red-400 overflow-auto max-h-20 font-mono whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function ChartErrorBoundary({ 
  children, 
  chartType,
  dataSource,
  onError,
  fallbackData,
  showFallbackChart = true
}: ChartErrorBoundaryProps) {
  const chartErrorHandler = React.useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log chart-specific error
    console.group('📊 Chart Error Boundary');
    console.error('Chart Type:', chartType);
    console.error('Data Source:', dataSource);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.groupEnd();

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Report to error tracking with chart context
    if (process.env.NODE_ENV === 'production') {
      try {
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.captureException(error, {
            contexts: {
              chart: {
                type: chartType,
                dataSource,
                componentStack: errorInfo.componentStack,
              },
            },
            tags: {
              errorBoundary: 'chart',
              chartType: chartType || 'unknown',
            },
          });
        }
      } catch (reportingError) {
        console.error('Failed to report chart error:', reportingError);
      }
    }
  }, [chartType, dataSource, onError]);

  return (
    <ErrorBoundary
      name={`Chart_${chartType || 'Unknown'}`}
      level="component"
      onError={chartErrorHandler}
      fallback={(props) => (
        <ChartErrorFallback 
          {...props}
          chartType={chartType}
          dataSource={dataSource}
          fallbackData={fallbackData}
          showFallbackChart={showFallbackChart}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// HOC for wrapping chart components
export function withChartErrorBoundary<P extends object>(
  ChartComponent: React.ComponentType<P>,
  options?: {
    chartType?: string;
    dataSource?: string;
    fallbackData?: any[];
    showFallbackChart?: boolean;
  }
) {
  const WrappedChart = (props: P) => (
    <ChartErrorBoundary
      chartType={options?.chartType || ChartComponent.displayName || ChartComponent.name}
      dataSource={options?.dataSource}
      fallbackData={options?.fallbackData}
      showFallbackChart={options?.showFallbackChart}
    >
      <ChartComponent {...props} />
    </ChartErrorBoundary>
  );

  WrappedChart.displayName = `withChartErrorBoundary(${ChartComponent.displayName || ChartComponent.name})`;
  
  return WrappedChart;
}

export default ChartErrorBoundary;