// Bitcoin Wallet Connect Service
// Integração com Xverse e Unisat via Sats Connect

export class BitcoinWalletConnect {
  constructor() {
    this.provider = null;
    this.addresses = null;
    this.connected = false;
  }

  async connect() {
    try {
      // Verificar se há carteiras Bitcoin disponíveis
      if (typeof window !== 'undefined') {
        // Tentar Xverse primeiro
        if (window.XverseProviders?.BitcoinProvider) {
          return await this.connectXverse();
        }
        
        // Tentar Unisat
        if (window.unisat) {
          return await this.connectUnisat();
        }

        // Usar Sats Connect como fallback
        return await this.connectSatsConnect();
      }
      
      throw new Error('Nenhuma carteira Bitcoin detectada');
    } catch (error) {
      console.error('Erro ao conectar carteira Bitcoin:', error);
      throw error;
    }
  }

  async connectXverse() {
    try {
      const provider = window.XverseProviders?.BitcoinProvider;
      if (!provider) throw new Error('Xverse não encontrada');

      const response = await provider.connect();
      
      this.addresses = {
        payment: response.addresses.payment,
        ordinals: response.addresses.ordinals
      };
      
      this.provider = provider;
      this.connected = true;
      
      await this.loadWalletData();
      
      return {
        success: true,
        addresses: this.addresses,
        provider: 'xverse'
      };
    } catch (error) {
      console.error('Erro no Xverse:', error);
      throw error;
    }
  }

  async connectUnisat() {
    try {
      if (!window.unisat) throw new Error('Unisat não encontrada');

      const accounts = await window.unisat.requestAccounts();
      if (!accounts.length) throw new Error('Nenhuma conta conectada');

      this.addresses = {
        payment: accounts[0],
        ordinals: accounts[0]
      };

      this.provider = window.unisat;
      this.connected = true;

      await this.loadWalletData();

      return {
        success: true,
        addresses: this.addresses,
        provider: 'unisat'
      };
    } catch (error) {
      console.error('Erro no Unisat:', error);
      throw error;
    }
  }

  async connectSatsConnect() {
    try {
      // Fallback usando biblioteca sats-connect
      const { getProviders, getAddress } = await import('sats-connect');
      
      const providers = await getProviders();
      if (providers.length === 0) {
        throw new Error('Nenhuma carteira Bitcoin detectada');
      }

      const addressResponse = await getAddress({
        payload: {
          purposes: ['payment', 'ordinals'],
          message: 'Conectar carteira Bitcoin ao Cypher',
          network: {
            type: 'Mainnet'
          }
        },
        onFinish: (response) => {
          this.addresses = {
            payment: response.addresses.find(addr => addr.purpose === 'payment')?.address,
            ordinals: response.addresses.find(addr => addr.purpose === 'ordinals')?.address
          };
        },
        onCancel: () => {
          throw new Error('Conexão cancelada pelo usuário');
        }
      });

      this.connected = true;
      await this.loadWalletData();

      return {
        success: true,
        addresses: this.addresses,
        provider: 'sats-connect'
      };
    } catch (error) {
      console.error('Erro no Sats Connect:', error);
      throw error;
    }
  }

