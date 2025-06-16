'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

// TradingView Widget Configuration Types
export interface TradingViewConfig {
  symbol: string;
  interval: string;
  height: string | number;
  theme: 'light' | 'dark' | 'auto';
  showVolume?: boolean;
  showIndicators?: boolean;
  allowSymbolChange?: boolean;
  allowIntervalChange?: boolean;
  saveImage?: boolean;
  autosize?: boolean;
  studies?: string[];
  locale?: string;
  timezone?: string;
}

export interface TradingViewWidgetProps extends Partial<TradingViewConfig> {
  containerId?: string;
  onSymbolChange?: (symbol: string) => void;
  onIntervalChange?: (interval: string) => void;
  onReady?: () => void;
  onError?: (error: string) => void;
}

// TradingView Symbol Mapping
const symbolMapping: Record<string, string> = {
  'BTCUSD': 'BINANCE:BTCUSDT',
  'ETHUSD': 'BINANCE:ETHUSDT',
  'SOLUSD': 'BINANCE:SOLUSDT',
  'ADAUSD': 'BINANCE:ADAUSDT',
  'DOTUSD': 'BINANCE:DOTUSDT',
  'AVAXUSD': 'BINANCE:AVAXUSDT',
  'MATICUSD': 'BINANCE:MATICUSDT',
  'LINKUSD': 'BINANCE:LINKUSDT',
  'UNIUSD': 'BINANCE:UNIUSDT',
  'LTCUSD': 'BINANCE:LTCUSDT'
};

