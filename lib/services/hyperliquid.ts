import { ethers } from 'ethers';

interface HyperliquidConfig {
  privateKey: string;
  apiUrl: string;
  isTestnet: boolean;
}

class HyperliquidService {
  private wallet: ethers.Wallet | null = null;
  private apiUrl: string;
  
  constructor() {
    const privateKey = process.env.HYPERLIQUID_PRIVATE_KEY;
    const isTestnet = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true';
    
    this.apiUrl = isTestnet 
      ? 'https://api.hyperliquid-testnet.xyz'
      : 'https://api.hyperliquid.xyz';
    
    if (privateKey) {
      try {
        this.wallet = new ethers.Wallet(privateKey);
      } catch (error) {
        console.error('Erro ao inicializar wallet Hyperliquid:', error);
      }
    }
  }

  async getAccountInfo() {
    if (!this.wallet) {
      return { error: 'Wallet não configurada' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clearinghouseState',
          user: this.wallet.address
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar info da conta:', error);
      return { error: 'Erro ao buscar informações' };
    }
  }

  async placeOrder(orderData: any) {
    if (!this.wallet) {
      throw new Error('Hyperliquid wallet não configurada');
    }

    const timestamp = Date.now();
    const signature = await this.signOrder({ ...orderData, timestamp });

    const response = await fetch(`${this.apiUrl}/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: orderData,
        signature,
        timestamp,
        nonce: timestamp
      })
    });

    return await response.json();
  }

  private async signOrder(orderData: any): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet não disponível');
    }
    
    const message = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(orderData))
    );
    
    return await this.wallet.signMessage(message);
  }
}

export const hyperliquidService = new HyperliquidService();