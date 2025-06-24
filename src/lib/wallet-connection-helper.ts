'use client'

import { XVERSE } from '@omnisat/lasereyes-core'

// Helper to properly connect Xverse wallet with LaserEyes
export async function connectXverseWallet(connectFunction: (provider: any) => Promise<void>) {
  try {
    // Check if Xverse is installed
    if (typeof window === 'undefined' || !(window as any).XverseProviders) {
      throw new Error('Xverse wallet is not installed');
    }

    // Try direct connection with XVERSE provider
    try {
      await connectFunction(XVERSE);
      return;
    } catch (error) {
      console.log('Direct XVERSE connection failed, trying alternative method:', error);
    }

    // Alternative method: Create a custom provider
    const xverseProvider = (window as any).XverseProviders.BitcoinProvider;
    
    // Request accounts using Xverse's API
    const accountsResponse = await xverseProvider.request('getAccounts', {
      purposes: ['ordinals', 'payment'],
      message: 'CYPHER ORDi Future V3 would like to connect to your wallet.',
    });

    if (!accountsResponse || !accountsResponse.result || !accountsResponse.result.addresses) {
      throw new Error('Failed to get accounts from Xverse');
    }

    const addresses = accountsResponse.result.addresses;
    
    // Create a LaserEyes-compatible provider wrapper
    const wrappedProvider = {
      ...XVERSE,
      provider: {
        ...xverseProvider,
        // Add the missing getAddresses method
        getAddresses: async () => {
          return addresses.map((addr: any) => ({
            address: addr.address,
            publicKey: addr.publicKey || '',
            purpose: addr.purpose,
          }));
        },
        // Add other required methods
        request: xverseProvider.request.bind(xverseProvider),
        getAccounts: async () => accountsResponse,
      }
    };

    // Try connecting with the wrapped provider
    await connectFunction(wrappedProvider);
    
  } catch (error) {
    console.error('Xverse connection error:', error);
    throw error;
  }
}