/**
 * Arquivo de teste para verificar se o sistema de liquidez funciona corretamente
 * Este arquivo pode ser usado para testes unitários futuros
 */

// Simulação de dados de teste
export const mockPoolsData = [
  {
    id: 'pool-1',
    name: 'BTC/USDT',
    token0: { symbol: 'BTC' },
    token1: { symbol: 'USDT' },
    tvl: 5000000,
    volume24h: 500000,
    apy: 45.5,
    fee: 0.3,
    liquidity: 2500000,
    reserve0: 100,
    reserve1: 5000000,
    price: 50000,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pool-2',
    name: 'ETH/BTC',
    token0: { symbol: 'ETH' },
    token1: { symbol: 'BTC' },
    tvl: 3000000,
    volume24h: 300000,
    apy: 65.2,
    fee: 0.3,
    liquidity: 1500000,
    reserve0: 1000,
    reserve1: 60,
    price: 0.06,
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const mockUserPositions = [
  {
    id: 'position-1',
    poolId: 'pool-1',
    poolName: 'BTC/USDT',
    token0: { symbol: 'BTC' },
    token1: { symbol: 'USDT' },
    liquidity: 100,
    share: 0.004,
    value: 20000,
    token0Amount: 0.4,
    token1Amount: 20000,
    impermanentLoss: -2.5,
    feesEarned: 150,
    createdAt: '2024-03-01T00:00:00Z'
  }
];

export const mockArbitrageOpportunities = [
  {
    pair: 'BTC/USDT',
    priceDiff: 2.5,
    profit: 1250,
    exchanges: ['RunesDX', 'OtherDEX']
  }
];

// Funções de utilidade para testes
export const calculateAPY = (volume24h, tvl) => {
  if (!tvl || tvl === 0) return 0;
  const dailyFees = volume24h * 0.003; // 0.3% fee
  const yearlyFees = dailyFees * 365;
  return (yearlyFees / tvl) * 100;
};

export const calculateImpermanentLoss = (initialPrice, currentPrice) => {
  if (!initialPrice || !currentPrice || initialPrice === 0) return 0;
  
  const ratio = currentPrice / initialPrice;
  const il = (2 * Math.sqrt(ratio) / (1 + ratio)) - 1;
  return il * 100;
};

export const formatCurrency = (value) => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

export const formatPercentage = (value) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

// Testes básicos
export const runBasicTests = () => {
  console.log('🧪 Executando testes básicos do sistema de liquidez...\n');

  // Teste 1: Cálculo de APY
  console.log('✅ Teste 1: Cálculo de APY');
  const apy1 = calculateAPY(500000, 5000000);
  console.log(`   APY para pool BTC/USDT: ${apy1.toFixed(2)}%`);
  console.log(`   Esperado: ~10.95%, Resultado: ${apy1 >= 10 && apy1 <= 12 ? 'PASSOU' : 'FALHOU'}\n`);

  // Teste 2: Cálculo de Impermanent Loss
  console.log('✅ Teste 2: Cálculo de Impermanent Loss');
  const il1 = calculateImpermanentLoss(50000, 55000); // 10% de aumento
  console.log(`   IL para aumento de 10%: ${il1.toFixed(2)}%`);
  console.log(`   Esperado: ~-0.25%, Resultado: ${il1 >= -0.5 && il1 <= 0 ? 'PASSOU' : 'FALHOU'}\n`);

  // Teste 3: Formatação de valores
  console.log('✅ Teste 3: Formatação de valores');
  const formatted1 = formatCurrency(5000000);
  const formatted2 = formatPercentage(-2.5);
  console.log(`   5M formatado: ${formatted1}`);
  console.log(`   -2.5% formatado: ${formatted2}`);
  console.log(`   Resultado: ${formatted1 === '$5.00M' && formatted2 === '-2.50%' ? 'PASSOU' : 'FALHOU'}\n`);

  // Teste 4: Validação de dados mock
  console.log('✅ Teste 4: Validação de dados mock');
  const hasValidPools = mockPoolsData.length > 0 && mockPoolsData[0].id;
  const hasValidPositions = mockUserPositions.length > 0 && mockUserPositions[0].poolId;
  console.log(`   Pools válidos: ${hasValidPools ? 'SIM' : 'NÃO'}`);
  console.log(`   Posições válidas: ${hasValidPositions ? 'SIM' : 'NÃO'}`);
  console.log(`   Resultado: ${hasValidPools && hasValidPositions ? 'PASSOU' : 'FALHOU'}\n`);

  console.log('🎉 Testes básicos concluídos!');
  console.log('💡 Para testes mais avançados, considere usar Jest ou Vitest');
};

// Executar testes se este arquivo for importado diretamente
if (typeof window !== 'undefined') {
  // No browser
  console.log('Sistema de Liquidez - Pronto para uso!');
} else {
  // No Node.js
  runBasicTests();
}