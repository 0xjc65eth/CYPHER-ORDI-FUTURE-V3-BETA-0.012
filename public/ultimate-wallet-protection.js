/**
 * 🛡️ ULTIMATE WALLET PROTECTION - CYPHER ORDi FUTURE V3
 * Proteção máxima contra conflitos de extensões de wallet
 */

(function() {
  'use strict';
  
  console.log('🛡️ Ultimate Wallet Protection - Initializing...');
  
  // Interceptar e bloquear tentativas de redefinição ANTES que qualquer extensão carregue
  const originalDefineProperty = Object.defineProperty;
  const originalDefineProperties = Object.defineProperties;
  const originalSetProperty = Object.prototype.__defineSetter__;
  
  // Lista de propriedades críticas para proteger
  const PROTECTED_PROPERTIES = [
    'ethereum', 'bitcoin', 'BitcoinProvider', 'XverseProviders', 
    'unisat', 'oyl', 'webln', 'nostr', 'phantom', 'solana', 'tronWeb'
  ];
  
  // Store para valores protegidos
  const protectedValues = new Map();
  const definitionAttempts = new Map();
  
  // Interceptar Object.defineProperty globalmente
  Object.defineProperty = function(obj, prop, descriptor) {
    if (obj === window && PROTECTED_PROPERTIES.includes(prop)) {
      const attempts = (definitionAttempts.get(prop) || 0) + 1;
      definitionAttempts.set(prop, attempts);
      
      console.log(`🚫 BLOCKED defineProperty for ${prop} (attempt ${attempts})`);
      
      // Se é a primeira definição, permitir
      if (attempts === 1 && !protectedValues.has(prop)) {
        console.log(`✅ FIRST definition allowed for ${prop}`);
        protectedValues.set(prop, descriptor.value || descriptor.get?.());
        return originalDefineProperty.call(this, obj, prop, {
          ...descriptor,
          configurable: false, // Tornar não-configurável
          writable: false      // Tornar não-escrevível
        });
      }
      
      // Bloquear redefinições
      console.warn(`⛔ REJECTED redefinition of ${prop}`);
      return obj; // Retornar silenciosamente para não quebrar a extensão
    }
    
    return originalDefineProperty.call(this, obj, prop, descriptor);
  };
  
  // Interceptar Object.defineProperties
  Object.defineProperties = function(obj, props) {
    if (obj === window) {
      const filteredProps = {};
      let blocked = false;
      
      for (const [prop, descriptor] of Object.entries(props)) {
        if (PROTECTED_PROPERTIES.includes(prop)) {
          console.log(`🚫 BLOCKED defineProperties for ${prop}`);
          blocked = true;
        } else {
          filteredProps[prop] = descriptor;
        }
      }
      
      if (blocked && Object.keys(filteredProps).length === 0) {
        return obj; // Se todos foram bloqueados, retornar silenciosamente
      }
      
      return originalDefineProperties.call(this, obj, filteredProps);
    }
    
    return originalDefineProperties.call(this, obj, props);
  };
  
  // Interceptar tentativas de setter direto
  const originalWindowSetter = window.__proto__.__lookupSetter__;
  if (originalWindowSetter) {
    PROTECTED_PROPERTIES.forEach(prop => {
      try {
        originalDefineProperty.call(Object, window, prop, {
          get: function() {
            return protectedValues.get(prop) || null;
          },
          set: function(value) {
            const attempts = (definitionAttempts.get(prop) || 0) + 1;
            definitionAttempts.set(prop, attempts);
            
            console.log(`🚫 BLOCKED direct setter for ${prop} (attempt ${attempts})`);
            
            if (attempts === 1 && !protectedValues.has(prop)) {
              console.log(`✅ FIRST value allowed for ${prop}`);
              protectedValues.set(prop, value);
            } else {
              console.warn(`⛔ REJECTED direct assignment to ${prop}`);
            }
          },
          configurable: false,
          enumerable: true
        });
      } catch (error) {
        console.log(`ℹ️ Could not protect ${prop} with setter:`, error.message);
      }
    });
  }
  
  // Função para relatar status
  function getProtectionReport() {
    const report = {
      protectedProperties: PROTECTED_PROPERTIES.length,
      definitionAttempts: Object.fromEntries(definitionAttempts),
      protectedValues: PROTECTED_PROPERTIES.reduce((acc, prop) => {
        acc[prop] = {
          hasValue: protectedValues.has(prop),
          type: typeof protectedValues.get(prop),
          isProtected: window.hasOwnProperty(prop)
        };
        return acc;
      }, {}),
      timestamp: new Date().toISOString()
    };
    
    return report;
  }
  
  // Monitorar tentativas em tempo real
  let monitorInterval;
  function startMonitoring() {
    monitorInterval = setInterval(() => {
      const totalAttempts = Array.from(definitionAttempts.values()).reduce((sum, count) => sum + count, 0);
      if (totalAttempts > 0) {
        console.log(`🛡️ Protection Status: ${totalAttempts} blocked attempts`);
      }
    }, 5000);
  }
  
  // Função de limpeza
  function stopMonitoring() {
    if (monitorInterval) {
      clearInterval(monitorInterval);
    }
  }
  
  // Expor utilitários para debug
  window.__ultimateWalletProtection = {
    isActive: true,
    getReport: getProtectionReport,
    getAttempts: () => Object.fromEntries(definitionAttempts),
    getProtectedValues: () => Object.fromEntries(protectedValues),
    startMonitoring,
    stopMonitoring
  };
  
  // Iniciar monitoramento
  startMonitoring();
  
  // Log de inicialização
  console.log('🛡️ Ultimate Wallet Protection - ACTIVE');
  console.log(`📊 Protecting ${PROTECTED_PROPERTIES.length} properties:`, PROTECTED_PROPERTIES);
  
  // Relatar status após 3 segundos
  setTimeout(() => {
    const report = getProtectionReport();
    console.log('📋 Initial Protection Report:', report);
    
    if (Object.keys(report.definitionAttempts).length > 0) {
      console.log('⚠️ Extension conflicts detected and blocked');
    } else {
      console.log('✅ No conflicts detected');
    }
  }, 3000);
  
})();