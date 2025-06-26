/**
 * 🔧 ENHANCED WALLET CONFLICT RESOLVER
 * Resolves conflicts between MetaMask, Phantom, and other wallet extensions
 * Specifically addresses the "Cannot set property ethereum" error
 */

(function() {
  'use strict';
  
  console.log('🔧 Loading Enhanced Wallet Conflict Resolver...');
  
  // Store original providers before any conflicts occur
  let originalEthereum = null;
  let originalSolana = null;
  let providerBackup = {};
  
  // Capture original state immediately
  if (typeof window !== 'undefined') {
    originalEthereum = window.ethereum;
    originalSolana = window.solana;
    
    // Create backup of all wallet-related properties
    ['ethereum', 'solana', 'phantom', 'metamask'].forEach(prop => {
      if (window[prop]) {
        providerBackup[prop] = window[prop];
      }
    });
  }
  
  // Enhanced error handler for provider conflicts
  const handleProviderError = (error, context) => {
    console.warn(`🚨 ${context} Error:`, error.message);
    
    // Specific handling for "Cannot set property ethereum" error
    if (error.message.includes('Cannot set property ethereum')) {
      console.log('🔥 Detected property setter conflict - implementing workaround');
      return handleEthereumPropertyConflict();
    }
    
    return false;
  };
  
  // Handle the specific "Cannot set property ethereum" conflict
  const handleEthereumPropertyConflict = () => {
    try {
      // Check if ethereum property is already defined with getter only
      const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
      
      if (descriptor && descriptor.get && !descriptor.set) {
        console.log('🔧 Ethereum property has getter only - creating proxy wrapper');
        
        // Create a proxy that wraps the existing getter
        const existingEthereum = window.ethereum;
        
        // Store the existing provider safely
        window._cypherOriginalEthereum = existingEthereum;
        
        // Create a safe wrapper that doesn't conflict
        window._cypherEthereumProxy = {
          ...existingEthereum,
          isCypherWrapped: true,
          originalProvider: existingEthereum,
          providers: existingEthereum?.providers || [existingEthereum].filter(Boolean)
        };
        
        console.log('✅ Created safe Ethereum proxy wrapper');
        return true;
      }
      
    } catch (wrapperError) {
      console.warn('⚠️ Failed to create Ethereum wrapper:', wrapperError.message);
    }
    
    return false;
  };
  
  // Enhanced provider resolution with conflict avoidance
  const resolveProviderConflicts = () => {
    try {
      console.log('🔧 Starting enhanced provider conflict resolution...');
      
      // Check for multiple Ethereum providers
      if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
        console.log(`📦 Found ${window.ethereum.providers.length} Ethereum providers`);
        
        // Prefer MetaMask if available
        const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
        if (metamaskProvider) {
          console.log('🦊 Using MetaMask as primary provider');
          window._cypherPrimaryEthereum = metamaskProvider;
        } else {
          console.log('💼 Using first available Ethereum provider');
          window._cypherPrimaryEthereum = window.ethereum.providers[0];
        }
      } else if (window.ethereum) {
        console.log('💼 Single Ethereum provider detected');
        window._cypherPrimaryEthereum = window.ethereum;
      }
      
      // Handle Phantom Solana provider separately
      if (window.phantom?.solana) {
        console.log('👻 Phantom Solana provider detected');
        window._cypherPhantomProvider = window.phantom.solana;
      } else if (window.solana) {
        console.log('🔮 Solana provider detected');
        window._cypherSolanaProvider = window.solana;
      }
      
      return true;
      
    } catch (error) {
      return handleProviderError(error, 'Provider Resolution');
    }
  };
  
  // Safe wallet detection that avoids conflicts
  const detectWalletsSafely = () => {
    const wallets = [];
    
    try {
      // Check MetaMask
      if (window.ethereum?.isMetaMask || window._cypherPrimaryEthereum?.isMetaMask) {
        wallets.push({ 
          name: 'MetaMask', 
          type: 'ethereum',
          detected: true, 
          provider: window._cypherPrimaryEthereum || window.ethereum
        });
      }
      
      // Check Phantom
      if (window.phantom?.ethereum) {
        wallets.push({ 
          name: 'Phantom (Ethereum)', 
          type: 'ethereum',
          detected: true, 
          provider: window.phantom.ethereum
        });
      }
      
      if (window.phantom?.solana || window._cypherPhantomProvider) {
        wallets.push({ 
          name: 'Phantom (Solana)', 
          type: 'solana',
          detected: true, 
          provider: window._cypherPhantomProvider || window.phantom.solana
        });
      }
      
      // Check other Ethereum providers
      if (window.ethereum?.providers) {
        window.ethereum.providers.forEach(provider => {
          if (provider.isCoinbaseWallet) {
            wallets.push({ name: 'Coinbase Wallet', type: 'ethereum', detected: true, provider });
          }
          if (provider.isWalletConnect) {
            wallets.push({ name: 'WalletConnect', type: 'ethereum', detected: true, provider });
          }
          if (provider.isBraveWallet) {
            wallets.push({ name: 'Brave Wallet', type: 'ethereum', detected: true, provider });
          }
        });
      }
      
      console.log('💼 Detected wallets:', wallets.map(w => w.name).join(', '));
      
    } catch (error) {
      handleProviderError(error, 'Wallet Detection');
    }
    
    return wallets;
  };
  
  // Create safe provider access methods
  const createSafeProviderAPI = () => {
    window.cypherWallets = {
      // Get the primary Ethereum provider safely
      getEthereumProvider: () => {
        return window._cypherPrimaryEthereum || window._cypherEthereumProxy || window.ethereum;
      },
      
      // Get the Solana provider safely
      getSolanaProvider: () => {
        return window._cypherSolanaProvider || window._cypherPhantomProvider || window.solana;
      },
      
      // Get all detected wallets
      getAllWallets: () => {
        return window._cypherDetectedWallets || [];
      },
      
      // Check if a specific wallet is available
      isWalletAvailable: (walletName) => {
        const wallets = window._cypherDetectedWallets || [];
        return wallets.some(w => w.name.toLowerCase().includes(walletName.toLowerCase()));
      },
      
      // Safe provider request method
      safeRequest: async (method, params = []) => {
        try {
          const provider = window.cypherWallets.getEthereumProvider();
          if (provider && provider.request) {
            return await provider.request({ method, params });
          }
          throw new Error('No Ethereum provider available');
        } catch (error) {
          console.error('🚨 Safe request failed:', error);
          throw error;
        }
      }
    };
  };
  
  // Initialize the enhanced conflict resolution
  const initEnhancedConflictResolution = () => {
    console.log('🚀 Initializing Enhanced Wallet Conflict Resolution...');
    
    try {
      // Step 1: Resolve provider conflicts
      const resolved = resolveProviderConflicts();
      
      // Step 2: Detect wallets safely
      const detectedWallets = detectWalletsSafely();
      window._cypherDetectedWallets = detectedWallets;
      
      // Step 3: Create safe API
      createSafeProviderAPI();
      
      // Step 4: Store resolution info
      window.cypherWalletResolution = {
        timestamp: Date.now(),
        resolved: resolved,
        conflictHandled: true,
        walletsDetected: detectedWallets.length,
        hasEthereum: !!window._cypherPrimaryEthereum,
        hasSolana: !!window._cypherSolanaProvider,
        errorHandlingActive: true
      };
      
      console.log('✅ Enhanced Wallet Conflict Resolution Complete');
      console.log('📊 Resolution Summary:', window.cypherWalletResolution);
      
    } catch (error) {
      handleProviderError(error, 'Initialization');
      
      // Create fallback resolution info
      window.cypherWalletResolution = {
        timestamp: Date.now(),
        resolved: false,
        error: error.message,
        fallbackMode: true
      };
    }
  };
  
  // Error suppression for known wallet conflicts
  const suppressKnownErrors = () => {
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      
      // Suppress known wallet conflict errors
      if (message.includes('Cannot set property ethereum') ||
          message.includes('Error redefining provider') ||
          message.includes('MetaMask encountered an error setting the global Ethereum provider')) {
        console.warn('🔇 Suppressed known wallet conflict error:', message);
        return;
      }
      
      // Let other errors through
      originalError.apply(console, args);
    };
  };
  
  // Initialize error suppression
  suppressKnownErrors();
  
  // Safe initialization with timing
  const safeInit = () => {
    // Wait for DOM and other scripts to load
    setTimeout(() => {
      initEnhancedConflictResolution();
    }, 150);
  };
  
  // Initialize based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }
  
  // Monitor for late-loading providers
  let monitoringInterval = setInterval(() => {
    // Re-check if new providers have been injected
    if ((window.ethereum || window.solana) && !window.cypherWalletResolution) {
      console.log('🔄 Late provider detected, re-initializing...');
      initEnhancedConflictResolution();
    }
    
    // Stop monitoring after 15 seconds
    if (Date.now() - (window.cypherWalletResolution?.timestamp || 0) > 15000) {
      clearInterval(monitoringInterval);
      console.log('⏹️ Wallet monitoring stopped');
    }
  }, 750);
  
  console.log('✅ Enhanced Wallet Conflict Resolver Loaded');
  
})();