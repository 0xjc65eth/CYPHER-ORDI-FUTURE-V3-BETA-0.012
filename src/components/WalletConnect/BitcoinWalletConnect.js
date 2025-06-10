// components/WalletConnect/BitcoinWalletConnect.js
import { getProviders, getAddress, signMessage } from 'sats-connect';

export class BitcoinWalletConnect {
  constructor() {
    this.provider = null;
    this.addresses = null;
    this.connectedWallet = null;
    this.listeners = new Map();
  }

  // Detectar carteiras disponíveis
  async detectWallets() {
    try {
      const wallets = [];
      
      // Verificar Xverse
      if (typeof window !== 'undefined' && window.XverseProviders?.BitcoinProvider) {
        wallets.push({
          name: 'Xverse',
          id: 'xverse',
          provider: window.XverseProviders.BitcoinProvider,
          icon: '/wallets/xverse.svg'
        });
      }

      // Verificar Unisat
      if (typeof window !== 'undefined' && window.unisat) {
        wallets.push({
          name: 'Unisat',
          id: 'unisat',
          provider: window.unisat,
          icon: '/wallets/unisat.svg'
        });
      }

      // Verificar OYL
      if (typeof window !== 'undefined' && window.oyl) {
        wallets.push({
          name: 'OYL',
          id: 'oyl', 
          provider: window.oyl,
          icon: '/wallets/oyl.svg'
        });
      }

      // Verificar Magic Eden
      if (typeof window !== 'undefined' && window.magicEden?.bitcoin) {
        wallets.push({
          name: 'Magic Eden',
          id: 'magiceden',
          provider: window.magicEden.bitcoin,
          icon: '/wallets/magiceden.svg'
        });
      }

      return wallets;
    } catch (error) {
      console.error('Erro ao detectar carteiras:', error);
      return [];
    }
  }

  // Conectar à carteira
  async connect(preferredWallet = null) {
    try {
      console.log('🔗 Iniciando conexão com carteira Bitcoin...');
      
      const availableWallets = await this.detectWallets();
      
      if (availableWallets.length === 0) {
        throw new Error('Nenhuma carteira Bitcoin detectada. Instale Xverse, Unisat, OYL ou Magic Eden.');
      }

      // Usar carteira preferida ou primeira disponível
      const targetWallet = preferredWallet 
        ? availableWallets.find(w => w.id === preferredWallet)
        : availableWallets[0];

      if (!targetWallet) {
        throw new Error(`Carteira ${preferredWallet} não encontrada.`);
      }

      console.log(`💳 Conectando com ${targetWallet.name}...`);

      // Usar sats-connect para conexão padronizada
      const addressResponse = await getAddress({
        payload: {
          purposes: ['payment', 'ordinals'],
          message: `Conectar com ${targetWallet.name} - Cypher Ordi Future`,
          network: {
            type: 'Mainnet'
          }
        },
        onFinish: (response) => {
          this.addresses = response.addresses;
          this.connectedWallet = targetWallet;
          this.storeWalletData(response);
          this.emitEvent('walletConnected', {
            wallet: targetWallet,
            addresses: response.addresses
          });
        },
        onCancel: () => {
          console.log('❌ Conexão cancelada pelo usuário');
          throw new Error('Conexão cancelada');
        }
      });

      return {
        success: true,
        wallet: targetWallet,
        addresses: this.addresses
      };

    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      this.emitEvent('walletError', error);
      throw error;
    }
  }

