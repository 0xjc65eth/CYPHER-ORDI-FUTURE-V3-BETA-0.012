/**
 * 🛡️ WALLET CONFLICT RESOLVER - CYPHER ORDi FUTURE V3
 * Resolve conflitos entre diferentes providers de wallet (MetaMask, Bitcoin, etc.)
 */

import { EnhancedLogger } from '@/lib/enhanced-logger';
import { ErrorReporter } from '@/lib/ErrorReporter';

interface WalletProvider {
  name: string;
  provider: any;
  isActive: boolean;
  priority: number;
}

interface ConflictResolutionConfig {
  preventGlobalOverrides: boolean;
  preserveExisting: boolean;
  logConflicts: boolean;
  fallbackToLastProvider: boolean;
}

class WalletConflictResolver {
  private static instance: WalletConflictResolver;
  private providers: Map<string, WalletProvider> = new Map();
  private conflicts: string[] = [];
  private config: ConflictResolutionConfig;
  private originalWindow: any = {};

  constructor(config: Partial<ConflictResolutionConfig> = {}) {
    this.config = {
      preventGlobalOverrides: true,
      preserveExisting: true,
      logConflicts: true,
      fallbackToLastProvider: false,
      ...config
    };

    this.initializeResolver();
  }

  static getInstance(config?: Partial<ConflictResolutionConfig>): WalletConflictResolver {
    if (!WalletConflictResolver.instance) {
      WalletConflictResolver.instance = new WalletConflictResolver(config);
    }
    return WalletConflictResolver.instance;
  }

  private initializeResolver(): void {
    if (typeof window === 'undefined') return;

    try {
      // Backup original window properties
      this.backupOriginalProviders();
      
      // Setup defensive property definitions
      this.setupDefensiveProperties();
      
      // Monitor for provider conflicts
      this.monitorProviderConflicts();

      EnhancedLogger.info('WalletConflictResolver initialized', {
        component: 'WalletConflictResolver',
        config: this.config
      });
    } catch (error) {
      ErrorReporter.report(error as Error, {
        component: 'WalletConflictResolver',
        action: 'initialize'
      });
    }
  }

