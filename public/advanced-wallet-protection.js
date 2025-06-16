/**
 * 🔒 ADVANCED WALLET PROTECTION - CYPHER ORDi FUTURE V3
 * Sistema avançado de proteção contra conflitos de extensões de wallet
 */

(function() {
  'use strict';
  
  console.log('🔒 Advanced Wallet Protection - Starting...');
  
  // Lista de propriedades globais de wallet para proteger
  const WALLET_PROPERTIES = [
    'ethereum',
    'bitcoin',
    'BitcoinProvider',
    'XverseProviders',
    'unisat',
    'oyl',
    'webln',
    'nostr'
  ];
  
  // Mapa de valores originais/primários
  const originalValues = new Map();
  const setterCounts = new Map();
  const conflictLog = [];
  
  // Backup do Object.defineProperty original
  const originalDefineProperty = Object.defineProperty;
  const originalHasOwnProperty = Object.prototype.hasOwnProperty;
  
  // Função para criar propriedades defensivas
  function createDefensiveProperty(propName) {
    let currentValue = null;
    let isLocked = false;
    
    // Preservar valor existente se houver
    if (originalHasOwnProperty.call(window, propName)) {
      currentValue = window[propName];
      originalValues.set(propName, currentValue);
      console.log(`🔐 Preserving existing ${propName}:`, !!currentValue);
    }
    
    try {
      // Remover propriedade existente se houver
      if (originalHasOwnProperty.call(window, propName)) {
        delete window[propName];
      }
      
      originalDefineProperty.call(Object, window, propName, {
        get: function() {
          return currentValue;
        },
        set: function(newValue) {
          const count = (setterCounts.get(propName) || 0) + 1;
          setterCounts.set(propName, count);
          
          const logEntry = {
            property: propName,
            attempt: count,
            timestamp: Date.now(),
            hasCurrentValue: !!currentValue,
            newValueType: typeof newValue,
            newValueConstructor: newValue?.constructor?.name,
            isMetaMask: newValue?.isMetaMask,
            stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
          };
          
          conflictLog.push(logEntry);
          
          console.log(`🔐 ${propName} setter (attempt ${count}):`, {
            hasCurrentValue: !!currentValue,
            newValue: !!newValue,
            type: typeof newValue,
            constructor: newValue?.constructor?.name,
            isMetaMask: newValue?.isMetaMask,
            isLocked
          });
          
          // Permitir apenas a primeira definição ou se não há valor atual
          if (!currentValue || !isLocked) {
            currentValue = newValue;
            isLocked = true; // Bloquear após primeira definição bem-sucedida
            console.log(`✅ ${propName} set successfully (locked)`);
          } else {
            console.warn(`⛔ ${propName} setter blocked - property is locked`);
            // Log detalhado do conflito
            console.warn(`Conflict details:`, {
              existing: {
                type: typeof currentValue,
                constructor: currentValue?.constructor?.name,
                isMetaMask: currentValue?.isMetaMask
              },
              attempted: {
                type: typeof newValue,
                constructor: newValue?.constructor?.name,
                isMetaMask: newValue?.isMetaMask
              }
            });
          }
        },
        configurable: false, // Não configurável para evitar redefinição
        enumerable: true
      });
      
      console.log(`🔐 Protected property created: ${propName}`);
    } catch (error) {
      console.error(`❌ Failed to protect property: ${propName}`, error);
    }
  }
  
  // Sobrescrever Object.defineProperty globalmente
  Object.defineProperty = function(obj, prop, descriptor) {
    // Interceptar tentativas de redefinir propriedades de wallet
    if (obj === window && WALLET_PROPERTIES.includes(prop)) {
      console.warn(`🚫 Blocked defineProperty attempt for wallet property: ${prop}`);
      
      conflictLog.push({
        type: 'defineProperty_blocked',
        property: prop,
        timestamp: Date.now(),
        descriptor: {
          configurable: descriptor.configurable,
          enumerable: descriptor.enumerable,
          writable: descriptor.writable,
          hasGetter: typeof descriptor.get === 'function',
          hasSetter: typeof descriptor.set === 'function'
        },
        stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n')
      });
      
      // Retornar obj silenciosamente para não quebrar a extensão
      return obj;
    }
    
    // Usar implementação original para outras propriedades
    return originalDefineProperty.apply(this, arguments);
  };
  
  // Monitorar tentativas de acesso direto
  function monitorDirectAccess() {
    WALLET_PROPERTIES.forEach(prop => {
      // Verificar se a propriedade já existe
      if (originalHasOwnProperty.call(window, prop)) {
        const existingValue = window[prop];
        console.log(`🔍 Found existing ${prop}:`, {
          type: typeof existingValue,
          constructor: existingValue?.constructor?.name,
          isMetaMask: existingValue?.isMetaMask
        });
      }
    });
  }
  
  // Função para obter relatório de conflitos
  function getConflictReport() {
    return {
      totalAttempts: conflictLog.length,
      propertiesProtected: WALLET_PROPERTIES.length,
      setterCounts: Object.fromEntries(setterCounts),
      conflicts: conflictLog.slice(-10), // Últimos 10 conflitos
      activeProperties: WALLET_PROPERTIES.reduce((acc, prop) => {
        acc[prop] = {
          hasValue: !!window[prop],
          type: typeof window[prop],
          constructor: window[prop]?.constructor?.name,
          isMetaMask: window[prop]?.isMetaMask
        };
        return acc;
      }, {})
    };
  }
  
  // Inicializar proteções
  function initializeProtection() {
    console.log('🔐 Initializing wallet property protection...');
    
    // Monitorar estado atual
    monitorDirectAccess();
    
    // Criar propriedades defensivas
    WALLET_PROPERTIES.forEach(createDefensiveProperty);
    
    // Expor utilitários de debug
    window.__cypherAdvancedProtection = {
      isActive: true,
      getConflictReport,
      getConflictLog: () => [...conflictLog],
      getSetterCounts: () => Object.fromEntries(setterCounts),
      getOriginalValues: () => Object.fromEntries(originalValues)
    };
    
    console.log('🔐 Advanced wallet protection initialized');
  }
  
  // Inicializar imediatamente
  initializeProtection();
  
  // Monitorar extensões periodicamente
  let monitorCount = 0;
  const maxMonitorChecks = 15;
  
  function monitorExtensions() {
    monitorCount++;
    
    const extensionStatus = {
      metamask: !!window.ethereum?.isMetaMask,
      coinbase: !!window.ethereum?.isCoinbaseWallet,
      trust: !!window.ethereum?.isTrust,
      xverse: !!window.XverseProviders || !!window.BitcoinProvider,
      unisat: !!window.unisat,
      oyl: !!window.oyl,
      webln: !!window.webln,
      nostr: !!window.nostr
    };
    
    const activeExtensions = Object.entries(extensionStatus).filter(([_, active]) => active);
    
    if (activeExtensions.length > 0) {
      console.log(`🔍 Extensions detected (check ${monitorCount}):`, activeExtensions.map(([name]) => name));
    }
    
    // Verificar conflitos
    const report = getConflictReport();
    if (report.totalAttempts > 0) {
      console.log(`📊 Conflict report (check ${monitorCount}):`, {
        totalAttempts: report.totalAttempts,
        recentConflicts: report.conflicts.length
      });
    }
    
    if (monitorCount < maxMonitorChecks) {
      setTimeout(monitorExtensions, 2000);
    } else {
      console.log('🔐 Extension monitoring completed');
      // Log final do relatório
      const finalReport = getConflictReport();
      if (finalReport.totalAttempts > 0) {
        console.log('📋 Final conflict report:', finalReport);
      }
    }
  }
  
  // Iniciar monitoramento após um delay
  setTimeout(monitorExtensions, 1000);
  
  // Listener para mudanças no DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🔐 DOM loaded - wallet protection is active');
    });
  }
  
})();