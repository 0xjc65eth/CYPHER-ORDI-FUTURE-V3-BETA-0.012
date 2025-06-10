// 🚀 CYPHER ORDI SERVICE - Backend para Trading Engine
const express = require('express');
const cors = require('cors');
const { bridge } = require('../lib/sync/ordi-ai-bridge');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🚀 CYPHER ORDI Service iniciando...');

// Estado do ORDI
let ordiState = {
  trading: false,
  arbitrageScanning: false,
  activeOrders: [],
  balance: {
    BTC: 1.5,
    USDT: 50000
  },
  performance: {
    dailyPnL: 0,
    winRate: 0,
    totalTrades: 0
  }
};

// API Endpoints
app.post('/api/ordi/command', async (req, res) => {
  const { command, params } = req.body;
  console.log('📨 ORDI Command:', command);

  switch(command) {
    case 'START_TRADING':
      ordiState.trading = true;
      bridge.ordiToAI('REQUEST_ANALYSIS', { 
        market: 'BTC/USDT',
        action: 'start_trading' 
      });
      res.json({ status: 'Trading iniciado', state: ordiState });
      break;

    case 'STOP_TRADING':
      ordiState.trading = false;
      res.json({ status: 'Trading parado', state: ordiState });
      break;

    case 'SCAN_ARBITRAGE':
      ordiState.arbitrageScanning = true;
      scanArbitrageOpportunities();
      res.json({ status: 'Scan iniciado', state: ordiState });
      break;

    case 'GET_STATE':
      res.json({ state: ordiState });
      break;

    default:
      res.status(400).json({ error: 'Comando desconhecido' });
  }
});

// Função de arbitragem
async function scanArbitrageOpportunities() {
  console.log('🔍 Escaneando oportunidades de arbitragem...');
  
  // Simular detecção
  setTimeout(() => {
    const opportunity = {
      pair: 'BTC/USDT',
      exchange1: 'Binance',
      exchange2: 'OKX',
      priceDiff: 0.15,
      profit: 150
    };
    
    bridge.ordiToAI('ARBITRAGE_FOUND', opportunity);
    console.log('💰 Oportunidade encontrada:', opportunity);
  }, 2000);
}

// Sincronizar estado periodicamente
setInterval(() => {
  bridge.syncState('ordi', ordiState);
}, 5000);

// Escutar respostas da AI
bridge.on('ai:events', (data) => {
  if (data.type === 'AI_RESPONSE') {
    console.log('🤖 Resposta da AI recebida:', data);
    
    if (data.response === 'EXECUTE_TRADE') {
      // Executar trade baseado na recomendação da AI
      executeTrade(data.data);
    }
  }
});

function executeTrade(tradeData) {
  console.log('💹 Executando trade:', tradeData);
  ordiState.activeOrders.push({
    id: Date.now(),
    ...tradeData,
    status: 'pending'
  });
}

const PORT = process.env.ORDI_PORT || 4001;
app.listen(PORT, () => {
  console.log(`✅ CYPHER ORDI Service rodando na porta ${PORT}`);
});
