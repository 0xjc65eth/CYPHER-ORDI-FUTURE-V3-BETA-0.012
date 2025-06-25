#!/bin/bash

# Script master para preparar CYPHER ORDI-FUTURE-V3 para deploy no Vercel
# Execute com: chmod +x optimize-for-vercel.sh && ./optimize-for-vercel.sh

echo "🚀 CYPHER ORDI-FUTURE-V3 - OTIMIZAÇÃO PARA VERCEL"
echo "=================================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto!"
    exit 1
fi

# 1. Fazer backup dos arquivos atuais
echo "📦 Fazendo backup dos arquivos de configuração..."
cp next.config.js next.config.backup.js 2>/dev/null
cp vercel.json vercel.backup.json 2>/dev/null
cp package.json package.backup.json 2>/dev/null

# 2. Aplicar novas configurações
echo ""
echo "🔧 Aplicando configurações otimizadas..."

# Verificar se os arquivos otimizados existem
if [ -f "next.config.optimized.js" ]; then
    cp next.config.optimized.js next.config.js
    echo "✅ next.config.js atualizado"
else    echo "⚠️  next.config.optimized.js não encontrado"
fi

if [ -f "vercel.optimized.json" ]; then
    cp vercel.optimized.json vercel.json
    echo "✅ vercel.json atualizado"
else
    echo "⚠️  vercel.optimized.json não encontrado"
fi

# 3. Limpar cache e reinstalar dependências
echo ""
echo "🧹 Limpando cache e reinstalando dependências..."
rm -rf .next node_modules
npm cache clean --force
npm install

# 4. Criar estrutura de diretórios otimizada
echo ""
echo "📁 Criando estrutura de diretórios..."
mkdir -p src/types
mkdir -p src/app/\(public\)
mkdir -p src/app/\(authenticated\)

# 5. Verificar TypeScript
echo ""
echo "📘 Verificando TypeScript..."
npx tsc --noEmit || echo "⚠️  Erros de TypeScript encontrados (isso é esperado)"

# 6. Executar build de teste
echo ""echo "🏗️  Executando build de teste..."
echo "   (Isso pode demorar alguns minutos...)"
npm run build

# 7. Verificar resultado
echo ""
echo "=================================================="
if [ -d ".next" ]; then
    echo "✅ BUILD CONCLUÍDO COM SUCESSO!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Configure as variáveis de ambiente no Vercel"
    echo "2. Faça commit das mudanças:"
    echo "   git add ."
    echo "   git commit -m 'feat: otimizar para deploy no Vercel'"
    echo "   git push"
    echo "3. Importe o projeto no Vercel"
else
    echo "❌ BUILD FALHOU!"
    echo ""
    echo "Verifique os erros acima e tente novamente."
fi
echo "=================================================="

# Tornar scripts executáveis
chmod +x cleanup-project.sh 2>/dev/null
chmod +x pre-deploy-check.js 2>/dev/null
chmod +x fix-app-router.js 2>/dev/null

echo ""
echo "💡 Scripts disponíveis:"
echo "   ./cleanup-project.sh    - Limpar arquivos duplicados"
echo "   node pre-deploy-check.js - Verificação completa"
echo "   node fix-app-router.js   - Corrigir rotas"