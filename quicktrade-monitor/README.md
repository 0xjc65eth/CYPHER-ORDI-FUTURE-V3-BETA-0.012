# 🚀 QuickTrade Monitor

Sistema de intermediação inteligente para DEXs com coleta automática de taxas de serviço.

## 💰 Revenue Model

- **Taxa de Serviço**: 0.05% sobre o valor de cada transação
- **Coleta Automática**: Taxas vão direto para suas carteiras configuradas
- **Multi-Chain**: Suporte a 8 redes blockchain principais

## 🌐 Redes Suportadas

| Rede | Exchanges | Status |
|------|-----------|---------|
| Ethereum | Uniswap, SushiSwap, 1inch | ✅ Ativo |
| Arbitrum | Uniswap, SushiSwap, Camelot, GMX | ✅ Ativo |
| Optimism | Uniswap, Velodrome, Beethoven X | ✅ Ativo |
| Polygon | Uniswap, QuickSwap, SushiSwap | ✅ Ativo |
| Base | Uniswap, Aerodrome, BaseSwap | ✅ Ativo |
| Avalanche | Uniswap, TraderJoe, Pangolin | ✅ Ativo |
| BSC | Uniswap, PancakeSwap, Biswap | ✅ Ativo |
| Solana | Jupiter, Orca, Raydium | ✅ Ativo |

## 🔧 Instalação

```bash
cd quicktrade-monitor
npm install
npm run dev
```

## 📊 APIs Disponíveis

### Análise de Melhor Execução
```
POST /api/quicktrade/analyze
{
  "fromToken": "ETH",
  "toToken": "USDC", 
  "amount": 1000,
  "network": "ethereum"
}
```

### Processamento de Trade
```
POST /api/quicktrade/process
{
  "userAddress": "0x...",
  "selectedExchange": "UNISWAP",
  "network": "ethereum",
  "amount": 1000,
  "acceptedFee": 0.5
}
```

### Monitoramento de Transações
```
POST /api/quicktrade/monitor
{
  "feeRecordId": "qt_123...",
  "transactionHash": "0x...",
  "network": "ethereum"
}
```

## 💼 Carteiras de Revenue

**EVM Networks (Todas)**: `0x476F803fEA41CC6DfbCb3F4Ba6bAF462c1AD32AB`
**Solana**: `EPbE1ZmLXkEJDitNb9KNu9Hq8mThS3P7LpBxdF3EkUwT`

## 📈 Projeções de Revenue

| Cenário | Volume Diário | Revenue Mensal | Revenue Anual |
|---------|---------------|----------------|---------------|
| Conservador | $100K | $1,500 | $18,250 |
| Moderado | $1M | $15,000 | $182,500 |
| Otimista | $10M | $150,000 | $1,825,000 |

## 🛠️ Componentes Principais

- **QuickTradePanel**: Interface principal do usuário
- **FeeExplanationModal**: Modal explicativo das taxas
- **RevenueDashboard**: Dashboard administrativo
- **TaxCollectionFlow**: Visualização do fluxo de coleta

## 🔒 Segurança

- Carteiras configuradas via variáveis de ambiente
- Validação de endereços e amounts
- Monitoramento de transações em tempo real
- Logs de auditoria completos

## 🚀 Deploy em Produção

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env.local

# 2. Adicione suas chaves privadas
PRIVATE_KEY_EVM=sua_chave_evm
PRIVATE_KEY_SOLANA=sua_chave_solana

# 3. Deploy
npm run build
npm run start
```

## 📞 Suporte

Para suporte e questões técnicas, abra uma issue no repositório principal.