'use client'

// Early initialization of wallet provider patches
if (typeof window !== 'undefined') {
  // Import and execute the patch immediately
  import('@/lib/wallet-providers-patch').then(({ initializeWalletProviderPatches }) => {
    initializeWalletProviderPatches();
  });
}