#!/bin/bash

echo "🔍 DIAGNÓSTICO DO SERVIDOR CYPHER ORDi FUTURE V3"
echo "================================================"
echo ""

# Informações do sistema
echo "📋 INFORMAÇÕES DO SISTEMA:"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "Sistema: $(uname -s)"
echo "Arquitetura: $(uname -m)"
echo ""

# Verificar diretório
echo "📁 DIRETÓRIO ATUAL:"
echo "$(pwd)"
echo ""

# Verificar arquivos essenciais
echo "📄 ARQUIVOS ESSENCIAIS:"
[ -f "package.json" ] && echo "✅ package.json" || echo "❌ package.json"
[ -f "next.config.js" ] && echo "✅ next.config.js" || echo "❌ next.config.js"
[ -f "src/app/page.tsx" ] && echo "✅ src/app/page.tsx" || echo "❌ src/app/page.tsx"
[ -f "src/app/layout.tsx" ] && echo "✅ src/app/layout.tsx" || echo "❌ src/app/layout.tsx"
[ -d "node_modules" ] && echo "✅ node_modules" || echo "❌ node_modules"
echo ""

# Verificar portas em uso
echo "🌐 PORTAS EM USO:"
lsof -ti:4444 > /dev/null && echo "⚠️  Porta 4444 já está em uso" || echo "✅ Porta 4444 livre"
lsof -ti:3000 > /dev/null && echo "⚠️  Porta 3000 já está em uso" || echo "✅ Porta 3000 livre"
echo ""

# Verificar processos Next.js
echo "🔄 PROCESSOS NEXT.JS ATIVOS:"
ps aux | grep -i next | grep -v grep || echo "Nenhum processo Next.js encontrado"
echo ""

# Testar compilação básica
echo "🔨 TESTE DE COMPILAÇÃO:"
echo "Executando: npx next build --dry-run"
timeout 30 npx next build --dry-run 2>&1 | head -10
echo ""

# Tentar iniciar servidor
echo "🚀 INICIANDO SERVIDOR DE TESTE:"
echo "Tentando iniciar na porta 4444..."
npm run dev &
SERVER_PID=$!

# Aguardar inicialização
echo "Aguardando 10 segundos para inicialização..."
sleep 10

# Testar conexão
echo ""
echo "🌐 TESTANDO CONEXÃO:"
curl -s -m 5 http://localhost:4444 > /dev/null && echo "✅ Servidor respondendo!" || echo "❌ Servidor não responde"

# Parar servidor de teste
kill $SERVER_PID 2>/dev/null

echo ""
echo "🏁 DIAGNÓSTICO CONCLUÍDO"
echo "========================"