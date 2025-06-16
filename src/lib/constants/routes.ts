// Application Route Constants and Metadata

export interface RouteMetadata {
  path: string
  title: string
  description: string
  keywords: string[]
  breadcrumb: string
  parent?: string
  order: number
  isPublic?: boolean
  isPro?: boolean
  isNew?: boolean
  icon?: string
}

export const ROUTES: Record<string, RouteMetadata> = {
  // Main Routes
  HOME: {
    path: '/',
    title: 'CYPHER ORDI FUTURE',
    description: 'Advanced Bitcoin Trading Intelligence Platform',
    keywords: ['bitcoin', 'trading', 'AI', 'ordinals', 'runes'],
    breadcrumb: 'Home',
    order: 1,
    isPublic: true
  },
  DASHBOARD: {
    path: '/dashboard',
    title: 'Dashboard | CYPHER ORDI',
    description: 'Real-time market overview and trading insights',
    keywords: ['dashboard', 'analytics', 'trading', 'bitcoin'],
    breadcrumb: 'Dashboard',
    order: 2,
    isPublic: false
  },
  
  // AI Features
  CYPHER_AI: {
    path: '/cypher-ai',
    title: 'CYPHER AI | Advanced Trading Intelligence',
    description: 'AI-powered trading signals and market predictions',
    keywords: ['AI', 'trading', 'signals', 'predictions', 'machine learning'],
    breadcrumb: 'CYPHER AI',
    order: 3,
    isPro: true
  },
  DUAL_MODE: {
    path: '/dual-mode',
    title: 'Dual Mode | ORDI + AI Combined',
    description: 'Unified ORDI and AI trading interface',
    keywords: ['dual mode', 'ORDI', 'AI', 'unified', 'trading'],
    breadcrumb: 'Dual Mode',
    order: 4,
    isNew: true
  },
  NEURAL: {
    path: '/neural',
    title: 'Neural Lab | AI Model Training',
    description: 'Train and test custom AI trading models',
    keywords: ['neural', 'AI', 'model', 'training', 'machine learning'],
    breadcrumb: 'Neural Lab',
    parent: '/cypher-ai',
    order: 5,
    isPro: true
  },
  
  // Trading Features
  ARBITRAGE: {
    path: '/arbitrage',
    title: 'Arbitrage Scanner | Cross-Exchange Opportunities',
    description: 'Real-time arbitrage opportunities across exchanges',
    keywords: ['arbitrage', 'trading', 'opportunities', 'cross-exchange'],
    breadcrumb: 'Arbitrage',
    order: 6
  },
  MARKET: {
    path: '/market',
    title: 'Market Data | Live Bitcoin Analytics',
    description: 'Live market data, charts and technical analysis',
    keywords: ['market', 'data', 'charts', 'technical analysis'],
    breadcrumb: 'Market',
    order: 7
  },
  TRADING: {
    path: '/trading',
    title: 'Trading Terminal | Professional Trading Tools',
    description: 'Advanced trading terminal with professional tools',
    keywords: ['trading', 'terminal', 'professional', 'tools'],
    breadcrumb: 'Trading',
    order: 8
  },
  
  // Bitcoin Ecosystem
  ORDINALS: {
    path: '/ordinals',
    title: 'Ordinals | Bitcoin NFTs & Inscriptions',
    description: 'Track and analyze Bitcoin Ordinals inscriptions',
    keywords: ['ordinals', 'bitcoin', 'NFT', 'inscriptions'],
    breadcrumb: 'Ordinals',
    order: 9
  },
  RUNES: {
    path: '/runes',
    title: 'Runes | Bitcoin Fungible Tokens',
    description: 'Explore and track Bitcoin Runes protocol tokens',
    keywords: ['runes', 'bitcoin', 'tokens', 'fungible'],
    breadcrumb: 'Runes',
    order: 10
  },
  BRC20: {
    path: '/brc20',
    title: 'BRC-20 | Token Analytics',
    description: 'BRC-20 token analytics and market data',
    keywords: ['BRC-20', 'tokens', 'analytics', 'bitcoin'],
    breadcrumb: 'BRC-20',
    order: 11
  },
  RARE_SATS: {
    path: '/rare-sats',
    title: 'Rare Sats | Satoshi Hunting',
    description: 'Hunt and track rare satoshis on Bitcoin',
    keywords: ['rare sats', 'satoshi', 'hunting', 'bitcoin'],
    breadcrumb: 'Rare Sats',
    order: 12
  },
  
  // Mining & Network
  MINERS: {
    path: '/miners',
    title: 'Miners | Mining Profitability & Stats',
    description: 'Bitcoin mining profitability calculator and statistics',
    keywords: ['mining', 'bitcoin', 'profitability', 'hashrate'],
    breadcrumb: 'Miners',
    order: 13
  },
  
  // Analytics & Portfolio
  ANALYTICS: {
    path: '/analytics',
    title: 'Analytics | Advanced Market Analysis',
    description: 'Advanced market analytics and trading insights',
    keywords: ['analytics', 'analysis', 'trading', 'insights'],
    breadcrumb: 'Analytics',
    order: 14
  },
  PORTFOLIO: {
    path: '/portfolio',
    title: 'Portfolio | Track Your Investments',
    description: 'Track and manage your crypto portfolio',
    keywords: ['portfolio', 'investments', 'tracking', 'management'],
    breadcrumb: 'Portfolio',
    order: 15
  },
  
  // Community & Learning
  SOCIAL: {
    path: '/social',
    title: 'Social | Community & Sentiment',
    description: 'Community sentiment and social trading insights',
    keywords: ['social', 'community', 'sentiment', 'trading'],
    breadcrumb: 'Social',
    order: 16
  },
  TRAINING: {
    path: '/training',
    title: 'Training | Learn AI Trading',
    description: 'Learn advanced AI trading strategies',
    keywords: ['training', 'learning', 'AI', 'strategies'],
    breadcrumb: 'Training',
    order: 17
  },
  
  // System & Settings
  INTEGRATIONS: {
    path: '/integrations',
    title: 'Integrations | Connect Exchanges & Wallets',
    description: 'Connect exchanges, wallets and external services',
    keywords: ['integrations', 'exchanges', 'wallets', 'connections'],
    breadcrumb: 'Integrations',
    order: 18
  },
  
  // Auth Routes
  LOGIN: {
    path: '/auth/login',
    title: 'Login | CYPHER ORDI',
    description: 'Login to your CYPHER ORDI account',
    keywords: ['login', 'auth', 'signin'],
    breadcrumb: 'Login',
    order: 19,
    isPublic: true
  },
  REGISTER: {
    path: '/auth/register',
    title: 'Register | CYPHER ORDI',
    description: 'Create your CYPHER ORDI account',
    keywords: ['register', 'signup', 'create account'],
    breadcrumb: 'Register',
    order: 20,
    isPublic: true
  },
  
  // Legal & Info
  ABOUT: {
    path: '/about',
    title: 'About | CYPHER ORDI',
    description: 'Learn about CYPHER ORDI FUTURE platform',
    keywords: ['about', 'company', 'platform', 'information'],
    breadcrumb: 'About',
    order: 21,
    isPublic: true
  },
  DOCUMENTATION: {
    path: '/documentation',
    title: 'Documentation | CYPHER ORDI',
    description: 'Platform documentation and API reference',
    keywords: ['documentation', 'docs', 'API', 'reference'],
    breadcrumb: 'Documentation',
    order: 22,
    isPublic: true
  },
  BLOG: {
    path: '/blog',
    title: 'Blog | CYPHER ORDI',
    description: 'Latest news, updates and trading insights',
    keywords: ['blog', 'news', 'updates', 'insights'],
    breadcrumb: 'Blog',
    order: 23,
    isPublic: true
  },
  LEGAL: {
    path: '/legal',
    title: 'Legal | Terms & Conditions',
    description: 'Legal terms and conditions',
    keywords: ['legal', 'terms', 'conditions'],
    breadcrumb: 'Legal',
    order: 24,
    isPublic: true
  },
  PRIVACY: {
    path: '/privacy',
    title: 'Privacy Policy | CYPHER ORDI',
    description: 'Privacy policy and data protection',
    keywords: ['privacy', 'policy', 'data protection'],
    breadcrumb: 'Privacy',
    order: 25,
    isPublic: true
  },
  TRADING_RULES: {
    path: '/trading-rules',
    title: 'Trading Rules | CYPHER ORDI',
    description: 'Platform trading rules and guidelines',
    keywords: ['trading rules', 'guidelines', 'compliance'],
    breadcrumb: 'Trading Rules',
    order: 26,
    isPublic: true
  },
  RISK_DISCLOSURE: {
    path: '/risk-disclosure',
    title: 'Risk Disclosure | CYPHER ORDI',
    description: 'Trading risk disclosure and warnings',
    keywords: ['risk', 'disclosure', 'warnings', 'trading'],
    breadcrumb: 'Risk Disclosure',
    order: 27,
    isPublic: true
  }
}

