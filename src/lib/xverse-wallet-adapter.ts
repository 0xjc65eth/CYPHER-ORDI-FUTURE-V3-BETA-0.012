'use client'

import { XVERSE } from '@omnisat/lasereyes-core'

// Xverse wallet adapter to handle API differences
export class XverseWalletAdapter {
  private provider: any;

  constructor() {
    if (typeof window !== 'undefined' && (window as any).XverseProviders) {
      this.provider = (window as any).XverseProviders.BitcoinProvider;
    }
  }

  async connect() {
    if (!this.provider) {
      throw new Error('Xverse wallet not found. Please install the Xverse wallet extension.');
    }

    try {
      // Request wallet access
      const response = await this.provider.request('getAccounts', {
        purposes: ['ordinals', 'payment'],
        message: 'CYPHER ORDi Future V3 would like to connect to your wallet.',
      });

      if (!response || !response.result) {
        throw new Error('Failed to get accounts from Xverse wallet');
      }

      const addresses = response.result.addresses;
      
      // Create a provider object that matches LaserEyes expectations
      const laserEyesCompatibleProvider = {
        ...this.provider,
        getAddresses: async () => {
          return addresses.map((addr: any) => ({
            address: addr.address,
            publicKey: addr.publicKey,
            purpose: addr.purpose,
          }));
        },
        getAddress: async () => {
          // Return the first ordinals address or payment address
          const ordinalsAddress = addresses.find((addr: any) => addr.purpose === 'ordinals');
          const paymentAddress = addresses.find((addr: any) => addr.purpose === 'payment');
          return (ordinalsAddress || paymentAddress)?.address;
        },
        signMessage: async (message: string) => {
          return this.provider.request('signMessage', {
            message,
            address: addresses[0].address,
          });
        },
        signPsbt: async (psbt: string) => {
          return this.provider.request('signPsbt', {
            psbt,
            broadcast: false,
          });
        },
      };

      return laserEyesCompatibleProvider;
    } catch (error) {
      console.error('Xverse connection error:', error);
      throw new Error(`Failed to connect to Xverse: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isInstalled(): boolean {
    return typeof window !== 'undefined' && !!(window as any).XverseProviders;
  }
}

// Export a function to get the adapted Xverse provider
export function getXverseProvider() {
  const adapter = new XverseWalletAdapter();
  
  if (!adapter.isInstalled()) {
    return null;
  }

  return {
    ...XVERSE,
    getProvider: async () => {
      return adapter.connect();
    },
  };
}