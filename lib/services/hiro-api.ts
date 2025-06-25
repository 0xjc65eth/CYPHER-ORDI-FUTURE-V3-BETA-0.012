import { NetworkConfig } from '@/lib/config/web3-initialization';

class HiroAPIService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor(network?: NetworkConfig) {
    this.apiKey = process.env.HIRO_API_KEY || '3100ea7623797d267da3bd6dc94f47f9';
    this.baseUrl = 'https://api.hiro.so'; // Use default Hiro API endpoint
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Hiro API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getOrdinals(address: string) {
    return this.request(`/ordinals/v1/inscriptions?address=${address}`);
  }

  async getBalance(address: string) {
    return this.request(`/extended/v1/address/${address}/balances`);
  }

  async getTransactions(address: string, limit = 50) {
    return this.request(`/extended/v1/address/${address}/transactions?limit=${limit}`);
  }
}

export const hiroAPI = new HiroAPIService();