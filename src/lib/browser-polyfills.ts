'use client'

// Browser polyfills for Node.js environment
if (typeof globalThis !== 'undefined') {
  // Define self if not defined (for server-side rendering)
  if (typeof self === 'undefined') {
    (globalThis as any).self = globalThis;
  }

  // Define window if not defined (for server-side rendering)
  if (typeof window === 'undefined') {
    (globalThis as any).window = globalThis;
  }

  // Add other browser globals that might be missing
  if (typeof document === 'undefined') {
    (globalThis as any).document = {
      createElement: () => ({}),
      getElementById: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      body: {
        appendChild: () => {},
        removeChild: () => {},
      }
    };
  }

  // Navigator polyfill
  if (typeof navigator === 'undefined') {
    (globalThis as any).navigator = {
      userAgent: 'Node.js',
      platform: 'Node.js',
      language: 'en',
    };
  }

  // Location polyfill
  if (typeof location === 'undefined') {
    (globalThis as any).location = {
      href: '',
      origin: '',
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '4444',
      pathname: '/',
      search: '',
      hash: '',
    };
  }
}

export {};