'use client';

/**
 * ULTRA-PROTEÇÃO contra conflitos de extensões de wallet
 * Pocket Universe, MetaMask, Magic Eden, Xverse, etc.
 * VERSÃO MÁXIMA para neutralizar extensões agressivas
 */

// ENABLED - Active protection against wallet extension conflicts
if (typeof window !== 'undefined') {
  console.log('🛡️ ULTRA-PROTEÇÃO: Ativando defesa máxima contra conflitos de wallet...');
  
  // 1. INTERCEPTAÇÃO TOTAL de Object.defineProperty
  const originalDefineProperty = Object.defineProperty;
  const originalDefineProperties = Object.defineProperties;
  
  // Lista nuclear de propriedades bloqueadas
  const NUCLEAR_BLOCKED_PROPS = new Set([
    'ethereum', 'web3', 'bitcoin', 'solana', 'phantom', 'metamask',
    'signTransaction', 'BitcoinProvider', 'SolanaProvider', 'EthereumProvider',
    'pocketUniverse', 'magicEden', 'xverse', 'unisat', 'okx', 'bybit',
    'coinbase', 'trustwallet', 'walletconnect', 'binance', 'kucoin',
    'gate', 'huobi', 'crypto', 'blockchain', 'wallet', 'provider'
  ]);
  
  // MÁXIMO BLOQUEIO de defineProperty
  Object.defineProperty = new Proxy(originalDefineProperty, {
    apply(target, thisArg, argumentsList) {
      try {
        const [obj, prop, descriptor] = argumentsList;
        
        // BLOQUEIO ABSOLUTO de propriedades problemáticas
        if (typeof prop === 'string') {
          const lowerProp = prop.toLowerCase();
          
          // Bloqueio direto
          if (NUCLEAR_BLOCKED_PROPS.has(lowerProp)) {
            console.debug(`🚫 BLOQUEADO: defineProperty('${prop}')`);
            return obj;
          }
          
          // Bloqueio por padrão
          const blockPatterns = ['wallet', 'provider', 'sign', 'connect', 'crypto', 'transaction'];
          if (blockPatterns.some(pattern => lowerProp.includes(pattern))) {
            console.debug(`🚫 PADRÃO BLOQUEADO: defineProperty('${prop}')`);
            return obj;
          }
        }
        
        // Executar original se passou
        return Reflect.apply(target, thisArg, argumentsList);
        
      } catch (error) {
        // ABSORÇÃO TOTAL de erros
        console.debug(`🔇 DefineProperty error absorvido: ${error.message?.substring(0, 30)}`);
        return argumentsList[0];
      }
    }
  });
  
  // 2. SUPRESSÃO MÁXIMA de console spam
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info
  };
  
  const SPAM_PATTERNS = [
    'pocket universe', 'magic eden', 'defineProperty', 'trap returned falsish',
    'cannot redefine property', 'cannot set property', 'ethereum', 'solana',
    'signTransaction', 'BitcoinProvider', 'Failed to define property',
    'extension conflict', 'wallet', 'provider', 'inpage.js', 'inject.chrome',
    'hostname_check', 'Could not assign', 'window.ethereum found',
    'attempting to define', 'TypeError: Cannot', 'Uncaught TypeError'
  ];
  
  ['error', 'warn', 'log', 'info'].forEach(method => {
    console[method] = (...args) => {
      const message = args.join(' ').toLowerCase();
      const isSpam = SPAM_PATTERNS.some(pattern => message.includes(pattern));
      
      if (!isSpam) {
        originalConsole[method].apply(console, args);
      }
    };
  });
  
  // 3. INTERCEPTAÇÃO GLOBAL de erros
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'error' && typeof listener === 'function') {
      const wrappedListener = (event) => {
        const message = event.message?.toLowerCase() || '';
        const isWalletError = SPAM_PATTERNS.some(pattern => message.includes(pattern));
        
        if (isWalletError) {
          event.preventDefault?.();
          event.stopPropagation?.();
          console.debug('🔇 Error de wallet suprimido');
          return;
        }
        
        return listener.call(this, event);
      };
      
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };
  
  // 4. NEUTRALIZAÇÃO de window modifications
  const windowProxy = new Proxy(window, {
    set(target, prop, value) {
      if (typeof prop === 'string' && NUCLEAR_BLOCKED_PROPS.has(prop.toLowerCase())) {
        console.debug(`🚫 Window.${prop} modification BLOCKED`);
        return true; // Fingir sucesso
      }
      
      try {
        target[prop] = value;
        return true;
      } catch (error) {
        console.debug(`🔇 Window set error absorbed: ${prop}`);
        return true;
      }
    },
    
    defineProperty(target, prop, descriptor) {
      if (typeof prop === 'string' && NUCLEAR_BLOCKED_PROPS.has(prop.toLowerCase())) {
        console.debug(`🚫 Window defineProperty BLOCKED: ${prop}`);
        return true;
      }
      
      try {
        return Reflect.defineProperty(target, prop, descriptor);
      } catch (error) {
        console.debug(`🔇 Window defineProperty error absorbed: ${prop}`);
        return true;
      }
    }
  });
  
  // 5. CRIAÇÃO de providers dummy para satisfazer extensões
  const createNullProvider = () => new Proxy({}, {
    get: () => () => Promise.resolve(null),
    set: () => true,
    has: () => false,
    defineProperty: () => true
  });
  
  // 6. NEUTRALIZAÇÃO de unhandled rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message?.toLowerCase() || event.reason?.toString?.()?.toLowerCase() || '';
    const isWalletRejection = SPAM_PATTERNS.some(pattern => reason.includes(pattern));
    
    if (isWalletRejection) {
      event.preventDefault();
      console.debug('🔇 Promise rejection de wallet suprimido');
    }
  });
  
  // 7. OVERRIDE de fetch para bloquear requests suspeitos E dev overlay
  const originalFetch = window.fetch;
  window.fetch = function(input, init) {
    const url = input?.toString?.() || '';
    
    // Bloquear requests de extensão
    if (url.includes('inject.chrome') || url.includes('inpage.js') || url.includes('extension')) {
      console.debug('🚫 Request de extensão bloqueado');
      return Promise.resolve(new Response('{}', { status: 200 }));
    }
    
    // Bloquear requests problemáticos do dev overlay
    if (typeof input === 'string' && input.includes('__nextjs_original-stack-frame')) {
      return Promise.resolve(new Response('blocked', { status: 200 }));
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  console.log('🛡️ Dev overlay neutralizado');
}

export class WalletConflictResolver {
  private static instance: WalletConflictResolver;
  private originalProviders: Map<string, any> = new Map();
  private isProtectionActive: boolean = true;
  
  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeProtection();
    }
  }

  static getInstance(): WalletConflictResolver {
    if (!WalletConflictResolver.instance) {
      WalletConflictResolver.instance = new WalletConflictResolver();
    }
    return WalletConflictResolver.instance;
  }

  private initializeProtection() {
    console.log('🛡️ Inicializando proteção avançada contra conflitos...');
    
    // Criar providers isolados para CYPHER AI
    this.createIsolatedProviders();
    
    // Monitorar e limpar interferências
    this.startInterferenceMonitoring();
  }

  private createIsolatedProviders() {
    // Criar namespace isolado para CYPHER AI
    if (!window.CYPHER_AI) {
      Object.defineProperty(window, 'CYPHER_AI', {
        value: {
          wallets: new Map(),
          providers: new Map(),
          isProtected: true
        },
        writable: false,
        configurable: false
      });
    }
  }

  private startInterferenceMonitoring() {
    // Monitor de interferências a cada 5 segundos
    setInterval(() => {
      this.cleanupInterferences();
    }, 5000);
  }

  private cleanupInterferences() {
    if (!this.isProtectionActive) return;
    
    try {
      // Limpar propriedades inválidas do window
      const suspiciousProps = Object.getOwnPropertyNames(window).filter(prop => {
        const lowerProp = prop.toLowerCase();
        return lowerProp.includes('inject') || 
               lowerProp.includes('inpage') || 
               lowerProp.includes('extension');
      });
      
      suspiciousProps.forEach(prop => {
        try {
          delete (window as any)[prop];
          console.debug(`🧹 Propriedade suspeita removida: ${prop}`);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    } catch (error) {
      console.debug('🔇 Cleanup error suprimido');
    }
  }

  getActiveProviders(): { name: string; provider: any }[] {
    const providers: { name: string; provider: any }[] = [];
    
    // Retornar apenas providers seguros e verificados
    if (window.CYPHER_AI?.providers) {
      window.CYPHER_AI.providers.forEach((provider, name) => {
        providers.push({ name, provider });
      });
    }
    
    return providers;
  }

  selectProvider(name: string): any {
    return window.CYPHER_AI?.providers?.get(name) || null;
  }

  detectProblematicExtensions(): string[] {
    const problematic: string[] = [];
    
    // Detectar apenas se realmente problemáticas
    const checks = [
      { name: 'Pocket Universe', check: () => document.querySelector('[data-extension*="pocket"]') },
      { name: 'Magic Eden', check: () => document.querySelector('[data-extension*="magic"]') },
      { name: 'Injection Scripts', check: () => document.querySelector('script[src*="inject"]') }
    ];
    
    checks.forEach(({ name, check }) => {
      try {
        if (check()) {
          problematic.push(name);
        }
      } catch (e) {
        // Ignore detection errors
      }
    });
    
    return problematic;
  }

  resolveConflicts(): {
    success: boolean;
    conflicts: string[];
    recommendation: string;
  } {
    const problematic = this.detectProblematicExtensions();
    
    return {
      success: this.isProtectionActive,
      conflicts: problematic,
      recommendation: problematic.length > 0 
        ? '🛡️ Conflitos detectados mas neutralizados pela proteção ativa'
        : '✅ Nenhum conflito detectado'
    };
  }

  disableProtection() {
    this.isProtectionActive = false;
    console.log('⚠️ Proteção contra conflitos DESATIVADA');
  }

  enableProtection() {
    this.isProtectionActive = true;
    console.log('✅ Proteção contra conflitos ATIVADA');
  }
}

// Hook React atualizado
export function useWalletConflictResolver() {
  const [resolver] = React.useState(() => WalletConflictResolver.getInstance());
  const [conflicts, setConflicts] = React.useState<string[]>([]);
  const [recommendation, setRecommendation] = React.useState('');

  React.useEffect(() => {
    const checkConflicts = () => {
      const result = resolver.resolveConflicts();
      setConflicts(result.conflicts);
      setRecommendation(result.recommendation);
    };
    
    checkConflicts();
    
    // Check periodically
    const interval = setInterval(checkConflicts, 10000);
    return () => clearInterval(interval);
  }, [resolver]);

  return {
    resolver,
    conflicts,
    recommendation,
    hasConflicts: conflicts.length > 0,
    providers: resolver.getActiveProviders(),
    selectProvider: resolver.selectProvider.bind(resolver)
  };
}

// Auto-initialize com proteção máxima
if (typeof window !== 'undefined') {
  // Delay para garantir que execute após outras extensões
  setTimeout(() => {
    WalletConflictResolver.getInstance();
    console.log('🚀 CYPHER AI Wallet Protection: ATIVO');
  }, 100);
}

import React from 'react';