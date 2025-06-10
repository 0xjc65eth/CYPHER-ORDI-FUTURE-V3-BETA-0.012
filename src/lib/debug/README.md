# Development & Debug Tools 🛠️

Comprehensive debugging tools designed to help identify and fix dashboard issues, particularly "Element type is invalid" errors and component rendering problems.

## 🎯 Overview

This debug toolset provides:
- **Real-time component tracking** with error monitoring
- **Performance monitoring** for FPS, memory usage, and render times  
- **Enhanced console logging** with component tracking
- **Smart hot reload** with state preservation
- **Component testing lab** for isolated testing
- **Visual debug dashboard** for development

## 🚀 Quick Start

### 1. Initialize Debug Tools

```typescript
import { initializeDebugTools } from '@/lib/debug';

// Initialize with default settings
initializeDebugTools();

// Or with custom configuration
initializeDebugTools({
  enableDebugDashboard: true,
  enablePerformanceMonitor: true,
  enableConsoleLogging: true,
  enableHotReload: true,
  persistLogs: true
});
```

### 2. Access Debug Pages

- **Development Tools Dashboard**: `/dev-tools`
- **Component Testing Lab**: `/component-test`

### 3. Use Debug Components

```tsx
import { useDebugTracking, useRenderLogger } from '@/lib/debug';

function MyComponent() {
  // Track component renders and errors
  useDebugTracking('MyComponent');
  
  // Enhanced console logging
  const { logRender, logError, logWarning } = useRenderLogger('MyComponent');
  
  useEffect(() => {
    logRender({ someData: 'value' });
  }, []);
  
  return <div>My Component</div>;
}
```

## 🔧 Available Tools

### 1. Debug Dashboard
**Location**: `src/components/debug/DebugDashboard.tsx`

Real-time component monitoring with:
- Component render counts and timing
- Error and warning tracking  
- Performance metrics
- Export functionality

```tsx
import DebugDashboard from '@/components/debug/DebugDashboard';

<DebugDashboard 
  isVisible={true} 
  position="bottom-right" 
/>
```

### 2. Performance Monitor
**Location**: `src/components/debug/PerformanceMonitor.tsx`

Tracks:
- FPS (Frame rate)
- Memory usage and trends
- Slow component renders (>16ms)
- Browser performance metrics

```tsx
import PerformanceMonitor from '@/components/debug/PerformanceMonitor';

<PerformanceMonitor 
  isVisible={true}
  autoTrack={true}
  onPerformanceIssue={(metric) => console.warn(metric)}
/>
```

### 3. Development Utilities
**Location**: `src/lib/debug/developmentUtils.ts`

Core debugging functions:
- Component render tracking
- Error boundary integration
- Element type validation
- React pattern validation

```typescript
import { debugger, withDebugTracking } from '@/lib/debug/developmentUtils';

// Track component manually
debugger.trackComponentRender('ComponentName', props, state);

// Validate element type (catches "Element type is invalid")
debugger.validateElementType(MyComponent, 'MyComponent');

// Higher-order component for automatic tracking
const TrackedComponent = withDebugTracking(MyComponent, 'MyComponent');
```

### 4. Console Loggers
**Location**: `src/lib/debug/consoleLoggers.ts`

Enhanced logging with:
- Color-coded component logging
- Performance timing
- Render count warnings
- Error analysis

```typescript
import { consoleLogger, useRenderLogger } from '@/lib/debug/consoleLoggers';

// Manual logging
consoleLogger.logRender('ComponentName', props, state, renderTime);
consoleLogger.logError('ComponentName', error, context);
consoleLogger.logPerformance('ComponentName', 'renderTime', 25, 'ms');

// React hook
const { logRender, logError, logWarning } = useRenderLogger('ComponentName');
```

### 5. Hot Reload Manager
**Location**: `src/lib/debug/hotReload.ts`

Smart hot reloading with:
- State preservation across reloads
- File change detection
- Update notifications
- React component integration

```typescript
import { hotReloadManager, useHotReload } from '@/lib/debug/hotReload';

// React hook
const { updateCount, registerState, restoreState, triggerReload } = useHotReload('ComponentName');

// Manual state management
hotReloadManager.registerComponentState('ComponentName', state, props);
const restored = hotReloadManager.restoreComponentState('ComponentName');
```

### 6. Component Testing Lab
**Location**: `src/app/component-test/page.tsx`

Isolated component testing with:
- Multiple test scenarios (empty data, null values, large datasets)
- Error boundary testing
- Performance profiling
- Auto-testing mode

## 🎨 Debug Dashboard Features

### Real-time Monitoring
- Live component render tracking
- Error and warning counts
- Performance issue detection
- Auto-refresh functionality

### Component Analysis
- Render count per component
- Average render times
- Last render timestamp
- Error history

### Performance Insights
- FPS trends (frame rate)
- Memory usage patterns
- Slow component identification
- Browser performance metrics

### Error Tracking
- Component error logs with stack traces
- Warning messages
- Error context and timing
- Quick error reproduction

