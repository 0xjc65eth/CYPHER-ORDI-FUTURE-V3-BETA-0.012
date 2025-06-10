# 🚀 CYPHER ORDI FUTURE v3.1.0 - Deployment Guide

Complete deployment guide for the enhanced Bitcoin blockchain analytics platform with enterprise-grade security and AI-powered features.

## 📋 Pre-Deployment Checklist

### System Requirements
- **Node.js**: 20.18.0+ (Required for Solana packages)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum, 50GB recommended for production
- **CPU**: 2 cores minimum, 4 cores recommended

### Required Services
- **Database**: Supabase (optional but recommended)
- **Cache**: Redis (optional for production optimization)
- **CDN**: Vercel Edge Network or CloudFront
- **Monitoring**: Sentry for error tracking

## 🔧 Environment Setup

### 1. Node.js Version Management

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20.18.0
nvm use 20.18.0

# Verify version
node --version  # Should show v20.18.0+
```

### 2. Environment Variables

Create `.env.local` with the following configuration:

```bash
# ==================== REQUIRED API KEYS ====================
# CoinGecko API (Free tier available)
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key

# Glassnode API (Premium required for full features)
NEXT_PUBLIC_GLASSNODE_API_KEY=your_glassnode_api_key

# Ordiscan API (Required for Ordinals data)
NEXT_PUBLIC_ORDISCAN_API_KEY=your_ordiscan_api_key

# ==================== DATABASE (OPTIONAL) ====================
# Supabase for user data and neural learning persistence
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ==================== CACHE (PRODUCTION) ====================
# Redis for enhanced performance
REDIS_URL=redis://localhost:6379
# OR for Redis Cloud
REDIS_URL=rediss://username:password@host:port

# ==================== AI SERVICES (OPTIONAL) ====================
# OpenAI for enhanced neural learning
OPENAI_API_KEY=sk-your_openai_api_key

# Google AI for additional AI features
GOOGLE_AI_API_KEY=your_google_ai_api_key

# ==================== MONITORING (PRODUCTION) ====================
# Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# ==================== DEPLOYMENT SETTINGS ====================
# App URL for production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Environment
NODE_ENV=production

# ==================== SECURITY SETTINGS ====================
# JWT Secret for session management
JWT_SECRET=your-super-secure-jwt-secret-here

# Encryption key for sensitive data
ENCRYPTION_KEY=your-32-character-encryption-key

# Rate limiting settings
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000  # 15 minutes

# ==================== QUICKTRADE SETTINGS ====================
# Fee collection addresses (replace with your addresses)
FEE_COLLECTION_ADDRESS_BTC=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
FEE_COLLECTION_ADDRESS_ETH=0x742d35Cc6634C0532925a3b8D35Cc6634C0532925a
FEE_COLLECTION_ADDRESS_SOL=11111111111111111111111111111112
```

## 🏗️ Platform-Specific Deployment

### 🔵 Vercel (Recommended)

#### Prerequisites
```bash
npm install -g vercel
```

#### Configuration
Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/quicktrade/:path*",
      "destination": "/api/quicktrade/:path*"
    }
  ]
}
```

#### Deployment Steps
```bash
# 1. Build and test locally
npm run build
npm run start

# 2. Deploy to Vercel
vercel --prod

# 3. Set environment variables via Vercel dashboard
# Go to: https://vercel.com/dashboard/project/settings/environment-variables
```

#### Custom Domain Setup
```bash
# Add custom domain
vercel domains add your-domain.com

# Configure DNS
# Add CNAME record: www -> cname.vercel-dns.com
# Add A record: @ -> 76.76.19.19
```

### 🟢 Render

#### Configuration
Render automatically detects the `render.yaml` file:

```yaml
services:
  - type: web
    name: cypher-ordi-future
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_VERSION
        value: 20.18.0
      - key: NODE_ENV
        value: production
    domains:
      - your-domain.com
```

#### Deployment Steps
```bash
# 1. Connect GitHub repository to Render
# 2. Configure environment variables in Render dashboard
# 3. Deploy automatically on git push
```

### 🔴 Self-Hosted (Ubuntu/CentOS)

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.18.0
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### Application Deployment
```bash
# 1. Clone repository
git clone https://github.com/your-username/cypher-ordi-future-v3.git
cd cypher-ordi-future-v3

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cypher-ordi-future',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/cypher-ordi-future
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/cypher-ordi-future /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Post-Deployment Configuration

### 1. Database Setup (Supabase)

#### Create Tables
```sql
-- Neural learning data
CREATE TABLE neural_learning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security logs
CREATE TABLE security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  details JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction monitoring
CREATE TABLE transaction_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT NOT NULL,
  address TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  risk_score DECIMAL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Setup Row Level Security
