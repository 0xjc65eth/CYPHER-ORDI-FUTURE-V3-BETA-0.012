/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo de produção rigoroso
  reactStrictMode: true,
  
  // Configuração de imagens otimizada
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ordinals.com',
      },
      {
        protocol: 'https',
        hostname: 'magiceden.io',
      },
      {
        protocol: 'https',
        hostname: 'api.coinmarketcap.com',
      },
      {
        protocol: 'https',
        hostname: 'api.ordiscan.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // TypeScript - Remover após corrigir todos os erros
  typescript: {
    // TODO: Mudar para false após corrigir erros
    ignoreBuildErrors: false,
  },

  // ESLint - Remover após corrigir todos os warnings
  eslint: {
    // TODO: Mudar para false após corrigir warnings
    ignoreDuringBuilds: false,
  },

  // Otimizações experimentais
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      '@radix-ui',
      'lucide-react',
      'framer-motion',
      '@tremor/react',
      'recharts',
      'd3',
    ],
    // Cache de componentes do servidor
    serverComponentsExternalPackages: ['@tensorflow/tfjs', 'sharp'],
  },
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Configuração webpack otimizada
  webpack: (config, { isServer, dev }) => {
    // Otimizações de produção
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000 &&
                  /node_modules[/\\]/.test(module.identifier());
              },
              name(module) {
                const hash = crypto.createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module, chunks) {
                return crypto
                  .createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex')
                  .substring(0, 8);
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Resolução de módulos para cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Apenas os essenciais para crypto/blockchain
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),        // Desabilitar módulos Node.js não essenciais
        fs: false,
        net: false,
        tls: false,
        dns: false,
        http2: false,
        child_process: false,
      };
      
      // Provide plugin para Buffer global
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }

    // Ignorar warnings específicos
    config.ignoreWarnings = [
      { module: /node_modules\/ws/ },
      { module: /node_modules\/express/ },
    ];

    return config;
  },

  // Redirecionamentos e rewrites
  async redirects() {
    return [
      // Redirecionar rotas antigas para novas      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ];
  },

  // Configuração de output para Vercel
  // NÃO usar 'standalone' no Vercel
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  
  // Configuração de páginas estáticas
  staticPageGenerationTimeout: 60,

  // Variáveis de ambiente permitidas no cliente
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://cypher-ordi-future.vercel.app',
  },
};

// Importar crypto apenas no servidor
const crypto = require('crypto');
const webpack = require('webpack');

module.exports = nextConfig;