// Advanced Studies/Indicators
const technicalStudies = [
  'RSI@tv-basicstudies',
  'MACD@tv-basicstudies', 
  'BB@tv-basicstudies',
  'MA@tv-basicstudies',
  'Volume@tv-basicstudies',
  'StochasticRSI@tv-basicstudies',
  'WilliamsR@tv-basicstudies',
  'ATR@tv-basicstudies',
  'CCI@tv-basicstudies',
  'ADX@tv-basicstudies'
];

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'BTCUSD',
  interval = '60',
  height = 500,
  theme = 'auto',
  showVolume = true,
  showIndicators = true,
  allowSymbolChange = true,
  allowIntervalChange = true,
  saveImage = true,
  autosize = true,
  studies = [],
  locale = 'en',
  timezone = 'Etc/UTC',
  containerId,
  onSymbolChange,
  onIntervalChange,
  onReady,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = 3;
  const finalContainerId = containerId || `tradingview_${Date.now()}`;

  // Load TradingView Script
  useEffect(() => {
    const loadTradingViewScript = () => {
      // Check if script already exists
      if (document.getElementById('tradingview-script')) {
        setIsScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'tradingview-script';
      script.type = 'text/javascript';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.async = true;

      script.onload = () => {
        setIsScriptLoaded(true);
      };

      script.onerror = () => {
        setError('Failed to load TradingView script');
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    loadTradingViewScript();

    return () => {
      // Cleanup script if component unmounts
      const script = document.getElementById('tradingview-script');
      if (script && retryCount === 0) {
        document.head.removeChild(script);
      }
    };
  }, [retryCount]);

  // Initialize Widget
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current) return;

    const initializeWidget = () => {
      try {
        // Clear previous widget
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Map symbol to TradingView format
        const tvSymbol = symbolMapping[symbol] || symbol;

        // Convert interval format
        const tvInterval = convertInterval(interval);

        // Determine theme
        const currentTheme = theme === 'auto' 
          ? (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
          : theme;

        // Widget configuration
        const widgetConfig = {
          autosize: autosize,
          symbol: tvSymbol,
          interval: tvInterval,
          timezone: timezone,
          theme: currentTheme,
          style: "1", // Candlestick style
          locale: locale,
          toolbar_bg: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
          enable_publishing: false,
          withdateranges: true,
          range: "YTD",
          hide_side_toolbar: false,
          allow_symbol_change: allowSymbolChange,
          save_image: saveImage,
          container_id: finalContainerId,
          studies: showIndicators ? [...studies, ...technicalStudies.slice(0, 3)] : studies,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          details: true,
          hotlist: true,
          calendar: true,
          support_host: "https://www.tradingview.com"
        };

        // Add volume if enabled
        if (showVolume) {
          widgetConfig.studies = [...(widgetConfig.studies || []), 'Volume@tv-basicstudies'];
        }

        // Create widget
        if (window.TradingView) {
          widgetRef.current = new window.TradingView.widget(widgetConfig);
          
          // Widget callbacks
          widgetRef.current.onChartReady(() => {
            setIsLoading(false);
            setError(null);
            onReady?.();
          });

          // Symbol change callback
          if (onSymbolChange) {
            widgetRef.current.subscribe('symbol', onSymbolChange);
          }

          // Interval change callback  
          if (onIntervalChange) {
            widgetRef.current.subscribe('interval', onIntervalChange);
          }

        } else {
          throw new Error('TradingView library not available');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
      }
    };

    // Delay initialization to ensure DOM is ready
    const timeoutId = setTimeout(initializeWidget, 100);

    return () => {
      clearTimeout(timeoutId);
      if (widgetRef.current && widgetRef.current.remove) {
        widgetRef.current.remove();
      }
    };
  }, [
    isScriptLoaded, 
    symbol, 
    interval, 
    theme, 
    showVolume, 
    showIndicators,
    allowSymbolChange,
    allowIntervalChange,
    saveImage,
    autosize,
    studies,
    locale,
    timezone,
    finalContainerId,
    onSymbolChange,
    onIntervalChange,
    onReady,
    onError
  ]);

  // Interval converter for TradingView format
  const convertInterval = (interval: string): string => {
    const intervalMap: Record<string, string> = {
      '1m': '1',
      '5m': '5', 
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1d': '1D',
      '1w': '1W',
      '1M': '1M'
    };
    return intervalMap[interval] || interval;
  };

  // Retry handler
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setIsLoading(true);
      setIsScriptLoaded(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <Card className="w-full" style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <div className="text-center">
            <p className="text-sm font-medium">Loading TradingView Chart</p>
            <p className="text-xs text-gray-500 mt-1">
              {symbol.replace('USD', '/USD')} • {interval}
            </p>
          </div>
          <Badge variant="outline" className="animate-pulse">
            Professional Charts
          </Badge>
        </div>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="w-full border-red-200 dark:border-red-800" style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
              Chart Loading Failed
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md">
              {error}
            </p>
            {retryCount < maxRetries && (
              <p className="text-xs text-gray-500 mt-1">
                Attempt {retryCount + 1} of {maxRetries + 1}
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            {retryCount < maxRetries && (
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            <Button 
              onClick={() => window.open('https://www.tradingview.com', '_blank')} 
              variant="ghost" 
              size="sm"
            >
              Open TradingView
            </Button>
          </div>

          {/* Fallback Chart Option */}
          <div className="text-center mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">
              Chart unavailable? Try our built-in charts:
            </p>
            <div className="flex gap-2 justify-center">
              <Badge variant="secondary" className="text-xs">Candlestick</Badge>
              <Badge variant="secondary" className="text-xs">Line Chart</Badge>
              <Badge variant="secondary" className="text-xs">Area Chart</Badge>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Main Widget Container
  return (
    <div className="w-full relative" style={{ height }}>
      <div
        ref={containerRef}
        id={finalContainerId}
        className="w-full h-full rounded-md overflow-hidden"
        style={{ height }}
      />
      
      {/* Watermark */}
      <div className="absolute bottom-2 right-2 opacity-50">
        <Badge variant="outline" className="text-xs bg-white/80 dark:bg-gray-900/80">
          Powered by TradingView
        </Badge>
      </div>
    </div>
  );
};

// Type declaration for TradingView global
declare global {
  interface Window {
    TradingView: {
      widget: new (config: any) => any;
    };
  }
}

export default TradingViewWidget;