```sql
ALTER TABLE neural_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_monitoring ENABLE ROW LEVEL SECURITY;

-- Create policies as needed
CREATE POLICY "Allow read access" ON neural_learning_data FOR SELECT USING (true);
```

### 2. Redis Setup (Production)

#### Local Redis Installation
```bash
# Ubuntu/Debian
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: maxmemory 2gb
# Set: maxmemory-policy allkeys-lru

sudo systemctl restart redis-server
```

#### Redis Cloud (Recommended)
1. Sign up at [Redis Cloud](https://redis.com/redis-enterprise-cloud/)
2. Create a new database
3. Copy the connection string to `REDIS_URL`

### 3. Monitoring Setup

#### Sentry Configuration
```bash
# Install Sentry
npm install @sentry/nextjs

# Add to next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  {
    // Your existing Next.js config
  },
  {
    org: 'your-org',
    project: 'cypher-ordi-future',
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

#### Health Check Endpoint
Create `/app/api/health/route.ts`:
```typescript
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.1.0',
    services: {
      database: 'healthy', // Check database connection
      cache: 'healthy',    // Check Redis connection
      ai: 'healthy'        // Check AI services
    }
  };

  return Response.json(health);
}
```

## 🔐 Security Hardening

### 1. Environment Security
```bash
# Set proper file permissions
chmod 600 .env.local
chown www-data:www-data .env.local

# Secure server
sudo ufw enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
```

### 2. API Rate Limiting
Configure rate limiting in production:
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const limit = 100; // Requests per window
  const windowMs = 15 * 60 * 1000; // 15 minutes

  const current = rateLimit.get(ip) || { count: 0, resetTime: Date.now() + windowMs };

  if (Date.now() > current.resetTime) {
    current.count = 0;
    current.resetTime = Date.now() + windowMs;
  }

  if (current.count >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  current.count++;
  rateLimit.set(ip, current);

  return NextResponse.next();
}
```

## 📊 Performance Optimization

### 1. CDN Configuration
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['api.ordiscan.com', 'ordinals.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};
```

### 2. Bundle Analysis
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Add to package.json
"analyze": "ANALYZE=true next build"

# Run analysis
npm run analyze
```

## 🧪 Testing & Validation

### 1. Pre-Production Testing
```bash
# Run all tests
npm test

# Check TypeScript
npm run type-check

# Lint code
npm run lint

# Test build
npm run build
npm run start
```

### 2. Load Testing
```bash
# Install artillery
npm install -g artillery

# Create load test
cat > load-test.yml << EOF
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "Homepage load"
    requests:
      - get:
          url: "/"
EOF

# Run load test
artillery run load-test.yml
```

## 📈 Monitoring & Maintenance

### 1. Daily Monitoring
- Check application logs: `pm2 logs`
- Monitor resource usage: `htop`, `df -h`
- Verify SSL certificate: `curl -I https://your-domain.com`
- Check database connections
- Verify Redis performance

### 2. Weekly Maintenance
- Update dependencies: `npm audit fix`
- Check security logs
- Review performance metrics
- Backup database
- Update system packages

### 3. Monthly Tasks
- SSL certificate renewal check
- Security audit
- Performance optimization review
- Dependency vulnerability scan
- Backup strategy validation

## 🚨 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=4096"
npm run build
```

#### Database Connection
```bash
# Test Supabase connection
curl -H "apikey: YOUR_ANON_KEY" https://YOUR_PROJECT.supabase.co/rest/v1/
```

#### Redis Connection
```bash
# Test Redis connection
redis-cli ping
```

### Emergency Recovery
```bash
# Quick rollback
pm2 stop cypher-ordi-future
git checkout HEAD~1
npm install
npm run build
pm2 start ecosystem.config.js
```

## 📞 Support

For deployment support:
- **Email**: support@cypher-ordi-future.com
- **Discord**: [Join our community](https://discord.gg/cypher-ordi-future)
- **Documentation**: [docs.cypher-ordi-future.com](https://docs.cypher-ordi-future.com)

---

**Deployment completed successfully! 🎉**

Your CYPHER ORDI FUTURE v3.1.0 platform is now ready to serve the Bitcoin community with enterprise-grade analytics and AI-powered insights.