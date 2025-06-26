/**
 * 🔇 METAMASK & PHANTOM ERROR SUPPRESSOR
 * Specifically suppresses known wallet provider conflict errors
 */

(function() {
  'use strict';
  
  console.log('🔇 Loading MetaMask & Phantom Error Suppressor...');
  
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Known error patterns to suppress
  const suppressedErrorPatterns = [
    /Error redefining provider into window\.ethereum/,
    /Cannot set property ethereum of #<Window> which has only a getter/,
    /MetaMask encountered an error setting the global Ethereum provider/,
    /Could not establish connection\. Receiving end does not exist/,
    /Cannot read propert(y|ies) of undefined \(reading 'ethereum'\)/,
    /Phantom wallet error/,
    /Unchecked runtime\.lastError/,
    /Extension context invalidated/,
    /The extension context invalidated/,
    /chrome-extension:.*Error/
  ];
  
  // Patterns that should be logged as warnings instead of errors
  const downgradeToWarningPatterns = [
    /ENOENT: no such file or directory.*node_modules/,
    /Module build failed.*node_modules/,
    /Cannot resolve module/
  ];
  
  // Enhanced error filtering
  const shouldSuppressError = (message) => {
    const messageStr = typeof message === 'string' ? message : String(message);
    return suppressedErrorPatterns.some(pattern => pattern.test(messageStr));
  };
  
  const shouldDowngradeError = (message) => {
    const messageStr = typeof message === 'string' ? message : String(message);
    return downgradeToWarningPatterns.some(pattern => pattern.test(messageStr));
  };
  
  // Override console.error
  console.error = function(...args) {
    const fullMessage = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    // Suppress known wallet conflicts
    if (shouldSuppressError(fullMessage)) {
      console.log('🔇 Suppressed wallet conflict error:', args[0]);
      return;
    }
    
    // Downgrade certain errors to warnings
    if (shouldDowngradeError(fullMessage)) {
      console.warn('⚠️ [Downgraded Error]:', ...args);
      return;
    }
    
    // Let other errors through
    originalConsoleError.apply(console, args);
  };
  
  // Override console.warn for wallet-related warnings
  console.warn = function(...args) {
    const fullMessage = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');
    
    // Suppress redundant wallet warnings
    if (shouldSuppressError(fullMessage)) {
      console.log('🔇 Suppressed wallet warning:', args[0]);
      return;
    }
    
    // Let other warnings through
    originalConsoleWarn.apply(console, args);
  };
  
  // Global error handler for wallet conflicts
  const handleGlobalError = (event) => {
    if (event.error && shouldSuppressError(event.error.message)) {
      console.log('🔇 Suppressed global wallet error:', event.error.message);
      event.preventDefault();
      return false;
    }
    return true;
  };
  
  // Global unhandled rejection handler
  const handleUnhandledRejection = (event) => {
    const reason = event.reason;
    const message = reason && reason.message ? reason.message : String(reason);
    
    if (shouldSuppressError(message)) {
      console.log('🔇 Suppressed unhandled rejection:', message);
      event.preventDefault();
      return false;
    }
    return true;
  };
  
  // Install global handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  }
  
  // Monkey patch Object.defineProperty to prevent wallet conflicts
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function(obj, prop, descriptor) {
    try {
      // Special handling for ethereum property conflicts
      if (obj === window && prop === 'ethereum' && descriptor) {
        console.log('🔧 Intercepted attempt to define ethereum property');
        
        // Check if property already exists with getter only
        const existing = Object.getOwnPropertyDescriptor(obj, prop);
        if (existing && existing.get && !existing.set && !descriptor.set) {
          console.log('🔇 Prevented ethereum property redefinition conflict');
          return obj;
        }
      }
      
      return originalDefineProperty.call(this, obj, prop, descriptor);
    } catch (error) {
      if (shouldSuppressError(error.message)) {
        console.log('🔇 Suppressed defineProperty error:', error.message);
        return obj;
      }
      throw error;
    }
  };
  
  // Create a safe namespace for wallet information
  window.cypherWalletErrorSuppression = {
    active: true,
    suppressedCount: 0,
    lastSuppressed: null,
    patterns: suppressedErrorPatterns.map(p => p.source),
    
    // Method to temporarily disable suppression
    disable: () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.cypherWalletErrorSuppression.active = false;
      console.log('🔊 Error suppression disabled');
    },
    
    // Method to re-enable suppression
    enable: () => {
      // Re-install our overrides
      console.log('🔇 Re-enabling error suppression');
      window.cypherWalletErrorSuppression.active = true;
    },
    
    // Get suppression stats
    getStats: () => ({
      active: window.cypherWalletErrorSuppression.active,
      suppressedCount: window.cypherWalletErrorSuppression.suppressedCount,
      lastSuppressed: window.cypherWalletErrorSuppression.lastSuppressed
    })
  };
  
  console.log('✅ MetaMask & Phantom Error Suppressor Active');
  
})();