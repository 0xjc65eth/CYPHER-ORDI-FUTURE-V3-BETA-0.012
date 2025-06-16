// Suppress wallet provider conflicts
(function() {
  'use strict';
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // List of error messages to suppress
  const suppressedErrors = [
    'MetaMask encountered an error',
    'Cannot redefine property: ethereum',
    'Cannot set property ethereum',
    'Could not assign Magic Eden provider',
    'Pocket Universe',
    'Failed to define property',
    'wallet extension'
  ];
  
  // Override console.error
  console.error = function(...args) {
    const message = args.join(' ');
    if (!suppressedErrors.some(error => message.includes(error))) {
      originalError.apply(console, args);
    }
  };
  
  // Override console.warn
  console.warn = function(...args) {
    const message = args.join(' ');
    if (!suppressedErrors.some(error => message.includes(error))) {
      originalWarn.apply(console, args);
    }
  };
  
  // Prevent wallet provider conflicts
  if (typeof window !== 'undefined') {
    // Create safe property descriptors
    try {
      const originalEthereum = window.ethereum;
      
      Object.defineProperty(window, 'ethereum', {
        get: function() {
          return originalEthereum;
        },
        set: function(value) {
          // Silently ignore conflicting wallet assignments
          return true;
        },
        configurable: false,
        enumerable: true
      });
    } catch (e) {
      // Silently ignore errors
    }
  }
})();