## 🔍 Debugging Common Issues

### "Element type is invalid"

This debug toolset specifically helps identify this error:

```typescript
// The validator catches these issues:
debugger.validateElementType(component, 'ComponentName');

// Common causes detected:
// ❌ Component is undefined/null
// ❌ Wrong import/export syntax  
// ❌ Circular dependencies
// ❌ Component not properly exported
```

### Slow Renders (>16ms)

```typescript
// Performance monitor automatically detects:
// 🐌 Components taking >16ms to render
// ⚡ Performance recommendations
// 📊 Render time trends
```

### Memory Leaks

```typescript
// Monitor memory usage:
// 💾 Memory usage trends
// ⚠️ Memory threshold warnings
// 🔍 Component state tracking
```

### High Render Counts

```typescript
// Console logger warns about:
// 🔄 Components with >10 renders
// ⚠️ Potential infinite render loops
// 📈 Render frequency analysis
```

## 📊 Using the Testing Lab

### Test Scenarios

The component testing lab provides these scenarios:

1. **Normal Data** - Standard operation
2. **Empty Data** - Empty arrays/objects
3. **Null Data** - Null values
4. **Undefined Data** - Undefined values  
5. **Large Dataset** - Performance testing
6. **Malformed Data** - Error handling
7. **Rapid Updates** - Stress testing

### Auto-Testing Mode

```typescript
// Automatically cycles through all scenarios
// Logs results and performance metrics
// Identifies breaking scenarios
```

## 🛡️ Error Boundaries Integration

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary, componentName }) {
  // Automatically logs to debug system
  debugger.trackComponentError(componentName, error);
  
  return (
    <div>
      <h2>Something went wrong in {componentName}</h2>
      <details>{error.message}</details>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

## 📈 Performance Optimization

### Monitoring Metrics

- **FPS**: Target 60fps, warn below 30fps, critical below 15fps
- **Memory**: Monitor heap usage, warn at 80% limit
- **Render Time**: Flag components >16ms (one frame)
- **Bundle Size**: Track module loading performance

### Optimization Tips

1. **Use React.memo** for expensive components
2. **Optimize useEffect dependencies**
3. **Implement virtualization** for large lists
4. **Lazy load** non-critical components
5. **Monitor memory usage** trends

## 🔧 Configuration Options

```typescript
interface DebugConfig {
  enableDebugDashboard?: boolean;     // Show debug dashboard
  enablePerformanceMonitor?: boolean; // Monitor performance metrics
  enableConsoleLogging?: boolean;     // Enhanced console logs
  enableHotReload?: boolean;          // Smart hot reloading
  persistLogs?: boolean;              // Keep logs in memory
  autoTrackComponents?: boolean;      // Auto-track all components
}
```

## 🚨 Production Considerations

⚠️ **Important**: These tools are automatically disabled in production builds.

```typescript
// All debug tools check:
if (process.env.NODE_ENV !== 'development') return;
```

## 📝 Best Practices

### 1. Component Naming
```typescript
// Always provide explicit component names
useDebugTracking('MySpecificComponent');
const TrackedComponent = withDebugTracking(MyComponent, 'MySpecificComponent');
```

### 2. Error Context
```typescript
// Provide rich error context
debugger.trackComponentError('ComponentName', error, {
  props: sanitizedProps,
  state: currentState,
  userAction: 'button-click'
});
```

### 3. Performance Tracking
```typescript
// Track specific operations
const endTracking = debugger.startPerformanceTrack('expensive-operation');
// ... expensive operation
endTracking();
```

### 4. Selective Logging
```typescript
// Configure logging levels
consoleLogger.configure({
  level: 'warn', // Only log warnings and errors
  persist: false // Don't keep logs in memory
});
```

## 🤝 Integration with Existing Code

### Gradual Adoption
1. Start with the debug dashboard for overview
2. Add component tracking to problematic components
3. Use performance monitor for optimization
4. Implement comprehensive logging

### Minimal Integration
```typescript
// Just add to your main layout
import { DebugDashboard } from '@/lib/debug';

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <DebugDashboard isVisible={process.env.NODE_ENV === 'development'} />
    </div>
  );
}
```

## 🆘 Troubleshooting

### Debug Tools Not Working?

1. **Check environment**: Tools only work in development
2. **Verify imports**: Ensure correct import paths
3. **Console errors**: Check browser console for errors
4. **Configuration**: Verify debug config is enabled

### Performance Issues?

1. **Disable unused tools**: Turn off monitoring you don't need
2. **Reduce tracking frequency**: Increase debounce intervals
3. **Clear logs**: Regularly clear accumulated logs
4. **Limit component tracking**: Only track problematic components

## 📚 Additional Resources

- **Component Test Lab**: `/component-test` - Isolated component testing
- **Dev Tools Dashboard**: `/dev-tools` - Comprehensive debugging interface
- **Console Logs**: Check browser console for detailed component information
- **Performance Tab**: Browser DevTools for additional performance insights

---

🔧 **Ready to debug!** Start with `/dev-tools` to see all available debugging options.