/**
 * 🛡️ WALLET CONFLICT INITIALIZATION - CYPHER ORDi FUTURE V3
 * Inicializa o resolver de conflitos antes de outros scripts carregarem
 */

// Import and initialize the wallet conflict resolver as early as possible
// Only run on client side to prevent SSR issues

// Initialize immediately when this module loads
if (typeof window !== 'undefined') {
  import('@/utils/wallet-conflict-resolver').then(({ WalletConflictResolver }) => {
    import('@/utils/extension-conflict-detector').then(({ ExtensionConflictDetector }) => {
      import('@/lib/enhanced-logger').then(({ EnhancedLogger }) => {
        try {
          // Create the resolver with defensive configuration
          const resolver = WalletConflictResolver.getInstance({
            preventGlobalOverrides: true,
            preserveExisting: true,
            logConflicts: true,
            fallbackToLastProvider: false
          });

          // Initialize extension conflict detector
          const detector = ExtensionConflictDetector.getInstance();

          EnhancedLogger.info('Wallet conflict protection initialized', {
            component: 'WalletConflictInit',
            hasConflicts: resolver.hasConflicts(),
            activeProviders: resolver.getActiveProviders().length,
            detectedExtensions: detector.getActiveExtensions().length
          });

          // Expose utilities to global scope for debugging
          (window as any).__cypherWalletResolver = resolver;
          (window as any).__cypherConflictDetector = detector;

          // Log conflict report after a short delay to allow extensions to load
          setTimeout(() => {
            const report = detector.getConflictReport();
            if (report.activeConflicts > 0) {
              EnhancedLogger.warn('Extension conflicts detected', {
                component: 'WalletConflictInit',
                report
              });
            }
          }, 5000);

        } catch (error) {
          console.error('Failed to initialize wallet conflict resolver:', error);
        }
      }).catch(() => {});
    }).catch(() => {});
  }).catch(() => {});
}

export default {}; // Empty export to make this a module