  private backupOriginalProviders(): void {
    try {
      // Backup existing providers before any extensions load
      if (typeof window !== 'undefined') {
        this.originalWindow.ethereum = (window as any).ethereum;
        this.originalWindow.bitcoin = (window as any).bitcoin;
        this.originalWindow.BitcoinProvider = (window as any).BitcoinProvider;
      }
    } catch (error) {
      EnhancedLogger.warn('Failed to backup original providers', {
        component: 'WalletConflictResolver',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private setupDefensiveProperties(): void {
    if (typeof window === 'undefined') return;

    try {
      // Create defensive getters/setters for ethereum
      this.createDefensiveProperty('ethereum', {
        priority: 1,
        preserveExisting: true
      });

      // Create defensive getters/setters for bitcoin providers
      this.createDefensiveProperty('bitcoin', {
        priority: 2,
        preserveExisting: true
      });

      // Protect BitcoinProvider from redefinition
      this.protectBitcoinProvider();

    } catch (error) {
      EnhancedLogger.warn('Failed to setup defensive properties', {
        component: 'WalletConflictResolver',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private createDefensiveProperty(propertyName: string, options: {
    priority: number;
    preserveExisting: boolean;
  }): void {
    if (typeof window === 'undefined') return;

    const win = window as any;
    let currentProvider = win[propertyName];

    try {
      // Only redefine if we can and should
      const descriptor = Object.getOwnPropertyDescriptor(win, propertyName);
      
      if (descriptor && !descriptor.configurable) {
        // Property is not configurable, skip redefinition
        EnhancedLogger.warn(`Cannot redefine non-configurable property: ${propertyName}`, {
          component: 'WalletConflictResolver',
          property: propertyName
        });
        return;
      }

      Object.defineProperty(win, propertyName, {
        get: () => {
          return currentProvider;
        },
        set: (newProvider) => {
          if (options.preserveExisting && currentProvider && newProvider !== currentProvider) {
            this.logConflict(propertyName, currentProvider, newProvider);
            
            // Keep the higher priority provider
            const existingPriority = this.getProviderPriority(currentProvider);
            const newPriority = this.getProviderPriority(newProvider);
            
            if (newPriority > existingPriority) {
              EnhancedLogger.info(`Updating ${propertyName} provider to higher priority`, {
                component: 'WalletConflictResolver',
                property: propertyName,
                existingPriority,
                newPriority
              });
              currentProvider = newProvider;
            } else {
              EnhancedLogger.info(`Preserving existing ${propertyName} provider`, {
                component: 'WalletConflictResolver',
                property: propertyName
              });
            }
          } else {
            currentProvider = newProvider;
          }
        },
        configurable: true,
        enumerable: true
      });
    } catch (error) {
      EnhancedLogger.error(`Failed to create defensive property for ${propertyName}`, {
        component: 'WalletConflictResolver',
        property: propertyName,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private protectBitcoinProvider(): void {
    if (typeof window === 'undefined') return;

    try {
      const win = window as any;
      
      // Check if BitcoinProvider already exists
      if (win.BitcoinProvider) {
        EnhancedLogger.info('BitcoinProvider already exists, preserving', {
          component: 'WalletConflictResolver'
        });
        return;
      }

      // Define a protected BitcoinProvider
      Object.defineProperty(win, 'BitcoinProvider', {
        value: class BitcoinProvider {
          constructor() {
            EnhancedLogger.info('BitcoinProvider instance created', {
              component: 'WalletConflictResolver'
            });
          }
        },
        writable: false,
        configurable: false,
        enumerable: true
      });

    } catch (error) {
      // Silently handle the case where BitcoinProvider can't be redefined
      EnhancedLogger.debug('BitcoinProvider protection failed (may already be defined)', {
        component: 'WalletConflictResolver',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private getProviderPriority(provider: any): number {
    if (!provider) return 0;
    
    // MetaMask gets lower priority (1)
    if (provider.isMetaMask) return 1;
    
    // Bitcoin providers get higher priority (3)
    if (provider.isBitcoinWallet || provider.isXverse || provider.isUnisat) return 3;
    
    // Generic ethereum providers get medium priority (2)
    if (provider.isEthereum || provider.request) return 2;
    
    return 1;
  }

  private logConflict(propertyName: string, existingProvider: any, newProvider: any): void {
    if (!this.config.logConflicts) return;

    const conflict = `Wallet conflict detected for ${propertyName}`;
    this.conflicts.push(conflict);

    EnhancedLogger.warn(conflict, {
      component: 'WalletConflictResolver',
      property: propertyName,
      existingProvider: this.getProviderInfo(existingProvider),
      newProvider: this.getProviderInfo(newProvider)
    });
  }

  private getProviderInfo(provider: any): any {
    if (!provider) return null;
    
    return {
      isMetaMask: provider.isMetaMask,
      isBitcoinWallet: provider.isBitcoinWallet,
      isXverse: provider.isXverse,
      isUnisat: provider.isUnisat,
      constructor: provider.constructor?.name,
      type: typeof provider
    };
  }

  private monitorProviderConflicts(): void {
    if (typeof window === 'undefined') return;

    // Monitor for provider injection attempts
    const observer = new MutationObserver(() => {
      this.checkForNewProviders();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Also check periodically
    setInterval(() => {
      this.checkForNewProviders();
    }, 5000);
  }

  private checkForNewProviders(): void {
    if (typeof window === 'undefined') return;

    try {
      const win = window as any;
      
      // Check for new ethereum providers
      if (win.ethereum && !this.providers.has('ethereum')) {
        this.registerProvider('ethereum', win.ethereum, 1);
      }

      // Check for new bitcoin providers
      if (win.bitcoin && !this.providers.has('bitcoin')) {
        this.registerProvider('bitcoin', win.bitcoin, 2);
      }

    } catch (error) {
      // Silent check, don't spam logs
    }
  }

  private registerProvider(name: string, provider: any, priority: number): void {
    this.providers.set(name, {
      name,
      provider,
      isActive: true,
      priority
    });

    EnhancedLogger.info(`Wallet provider registered: ${name}`, {
      component: 'WalletConflictResolver',
      providerInfo: this.getProviderInfo(provider),
      priority
    });
  }

  // Public API
  getActiveProviders(): WalletProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isActive);
  }

  getConflicts(): string[] {
    return [...this.conflicts];
  }

  hasConflicts(): boolean {
    return this.conflicts.length > 0;
  }

  getProviderByName(name: string): any {
    const provider = this.providers.get(name);
    return provider?.provider || null;
  }

  // Safe provider access
  safeGetEthereum(): any {
    if (typeof window === 'undefined') return null;
    
    try {
      return (window as any).ethereum || null;
    } catch (error) {
      return null;
    }
  }

  safeGetBitcoin(): any {
    if (typeof window === 'undefined') return null;
    
    try {
      return (window as any).bitcoin || null;
    } catch (error) {
      return null;
    }
  }

  // Reset to original state
  reset(): void {
    try {
      if (typeof window !== 'undefined') {
        const win = window as any;
        
        // Restore original providers if possible
        Object.keys(this.originalWindow).forEach(key => {
          try {
            win[key] = this.originalWindow[key];
          } catch (error) {
            // Ignore errors when restoring
          }
        });
      }

      this.providers.clear();
      this.conflicts = [];

      EnhancedLogger.info('WalletConflictResolver reset', {
        component: 'WalletConflictResolver'
      });
    } catch (error) {
      ErrorReporter.report(error as Error, {
        component: 'WalletConflictResolver',
        action: 'reset'
      });
    }
  }
}

// Initialize the conflict resolver immediately
let walletConflictResolver: WalletConflictResolver | null = null;

if (typeof window !== 'undefined') {
  walletConflictResolver = WalletConflictResolver.getInstance({
    preventGlobalOverrides: true,
    preserveExisting: true,
    logConflicts: true,
    fallbackToLastProvider: false
  });
}

export { WalletConflictResolver, walletConflictResolver };
export default WalletConflictResolver;