// Helper functions
export function getRouteByPath(path: string): RouteMetadata | undefined {
  return Object.values(ROUTES).find(route => route.path === path)
}

export function getBreadcrumbs(path: string): RouteMetadata[] {
  const breadcrumbs: RouteMetadata[] = []
  let currentRoute = getRouteByPath(path)
  
  while (currentRoute) {
    breadcrumbs.unshift(currentRoute)
    if (currentRoute.parent) {
      currentRoute = getRouteByPath(currentRoute.parent)
    } else {
      break
    }
  }
  
  // Always include home
  if (breadcrumbs[0]?.path !== '/') {
    breadcrumbs.unshift(ROUTES.HOME)
  }
  
  return breadcrumbs
}

export function getPublicRoutes(): RouteMetadata[] {
  return Object.values(ROUTES)
    .filter(route => route.isPublic)
    .sort((a, b) => a.order - b.order)
}

export function getProtectedRoutes(): RouteMetadata[] {
  return Object.values(ROUTES)
    .filter(route => !route.isPublic)
    .sort((a, b) => a.order - b.order)
}

export function getProRoutes(): RouteMetadata[] {
  return Object.values(ROUTES)
    .filter(route => route.isPro)
    .sort((a, b) => a.order - b.order)
}

export function getNewRoutes(): RouteMetadata[] {
  return Object.values(ROUTES)
    .filter(route => route.isNew)
    .sort((a, b) => a.order - b.order)
}

