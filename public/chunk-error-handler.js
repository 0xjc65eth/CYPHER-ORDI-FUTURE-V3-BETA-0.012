/**
 * 🔧 CHUNK ERROR HANDLER - CYPHER ORDi FUTURE V3
 * Detecta e corrige erros de chunks JavaScript 404/MIME type
 */

(function() {
  'use strict';
  
  console.log('🔧 Chunk Error Handler - Initializing...');
  
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const chunkErrors = [];
  
  // Interceptar erros de carregamento de script
  window.addEventListener('error', function(event) {
    const element = event.target;
    
    // Verificar se é um erro de script
    if (element && element.tagName === 'SCRIPT') {
      const src = element.src;
      
      if (src && (src.includes('_next/static/chunks/') || src.includes('main-app.js'))) {
        console.error('🚨 Chunk loading error detected:', src);
        chunkErrors.push({
          src,
          timestamp: Date.now(),
          error: event.message
        });
        
        // Se há muitos erros de chunks, recarregar a página
        if (chunkErrors.length >= 3 && retryCount < MAX_RETRIES) {
          console.log('🔄 Multiple chunk errors detected, reloading page...');
          retryCount++;
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    }
  }, true);
  
  // Interceptar erros de MIME type
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      element.addEventListener('error', function(event) {
        const src = this.src;
        if (src && src.includes('_next/static/')) {
          console.error('🚨 Script MIME type error:', src);
          
          // Tentar recarregar o script com cache bypass
          if (retryCount < MAX_RETRIES) {
            console.log('🔄 Retrying script load with cache bypass...');
            
            setTimeout(() => {
              const newScript = originalCreateElement.call(document, 'script');
              newScript.src = src + (src.includes('?') ? '&' : '?') + 't=' + Date.now();
              newScript.async = this.async;
              newScript.defer = this.defer;
              
              // Substituir o script atual
              if (this.parentNode) {
                this.parentNode.replaceChild(newScript, this);
              }
            }, 500);
            
            retryCount++;
          }
        }
      });
    }
    
    return element;
  };
  
  // Verificar se há problemas de cache no localStorage
  function clearNextCache() {
    try {
      // Limpar cache do Next.js no localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('next-') || key.startsWith('__next')) {
          localStorage.removeItem(key);
        }
      });
      
      // Limpar cache do sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('next-') || key.startsWith('__next')) {
          sessionStorage.removeItem(key);
        }
      });
      
      console.log('🧹 Next.js cache cleared');
    } catch (error) {
      console.warn('⚠️ Could not clear cache:', error);
    }
  }
  
  // Função para forçar reload com cache bypass
  function forceReload() {
    console.log('🔄 Force reloading with cache bypass...');
    
    // Limpar cache primeiro
    clearNextCache();
    
    // Reload com cache bypass
    if (window.location.search.includes('nocache')) {
      // Se já tentamos com nocache, recarregar normalmente
      window.location.reload(true);
    } else {
      // Adicionar parâmetro para bypass de cache
      const url = new URL(window.location);
      url.searchParams.set('nocache', Date.now());
      window.location.href = url.toString();
    }
  }
  
  // Detectar problemas de CSS MIME type
  const originalCreateLink = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateLink.call(this, tagName);
    
    if (tagName.toLowerCase() === 'link' && element.rel === 'stylesheet') {
      element.addEventListener('error', function(event) {
        console.error('🚨 CSS loading error:', this.href);
        
        if (this.href && this.href.includes('layout.css')) {
          console.log('🔄 CSS error detected, force reloading...');
          forceReload();
        }
      });
    }
    
    return element;
  };
  
  // Expor utilitários para debug
  window.__chunkErrorHandler = {
    isActive: true,
    getErrors: () => [...chunkErrors],
    getRetryCount: () => retryCount,
    clearCache: clearNextCache,
    forceReload,
    resetRetryCount: () => { retryCount = 0; }
  };
  
  // Verificar se estamos em um reload por erro
  if (window.location.search.includes('nocache')) {
    console.log('🔧 Page reloaded due to chunk errors');
  }
  
  console.log('🔧 Chunk Error Handler - ACTIVE');
  
})();