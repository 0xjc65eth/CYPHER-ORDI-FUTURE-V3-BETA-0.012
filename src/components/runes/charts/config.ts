import { ChartConfig } from './types';

// Bloomberg Terminal Dark Theme Configuration
export const BLOOMBERG_DARK_THEME: ChartConfig = {
  theme: 'dark',
  colors: {
    primary: '#FF6B35',      // Bloomberg Orange
    secondary: '#FFA500',    // Secondary Orange
    accent: '#FFD700',       // Gold accent
    background: '#000000',   // Pure black background
    text: '#FFFFFF',         // White text
    grid: '#1A1A1A',        // Dark grid lines
    candleUp: '#00FF41',     // Matrix green for up candles
    candleDown: '#FF3333',   // Red for down candles
    volume: '#FF6B35',       // Orange for volume
    ma20: '#00BFFF',         // Light blue for MA20
    ma50: '#FF69B4',         // Pink for MA50
    bid: '#00FF41',          // Green for bids
    ask: '#FF3333',          // Red for asks
  },
  animation: {
    duration: 300,
    easing: 'ease-out',
  },
  responsive: true,
};

// Chart formatting utilities
export const formatters = {
  price: (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    }
    return `$${value.toFixed(8)}`;
  },

  volume: (value: number): string => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(0);
  },

  percentage: (value: number): string => {
    return `${value.toFixed(2)}%`;
  },

  timestamp: (value: number): string => {
    return new Date(value).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  date: (value: string): string => {
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
    });
  },

  holders: (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  },
};

// Chart dimensions
export const CHART_DIMENSIONS = {
  small: { width: 300, height: 200 },
  medium: { width: 500, height: 300 },
  large: { width: 800, height: 400 },
  xlarge: { width: 1200, height: 600 },
};

// Animation configurations
export const ANIMATION_CONFIG = {
  fast: { duration: 200, easing: 'ease-out' },
  normal: { duration: 300, easing: 'ease-out' },
  slow: { duration: 500, easing: 'ease-in-out' },
};

// Grid configurations
export const GRID_CONFIG = {
  strokeDasharray: '2 2',
  stroke: BLOOMBERG_DARK_THEME.colors.grid,
  strokeWidth: 0.5,
};

// Tooltip styles
export const TOOLTIP_STYLES = {
  contentStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    border: `1px solid ${BLOOMBERG_DARK_THEME.colors.primary}`,
    borderRadius: '8px',
    color: BLOOMBERG_DARK_THEME.colors.text,
    fontSize: '12px',
    padding: '12px',
    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
  },
  labelStyle: {
    color: BLOOMBERG_DARK_THEME.colors.primary,
    fontWeight: 'bold',
  },
};

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
};

// Chart-specific configurations
export const CANDLESTICK_CONFIG = {
  strokeWidth: 1,
  strokeOpacity: 0.8,
  fillOpacity: 0.9,
};

export const VOLUME_CONFIG = {
  fillOpacity: 0.6,
  strokeWidth: 0,
};

export const DEPTH_CONFIG = {
  fillOpacity: 0.3,
  strokeWidth: 2,
  strokeOpacity: 0.8,
};

export const DISTRIBUTION_CONFIG = {
  fillOpacity: 0.8,
  strokeWidth: 1,
  strokeOpacity: 0.9,
};