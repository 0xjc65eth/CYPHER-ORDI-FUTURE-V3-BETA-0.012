/**
 * Debug Tools Index
 * Centralized exports for all debugging utilities
 */

// Core debugging utilities
export { 
  devDebugger as developmentDebugger,
  withDebugTracking,
  useDebugTracking,
  logger
} from './developmentUtils';

// Console logging helpers
export {
  consoleLogger,
  useRenderLogger,
  withRenderLogger
} from './consoleLoggers';

// Hot reload utilities
export {
  hotReloadManager,
  useHotReload,
  withHotReload
} from './hotReload';

// React components
export { default as DebugDashboard } from '../../components/debug/DebugDashboard';
export { default as PerformanceMonitor } from '../../components/debug/PerformanceMonitor';

// Types
export interface DebugConfig {
  enableDebugDashboard?: boolean;
  enablePerformanceMonitor?: boolean;
  enableConsoleLogging?: boolean;
  enableHotReload?: boolean;
  persistLogs?: boolean;
  autoTrackComponents?: boolean;
}

// Global debug configuration
class DebugManager {
  private static instance: DebugManager;
  private config: DebugConfig;

  private constructor() {
    this.config = {
      enableDebugDashboard: process.env.NODE_ENV === 'development',
      enablePerformanceMonitor: process.env.NODE_ENV === 'development',
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableHotReload: process.env.NODE_ENV === 'development',
      persistLogs: false,
      autoTrackComponents: true
    };
  }

  static getInstance(): DebugManager {
    if (!DebugManager.instance) {
      DebugManager.instance = new DebugManager();
    }
    return DebugManager.instance;
  }

  configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): DebugConfig {
    return { ...this.config };
  }

  isEnabled(feature: keyof DebugConfig): boolean {
    return this.config[feature] === true;
  }
}

export const debugManager = DebugManager.getInstance();

// Convenience function to initialize all debug tools
export function initializeDebugTools(config?: Partial<DebugConfig>) {
  if (config) {
    debugManager.configure(config);
  }

  const currentConfig = debugManager.getConfig();

  if (currentConfig.enableConsoleLogging) {
    import('./consoleLoggers').then(({ consoleLogger }) => {
      consoleLogger.configure({
        enabled: true,
        persist: currentConfig.persistLogs
      });
    });
  }

  if (currentConfig.enableHotReload) {
    import('./hotReload').then(({ hotReloadManager }) => {
      hotReloadManager.configure({
        enabled: true,
        preserveState: true
      });
    });
  }

  console.log('🔧 Debug tools initialized', currentConfig);
}

// Helper to check if we're in debug mode
export function isDebugMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Export everything as default for convenience
export default {
  debugManager,
  initializeDebugTools,
  isDebugMode
};