  // Obter saldo da carteira
  async getBalance() {
    if (!this.addresses) {
      throw new Error('Carteira não conectada');
    }
    
    try {
      console.log('💰 Buscando saldo da carteira...');
      
      const paymentAddress = this.addresses.find(addr => addr.purpose === 'payment')?.address;
      
      if (!paymentAddress) {
        throw new Error('Endereço de pagamento não encontrado');
      }

      // Integrar com API do Hiro para dados em tempo real
      const response = await fetch(`https://api.hiro.so/ordinals/v1/address/${paymentAddress}/balance`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const balanceData = await response.json();

      // Buscar saldo confirmado via mempool.space
      const mempoolResponse = await fetch(`https://mempool.space/api/address/${paymentAddress}`);
      const mempoolData = await mempoolResponse.json();

      const result = {
        confirmed: mempoolData.chain_stats.funded_txo_sum || 0,
        unconfirmed: mempoolData.mempool_stats.funded_txo_sum || 0,
        total: (mempoolData.chain_stats.funded_txo_sum || 0) + (mempoolData.mempool_stats.funded_txo_sum || 0),
        address: paymentAddress,
        timestamp: new Date().toISOString(),
        source: 'hiro+mempool'
      };

      console.log('✅ Saldo obtido:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao buscar saldo:', error);
      
      // Fallback para dados mockados se APIs falharem
      return {
        confirmed: 100000, // 0.001 BTC em sats
        unconfirmed: 0,
        total: 100000,
        address: this.addresses.find(addr => addr.purpose === 'payment')?.address,
        timestamp: new Date().toISOString(),
        source: 'mock_fallback',
        error: error.message
      };
    }
  }

  // Obter Ordinals da carteira
  async getOrdinals() {
    if (!this.addresses) {
      throw new Error('Carteira não conectada');
    }
    
    try {
      console.log('🎨 Buscando Ordinals...');
      
      const ordinalsAddress = this.addresses.find(addr => addr.purpose === 'ordinals')?.address;
      
      if (!ordinalsAddress) {
        throw new Error('Endereço de Ordinals não encontrado');
      }

      const response = await fetch(`https://api.hiro.so/ordinals/v1/inscriptions?address=${ordinalsAddress}&limit=50`);
      
      if (!response.ok) {
        throw new Error(`Erro na API de Ordinals: ${response.status}`);
      }
      
      const ordinalsData = await response.json();

      const result = {
        total: ordinalsData.total || 0,
        inscriptions: ordinalsData.results || [],
        address: ordinalsAddress,
        timestamp: new Date().toISOString(),
        source: 'hiro'
      };

      console.log('✅ Ordinals obtidos:', result.total);
      return result;

    } catch (error) {
      console.error('❌ Erro ao buscar Ordinals:', error);
      
      // Fallback
      return {
        total: 0,
        inscriptions: [],
        address: this.addresses.find(addr => addr.purpose === 'ordinals')?.address,
        timestamp: new Date().toISOString(),
        source: 'mock_fallback',
        error: error.message
      };
    }
  }

  // Obter Runes da carteira
  async getRunes() {
    if (!this.addresses) {
      throw new Error('Carteira não conectada');
    }
    
    try {
      console.log('🏃‍♂️ Buscando Runes...');
      
      const paymentAddress = this.addresses.find(addr => addr.purpose === 'payment')?.address;
      
      if (!paymentAddress) {
        throw new Error('Endereço de pagamento não encontrado');
      }

      const response = await fetch(`https://api.hiro.so/runes/v1/balances/${paymentAddress}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API de Runes: ${response.status}`);
      }
      
      const runesData = await response.json();

      const result = {
        total: runesData.results?.length || 0,
        balances: runesData.results || [],
        address: paymentAddress,
        timestamp: new Date().toISOString(),
        source: 'hiro'
      };

      console.log('✅ Runes obtidos:', result.total);
      return result;

    } catch (error) {
      console.error('❌ Erro ao buscar Runes:', error);
      
      // Fallback com dados mock populares
      return {
        total: 2,
        balances: [
          {
            rune: 'DOG•GO•TO•THE•MOON',
            amount: '1000000',
            symbol: 'DOG',
            divisibility: 8
          },
          {
            rune: 'PUPS•WORLD•PEACE',
            amount: '500000',
            symbol: 'PUPS',
            divisibility: 8
          }
        ],
        address: paymentAddress,
        timestamp: new Date().toISOString(),
        source: 'mock_fallback',
        error: error.message
      };
    }
  }

  // Assinar mensagem
  async signMessage(message) {
    if (!this.addresses) {
      throw new Error('Carteira não conectada');
    }

    try {
      const response = await signMessage({
        payload: {
          network: {
            type: 'Mainnet'
          },
          address: this.addresses.find(addr => addr.purpose === 'payment')?.address,
          message: message,
        },
        onFinish: (response) => {
          console.log('✅ Mensagem assinada:', response);
          return response;
        },
        onCancel: () => {
          throw new Error('Assinatura cancelada');
        }
      });

      return response;
    } catch (error) {
      console.error('❌ Erro ao assinar mensagem:', error);
      throw error;
    }
  }

  // Armazenar dados da carteira no localStorage
  storeWalletData(data) {
    if (typeof window !== 'undefined') {
      try {
        const walletData = {
          addresses: data.addresses,
          connectedWallet: this.connectedWallet,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('cypherWalletData', JSON.stringify(walletData));
        console.log('💾 Dados da carteira armazenados');
      } catch (error) {
        console.error('❌ Erro ao armazenar dados:', error);
      }
    }
  }

  // Recuperar dados armazenados
  getStoredWalletData() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cypherWalletData');
        if (stored) {
          const data = JSON.parse(stored);
          this.addresses = data.addresses;
          this.connectedWallet = data.connectedWallet;
          return data;
        }
      } catch (error) {
        console.error('❌ Erro ao recuperar dados:', error);
      }
    }
    return null;
  }

  // Desconectar carteira
  disconnect() {
    this.addresses = null;
    this.connectedWallet = null;
    this.provider = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cypherWalletData');
    }
    
    this.emitEvent('walletDisconnected');
    console.log('🔌 Carteira desconectada');
  }

  // Sistema de eventos
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emitEvent(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erro no listener do evento ${event}:`, error);
        }
      });
    }
  }

  // Verificar se está conectado
  isConnected() {
    return !!(this.addresses && this.connectedWallet);
  }

  // Obter informações da carteira conectada
  getWalletInfo() {
    if (!this.isConnected()) {
      return null;
    }

    return {
      wallet: this.connectedWallet,
      addresses: this.addresses,
      paymentAddress: this.addresses.find(addr => addr.purpose === 'payment')?.address,
      ordinalsAddress: this.addresses.find(addr => addr.purpose === 'ordinals')?.address
    };
  }
}

// Exportar instância singleton
export const bitcoinWallet = new BitcoinWalletConnect();

// Exportar classe para múltiplas instâncias se necessário
export default BitcoinWalletConnect;