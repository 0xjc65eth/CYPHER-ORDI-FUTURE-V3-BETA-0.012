#!/bin/bash

echo "🔍 Verificando correções de 404..."
echo ""

# 1. Verificar páginas principais
echo "📄 Verificando páginas principais:"
pages=(
  "src/app/page.tsx"
  "src/app/dashboard/page.tsx"
  "src/app/cypher-ai/page.tsx"
  "src/app/market/page.tsx"
  "src/app/wallet/page.tsx"
  "src/app/portfolio/page.tsx"
  "src/app/ordinals/page.tsx"
  "src/app/runes/page.tsx"
  "src/app/auth/login/page.tsx"
)

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    echo "✅ $page"
  else
    echo "❌ $page (404)"
  fi
done

echo ""
echo "🔌 Verificando API routes com dynamic export:"
api_routes=(
  "src/app/api/analytics/route.ts"
  "src/app/api/live-activity/route.ts"
  "src/app/api/fees/report/route.ts"
  "src/app/api/arbitrage/opportunities/route.ts"
  "src/app/api/runes/list/route.ts"
  "src/app/api/ordinals/list/route.ts"
)

for route in "${api_routes[@]}"; do
  if [ -f "$route" ]; then
    if grep -q "export const dynamic = 'force-dynamic'" "$route"; then
      echo "✅ $route (dynamic configured)"
    else
      echo "⚠️  $route (missing dynamic export)"
    fi
  else
    echo "❌ $route (not found)"
  fi
done

echo ""
echo "🚫 Verificando páginas ainda desabilitadas:"
disabled_count=$(find src/app -name "*.disabled" | wc -l | tr -d ' ')
if [ "$disabled_count" -gt 0 ]; then
  echo "⚠️  Ainda existem $disabled_count arquivos desabilitados:"
  find src/app -name "*.disabled" | head -10
else
  echo "✅ Nenhum arquivo desabilitado encontrado"
fi

echo ""
echo "📂 Verificando estrutura de diretórios:"
dirs=(
  "src/app/auth"
  "src/app/api"
  ".next"
)

for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir"
  else
    echo "❌ $dir"
  fi
done

echo ""
echo "🔧 Verificando arquivos de configuração:"
configs=(
  "next.config.js"
  "vercel.json"
  "src/middleware.ts"
  "src/app/not-found.tsx"
)

for config in "${configs[@]}"; do
  if [ -f "$config" ]; then
    echo "✅ $config"
  else
    echo "❌ $config"
  fi
done

echo ""
echo "📊 Resumo:"
echo "- Use 'npm run build' para testar localmente"
echo "- Commit e push para deploy no Vercel"
echo "- Monitore os logs do Vercel para erros de runtime"