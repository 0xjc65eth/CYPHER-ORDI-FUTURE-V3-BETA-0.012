// Browser Console Error Analysis Script
// This script will analyze the CYPHER ORDi Future V3 application for errors

const PAGES_TO_TEST = [
  { name: 'Dashboard', url: '/' },
  { name: 'Cypher Trade', url: '/quicktrade' },
  { name: 'Cypher AI', url: '/cypher-ai' },
  { name: 'Trading Bot', url: '/trading-bot' },
  { name: 'Ordinals', url: '/ordinals' },
  { name: 'Runes', url: '/runes' },
  { name: 'Portfolio', url: '/portfolio' },
  { name: 'BRC-20', url: '/brc20' },
  { name: 'Arbitrage', url: '/arbitrage' },
  { name: 'Market Analysis', url: '/market' },
  { name: 'Bitcoin', url: '/bitcoin' },
  { name: 'Analytics', url: '/analytics' },
  { name: 'Mining', url: '/mining' },
  { name: 'Network', url: '/network' },
  { name: 'News', url: '/news' },
  { name: 'About', url: '/about' },
  { name: 'Settings', url: '/settings' },
  { name: 'Support', url: '/support' }
];

class ErrorAnalyzer {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.networkErrors = [];
    this.pageResults = {};
    this.baseUrl = 'http://localhost:3001';
  }

  // Capture console errors and warnings
  captureConsoleErrors() {
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;

    console.error = (...args) => {
      this.errors.push({
        type: 'console.error',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        page: window.location.pathname
      });
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      this.warnings.push({
        type: 'console.warn',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        page: window.location.pathname
      });
      originalWarn.apply(console, args);
    };
  }

  // Monitor network requests
  monitorNetworkRequests() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.networkErrors.push({
            type: 'fetch_error',
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
          });
        }
        return response;
      } catch (error) {
        this.networkErrors.push({
          type: 'fetch_exception',
          url: args[0],
          error: error.message,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        });
        throw error;
      }
    };
  }

  // Capture unhandled errors
  captureUnhandledErrors() {
    window.addEventListener('error', (event) => {
      this.errors.push({
        type: 'unhandled_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error ? event.error.stack : null,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        type: 'unhandled_promise_rejection',
        reason: event.reason,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
      });
    });
  }

  // Check for React hydration errors
  checkHydrationErrors() {
    const hydrationErrors = [];
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && 
                node.textContent.includes('Hydration failed')) {
              hydrationErrors.push({
                type: 'hydration_error',
                message: node.textContent,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
              });
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return hydrationErrors;
  }

  // Analyze page-specific issues
  analyzePage(pageName) {
    const pageAnalysis = {
      name: pageName,
      url: window.location.href,
      status: 'unknown',
      errors: [],
      warnings: [],
      networkErrors: [],
      missingElements: [],
      loadTime: performance.now()
    };

    // Check for common missing elements
    const criticalSelectors = [
      '[data-testid="dashboard"]',
      '.main-content',
      '.error-boundary',
      '#__next'
    ];

    criticalSelectors.forEach(selector => {
      if (!document.querySelector(selector)) {
        pageAnalysis.missingElements.push(selector);
      }
    });

    // Check for error boundaries
    const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
    if (errorBoundaries.length === 0) {
      pageAnalysis.warnings.push('No error boundaries detected');
    }

    // Determine page status
    if (document.querySelector('.error-page') || 
        document.title.includes('Error') ||
        document.body.textContent.includes('Something went wrong')) {
      pageAnalysis.status = 'error';
    } else if (document.querySelector('[data-loading="true"]') ||
               document.body.textContent.includes('Loading...')) {
      pageAnalysis.status = 'loading';
    } else {
      pageAnalysis.status = 'loaded';
    }

    return pageAnalysis;
  }

  // Generate comprehensive report
  generateReport() {
    return {
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalNetworkErrors: this.networkErrors.length,
        pagesAnalyzed: Object.keys(this.pageResults).length,
        timestamp: new Date().toISOString()
      },
      errors: this.errors,
      warnings: this.warnings,
      networkErrors: this.networkErrors,
      pageResults: this.pageResults,
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.errors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'JavaScript Errors',
        message: `Found ${this.errors.length} JavaScript errors that need immediate attention`
      });
    }

    if (this.networkErrors.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Network Issues',
        message: `Found ${this.networkErrors.length} failed API calls or network requests`
      });
    }

    const brokenPages = Object.values(this.pageResults).filter(page => page.status === 'error');
    if (brokenPages.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Page Functionality',
        message: `${brokenPages.length} pages are completely broken and unusable`
      });
    }

    return recommendations;
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.CypherErrorAnalyzer = ErrorAnalyzer;
  window.startErrorAnalysis = () => {
    const analyzer = new ErrorAnalyzer();
    analyzer.captureConsoleErrors();
    analyzer.monitorNetworkRequests();
    analyzer.captureUnhandledErrors();
    analyzer.checkHydrationErrors();
    
    console.log('🔍 CYPHER Error Analysis Started');
    console.log('Navigate through the application to capture errors');
    console.log('Use analyzer.generateReport() to get the final report');
    
    return analyzer;
  };
}