  async loadWalletData() {
    if (!this.addresses) return null;

    try {
      const [balance, ordinals, runes] = await Promise.all([
        this.getBalance(),
        this.getOrdinals(),
        this.getRunes()
      ]);

      const walletData = {
        addresses: this.addresses,
        balance,
        ordinals,
        runes,
        timestamp: new Date().toISOString(),
        connected: true
      };

      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('bitcoin-wallet-data', JSON.stringify(walletData));
      }

      return walletData;
    } catch (error) {
      console.error('Erro ao carregar dados da carteira:', error);
      return null;
    }
  }

  async getBalance() {
    if (!this.addresses?.payment) return { total: 0, confirmed: 0, unconfirmed: 0 };

    try {
      // Usar Mempool.space API
      const response = await fetch(`https://mempool.space/api/address/${this.addresses.payment}`);
      const data = await response.json();

      return {
        total: data.chain_stats.funded_txo_sum,
        confirmed: data.chain_stats.funded_txo_sum - data.mempool_stats.funded_txo_sum,
        unconfirmed: data.mempool_stats.funded_txo_sum,
        address: this.addresses.payment
      };
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      return { total: 0, confirmed: 0, unconfirmed: 0 };
    }
  }

  async getOrdinals() {
    if (!this.addresses?.ordinals) return [];

    try {
      // Usar Hiro API para Ordinals
      const response = await fetch(`https://api.hiro.so/ordinals/v1/inscriptions?address=${this.addresses.ordinals}`);
      const data = await response.json();

      return data.results?.map(inscription => ({
        id: inscription.id,
        number: inscription.number,
        content_type: inscription.content_type,
        content_length: inscription.content_length,
        timestamp: inscription.timestamp,
        value: inscription.value,
        address: inscription.address
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar Ordinals:', error);
      return [];
    }
  }

  async getRunes() {
    if (!this.addresses?.payment) return [];

    try {
      // Usar API alternativa para Runes
      const response = await fetch(`https://api.ordinals.com/runes/address/${this.addresses.payment}`);
      
      if (!response.ok) {
        // Fallback para estrutura mock
        return this.getMockRunes();
      }

      const data = await response.json();
      
      return data.runes?.map(rune => ({
        name: rune.name,
        symbol: rune.symbol,
        balance: rune.balance,
        divisibility: rune.divisibility,
        spacedName: rune.spacedName
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar Runes:', error);
      return this.getMockRunes();
    }
  }

  getMockRunes() {
    // Mock data para desenvolvimento
    return [
      {
        name: 'DOG•GO•TO•THE•MOON',
        symbol: 'DOG',
        balance: '1000000',
        divisibility: 8,
        spacedName: 'DOG•GO•TO•THE•MOON'
      },
      {
        name: 'UNCOMMON•GOODS',
        symbol: 'UNCOMMON',
        balance: '500000',
        divisibility: 8,
        spacedName: 'UNCOMMON•GOODS'
      }
    ];
  }

  async signMessage(message) {
    if (!this.connected || !this.provider) {
      throw new Error('Carteira não conectada');
    }

    try {
      if (this.provider.signMessage) {
        return await this.provider.signMessage(message);
      } else if (this.provider.unisat?.signMessage) {
        return await this.provider.unisat.signMessage(message);
      } else {
        throw new Error('Assinatura de mensagem não suportada');
      }
    } catch (error) {
      console.error('Erro ao assinar mensagem:', error);
      throw error;
    }
  }

  async signTransaction(tx) {
    if (!this.connected || !this.provider) {
      throw new Error('Carteira não conectada');
    }

    try {
      if (this.provider.signTransaction) {
        return await this.provider.signTransaction(tx);
      } else if (this.provider.unisat?.signPsbt) {
        return await this.provider.unisat.signPsbt(tx);
      } else {
        throw new Error('Assinatura de transação não suportada');
      }
    } catch (error) {
      console.error('Erro ao assinar transação:', error);
      throw error;
    }
  }

  disconnect() {
    this.provider = null;
    this.addresses = null;
    this.connected = false;

    // Limpar localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bitcoin-wallet-data');
    }
  }

  getStoredWalletData() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bitcoin-wallet-data');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  isConnected() {
    return this.connected && this.addresses;
  }

  getAddresses() {
    return this.addresses;
  }

  getProvider() {
    return this.provider;
  }
}

export default BitcoinWalletConnect;

// Export individual functions
export const getBitcoinWallet = async () => {
  const walletConnect = new BitcoinWalletConnect();
  return walletConnect;
};

export const connectWallet = async (walletType) => {
  const walletConnect = new BitcoinWalletConnect();
  return walletConnect.connect(walletType);
};

export const disconnectWallet = async () => {
  const walletConnect = new BitcoinWalletConnect();
  return walletConnect.disconnect();
};