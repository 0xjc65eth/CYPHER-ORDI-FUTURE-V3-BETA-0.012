/**
 * ApexChart Wrapper - Optimized for performance with lazy loading
 */

import React, { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';

interface ApexChartProps {
  data: any[];
  type?: 'line' | 'area' | 'bar' | 'candlestick';
  width?: number | string;
  height?: number | string;
  options?: any;
  onChartReady?: (chart: any) => void;
}

const ApexChartWrapper: React.FC<ApexChartProps> = ({
  data,
  type = 'line',
  width = '100%',
  height = 300,
  options = {},
  onChartReady
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const apexChartRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initChart = async () => {
      try {
        if (!chartRef.current) return;

        // Dynamic import to reduce bundle size
        const ApexCharts = (await import('apexcharts')).default;
        
        if (!isMounted) return;

        const defaultOptions = {
          chart: {
            type,
            width,
            height,
            background: '#111827',
            foreColor: '#f9fafb',
            toolbar: {
              show: false
            }
          },
          theme: {
            mode: 'dark'
          },
          colors: ['#f97316', '#3b82f6', '#10b981', '#f59e0b'],
          stroke: {
            curve: 'smooth',
            width: 2
          },
          grid: {
            borderColor: '#374151'
          },
          xaxis: {
            labels: {
              style: {
                colors: '#9ca3af'
              }
            }
          },
          yaxis: {
            labels: {
              style: {
                colors: '#9ca3af'
              }
            }
          },
          series: data,
          ...options
        };

        const chart = new ApexCharts(chartRef.current, defaultOptions);
        await chart.render();
        
        apexChartRef.current = chart;
        
        if (onChartReady) {
          onChartReady(chart);
        }

        setIsLoading(false);
        logger.debug('ApexChart initialized successfully');
        
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load chart');
          setIsLoading(false);
          logger.error('Failed to initialize ApexChart:', err);
        }
      }
    };

    initChart();

    return () => {
      isMounted = false;
      if (apexChartRef.current) {
        apexChartRef.current.destroy();
        apexChartRef.current = null;
      }
    };
  }, [type, width, height, options, onChartReady]);

  // Update chart when data changes
  useEffect(() => {
    if (apexChartRef.current && data.length > 0) {
      try {
        apexChartRef.current.updateSeries(data);
      } catch (err) {
        logger.warn('Failed to update ApexChart data:', err);
      }
    }
  }, [data]);

  if (error) {
    return (
      <div className="bg-gray-900 border border-red-500/20 rounded p-4 text-center">
        <div className="text-red-400 text-sm">
          Chart Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-900 border border-orange-500/20 rounded flex items-center justify-center"
          style={{ height: typeof height === 'number' ? `${height}px` : height }}
        >
          <div className="text-orange-400 text-sm animate-pulse">
            Loading chart...
          </div>
        </div>
      )}
      <div
        ref={chartRef}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};

export default ApexChartWrapper;