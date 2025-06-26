'use client';

import { useEffect } from 'react';

export function ClientScriptLoader() {
  useEffect(() => {
    // Load scripts only after hydration to prevent SSR/CSR mismatch
    const scripts = [
      '/ultimate-wallet-protection.js',
      '/chunk-error-handler.js',
      '/error-tracker.js',
      '/wallet-conflict-resolver.js',
      '/wallet-conflict-suppressor.js',
      '/console-logger.js',
      '/navigation-debug.js'
    ];

    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        // Check if script already exists
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
          console.warn(`Failed to load script: ${src}`);
          resolve(); // Continue loading other scripts
        };
        
        document.head.appendChild(script);
      });
    };

    // Load critical scripts first, then others
    const loadScripts = async () => {
      try {
        // Load critical wallet protection first
        await loadScript('/ultimate-wallet-protection.js');
        
        // Load error handlers
        await Promise.all([
          loadScript('/chunk-error-handler.js'),
          loadScript('/error-tracker.js')
        ]);
        
        // Load wallet conflict resolvers
        await Promise.all([
          loadScript('/wallet-conflict-resolver.js'),
          loadScript('/wallet-conflict-suppressor.js')
        ]);
        
        // Load debug scripts last
        await Promise.all([
          loadScript('/console-logger.js'),
          loadScript('/navigation-debug.js')
        ]);
        
        console.log('✅ All client scripts loaded successfully');
      } catch (error) {
        console.error('❌ Error loading client scripts:', error);
      }
    };

    loadScripts();
  }, []);

  return null; // This component doesn't render anything
}