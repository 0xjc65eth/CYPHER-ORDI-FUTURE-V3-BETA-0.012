# 📊 CYPHER ORDI FUTURE v3 - Chart System Documentation

## Overview

This document outlines the unified chart system for the Bitcoin analytics platform, designed for optimal performance and professional financial data visualization.

## Quick Start

### Basic Usage

```tsx
import { UnifiedChartSystem } from '@/components/charts/UnifiedChartSystem';

// Simple price chart
<UnifiedChartSystem 
  symbol="BTCUSDT" 
  type="line" 
  height={400} 
/>

// Advanced trading chart
<UnifiedChartSystem 
  symbol="BTCUSDT" 
  type="trading" 
  library="lightweight"
  showVolume={true}
  showIndicators={true}
  height={600} 
/>
```

## Chart Libraries

### 1. Lightweight Charts (Recommended for Trading)
- **Best for:** Candlestick charts, advanced trading analysis
- **Features:** High performance, real-time updates, professional trading tools
- **Use cases:** Main trading interface, detailed price analysis

### 2. Recharts (Recommended for Analytics)
- **Best for:** Line charts, area charts, bar charts
- **Features:** React-native, responsive, good customization
- **Use cases:** Dashboard widgets, overview charts, portfolio analytics

### 3. Simple Charts (Fallback)
- **Best for:** Basic visualizations, error fallback
- **Features:** Lightweight, reliable, minimal dependencies
- **Use cases:** Error states, simple data display

## Chart Types

### Trading Charts
```tsx
<UnifiedChartSystem 
  symbol="BTCUSDT"
  type="trading"
  library="lightweight"
  showVolume={true}
  showIndicators={true}
/>
```

### Line Charts
```tsx
<UnifiedChartSystem 
  symbol="BTCUSDT"
  type="line"
  library="recharts"
  height={300}
/>
```

### Area Charts
```tsx
<UnifiedChartSystem 
  symbol="BTCUSDT"
  type="area"
  library="recharts"
  height={300}
/>
```

### Volume Charts
```tsx
<UnifiedChartSystem 
  symbol="BTCUSDT"
  type="bar"
  library="recharts"
  showVolume={true}
/>
```

## Supported Symbols

### Bitcoin & Major Cryptocurrencies
- `BTCUSDT` - Bitcoin
- `ETHUSDT` - Ethereum  
- `SOLUSDT` - Solana
- `ADAUSDT` - Cardano
- `DOTUSDT` - Polkadot
- `AVAXUSDT` - Avalanche
- `MATICUSDT` - Polygon
- `LINKUSDT` - Chainlink

### Time Intervals
- `1m` - 1 Minute
- `5m` - 5 Minutes
- `15m` - 15 Minutes
- `30m` - 30 Minutes
- `1h` - 1 Hour (default)
- `4h` - 4 Hours
- `1d` - 1 Day
- `1w` - 1 Week

## Advanced Features

### Error Handling
All charts include automatic error boundaries and fallback mechanisms:

```tsx
<UnifiedChartSystem 
  symbol="BTCUSDT"
  // Automatically falls back to SimpleChart if advanced charts fail
/>
```

### Performance Optimization
- Lazy loading of chart libraries
- Automatic data decimation for large datasets
- Configurable refresh intervals
- Memory-efficient caching

### Real-time Updates
Charts automatically refresh data every 30 seconds with WebSocket support for higher frequency updates.

### Responsive Design
All charts are fully responsive and adapt to container sizes automatically.

## Configuration

### Theme Configuration
```tsx
import { CHART_THEMES } from '@/lib/charts/config';

// Use dark theme (default)
const darkTheme = CHART_THEMES.dark;

// Use light theme
const lightTheme = CHART_THEMES.light;
```

### Performance Settings
```tsx
import { PERFORMANCE_CONFIG } from '@/lib/charts/config';

// Customize update frequencies
const config = {
  ...PERFORMANCE_CONFIG,
  normalUpdate: 60000 // Update every minute
};
```

## Troubleshooting

### Chart Not Rendering
1. Check browser console for JavaScript errors
2. Verify the symbol format (e.g., 'BTCUSDT', not 'BTC/USDT')
3. Ensure API endpoints are accessible
4. Try forcing simple chart: `library="simple"`

### Performance Issues
1. Reduce chart height: `height={300}`
2. Disable volume: `showVolume={false}`
3. Use simpler chart types: `type="line"`
4. Increase refresh interval

### API Errors
1. Check network connectivity
2. Verify Binance API availability
3. Charts automatically fall back to mock data

## API Integration

### Data Sources
- **Primary:** Binance API (`/api/binance/klines`)
- **Fallback:** Mock data generation
- **WebSocket:** Real-time price updates

### Data Format
```typescript
interface ChartData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

## Best Practices

### For Trading Applications
- Use `lightweight` library for main charts
- Enable volume: `showVolume={true}`
- Set appropriate height: `height={600}`
- Enable indicators: `showIndicators={true}`

### For Dashboard Widgets
- Use `recharts` library
- Smaller heights: `height={200-300}`
- Simple types: `type="line"` or `type="area"`
- Disable unnecessary features

### For Mobile
- Reduce chart heights
- Simplify chart types
- Use auto-scaling features
- Test on various screen sizes

## Migration from Legacy Charts

### From Old Chart Components
```tsx
// Old way ❌
import { SimpleChart } from './SimpleChart';
import { WorkingChart } from './WorkingChart';

// New way ✅
import { UnifiedChartSystem } from './UnifiedChartSystem';
<UnifiedChartSystem symbol="BTCUSDT" />
```

### Updating Existing Usage
1. Replace individual chart imports with `UnifiedChartSystem`
2. Update prop names to match new interface
3. Remove custom error handling (now built-in)
4. Test chart rendering in different scenarios

## Support

For issues or questions:
1. Check this documentation
2. Review browser console errors
3. Test with different chart types/libraries
4. Use the `ChartDiagnostic` component for debugging