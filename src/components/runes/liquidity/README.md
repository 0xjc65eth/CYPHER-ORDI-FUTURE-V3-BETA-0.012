# Sistema de Pools de Liquidez - RunesDX Integration

Este sistema fornece uma interface completa para gerenciar pools de liquidez integrada ao RunesDX, oferecendo funcionalidades avançadas para yield farming e análise de posições.

## Componentes Principais

### 1. LiquidityDashboard
Componente principal que integra todos os outros componentes em uma interface tabular.

```jsx
import { LiquidityDashboard } from '@/components/runes/liquidity';

<LiquidityDashboard userAddress="bc1qxxxxxx..." />
```

### 2. LiquidityPoolsPanel
Exibe todos os pools de liquidez disponíveis com funcionalidades de busca, filtros e ordenação.

**Funcionalidades:**
- Busca por nome do token ou símbolo
- Filtros por APY alto, TVL alto, novos pools
- Ordenação por TVL, APY, volume, nome
- Botões de redirecionamento para RunesDX

### 3. PoolStatsCard
Card individual que mostra estatísticas detalhadas de cada pool.

**Métricas exibidas:**
- TVL (Total Value Locked)
- APY (Annual Percentage Yield)
- Volume 24h
- Reservas dos tokens
- Cálculo estimado de Impermanent Loss

### 4. UserLiquidityPositions
Mostra as posições de liquidez ativas do usuário.

**Funcionalidades:**
- Resumo geral com valor total, taxas ganhas e IL médio
- Detalhes de cada posição
- Cálculo de Impermanent Loss por posição
- Histórico de ganhos com taxas
- Alertas de oportunidades de arbitragem

### 5. PoolPairSelector
Seletor avançado de pares de trading com categorização.

**Categorias:**
- Em Alta (alto volume)
- Novos (criados recentemente)
- Estáveis (incluem stablecoins)
- Alto APY (>50%)

### 6. LiquidityAlerts
Sistema de alertas para oportunidades e avisos.

**Tipos de alerta:**
- APY alto detectado
- Impermanent Loss alto
- Volume baixo para TVL alto
- Oportunidades de arbitragem

### 7. ImpermanentLossCalculator
Calculadora interativa para análise de Impermanent Loss.

**Funcionalidades:**
- Cálculo em tempo real
- Cenários de mudança de preço
- Análise de taxas vs IL
- Recomendações automáticas
- Gráficos interativos

## Hooks Customizados

### useLiquidityPools()
```jsx
const { pools, loading, error, refetch } = useLiquidityPools();
```

Gerencia dados dos pools de liquidez da API RunesDX.

### useUserLiquidity(userAddress)
```jsx
const { positions, totalValue, loading, error } = useUserLiquidity(userAddress);
```

Carrega posições de liquidez específicas do usuário.

### useArbitrageOpportunities()
```jsx
const { opportunities, loading, error } = useArbitrageOpportunities();
```

Detecta oportunidades de arbitragem entre pools.

### useImpermanentLoss(initialPrice, currentPrice, token0Amount, token1Amount)
```jsx
const { 
  impermanentLoss, 
  hodlValue, 
  liquidityValue, 
  scenarios 
} = useImpermanentLoss(50000, 55000, 1, 50000);
```

Calcula Impermanent Loss em diferentes cenários.

### useFeesVsImpermanentLoss(feesEarned, impermanentLoss, timeInPool, initialValue)
```jsx
const { 
  netGain, 
  recommendation, 
  projectedAnnualReturn 
} = useFeesVsImpermanentLoss(500, -2.5, 30, 100000);
```

Analisa ganhos líquidos considerando taxas e IL.

### useLiquidityAlerts(pools, userPositions)
```jsx
const { alerts, dismissAlert, hasHighPriorityAlerts } = useLiquidityAlerts(pools, positions);
```

Gera alertas inteligentes baseados em condições de mercado.

## Integração com RunesDX

### Endpoints da API
- **Base URL:** `https://api.runesdx.com/v1/`
- **Pools:** `/pairs`
- **User Liquidity:** `/users/{address}/liquidity`
- **Arbitrage:** `/arbitrage`

### Redirecionamentos
Todos os botões de ação redirecionam para RunesDX.com:
- Adicionar Liquidez: `https://runesdx.com/pools/{poolId}/add`
- Remover Liquidez: `https://runesdx.com/pools/{poolId}/remove`
- Ver Pool: `https://runesdx.com/pools/{poolId}`

## Funcionalidades Avançadas

### Cálculo de Impermanent Loss
Utiliza a fórmula matemática precisa:
```
IL = (2 * sqrt(ratio) / (1 + ratio)) - 1
```
Onde `ratio = currentPrice / initialPrice`

### Detecção de Arbitragem
Compara preços entre diferentes pools para identificar oportunidades de arbitragem lucrativas.

### Sistema de Alertas
- **Alta Prioridade:** APY >100%, IL >10%
- **Média Prioridade:** APY >50%, IL >5%
- **Baixa Prioridade:** Volume baixo, novos pools

### Análise de Yield Farming
- Cálculo de ganhos líquidos (taxas - IL)
- Projeção de retorno anual
- Recomendações automáticas de hold/exit

## Design Responsivo

O sistema é totalmente responsivo com:
- **Mobile-first:** Otimizado para dispositivos móveis
- **Grid flexível:** Adapta-se a diferentes tamanhos de tela
- **Dark mode:** Suporte completo ao tema escuro
- **Acessibilidade:** Seguindo padrões WCAG

## Exemplo de Uso Completo

```jsx
import React, { useState, useEffect } from 'react';
import { 
  LiquidityDashboard,
  LiquidityAlerts,
  ImpermanentLossCalculator
} from '@/components/runes/liquidity';

const LiquidityPage = () => {
  const [userAddress, setUserAddress] = useState(null);

  // Conectar carteira
  useEffect(() => {
    const connectWallet = async () => {
      // Lógica de conexão com carteira Bitcoin
      setUserAddress('bc1qxxxxxx...');
    };
    connectWallet();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Dashboard Principal */}
      <LiquidityDashboard userAddress={userAddress} />
      
      {/* Calculadora */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ImpermanentLossCalculator />
      </div>
    </div>
  );
};

export default LiquidityPage;
```

## Configuração e Instalação

1. **Dependências necessárias:**
```bash
npm install react-icons chart.js react-chartjs-2
```

2. **Estrutura de arquivos:**
```
src/
├── components/
│   └── runes/
│       └── liquidity/
│           ├── LiquidityDashboard.jsx
│           ├── LiquidityPoolsPanel.jsx
│           ├── PoolStatsCard.jsx
│           ├── UserLiquidityPositions.jsx
│           ├── PoolPairSelector.jsx
│           ├── LiquidityAlerts.jsx
│           ├── ImpermanentLossCalculator.jsx
│           └── index.js
└── hooks/
    └── liquidity/
        ├── useLiquidityPools.js
        ├── useUserLiquidity.js
        └── useImpermanentLoss.js
```

3. **Variáveis de ambiente:**
```env
NEXT_PUBLIC_RUNESDX_API_URL=https://api.runesdx.com/v1
```

## Contribuição

Para contribuir com melhorias:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente suas mudanças
4. Adicione testes se necessário
5. Envie um Pull Request

## Licença

Este sistema é parte do projeto CYPHER ORDI-FUTURE-V3 e segue a licença do projeto principal.