#!/bin/bash

echo "🚀 TESTE FINAL DO SERVIDOR"
echo "=========================="

# Parar processos existentes
pkill -f "next dev" 2>/dev/null
sleep 2

# Iniciar servidor em background
echo "Iniciando servidor..."
npm run dev > server.log 2>&1 &
SERVER_PID=$!

echo "PID do servidor: $SERVER_PID"
echo "Aguardando 15 segundos para inicialização completa..."

# Aguardar mais tempo
sleep 15

# Teste de conectividade
echo ""
echo "🌐 TESTANDO CONECTIVIDADE:"
if curl -s http://localhost:4444 | grep -q "CYPHER ORDi Future V3"; then
    echo "✅ SUCESSO! Servidor respondendo corretamente"
    echo "🌐 Acesse: http://localhost:4444"
else
    echo "⚠️ Servidor iniciado mas ainda processando..."
    echo "📋 Últimas linhas do log:"
    tail -5 server.log
fi

echo ""
echo "📊 STATUS DO PROCESSO:"
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Servidor rodando (PID: $SERVER_PID)"
else
    echo "❌ Processo parou inesperadamente"
fi

echo ""
echo "🔧 PARA PARAR O SERVIDOR:"
echo "kill $SERVER_PID"
echo ""
echo "📋 PARA VER LOGS COMPLETOS:"
echo "tail -f server.log"