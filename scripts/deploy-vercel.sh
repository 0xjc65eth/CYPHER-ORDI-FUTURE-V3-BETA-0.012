#!/bin/bash

echo "🚀 Iniciando deploy para Vercel..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Limpar cache e reinstalar dependências
echo "📦 Limpando cache e reinstalando dependências..."
rm -rf node_modules package-lock.json
npm install

# Executar audit fix
echo "🔒 Corrigindo vulnerabilidades..."
npm audit fix

# Build local para teste
echo "🏗️ Executando build de teste..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou. Corrija os erros antes de fazer deploy."
    exit 1
fi

echo "✅ Build concluído com sucesso!"

# Deploy para Vercel
echo "🌐 Fazendo deploy para Vercel..."
vercel --prod

echo "✅ Deploy concluído!"