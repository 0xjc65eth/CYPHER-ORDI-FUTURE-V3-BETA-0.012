#!/bin/bash

echo "🧹 Movendo páginas de teste para fora do build..."

# Criar diretório para páginas de teste
mkdir -p src/app/_test-pages

# Lista de páginas de teste para mover
TEST_PAGES=(
  "test-chart"
  "test-final"
  "test-websocket"
  "test-cypher-ai"
  "chart-test"
  "chart-test-final"
  "error-test"
  "nav-test"
  "hydration-test"
  "component-test"
  "oauth-test"
  "test"
  "test-simple"
  "wallet-test"
  "wallet-connect-test"
  "chart-diagnostic"
  "debug-nav"
  "mock-demo"
  "direct-demo"
  "nav-test"
  "brc20-debug"
  "brc20-simple"
  "neural-test"
  "charts-test"
)

# Mover páginas
for page in "${TEST_PAGES[@]}"; do
  if [ -d "src/app/$page" ]; then
    mv "src/app/$page" "src/app/_test-pages/" 2>/dev/null && echo "✅ Movido: $page" || echo "❌ Erro ao mover: $page"
  fi
done

# Remover temporariamente páginas problemáticas do build
echo "🚫 Desabilitando páginas problemáticas..."
mv src/app/cypher-ai-v2 src/app/_cypher-ai-v2 2>/dev/null || true

echo "✨ Limpeza concluída!"