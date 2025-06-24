# 🚀 CYPHER ORDi Future V3 - Instruções do Servidor

## ✅ Status Atual
- **Commit**: 4038c8cf9066f118b41bb4f80612c68e8526a41b
- **Dependências**: ✅ Instaladas (2,722 pacotes)
- **Servidor**: ✅ Funcionando
- **TypeScript**: ✅ Configurado
- **Next.js**: v15.3.3

## 🌟 Como Iniciar o Servidor

### Opção 1: Script Automatizado (Recomendado)
```bash
cd "/Users/juliocesar/Desktop/CYPHER ORDI-FUTURE-V3"
./start-server.sh
```

### Opção 2: Comando NPM
```bash
cd "/Users/juliocesar/Desktop/CYPHER ORDI-FUTURE-V3"
npm run dev
```

### Opção 3: Porta Alternativa
```bash
npm run dev:3000  # Porta 3000
npm run dev:3001  # Porta 3001
```

## 🌐 Acessar a Aplicação
- **Principal**: http://localhost:4444
- **Alternativa**: http://localhost:3000
- **Network**: http://192.168.0.88:4444

## 🛠️ Solução de Problemas

### Se o servidor não iniciar:
1. Verificar se as dependências estão instaladas:
   ```bash
   npm install
   ```

2. Limpar cache do Next.js:
   ```bash
   rm -rf .next
   npm run dev
   ```

3. Verificar se a porta está em uso:
   ```bash
   lsof -ti:4444
   ```

### Se houver erros de TypeScript:
- O projeto está configurado para ignorar erros de build
- Para verificar erros: `npm run type-check`

## 📋 Comandos Úteis
```bash
npm run dev          # Servidor desenvolvimento (porta 4444)
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run lint         # Verificar código
npm run type-check   # Verificar TypeScript
```

## 🔧 Recursos Ativos
- ✅ Bloomberg Terminal Dashboard
- ✅ APIs de preços (CoinMarketCap, Blockchain.info)
- ✅ Sistema de segurança
- ✅ Cache e rate limiting
- ✅ Integração com wallets Bitcoin
- ✅ Monitoramento em tempo real

## ⚠️ Notas Importantes
- O servidor compila automaticamente ao detectar mudanças
- Alguns avisos de TypeScript são normais (não impedem funcionamento)
- APIs externas podem ter limitações de rate limit
- Para parar o servidor: `Ctrl + C`

---
**Última atualização**: 22 de junho de 2025
**Status**: ✅ OPERACIONAL