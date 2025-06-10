/**
 * Exemplo de uso do BitcoinWalletConnect
 * 
 * Este arquivo demonstra como utilizar o serviço BitcoinWalletConnect
 * para conectar com carteiras Bitcoin e acessar dados em tempo real.
 * 
 * @author CypherAI v3.0
 * @version 3.0.0
 */

import BitcoinWalletConnect from './BitcoinWalletConnect.js';

// Exemplo básico de uso
async function exemploBasico() {
  console.log('🚀 Iniciando exemplo básico do BitcoinWalletConnect');

  // Criar instância do serviço
  const walletService = new BitcoinWalletConnect({
    network: 'mainnet',
    enableLogging: true,
    autoDetect: true
  });

  try {
    // 1. Detectar carteiras disponíveis
    console.log('🔍 Detectando carteiras disponíveis...');
    const wallets = walletService.detectWallets();
    console.log('Carteiras detectadas:', wallets);

    // 2. Conectar com UniSat (se disponível)
    if (wallets.unisat?.available) {
      console.log('🔗 Conectando com UniSat...');
      const connection = await walletService.connect('unisat');
      console.log('Conectado:', connection);

      // 3. Obter saldo
      console.log('💰 Obtendo saldo...');
      const balance = await walletService.getBalance();
      console.log('Saldo:', balance);

      // 4. Obter Ordinals
      console.log('🖼️ Obtendo Ordinals...');
      const ordinals = await walletService.getOrdinals();
      console.log('Ordinals:', ordinals);

      // 5. Obter Runes
      console.log('🎯 Obtendo Runes...');
      const runes = await walletService.getRunes();
      console.log('Runes:', runes);

      // 6. Desconectar
      console.log('👋 Desconectando...');
      await walletService.disconnect();
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// Exemplo com eventos
async function exemploComEventos() {
  console.log('🚀 Iniciando exemplo com eventos');

  const walletService = new BitcoinWalletConnect({
    network: 'mainnet',
    enableLogging: true
  });

  // Configurar event listeners
  walletService.on('connected', (data) => {
    console.log('✅ Carteira conectada:', data);
  });

  walletService.on('disconnected', () => {
    console.log('👋 Carteira desconectada');
  });

  walletService.on('balanceUpdated', (balance) => {
    console.log('💰 Saldo atualizado:', balance);
  });

  walletService.on('ordinalsUpdated', (ordinals) => {
    console.log('🖼️ Ordinals atualizados:', ordinals.total, 'itens');
  });

  walletService.on('runesUpdated', (runes) => {
    console.log('🎯 Runes atualizados:', runes.total, 'holdings');
  });

  walletService.on('connectionError', (error) => {
    console.error('❌ Erro de conexão:', error.message);
  });

  // Tentar conectar com Xverse
  try {
    await walletService.connect('xverse');
    
    // Aguardar um tempo e fazer refresh dos dados
    setTimeout(async () => {
      console.log('🔄 Fazendo refresh dos dados...');
      await walletService.refreshData();
    }, 5000);

  } catch (error) {
    console.error('❌ Falha na conexão:', error.message);
  }
}

// Exemplo de validação de endereços
function exemploValidacao() {
  console.log('🚀 Iniciando exemplo de validação');

  const walletService = new BitcoinWalletConnect({
    network: 'mainnet'
  });

  // Testar endereços válidos e inválidos
  const enderecos = [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Genesis block address (válido)
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', // Segwit (válido)
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy', // P2SH (válido)
    'endereço_inválido', // Inválido
    'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx' // Testnet (inválido para mainnet)
  ];

  console.log('🔍 Validando endereços Bitcoin:');
  enderecos.forEach(endereco => {
    const isValid = walletService.validateBitcoinAddress(endereco);
    console.log(`${isValid ? '✅' : '❌'} ${endereco}: ${isValid ? 'Válido' : 'Inválido'}`);
  });
}

// Exemplo com diferentes carteiras
async function exemploMultiplasCarteiras() {
  console.log('🚀 Iniciando exemplo com múltiplas carteiras');

  const walletService = new BitcoinWalletConnect({
    network: 'mainnet',
    enableLogging: true
  });

  const carteiras = ['unisat', 'xverse', 'oyl', 'magiceden'];

  for (const carteira of carteiras) {
    try {
      console.log(`🔗 Tentando conectar com ${carteira}...`);
      
      const wallets = walletService.detectWallets();
      if (wallets[carteira]?.available) {
        const connection = await walletService.connect(carteira);
        console.log(`✅ Conectado com ${carteira}:`, connection.address);
        
        // Obter dados básicos
        const balance = await walletService.getBalance();
        console.log(`💰 Saldo em ${carteira}:`, balance.total);
        
        // Desconectar antes de tentar a próxima
        await walletService.disconnect();
        console.log(`👋 Desconectado de ${carteira}`);
        
      } else {
        console.log(`⚠️ ${carteira} não está disponível`);
      }
      
    } catch (error) {
      console.error(`❌ Erro com ${carteira}:`, error.message);
    }
  }
}

// Exemplo de tratamento de erros avançado
async function exemploTratamentoErros() {
  console.log('🚀 Iniciando exemplo de tratamento de erros');

  const walletService = new BitcoinWalletConnect({
    network: 'mainnet',
    retryAttempts: 2,
    retryDelay: 500,
    apiTimeout: 5000
  });

  // Configurar listener para erros
  walletService.on('connectionError', (error) => {
    console.error('🚨 Erro capturado pelo event listener:', error.message);
  });

  try {
    // Tentar conectar com carteira inexistente
    await walletService.connect('carteira_inexistente');
    
  } catch (error) {
    console.error('❌ Erro esperado capturado:', error.message);
  }

  try {
    // Tentar obter balance sem estar conectado
    await walletService.getBalance();
    
  } catch (error) {
    console.error('❌ Erro de estado capturado:', error.message);
  }

  try {
    // Testar validação com endereço inválido
    const isValid = walletService.validateBitcoinAddress('endereço_inválido');
    console.log('🔍 Resultado da validação:', isValid);
    
  } catch (error) {
    console.error('❌ Erro na validação:', error.message);
  }
}

// Exemplo de uso em React Component (pseudocódigo)
function exemploReactComponent() {
  /*
  import React, { useState, useEffect } from 'react';
  import BitcoinWalletConnect from './BitcoinWalletConnect.js';

  function WalletConnector() {
    const [walletService] = useState(() => new BitcoinWalletConnect({
      network: 'mainnet',
      enableLogging: true
    }));
    
    const [isConnected, setIsConnected] = useState(false);
    const [balance, setBalance] = useState(null);
    const [address, setAddress] = useState(null);

    useEffect(() => {
      // Setup event listeners
      walletService.on('connected', (data) => {
        setIsConnected(true);
        setAddress(data.address);
      });

      walletService.on('disconnected', () => {
        setIsConnected(false);
        setAddress(null);
        setBalance(null);
      });

      walletService.on('balanceUpdated', (balanceData) => {
        setBalance(balanceData);
      });

      // Cleanup
      return () => {
        walletService.destroy();
      };
    }, [walletService]);

    const handleConnect = async (walletType) => {
      try {
        await walletService.connect(walletType);
      } catch (error) {
        alert('Erro ao conectar: ' + error.message);
      }
    };

    const handleDisconnect = async () => {
      await walletService.disconnect();
    };

    return (
      <div>
        {!isConnected ? (
          <div>
            <button onClick={() => handleConnect('unisat')}>Conectar UniSat</button>
            <button onClick={() => handleConnect('xverse')}>Conectar Xverse</button>
          </div>
        ) : (
          <div>
            <p>Endereço: {address}</p>
            <p>Saldo: {balance?.total || 0} sats</p>
            <button onClick={handleDisconnect}>Desconectar</button>
          </div>
        )}
      </div>
    );
  }
  */
  
  console.log('📝 Exemplo de React Component disponível nos comentários acima');
}

// Exportar exemplos para uso
export {
  exemploBasico,
  exemploComEventos,
  exemploValidacao,
  exemploMultiplasCarteiras,
  exemploTratamentoErros,
  exemploReactComponent
};

// Executar exemplos se este arquivo for executado diretamente
if (typeof window !== 'undefined') {
  console.log('🎯 BitcoinWalletConnect - Exemplos de Uso');
  console.log('Execute as funções individualmente para testar diferentes cenários:');
  console.log('- exemploBasico()');
  console.log('- exemploComEventos()');
  console.log('- exemploValidacao()');
  console.log('- exemploMultiplasCarteiras()');
  console.log('- exemploTratamentoErros()');
  console.log('- exemploReactComponent()');
}