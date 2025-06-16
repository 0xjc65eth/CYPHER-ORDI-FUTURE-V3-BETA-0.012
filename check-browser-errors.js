/**
 * Browser Console Error Checker for CYPHER ORDi Future V3
 * This script runs in the browser to detect and report errors
 */
const checkBrowserErrors = () => {
  console.log('🔍 Starting Browser Error Check...');
  
  // Check for basic runtime errors
  const errorReport = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    location: window.location.href,
    errors: [],
    warnings: [],
    performance: {},
    modules: {}
  };

  // Check if essential modules are loaded
  const essentialModules = [
    'React',
    'Next',
    'window.cypherLogger',
    'window.__cypherErrorTracker'
  ];

  essentialModules.forEach(module => {
    try {
      const moduleExists = eval(`typeof ${module} !== 'undefined'`);
      errorReport.modules[module] = moduleExists;
      if (!moduleExists) {
        errorReport.errors.push(`Module not loaded: ${module}`);
      }
    } catch (error) {
      errorReport.modules[module] = false;
      errorReport.errors.push(`Error checking module ${module}: ${error.message}`);
    }
  });

  // Check wallet providers
  const walletProviders = [
    'window.bitcoin',
    'window.unisat',
    'window.XverseProviders'
  ];

  walletProviders.forEach(provider => {
    try {
      const providerExists = eval(`typeof ${provider} !== 'undefined'`);
      errorReport.modules[provider] = providerExists;
    } catch (error) {
      errorReport.modules[provider] = false;
    }
  });

  // Check for console errors in error tracker
  if (window.__cypherErrorTracker) {
    const trackerReport = window.__cypherErrorTracker.getErrorReport();
    errorReport.trackedErrors = trackerReport;
  }

  // Performance check
  if (performance.getEntriesByType) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      errorReport.performance = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstByte: navigation.responseStart - navigation.requestStart
      };
    }
  }

  // Check for React hydration errors
  const reactErrors = document.querySelectorAll('[data-reactroot]');
  if (reactErrors.length === 0) {
    errorReport.warnings.push('No React root elements found - possible hydration issues');
  }

  // Check for network errors in console
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const failedResources = resources.filter(resource => 
      resource.transferSize === 0 && resource.decodedBodySize === 0
    );
    
    if (failedResources.length > 0) {
      errorReport.errors.push(`Failed to load ${failedResources.length} resources`);
      errorReport.failedResources = failedResources.map(r => r.name);
    }
  }

  console.log('📊 Browser Error Report:', errorReport);
  return errorReport;
};

// Auto-run check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkBrowserErrors);
} else {
  checkBrowserErrors();
}

// Export for manual use
window.checkBrowserErrors = checkBrowserErrors;