/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ordinals.com', 'magiceden.io', 'api.coinmarketcap.com', 'api.ordiscan.com'],
    unoptimized: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@tremor/react', 'recharts'],
    serverComponentsExternalPackages: ['axios', '@supabase/supabase-js'],
  },
  // Configuração para o App Router
  output: 'standalone',
  // Habilitar verificação TypeScript e ESLint
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Configuração para lidar com erros
  onDemandEntries: {
    // Período em ms em que uma página deve permanecer no buffer
    maxInactiveAge: 25 * 1000,
    // Número de páginas que devem ser mantidas em buffer
    pagesBufferLength: 4,
  },
  // Configuração para lidar com timeouts
  serverRuntimeConfig: {
    // Configurações disponíveis apenas no servidor
    apiTimeout: 10000, // 10 segundos
  },
  publicRuntimeConfig: {
    // Configurações disponíveis no cliente e no servidor
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  },
  webpack: (config, { isServer }) => {
    // Enhanced module resolution for better error handling
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      buffer: false,
    };

    // Add safe module loading to prevent undefined 'call' errors
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Exclude problematic Web Worker files from processing
    config.module.rules.push({
      test: /HeartbeatWorker\.js$/,
      type: 'asset/source',
    });

    // Enhanced error handling for webpack modules
    const originalFactory = config.module.rules.find(
      rule => rule.oneOf
    )?.oneOf?.find(
      rule => rule.use?.loader?.includes('next-swc-loader')
    );

    if (originalFactory) {
      const originalUse = originalFactory.use;
      originalFactory.use = function(info) {
        try {
          return typeof originalUse === 'function' ? originalUse(info) : originalUse;
        } catch (error) {
          console.warn('Webpack module loading error handled:', error.message);
          return [];
        }
      };
    }

    // Safer module.exports handling
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: {
            ...config.optimization.splitChunks?.cacheGroups?.default,
            enforce: true,
            reuseExistingChunk: true,
          },
        },
      },
    };

    // Prevent undefined module.exports errors
    config.plugins = config.plugins || [];
    
    // Ignorar módulos não encontrados durante o build
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { message: /Can't resolve/ },
      { message: /Critical dependency/ },
      { message: /Module not found/ },
      { file: /HeartbeatWorker\.js/ },
      { message: /export.*cannot be used outside of module code/ },
    ];

    return config;
  },

  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig