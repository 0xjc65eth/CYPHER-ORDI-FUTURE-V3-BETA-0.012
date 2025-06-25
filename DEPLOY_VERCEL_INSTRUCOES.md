# 🚀 DEPLOY VERCEL - INSTRUÇÕES RÁPIDAS

## ⚡ Comando Rápido

Execute este comando único para otimizar o projeto:

```bash
./optimize-for-vercel.sh
```

## 📋 Checklist Manual (se preferir)

### 1. Aplicar Configurações Otimizadas

```bash
# Fazer backup
cp next.config.js next.config.backup.js
cp vercel.json vercel.backup.json

# Aplicar novas configurações
cp next.config.optimized.js next.config.js
cp vercel.optimized.json vercel.json
```

### 2. Limpar e Reinstalar

```bash
rm -rf .next node_modules
npm install
```

### 3. Verificar Build

```bash
npm run build
```

### 4. Executar Verificação Completa

```bash
node pre-deploy-check.js
```
## 🔧 Correções Aplicadas

### ✅ next.config.js
- Removido `ignoreBuildErrors: true`
- Removido `ignoreDuringBuilds: true`
- Otimização de imagens habilitada
- Headers de segurança adicionados
- Webpack otimizado para performance

### ✅ vercel.json
- Memória otimizada (4GB no build)
- Timeouts configurados por rota
- Cache headers apropriados
- Segurança melhorada

### ✅ package.json
- Dependências reorganizadas
- Scripts simplificados
- Versões atualizadas

## ⚠️ Atenção

### Variáveis de Ambiente
Certifique-se de configurar TODAS as variáveis no Vercel:

```
CMC_API_KEY
HYPERLIQUID_API_KEY
ELEVENLABS_API_KEY
ORDISCAN_API_KEY
HIRO_API_KEY
QUICKNODE_API_KEY
QUICKNODE_URL
# ... e outras conforme .env.example
```
### Estrutura de Pastas
O projeto tem muitos arquivos duplicados. Execute:

```bash
./cleanup-project.sh  # Para limpar duplicados
node fix-app-router.js  # Para corrigir rotas
```

## 🚀 Deploy no Vercel

1. **Commit das mudanças:**
   ```bash
   git add .
   git commit -m "feat: otimizar para deploy no Vercel"
   git push
   ```

2. **No Vercel Dashboard:**
   - Importe o projeto do GitHub
   - Configure as variáveis de ambiente
   - Deploy!

## 📊 Monitoramento

Após o deploy, verifique:
- Function logs no Vercel
- Performance metrics
- Error tracking

## 🆘 Problemas Comuns

- **Build falha:** Verifique erros de TypeScript
- **404 em rotas:** Verifique estrutura de /app
- **APIs timeout:** Ajuste maxDuration no vercel.json

---
**Última atualização:** $(date)
**Suporte:** cypher-support@example.com