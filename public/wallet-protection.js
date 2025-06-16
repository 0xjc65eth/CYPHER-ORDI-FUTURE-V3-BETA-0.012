/**
 * 🛡️ WALLET PROTECTION SCRIPT - CYPHER ORDi FUTURE V3
 * Script que deve ser carregado ANTES de qualquer extensão de wallet
 * Para ser incluído no <head> do HTML
 */

(function() {
  'use strict';
  
  console.log('🛡️ Cypher Wallet Protection - Initializing...');
  
  // Backup original properties
  const originalDefineProperty = Object.defineProperty;
  const protectedProperties = new Set(['ethereum', 'bitcoin', 'BitcoinProvider']);
  const propertyBackups = new Map();
  
  // Store original values if they exist
  protectedProperties.forEach(prop => {
    if (window.hasOwnProperty(prop)) {
      propertyBackups.set(prop, window[prop]);
    }
  });
  
  // Create defensive property wrappers
  function createDefensiveProperty(propName) {
    let currentValue = propertyBackups.get(propName) || null;
    let setterCount = 0;
    
    try {
      originalDefineProperty.call(Object, window, propName, {
        get: function() {
          return currentValue;
        },
        set: function(newValue) {
          setterCount++;
          
          console.log(`🛡️ ${propName} setter called (${setterCount}):`, {
            hasValue: !!currentValue,
            newValue: !!newValue,
            isMetaMask: newValue?.isMetaMask,
            isBitcoin: propName.includes('bitcoin') || propName.includes('Bitcoin')
          });
          
          // Allow first setter or if no current value
          if (!currentValue || setterCount === 1) {
            currentValue = newValue;
            console.log(`✅ ${propName} set successfully`);
          } else {
            console.warn(`⚠️ ${propName} setter blocked - already has value`);
          }
        },
        configurable: true,
        enumerable: true
      });
      
      console.log(`✅ Protected property: ${propName}`);
    } catch (error) {
      console.warn(`⚠️ Could not protect property: ${propName}`, error.message);
    }
  }
  
  // Protect against BitcoinProvider redefinition
  function protectBitcoinProvider() {
    if (window.BitcoinProvider) {
      console.log('✅ BitcoinProvider already exists, preserving');
      return;
    }
    
    try {
      // Create a minimal BitcoinProvider to prevent redefinition errors
      originalDefineProperty.call(Object, window, 'BitcoinProvider', {
        value: function BitcoinProvider() {
          console.log('🔧 BitcoinProvider constructor called');
        },
        writable: false,
        configurable: false,
        enumerable: true
      });
      console.log('✅ BitcoinProvider protected');
    } catch (error) {
      console.log('ℹ️ BitcoinProvider protection skipped:', error.message);
    }
  }
  
  // Override Object.defineProperty to catch extension attempts
  Object.defineProperty = function(obj, prop, descriptor) {
    if (obj === window && protectedProperties.has(prop)) {
      console.log(`🛡️ Intercepted defineProperty for: ${prop}`);
      
      // Allow if it's our own call
      if (arguments.callee.caller && arguments.callee.caller.toString().includes('createDefensiveProperty')) {
        return originalDefineProperty.apply(this, arguments);
      }
      
      // Block redefinition attempts
      console.warn(`⛔ Blocked redefinition attempt for: ${prop}`);
      return obj; // Return silently to avoid breaking the extension
    }
    
    return originalDefineProperty.apply(this, arguments);
  };
  
  // Initialize protections
  setTimeout(() => {
    protectedProperties.forEach(createDefensiveProperty);
    protectBitcoinProvider();
    
    console.log('🛡️ Cypher Wallet Protection - Initialized');
  }, 0);
  
  // Monitor for extension loading
  let checkCount = 0;
  const maxChecks = 20;
  
  function checkForExtensions() {
    checkCount++;
    
    const extensions = {
      metamask: !!window.ethereum?.isMetaMask,
      coinbase: !!window.ethereum?.isCoinbaseWallet,
      trust: !!window.ethereum?.isTrust,
      xverse: !!window.XverseProviders || !!window.BitcoinProvider,
      unisat: !!window.unisat,
      oyl: !!window.oyl
    };
    
    const detected = Object.entries(extensions).filter(([name, found]) => found);
    
    if (detected.length > 0) {
      console.log(`🔍 Extensions detected (check ${checkCount}):`, detected.map(([name]) => name));
    }
    
    if (checkCount < maxChecks) {
      setTimeout(checkForExtensions, 1000);
    }
  }
  
  // Start monitoring
  setTimeout(checkForExtensions, 1000);
  
  // Expose protection status for debugging
  window.__cypherProtection = {
    isActive: true,
    protectedProperties: Array.from(protectedProperties),
    backups: propertyBackups,
    getStatus: () => ({
      ethereum: !!window.ethereum,
      bitcoin: !!window.bitcoin,
      BitcoinProvider: !!window.BitcoinProvider,
      protectedCount: protectedProperties.size
    })
  };
  
})();