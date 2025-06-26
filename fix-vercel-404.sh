#!/bin/bash

echo "🔧 Corrigindo erros 404 no Vercel..."

# 1. Adicionar export const dynamic em todas API routes problemáticas
echo "📝 Adicionando 'export const dynamic' nas API routes..."

# Lista de arquivos que precisam da correção
API_FILES=(
  "src/app/api/analytics/route.ts"
  "src/app/api/live-activity/route.ts"
  "src/app/api/fees/report/route.ts"
  "src/app/api/fees/distribute/route.ts"
  "src/app/api/fees/stats/route.ts"
  "src/app/api/fees/track-redirect/route.ts"
  "src/app/api/fees/addresses/route.ts"
  "src/app/api/arbitrage/opportunities/route.ts"
  "src/app/api/arbitrage/real-opportunities/route.ts"
  "src/app/api/runes/list/route.ts"
  "src/app/api/runes/market-data/route.ts"
  "src/app/api/runes/etchings/route.ts"
  "src/app/api/runes/price-data/route.ts"
  "src/app/api/ordinals/list/route.ts"
  "src/app/api/hyperliquid/route.ts"
)

for file in "${API_FILES[@]}"; do
  if [ -f "$file" ]; then
    # Verificar se já tem export const dynamic
    if ! grep -q "export const dynamic" "$file"; then
      # Adicionar após os imports
      sed -i '' '/^import.*$/a\
\
export const dynamic = '\''force-dynamic'\''
' "$file"
      echo "✅ Corrigido: $file"
    else
      echo "⏭️  Já corrigido: $file"
    fi
  fi
done

# 2. Reabilitar páginas essenciais
echo -e "\n📂 Reabilitando páginas desabilitadas..."

if [ -f "src/app/portfolio/page.tsx.disabled" ]; then
  mv src/app/portfolio/page.tsx.disabled src/app/portfolio/page.tsx
  echo "✅ Reabilitado: /portfolio"
fi

if [ -f "src/app/brc20/page.tsx.disabled" ]; then
  mv src/app/brc20/page.tsx.disabled src/app/brc20/page.tsx
  echo "✅ Reabilitado: /brc20"
fi

if [ -d "src/app/_auth.disabled" ]; then
  mv src/app/_auth.disabled src/app/auth
  echo "✅ Reabilitado: /auth/*"
fi

# 3. Criar página 404 customizada
echo -e "\n📄 Criando página 404 customizada..."
cat > src/app/not-found.tsx << 'EOF'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-orange-500">404</h1>
        <p className="text-2xl text-gray-400 mb-8">Página não encontrada</p>
        <div className="space-x-4">
          <Link 
            href="/" 
            className="bg-orange-500 text-black px-6 py-3 rounded font-bold hover:bg-orange-400"
          >
            Voltar ao Início
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-gray-800 text-white px-6 py-3 rounded font-bold hover:bg-gray-700"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
EOF
echo "✅ Página 404 criada"

# 4. Atualizar middleware para tratamento de rotas
echo -e "\n🔧 Criando middleware para tratamento de rotas..."
cat > src/middleware.ts << 'EOF'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirecionar rotas antigas
  const pathname = request.nextUrl.pathname
  
  // Mapa de redirects
  const redirects: Record<string, string> = {
    '/home': '/',
    '/dashboard': '/',
    '/portfolio': '/wallet',
    '/quick-trade': '/quicktrade',
  }
  
  if (redirects[pathname]) {
    return NextResponse.redirect(new URL(redirects[pathname], request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
EOF
echo "✅ Middleware criado"

echo -e "\n✅ Correções aplicadas! Próximos passos:"
echo "1. Revisar as mudanças"
echo "2. Testar localmente: npm run dev"
echo "3. Fazer commit e push"
echo "4. Verificar deploy no Vercel"