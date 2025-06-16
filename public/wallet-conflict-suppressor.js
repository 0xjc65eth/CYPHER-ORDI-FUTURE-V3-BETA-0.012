/**
 * 👛 CYPHER AI Wallet Conflict Suppressor v3.0
 * Prevents conflicts between multiple wallet providers
 */

class WalletConflictSuppressor {
  constructor() {
    this.walletProviders = [];
    this.suppressedConflicts = [];
    this.priorityWallet = null;
    
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    console.log('👛 Wallet Conflict Suppressor initialized');
    
    // Wait for wallet providers to load
    setTimeout(() => {
      this.detectWalletProviders();
      this.setupConflictSuppression();
    }, 1000);
  }

  detectWalletProviders() {
    const providers = [];
    
    // Check for common wallet providers
    if (window.ethereum) {
      providers.push({
        name: 'MetaMask/Ethereum',
        provider: window.ethereum,
        type: 'ethereum'
      });
    }

    if (window.unisat) {
      providers.push({
        name: 'UniSat',
        provider: window.unisat,
        type: 'bitcoin'
      });
    }

    if (window.xverse) {
      providers.push({
        name: 'Xverse',
        provider: window.xverse,
        type: 'bitcoin'
      });
    }

    if (window.leather) {
      providers.push({
        name: 'Leather (Hiro)',
        provider: window.leather,
        type: 'bitcoin'
      });
    }

    if (window.okxwallet) {
      providers.push({
        name: 'OKX Wallet',
        provider: window.okxwallet,
        type: 'multi'
      });
    }

    if (window.phantom?.bitcoin) {
      providers.push({
        name: 'Phantom',
        provider: window.phantom,
        type: 'multi'
      });
    }

    this.walletProviders = providers;
    
    if (providers.length > 0) {
      console.log(`👛 Detected ${providers.length} wallet providers:`, 
        providers.map(p => p.name).join(', '));
    }
  }

  setupConflictSuppression() {
    // Suppress console warnings about multiple providers
    this.suppressConsoleWarnings();
    
    // Handle provider conflicts
    this.handleProviderConflicts();
    
    // Setup provider priority system
    this.setupProviderPriority();
  }

  suppressConsoleWarnings() {
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Suppress known wallet conflicts
      if (this.isWalletConflictWarning(message)) {
        this.suppressedConflicts.push({
          type: 'warning',
          message,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      
      // Suppress known wallet conflicts
      if (this.isWalletConflictError(message)) {
        this.suppressedConflicts.push({
          type: 'error',
          message,
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      originalError.apply(console, args);
    };
  }

  isWalletConflictWarning(message) {
    const conflictPatterns = [
      'multiple wallet providers detected',
      'wallet provider conflict',
      'ethereum provider conflict',
      'bitcoin provider conflict',
      'provider already exists',
      'multiple ethereum providers',
      'wallet extension conflict'
    ];
    
    return conflictPatterns.some(pattern => 
      message.toLowerCase().includes(pattern)
    );
  }

  isWalletConflictError(message) {
    const errorPatterns = [
      'provider collision',
      'wallet provider error',
      'multiple providers error',
      'provider initialization failed'
    ];
    
    return errorPatterns.some(pattern => 
      message.toLowerCase().includes(pattern)
    );
  }

  handleProviderConflicts() {
    // Group providers by type
    const ethereumProviders = this.walletProviders.filter(p => p.type === 'ethereum');
    const bitcoinProviders = this.walletProviders.filter(p => p.type === 'bitcoin');
    const multiProviders = this.walletProviders.filter(p => p.type === 'multi');

    // Handle multiple Ethereum providers
    if (ethereumProviders.length > 1) {
      this.resolveEthereumConflict(ethereumProviders);
    }

    // Handle multiple Bitcoin providers
    if (bitcoinProviders.length > 1) {
      this.resolveBitcoinConflict(bitcoinProviders);
    }

    // Log conflict resolution
    if (this.suppressedConflicts.length > 0) {
      console.log(`👛 Suppressed ${this.suppressedConflicts.length} wallet conflicts`);
    }
  }

  resolveEthereumConflict(providers) {
    // Priority: MetaMask > Others
    const metaMask = providers.find(p => p.name.includes('MetaMask'));
    if (metaMask) {
      this.priorityWallet = metaMask;
      console.log('👛 Using MetaMask as primary Ethereum provider');
    }
  }

  resolveBitcoinConflict(providers) {
    // Priority: UniSat > Xverse > Leather
    const priority = ['UniSat', 'Xverse', 'Leather'];
    
    for (const walletName of priority) {
      const wallet = providers.find(p => p.name.includes(walletName));
      if (wallet) {
        this.priorityWallet = wallet;
        console.log(`👛 Using ${walletName} as primary Bitcoin provider`);
        break;
      }
    }
  }

  setupProviderPriority() {
    // Create a unified wallet interface
    window.cypherWallet = {
      providers: this.walletProviders,
      primary: this.priorityWallet,
      
      async connect(type = 'auto') {
        if (type === 'auto' && this.priorityWallet) {
          return this.connectProvider(this.priorityWallet);
        }
        
        const provider = this.providers.find(p => p.type === type);
        if (provider) {
          return this.connectProvider(provider);
        }
        
        throw new Error(`No ${type} wallet provider available`);
      },
      
      async connectProvider(provider) {
        try {
          console.log(`👛 Connecting to ${provider.name}...`);
          
          if (provider.type === 'ethereum' && provider.provider.request) {
            const accounts = await provider.provider.request({
              method: 'eth_requestAccounts'
            });
            return { provider: provider.provider, accounts, type: 'ethereum' };
          }
          
          if (provider.type === 'bitcoin' && provider.provider.requestAccounts) {
            const accounts = await provider.provider.requestAccounts();
            return { provider: provider.provider, accounts, type: 'bitcoin' };
          }
          
          throw new Error(`Unsupported provider: ${provider.name}`);
        } catch (error) {
          console.error(`👛 Failed to connect to ${provider.name}:`, error);
          throw error;
        }
      },
      
      getAvailableWallets() {
        return this.providers.map(p => ({
          name: p.name,
          type: p.type,
          available: true
        }));
      }
    };
  }

  // Public API
  getSuppressedConflicts() {
    return this.suppressedConflicts;
  }

  getDetectedProviders() {
    return this.walletProviders;
  }

  clearSuppressionLog() {
    this.suppressedConflicts = [];
    console.log('👛 Suppression log cleared');
  }
}

// Initialize conflict suppressor
window.walletConflictSuppressor = new WalletConflictSuppressor();

// Export for debugging
window.getWalletConflicts = () => window.walletConflictSuppressor.getSuppressedConflicts();
window.getDetectedWallets = () => window.walletConflictSuppressor.getDetectedProviders();