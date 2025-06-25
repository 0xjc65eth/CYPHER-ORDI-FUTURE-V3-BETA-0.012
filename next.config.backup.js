/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify removido (deprecated no Next.js 15)
  images: {
    domains: ['ordinals.com', 'magiceden.io', 'api.coinmarketcap.com', 'api.ordiscan.com'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
    staleTimes: {
      dynamic: 30,
      static: 180,
    }
  },
  // output: 'standalone', // REMOVIDO para Vercel - causa 404
  webpack: (config, { isServer }) => {
    // Corrigir módulos Node.js no cliente
    if (!isServer) {
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
      }
    }
    
    // Externalizar dependências problemáticas
    config.externals.push('pino-pretty', 'encoding')
    
    return config
  }
}

module.exports = nextConfig