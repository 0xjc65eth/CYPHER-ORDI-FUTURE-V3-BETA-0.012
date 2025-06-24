#!/bin/bash

echo "🚀 Iniciando CYPHER ORDi Future V3..."
echo "📍 Diretório: $(pwd)"
echo "🔧 Node.js: $(node --version)"
echo "📦 NPM: $(npm --version)"

# Limpar processos anteriores
pkill -f "next dev" 2>/dev/null || true

# Aguardar um momento
sleep 2

echo "🌟 Iniciando servidor na porta 4444..."
echo "🌐 Acesse: http://localhost:4444"
echo "⚡ Para parar: Ctrl+C"
echo ""

# Iniciar o servidor
npm run dev