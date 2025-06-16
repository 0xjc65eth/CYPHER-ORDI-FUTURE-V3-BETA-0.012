/**
 * 🔍 ERROR TRACKER - CYPHER ORDi FUTURE V3
 * Sistema de rastreamento avançado de erros para debug
 */

(function() {
  'use strict';
  
  console.log('🔍 Error Tracker - Initializing...');
  
  const errorLog = [];
  const MAX_ERRORS = 50;
  
  // Backup dos handlers originais
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // Função para capturar stack trace limpo
  function getCleanStackTrace() {
    const stack = new Error().stack;
    if (stack) {
      return stack
        .split('\n')
        .slice(2, 8) // Pular as primeiras 2 linhas (Error e esta função)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    }
    return 'No stack trace available';
  }
  
  // Função para categorizar erros
  function categorizeError(message) {
    const msg = String(message).toLowerCase();
    
    if (msg.includes('wallet') || msg.includes('metamask') || msg.includes('bitcoin')) {
      return 'wallet';
    }
    if (msg.includes('interval') || msg.includes('optimizer')) {
      return 'scheduler';
    }
    if (msg.includes('import') || msg.includes('module') || msg.includes('require')) {
      return 'import';
    }
    if (msg.includes('hydration') || msg.includes('react') || msg.includes('next')) {
      return 'react';
    }
    if (msg.includes('api') || msg.includes('fetch') || msg.includes('network')) {
      return 'network';
    }
    if (msg.includes('type') || msg.includes('undefined') || msg.includes('null')) {
      return 'type';
    }
    
    return 'general';
  }
  
  // Função para registrar erro
  function logError(level, args, source = 'console') {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    const errorEntry = {
      timestamp,
      level,
      message,
      category: categorizeError(message),
      source,
      stackTrace: getCleanStackTrace(),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100)
    };
    
    errorLog.push(errorEntry);
    
    // Manter apenas os últimos MAX_ERRORS
    if (errorLog.length > MAX_ERRORS) {
      errorLog.shift();
    }
    
    // Log especial para erros críticos
    if (level === 'error' || message.includes('failed') || message.includes('error')) {
      console.group('🚨 CRITICAL ERROR DETECTED');
      console.log('📝 Message:', message);
      console.log('🏷️ Category:', errorEntry.category);
      console.log('⏰ Time:', timestamp);
      console.log('📍 Stack:', errorEntry.stackTrace);
      console.groupEnd();
    }
  }
  
  // Sobrescrever console.error
  console.error = function(...args) {
    logError('error', args, 'console.error');
    return originalError.apply(console, args);
  };
  
  // Sobrescrever console.warn
  console.warn = function(...args) {
    logError('warn', args, 'console.warn');
    return originalWarn.apply(console, args);
  };
  
  // Capturar erros não tratados
  window.addEventListener('error', function(event) {
    logError('error', [
      `Uncaught Error: ${event.message}`,
      `File: ${event.filename}:${event.lineno}:${event.colno}`,
      `Error object:`, event.error
    ], 'window.error');
  });
  
  // Capturar promises rejeitadas
  window.addEventListener('unhandledrejection', function(event) {
    logError('error', [
      'Unhandled Promise Rejection:',
      event.reason
    ], 'unhandledrejection');
  });
  
  // Função para obter relatório de erros
  function getErrorReport() {
    const categoryCounts = errorLog.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {});
    
    const levelCounts = errorLog.reduce((acc, error) => {
      acc[error.level] = (acc[error.level] || 0) + 1;
      return acc;
    }, {});
    
    const recentErrors = errorLog.slice(-10);
    
    return {
      totalErrors: errorLog.length,
      categoryCounts,
      levelCounts,
      recentErrors,
      criticalErrors: errorLog.filter(e => e.level === 'error').slice(-5)
    };
  }
  
  // Função para exportar erros
  function exportErrors() {
    const report = getErrorReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cypher-errors-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Expor utilitários globalmente
  window.__cypherErrorTracker = {
    isActive: true,
    getErrorReport,
    getErrors: () => [...errorLog],
    clearErrors: () => errorLog.length = 0,
    exportErrors,
    getCriticalErrors: () => errorLog.filter(e => e.level === 'error' || e.message.includes('failed')),
    getWalletErrors: () => errorLog.filter(e => e.category === 'wallet'),
    getSchedulerErrors: () => errorLog.filter(e => e.category === 'scheduler'),
    getImportErrors: () => errorLog.filter(e => e.category === 'import')
  };
  
  // Log inicial
  console.log('🔍 Error Tracker initialized - monitoring all console output');
  
  // Relatório periódico (apenas se houver erros)
  setInterval(() => {
    const report = getErrorReport();
    if (report.totalErrors > 0) {
      console.group('📊 ERROR TRACKER REPORT');
      console.log('Total errors:', report.totalErrors);
      console.log('By category:', report.categoryCounts);
      console.log('By level:', report.levelCounts);
      if (report.criticalErrors.length > 0) {
        console.log('Recent critical errors:', report.criticalErrors.length);
      }
      console.groupEnd();
    }
  }, 30000); // A cada 30 segundos
  
})();