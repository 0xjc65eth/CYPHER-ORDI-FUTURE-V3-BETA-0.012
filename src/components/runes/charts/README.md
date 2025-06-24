# Runes Advanced Charts

Professional trading charts with Bloomberg Terminal styling for the Runes ecosystem. Built with Recharts, TypeScript, and Framer Motion.

## Features

### 🔥 Bloomberg Terminal Theme
- Pure black background with orange accents
- Professional financial data visualization
- Responsive design for all screen sizes
- Smooth animations and transitions

### 📊 Chart Components

#### 1. RunesPriceChart
Advanced candlestick chart with technical indicators:
- **Candlestick visualization** with OHLC data
- **Technical indicators**: MA20, MA50, VWAP, Bollinger Bands, RSI, MACD
- **Zoom and pan controls** for detailed analysis
- **Volume overlay** with separate chart
- **Real-time updates** via SWR
- **Custom tooltips** with formatted data

#### 2. RunesVolumeChart
Volume analysis with trading activity:
- **Period selection**: 1H, 4H, 1D, 1W
- **Trading activity overlay** showing number of trades
- **Volume statistics** panel
- **Color intensity mapping** based on volume
- **Interactive tooltips** with detailed metrics

#### 3. MarketDepthChart
Order book visualization:
- **Bid/Ask area visualization**
- **Market depth analysis** with cumulative volumes
- **Spread calculation** and visualization
- **Mid-price reference line**
- **Real-time order book updates**
- **Depth level controls** (10, 25, 50, 100)

#### 4. HoldersDistributionChart
Token distribution analysis:
- **Pie and bar chart views**
- **Whale concentration metrics**
- **Gini coefficient** for inequality measurement
- **Distribution insights** and statistics
- **Range-based holder analysis**
- **Interactive legends** and controls

## Installation & Usage

### Basic Usage

```tsx
import {
  RunesPriceChart,
  RunesVolumeChart,
  MarketDepthChart,
  HoldersDistributionChart,
} from '@/components/runes/charts';

// Price chart with all features
<RunesPriceChart
  runeId="your-rune-id"
  height={500}
  showVolume={true}
  showIndicators={true}
  zoomable={true}
  realTime={true}
/>

// Volume chart with trades overlay
<RunesVolumeChart
  runeId="your-rune-id"
  height={400}
  period="1d"
  showTrades={true}
/>

// Market depth with spread analysis
<MarketDepthChart
  runeId="your-rune-id"
  height={400}
  showSpread={true}
  maxDepth={50}
/>

// Holders distribution with statistics
<HoldersDistributionChart
  runeId="your-rune-id"
  height={400}
  showPercentage={true}
  showValue={true}
/>
```

### Demo Component

```tsx
import { RunesChartsDemo } from '@/components/runes/charts/RunesChartsDemo';

<RunesChartsDemo runeId="demo-rune" />
```

## API Requirements

The charts expect these API endpoints:

### Price Data - `/api/runes/{runeId}/price`
```typescript
interface RunesPriceData {
  timestamp: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### Volume Data - `/api/runes/{runeId}/volume`
```typescript
interface RunesVolumeData {
  timestamp: number;
  date: string;
  volume: number;
  volumeUSD: number;
  trades: number;
  period: string;
}
```

### Market Depth - `/api/runes/{runeId}/orderbook`
```typescript
interface OrderBookData {
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
}
```

### Holders Distribution - `/api/runes/{runeId}/holders`
```typescript
interface HoldersDistributionData {
  range: string;
  holders: number;
  percentage: number;
  amount: number;
  value: number;
}
```

## Customization

### Theme Configuration

```typescript
import { BLOOMBERG_DARK_THEME } from '@/components/runes/charts/config';

// Customize colors
const customTheme = {
  ...BLOOMBERG_DARK_THEME,
  colors: {
    ...BLOOMBERG_DARK_THEME.colors,
    primary: '#YOUR_COLOR',
  }
};
```

### Formatters

```typescript
import { formatters } from '@/components/runes/charts/config';

// Use built-in formatters
formatters.price(0.00001234); // "$0.00001234"
formatters.volume(1500000); // "1.50M"
formatters.percentage(15.5); // "15.50%"
```

## Technical Indicators

### Available Indicators
- **MA20/MA50**: Moving averages
- **VWAP**: Volume Weighted Average Price
- **Bollinger Bands**: Price volatility bands
- **RSI**: Relative Strength Index
- **MACD**: Moving Average Convergence Divergence

### Toggle Indicators

```tsx
const { indicators, toggleIndicator } = useRunesPriceData('rune-id');

// Toggle specific indicator
toggleIndicator('ma20');
toggleIndicator('vwap');
```

## Performance Features

### Real-time Updates
- **SWR** for efficient data fetching
- **5-second refresh** for price data
- **2-second refresh** for order book
- **Request deduplication** to prevent spam

### Responsive Design
- **Automatic chart resizing**
- **Mobile-optimized tooltips**
- **Breakpoint-aware layouts**
- **Touch-friendly controls**

### Animations
- **Smooth transitions** with Framer Motion
- **Loading states** with spinners
- **Chart entry animations**
- **Interactive hover effects**

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## Dependencies

- `recharts`: Chart library
- `framer-motion`: Animations
- `swr`: Data fetching
- `lucide-react`: Icons
- `tailwindcss`: Styling

## Contributing

1. Follow the Bloomberg Terminal color scheme
2. Maintain TypeScript strict mode
3. Add proper error boundaries
4. Include loading states
5. Test on mobile devices
6. Document new features

## License

MIT License - see project root for details.