// Route groups for navigation
export const ROUTE_GROUPS = {
  AI_FEATURES: [ROUTES.CYPHER_AI, ROUTES.DUAL_MODE, ROUTES.NEURAL],
  TRADING: [ROUTES.ARBITRAGE, ROUTES.MARKET, ROUTES.TRADING],
  BITCOIN_ECOSYSTEM: [ROUTES.ORDINALS, ROUTES.RUNES, ROUTES.BRC20, ROUTES.RARE_SATS],
  ANALYTICS: [ROUTES.ANALYTICS, ROUTES.PORTFOLIO, ROUTES.MINERS],
  COMMUNITY: [ROUTES.SOCIAL, ROUTES.TRAINING],
  SYSTEM: [ROUTES.INTEGRATIONS],
  INFO: [ROUTES.ABOUT, ROUTES.DOCUMENTATION, ROUTES.BLOG],
  LEGAL: [ROUTES.LEGAL, ROUTES.PRIVACY, ROUTES.TRADING_RULES, ROUTES.RISK_DISCLOSURE]
}

// API Route patterns
export const API_ROUTES = {
  AUTH: '/api/auth',
  AI: '/api/ai',
  BITCOIN: '/api/bitcoin',
  ORDINALS: '/api/ordinals',
  RUNES: '/api/runes',
  ANALYTICS: '/api/analytics',
  DISCORD: '/api/discord',
  EMAIL: '/api/email',
  HEALTH: '/api/health'
}

// External URLs
export const EXTERNAL_URLS = {
  GITHUB: 'https://github.com/cypherordi',
  DISCORD: 'https://discord.gg/cypherordi',
  TWITTER: 'https://twitter.com/cypherordi',
  TELEGRAM: 'https://t.me/cypherordi',
  DOCUMENTATION: 'https://docs.cypherordi.com',
  API_DOCS: 'https://api.cypherordi.com/docs'
}

// Default meta tags
export const DEFAULT_META = {
  title: 'CYPHER ORDI FUTURE | Advanced Bitcoin Trading Intelligence',
  description: 'Professional Bitcoin trading platform with AI-powered insights, Ordinals, Runes, and advanced analytics',
  keywords: 'bitcoin, trading, AI, ordinals, runes, cryptocurrency, analytics, arbitrage',
  author: 'CYPHER ORDI FUTURE',
  robots: 'index, follow',
  ogType: 'website',
  ogSiteName: 'CYPHER ORDI FUTURE',
  twitterCard: 'summary_large_image',
  twitterSite: '@cypherordi'
}