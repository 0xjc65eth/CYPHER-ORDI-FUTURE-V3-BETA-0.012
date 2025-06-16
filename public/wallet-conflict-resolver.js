/**
 * 🔧 WALLET CONFLICT RESOLVER
 * Resolves conflicts between multiple Ethereum wallet extensions
 */

(function() {
  'use strict';
  
  // Store original ethereum provider if it exists
  let originalEthereum = null;
  
  // Check if ethereum is already defined
  if (typeof window !== 'undefined' && window.ethereum) {
    originalEthereum = window.ethereum;
    console.log('💼 Original Ethereum provider detected:', originalEthereum.isMetaMask ? 'MetaMask' : 'Unknown');
  }
  
  // Wallet conflict resolution
  const resolveWalletConflicts = () => {
    try {
      // If we have multiple providers, prefer MetaMask
      if (window.ethereum && window.ethereum.providers) {
        const metamaskProvider = window.ethereum.providers.find(provider => provider.isMetaMask);
        if (metamaskProvider) {
          console.log('🦊 Using MetaMask as primary provider');
          Object.defineProperty(window, 'ethereum', {
            value: metamaskProvider,
            writable: false,
            configurable: false
          });
          return;
        }
      }
      
      // Handle single provider case
      if (window.ethereum && !window.ethereum.providers) {
        console.log('💼 Single Ethereum provider detected');
        return;
      }
      
      // If no ethereum provider, create a safe stub
      if (!window.ethereum) {
        console.log('⚠️ No Ethereum provider found, creating safe stub');
        Object.defineProperty(window, 'ethereum', {
          value: {
            isMetaMask: false,
            request: () => Promise.reject(new Error('No wallet installed')),
            on: () => {},
            removeListener: () => {},
            providers: []
          },
          writable: false,
          configurable: false
        });
      }
      
    } catch (error) {
      console.warn('🚨 Wallet conflict resolution failed:', error.message);
      
      // Fallback: use original ethereum if available
      if (originalEthereum) {
        try {
          Object.defineProperty(window, 'ethereum', {
            value: originalEthereum,
            writable: false,
            configurable: false
          });
          console.log('✅ Restored original Ethereum provider');
        } catch (fallbackError) {
          console.error('❌ Failed to restore original provider:', fallbackError.message);
        }
      }
    }
  };
  
  // Safe provider detection
  const detectAvailableWallets = () => {
    const wallets = [];
    
    try {
      // Check for MetaMask
      if (window.ethereum?.isMetaMask) {
        wallets.push({ name: 'MetaMask', detected: true, provider: window.ethereum });
      }
      
      // Check for other wallets
      if (window.ethereum?.providers) {
        window.ethereum.providers.forEach(provider => {
          if (provider.isCoinbaseWallet) {
            wallets.push({ name: 'Coinbase Wallet', detected: true, provider });
          }
          if (provider.isWalletConnect) {
            wallets.push({ name: 'WalletConnect', detected: true, provider });
          }
        });
      }
      
      console.log('💼 Available wallets:', wallets.map(w => w.name).join(', '));
      
    } catch (error) {
      console.warn('⚠️ Wallet detection failed:', error.message);
    }
    
    return wallets;
  };
  
  // Initialize conflict resolution
  const initWalletConflictResolution = () => {
    console.log('🔧 Initializing wallet conflict resolution...');
    
    // Resolve conflicts immediately
    resolveWalletConflicts();
    
    // Detect available wallets
    const availableWallets = detectAvailableWallets();
    
    // Store wallet info for later use
    window.cypherWalletInfo = {
      resolvedAt: Date.now(),
      availableWallets,
      primaryProvider: window.ethereum,
      conflictResolved: true
    };
    
    console.log('✅ Wallet conflict resolution complete');
  };
  
  // Safe delay for provider initialization
  const safeInit = () => {
    setTimeout(() => {
      initWalletConflictResolution();
    }, 100);
  };
  
  // Initialize based on document state
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    safeInit();
  }
  
  // Re-resolve conflicts when new providers are injected
  let providerCheckInterval = setInterval(() => {
    if (window.ethereum && !window.cypherWalletInfo) {
      initWalletConflictResolution();
    }
    
    // Stop checking after 10 seconds
    if (Date.now() - (window.cypherWalletInfo?.resolvedAt || 0) > 10000) {
      clearInterval(providerCheckInterval);
    }
  }, 500);
  
})();